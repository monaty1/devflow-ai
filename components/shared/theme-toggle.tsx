"use client";

import { useSyncExternalStore } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

const subscribeNoop = () => () => {};
const getTrue = () => true;
const getFalse = () => false;

interface ThemeToggleProps {
  variant?: "compact" | "full";
}

export function ThemeToggle({ variant = "compact" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const mounted = useSyncExternalStore(subscribeNoop, getTrue, getFalse);

  if (!mounted) {
    return <div className={variant === "compact" ? "size-9" : "h-9"} />;
  }

  const nextTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  const label = theme === "light" ? t("theme.lightMode") : theme === "dark" ? t("theme.darkMode") : t("theme.systemTheme");

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className={cn(
        "inline-flex items-center justify-center rounded-md transition-colors",
        variant === "compact"
          ? "size-9 text-muted-foreground hover:bg-muted hover:text-foreground"
          : "gap-3 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
      aria-label={label}
    >
      <Icon className="size-5" />
      {variant === "full" && <span className="capitalize">{theme ?? "system"}</span>}
    </button>
  );
}
