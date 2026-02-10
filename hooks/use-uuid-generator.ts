"use client";

import { useState, useCallback } from "react";
import type {
  UuidConfig,
  UuidResult,
  UuidVersion,
  UuidFormat,
  UuidInfo,
} from "@/types/uuid-generator";
import { DEFAULT_UUID_CONFIG } from "@/types/uuid-generator";
import {
  processUuidGeneration,
  validateUuid,
  parseUuid,
  EXAMPLE_UUIDS,
} from "@/lib/application/uuid-generator";

const HISTORY_KEY = "devflow-uuid-generator-history";
const MAX_HISTORY = 50;

interface HistoryItem {
  id: string;
  version: UuidVersion;
  format: UuidFormat;
  quantity: number;
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

export function useUuidGenerator() {
  const [config, setConfig] = useState<UuidConfig>(DEFAULT_UUID_CONFIG);
  const [result, setResult] = useState<UuidResult | null>(null);
  const [validateInput, setValidateInput] = useState("");
  const [parseInput, setParseInput] = useState("");
  const [parsedInfo, setParsedInfo] = useState<UuidInfo | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);

  const addToHistory = useCallback((cfg: UuidConfig) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      version: cfg.version,
      format: cfg.format,
      quantity: cfg.quantity,
      timestamp: new Date().toISOString(),
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, MAX_HISTORY);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const generate = useCallback(() => {
    const genResult = processUuidGeneration(config);
    setResult(genResult);
    addToHistory(config);
  }, [config, addToHistory]);

  const validate = useCallback(() => {
    return validateUuid(validateInput);
  }, [validateInput]);

  const parse = useCallback(() => {
    if (!parseInput.trim()) {
      setParsedInfo(null);
      return;
    }
    const info = parseUuid(parseInput);
    setParsedInfo(info);
  }, [parseInput]);

  const updateConfig = useCallback(
    <K extends keyof UuidConfig>(key: K, value: UuidConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const loadExample = useCallback((version: UuidVersion) => {
    setParseInput(EXAMPLE_UUIDS[version]);
    const info = parseUuid(EXAMPLE_UUIDS[version]);
    setParsedInfo(info);
  }, []);

  const reset = useCallback(() => {
    setConfig(DEFAULT_UUID_CONFIG);
    setResult(null);
    setValidateInput("");
    setParseInput("");
    setParsedInfo(null);
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
    config,
    result,
    validateInput,
    parseInput,
    parsedInfo,
    history,

    // Setters
    setValidateInput,
    setParseInput,
    updateConfig,

    // Actions
    generate,
    validate,
    parse,
    loadExample,
    reset,
    clearHistory,
    copyToClipboard,
  };
}
