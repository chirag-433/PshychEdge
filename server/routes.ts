import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTradeSchema, insertAlertSchema } from "@shared/schema";
import { z } from "zod";

const createTradeSchema = insertTradeSchema.extend({
  ticker: z.string().min(1),
  direction: z.enum(["long", "short"]),
  entryPrice: z.number().positive(),
  quantity: z.number().positive(),
  emotionBefore: z.string().optional(),
  notes: z.string().optional(),
});

const closeTradeSchema = z.object({
  exitPrice: z.number().positive(),
  pnl: z.number(),
  emotionAfter: z.string().optional(),
  disciplineScore: z.number().min(0).max(100).optional(),
  status: z.literal("closed"),
});

const createAlertSchema = insertAlertSchema.extend({
  name: z.string().min(1),
  ticker: z.string().min(1),
  conditions: z.array(z.object({
    type: z.enum(["price_above", "price_below", "volume_spike", "sentiment_shift", "rsi_overbought", "rsi_oversold"]),
    value: z.number(),
    operator: z.enum(["and", "or"]),
  })).min(1),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/watchlist", async (_req, res) => {
    const items = await storage.getWatchlistItems();
    res.json(items);
  });

  app.get("/api/signals", async (_req, res) => {
    const signals = await storage.getAiSignals();
    res.json(signals);
  });

  app.get("/api/trades", async (_req, res) => {
    const allTrades = await storage.getTrades();
    res.json(allTrades);
  });

  app.post("/api/trades", async (req, res) => {
    try {
      const parsed = createTradeSchema.parse(req.body);
      const trade = await storage.createTrade(parsed);

      if (parsed.emotionBefore === "revenge" || parsed.emotionBefore === "excited") {
        await storage.createBehavioralLog({
          eventType: parsed.emotionBefore === "revenge" ? "revenge_trade" : "fomo_entry",
          description: parsed.emotionBefore === "revenge"
            ? `Revenge trade detected on ${parsed.ticker}. Emotional state flagged before entry.`
            : `FOMO entry detected on ${parsed.ticker}. Excitement-driven trade identified.`,
          severity: "high",
          tradeId: trade.id,
        });
      }

      res.json(trade);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors.map(e => e.message).join(", ") });
      }
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/trades/:id", async (req, res) => {
    try {
      const parsed = closeTradeSchema.parse(req.body);
      const trade = await storage.updateTrade(req.params.id, {
        ...parsed,
        exitedAt: new Date(),
      });
      if (!trade) return res.status(404).json({ message: "Trade not found" });

      if (parsed.disciplineScore !== undefined) {
        if (parsed.disciplineScore < 40) {
          await storage.createBehavioralLog({
            eventType: "low_discipline",
            description: `Low discipline score (${parsed.disciplineScore}/100) on ${trade.ticker} trade. Review your trading plan adherence.`,
            severity: "high",
            tradeId: trade.id,
          });
        } else if (parsed.disciplineScore < 70) {
          await storage.createBehavioralLog({
            eventType: "moderate_discipline",
            description: `Moderate discipline score (${parsed.disciplineScore}/100) on ${trade.ticker}. Room for improvement in plan execution.`,
            severity: "medium",
            tradeId: trade.id,
          });
        }
      }

      res.json(trade);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors.map(e => e.message).join(", ") });
      }
      res.status(400).json({ message: err.message });
    }
  });

  app.get("/api/alerts", async (_req, res) => {
    const allAlerts = await storage.getAlerts();
    res.json(allAlerts);
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const parsed = createAlertSchema.parse(req.body);
      const alert = await storage.createAlert(parsed);
      res.json(alert);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors.map(e => e.message).join(", ") });
      }
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/alerts/:id", async (req, res) => {
    try {
      const updateSchema = z.object({ isActive: z.boolean() });
      const parsed = updateSchema.parse(req.body);
      const alert = await storage.updateAlert(req.params.id, parsed);
      if (!alert) return res.status(404).json({ message: "Alert not found" });
      res.json(alert);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors.map(e => e.message).join(", ") });
      }
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/alerts/:id", async (req, res) => {
    try {
      await storage.deleteAlert(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.get("/api/behavioral-logs", async (_req, res) => {
    const logs = await storage.getBehavioralLogs();
    res.json(logs);
  });

  return httpServer;
}
