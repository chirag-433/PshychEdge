# PsychEdge Pro - Trading Intelligence Platform

## Overview
PsychEdge Pro is a unified trading platform for retail traders across Stocks, Crypto, and Forex. It combines live market data, AI-powered signals with confidence scores, behavioral analysis tracking, smart multi-condition alert pipelines, and risk-free paper trading with emotion-gated entry.

## Architecture
- **Frontend**: React + TypeScript with Vite, Wouter routing, TanStack Query, Shadcn UI components, Tailwind CSS
- **Backend**: Express.js REST API with Zod validation
- **Database**: PostgreSQL with Drizzle ORM
- **Theme**: Dark/light mode with teal/emerald primary accent (--primary: 168 80% 42%)

## External Services
- **Alpha Vantage** (`server/services/alphavantage.ts`): Stock quotes (AAPL, TSLA, NVDA, MSFT) and Forex rates (EUR/USD, GBP/USD, USD/JPY). Free tier: 5 calls/min, 1200ms delay between calls.
- **CoinPaprika** (`server/services/coinpaprika.ts`): Crypto prices (BTC, ETH, SOL) with 24h OHLC data. Free API, no key needed.
- **Groq** (`server/services/groq.ts`): AI signal generation using llama-3.1-8b-instant model. Analyzes market data to produce trading signals with confidence scores, entry/target/stop levels, and reasoning.
- **Market Refresh Scheduler** (`server/services/marketRefresh.ts`): Auto-refreshes market data every 5 minutes and regenerates AI signals every 15 minutes on server startup.

## Data Model
- `users` - User accounts
- `watchlist_items` - Market assets (stocks, crypto, forex) with price data and sparklines
- `ai_signals` - AI-generated trade signals with confidence, entry/target/stop prices
- `trades` - Paper trades with emotion tracking and discipline scoring
- `alerts` - Multi-condition alert configurations with channel selection
- `behavioral_logs` - Psychology/behavioral event tracking

## Pages
- `/` - Dashboard with market ticker, metrics, top movers, signals, trades, behavioral alerts
- `/markets` - Market feeds with filterable tabs (All/Stocks/Crypto/Forex) + "Refresh Live Data" button
- `/signals` - AI signal cards with confidence bars and pattern detection + "Generate New Signals" button
- `/trading` - Paper trading with emotion-gated entry (8s check-in) and trade history
- `/behavior` - Behavioral analysis with discipline gauge, emotion breakdown, time analysis
- `/alerts` - Smart alert pipeline configuration with multi-condition triggers

## API Endpoints
- `GET /api/watchlist` - Market data
- `GET /api/signals` - AI signals
- `GET /api/trades` - Paper trades
- `POST /api/trades` - Create trade (validated with Zod)
- `PATCH /api/trades/:id` - Close trade
- `GET /api/alerts` - Alert configs
- `POST /api/alerts` - Create alert (validated)
- `PATCH /api/alerts/:id` - Toggle alert
- `DELETE /api/alerts/:id` - Remove alert
- `GET /api/behavioral-logs` - Behavioral events
- `POST /api/refresh/market` - Manual market data refresh (Alpha Vantage + CoinPaprika)
- `POST /api/refresh/signals` - Manual AI signal regeneration (Groq)

## Key Features
- Real-time market ticker scrolling banner
- Sparkline charts for price visualization
- Live market data from Alpha Vantage (stocks/forex) and CoinPaprika (crypto)
- AI-powered trade signals via Groq LLM with confidence scoring
- Auto-scheduled data refresh (market: 5min, signals: 15min)
- Manual refresh buttons on Markets and Signals pages
- Emotion-gated paper trading with 8-second psychological check-in
- Automatic behavioral logging on FOMO/revenge trades and low discipline scores
- Dark/light theme toggle with localStorage persistence
- Responsive sidebar navigation
