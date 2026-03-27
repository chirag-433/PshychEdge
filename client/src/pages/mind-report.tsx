import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  AlertTriangle,
  RefreshCw,
  Lightbulb,
  BarChart3,
  Shield,
} from "lucide-react";

interface MindReportData {
  id: string;
  weekStart: string;
  createdAt: string;
  reportData: {
    weekStart: string;
    weekEnd: string;
    totalTrades: number;
    closedTrades: number;
    winningTrades: number;
    losingTrades: number;
    totalPnl: number;
    winRate: number;
    avgWin: number;
    avgLoss: number;
    riskRewardRatio: number;
    avgDiscipline: number;
    emotionCounts: Record<string, number>;
    fomoTrades: number;
    revengeTrades: number;
    highSeverityEvents: number;
    mediumSeverityEvents: number;
    insights: string[];
  };
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
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
          <div
            className={`w-9 h-9 rounded-md ${color} flex items-center justify-center flex-shrink-0`}
          >
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

function EmotionChart({ emotionCounts }: { emotionCounts: Record<string, number> }) {
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
    <div className="space-y-3">
      {Object.entries(emotionCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([emotion, count]) => (
          <div key={emotion}>
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-xs capitalize">
                {emotionLabels[emotion] || emotion}
              </span>
              <span className="text-xs text-muted-foreground">
                {count} ({Math.round((count / total) * 100)}%)
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${emotionColors[emotion] || "bg-muted-foreground"}`}
                style={{ width: `${(count / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      {Object.keys(emotionCounts).length === 0 && (
        <p className="text-sm text-center text-muted-foreground py-4">
          No emotion data this week
        </p>
      )}
    </div>
  );
}

export default function MindReport() {
  const {
    data: report,
    isLoading,
    refetch,
    isFetching,
  } = useQuery<MindReportData>({
    queryKey: ["/api/mind-report"],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const r = report?.reportData;

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Weekly Mind Report
          </h2>
          <p className="text-sm text-muted-foreground">
            {r
              ? `${new Date(r.weekStart).toLocaleDateString()} — ${new Date(r.weekEnd).toLocaleDateString()}`
              : "No data yet"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          data-testid="button-refresh-report"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${isFetching ? "animate-spin" : ""}`} />
          Regenerate
        </Button>
      </div>

      {!r ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No report data available yet. Start trading to see your weekly
              mind report.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total P&L"
              value={`${r.totalPnl >= 0 ? "+" : ""}$${r.totalPnl.toFixed(2)}`}
              subtitle={`${r.closedTrades} closed trades`}
              icon={r.totalPnl >= 0 ? TrendingUp : TrendingDown}
              color={r.totalPnl >= 0 ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"}
            />
            <StatCard
              title="Win Rate"
              value={`${r.winRate}%`}
              subtitle={`${r.winningTrades}W / ${r.losingTrades}L`}
              icon={Target}
              color={r.winRate >= 50 ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"}
            />
            <StatCard
              title="Risk:Reward"
              value={r.riskRewardRatio > 0 ? `1:${r.riskRewardRatio}` : "N/A"}
              subtitle={`Avg Win $${r.avgWin.toFixed(2)} / Loss $${r.avgLoss.toFixed(2)}`}
              icon={BarChart3}
              color={
                r.riskRewardRatio >= 2
                  ? "bg-gain/10 text-gain"
                  : r.riskRewardRatio >= 1
                    ? "bg-chart-4/10 text-chart-4"
                    : "bg-loss/10 text-loss"
              }
            />
            <StatCard
              title="Discipline"
              value={r.avgDiscipline > 0 ? `${r.avgDiscipline}/100` : "N/A"}
              subtitle={
                r.avgDiscipline >= 70
                  ? "Strong discipline"
                  : r.avgDiscipline >= 40
                    ? "Needs improvement"
                    : r.avgDiscipline > 0
                      ? "Critical — review plan"
                      : "No data yet"
              }
              icon={Shield}
              color={
                r.avgDiscipline >= 70
                  ? "bg-gain/10 text-gain"
                  : r.avgDiscipline >= 40
                    ? "bg-chart-4/10 text-chart-4"
                    : "bg-loss/10 text-loss"
              }
            />
          </div>

          {/* Behavioral flags + Emotion breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-chart-4" />
                  Behavioral Flags
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-chart-5" />
                      <span className="text-sm">FOMO Entries</span>
                    </div>
                    <Badge
                      variant={r.fomoTrades > 0 ? "destructive" : "secondary"}
                    >
                      {r.fomoTrades}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-loss" />
                      <span className="text-sm">Revenge Trades</span>
                    </div>
                    <Badge
                      variant={r.revengeTrades > 0 ? "destructive" : "secondary"}
                    >
                      {r.revengeTrades}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-loss" />
                      <span className="text-sm">High Severity Alerts</span>
                    </div>
                    <Badge
                      variant={
                        r.highSeverityEvents > 0 ? "destructive" : "secondary"
                      }
                    >
                      {r.highSeverityEvents}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-chart-4" />
                      <span className="text-sm">Medium Severity Alerts</span>
                    </div>
                    <Badge variant="secondary">{r.mediumSeverityEvents}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  <Brain className="w-4 h-4 text-primary" />
                  Emotion Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <EmotionChart emotionCounts={r.emotionCounts} />
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                <Lightbulb className="w-4 h-4 text-chart-4" />
                AI Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                {r.insights.map((insight, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2 rounded-md bg-muted/50"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-chart-4 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
