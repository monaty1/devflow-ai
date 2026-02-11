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
import { useToolHistory } from "@/hooks/use-tool-history";

interface HistoryItem {
  id: string;
  input: string;
  mode: JsonFormatMode;
  timestamp: string;
}

export function useJsonFormatter() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<JsonFormatMode>("format");
  const [config, setConfig] = useState<JsonFormatterConfig>(DEFAULT_FORMATTER_CONFIG);
  const [result, setResult] = useState<JsonFormatResult | null>(null);
  const [compareInput, setCompareInput] = useState("");
  const { history, addToHistory: addItemToHistory, clearHistory } =
    useToolHistory<HistoryItem>("devflow-json-formatter-history", 10);

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
    addItemToHistory(newItem);
  }, [addItemToHistory]);

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

  const loadFromHistory = useCallback((item: HistoryItem) => {
    setInput(item.input.replace("...", ""));
    setMode(item.mode);
    setResult(null);
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
    applyOutput,
  };
}
