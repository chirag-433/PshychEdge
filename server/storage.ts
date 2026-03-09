import {
  type User, type InsertUser,
  type WatchlistItem, type InsertWatchlistItem,
  type AiSignal, type InsertAiSignal,
  type Trade, type InsertTrade,
  type Alert, type InsertAlert,
  type BehavioralLog, type InsertBehavioralLog,
  users, watchlistItems, aiSignals, trades, alerts, behavioralLogs,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getWatchlistItems(): Promise<WatchlistItem[]>;
  createWatchlistItem(item: InsertWatchlistItem): Promise<WatchlistItem>;

  getAiSignals(): Promise<AiSignal[]>;
  createAiSignal(signal: InsertAiSignal): Promise<AiSignal>;

  getTrades(): Promise<Trade[]>;
  createTrade(trade: InsertTrade): Promise<Trade>;
  updateTrade(id: string, updates: Partial<Trade>): Promise<Trade | undefined>;

  getAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | undefined>;
  deleteAlert(id: string): Promise<void>;

  getBehavioralLogs(): Promise<BehavioralLog[]>;
  createBehavioralLog(log: InsertBehavioralLog): Promise<BehavioralLog>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getWatchlistItems(): Promise<WatchlistItem[]> {
    return db.select().from(watchlistItems);
  }

  async createWatchlistItem(item: InsertWatchlistItem): Promise<WatchlistItem> {
    const [result] = await db.insert(watchlistItems).values(item).returning();
    return result;
  }

  async getAiSignals(): Promise<AiSignal[]> {
    return db.select().from(aiSignals);
  }

  async createAiSignal(signal: InsertAiSignal): Promise<AiSignal> {
    const [result] = await db.insert(aiSignals).values(signal).returning();
    return result;
  }

  async getTrades(): Promise<Trade[]> {
    return db.select().from(trades);
  }

  async createTrade(trade: InsertTrade): Promise<Trade> {
    const [result] = await db.insert(trades).values(trade).returning();
    return result;
  }

  async updateTrade(id: string, updates: Partial<Trade>): Promise<Trade | undefined> {
    const [result] = await db.update(trades).set(updates).where(eq(trades.id, id)).returning();
    return result;
  }

  async getAlerts(): Promise<Alert[]> {
    return db.select().from(alerts);
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [result] = await db.insert(alerts).values(alert).returning();
    return result;
  }

  async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | undefined> {
    const [result] = await db.update(alerts).set(updates).where(eq(alerts.id, id)).returning();
    return result;
  }

  async deleteAlert(id: string): Promise<void> {
    await db.delete(alerts).where(eq(alerts.id, id));
  }

  async getBehavioralLogs(): Promise<BehavioralLog[]> {
    return db.select().from(behavioralLogs);
  }

  async createBehavioralLog(log: InsertBehavioralLog): Promise<BehavioralLog> {
    const [result] = await db.insert(behavioralLogs).values(log).returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
