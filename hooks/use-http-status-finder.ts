"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  HttpStatusCategory,
  HttpStatusCode,
} from "@/types/http-status-finder";
import {
  processSearch,
  getCommonCodes,
} from "@/lib/application/http-status-finder";

const HISTORY_KEY = "devflow-http-status-finder-history";
const MAX_HISTORY = 10;

interface HistoryItem {
  id: string;
  query: string;
  timestamp: string;
}

function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? (JSON.parse(stored) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: HistoryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  } catch {
    // Ignore storage errors
  }
}

export function useHttpStatusFinder() {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<HttpStatusCategory | null>(null);
  const [selectedCode, setSelectedCode] = useState<HttpStatusCode | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);

  const results = useMemo(() => {
    return processSearch(query, categoryFilter ?? undefined);
  }, [query, categoryFilter]);

  const commonCodes = useMemo(() => getCommonCodes(), []);

  const search = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.trim()) {
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        query: searchQuery.trim(),
        timestamp: new Date().toISOString(),
      };

      setHistory((prev) => {
        const updated = [newItem, ...prev.filter((h) => h.query !== searchQuery.trim())].slice(0, MAX_HISTORY);
        saveHistory(updated);
        return updated;
      });
    }
  }, []);

  const clearSearch = useCallback(() => {
    setQuery("");
    setCategoryFilter(null);
    setSelectedCode(null);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(HISTORY_KEY);
    }
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
  }, []);

  return {
    // State
    query,
    categoryFilter,
    results,
    commonCodes,
    selectedCode,
    history,

    // Setters
    setQuery,
    setCategoryFilter,
    setSelectedCode,

    // Actions
    search,
    clearSearch,
    clearHistory,
    copyToClipboard,
  };
}
