"use client";

import { usePathname } from "next/navigation";
import NextLink from "next/link";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Wrench,
  Heart,
  Clock,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/history", label: "History", icon: Clock },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-border bg-card" aria-label="Dashboard sidebar">
        {/* Logo */}
        <div className="border-b border-border p-6">
          <NextLink
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-foreground"
          >
            <Sparkles className="size-6 text-primary" />
            <span>DevFlow AI</span>
          </NextLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4" aria-label="Dashboard navigation">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <NextLink
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </NextLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <p className="px-4 text-xs text-muted-foreground">
            Free & Open Source
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main id="main-content" className="flex-1 overflow-auto bg-background p-8">{children}</main>
    </div>
  );
}
