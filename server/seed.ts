import { storage } from "./storage";

function generateSparkline(basePrice: number, trend: number): number[] {
  const data: number[] = [];
  let price = basePrice * (1 - Math.abs(trend) * 0.02);
  for (let i = 0; i < 24; i++) {
    price += (Math.random() - 0.45 + trend * 0.1) * basePrice * 0.005;
    data.push(Math.max(0, price));
  }
  return data;
}

export async function seedDatabase() {
  const existing = await storage.getWatchlistItems();
  if (existing.length > 0) return;

  const watchlistData = [
    { ticker: "AAPL", name: "Apple Inc.", marketType: "stock", currentPrice: 189.84, previousClose: 187.12, changePercent: 1.45, volume: 58420000, high24h: 191.20, low24h: 186.90, marketCap: 2950000000000 },
    { ticker: "TSLA", name: "Tesla Inc.", marketType: "stock", currentPrice: 245.32, previousClose: 251.80, changePercent: -2.57, volume: 112300000, high24h: 253.10, low24h: 243.50, marketCap: 780000000000 },
    { ticker: "NVDA", name: "NVIDIA Corporation", marketType: "stock", currentPrice: 875.50, previousClose: 862.20, changePercent: 1.54, volume: 42100000, high24h: 882.30, low24h: 860.15, marketCap: 2160000000000 },
    { ticker: "MSFT", name: "Microsoft Corp.", marketType: "stock", currentPrice: 415.20, previousClose: 412.90, changePercent: 0.56, volume: 22800000, high24h: 417.80, low24h: 411.50, marketCap: 3080000000000 },
    { ticker: "BTC", name: "Bitcoin", marketType: "crypto", currentPrice: 63450.00, previousClose: 62100.00, changePercent: 2.17, volume: 38200000000, high24h: 64200.00, low24h: 61800.00, marketCap: 1240000000000 },
    { ticker: "ETH", name: "Ethereum", marketType: "crypto", currentPrice: 3420.50, previousClose: 3380.00, changePercent: 1.20, volume: 18500000000, high24h: 3480.00, low24h: 3350.00, marketCap: 411000000000 },
    { ticker: "SOL", name: "Solana", marketType: "crypto", currentPrice: 142.80, previousClose: 148.50, changePercent: -3.84, volume: 4200000000, high24h: 150.20, low24h: 140.50, marketCap: 62000000000 },
    { ticker: "EUR/USD", name: "Euro / US Dollar", marketType: "forex", currentPrice: 1.0842, previousClose: 1.0825, changePercent: 0.16, volume: 1800000000, high24h: 1.0865, low24h: 1.0810, marketCap: null },
    { ticker: "GBP/USD", name: "British Pound / Dollar", marketType: "forex", currentPrice: 1.2695, previousClose: 1.2720, changePercent: -0.20, volume: 920000000, high24h: 1.2740, low24h: 1.2670, marketCap: null },
    { ticker: "USD/JPY", name: "US Dollar / Yen", marketType: "forex", currentPrice: 150.42, previousClose: 149.85, changePercent: 0.38, volume: 1400000000, high24h: 150.80, low24h: 149.60, marketCap: null },
  ];

  for (const item of watchlistData) {
    await storage.createWatchlistItem({
      ...item,
      sparklineData: generateSparkline(item.currentPrice, item.changePercent > 0 ? 1 : -1),
    });
  }

  const signalsData = [
    { ticker: "AAPL", marketType: "stock", signalType: "momentum", direction: "long", confidence: 0.85, entryPrice: 189.84, targetPrice: 198.50, stopLoss: 185.00, reasoning: "Strong bullish momentum detected with MACD crossover and increasing institutional volume. RSI approaching overbought but still in accumulation zone.", patternDetected: "MACD Bullish Crossover", timeframe: "4H", status: "active" },
    { ticker: "TSLA", marketType: "stock", signalType: "reversal", direction: "short", confidence: 0.72, entryPrice: 245.32, targetPrice: 230.00, stopLoss: 255.00, reasoning: "Bearish divergence on RSI with declining volume on recent rally. Head and shoulders pattern forming on daily chart.", patternDetected: "H&S Pattern", timeframe: "1D", status: "active" },
    { ticker: "BTC", marketType: "crypto", signalType: "breakout", direction: "long", confidence: 0.91, entryPrice: 63450.00, targetPrice: 68000.00, stopLoss: 61000.00, reasoning: "Bitcoin breaking key resistance at $63K with massive volume surge. On-chain metrics show whale accumulation and decreasing exchange reserves.", patternDetected: "Resistance Breakout", timeframe: "4H", status: "active" },
    { ticker: "ETH", marketType: "crypto", signalType: "momentum", direction: "long", confidence: 0.78, entryPrice: 3420.50, targetPrice: 3650.00, stopLoss: 3280.00, reasoning: "Ethereum following Bitcoin momentum with strong DeFi TVL growth. EIP upgrade catalyst approaching with increased developer activity.", patternDetected: "Bull Flag", timeframe: "1D", status: "active" },
    { ticker: "NVDA", marketType: "stock", signalType: "trend", direction: "long", confidence: 0.88, entryPrice: 875.50, targetPrice: 920.00, stopLoss: 850.00, reasoning: "AI sector rotation continues with NVDA leading. Earnings beat expectations and forward guidance raised. Institutional flow remains strongly positive.", patternDetected: "Ascending Triangle", timeframe: "1W", status: "active" },
    { ticker: "SOL", marketType: "crypto", signalType: "reversal", direction: "long", confidence: 0.65, entryPrice: 142.80, targetPrice: 155.00, stopLoss: 135.00, reasoning: "Solana approaching key support zone with RSI oversold. Network metrics show growing TVL and DApp deployment activity despite price decline.", patternDetected: "Oversold Bounce", timeframe: "4H", status: "active" },
    { ticker: "EUR/USD", marketType: "forex", signalType: "range", direction: "long", confidence: 0.58, entryPrice: 1.0842, targetPrice: 1.0920, stopLoss: 1.0780, reasoning: "EUR/USD consolidating near range support with ECB hawkish stance. Dollar weakness expected from Fed rate cut expectations.", patternDetected: "Range Support", timeframe: "1D", status: "active" },
    { ticker: "MSFT", marketType: "stock", signalType: "trend", direction: "long", confidence: 0.82, entryPrice: 415.20, targetPrice: 435.00, stopLoss: 405.00, reasoning: "Microsoft AI integration driving cloud revenue growth. Azure market share expanding with Copilot adoption accelerating across enterprise clients.", patternDetected: "Trend Continuation", timeframe: "1D", status: "active" },
  ];

  for (const signal of signalsData) {
    await storage.createAiSignal(signal);
  }

  const tradesData = [
    { ticker: "AAPL", marketType: "stock", direction: "long", entryPrice: 182.50, exitPrice: 189.30, quantity: 10, pnl: 68.00, emotionBefore: "calm", emotionAfter: "confident", disciplineScore: 85, notes: "Followed signal, stuck to plan", status: "closed" },
    { ticker: "BTC", marketType: "crypto", direction: "long", entryPrice: 58200.00, exitPrice: 61500.00, quantity: 0.5, pnl: 1650.00, emotionBefore: "confident", emotionAfter: "calm", disciplineScore: 90, notes: "Clean entry on breakout signal", status: "closed" },
    { ticker: "TSLA", marketType: "stock", direction: "short", entryPrice: 260.00, exitPrice: 268.50, quantity: 5, pnl: -42.50, emotionBefore: "excited", emotionAfter: "anxious", disciplineScore: 45, notes: "FOMO entry, didn't wait for confirmation", status: "closed" },
    { ticker: "ETH", marketType: "crypto", direction: "long", entryPrice: 3350.00, exitPrice: 3410.00, quantity: 2, pnl: 120.00, emotionBefore: "calm", emotionAfter: "calm", disciplineScore: 78, notes: "Good risk management", status: "closed" },
    { ticker: "NVDA", marketType: "stock", direction: "long", entryPrice: 870.00, quantity: 3, emotionBefore: "confident", status: "open" },
  ];

  for (const trade of tradesData) {
    await storage.createTrade(trade as any);
  }

  const alertsData = [
    { name: "BTC Breakout Alert", ticker: "BTC", marketType: "crypto", conditions: [{ type: "price_above" as const, value: 65000, operator: "and" as const }, { type: "volume_spike" as const, value: 50, operator: "and" as const }], isActive: true, channel: "app", triggeredCount: 0 },
    { name: "TSLA Support Watch", ticker: "TSLA", marketType: "stock", conditions: [{ type: "price_below" as const, value: 240, operator: "and" as const }, { type: "rsi_oversold" as const, value: 30, operator: "or" as const }], isActive: true, channel: "telegram", triggeredCount: 2 },
    { name: "NVDA Momentum", ticker: "NVDA", marketType: "stock", conditions: [{ type: "price_above" as const, value: 900, operator: "and" as const }], isActive: true, channel: "discord", triggeredCount: 0 },
    { name: "EUR/USD Range Break", ticker: "EUR/USD", marketType: "forex", conditions: [{ type: "price_above" as const, value: 1.09, operator: "or" as const }, { type: "price_below" as const, value: 1.07, operator: "or" as const }], isActive: false, channel: "sms", triggeredCount: 5 },
  ];

  for (const alert of alertsData) {
    await storage.createAlert(alert as any);
  }

  const behavioralData = [
    { eventType: "fomo_entry", description: "FOMO entry detected on TSLA. Excitement-driven trade without signal confirmation.", severity: "high", tradeId: null },
    { eventType: "discipline_check", description: "Strong discipline maintained on BTC trade. Entry and exit aligned with plan.", severity: "low", tradeId: null },
    { eventType: "overtrading", description: "3 trades placed within 30 minutes. Consider slowing down and being more selective.", severity: "medium", tradeId: null },
    { eventType: "risk_management", description: "Stop loss properly set on all open positions. Risk per trade within 2% threshold.", severity: "low", tradeId: null },
    { eventType: "revenge_warning", description: "Multiple losing trades detected in sequence. Take a break before entering new positions.", severity: "high", tradeId: null },
  ];

  for (const log of behavioralData) {
    await storage.createBehavioralLog(log);
  }

  console.log("Database seeded successfully");
}
