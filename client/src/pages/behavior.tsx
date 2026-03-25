import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Brain,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Zap,
  Shield,
  BarChart3,
} from "lucide-react";
import type { Trade, BehavioralLog } from "@shared/schema";

function DisciplineGauge({ score }: { score: number }) {
  const color = score >= 70 ? "text-gain" : score >= 40 ? "text-chart-4" : "text-loss";
  const label = score >= 70 ? "Strong" : score >= 40 ? "Needs Work" : "Critical";

  return (
    <Card>
      <CardContent className="p-6 text-center">
        <div className="relative w-24 h-24 mx-auto mb-3">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={score >= 70 ? "hsl(var(--gain))" : score >= 40 ? "hsl(var(--chart-4))" : "hsl(var(--loss))"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 264} 264`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-xl font-bold ${color}`}>{score}</span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
        </div>
        <p className="text-sm font-medium">Discipline Score</p>
        <p className={`text-xs ${color}`}>{label}</p>
      </CardContent>
    </Card>
  );
}

function BehaviorMetric({ title, value, subtitle, icon: Icon, color }: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-md ${color} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-lg font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmotionBreakdown({ trades }: { trades: Trade[] }) {
  const emotionCounts = trades.reduce((acc, trade) => {
    const emotion = trade.emotionBefore || "unknown";
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(emotionCounts).reduce((a, b) => a + b, 0) || 1;

  const emotionLabels: Record<string, string> = {
    calm: "Calm & Focused",
    confident: "Confident",
    anxious: "Anxious",
    excited: "Excited/FOMO",
    fearful: "Fearful",
    revenge: "Revenge Trading",
    unknown: "Not Recorded",
  };

  const emotionColors: Record<string, string> = {
    calm: "bg-gain",
    confident: "bg-primary",
    anxious: "bg-chart-4",
    excited: "bg-chart-5",
    fearful: "bg-loss",
    revenge: "bg-destructive",
    unknown: "bg-muted-foreground",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-1">
          <Brain className="w-4 h-4 text-primary" />
          Emotion Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-3">
          {Object.entries(emotionCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([emotion, count]) => (
              <div key={emotion}>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs capitalize">{emotionLabels[emotion] || emotion}</span>
                  <span className="text-xs text-muted-foreground">{count} ({Math.round((count / total) * 100)}%)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${emotionColors[emotion] || "bg-muted-foreground"}`}
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
        {Object.keys(emotionCounts).length === 0 && (
          <p className="text-sm text-center text-muted-foreground py-4">No emotion data yet</p>
        )}
      </CardContent>
    </Card>
  );
}

function TradeTimingAnalysis({ trades }: { trades: Trade[] }) {
  const hourBuckets = new Array(24).fill(0);
  const hourPnl = new Array(24).fill(0);

  trades.forEach((trade) => {
    if (trade.enteredAt) {
      const hour = new Date(trade.enteredAt).getHours();
      hourBuckets[hour]++;
      hourPnl[hour] += trade.pnl || 0;
    }
  });

  const maxTrades = Math.max(...hourBuckets) || 1;

  const morningTrades = hourBuckets.slice(6, 12).reduce((a, b) => a + b, 0);
  const afternoonTrades = hourBuckets.slice(12, 18).reduce((a, b) => a + b, 0);
  const eveningTrades = hourBuckets.slice(18, 24).reduce((a, b) => a + b, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-1">
          <Clock className="w-4 h-4 text-primary" />
          Time-of-Day Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-end gap-0.5 h-16 mb-3">
          {hourBuckets.map((count, hour) => (
            <div
              key={hour}
              className={`flex-1 rounded-t-sm transition-colors ${
                count > 0 ? "bg-primary/60" : "bg-muted"
              }`}
              style={{ height: `${(count / maxTrades) * 100}%`, minHeight: count > 0 ? "4px" : "2px" }}
              title={`${hour}:00 - ${count} trades`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-3">
          <span>12AM</span>
          <span>6AM</span>
          <span>12PM</span>
          <span>6PM</span>
          <span>12AM</span>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-3 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Morning</p>
            <p className="text-sm font-bold">{morningTrades}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Afternoon</p>
            <p className="text-sm font-bold">{afternoonTrades}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Evening</p>
            <p className="text-sm font-bold">{eveningTrades}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Behavior() {
  const { data: trades, isLoading: tradesLoading } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });
  const { data: logs, isLoading: logsLoading } = useQuery<BehavioralLog[]>({
    queryKey: ["/api/behavioral-logs"],
  });

  const isLoading = tradesLoading || logsLoading;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  const closedTrades = trades?.filter(t => t.status === "closed") || [];
  const tradesWithDiscipline = closedTrades.filter(t => t.disciplineScore != null && t.disciplineScore !== undefined);
  const avgDiscipline = tradesWithDiscipline.length > 0
    ? tradesWithDiscipline.reduce((sum, t) => sum + (t.disciplineScore || 0), 0) / tradesWithDiscipline.length
    : 0;

  const fomoTrades = (trades || []).filter(t => t.emotionBefore === "excited").length;
  const revengeTrades = (trades || []).filter(t => t.emotionBefore === "revenge").length;
  const totalTrades = trades?.length || 0;
  const fomoIndex = totalTrades > 0 ? Math.round((fomoTrades / totalTrades) * 100) : 0;

  const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
  const losingTrades = closedTrades.filter(t => (t.pnl || 0) < 0);
  const avgWin = winningTrades.length
    ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length
    : 0;
  const avgLoss = losingTrades.length
    ? Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades.length)
    : 0;

  const highSeverityLogs = logs?.filter(l => l.severity === "high").length || 0;

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-1">Behavioral Analysis</h2>
        <p className="text-sm text-muted-foreground">Track your trading psychology, entry/exit discipline, and risk patterns</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <BehaviorMetric
          title="FOMO Index"
          value={`${fomoIndex}%`}
          subtitle={`${fomoTrades} FOMO trades`}
          icon={Zap}
          color={fomoIndex > 30 ? "bg-loss/10 text-loss" : "bg-gain/10 text-gain"}
        />
        <BehaviorMetric
          title="Revenge Trades"
          value={String(revengeTrades)}
          subtitle="Emotion-driven entries"
          icon={AlertTriangle}
          color={revengeTrades > 0 ? "bg-loss/10 text-loss" : "bg-gain/10 text-gain"}
        />
        <BehaviorMetric
          title="Avg Win"
          value={avgWin > 0 ? `+$${avgWin.toFixed(2)}` : "$0.00"}
          subtitle={`${winningTrades.length} winning trades`}
          icon={TrendingUp}
          color="bg-gain/10 text-gain"
        />
        <BehaviorMetric
          title="Avg Loss"
          value={avgLoss > 0 ? `-$${avgLoss.toFixed(2)}` : "$0.00"}
          subtitle={`${losingTrades.length} losing trades`}
          icon={TrendingDown}
          color="bg-loss/10 text-loss"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <DisciplineGauge score={Math.round(avgDiscipline)} />
        <EmotionBreakdown trades={trades || []} />
        <TradeTimingAnalysis trades={trades || []} />
      </div>

      <div>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-1">
          <Activity className="w-4 h-4 text-primary" />
          Behavioral Log
          {highSeverityLogs > 0 && (
            <Badge variant="destructive" className="text-[10px] ml-2">{highSeverityLogs} alerts</Badge>
          )}
        </h3>
        {(!logs || logs.length === 0) ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No behavioral events logged yet</p>
              <p className="text-xs text-muted-foreground mt-1">Events will appear as you trade</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <Card key={log.id} data-testid={`log-${log.id}`}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      log.severity === "high" ? "bg-loss/10" : log.severity === "medium" ? "bg-chart-4/10" : "bg-gain/10"
                    }`}>
                      {log.severity === "high" ? (
                        <AlertTriangle className="w-3 h-3 text-loss" />
                      ) : log.severity === "medium" ? (
                        <Zap className="w-3 h-3 text-chart-4" />
                      ) : (
                        <Shield className="w-3 h-3 text-gain" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-sm font-medium">{log.description}</p>
                        <Badge variant="secondary" className="text-[10px]">{log.severity}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{log.eventType}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {log.createdAt ? new Date(log.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
