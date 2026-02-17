import { cookies } from "next/headers";
import en from "@/locales/en.json";
import es from "@/locales/es.json";

const TRANSLATIONS: Record<string, Record<string, string>> = { en, es };

const SUPPORTED_LOCALES = new Set(["en", "es"]);

/**
 * Read the user's locale from the cookie set by the client.
 * Falls back to "en" if unset or invalid.
 */
export async function getServerLocale(): Promise<string> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("devflow-locale")?.value;
  return raw && SUPPORTED_LOCALES.has(raw) ? raw : "en";
}

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
