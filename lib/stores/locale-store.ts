import { create } from "zustand";
import { persist } from "zustand/middleware";

type Locale = "en" | "es";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "en",
      setLocale: (locale) => {
        document.cookie = `devflow-locale=${locale};path=/;max-age=31536000;SameSite=Lax`;
        set({ locale });
      },
    }),
    {
      name: "devflow-locale",
    },
  ),
);
