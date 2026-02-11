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
import { useToolHistory } from "@/hooks/use-tool-history";

interface HistoryItem {
  id: string;
  query: string;
  timestamp: string;
}

export function useHttpStatusFinder() {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<HttpStatusCategory | null>(null);
  const [selectedCode, setSelectedCode] = useState<HttpStatusCode | null>(null);
  const { history, addToHistory: addItemToHistory, clearHistory } =
    useToolHistory<HistoryItem>("devflow-http-status-finder-history", 10);

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
      addItemToHistory(newItem);
    }
  }, [addItemToHistory]);

  const clearSearch = useCallback(() => {
    setQuery("");
    setCategoryFilter(null);
    setSelectedCode(null);
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
