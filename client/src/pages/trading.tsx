import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Clock,
  AlertTriangle,
  Brain,
  X,
} from "lucide-react";
import type { Trade, WatchlistItem } from "@shared/schema";

const emotions = [
  { value: "calm", label: "Calm & Focused" },
  { value: "confident", label: "Confident" },
  { value: "anxious", label: "Anxious" },
  { value: "excited", label: "Excited/FOMO" },
  { value: "fearful", label: "Fearful" },
  { value: "revenge", label: "Revenge Trading" },
];

function EmotionGate({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  const [countdown, setCountdown] = useState(8);
  const [confirmed, setConfirmed] = useState(false);

  useState(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setConfirmed(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  });

  return (
    <div className="space-y-4 p-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-chart-4/10 flex items-center justify-center flex-shrink-0">
          <Brain className="w-5 h-5 text-chart-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold">Psychological Check-In</h3>
          <p className="text-xs text-muted-foreground">Take a moment to evaluate your mental state</p>
        </div>
      </div>

      <div className="bg-muted rounded-md p-4">
        <p className="text-sm text-center">
          {countdown > 0
            ? "Breathe. Reflect on your reasoning. Is this trade part of your strategy?"
            : "You may now proceed with your trade."}
        </p>
        <div className="mt-3">
          <Progress value={((8 - countdown) / 8) * 100} className="h-1" />
          <p className="text-xs text-center text-muted-foreground mt-1">
            {countdown > 0 ? `${countdown}s remaining` : "Ready"}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
          data-testid="button-cancel-gate"
        >
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={!confirmed}
          className="flex-1"
          data-testid="button-confirm-gate"
        >
          <TrendingUp className="w-4 h-4 mr-1" />
          Proceed
        </Button>
      </div>
    </div>
  );
}

function NewTradeDialog() {
  const [open, setOpen] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [ticker, setTicker] = useState("");
  const [direction, setDirection] = useState("long");
  const [quantity, setQuantity] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [emotion, setEmotion] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const { data: watchlist } = useQuery<WatchlistItem[]>({
    queryKey: ["/api/watchlist"],
  });

  const createTrade = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/trades", {
        ticker,
        marketType: watchlist?.find(w => w.ticker === ticker)?.marketType || "stock",
        direction,
        entryPrice: parseFloat(entryPrice),
        quantity: parseFloat(quantity),
        emotionBefore: emotion,
        notes: notes || undefined,
        status: "open",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
      toast({ title: "Trade opened", description: `${direction.toUpperCase()} ${ticker} at $${entryPrice}` });
      setOpen(false);
      resetForm();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setTicker("");
    setDirection("long");
    setQuantity("");
    setEntryPrice("");
    setEmotion("");
    setNotes("");
    setShowGate(false);
  };

  const handleSubmitAttempt = () => {
    if (!ticker || !quantity || !entryPrice || !emotion) {
      toast({ title: "Missing fields", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setShowGate(true);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button data-testid="button-new-trade">
          <Plus className="w-4 h-4 mr-1" />
          New Paper Trade
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Open Paper Trade</DialogTitle>
          <DialogDescription>Enter trade details. An 8-second check-in will follow.</DialogDescription>
        </DialogHeader>

        {showGate ? (
          <EmotionGate
            onConfirm={() => createTrade.mutate()}
            onCancel={() => setShowGate(false)}
          />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ticker</Label>
                <Select value={ticker} onValueChange={setTicker}>
                  <SelectTrigger data-testid="select-ticker">
                    <SelectValue placeholder="Select ticker" />
                  </SelectTrigger>
                  <SelectContent>
                    {(watchlist || []).map((item) => (
                      <SelectItem key={item.ticker} value={item.ticker}>{item.ticker}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Direction</Label>
                <Select value={direction} onValueChange={setDirection}>
                  <SelectTrigger data-testid="select-direction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="long">Long</SelectItem>
                    <SelectItem value="short">Short</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Entry Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  placeholder="0.00"
                  data-testid="input-entry-price"
                />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  data-testid="input-quantity"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Pre-Trade Emotion</Label>
              <Select value={emotion} onValueChange={setEmotion}>
                <SelectTrigger data-testid="select-emotion">
                  <SelectValue placeholder="How are you feeling?" />
                </SelectTrigger>
                <SelectContent>
                  {emotions.map((e) => (
                    <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(emotion === "revenge" || emotion === "excited") && (
                <div className="flex items-center gap-2 p-2 bg-loss/5 rounded-md border border-loss/20">
                  <AlertTriangle className="w-4 h-4 text-loss flex-shrink-0" />
                  <p className="text-xs text-loss">
                    {emotion === "revenge"
                      ? "Revenge trading detected. Consider stepping away."
                      : "FOMO detected. Make sure this aligns with your strategy."}
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Trade rationale, strategy notes..."
                className="resize-none"
                data-testid="input-notes"
              />
            </div>
            <DialogFooter>
              <Button
                onClick={handleSubmitAttempt}
                disabled={createTrade.isPending}
                data-testid="button-submit-trade"
              >
                Continue to Check-In
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CloseTradeDialog({ trade }: { trade: Trade }) {
  const [open, setOpen] = useState(false);
  const [exitPrice, setExitPrice] = useState("");
  const [emotionAfter, setEmotionAfter] = useState("");
  const [disciplineScore, setDisciplineScore] = useState("");
  const { toast } = useToast();

  const closeTrade = useMutation({
    mutationFn: async () => {
      const exit = parseFloat(exitPrice);
      const pnl = trade.direction === "long"
        ? (exit - trade.entryPrice) * trade.quantity
        : (trade.entryPrice - exit) * trade.quantity;

      const res = await apiRequest("PATCH", `/api/trades/${trade.id}`, {
        exitPrice: exit,
        pnl,
        emotionAfter,
        disciplineScore: parseInt(disciplineScore) || 50,
        status: "closed",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
      toast({ title: "Trade closed", description: `${trade.ticker} position closed` });
      setOpen(false);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" data-testid={`button-close-trade-${trade.id}`}>
          Close
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close Trade - {trade.ticker}</DialogTitle>
          <DialogDescription>Enter exit details to close this position.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Exit Price ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
              placeholder="0.00"
              data-testid="input-exit-price"
            />
          </div>
          <div className="space-y-2">
            <Label>Post-Trade Emotion</Label>
            <Select value={emotionAfter} onValueChange={setEmotionAfter}>
              <SelectTrigger data-testid="select-emotion-after">
                <SelectValue placeholder="How do you feel now?" />
              </SelectTrigger>
              <SelectContent>
                {emotions.map((e) => (
                  <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Discipline Score (0-100)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={disciplineScore}
              onChange={(e) => setDisciplineScore(e.target.value)}
              placeholder="How well did you follow your plan?"
              data-testid="input-discipline"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => closeTrade.mutate()}
              disabled={closeTrade.isPending || !exitPrice}
              data-testid="button-confirm-close"
            >
              Close Position
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Trading() {
  const { data: trades, isLoading } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </div>
    );
  }

  const openTrades = trades?.filter(t => t.status === "open") || [];
  const closedTrades = trades?.filter(t => t.status === "closed") || [];
  const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h2 className="text-lg font-bold mb-1">Paper Trading</h2>
          <p className="text-sm text-muted-foreground">Risk-free trading with emotion-gated entry</p>
        </div>
        <NewTradeDialog />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Open Positions</p>
              <p className="text-lg font-bold" data-testid="text-open-trades">{openTrades.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${totalPnl >= 0 ? "bg-gain/10" : "bg-loss/10"}`}>
              {totalPnl >= 0 ? <TrendingUp className="w-4 h-4 text-gain" /> : <TrendingDown className="w-4 h-4 text-loss" />}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total P&L</p>
              <p className={`text-lg font-bold ${totalPnl >= 0 ? "text-gain" : "text-loss"}`} data-testid="text-total-pnl">
                {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Closed Trades</p>
              <p className="text-lg font-bold" data-testid="text-closed-trades">{closedTrades.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {openTrades.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3">Open Positions</h3>
          <div className="space-y-3">
            {openTrades.map((trade) => (
              <Card key={trade.id} data-testid={`open-trade-${trade.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                        trade.direction === "long" ? "bg-gain/10" : "bg-loss/10"
                      }`}>
                        {trade.direction === "long" ? (
                          <TrendingUp className="w-4 h-4 text-gain" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-loss" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{trade.ticker}</p>
                        <p className="text-xs text-muted-foreground capitalize">{trade.direction} x {trade.quantity}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{trade.marketType}</Badge>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-mono">Entry: ${trade.entryPrice.toFixed(2)}</p>
                        {trade.emotionBefore && (
                          <p className="text-xs text-muted-foreground capitalize">Mood: {trade.emotionBefore}</p>
                        )}
                      </div>
                      <CloseTradeDialog trade={trade} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold mb-3">Trade History</h3>
        {closedTrades.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No closed trades yet</p>
              <p className="text-xs text-muted-foreground mt-1">Your trade history will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {closedTrades.map((trade) => (
              <Card key={trade.id} data-testid={`closed-trade-${trade.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                        (trade.pnl || 0) >= 0 ? "bg-gain/10" : "bg-loss/10"
                      }`}>
                        {(trade.pnl || 0) >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-gain" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-loss" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{trade.ticker}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {trade.direction} x {trade.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className={`text-sm font-mono font-medium ${(trade.pnl || 0) >= 0 ? "text-gain" : "text-loss"}`}>
                          {(trade.pnl || 0) >= 0 ? "+" : ""}${(trade.pnl || 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${trade.entryPrice.toFixed(2)} → ${(trade.exitPrice || 0).toFixed(2)}
                        </p>
                      </div>
                      {trade.disciplineScore !== null && trade.disciplineScore !== undefined && (
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Discipline</p>
                          <p className={`text-sm font-bold ${
                            trade.disciplineScore >= 70 ? "text-gain" : trade.disciplineScore >= 40 ? "text-chart-4" : "text-loss"
                          }`}>
                            {trade.disciplineScore}/100
                          </p>
                        </div>
                      )}
                    </div>
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
