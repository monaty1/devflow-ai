"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  SortResult,
  SorterConfig,
  OutputFormat,
} from "@/types/tailwind-sorter";
import { DEFAULT_SORTER_CONFIG } from "@/types/tailwind-sorter";
import {
  sortClasses,
  isValidInput,
  countClasses,
  findDuplicates,
  EXAMPLE_INPUT,
  MESSY_EXAMPLE,
} from "@/lib/application/tailwind-sorter";
import { useToolHistory } from "@/hooks/use-tool-history";

interface HistoryItem {
  id: string;
  input: string;
  classCount: number;
  timestamp: string;
}

export function useTailwindSorter() {
  const [input, setInput] = useState("");
  const [config, setConfig] = useState<SorterConfig>(DEFAULT_SORTER_CONFIG);
  const [result, setResult] = useState<SortResult | null>(null);
  const { history, addToHistory: addItemToHistory, clearHistory } =
    useToolHistory<HistoryItem>("devflow-tailwind-sorter-history", 10);

  // Computed values
  const inputStats = useMemo(() => {
    if (!input.trim()) {
      return { classCount: 0, duplicates: [], isValid: false };
    }
    return {
      classCount: countClasses(input),
      duplicates: findDuplicates(input),
      isValid: isValidInput(input),
    };
  }, [input]);

  const addToHistory = useCallback((inputValue: string) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      input: inputValue.slice(0, 100) + (inputValue.length > 100 ? "..." : ""),
      classCount: countClasses(inputValue),
      timestamp: new Date().toISOString(),
    };
    addItemToHistory(newItem);
  }, [addItemToHistory]);

  const sort = useCallback(() => {
    if (!isValidInput(input)) return;

    const sortResult = sortClasses(input, config);
    setResult(sortResult);
    addToHistory(input);
  }, [input, config, addToHistory]);

  const updateConfig = useCallback(
    <K extends keyof SorterConfig>(key: K, value: SorterConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
      // Re-sort if we have a result
      setResult(null);
    },
    []
  );

  const setOutputFormat = useCallback((format: OutputFormat) => {
    updateConfig("outputFormat", format);
  }, [updateConfig]);

  const loadExample = useCallback((type: "clean" | "messy" = "clean") => {
    setInput(type === "messy" ? MESSY_EXAMPLE : EXAMPLE_INPUT);
    setResult(null);
  }, []);

  const reset = useCallback(() => {
    setInput("");
    setResult(null);
  }, []);

  const loadFromHistory = useCallback((item: HistoryItem) => {
    // History stores truncated input, so this is limited
    // In a real app, you'd store the full input
    setInput(item.input.replace("...", ""));
    setResult(null);
  }, []);

  const applyToInput = useCallback(() => {
    if (result) {
      setInput(result.output);
      setResult(null);
    }
  }, [result]);

  return {
    // State
    input,
    config,
    result,
    history,
    inputStats,

    // Setters
    setInput,
    updateConfig,
    setOutputFormat,

    // Actions
    sort,
    loadExample,
    reset,
    clearHistory,
    loadFromHistory,
    applyToInput,
  };
}
