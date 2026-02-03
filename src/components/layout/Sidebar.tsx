import { Link, useLocation } from "react-router-dom";
import {
  Inbox,
  Sparkles,
  Zap,
  Globe,
  Settings,
  User,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { to: "/dashboard", label: "Inbox", icon: Inbox },
  { to: "/dashboard/skills", label: "Skills", icon: Sparkles },
  { to: "/dashboard/automations", label: "Automations", icon: Zap },
  { to: "/dashboard/web-agent", label: "Web Agent Runs", icon: Globe },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
  { to: "/dashboard/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const location = useLocation();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 border-r border-border bg-background">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link to="/dashboard" className="font-semibold text-primary">
          ClawCloud
        </Link>
      </div>
      <div className="px-2 py-4">
        <Button
          variant="ghost"
          className="w-full justify-between text-muted-foreground"
          onClick={() => setWorkspaceOpen(!workspaceOpen)}
        >
          <span>Workspace</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-8rem)] px-2">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
