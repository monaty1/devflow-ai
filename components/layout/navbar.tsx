"use client";

import { useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles, Github, Wrench, BookOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LocaleToggle } from "@/components/shared/locale-toggle";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();

  const navLinks: { href: string; label: string; icon: LucideIcon }[] = [
    { href: "/tools", label: t("nav.tools"), icon: Wrench },
    { href: "/docs", label: t("nav.docs"), icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Skip to content — WCAG AAA */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
      >
        {t("nav.skipToContent")}
      </a>

      <nav className="container mx-auto flex h-16 items-center px-4" aria-label="Main navigation">
        {/* Logo */}
        <NextLink
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-md"
        >
          <Sparkles className="size-6 text-primary" />
          <span>DevFlow AI</span>
        </NextLink>

        {/* Desktop Navigation — centered with animated underline */}
        <div className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <NextLink
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative inline-flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-md",
                  "after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:rounded-full after:bg-primary after:transition-all after:duration-300",
                  isActive
                    ? "text-foreground after:w-3/4"
                    : "text-muted-foreground hover:text-foreground after:w-0 hover:after:w-1/2"
                )}
              >
                <link.icon className="size-4" />
                {link.label}
              </NextLink>
            );
          })}
        </div>

        {/* Desktop CTA + Toggles */}
        <div className="hidden items-center gap-1 md:flex">
          <LocaleToggle />
          <ThemeToggle />
          <NextLink
            href="https://github.com/albertoguinda/devflow-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label="GitHub"
          >
            <Github className="size-5" />
          </NextLink>
          <NextLink
            href="/tools"
            className="ml-2 inline-flex h-9 min-w-[170px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Wrench className="size-4" />
            {t("nav.openDashboard")}
          </NextLink>
        </div>

        {/* Mobile Menu Button — min 44px touch target (WCAG 2.2 AA) */}
        <button
          type="button"
          className="ml-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label={t("nav.toggleMenu")}
        >
          {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div id="mobile-menu" className="border-t border-border bg-background md:hidden">
          <div className="container mx-auto space-y-1 px-4 py-4">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    isActive
                      ? "border-l-3 border-primary bg-primary/10 text-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <link.icon className="size-5" />
                  {link.label}
                </NextLink>
              );
            })}
            <div className="flex items-center gap-2 border-t border-border pt-4">
              <LocaleToggle />
              <ThemeToggle />
              <NextLink
                href="https://github.com/albertoguinda/devflow-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-label="GitHub"
              >
                <Github className="size-5" />
              </NextLink>
            </div>
            <div>
              <NextLink
                href="/tools"
                onClick={() => setIsMenuOpen(false)}
                className="flex h-11 w-full min-w-[170px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Wrench className="size-4" />
                {t("nav.openDashboard")}
              </NextLink>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
