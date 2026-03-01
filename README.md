# PshchEdge

PshchEdge is a trading analytics application focused on trade journaling, behavioral tracking, AI signal generation, and market alerts.

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file using `.env.example` and set required values:
   - `DATABASE_URL`
   - `ALPHA_VANTAGE_API_KEY`
   - `GROQ_API_KEY`
   - `SESSION_SECRET`

3. Push database schema:

   ```bash
   npm run db:push
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Build and run production:

   ```bash
   npm run build
   npm start
   ```

## Available Scripts

- `npm run dev` - Run the app in development mode
- `npm run build` - Build the production bundle
- `npm start` - Start the production server
- `npm run check` - Run TypeScript checks
- `npm run db:push` - Push schema changes to the database

## API Endpoints

All backend routes are under `/api`.

### Watchlist and Signals
- `GET /api/watchlist`
- `GET /api/signals`
- `POST /api/refresh/market`
- `POST /api/refresh/signals`

### Trades
- `GET /api/trades`
- `POST /api/trades`
- `PATCH /api/trades/:id`

### Alerts
- `GET /api/alerts`
- `POST /api/alerts`
- `PATCH /api/alerts/:id`
- `DELETE /api/alerts/:id`

### Behavioral Logs
- `GET /api/behavioral-logs`
