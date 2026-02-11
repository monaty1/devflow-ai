"use client";

import { useState, useSyncExternalStore } from "react";
import NextLink from "next/link";
import { Button, linkVariants } from "@heroui/react";
import { Menu, X, Sparkles, Sun, Moon, Monitor, Github } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "@/hooks/use-translation";
import { useLocaleStore } from "@/lib/stores/locale-store";
import { cn } from "@/lib/utils";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) {
    return <div className="size-9" />;
  }

  const nextTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  const label = theme === "light" ? "Light mode" : theme === "dark" ? "Dark mode" : "System theme";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={label}
    >
      <Icon className="size-5" />
    </button>
  );
}

function LocaleToggle() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "en" ? "es" : "en")}
      className="inline-flex size-9 items-center justify-center rounded-md text-lg transition-colors hover:bg-muted"
      aria-label={`Switch to ${locale === "en" ? "Spanish" : "English"}`}
    >
      <span role="img" aria-hidden="true">{locale === "en" ? "\u{1F1EA}\u{1F1F8}" : "\u{1F1EC}\u{1F1E7}"}</span>
    </button>
  );
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const linkStyles = linkVariants();
  const { t } = useTranslation();

  const navLinks = [
    { href: "/tools", label: t("nav.tools") },
    { href: "/docs", label: t("nav.docs") },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4" aria-label="Main navigation">
        {/* Logo */}
        <NextLink
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-foreground"
        >
          <Sparkles className="size-6 text-primary" />
          <span>DevFlow AI</span>
        </NextLink>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <NextLink
              key={link.href}
              href={link.href}
              className={cn(
                linkStyles.base(),
                "cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
              )}
            >
              {link.label}
            </NextLink>
          ))}
        </div>

        {/* Desktop CTA + Toggles */}
        <div className="hidden items-center gap-1 md:flex">
          <LocaleToggle />
          <ThemeToggle />
          <NextLink
            href="https://github.com/albertoguinda/devflow-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="GitHub"
          >
            <Github className="size-5" />
          </NextLink>
          <Button size="sm" className="ml-2 w-[140px] cursor-pointer justify-center">
            <NextLink href="/tools">{t("nav.openDashboard")}</NextLink>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div id="mobile-menu" className="border-t border-border bg-background md:hidden">
          <div className="container mx-auto space-y-4 px-4 py-4">
            {navLinks.map((link) => (
              <NextLink
                key={link.href}
                href={link.href}
                className="block cursor-pointer py-2 text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </NextLink>
            ))}
            <div className="flex items-center gap-2 border-t border-border pt-4">
              <LocaleToggle />
              <ThemeToggle />
              <NextLink
                href="https://github.com/albertoguinda/devflow-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="GitHub"
              >
                <Github className="size-5" />
              </NextLink>
            </div>
            <div>
              <Button fullWidth className="cursor-pointer">
                <NextLink href="/tools" onClick={() => setIsMenuOpen(false)}>
                  {t("nav.openDashboard")}
                </NextLink>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
