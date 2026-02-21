"use client";

import { useLocaleStore } from "@/lib/stores/locale-store";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui";

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
      <Button
        variant="ghost"
        size="sm"
        onPress={() => setLocale(locale === "en" ? "es" : "en")}
        className="gap-3 px-4 py-2.5 text-sm font-medium w-full justify-start"
        aria-label={t("sidebar.switchLocale")}
      >
        {locale === "en" ? (
          <SpainFlag className="size-5 rounded-sm" />
        ) : (
          <USFlag className="size-5 rounded-sm" />
        )}
        {locale === "en" ? "Español" : "English"}
      </Button>
    );
  }

  return (
    <Button
      isIconOnly
      variant="ghost"
      size="sm"
      onPress={() => setLocale(locale === "en" ? "es" : "en")}
      aria-label={t("sidebar.switchLocale")}
    >
      {locale === "en" ? (
        <SpainFlag className="size-5 rounded-sm" />
      ) : (
        <USFlag className="size-5 rounded-sm" />
      )}
    </Button>
  );
}
