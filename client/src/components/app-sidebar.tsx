import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  TrendingUp,
  Brain,
  Bell,
  BarChart3,
  Activity,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Market Feeds", url: "/markets", icon: TrendingUp },
  { title: "AI Signals", url: "/signals", icon: Brain },
  { title: "Paper Trading", url: "/trading", icon: BarChart3 },
  { title: "Behavioral Analysis", url: "/behavior", icon: Activity },
  { title: "Smart Alerts", url: "/alerts", icon: Bell },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">PsychEdge Pro</h1>
              <p className="text-[10px] text-muted-foreground leading-none">Trading Intelligence</p>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    data-active={location === item.url}
                    className="data-[active=true]:bg-sidebar-accent"
                  >
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s/g, '-')}`}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gain animate-pulse-glow" />
          <span className="text-xs text-muted-foreground">Markets Open</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
