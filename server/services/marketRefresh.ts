import { storage } from "../storage";
import { fetchAllStockData, fetchAllForexData } from "./alphavantage";
import { fetchAllCryptoData } from "./coinpaprika";
import { generateSignalsForWatchlist } from "./groq";
import { log } from "../index";
import { db } from "../db";
import { watchlistItems, aiSignals } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const STOCK_SYMBOLS = ["AAPL", "TSLA", "NVDA", "MSFT"];
const CRYPTO_SYMBOLS = ["BTC", "ETH", "SOL"];
const FOREX_PAIRS = [
  { from: "EUR", to: "USD" },
  { from: "GBP", to: "USD" },
  { from: "USD", to: "JPY" },
];

let isRefreshingSignals = false;
let isRefreshingMarket = false;

function generateFallbackSparkline(basePrice: number, trend: number): number[] {
  const data: number[] = [];
  let price = basePrice * (1 - Math.abs(trend) * 0.02);
  for (let i = 0; i < 24; i++) {
    price += (Math.random() - 0.45 + trend * 0.1) * basePrice * 0.005;
    data.push(Math.max(0, price));
  }
  return data;
}

export async function refreshMarketData() {
  if (isRefreshingMarket) {
    log("Market refresh already in progress, skipping", "market-refresh");
    return;
  }
  isRefreshingMarket = true;
  log("Starting market data refresh...", "market-refresh");

  try {
    const cryptoData = await fetchAllCryptoData(CRYPTO_SYMBOLS);
    log(`Fetched ${cryptoData.length} crypto quotes from CoinPaprika`, "market-refresh");

    for (const crypto of cryptoData) {
      const existing = await findByTicker(crypto.ticker);
      const sparkline = crypto.sparklineData || generateFallbackSparkline(crypto.currentPrice, crypto.changePercent > 0 ? 1 : -1);

      if (existing) {
        await db.update(watchlistItems).set({
          currentPrice: crypto.currentPrice,
          previousClose: crypto.previousClose,
          changePercent: crypto.changePercent,
          volume: crypto.volume,
          high24h: crypto.high24h,
          low24h: crypto.low24h,
          marketCap: crypto.marketCap,
          sparklineData: sparkline,
        }).where(eq(watchlistItems.id, existing.id));
      } else {
        await storage.createWatchlistItem({
          ticker: crypto.ticker,
          name: crypto.name,
          marketType: "crypto",
          currentPrice: crypto.currentPrice,
          previousClose: crypto.previousClose,
          changePercent: crypto.changePercent,
          volume: crypto.volume,
          high24h: crypto.high24h,
          low24h: crypto.low24h,
          marketCap: crypto.marketCap,
          sparklineData: sparkline,
        });
      }
    }
  } catch (err) {
    log(`Error refreshing crypto data: ${err}`, "market-refresh");
  }

  try {
    const stockData = await fetchAllStockData(STOCK_SYMBOLS);
    log(`Fetched ${stockData.length} stock quotes from Alpha Vantage`, "market-refresh");

    for (const stock of stockData) {
      const existing = await findByTicker(stock.ticker);
      const sparkline = stock.sparklineData || generateFallbackSparkline(stock.currentPrice, stock.changePercent > 0 ? 1 : -1);

      if (existing) {
        await db.update(watchlistItems).set({
          currentPrice: stock.currentPrice,
          previousClose: stock.previousClose,
          changePercent: stock.changePercent,
          volume: stock.volume,
          high24h: stock.high,
          low24h: stock.low,
          sparklineData: sparkline,
        }).where(eq(watchlistItems.id, existing.id));
      } else {
        await storage.createWatchlistItem({
          ticker: stock.ticker,
          name: stock.name,
          marketType: "stock",
          currentPrice: stock.currentPrice,
          previousClose: stock.previousClose,
          changePercent: stock.changePercent,
          volume: stock.volume,
          high24h: stock.high,
          low24h: stock.low,
          marketCap: null,
          sparklineData: sparkline,
        });
      }
    }
  } catch (err) {
    log(`Error refreshing stock data: ${err}`, "market-refresh");
  }

  try {
    const forexData = await fetchAllForexData(FOREX_PAIRS);
    log(`Fetched ${forexData.length} forex rates from Alpha Vantage`, "market-refresh");

    for (const forex of forexData) {
      const existing = await findByTicker(forex.ticker);
      const sparkline = generateFallbackSparkline(forex.currentPrice, forex.changePercent > 0 ? 1 : -1);

      if (existing) {
        await db.update(watchlistItems).set({
          currentPrice: forex.currentPrice,
          previousClose: forex.previousClose,
          changePercent: forex.changePercent,
          high24h: forex.high,
          low24h: forex.low,
          sparklineData: sparkline,
        }).where(eq(watchlistItems.id, existing.id));
      } else {
        await storage.createWatchlistItem({
          ticker: forex.ticker,
          name: forex.name,
          marketType: "forex",
          currentPrice: forex.currentPrice,
          previousClose: forex.previousClose,
          changePercent: forex.changePercent,
          volume: 0,
          high24h: forex.high,
          low24h: forex.low,
          marketCap: null,
          sparklineData: sparkline,
        });
      }
    }
  } catch (err) {
    log(`Error refreshing forex data: ${err}`, "market-refresh");
  }

  isRefreshingMarket = false;
  log("Market data refresh complete", "market-refresh");
}

