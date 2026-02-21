"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useLocaleStore } from "@/lib/stores/locale-store";
import { useTranslation } from "@/hooks/use-translation";
import { COMMANDS, type Command } from "@/config/commands";

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLocaleStore();
  const { t } = useTranslation();

  const open = useCallback(() => {
    setIsOpen(true);
    setQuery("");
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setQuery("");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return COMMANDS;
    const q = query.toLowerCase();
    return COMMANDS.filter((cmd) => {
      const label = t(cmd.labelKey).toLowerCase();
      const desc = t(cmd.descriptionKey).toLowerCase();
      return label.includes(q) || desc.includes(q) || cmd.id.includes(q);
    });
  }, [query, t]);

  const executeCommand = useCallback((cmd: Command) => {
    close();
    if (cmd.href) {
      router.push(cmd.href);
      return;
    }
    if (cmd.action === "toggle-theme") {
      setTheme(theme === "dark" ? "light" : "dark");
      return;
    }
    if (cmd.action === "toggle-locale") {
      setLocale(locale === "en" ? "es" : "en");
      return;
    }
  }, [close, router, setTheme, theme, setLocale, locale]);

  return {
    isOpen,
    query,
    filteredCommands,
    open,
    close,
    setQuery,
    executeCommand,
  };
}
