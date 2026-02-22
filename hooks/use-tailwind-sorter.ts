"use client";

import { useState, useCallback, useEffect } from "react";
import type { SortResult, SorterConfig } from "@/types/tailwind-sorter";
import { DEFAULT_SORTER_CONFIG } from "@/types/tailwind-sorter";
import { sortClasses } from "@/lib/application/tailwind-sorter";
import { useToolHistory } from "@/hooks/use-tool-history";

interface HistoryItem {
  id: string;
  input: string;
  output: string;
  timestamp: string;
}

interface UseTailwindSorterReturn {
  input: string;
  setInput: (input: string) => void;
  config: SorterConfig;
  result: SortResult | null;
  isSorting: boolean;
  history: HistoryItem[];
  updateConfig: <K extends keyof SorterConfig>(key: K, value: SorterConfig[K]) => void;
  sort: () => void;
  reset: () => void;
  loadExample: (type: "clean" | "messy") => void;
  clearHistory: () => void;
}

export function useTailwindSorter(): UseTailwindSorterReturn {
  const [input, setInput] = useState("");
  const [config, setConfig] = useState<SorterConfig>(DEFAULT_SORTER_CONFIG);
  const [result, setResult] = useState<SortResult | null>(null);
  const [isSorting, setIsSorting] = useState(false);
  const { history, addToHistory: addItemToHistory, clearHistory } =
    useToolHistory<HistoryItem>("devflow-tailwind-sorter-history", 15);

  const sort = useCallback(() => {
    if (!input.trim()) return;
    setIsSorting(true);
    try {
      const sortResult = sortClasses(input, config);
      setResult(sortResult);
      addItemToHistory({
        id: crypto.randomUUID(),
        input: input.slice(0, 80) + (input.length > 80 ? "..." : ""),
        output: sortResult.output.slice(0, 80) + (sortResult.output.length > 80 ? "..." : ""),
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsSorting(false);
    }
  }, [input, config, addItemToHistory]);

  // Auto-sort with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (input.trim()) {
        sort();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [input, config, sort]);

  const updateConfig = useCallback(<K extends keyof SorterConfig>(key: K, value: SorterConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setInput("");
    setResult(null);
  }, []);

  const loadExample = useCallback((type: "clean" | "messy") => {
    const examples = {
      clean: "flex items-center justify-between p-4 bg-white rounded-lg shadow-md",
      messy: "hover:bg-blue-500 flex p-4 text-white bg-blue-600 items-center flex rounded-lg hover:bg-blue-500 shadow-md p-4"
    };
    setInput(examples[type]);
  }, []);

  return {
    input,
    setInput,
    config,
    result,
    isSorting,
    history,
    updateConfig,
    sort,
    reset,
    loadExample,
    clearHistory,
  };
}
