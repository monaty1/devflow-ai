import type { SettingsExport } from "@/types/settings-export";

const APP_PREFIX = "devflow-";
const CURRENT_VERSION = "1.0";

/**
 * Export all DevFlow settings from localStorage
 */
export function exportAllSettings(): SettingsExport {
  const settings: Record<string, string> = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(APP_PREFIX)) {
      const value = localStorage.getItem(key);
      if (value !== null) {
        settings[key] = value;
      }
    }
  }

  return {
    version: CURRENT_VERSION,
    exportedAt: new Date().toISOString(),
    appName: "devflow-ai",
    settings,
  };
}

/**
 * Validate an import payload
 */
export function validateImport(data: unknown): { valid: boolean; error?: string; data?: SettingsExport } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid format: expected JSON object" };
  }

  const obj = data as Record<string, unknown>;

  if (obj["appName"] !== "devflow-ai") {
    return { valid: false, error: "Invalid file: not a DevFlow AI export" };
  }

  if (typeof obj["version"] !== "string") {
    return { valid: false, error: "Missing version field" };
  }

  if (typeof obj["settings"] !== "object" || obj["settings"] === null) {
    return { valid: false, error: "Missing or invalid settings field" };
  }

  const settings = obj["settings"] as Record<string, unknown>;
  const cleanSettings: Record<string, string> = {};

  for (const [key, value] of Object.entries(settings)) {
    if (!key.startsWith(APP_PREFIX)) continue; // Skip non-devflow keys
    if (typeof value === "string") {
      cleanSettings[key] = value;
    }
  }

  return {
    valid: true,
    data: {
      version: obj["version"] as string,
      exportedAt: (obj["exportedAt"] as string) ?? new Date().toISOString(),
      appName: "devflow-ai",
      settings: cleanSettings,
    },
  };
}

/**
 * Import settings into localStorage
 */
export function importSettings(exportData: SettingsExport): { imported: number } {
  let imported = 0;

  for (const [key, value] of Object.entries(exportData.settings)) {
    if (key.startsWith(APP_PREFIX)) {
      localStorage.setItem(key, value);
      imported++;
    }
  }

  return { imported };
}

/**
 * Generate a download filename
 */
export function getExportFilename(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `devflow-settings-${date}.json`;
}
