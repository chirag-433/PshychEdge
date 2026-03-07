import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Markets from "@/pages/markets";
import Signals from "@/pages/signals";
import Trading from "@/pages/trading";
import Behavior from "@/pages/behavior";
import Alerts from "@/pages/alerts";
import MindReport from "@/pages/mind-report";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useEffect } from "react";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={toggleTheme}
      data-testid="button-theme-toggle"
    >
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/markets" component={Markets} />
      <Route path="/signals" component={Signals} />
      <Route path="/trading" component={Trading} />
      <Route path="/behavior" component={Behavior} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/mind-report" component={MindReport} />
      <Route component={NotFound} />
    </Switch>
  );
}

const sidebarStyle = {
  "--sidebar-width": "14rem",
  "--sidebar-width-icon": "3rem",
};

function AppLayout() {
  const { isConnected, lastMessage } = useWebSocket();
  const { toast } = useToast();

  // Show intervention toasts in real time
  useEffect(() => {
    if (lastMessage?.type === "intervention") {
      toast({
        title: "⚠️ PsychEdge Intervention",
        description: lastMessage.message,
        variant: "destructive",
      });
    }
  }, [lastMessage, toast]);

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-1 p-2 border-b h-11">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-3">
              {/* Live connection indicator */}
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`} />
                <span className="text-xs text-muted-foreground">
                  {isConnected ? "Live" : "Reconnecting..."}
                </span>
              </div>
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-hidden flex flex-col">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AppLayout />
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

