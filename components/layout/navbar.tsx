"use client";

import { useState } from "react";
import NextLink from "next/link";
import { Button, linkVariants } from "@heroui/react";
import { Menu, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/tools", label: "Tools" },
  { href: "/docs", label: "Docs" },
  { href: "https://github.com/devflowai/devflowai", label: "GitHub", external: true },
] as const;

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const linkStyles = linkVariants();

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
                "text-muted-foreground transition-colors hover:text-foreground"
              )}
              {...("external" in link && link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {link.label}
            </NextLink>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Button size="sm">
            <NextLink href="/dashboard">Open Dashboard</NextLink>
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
                className="block py-2 text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
                {...("external" in link && link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {link.label}
              </NextLink>
            ))}
            <div className="pt-4">
              <Button fullWidth>
                <NextLink href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  Open Dashboard
                </NextLink>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
