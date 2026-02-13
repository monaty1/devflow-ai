"use client";

import { useState } from "react";
import NextLink from "next/link";
import { linkVariants } from "@heroui/react";
import { Menu, X, Sparkles, Github } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useLocaleStore } from "@/lib/stores/locale-store";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { cn } from "@/lib/utils";

function SpainFlag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 480" aria-hidden="true">
      <path fill="#AA151B" d="M0 0h640v480H0z" />
      <path fill="#F1BF00" d="M0 120h640v240H0z" />
    </svg>
  );
}

function USFlag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 480" aria-hidden="true">
      <path fill="#B22234" d="M0 0h640v480H0z" />
      <path fill="#fff" d="M0 37h640v37H0zm0 74h640v37H0zm0 74h640v37H0zm0 74h640v37H0zm0 74h640v37H0zm0 74h640v37H0z" />
      <path fill="#3C3B6E" d="M0 0h256v259H0z" />
    </svg>
  );
}

function LocaleToggle() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "en" ? "es" : "en")}
      className="inline-flex size-9 items-center justify-center rounded-md transition-colors hover:bg-muted"
      aria-label={`Switch to ${locale === "en" ? "Spanish" : "English"}`}
    >
      {locale === "en" ? (
        <SpainFlag className="size-5 rounded-sm" />
      ) : (
        <USFlag className="size-5 rounded-sm" />
      )}
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
      <nav className="container mx-auto flex h-16 items-center px-4" aria-label="Main navigation">
        {/* Logo */}
        <NextLink
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-foreground"
        >
          <Sparkles className="size-6 text-primary" />
          <span>DevFlow AI</span>
        </NextLink>

        {/* Desktop Navigation — centered */}
        <div className="hidden flex-1 items-center justify-center gap-6 md:flex">
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
          <NextLink
            href="/tools"
            className="ml-2 inline-flex h-8 w-[140px] cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            {t("nav.openDashboard")}
          </NextLink>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="ml-auto inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
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
              <NextLink
                href="/tools"
                onClick={() => setIsMenuOpen(false)}
                className="flex h-10 w-full cursor-pointer items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
              >
                {t("nav.openDashboard")}
              </NextLink>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
