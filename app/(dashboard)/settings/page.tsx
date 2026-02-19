"use client";

import { useState, useSyncExternalStore } from "react";
import { Card, Button, Select, Label, ListBox } from "@heroui/react";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { useLocaleStore } from "@/lib/stores/locale-store";
import { useAISettingsStore } from "@/lib/stores/ai-settings-store";
import { Sun, Moon, Monitor, Bot, Eye, EyeOff, Trash2 } from "lucide-react";
import type { AIProviderType } from "@/types/ai";

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

const AI_PROVIDERS: { value: AIProviderType; label: string }[] = [
  { value: "gemini", label: "Google Gemini" },
  { value: "groq", label: "Groq" },
];

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
  const [showKey, setShowKey] = useState(false);

  // AI settings
  const isAIEnabled = useAISettingsStore((s) => s.isAIEnabled);
  const setAIEnabled = useAISettingsStore((s) => s.setAIEnabled);
  const byokKey = useAISettingsStore((s) => s.byokKey);
  const setByokKey = useAISettingsStore((s) => s.setByokKey);
  const byokProvider = useAISettingsStore((s) => s.byokProvider);
  const setByokProvider = useAISettingsStore((s) => s.setByokProvider);
  const clearByok = useAISettingsStore((s) => s.clearByok);

  const handleSave = () => {
    localStorage.setItem("devflow-settings", JSON.stringify(settings));
    addToast(t("settings.saved"), "success");
  };

  const handleClearData = () => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("devflow-"));
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

      {/* AI Configuration */}
      <Card className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <Bot className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">{t("settings.ai.title")}</h2>
        </div>
        <div className="space-y-6">
          {/* Enable/Disable AI */}
          <div className="flex items-center justify-between">
            <div>
              <p id="ai-enabled-label" className="text-sm font-medium text-foreground">
                {t("settings.ai.enable")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("settings.ai.enableDesc")}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isAIEnabled}
              aria-labelledby="ai-enabled-label"
              onClick={() => setAIEnabled(!isAIEnabled)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                isAIEnabled ? "bg-blue-500" : "bg-muted"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
                  isAIEnabled ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>

          {/* Provider Selector */}
          <div>
            <Select
              value={byokProvider}
              onChange={(value) => { if (value) setByokProvider(value as AIProviderType); }}
              className="w-full"
              aria-label={t("settings.ai.provider")}
            >
              <Label className="mb-2 block text-sm font-medium text-muted-foreground">
                {t("settings.ai.provider")}
              </Label>
              <Select.Trigger className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {AI_PROVIDERS.map((p) => (
                    <ListBox.Item key={p.value} id={p.value} textValue={p.label}>
                      {p.label}<ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          {/* API Key Input */}
          <div>
            <label htmlFor="api-key-input" className="mb-2 block text-sm font-medium text-muted-foreground">
              {t("settings.ai.apiKey")}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="api-key-input"
                  type={showKey ? "text" : "password"}
                  value={byokKey}
                  onChange={(e) => setByokKey(e.target.value)}
                  placeholder={t("settings.ai.apiKeyPlaceholder")}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm font-mono placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  aria-label={showKey ? t("settings.ai.hideKey") : t("settings.ai.showKey")}
                >
                  {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {byokKey && (
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => { clearByok(); addToast(t("settings.ai.keyCleared"), "info"); }}
                  className="shrink-0"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {t("settings.ai.memoryOnly")}
            </p>
          </div>

          <p className="text-xs text-muted-foreground italic">
            {t("settings.ai.freeNote")}
          </p>
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
