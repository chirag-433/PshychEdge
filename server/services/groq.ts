import { log } from "../index";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const API_KEY = process.env.GROQ_API_KEY || "";

interface GeneratedSignal {
  ticker: string;
  marketType: string;
  signalType: string;
  direction: string;
  confidence: number;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  reasoning: string;
  patternDetected: string;
  timeframe: string;
}

export async function generateAISignal(
  ticker: string,
  marketType: string,
  currentPrice: number,
  changePercent: number,
  volume: number,
  high24h: number,
  low24h: number
): Promise<GeneratedSignal | null> {
  if (!API_KEY) {
    log("GROQ_API_KEY not configured", "groq");
    return null;
  }

  try {
    const prompt = `You are a professional quantitative trading analyst. Analyze this market data and generate a trading signal.

Ticker: ${ticker}
Market: ${marketType}
Current Price: $${currentPrice}
24h Change: ${changePercent.toFixed(2)}%
Volume: ${volume.toLocaleString()}
24h High: $${high24h}
24h Low: $${low24h}
Price Range: ${((high24h - low24h) / low24h * 100).toFixed(2)}% spread

Based on this data, generate a JSON trading signal. Consider:
- Price momentum and direction
- Volatility (range vs price)
- Volume significance
- Key price levels

Respond ONLY with valid JSON in this exact format, no other text:
{
  "direction": "long" or "short",
  "confidence": 0.0 to 1.0,
  "targetPrice": number,
  "stopLoss": number,
  "reasoning": "2-3 sentence analysis",
  "patternDetected": "pattern name",
  "signalType": "momentum" or "reversal" or "breakout" or "trend" or "range",
  "timeframe": "1H" or "4H" or "1D" or "1W"
}`;

    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a quantitative trading analyst. Respond only with valid JSON. No markdown, no code blocks, no extra text.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      log(`Groq API error: ${res.status} - ${errText}`, "groq");
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      log("Empty response from Groq", "groq");
      return null;
    }

    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const confidence = Math.max(0.1, Math.min(1.0, parsed.confidence || 0.5));
    const direction = parsed.direction === "short" ? "short" : "long";

    return {
      ticker,
      marketType,
      signalType: parsed.signalType || "momentum",
      direction,
      confidence,
      entryPrice: currentPrice,
      targetPrice: parsed.targetPrice || (direction === "long" ? currentPrice * 1.05 : currentPrice * 0.95),
      stopLoss: parsed.stopLoss || (direction === "long" ? currentPrice * 0.97 : currentPrice * 1.03),
      reasoning: parsed.reasoning || "AI analysis based on current market conditions.",
      patternDetected: parsed.patternDetected || "AI Pattern Detection",
      timeframe: parsed.timeframe || "4H",
    };
  } catch (err) {
    log(`Error generating AI signal for ${ticker}: ${err}`, "groq");
    return null;
  }
}

export async function generateSignalsForWatchlist(
  items: Array<{
    ticker: string;
    marketType: string;
    currentPrice: number;
    changePercent: number;
    volume: number;
    high24h: number;
    low24h: number;
  }>
): Promise<GeneratedSignal[]> {
  const signals: GeneratedSignal[] = [];

  for (const item of items) {
    const signal = await generateAISignal(
      item.ticker,
      item.marketType,
      item.currentPrice,
      item.changePercent,
      item.volume,
      item.high24h,
      item.low24h
    );
    if (signal) {
      signals.push(signal);
    }
    await delay(500);
  }

  return signals;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
