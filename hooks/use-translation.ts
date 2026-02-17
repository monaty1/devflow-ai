"use client";

import { useCallback, useEffect } from "react";
import { useLocaleStore } from "@/lib/stores/locale-store";
import en from "@/locales/en.json";
import es from "@/locales/es.json";

const TRANSLATIONS: Record<string, Record<string, string>> = { en, es };

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);

  // Sync locale to cookie so Server Components can read it
  useEffect(() => {
    document.cookie = `devflow-locale=${locale};path=/;max-age=31536000;SameSite=Lax`;
  }, [locale]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict = TRANSLATIONS[locale] ?? TRANSLATIONS["en"]!;
      let value = dict[key] ?? (TRANSLATIONS["en"]!)[key] ?? key;

      if (params) {
        for (const [k, v] of Object.entries(params)) {
          value = value.replace(`{${k}}`, String(v));
        }
      }

      return value;
    },
    [locale],
  );

  return { t, locale };
}
