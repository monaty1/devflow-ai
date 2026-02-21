import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  exportAllSettings,
  validateImport,
  importSettings,
  getExportFilename,
} from "@/lib/application/settings-export";

describe("Settings Export", () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key: string) => store[key] ?? null);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation((key: string, value: string) => { store[key] = value; });
    vi.spyOn(Storage.prototype, "key").mockImplementation((index: number) => Object.keys(store)[index] ?? null);
    Object.defineProperty(Storage.prototype, "length", {
      get: () => Object.keys(store).length,
      configurable: true,
    });
  });

  describe("exportAllSettings", () => {
    it("should export devflow-prefixed settings", () => {
      localStorage.setItem("devflow-theme", "dark");
      localStorage.setItem("devflow-locale", "es");
      localStorage.setItem("other-key", "ignored");

      const result = exportAllSettings();

      expect(result.appName).toBe("devflow-ai");
      expect(result.version).toBe("1.0");
      expect(result.settings["devflow-theme"]).toBe("dark");
      expect(result.settings["devflow-locale"]).toBe("es");
      expect(result.settings["other-key"]).toBeUndefined();
    });

    it("should include exportedAt timestamp", () => {
      const result = exportAllSettings();
      expect(new Date(result.exportedAt).getTime()).not.toBeNaN();
    });

    it("should handle empty localStorage", () => {
      const result = exportAllSettings();
      expect(Object.keys(result.settings).length).toBe(0);
    });
  });

  describe("validateImport", () => {
    it("should validate a correct export", () => {
      const data = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        appName: "devflow-ai",
        settings: { "devflow-theme": "dark" },
      };
      const result = validateImport(data);
      expect(result.valid).toBe(true);
      expect(result.data?.settings["devflow-theme"]).toBe("dark");
    });

    it("should reject null input", () => {
      const result = validateImport(null);
      expect(result.valid).toBe(false);
    });

    it("should reject wrong appName", () => {
      const result = validateImport({ appName: "other-app", version: "1.0", settings: {} });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("not a DevFlow AI export");
    });

    it("should reject missing version", () => {
      const result = validateImport({ appName: "devflow-ai", settings: {} });
      expect(result.valid).toBe(false);
    });

    it("should reject missing settings", () => {
      const result = validateImport({ appName: "devflow-ai", version: "1.0" });
      expect(result.valid).toBe(false);
    });

    it("should filter out non-devflow keys", () => {
      const data = {
        version: "1.0",
        appName: "devflow-ai",
        settings: { "devflow-theme": "dark", "malicious-key": "bad" },
      };
      const result = validateImport(data);
      expect(result.valid).toBe(true);
      expect(result.data?.settings["malicious-key"]).toBeUndefined();
    });

    it("should filter out non-string values", () => {
      const data = {
        version: "1.0",
        appName: "devflow-ai",
        settings: { "devflow-theme": "dark", "devflow-bad": 123 },
      };
      const result = validateImport(data);
      expect(result.valid).toBe(true);
      expect(result.data?.settings["devflow-bad"]).toBeUndefined();
    });
  });

  describe("importSettings", () => {
    it("should import settings into localStorage", () => {
      const data = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        appName: "devflow-ai" as const,
        settings: { "devflow-theme": "dark", "devflow-locale": "es" },
      };
      const result = importSettings(data);
      expect(result.imported).toBe(2);
      expect(localStorage.getItem("devflow-theme")).toBe("dark");
    });

    it("should skip non-devflow keys", () => {
      const data = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        appName: "devflow-ai" as const,
        settings: { "other-key": "value" },
      };
      const result = importSettings(data);
      expect(result.imported).toBe(0);
    });
  });

  describe("getExportFilename", () => {
    it("should return a filename with date", () => {
      const filename = getExportFilename();
      expect(filename).toMatch(/^devflow-settings-\d{4}-\d{2}-\d{2}\.json$/);
    });
  });

  describe("roundtrip", () => {
    it("should export and re-import correctly", () => {
      localStorage.setItem("devflow-test-1", "value1");
      localStorage.setItem("devflow-test-2", "value2");

      const exported = exportAllSettings();
      const validation = validateImport(exported);

      expect(validation.valid).toBe(true);
      if (validation.data) {
        const result = importSettings(validation.data);
        expect(result.imported).toBe(2);
      }
    });
  });
});
