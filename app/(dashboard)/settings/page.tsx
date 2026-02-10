"use client";

import { useState } from "react";
import { Card, Button } from "@heroui/react";
import { useToast } from "@/hooks/use-toast";

interface Settings {
  theme: string;
  notifications: boolean;
  language: string;
}

function getInitialSettings(): Settings {
  if (typeof window === "undefined") {
    return { theme: "system", notifications: true, language: "en" };
  }
  try {
    const stored = localStorage.getItem("devflow-settings");
    if (stored) {
      return JSON.parse(stored) as Settings;
    }
  } catch {
    // Ignore parse errors
  }
  return { theme: "system", notifications: true, language: "en" };
}

export default function SettingsPage() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<Settings>(() => getInitialSettings());

  const handleSave = () => {
    localStorage.setItem("devflow-settings", JSON.stringify(settings));
    addToast("Settings saved!", "success");
  };

  const handleClearData = () => {
    const keys = [
      "devflow-prompt-history",
      "devflow-favorites",
      "devflow-context-windows",
    ];
    keys.forEach((key) => localStorage.removeItem(key));
    addToast("All data cleared", "info");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your preferences
        </p>
      </div>

      {/* Preferences */}
      <Card className="p-6">
        <h2 className="mb-6 text-lg font-semibold">Preferences</h2>
        <div className="space-y-6">
          {/* Theme */}
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">
              Theme
            </label>
            <div className="flex gap-3">
              {(["light", "dark", "system"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSettings({ ...settings, theme: t })}
                  className={`flex-1 rounded-lg border-2 p-3 text-sm font-medium capitalize transition-colors ${
                    settings.theme === t
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      : "border-border text-muted-foreground hover:border-muted-foreground/50"
                  }`}
                >
                  {t === "light" ? "☀️" : t === "dark" ? "🌙" : "💻"} {t}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <p id="notifications-label" className="text-sm font-medium text-foreground">
                Toast Notifications
              </p>
              <p className="text-xs text-muted-foreground">
                Show alerts for actions
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
            <label htmlFor="settings-language" className="mb-2 block text-sm font-medium text-muted-foreground">
              Language
            </label>
            <select
              id="settings-language"
              value={settings.language}
              onChange={(e) =>
                setSettings({ ...settings, language: e.target.value })
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>

          <Button onPress={handleSave} className="w-full">
            Save Preferences
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 p-6 dark:border-red-900/50">
        <h2 className="mb-4 text-lg font-semibold text-red-600 dark:text-red-400">
          Danger Zone
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          This will permanently delete all your local data including prompt
          history, favorites, and context windows.
        </p>
        <Button variant="outline" onPress={handleClearData} className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20">
          Clear All Data
        </Button>
      </Card>
    </div>
  );
}
