"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import Script from "next/script";
import type { ReactNode } from "react";
import {
  Wrench,
  Heart,
  Clock,
  Settings,
  Sparkles,
  Menu,
  X,
  BookOpen,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LocaleToggle } from "@/components/shared/locale-toggle";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // Close sidebar on route change
  useEffect(() => {
    closeSidebar(); // eslint-disable-line react-hooks/set-state-in-effect -- intentional: sync sidebar with route
  }, [pathname, closeSidebar]);

  // Close sidebar on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && sidebarOpen) {
        closeSidebar();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen, closeSidebar]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const NAV_ITEMS = [
    { href: "/tools", label: t("sidebar.tools"), icon: Wrench },
    { href: "/docs", label: t("sidebar.docs"), icon: BookOpen },
    { href: "/favorites", label: t("sidebar.favorites"), icon: Heart },
    { href: "/history", label: t("sidebar.history"), icon: Clock },
    { href: "/settings", label: t("sidebar.settings"), icon: Settings },
  ] as const;

  const sidebarContent = (
    <>
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
      <nav className="flex-1 space-y-1 p-4" aria-label={t("sidebar.navLabel")}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

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
      <div className="space-y-1 border-t border-border p-4">
        <LocaleToggle variant="full" />
        <ThemeToggle variant="full" />
        <p className="px-4 text-xs text-muted-foreground">
          {t("sidebar.freeOpenSource")}
        </p>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar — sticky */}
      <aside
        className="sticky top-0 hidden h-screen w-64 flex-col overflow-y-auto border-r border-border bg-card md:flex"
        aria-label={t("sidebar.sidebarLabel")}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-300 ease-in-out md:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label={t("sidebar.sidebarLabel")}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={closeSidebar}
          className="absolute right-3 top-5 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={t("sidebar.closeSidebar")}
        >
          <X className="size-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-foreground hover:bg-muted"
            aria-expanded={sidebarOpen}
            aria-controls="mobile-sidebar"
            aria-label={t("sidebar.openSidebar")}
          >
            <Menu className="size-5" />
          </button>
          <NextLink
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-foreground"
          >
            <Sparkles className="size-5 text-primary" />
            <span>DevFlow AI</span>
          </NextLink>
        </header>

        {/* Main Content */}
        <main id="main-content" className="flex-1 overflow-auto scroll-pt-4 bg-background p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Speculation Rules — prefetch tool pages for instant navigation (Chromium only) */}
      <Script id="speculation-rules" type="speculationrules" strategy="afterInteractive">
        {JSON.stringify({
          prefetch: [
            { source: "document", where: { href_matches: "/tools/*" } },
          ],
          prerender: [
            {
              source: "list",
              urls: [
                "/tools/json-formatter",
                "/tools/regex-tester",
                "/tools/uuid-generator",
              ],
            },
          ],
        })}
      </Script>
    </div>
  );
}
