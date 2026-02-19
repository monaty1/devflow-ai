"use client";

import { useState, useSyncExternalStore } from "react";
import { Card, Button, Select, Label, ListBox } from "@heroui/react";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { useLocaleStore } from "@/lib/stores/locale-store";
import { Sun, Moon, Monitor } from "lucide-react";

interface Settings {
  notifications: boolean;
}

function getInitialSettings(): Settings {
  if (typeof window === "undefined") {
    return { notifications: true };
  }
  try {
    const stored = localStorage.getItem("devflow-settings");
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, unknown>;
      return {
        notifications: (parsed["notifications"] as boolean | undefined) ?? true,
      };
    }
  } catch {
    // Ignore parse errors
  }
  return { notifications: true };
}

export default function SettingsPage() {
  const { addToast } = useToast();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [settings, setSettings] = useState<Settings>(() => getInitialSettings());

  const handleSave = () => {
    localStorage.setItem("devflow-settings", JSON.stringify(settings));
    addToast(t("settings.saved"), "success");
  };

  const handleClearData = () => {
    const keys = [
      "devflow-prompt-history",
      "devflow-favorites",
      "devflow-context-windows",
    ];
    keys.forEach((key) => localStorage.removeItem(key));
    addToast(t("settings.cleared"), "info");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t("settings.title")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("settings.subtitle")}
        </p>
      </div>

      {/* Preferences */}
      <Card className="p-6">
        <h2 className="mb-6 text-lg font-semibold">{t("settings.preferences")}</h2>
        <div className="space-y-6">
          {/* Theme */}
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">
              {t("settings.theme")}
            </label>
            <div className="flex gap-3">
              {(["light", "dark", "system"] as const).map((themeOption) => (
                <button
                  key={themeOption}
                  type="button"
                  onClick={() => setTheme(themeOption)}
                  className={`flex-1 rounded-lg border-2 p-3 text-sm font-medium capitalize transition-colors ${
                    mounted && theme === themeOption
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      : "border-border text-muted-foreground hover:border-muted-foreground/50"
                  }`}
                >
                  {themeOption === "light" ? <Sun className="mr-1 inline size-4" /> : themeOption === "dark" ? <Moon className="mr-1 inline size-4" /> : <Monitor className="mr-1 inline size-4" />}{" "}
                  {t(`settings.${themeOption}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <p id="notifications-label" className="text-sm font-medium text-foreground">
                {t("settings.notifications")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("settings.notificationsDesc")}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.notifications}
              aria-labelledby="notifications-label"
              onClick={() =>
                setSettings({ ...settings, notifications: !settings.notifications })
              }
              className={`relative h-6 w-11 rounded-full transition-colors ${
                settings.notifications ? "bg-blue-500" : "bg-muted"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
                  settings.notifications ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>

          {/* Language */}
          <div>
            <Select
              value={locale}
              onChange={(value) => { if (value) setLocale(value as "en" | "es"); }}
              className="w-full"
              aria-label={t("settings.language")}
            >
              <Label className="mb-2 block text-sm font-medium text-muted-foreground">
                {t("settings.language")}
              </Label>
              <Select.Trigger className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="en" textValue="English">English<ListBox.ItemIndicator /></ListBox.Item>
                  <ListBox.Item id="es" textValue="Español">Español<ListBox.ItemIndicator /></ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          <Button onPress={handleSave} className="w-full">
            {t("settings.save")}
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 p-6 dark:border-red-900/50">
        <h2 className="mb-4 text-lg font-semibold text-red-600 dark:text-red-400">
          {t("settings.dangerZone")}
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {t("settings.dangerDesc")}
        </p>
        <Button variant="outline" onPress={handleClearData} className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20">
          {t("settings.clearAll")}
        </Button>
      </Card>
    </div>
  );
}
