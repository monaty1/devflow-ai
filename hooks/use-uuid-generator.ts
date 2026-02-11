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
import { useToolHistory } from "@/hooks/use-tool-history";

interface HistoryItem {
  id: string;
  version: UuidVersion;
  format: UuidFormat;
  quantity: number;
  timestamp: string;
}

export function useUuidGenerator() {
  const [config, setConfig] = useState<UuidConfig>(DEFAULT_UUID_CONFIG);
  const [result, setResult] = useState<UuidResult | null>(null);
  const [validateInput, setValidateInput] = useState("");
  const [parseInput, setParseInput] = useState("");
  const [parsedInfo, setParsedInfo] = useState<UuidInfo | null>(null);
  const { history, addToHistory: addItemToHistory, clearHistory } =
    useToolHistory<HistoryItem>("devflow-uuid-generator-history", 50);

  const addToHistory = useCallback((cfg: UuidConfig) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      version: cfg.version,
      format: cfg.format,
      quantity: cfg.quantity,
      timestamp: new Date().toISOString(),
    };
    addItemToHistory(newItem);
  }, [addItemToHistory]);

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
