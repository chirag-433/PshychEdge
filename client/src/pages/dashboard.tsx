import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkline } from "@/components/sparkline";
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Activity,
  AlertTriangle,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from "lucide-react";
import type { WatchlistItem, AiSignal, Trade, BehavioralLog } from "@shared/schema";

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  testId,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  testId: string;
}) {
  return (
    <Card data-testid={testId}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-1">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">{title}</p>
            <p className="text-xl font-bold tracking-tight" data-testid={`${testId}-value`}>{value}</p>
            {subtitle && (
              <p className={`text-xs mt-1 ${
                trend === "up" ? "text-gain" : trend === "down" ? "text-loss" : "text-muted-foreground"
              }`}>
                {trend === "up" && <ArrowUpRight className="inline w-3 h-3 mr-0.5" />}
                {trend === "down" && <ArrowDownRight className="inline w-3 h-3 mr-0.5" />}
                {subtitle}
              </p>
            )}
          </div>
          <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TopMoversSection({ items }: { items: WatchlistItem[] }) {
  const sorted = [...items].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)).slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-1">
          <TrendingUp className="w-4 h-4 text-primary" />
          Top Movers
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-3">
          {sorted.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2" data-testid={`mover-${item.ticker}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold">{item.ticker.slice(0, 3)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{item.ticker}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Sparkline
                  data={item.sparklineData as number[] || []}
                  positive={item.changePercent >= 0}
                  width={60}
                  height={24}
                />
                <div className="text-right min-w-[70px]">
                  <p className="text-sm font-mono font-medium">${item.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className={`text-xs font-mono ${item.changePercent >= 0 ? "text-gain" : "text-loss"}`}>
                    {item.changePercent >= 0 ? "+" : ""}{item.changePercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentSignalsSection({ signals }: { signals: AiSignal[] }) {
  const recent = signals.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-1">
          <Brain className="w-4 h-4 text-primary" />
          Latest AI Signals
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-3">
          {recent.map((signal) => (
            <div key={signal.id} className="flex items-center justify-between gap-2" data-testid={`signal-${signal.id}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${
                  signal.direction === "long" ? "bg-gain/10" : "bg-loss/10"
                }`}>
                  {signal.direction === "long" ? (
                    <TrendingUp className="w-4 h-4 text-gain" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-loss" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {signal.ticker}
                    <span className="text-muted-foreground ml-1 text-xs capitalize">{signal.direction}</span>
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{signal.patternDetected || signal.signalType}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-10 h-1.5 rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${signal.confidence >= 0.8 ? "bg-gain" : signal.confidence >= 0.6 ? "bg-chart-4" : "bg-loss"}`}
                    style={{ width: `${signal.confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground min-w-[32px] text-right">
                  {Math.round(signal.confidence * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentTradesSection({ trades }: { trades: Trade[] }) {
  const recent = trades.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-1">
          <BarChart3 className="w-4 h-4 text-primary" />
          Recent Trades
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {recent.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">No trades yet</p>
            <p className="text-xs text-muted-foreground mt-1">Start paper trading to see your history</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between gap-2" data-testid={`trade-${trade.id}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <Badge variant={trade.status === "open" ? "default" : "secondary"} className="text-[10px]">
                    {trade.status}
                  </Badge>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{trade.ticker}</p>
                    <p className="text-xs text-muted-foreground capitalize">{trade.direction}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {trade.pnl !== null && trade.pnl !== undefined ? (
                    <p className={`text-sm font-mono font-medium ${trade.pnl >= 0 ? "text-gain" : "text-loss"}`}>
                      {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                    </p>
                  ) : (
                    <p className="text-sm font-mono text-muted-foreground">-</p>
                  )}
                  {trade.disciplineScore !== null && trade.disciplineScore !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      Discipline: {trade.disciplineScore}/100
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BehavioralAlerts({ logs }: { logs: BehavioralLog[] }) {
  const recent = logs.slice(0, 4);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-1">
          <Activity className="w-4 h-4 text-primary" />
          Behavioral Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {recent.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">No behavioral alerts</p>
            <p className="text-xs text-muted-foreground mt-1">Alerts will appear as you trade</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((log) => (
              <div key={log.id} className="flex items-start gap-3" data-testid={`behavioral-${log.id}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  log.severity === "high" ? "bg-loss/10" : log.severity === "medium" ? "bg-chart-4/10" : "bg-gain/10"
                }`}>
                  {log.severity === "high" ? (
                    <AlertTriangle className="w-3 h-3 text-loss" />
                  ) : (
                    <Zap className="w-3 h-3 text-chart-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm">{log.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{log.eventType}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MarketTicker({ items }: { items: WatchlistItem[] }) {
  return (
    <div className="border-b bg-card/50 relative">
      <div className="flex animate-ticker whitespace-nowrap py-2 px-4">
        {[...items, ...items].map((item, i) => (
          <div key={`${item.id}-${i}`} className="flex items-center gap-2 mr-6 flex-shrink-0">
            <span className="text-xs font-medium">{item.ticker}</span>
            <span className="text-xs font-mono">${item.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className={`text-xs font-mono ${item.changePercent >= 0 ? "text-gain" : "text-loss"}`}>
              {item.changePercent >= 0 ? "+" : ""}{item.changePercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: watchlist, isLoading: watchlistLoading } = useQuery<WatchlistItem[]>({
    queryKey: ["/api/watchlist"],
  });
  const { data: signals, isLoading: signalsLoading } = useQuery<AiSignal[]>({
    queryKey: ["/api/signals"],
  });
  const { data: trades, isLoading: tradesLoading } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });
  const { data: logs, isLoading: logsLoading } = useQuery<BehavioralLog[]>({
    queryKey: ["/api/behavioral-logs"],
  });

  const isLoading = watchlistLoading || signalsLoading || tradesLoading || logsLoading;

  const totalPnl = trades?.reduce((sum, t) => sum + (t.pnl || 0), 0) || 0;
  const closedCount = trades?.filter((t) => t.status === "closed").length || 0;
  const winRate = closedCount > 0
    ? (trades!.filter((t) => (t.pnl || 0) > 0).length / closedCount * 100)
    : 0;
  const disciplinedTrades = trades?.filter(t => t.disciplineScore != null) || [];
  const avgDiscipline = disciplinedTrades.length > 0
    ? disciplinedTrades.reduce((sum, t) => sum + (t.disciplineScore || 0), 0) / disciplinedTrades.length
    : 0;
  const activeSignals = signals?.filter((s) => s.status === "active").length || 0;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-48 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {watchlist && watchlist.length > 0 && <MarketTicker items={watchlist} />}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold mb-1">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Your trading intelligence at a glance</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Portfolio P&L"
            value={`${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)}`}
            subtitle="Paper trading"
            icon={Target}
            trend={totalPnl >= 0 ? "up" : "down"}
            testId="metric-pnl"
          />
          <MetricCard
            title="Win Rate"
            value={`${winRate.toFixed(0)}%`}
            subtitle={`${trades?.filter(t => t.status === "closed").length || 0} closed trades`}
            icon={TrendingUp}
            trend={winRate >= 50 ? "up" : "down"}
            testId="metric-winrate"
          />
          <MetricCard
            title="Discipline Score"
            value={avgDiscipline ? `${avgDiscipline.toFixed(0)}/100` : "N/A"}
            subtitle="Behavioral metric"
            icon={Activity}
            trend={avgDiscipline >= 70 ? "up" : avgDiscipline > 0 ? "down" : "neutral"}
            testId="metric-discipline"
          />
          <MetricCard
            title="Active Signals"
            value={String(activeSignals)}
            subtitle="AI-generated"
            icon={Brain}
            trend="neutral"
            testId="metric-signals"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TopMoversSection items={watchlist || []} />
          <RecentSignalsSection signals={signals || []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RecentTradesSection trades={trades || []} />
          <BehavioralAlerts logs={logs || []} />
        </div>
      </div>
    </div>
  );
}
