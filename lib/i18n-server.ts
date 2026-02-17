import en from "@/locales/en.json";
import es from "@/locales/es.json";

const TRANSLATIONS: Record<string, Record<string, string>> = { en, es };

/**
 * Server-side translation helper.
 * Defaults to English — client hydration swaps to user locale via Zustand.
 */
export function t(
  key: string,
  locale: string = "en",
  params?: Record<string, string | number>,
): string {
  const dict = TRANSLATIONS[locale] ?? TRANSLATIONS["en"]!;
  let value = dict[key] ?? TRANSLATIONS["en"]![key] ?? key;

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(`{${k}}`, String(v));
    }
  }

  return value;
}
