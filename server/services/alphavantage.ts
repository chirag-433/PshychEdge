import { log } from "../index";

const BASE_URL = "https://www.alphavantage.co/query";
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "";

interface AlphaVantageQuote {
  ticker: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
}

interface AlphaVantageForexQuote {
  ticker: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  changePercent: number;
  high: number;
  low: number;
}

export async function fetchStockQuote(symbol: string): Promise<AlphaVantageQuote | null> {
  try {
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data["Note"] || data["Information"]) {
      log(`Alpha Vantage rate limit hit for ${symbol}`, "alpha-vantage");
      return null;
    }

    const quote = data["Global Quote"];
    if (!quote || !quote["05. price"]) {
      log(`No quote data for ${symbol}`, "alpha-vantage");
      return null;
    }

    return {
      ticker: symbol,
      name: symbol,
      currentPrice: parseFloat(quote["05. price"]),
      previousClose: parseFloat(quote["08. previous close"]),
      changePercent: parseFloat(quote["10. change percent"]?.replace("%", "") || "0"),
      volume: parseFloat(quote["06. volume"]),
      high: parseFloat(quote["03. high"]),
      low: parseFloat(quote["04. low"]),
    };
  } catch (err) {
    log(`Error fetching stock quote for ${symbol}: ${err}`, "alpha-vantage");
    return null;
  }
}

export async function fetchForexRate(fromCurrency: string, toCurrency: string): Promise<AlphaVantageForexQuote | null> {
  try {
    const url = `${BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCurrency}&to_currency=${toCurrency}&apikey=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data["Note"] || data["Information"]) {
      log(`Alpha Vantage rate limit hit for ${fromCurrency}/${toCurrency}`, "alpha-vantage");
      return null;
    }

    const rate = data["Realtime Currency Exchange Rate"];
    if (!rate || !rate["5. Exchange Rate"]) {
      log(`No forex data for ${fromCurrency}/${toCurrency}`, "alpha-vantage");
      return null;
    }

    const currentPrice = parseFloat(rate["5. Exchange Rate"]);
    const bid = parseFloat(rate["8. Bid Price"] || currentPrice.toString());
    const ask = parseFloat(rate["9. Ask Price"] || currentPrice.toString());

    return {
      ticker: `${fromCurrency}/${toCurrency}`,
      name: `${fromCurrency} / ${toCurrency}`,
      currentPrice,
      previousClose: currentPrice * 0.999,
      changePercent: 0,
      high: ask,
      low: bid,
    };
  } catch (err) {
    log(`Error fetching forex rate for ${fromCurrency}/${toCurrency}: ${err}`, "alpha-vantage");
    return null;
  }
}

export async function fetchIntradayData(symbol: string): Promise<number[] | null> {
  try {
    const url = `${BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=60min&outputsize=compact&apikey=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data["Note"] || data["Information"]) {
      return null;
    }

    const timeSeries = data["Time Series (60min)"];
    if (!timeSeries) return null;

    const entries = Object.entries(timeSeries).slice(0, 24).reverse();
    return entries.map(([_, v]: [string, any]) => parseFloat(v["4. close"]));
  } catch (err) {
    log(`Error fetching intraday for ${symbol}: ${err}`, "alpha-vantage");
    return null;
  }
}

const STOCK_NAMES: Record<string, string> = {
  AAPL: "Apple Inc.",
  TSLA: "Tesla Inc.",
  NVDA: "NVIDIA Corporation",
  MSFT: "Microsoft Corp.",
  AMZN: "Amazon.com Inc.",
  GOOGL: "Alphabet Inc.",
  META: "Meta Platforms Inc.",
};

export async function fetchAllStockData(symbols: string[]) {
  const results = [];
  for (const symbol of symbols) {
    const quote = await fetchStockQuote(symbol);
    if (quote) {
      quote.name = STOCK_NAMES[symbol] || symbol;
      const sparkline = await fetchIntradayData(symbol);
      results.push({ ...quote, sparklineData: sparkline });
    }
    await delay(1200);
  }
  return results;
}

export async function fetchAllForexData(pairs: { from: string; to: string }[]) {
  const results = [];
  for (const pair of pairs) {
    const quote = await fetchForexRate(pair.from, pair.to);
    if (quote) {
      results.push({ ...quote, sparklineData: null });
    }
    await delay(1200);
  }
  return results;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
