import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkline } from "@/components/sparkline";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Bitcoin,
  Globe,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import type { WatchlistItem } from "@shared/schema";

function MarketCard({ item }: { item: WatchlistItem }) {
  const isPositive = item.changePercent >= 0;
  const priceChange = item.currentPrice - item.previousClose;

  return (
    <Card className="hover-elevate" data-testid={`market-card-${item.ticker}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-1 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold">{item.ticker}</h3>
              <Badge variant="secondary" className="text-[10px]">
                {item.marketType}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.name}</p>
          </div>
          <div className={`flex items-center gap-0.5 flex-shrink-0 ${isPositive ? "text-gain" : "text-loss"}`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span className="text-xs font-medium">{isPositive ? "+" : ""}{item.changePercent.toFixed(2)}%</span>
          </div>
        </div>

        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-xl font-bold font-mono tracking-tight">
              ${item.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className={`text-xs font-mono mt-0.5 ${isPositive ? "text-gain" : "text-loss"}`}>
              {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}
            </p>
          </div>
          <Sparkline
            data={item.sparklineData as number[] || []}
            positive={isPositive}
            width={90}
            height={32}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t">
          <div>
            <p className="text-[10px] text-muted-foreground">Volume</p>
            <p className="text-xs font-mono font-medium">{formatNumber(item.volume)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">24h High</p>
            <p className="text-xs font-mono font-medium">${item.high24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">24h Low</p>
            <p className="text-xs font-mono font-medium">${item.low24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return num.toFixed(0);
}

function MarketOverview({ items }: { items: WatchlistItem[] }) {
  const gainers = items.filter(i => i.changePercent > 0).length;
  const losers = items.filter(i => i.changePercent < 0).length;
  const totalVolume = items.reduce((sum, i) => sum + i.volume, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Assets</p>
            <p className="text-lg font-bold" data-testid="text-total-assets">{items.length}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-gain/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-gain" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Gainers</p>
            <p className="text-lg font-bold text-gain" data-testid="text-gainers">{gainers}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-loss/10 flex items-center justify-center flex-shrink-0">
            <TrendingDown className="w-4 h-4 text-loss" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Losers</p>
            <p className="text-lg font-bold text-loss" data-testid="text-losers">{losers}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Volume</p>
            <p className="text-lg font-bold" data-testid="text-volume">{formatNumber(totalVolume)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Markets() {
  const { data: watchlist, isLoading } = useQuery<WatchlistItem[]>({
    queryKey: ["/api/watchlist"],
  });
  const { toast } = useToast();

  const refreshMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/refresh/market"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      toast({ title: "Market data refreshed", description: "Live prices updated from all sources" });
    },
    onError: (err: Error) => {
      toast({ title: "Refresh failed", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-12 w-full" /></CardContent></Card>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-40 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  const stocks = watchlist?.filter(i => i.marketType === "stock") || [];
  const crypto = watchlist?.filter(i => i.marketType === "crypto") || [];
  const forex = watchlist?.filter(i => i.marketType === "forex") || [];

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold mb-1">Market Feeds</h2>
          <p className="text-sm text-muted-foreground">Real-time price data, volume analysis, and technical indicators</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending}
          data-testid="button-refresh-market"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshMutation.isPending ? "animate-spin" : ""}`} />
          {refreshMutation.isPending ? "Refreshing..." : "Refresh Live Data"}
        </Button>
      </div>

      <MarketOverview items={watchlist || []} />

      <Tabs defaultValue="all" data-testid="tabs-markets">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">All Markets</TabsTrigger>
          <TabsTrigger value="stocks" data-testid="tab-stocks">
            <DollarSign className="w-3 h-3 mr-1" />
            Stocks
          </TabsTrigger>
          <TabsTrigger value="crypto" data-testid="tab-crypto">
            <Bitcoin className="w-3 h-3 mr-1" />
            Crypto
          </TabsTrigger>
          <TabsTrigger value="forex" data-testid="tab-forex">
            <Globe className="w-3 h-3 mr-1" />
            Forex
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(watchlist || []).map((item) => (
              <MarketCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="stocks" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stocks.map((item) => <MarketCard key={item.id} item={item} />)}
          </div>
        </TabsContent>
        <TabsContent value="crypto" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {crypto.map((item) => <MarketCard key={item.id} item={item} />)}
          </div>
        </TabsContent>
        <TabsContent value="forex" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {forex.map((item) => <MarketCard key={item.id} item={item} />)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
