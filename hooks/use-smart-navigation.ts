"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export type ToolRoute =
  | "json-formatter"
  | "dto-matic"
  | "token-visualizer"
  | "cost-calculator"
  | "base64"
  | "prompt-analyzer"
  | "code-review"
  | "regex-humanizer"
  | "variable-name-wizard"
  | "cron-builder"
  | "git-commit-generator"
  | "uuid-generator"
  | "tailwind-sorter"
  | "context-manager"
  | "http-status-finder";

const SHARED_DATA_KEY = "devflow-shared-data";

export function useSmartNavigation() {
  const router = useRouter();

  const navigateTo = useCallback((tool: ToolRoute, data?: string) => {
    if (data) {
      try {
        localStorage.setItem(SHARED_DATA_KEY, data);
      } catch {
        // Storage quota exceeded or unavailable — navigate anyway
      }
    }
    router.push(`/tools/${tool}`);
  }, [router]);

  const getSharedData = useCallback(() => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(SHARED_DATA_KEY);
    } catch {
      return null;
    }
  }, []);

  const clearSharedData = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(SHARED_DATA_KEY);
    } catch {
      // Ignore removal errors
    }
  }, []);

  return { navigateTo, getSharedData, clearSharedData };
}
