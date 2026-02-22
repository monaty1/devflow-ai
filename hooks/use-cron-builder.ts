"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type {
  CronExpression,
  CronField,
  ConfigFormat,
} from "@/types/cron-builder";
import { DEFAULT_CRON } from "@/types/cron-builder";
import {
  parseExpression,
  buildExpression,
  validateExpression,
  explainExpression,
  calculateNextExecutions,
  generateConfig,
  getCronPresets,
} from "@/lib/application/cron-builder";
import { useToolHistory } from "@/hooks/use-tool-history";
import { useLocaleStore } from "@/lib/stores/locale-store";

interface HistoryItem {
  id: string;
  expression: string;
  description: string;
  timestamp: string;
}

export function useCronBuilder() {
  const locale = useLocaleStore((s) => s.locale);
  const [expression, setExpressionState] = useState<CronExpression>(DEFAULT_CRON);
  const [rawExpression, setRawExpression] = useState(buildExpression(DEFAULT_CRON));
  const [configFormat, setConfigFormat] = useState<ConfigFormat>("kubernetes");
  const { history, addToHistory: addItemToHistory, clearHistory } =
    useToolHistory<HistoryItem>("devflow-cron-history", 15);
  const [isManualMode, setIsManualMode] = useState(false);

  // Debounce rawExpression for expensive derived computations (150ms)
  const [debouncedRaw, setDebouncedRaw] = useState(buildExpression(DEFAULT_CRON));
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedRaw(rawExpression), 150);
    return () => clearTimeout(timer);
  }, [rawExpression]);

  // Locale-aware presets
  const presets = useMemo(() => getCronPresets(locale), [locale]);

  // Compute derived state using useMemo with debounced input
  const validation = useMemo(() => validateExpression(debouncedRaw, locale), [debouncedRaw, locale]);

  const explanation = useMemo(() => {
    if (validation.isValid) {
      return explainExpression(debouncedRaw, locale);
    }
    return null;
  }, [debouncedRaw, validation.isValid, locale]);

  const nextExecutions = useMemo(() => {
    if (validation.isValid) {
      return calculateNextExecutions(debouncedRaw, 5, undefined, locale);
    }
    return [];
  }, [debouncedRaw, validation.isValid, locale]);

  const config = useMemo(() => {
    if (validation.isValid) {
      return generateConfig(debouncedRaw, configFormat);
    }
    return null;
  }, [debouncedRaw, configFormat, validation.isValid]);

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
      const parsed = parseExpression(raw, locale);
      setExpressionState(parsed);
    } catch {
      // Invalid expression, keep visual editor as-is
    }
  }, [locale]);

  const loadPreset = useCallback((presetId: string) => {
    const localePresets = getCronPresets(locale);
    const preset = localePresets.find((p) => p.id === presetId);
    if (preset) {
      try {
        const parsed = parseExpression(preset.expression, locale);
        setExpression(parsed);
      } catch {
        // Should not happen with valid presets
      }
    }
  }, [setExpression, locale]);

  const addToHistory = useCallback((expr: string, desc: string) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      expression: expr,
      description: desc,
      timestamp: new Date().toISOString(),
    };
    addItemToHistory(newItem);
  }, [addItemToHistory]);

  const saveToHistory = useCallback(() => {
    if (validation.isValid && explanation) {
      addToHistory(rawExpression, explanation.humanReadable);
    }
  }, [validation.isValid, explanation, rawExpression, addToHistory]);

  const loadFromHistory = useCallback((item: HistoryItem) => {
    try {
      const parsed = parseExpression(item.expression, locale);
      setExpression(parsed);
    } catch {
      setRawExpressionManual(item.expression);
    }
  }, [setExpression, setRawExpressionManual, locale]);

  const reset = useCallback(() => {
    setExpression(DEFAULT_CRON);
  }, [setExpression]);

  return {
    // State
    expression,
    rawExpression,
    explanation,
    nextExecutions,
    validation,
    history,
    config,
    configFormat,
    isManualMode,
    presets,

    // Setters
    setExpression,
    setField,
    setRawExpression: setRawExpressionManual,
    setConfigFormat,

    // Actions
    loadPreset,
    saveToHistory,
    loadFromHistory,
    clearHistory,
    reset,
  };
}
