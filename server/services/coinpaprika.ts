import { log } from "../index";

const BASE_URL = "https://api.coinpaprika.com/v1";

interface CoinPaprikaQuote {
  ticker: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  changePercent: number;
  volume: number;
  high24h: number;
  low24h: number;
  marketCap: number;
}

const COIN_IDS: Record<string, string> = {
  BTC: "btc-bitcoin",
  ETH: "eth-ethereum",
  SOL: "sol-solana",
  ADA: "ada-cardano",
  DOT: "dot-polkadot",
  AVAX: "avax-avalanche",
  MATIC: "matic-polygon",
  LINK: "link-chainlink",
  XRP: "xrp-xrp",
  DOGE: "doge-dogecoin",
};

export async function fetchCryptoQuote(symbol: string): Promise<CoinPaprikaQuote | null> {
  const coinId = COIN_IDS[symbol];
  if (!coinId) {
    log(`Unknown crypto symbol: ${symbol}`, "coinpaprika");
    return null;
  }

  try {
    const res = await fetch(`${BASE_URL}/tickers/${coinId}`);
    if (!res.ok) {
      log(`CoinPaprika error for ${symbol}: ${res.status}`, "coinpaprika");
      return null;
    }

    const data = await res.json();
    const usdQuote = data.quotes?.USD;
    if (!usdQuote) {
      log(`No USD quote for ${symbol}`, "coinpaprika");
      return null;
    }

    const currentPrice = usdQuote.price;
    const changePercent24h = usdQuote.percent_change_24h || 0;
    const previousClose = currentPrice / (1 + changePercent24h / 100);

    return {
      ticker: symbol,
      name: data.name,
      currentPrice,
      previousClose,
      changePercent: changePercent24h,
      volume: usdQuote.volume_24h || 0,
      high24h: usdQuote.ath_price ? Math.min(usdQuote.ath_price, currentPrice * 1.05) : currentPrice * 1.02,
      low24h: previousClose * 0.98,
      marketCap: usdQuote.market_cap || 0,
    };
  } catch (err) {
    log(`Error fetching crypto quote for ${symbol}: ${err}`, "coinpaprika");
    return null;
  }
}

export async function fetchCryptoOHLC(symbol: string): Promise<number[] | null> {
  const coinId = COIN_IDS[symbol];
  if (!coinId) return null;

  try {
    const now = new Date();
    const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const startStr = start.toISOString().split("T")[0];

    const res = await fetch(`${BASE_URL}/coins/${coinId}/ohlcv/historical?start=${startStr}&limit=24`);
    if (!res.ok) return null;

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    return data.map((entry: any) => entry.close);
  } catch (err) {
    log(`Error fetching crypto OHLC for ${symbol}: ${err}`, "coinpaprika");
    return null;
  }
}

export async function fetchAllCryptoData(symbols: string[]) {
  const results = [];
  for (const symbol of symbols) {
    const quote = await fetchCryptoQuote(symbol);
    if (quote) {
      const sparkline = await fetchCryptoOHLC(symbol);
      results.push({ ...quote, sparklineData: sparkline });
    }
    await delay(300);
  }
  return results;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
