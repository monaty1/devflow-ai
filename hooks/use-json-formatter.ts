"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  JsonFormatterConfig,
  JsonFormatResult,
  JsonFormatMode,
} from "@/types/json-formatter";
import { DEFAULT_FORMATTER_CONFIG } from "@/types/json-formatter";
import {
  processJson,
  validateJson,
  extractJsonPaths,
  jsonToTypeScript,
  compareJson,
  EXAMPLE_JSON,
} from "@/lib/application/json-formatter";

const HISTORY_KEY = "devflow-json-formatter-history";
const MAX_HISTORY = 10;

interface HistoryItem {
  id: string;
  input: string;
  mode: JsonFormatMode;
  timestamp: string;
}

function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
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

export function useJsonFormatter() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<JsonFormatMode>("format");
  const [config, setConfig] = useState<JsonFormatterConfig>(DEFAULT_FORMATTER_CONFIG);
  const [result, setResult] = useState<JsonFormatResult | null>(null);
  const [compareInput, setCompareInput] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);

  // Computed values
  const inputValidation = useMemo(() => {
    if (!input.trim()) {
      return { isValid: false, error: undefined };
    }
    return validateJson(input);
  }, [input]);

  const inputStats = useMemo(() => {
    return {
      characters: input.length,
      lines: input.split("\n").length,
      isValid: inputValidation.isValid,
    };
  }, [input, inputValidation.isValid]);

  const addToHistory = useCallback((inputValue: string, inputMode: JsonFormatMode) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      input: inputValue.slice(0, 100) + (inputValue.length > 100 ? "..." : ""),
      mode: inputMode,
      timestamp: new Date().toISOString(),
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, MAX_HISTORY);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const process = useCallback(() => {
    if (!inputValidation.isValid) return;

    const formatResult = processJson(input, mode, config);
    setResult(formatResult);
    addToHistory(input, mode);
  }, [input, mode, config, inputValidation.isValid, addToHistory]);

  const format = useCallback(() => {
    setMode("format");
    if (!inputValidation.isValid) return;
    const formatResult = processJson(input, "format", config);
    setResult(formatResult);
    addToHistory(input, "format");
  }, [input, config, inputValidation.isValid, addToHistory]);

  const minify = useCallback(() => {
    setMode("minify");
    if (!inputValidation.isValid) return;
    const formatResult = processJson(input, "minify", config);
    setResult(formatResult);
    addToHistory(input, "minify");
  }, [input, config, inputValidation.isValid, addToHistory]);

  const validate = useCallback(() => {
    setMode("validate");
    const formatResult = processJson(input, "validate", config);
    setResult(formatResult);
  }, [input, config]);

  const getPaths = useCallback(() => {
    if (!inputValidation.isValid) return [];
    return extractJsonPaths(input);
  }, [input, inputValidation.isValid]);

  const toTypeScript = useCallback(
    (rootName: string = "Root") => {
      if (!inputValidation.isValid) return "";
      return jsonToTypeScript(input, rootName);
    },
    [input, inputValidation.isValid]
  );

  const compare = useCallback(() => {
    return compareJson(input, compareInput);
  }, [input, compareInput]);

  const updateConfig = useCallback(
    <K extends keyof JsonFormatterConfig>(key: K, value: JsonFormatterConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const loadExample = useCallback((type: keyof typeof EXAMPLE_JSON) => {
    setInput(EXAMPLE_JSON[type]);
    setResult(null);
  }, []);

  const reset = useCallback(() => {
    setInput("");
    setResult(null);
    setCompareInput("");
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(HISTORY_KEY);
    }
  }, []);

  const loadFromHistory = useCallback((item: HistoryItem) => {
    setInput(item.input.replace("...", ""));
    setMode(item.mode);
    setResult(null);
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
  }, []);

  const applyOutput = useCallback(() => {
    if (result?.output) {
      setInput(result.output);
      setResult(null);
    }
  }, [result]);

  return {
    // State
    input,
    mode,
    config,
    result,
    compareInput,
    history,
    inputStats,
    inputValidation,

    // Setters
    setInput,
    setMode,
    setCompareInput,
    updateConfig,

    // Actions
    process,
    format,
    minify,
    validate,
    getPaths,
    toTypeScript,
    compare,
    loadExample,
    reset,
    clearHistory,
    loadFromHistory,
    copyToClipboard,
    applyOutput,
  };
}
