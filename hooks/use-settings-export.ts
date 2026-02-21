"use client";

import { useState, useCallback } from "react";
import {
  exportAllSettings,
  validateImport,
  importSettings,
  getExportFilename,
} from "@/lib/application/settings-export";

interface UseSettingsExportReturn {
  isExporting: boolean;
  isImporting: boolean;
  lastResult: { type: "success" | "error"; message: string } | null;
  handleExport: () => void;
  handleImport: (file: File) => Promise<void>;
  clearResult: () => void;
}

export function useSettingsExport(): UseSettingsExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [lastResult, setLastResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleExport = useCallback(() => {
    setIsExporting(true);
    try {
      const data = exportAllSettings();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = getExportFilename();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setLastResult({ type: "success", message: `Exported ${Object.keys(data.settings).length} settings` });
    } catch (e) {
      setLastResult({ type: "error", message: e instanceof Error ? e.message : "Export failed" });
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleImport = useCallback(async (file: File) => {
    setIsImporting(true);
    setLastResult(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const validation = validateImport(parsed);

      if (!validation.valid || !validation.data) {
        setLastResult({ type: "error", message: validation.error ?? "Validation failed" });
        return;
      }

      const result = importSettings(validation.data);
      setLastResult({ type: "success", message: `Imported ${result.imported} settings. Reload to apply.` });
    } catch (e) {
      setLastResult({ type: "error", message: e instanceof Error ? e.message : "Import failed" });
    } finally {
      setIsImporting(false);
    }
  }, []);

  const clearResult = useCallback(() => setLastResult(null), []);

  return { isExporting, isImporting, lastResult, handleExport, handleImport, clearResult };
}
