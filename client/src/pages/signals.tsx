import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Clock,
  Target,
  Shield,
  Zap,
  RefreshCw,
} from "lucide-react";
import type { AiSignal } from "@shared/schema";

function SignalCard({ signal }: { signal: AiSignal }) {
  const isLong = signal.direction === "long";
  const confidenceColor = signal.confidence >= 0.8 ? "text-gain" : signal.confidence >= 0.6 ? "text-chart-4" : "text-loss";
  const confidenceLabel = signal.confidence >= 0.8 ? "High" : signal.confidence >= 0.6 ? "Medium" : "Low";

  return (
    <Card className="hover-elevate" data-testid={`signal-card-${signal.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-1 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
              isLong ? "bg-gain/10" : "bg-loss/10"
            }`}>
              {isLong ? (
                <TrendingUp className="w-4 h-4 text-gain" />
              ) : (
                <TrendingDown className="w-4 h-4 text-loss" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold">{signal.ticker}</h3>
              <p className="text-xs text-muted-foreground capitalize">{signal.direction} Signal</p>
            </div>
          </div>
          <Badge variant={signal.status === "active" ? "default" : "secondary"} className="text-[10px]">
            {signal.status}
          </Badge>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-xs text-muted-foreground">AI Confidence</span>
            <span className={`text-xs font-medium ${confidenceColor}`}>
              {Math.round(signal.confidence * 100)}% - {confidenceLabel}
            </span>
          </div>
          <Progress value={signal.confidence * 100} className="h-1.5" />
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{signal.reasoning}</p>

        {signal.patternDetected && (
          <div className="flex items-center gap-1 mb-3">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-xs text-primary font-medium">{signal.patternDetected}</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 pt-3 border-t">
          <div className="flex items-center gap-1.5">
            <Target className="w-3 h-3 text-muted-foreground" />
            <div>
              <p className="text-[10px] text-muted-foreground">Entry</p>
              <p className="text-xs font-mono font-medium">${signal.entryPrice.toFixed(2)}</p>
            </div>
          </div>
          {signal.targetPrice && (
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-gain" />
              <div>
                <p className="text-[10px] text-muted-foreground">Target</p>
                <p className="text-xs font-mono font-medium text-gain">${signal.targetPrice.toFixed(2)}</p>
              </div>
            </div>
          )}
          {signal.stopLoss && (
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-loss" />
              <div>
                <p className="text-[10px] text-muted-foreground">Stop Loss</p>
                <p className="text-xs font-mono font-medium text-loss">${signal.stopLoss.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{signal.timeframe} timeframe</span>
          <Badge variant="secondary" className="text-[10px] ml-auto">{signal.marketType}</Badge>
          <Badge variant="secondary" className="text-[10px]">{signal.signalType}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Signals() {
  const { data: signals, isLoading } = useQuery<AiSignal[]>({
    queryKey: ["/api/signals"],
  });
  const { toast } = useToast();

  const refreshMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/refresh/signals"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/signals"] });
      toast({ title: "Signals regenerated", description: "AI models analyzed current market conditions" });
    },
    onError: (err: Error) => {
      toast({ title: "Signal generation failed", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-12 w-full" /></CardContent></Card>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-56 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  const active = signals?.filter(s => s.status === "active") || [];
  const avgConfidence = active.length
    ? active.reduce((sum, s) => sum + s.confidence, 0) / active.length
    : 0;
  const highConfidence = active.filter(s => s.confidence >= 0.8).length;

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold mb-1">AI-Powered Signals</h2>
          <p className="text-sm text-muted-foreground">Machine learning models detecting patterns and generating actionable trade ideas</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending}
          data-testid="button-refresh-signals"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshMutation.isPending ? "animate-spin" : ""}`} />
          {refreshMutation.isPending ? "Generating..." : "Generate New Signals"}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Signals</p>
              <p className="text-lg font-bold" data-testid="text-active-signals">{active.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-gain/10 flex items-center justify-center flex-shrink-0">
              <Target className="w-4 h-4 text-gain" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Confidence</p>
              <p className="text-lg font-bold" data-testid="text-avg-confidence">{Math.round(avgConfidence * 100)}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-chart-4/10 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-chart-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">High Confidence</p>
              <p className="text-lg font-bold" data-testid="text-high-confidence">{highConfidence}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(signals || []).map((signal) => (
          <SignalCard key={signal.id} signal={signal} />
        ))}
        {(!signals || signals.length === 0) && (
          <div className="col-span-full text-center py-16">
            <Brain className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No signals generated yet</p>
            <p className="text-xs text-muted-foreground mt-1">AI models are analyzing market data</p>
          </div>
        )}
      </div>
    </div>
  );
}
