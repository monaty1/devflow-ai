"use client";

import { useState, useCallback, useEffect } from "react";
import type { SortResult, SorterConfig } from "@/types/tailwind-sorter";
import { sortClasses } from "@/lib/application/tailwind-sorter";

interface UseTailwindSorterReturn {
  input: string;
  setInput: (input: string) => void;
  config: SorterConfig;
  result: SortResult | null;
  isSorting: boolean;
  updateConfig: <K extends keyof SorterConfig>(key: K, value: SorterConfig[K]) => void;
  sort: () => void;
  reset: () => void;
  loadExample: (type: "clean" | "messy") => void;
}

export function useTailwindSorter(): UseTailwindSorterReturn {
  const [input, setInput] = useState("");
  const [config, setConfig] = useState<SorterConfig>({
    removeDuplicates: true,
    sortWithinGroups: true,
    groupByCategory: true,
    preserveVariants: true,
    outputFormat: "single-line",
  });
  const [result, setResult] = useState<SortResult | null>(null);
  const [isSorting, setIsSorting] = useState(false);

  const sort = useCallback(() => {
    if (!input.trim()) return;
    setIsSorting(true);
    try {
      const sortResult = sortClasses(input, config);
      setResult(sortResult);
    } finally {
      setIsSorting(false);
    }
  }, [input, config]);

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
    updateConfig,
    sort,
    reset,
    loadExample,
  };
}
