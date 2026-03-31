# 🧠 PsychEdge — AI-Powered Trading Psychology Platform

**PsychEdge** is a full-stack trading analytics platform that combines **real-time market data**, **AI-generated signals**, and **behavioral psychology tracking** to help traders master their emotions and improve decision-making.

> _"The market is a device for transferring money from the impatient to the patient."_ — Warren Buffett

## 🎥 Demo Video

See PsychEdge in action:  

👉 [Watch Demo Video](https://drive.google.com/file/d/1Qv99_GFDeqiNz0nl_0DkGLrXOgBDkxLP/view?usp=drive_link)
📌 Note: This demo highlights key features like AI signals, trade journaling, and behavioral tracking.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat&logo=drizzle&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### 📊 Real-Time Market Dashboard
- Live market ticker with scrolling price updates across stocks, crypto, and forex
- Portfolio P&L tracking, win rate metrics, and discipline scoring at a glance
- Top movers visualization with inline sparkline charts
- WebSocket-powered live data feed with 10-second refresh intervals

### 🤖 AI Signal Generation
- Powered by **Groq LLM (Llama 3.1)** for intelligent trade signal generation
- Signals include direction (long/short), confidence score, entry/target/stop-loss prices
- Automatic pattern detection (momentum, reversal, breakout, trend, range)
- Configurable timeframes: 1H, 4H, 1D, 1W

### 📝 Trade Journal
- Log trades with ticker, direction, quantity, entry price, and pre-trade emotions
- Close trades with exit price, P&L calculation, and discipline self-scoring
- Track open vs. closed trades with full history table
- Automatic behavioral event detection (revenge trades, FOMO entries)

### 🧠 Behavioral Psychology Engine
- **Emotion tracking** before and after each trade (calm, anxious, excited, revenge, fearful)
- **Discipline scoring** (0–100) with trend analysis over time
- Automatic detection and logging of psychological patterns:
  - Revenge trading alerts
  - FOMO entry warnings
  - Low discipline notifications
- Real-time **WebSocket intervention alerts** pushed to UI when risky behavior is detected

### 📈 Weekly Mind Reports
- AI-generated weekly performance analysis covering:
  - Total trades, win rate, and cumulative P&L
  - Average discipline score breakdown
  - Emotional pattern distribution
  - Personalized improvement suggestions
- **Telegram bot integration** for automated weekly report delivery

### 🔔 Smart Alerts System
- Multi-condition alert builder with AND/OR logic
- Supported conditions: price above/below, volume spike, RSI overbought/oversold, sentiment shift
- Toggle alerts active/inactive or delete them
- Alert trigger counting and last-triggered timestamps

### 🌓 Dark/Light Theme
- Smooth theme switching with localStorage persistence
- Professionally designed for both modes with custom color tokens

---

## 🏗️ Architecture

```
PsychEdge/
├── client/                    # React frontend (Vite)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/            # 47 shadcn/ui components
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── sparkline.tsx
│   │   │   └── theme-provider.tsx
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useWebSocket.ts
│   │   │   ├── use-toast.ts
│   │   │   └── use-mobile.tsx
│   │   ├── lib/               # Utilities & query client
│   │   ├── pages/             # Route pages
│   │   │   ├── dashboard.tsx
│   │   │   ├── markets.tsx
│   │   │   ├── signals.tsx
│   │   │   ├── trading.tsx
│   │   │   ├── behavior.tsx
│   │   │   ├── alerts.tsx
│   │   │   └── mind-report.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── index.html
├── server/                    # Express backend
│   ├── services/
│   │   ├── groq.ts            # Groq LLM AI signal generation
│   │   ├── alphavantage.ts    # Stock & forex market data
│   │   ├── coinpaprika.ts     # Cryptocurrency price data
│   │   ├── marketRefresh.ts   # Scheduled data refresh (15-min)
│   │   ├── mindReport.ts      # Weekly psychology reports
│   │   └── telegram.ts        # Telegram bot notifications
│   ├── index.ts               # Server entry + WebSocket setup
│   ├── routes.ts              # REST API endpoints
│   ├── storage.ts             # Database CRUD operations
│   ├── db.ts                  # PostgreSQL connection pool
│   ├── seed.ts                # Sample data seeding
│   ├── vite.ts                # Vite dev middleware
│   └── static.ts              # Production static serving
├── shared/
│   └── schema.ts              # Drizzle ORM schema (7 tables)
└── script/
    └── build.ts               # esbuild production bundler
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, shadcn/ui, Recharts, Framer Motion |
| **Backend** | Express 5, Node.js, TypeScript, WebSocket (ws) |
| **Database** | PostgreSQL (Neon Serverless), Drizzle ORM |
| **AI Engine** | Groq API (Llama 3.1 8B Instant) |
| **Market Data** | Alpha Vantage (stocks/forex), CoinPaprika (crypto) |
| **Notifications** | Telegram Bot API |
| **Routing** | wouter (client-side) |
| **State Management** | TanStack React Query |
| **Validation** | Zod + drizzle-zod |
| **Deployment** | Vercel |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** database (recommended: [Neon](https://neon.tech) free tier)
- API keys for [Alpha Vantage](https://www.alphavantage.co/support/#api-key), [Groq](https://console.groq.com/keys)

### 1. Clone the repository

```bash
git clone https://github.com/chirag-433/PshychEdge.git
cd PshychEdge
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file from the example template:

```bash
cp .env.example .env
```

Fill in the required values:

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
GROQ_API_KEY=your_groq_api_key
SESSION_SECRET=your_random_session_secret
```

**Optional** (for Telegram weekly reports):
```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

### 4. Push database schema

```bash
npm run db:push
```

### 5. Start the development server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build production bundle with esbuild |
| `npm start` | Run the production server |
| `npm run check` | Run TypeScript type checking |
| `npm run db:push` | Push Drizzle schema changes to PostgreSQL |

---

## 🔌 API Reference

All endpoints are prefixed with `/api`.

### Market Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/watchlist` | Fetch all watchlist items with live prices |
| `GET` | `/api/signals` | Get AI-generated trading signals |
| `POST` | `/api/refresh/market` | Manually refresh market data from APIs |
| `POST` | `/api/refresh/signals` | Regenerate AI signals for all watchlist items |

### Trade Journal

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/trades` | Fetch all trades (open and closed) |
| `POST` | `/api/trades` | Create a new trade entry |
| `PATCH` | `/api/trades/:id` | Close a trade with exit price, P&L, and scoring |

### Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/alerts` | Fetch all configured alerts |
| `POST` | `/api/alerts` | Create a new multi-condition alert |
| `PATCH` | `/api/alerts/:id` | Toggle alert active/inactive |
| `DELETE` | `/api/alerts/:id` | Delete an alert |

### Psychology & Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/behavioral-logs` | Fetch behavioral event timeline |
| `GET` | `/api/mind-report` | Generate weekly psychology report |

### WebSocket

| Endpoint | Description |
|----------|-------------|
| `ws://host/ws` | Real-time market data and intervention alerts |

**WebSocket message types:**
- `connected` — Initial connection confirmation
- `market_update` — Live watchlist and signals data (every 10s)
- `intervention` — Behavioral alert (revenge trade, FOMO detected)

---

## 🗄️ Database Schema

The application uses **7 PostgreSQL tables** managed by Drizzle ORM:

| Table | Purpose |
|-------|---------|
| `users` | Authentication (username/password) |
| `watchlist_items` | Market assets with prices, volume, and sparkline data |
| `ai_signals` | AI-generated trade signals with confidence and patterns |
| `trades` | Trade journal with entry/exit, P&L, emotions, and discipline |
| `alerts` | Multi-condition alert rules with trigger tracking |
| `behavioral_logs` | Psychology event timeline (revenge, FOMO, discipline) |
| `mind_reports` | Weekly performance and psychology report snapshots |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Chirag Anand**
- GitHub: [@chirag-433](https://github.com/chirag-433)
