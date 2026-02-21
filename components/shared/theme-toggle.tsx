"use client";

import { useSyncExternalStore } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui";

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

  if (variant === "compact") {
    return (
      <Button
        isIconOnly
        variant="ghost"
        size="sm"
        onPress={() => setTheme(nextTheme)}
        aria-label={label}
      >
        <Icon className="size-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onPress={() => setTheme(nextTheme)}
      className="gap-3 px-4 py-2.5 text-sm font-medium w-full justify-start"
      aria-label={label}
    >
      <Icon className="size-5" />
      <span className="capitalize">{theme ?? "system"}</span>
    </Button>
  );
}
