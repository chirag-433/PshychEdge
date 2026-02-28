import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const watchlistItems = pgTable("watchlist_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticker: text("ticker").notNull(),
  name: text("name").notNull(),
  marketType: text("market_type").notNull(),
  currentPrice: real("current_price").notNull(),
  previousClose: real("previous_close").notNull(),
  changePercent: real("change_percent").notNull(),
  volume: real("volume").notNull(),
  high24h: real("high_24h").notNull(),
  low24h: real("low_24h").notNull(),
  marketCap: real("market_cap"),
  sparklineData: jsonb("sparkline_data").$type<number[]>(),
});

export const insertWatchlistItemSchema = createInsertSchema(watchlistItems).omit({ id: true });
export type InsertWatchlistItem = z.infer<typeof insertWatchlistItemSchema>;
export type WatchlistItem = typeof watchlistItems.$inferSelect;

export const aiSignals = pgTable("ai_signals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticker: text("ticker").notNull(),
  marketType: text("market_type").notNull(),
  signalType: text("signal_type").notNull(),
  direction: text("direction").notNull(),
  confidence: real("confidence").notNull(),
  entryPrice: real("entry_price").notNull(),
  targetPrice: real("target_price"),
  stopLoss: real("stop_loss"),
  reasoning: text("reasoning").notNull(),
  patternDetected: text("pattern_detected"),
  timeframe: text("timeframe").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAiSignalSchema = createInsertSchema(aiSignals).omit({ id: true, createdAt: true });
export type InsertAiSignal = z.infer<typeof insertAiSignalSchema>;
export type AiSignal = typeof aiSignals.$inferSelect;

export const trades = pgTable("trades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticker: text("ticker").notNull(),
  marketType: text("market_type").notNull(),
  direction: text("direction").notNull(),
  entryPrice: real("entry_price").notNull(),
  exitPrice: real("exit_price"),
  quantity: real("quantity").notNull(),
  pnl: real("pnl"),
  emotionBefore: text("emotion_before"),
  emotionAfter: text("emotion_after"),
  disciplineScore: integer("discipline_score"),
  notes: text("notes"),
  signalId: varchar("signal_id"),
  status: text("status").notNull().default("open"),
  enteredAt: timestamp("entered_at").defaultNow().notNull(),
  exitedAt: timestamp("exited_at"),
});

export const insertTradeSchema = createInsertSchema(trades).omit({ id: true, enteredAt: true, exitedAt: true });
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof trades.$inferSelect;

export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  ticker: text("ticker").notNull(),
  marketType: text("market_type").notNull(),
  conditions: jsonb("conditions").$type<AlertCondition[]>().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  channel: text("channel").notNull().default("app"),
  triggeredCount: integer("triggered_count").notNull().default(0),
  lastTriggered: timestamp("last_triggered"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export interface AlertCondition {
  type: "price_above" | "price_below" | "volume_spike" | "sentiment_shift" | "rsi_overbought" | "rsi_oversold";
  value: number;
  operator: "and" | "or";
}

export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true, triggeredCount: true, lastTriggered: true, createdAt: true });
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;

export const behavioralLogs = pgTable("behavioral_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: text("event_type").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(),
  tradeId: varchar("trade_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBehavioralLogSchema = createInsertSchema(behavioralLogs).omit({ id: true, createdAt: true });
export type InsertBehavioralLog = z.infer<typeof insertBehavioralLogSchema>;
export type BehavioralLog = typeof behavioralLogs.$inferSelect;
