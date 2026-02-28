import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Bell,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Volume2,
  Brain,
  BarChart3,
  Zap,
} from "lucide-react";
import type { Alert, AlertCondition, WatchlistItem } from "@shared/schema";

const conditionTypes: { value: AlertCondition["type"]; label: string; icon: React.ElementType }[] = [
  { value: "price_above", label: "Price Above", icon: TrendingUp },
  { value: "price_below", label: "Price Below", icon: TrendingDown },
  { value: "volume_spike", label: "Volume Spike", icon: Volume2 },
  { value: "sentiment_shift", label: "Sentiment Shift", icon: Brain },
  { value: "rsi_overbought", label: "RSI Overbought", icon: BarChart3 },
  { value: "rsi_oversold", label: "RSI Oversold", icon: BarChart3 },
];

function NewAlertDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [channel, setChannel] = useState("app");
  const [conditions, setConditions] = useState<AlertCondition[]>([
    { type: "price_above", value: 0, operator: "and" },
  ]);
  const { toast } = useToast();

  const { data: watchlist } = useQuery<WatchlistItem[]>({
    queryKey: ["/api/watchlist"],
  });

  const createAlert = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/alerts", {
        name,
        ticker,
        marketType: watchlist?.find(w => w.ticker === ticker)?.marketType || "stock",
        conditions,
        channel,
        isActive: true,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({ title: "Alert created", description: `${name} alert for ${ticker}` });
      setOpen(false);
      resetForm();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setName("");
    setTicker("");
    setChannel("app");
    setConditions([{ type: "price_above", value: 0, operator: "and" }]);
  };

  const addCondition = () => {
    setConditions([...conditions, { type: "price_above", value: 0, operator: "and" }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, updates: Partial<AlertCondition>) => {
    setConditions(conditions.map((c, i) => (i === index ? { ...c, ...updates } : c)));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button data-testid="button-new-alert">
          <Plus className="w-4 h-4 mr-1" />
          New Alert
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Smart Alert</DialogTitle>
          <DialogDescription>Set up multi-condition triggers for your watchlist.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Alert Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My alert"
                data-testid="input-alert-name"
              />
            </div>
            <div className="space-y-2">
              <Label>Ticker</Label>
              <Select value={ticker} onValueChange={setTicker}>
                <SelectTrigger data-testid="select-alert-ticker">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {(watchlist || []).map((item) => (
                    <SelectItem key={item.ticker} value={item.ticker}>{item.ticker}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Channel</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger data-testid="select-channel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="app">In-App</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="discord">Discord</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-1">
              <Label>Conditions</Label>
              <Button variant="secondary" size="sm" onClick={addCondition} data-testid="button-add-condition">
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
            {conditions.map((condition, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && (
                  <Select
                    value={condition.operator}
                    onValueChange={(v) => updateCondition(index, { operator: v as "and" | "or" })}
                  >
                    <SelectTrigger className="w-16" data-testid={`select-operator-${index}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="and">AND</SelectItem>
                      <SelectItem value="or">OR</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <Select
                  value={condition.type}
                  onValueChange={(v) => updateCondition(index, { type: v as AlertCondition["type"] })}
                >
                  <SelectTrigger className="flex-1" data-testid={`select-condition-type-${index}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionTypes.map((ct) => (
                      <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  step="0.01"
                  value={condition.value || ""}
                  onChange={(e) => updateCondition(index, { value: parseFloat(e.target.value) || 0 })}
                  placeholder="Value"
                  className="w-24"
                  data-testid={`input-condition-value-${index}`}
                />
                {conditions.length > 1 && (
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => removeCondition(index)}
                    data-testid={`button-remove-condition-${index}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              onClick={() => createAlert.mutate()}
              disabled={createAlert.isPending || !name || !ticker}
              data-testid="button-create-alert"
            >
              Create Alert
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AlertCard({ alert }: { alert: Alert }) {
  const { toast } = useToast();

  const toggleAlert = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/alerts/${alert.id}`, {
        isActive: !alert.isActive,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
  });

  const deleteAlert = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/alerts/${alert.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({ title: "Alert deleted" });
    },
  });

  const conditions = alert.conditions as AlertCondition[];

  return (
    <Card className={`hover-elevate ${!alert.isActive ? "opacity-60" : ""}`} data-testid={`alert-card-${alert.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-1 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold truncate">{alert.name}</h3>
              <p className="text-xs text-muted-foreground">{alert.ticker}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Switch
              checked={alert.isActive}
              onCheckedChange={() => toggleAlert.mutate()}
              data-testid={`switch-alert-${alert.id}`}
            />
          </div>
        </div>

        <div className="space-y-1.5 mb-3">
          {conditions.map((condition, index) => {
            const ct = conditionTypes.find(c => c.value === condition.type);
            return (
              <div key={index} className="flex items-center gap-1.5">
                {index > 0 && (
                  <Badge variant="secondary" className="text-[10px]">{condition.operator.toUpperCase()}</Badge>
                )}
                <span className="text-xs">{ct?.label || condition.type}</span>
                <span className="text-xs font-mono font-medium">{condition.value}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-1 pt-3 border-t">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-[10px]">{alert.marketType}</Badge>
            <Badge variant="secondary" className="text-[10px] capitalize">{alert.channel}</Badge>
            {alert.triggeredCount > 0 && (
              <span className="text-[10px] text-muted-foreground">
                Triggered {alert.triggeredCount}x
              </span>
            )}
          </div>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => deleteAlert.mutate()}
            data-testid={`button-delete-alert-${alert.id}`}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Alerts() {
  const { data: alerts, isLoading } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-12 w-full" /></CardContent></Card>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-32 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  const activeAlerts = alerts?.filter(a => a.isActive).length || 0;
  const totalTriggers = alerts?.reduce((sum, a) => sum + a.triggeredCount, 0) || 0;

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h2 className="text-lg font-bold mb-1">Smart Alert Pipelines</h2>
          <p className="text-sm text-muted-foreground">Configure multi-condition triggers across price, volume, sentiment, and custom indicators</p>
        </div>
        <NewAlertDialog />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Alerts</p>
              <p className="text-lg font-bold" data-testid="text-total-alerts">{alerts?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-gain/10 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-gain" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-lg font-bold text-gain" data-testid="text-active-alerts">{activeAlerts}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-chart-4/10 flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-4 h-4 text-chart-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Triggers</p>
              <p className="text-lg font-bold" data-testid="text-total-triggers">{totalTriggers}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(alerts || []).map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
        {(!alerts || alerts.length === 0) && (
          <div className="col-span-full text-center py-16">
            <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No alerts configured</p>
            <p className="text-xs text-muted-foreground mt-1">Create your first smart alert to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
