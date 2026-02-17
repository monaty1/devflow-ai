"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { SortResult, SorterConfig } from "@/types/tailwind-sorter";
import { TAILWIND_SORTER_WORKER_SOURCE } from "@/lib/application/tailwind-sorter/worker-source";

interface UseTailwindSorterReturn {
  input: string;
  setInput: (input: string) => void;
  config: SorterConfig;
  result: SortResult | null;
  isSorting: boolean;
  updateConfig: <K extends keyof SorterConfig>(key: K, value: SorterConfig[K]) => void;
  sort: () => Promise<void>;
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
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const blob = new Blob([TAILWIND_SORTER_WORKER_SOURCE], { type: "application/javascript" });
    const worker = new Worker(URL.createObjectURL(blob));
    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, []);

  const sort = useCallback(async () => {
    if (!input.trim()) return;
    setIsSorting(true);

    return new Promise<void>((resolve, reject) => {
      if (!workerRef.current) {
        setIsSorting(false);
        reject(new Error("Worker not initialized"));
        return;
      }

      const worker = workerRef.current;

      const handleMessage = (e: MessageEvent) => {
        if (e.data.type === "success") {
          setResult(e.data.result);
          setIsSorting(false);
          worker.removeEventListener("message", handleMessage);
          resolve();
        } else {
          setIsSorting(false);
          worker.removeEventListener("message", handleMessage);
          reject(new Error(e.data.error || "Sorting failed"));
        }
      };

      worker.addEventListener("message", handleMessage);
      worker.postMessage({ input, config });
    });
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

  const updateConfig = <K extends keyof SorterConfig>(key: K, value: SorterConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => {
    setInput("");
    setResult(null);
  };

  const loadExample = (type: "clean" | "messy") => {
    const examples = {
      clean: "flex items-center justify-between p-4 bg-white rounded-lg shadow-md",
      messy: "hover:bg-blue-500 flex p-4 text-white bg-blue-600 items-center flex rounded-lg hover:bg-blue-500 shadow-md p-4"
    };
    setInput(examples[type]);
  };

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
