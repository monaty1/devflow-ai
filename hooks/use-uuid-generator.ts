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
  formatBulkExport,
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
  const [analysis, setAnalysis] = useState<UuidInfo | null>(null);
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

  const analyze = useCallback((input: string) => {
    if (!input.trim()) {
      setAnalysis(null);
      return;
    }
    const info = parseUuid(input);
    setAnalysis(info);
  }, []);

  const validate = useCallback((input: string) => {
    return validateUuid(input);
  }, []);

  const updateConfig = useCallback(
    <K extends keyof UuidConfig>(key: K, value: UuidConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const exportBulk = useCallback((uuids: string[], format: "text" | "json" | "csv" | "sql") => {
    return formatBulkExport(uuids, format);
  }, []);

  const reset = useCallback(() => {
    setConfig(DEFAULT_UUID_CONFIG);
    setResult(null);
    setAnalysis(null);
  }, []);

  return {
    config,
    result,
    analysis,
    history,
    updateConfig,
    generate,
    analyze,
    validate,
    reset,
    clearHistory,
    exportBulk,
  };
}
