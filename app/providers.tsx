"use client";

import { useEffect, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { ThemeProvider } from "next-themes";
import { HeroUIProvider } from "@heroui/system";
import { SWRConfig } from "swr";
import { FavoritesProvider } from "@/lib/context";
import { ToastProvider } from "@/components/shared/toast-container";
import { useLocaleStore } from "@/lib/stores/locale-store";
import { CommandPalette } from "@/components/shared/command-palette";

const InstallPrompt = dynamic(
  () => import("@/components/shared/install-prompt").then((m) => m.InstallPrompt),
  { ssr: false },
);

function HtmlLangSync() {
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}

function ConsoleEasterEgg() {
  useEffect(() => {
    console.log(
      "%c DevFlow AI %c PARA VOSOTROS, DEVELOPERS ",
      "background:#2563eb;color:#fff;font-size:20px;font-weight:bold;padding:8px 12px;border-radius:6px 0 0 6px;",
      "background:#7c3aed;color:#fff;font-size:20px;font-weight:bold;padding:8px 12px;border-radius:0 6px 6px 0;",
    );
    console.log(
      "%cContribute → https://github.com/albertoguinda/devflow-ai",
      "color:#94a3b8;font-size:13px;padding:4px 0;",
    );
  }, []);

  return null;
}

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <HeroUIProvider>
        <SWRConfig value={{ revalidateOnFocus: false, errorRetryCount: 2 }}>
          <FavoritesProvider>
            <ToastProvider>
              <HtmlLangSync />
              <ConsoleEasterEgg />
              <CommandPalette />
              <InstallPrompt />
              {children}
            </ToastProvider>
          </FavoritesProvider>
        </SWRConfig>
      </HeroUIProvider>
    </ThemeProvider>
  );
}
