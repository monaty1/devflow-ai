"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export type ToolRoute = 
  | "json-formatter"
  | "dto-matic"
  | "token-visualizer"
  | "cost-calculator"
  | "base64"
  | "prompt-analyzer";

const SHARED_DATA_KEY = "devflow-shared-data";

export function useSmartNavigation() {
  const router = useRouter();

  const navigateTo = useCallback((tool: ToolRoute, data?: string) => {
    if (data) {
      localStorage.setItem(SHARED_DATA_KEY, data);
    }
    router.push(`/tools/${tool}`);
  }, [router]);

  const getSharedData = useCallback(() => {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(SHARED_DATA_KEY);
    // Optional: Clear data after reading to avoid stale state? 
    // Better to keep it for "Magic Input" consistency, but maybe clear on explicit reset.
    return data;
  }, []);

  const clearSharedData = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(SHARED_DATA_KEY);
  }, []);

  return { navigateTo, getSharedData, clearSharedData };
}
