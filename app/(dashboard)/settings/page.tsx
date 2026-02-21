"use client";

import { useState, useRef, useSyncExternalStore } from "react";
import { Card, Button, Select, Label, ListBox, Switch, TextField, InputGroup } from "@heroui/react";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { useLocaleStore } from "@/lib/stores/locale-store";
import { useAISettingsStore } from "@/lib/stores/ai-settings-store";
import { Sun, Moon, Monitor, Bot, Eye, EyeOff, Trash2, Download, Upload } from "lucide-react";
import { useSettingsExport } from "@/hooks/use-settings-export";
import { cn } from "@/lib/utils";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isExporting, isImporting, lastResult, handleExport, handleImport, clearResult } = useSettingsExport();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleImport(file);
      e.target.value = "";
    }
  };

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
                <Button
                  key={themeOption}
                  variant={mounted && theme === themeOption ? "primary" : "ghost"}
                  onPress={() => setTheme(themeOption)}
                  className="flex-1 capitalize"
                >
                  {themeOption === "light" ? <Sun className="mr-1 inline size-4" /> : themeOption === "dark" ? <Moon className="mr-1 inline size-4" /> : <Monitor className="mr-1 inline size-4" />}{" "}
                  {t(`settings.${themeOption}`)}
                </Button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <Switch
              isSelected={settings.notifications}
              onChange={(val) =>
                setSettings({ ...settings, notifications: val })
              }
              aria-label={t("settings.notifications")}
            >
              <div className="flex flex-col">
                <Label className="text-sm font-medium text-foreground">
                  {t("settings.notifications")}
                </Label>
                <span className="text-xs text-muted-foreground">
                  {t("settings.notificationsDesc")}
                </span>
              </div>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch>
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
            <Switch
              isSelected={isAIEnabled}
              onChange={(val) => setAIEnabled(val)}
              aria-label={t("settings.ai.enable")}
            >
              <div className="flex flex-col">
                <Label className="text-sm font-medium text-foreground">
                  {t("settings.ai.enable")}
                </Label>
                <span className="text-xs text-muted-foreground">
                  {t("settings.ai.enableDesc")}
                </span>
              </div>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch>
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
            <div className="flex gap-2">
              <TextField className="flex-1" name="api-key" onChange={setByokKey}>
                <Label className="mb-2 block text-sm font-medium text-muted-foreground">
                  {t("settings.ai.apiKey")}
                </Label>
                <InputGroup>
                  <InputGroup.Input
                    type={showKey ? "text" : "password"}
                    value={byokKey}
                    placeholder={t("settings.ai.apiKeyPlaceholder")}
                    className="w-full font-mono"
                  />
                  <InputGroup.Suffix className="pr-0">
                    <Button
                      isIconOnly
                      variant="ghost"
                      size="sm"
                      onPress={() => setShowKey(!showKey)}
                      aria-label={showKey ? t("settings.ai.hideKey") : t("settings.ai.showKey")}
                    >
                      {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                  </InputGroup.Suffix>
                </InputGroup>
              </TextField>
              {byokKey && (
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => { clearByok(); addToast(t("settings.ai.keyCleared"), "info"); }}
                  className="shrink-0 self-end"
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

      {/* Export / Import */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">{t("settings.exportImport")}</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {t("settings.exportImportDesc")}
        </p>
        <div className="flex gap-3">
          <Button variant="primary" onPress={handleExport} isDisabled={isExporting}>
            <Download className="size-4" />
            {t("settings.export")}
          </Button>
          <Button variant="ghost" onPress={() => fileInputRef.current?.click()} isDisabled={isImporting}>
            <Upload className="size-4" />
            {t("settings.import")}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        {lastResult && (
          <button type="button" onClick={clearResult} className={cn("mt-3 block text-sm cursor-pointer", lastResult.type === "success" ? "text-success" : "text-destructive")}>
            {lastResult.message}
          </button>
        )}
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
