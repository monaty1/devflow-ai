"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  CronExpression,
  CronField,
} from "@/types/cron-builder";
import { DEFAULT_CRON } from "@/types/cron-builder";
import {
  parseExpression,
  buildExpression,
  validateExpression,
  explainExpression,
  calculateNextExecutions,
  CRON_PRESETS,
} from "@/lib/application/cron-builder";

const HISTORY_KEY = "devflow-cron-history";
const MAX_HISTORY = 15;

interface HistoryItem {
  id: string;
  expression: string;
  description: string;
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

export function useCronBuilder() {
  const [expression, setExpressionState] = useState<CronExpression>(DEFAULT_CRON);
  const [rawExpression, setRawExpression] = useState(buildExpression(DEFAULT_CRON));
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);
  const [isManualMode, setIsManualMode] = useState(false);

  // Compute derived state using useMemo (not useEffect + setState)
  const validation = useMemo(() => validateExpression(rawExpression), [rawExpression]);

  const explanation = useMemo(() => {
    if (validation.isValid) {
      return explainExpression(rawExpression);
    }
    return null;
  }, [rawExpression, validation.isValid]);

  const nextExecutions = useMemo(() => {
    if (validation.isValid) {
      return calculateNextExecutions(rawExpression, 5);
    }
    return [];
  }, [rawExpression, validation.isValid]);

  const setExpression = useCallback((newExpression: CronExpression) => {
    setExpressionState(newExpression);
    const raw = buildExpression(newExpression);
    setRawExpression(raw);
    setIsManualMode(false);
  }, []);

  const setField = useCallback((field: CronField, value: string) => {
    setExpressionState((prev) => {
      const updated = { ...prev, [field]: value };
      const raw = buildExpression(updated);
      setRawExpression(raw);
      return updated;
    });
    setIsManualMode(false);
  }, []);

  const setRawExpressionManual = useCallback((raw: string) => {
    setRawExpression(raw);
    setIsManualMode(true);

    // Try to sync the visual editor
    try {
      const parsed = parseExpression(raw);
      setExpressionState(parsed);
    } catch {
      // Invalid expression, keep visual editor as-is
    }
  }, []);

  const loadPreset = useCallback((presetId: string) => {
    const preset = CRON_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      try {
        const parsed = parseExpression(preset.expression);
        setExpression(parsed);
      } catch {
        // Should not happen with valid presets
      }
    }
  }, [setExpression]);

  const addToHistory = useCallback((expr: string, desc: string) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      expression: expr,
      description: desc,
      timestamp: new Date().toISOString(),
    };

    setHistory((prev) => {
      // Avoid duplicates
      const filtered = prev.filter((h) => h.expression !== expr);
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const saveToHistory = useCallback(() => {
    if (validation.isValid && explanation) {
      addToHistory(rawExpression, explanation.humanReadable);
    }
  }, [validation.isValid, explanation, rawExpression, addToHistory]);

  const loadFromHistory = useCallback((item: HistoryItem) => {
    try {
      const parsed = parseExpression(item.expression);
      setExpression(parsed);
    } catch {
      setRawExpressionManual(item.expression);
    }
  }, [setExpression, setRawExpressionManual]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(HISTORY_KEY);
    }
  }, []);

  const reset = useCallback(() => {
    setExpression(DEFAULT_CRON);
  }, [setExpression]);

  const copyToClipboard = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
  }, []);

  return {
    // State
    expression,
    rawExpression,
    explanation,
    nextExecutions,
    validation,
    history,
    isManualMode,
    presets: CRON_PRESETS,

    // Setters
    setExpression,
    setField,
    setRawExpression: setRawExpressionManual,

    // Actions
    loadPreset,
    saveToHistory,
    loadFromHistory,
    clearHistory,
    reset,
    copyToClipboard,
  };
}
