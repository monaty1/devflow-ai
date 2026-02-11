"use client";

import { useState, useCallback } from "react";
import type {
  RegexAnalysis,
  TestResult,
  RegexMode,
} from "@/types/regex-humanizer";
import {
  explainRegex,
  generateRegex,
  testRegex,
  isValidRegex,
  COMMON_PATTERNS,
} from "@/lib/application/regex-humanizer";
import { useToolHistory } from "@/hooks/use-tool-history";

interface RegexHistoryItem {
  id: string;
  pattern: string;
  mode: RegexMode;
  timestamp: string;
}

export function useRegexHumanizer() {
  const [mode, setMode] = useState<RegexMode>("explain");
  const [pattern, setPattern] = useState("");
  const [description, setDescription] = useState("");
  const [testInput, setTestInput] = useState("");
  const [analysis, setAnalysis] = useState<RegexAnalysis | null>(null);
  const [generatedPattern, setGeneratedPattern] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { history, addToHistory: addItemToHistory, clearHistory } =
    useToolHistory<RegexHistoryItem>("devflow-regex-history", 20);

  const addToHistory = useCallback(
    (patternValue: string, modeValue: RegexMode) => {
      const newItem: RegexHistoryItem = {
        id: crypto.randomUUID(),
        pattern: patternValue,
        mode: modeValue,
        timestamp: new Date().toISOString(),
      };
      addItemToHistory(newItem);
    },
    [addItemToHistory],
  );

  const explain = useCallback(() => {
    if (!pattern.trim()) {
      setError("Por favor, introduce una expresión regular");
      return;
    }

    if (!isValidRegex(pattern)) {
      setError("La expresión regular no es válida");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = explainRegex(pattern);
      setAnalysis(result);
      addToHistory(pattern, "explain");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al analizar la regex");
    } finally {
      setIsLoading(false);
    }
  }, [pattern, addToHistory]);

  const generate = useCallback(() => {
    if (!description.trim()) {
      setError("Por favor, describe el patrón que necesitas");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = generateRegex(description);
      setGeneratedPattern(result);
      setPattern(result);
      addToHistory(result, "generate");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al generar la regex");
    } finally {
      setIsLoading(false);
    }
  }, [description, addToHistory]);

  const test = useCallback(() => {
    if (!pattern.trim()) {
      setError("Por favor, introduce una expresión regular");
      return;
    }

    setError(null);

    try {
      const result = testRegex(pattern, testInput);
      setTestResult(result);

      if (!result.isValid) {
        setError(result.error || "Regex inválida");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al probar la regex");
    }
  }, [pattern, testInput]);

  const reset = useCallback(() => {
    setPattern("");
    setDescription("");
    setTestInput("");
    setAnalysis(null);
    setGeneratedPattern(null);
    setTestResult(null);
    setError(null);
  }, []);

  const loadPreset = useCallback((presetId: string) => {
    const preset = COMMON_PATTERNS.find((p) => p.id === presetId);
    if (preset) {
      setPattern(preset.pattern);
      setTestInput(preset.examples[0] || "");
      setAnalysis(null);
      setTestResult(null);
      setError(null);
    }
  }, []);

  return {
    // State
    mode,
    pattern,
    description,
    testInput,
    analysis,
    generatedPattern,
    testResult,
    isLoading,
    error,
    history,
    commonPatterns: COMMON_PATTERNS,

    // Setters
    setMode,
    setPattern,
    setDescription,
    setTestInput,

    // Actions
    explain,
    generate,
    test,
    reset,
    loadPreset,
    clearHistory,

    // Utilities
    isValidRegex,
  };
}