export async function refreshAISignals() {
  if (isRefreshingSignals) {
    log("Signal refresh already in progress, skipping", "ai-signals");
    return;
  }
  isRefreshingSignals = true;

  log("Starting AI signal generation...", "ai-signals");

  try {
    const items = await storage.getWatchlistItems();
    if (items.length === 0) {
      log("No watchlist items to generate signals for", "ai-signals");
      return;
    }

    const signalInput = items.map(item => ({
      ticker: item.ticker,
      marketType: item.marketType,
      currentPrice: item.currentPrice,
      changePercent: item.changePercent,
      volume: item.volume,
      high24h: item.high24h,
      low24h: item.low24h,
    }));

    const newSignals = await generateSignalsForWatchlist(signalInput);
    log(`Generated ${newSignals.length} AI signals`, "ai-signals");

    await db.update(aiSignals)
      .set({ status: "expired" })
      .where(eq(aiSignals.status, "active"));

    for (const signal of newSignals) {
      await storage.createAiSignal({
        ...signal,
        status: "active",
      });
    }
  } catch (err) {
    log(`Error generating AI signals: ${err}`, "ai-signals");
  } finally {
    isRefreshingSignals = false;
  }

  log("AI signal generation complete", "ai-signals");
}

async function findByTicker(ticker: string) {
  const items = await storage.getWatchlistItems();
  return items.find(item => item.ticker === ticker);
}

let marketRefreshInterval: ReturnType<typeof setInterval> | null = null;
let signalRefreshInterval: ReturnType<typeof setInterval> | null = null;

export function startMarketRefreshScheduler() {
  refreshMarketData().catch(err => log(`Initial market refresh failed: ${err}`, "market-refresh"));

  marketRefreshInterval = setInterval(() => {
    refreshMarketData().catch(err => log(`Scheduled market refresh failed: ${err}`, "market-refresh"));
  }, 5 * 60 * 1000);

  setTimeout(() => {
    refreshAISignals().catch(err => log(`Initial AI signal gen failed: ${err}`, "ai-signals"));
  }, 30000);

  signalRefreshInterval = setInterval(() => {
    refreshAISignals().catch(err => log(`Scheduled AI signal gen failed: ${err}`, "ai-signals"));
  }, 15 * 60 * 1000);

  log("Market refresh scheduler started (market: every 5 min, signals: every 15 min)", "market-refresh");
}
