"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@heroui/react";
import { Download, X } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && localStorage.getItem("devflow-pwa-dismissed") === "true",
  );

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration failed silently — app works fine without it
      });
    }
  }, []);

  useEffect(() => {
    if (dismissed) return;

    function handler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [dismissed]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    setDeferredPrompt(null);
    localStorage.setItem("devflow-pwa-dismissed", "true");
  }, []);

  if (!deferredPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-xl border border-border bg-card p-4 shadow-lg sm:left-auto sm:right-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Download className="size-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {t("pwa.installTitle")}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("pwa.installDescription")}
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="primary" onPress={handleInstall}>
              {t("pwa.install")}
            </Button>
            <Button size="sm" variant="ghost" onPress={handleDismiss}>
              {t("pwa.notNow")}
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground"
          aria-label={t("common.close")}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
