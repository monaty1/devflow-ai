"use client";

import { useLocaleStore } from "@/lib/stores/locale-store";
import { useTranslation } from "@/hooks/use-translation";

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

interface LocaleToggleProps {
  variant?: "icon" | "full";
}

export function LocaleToggle({ variant = "icon" }: LocaleToggleProps) {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const { t } = useTranslation();

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={() => setLocale(locale === "en" ? "es" : "en")}
        className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={t("sidebar.switchLocale")}
      >
        {locale === "en" ? (
          <SpainFlag className="size-5 rounded-sm" />
        ) : (
          <USFlag className="size-5 rounded-sm" />
        )}
        {locale === "en" ? "Español" : "English"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "en" ? "es" : "en")}
      className="inline-flex size-9 items-center justify-center rounded-md transition-colors hover:bg-muted"
      aria-label={t("sidebar.switchLocale")}
    >
      {locale === "en" ? (
        <SpainFlag className="size-5 rounded-sm" />
      ) : (
        <USFlag className="size-5 rounded-sm" />
      )}
    </button>
  );
}
