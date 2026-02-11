"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  WizardConfig,
  ConversionResult,
  GenerationResult,
  NamingConvention,
  VariableType,
} from "@/types/variable-name-wizard";
import { DEFAULT_WIZARD_CONFIG } from "@/types/variable-name-wizard";
import {
  convertToAll,
  generateSuggestions,
  detectConvention,
  isValidInput,
  splitIntoWords,
  expandAbbreviations,
  abbreviateName,
  convertTo,
  EXAMPLE_INPUTS,
} from "@/lib/application/variable-name-wizard";
import { useToolHistory } from "@/hooks/use-tool-history";

interface HistoryItem {
  id: string;
  input: string;
  mode: "convert" | "generate";
  timestamp: string;
}

export function useVariableNameWizard() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"convert" | "generate">("convert");
  const [variableType, setVariableType] = useState<VariableType>("variable");
  const [config, setConfig] = useState<WizardConfig>(DEFAULT_WIZARD_CONFIG);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const { history, addToHistory: addItemToHistory, clearHistory } =
    useToolHistory<HistoryItem>("devflow-variable-wizard-history", 10);

  // Computed values
  const inputStats = useMemo(() => {
    if (!input.trim()) {
      return {
        wordCount: 0,
        detectedConvention: "unknown" as const,
        isValid: false,
      };
    }
    return {
      wordCount: splitIntoWords(input).length,
      detectedConvention: detectConvention(input),
      isValid: isValidInput(input),
    };
  }, [input]);

  const addToHistory = useCallback((inputValue: string, inputMode: "convert" | "generate") => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      input: inputValue.slice(0, 50) + (inputValue.length > 50 ? "..." : ""),
      mode: inputMode,
      timestamp: new Date().toISOString(),
    };
    addItemToHistory(newItem);
  }, [addItemToHistory]);

  const convert = useCallback(() => {
    if (!isValidInput(input)) return;

    const result = convertToAll(input);
    setConversionResult(result);
    setGenerationResult(null);
    addToHistory(input, "convert");
  }, [input, addToHistory]);

  const generate = useCallback(() => {
    if (!isValidInput(input)) return;

    const result = generateSuggestions(input, variableType, config);
    setGenerationResult(result);
    setConversionResult(null);
    addToHistory(input, "generate");
  }, [input, variableType, config, addToHistory]);

  const convertSingle = useCallback(
    (convention: NamingConvention): string => {
      if (!isValidInput(input)) return "";
      return convertTo(input, convention);
    },
    [input]
  );

  const updateConfig = useCallback(
    <K extends keyof WizardConfig>(key: K, value: WizardConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const loadExample = useCallback((index: number = 0) => {
    const example = EXAMPLE_INPUTS[index % EXAMPLE_INPUTS.length];
    if (example) {
      setInput(example);
      setConversionResult(null);
      setGenerationResult(null);
    }
  }, []);

  const reset = useCallback(() => {
    setInput("");
    setConversionResult(null);
    setGenerationResult(null);
  }, []);

  const loadFromHistory = useCallback((item: HistoryItem) => {
    setInput(item.input.replace("...", ""));
    setMode(item.mode);
    setConversionResult(null);
    setGenerationResult(null);
  }, []);

  const expand = useCallback(() => {
    if (!input.trim()) return;
    const expanded = expandAbbreviations(input);
    setInput(expanded);
    setConversionResult(null);
    setGenerationResult(null);
  }, [input]);

  const abbreviate = useCallback(() => {
    if (!input.trim()) return;
    const abbreviated = abbreviateName(input);
    setInput(abbreviated);
    setConversionResult(null);
    setGenerationResult(null);
  }, [input]);

  const applyConversion = useCallback(
    (convention: NamingConvention) => {
      if (conversionResult) {
        const newValue = conversionResult.conversions[convention];
        setInput(newValue);
        setConversionResult(null);
      }
    },
    [conversionResult]
  );

  const applySuggestion = useCallback(
    (suggestionName: string) => {
      setInput(suggestionName);
      setGenerationResult(null);
    },
    []
  );

  return {
    // State
    input,
    mode,
    variableType,
    config,
    conversionResult,
    generationResult,
    history,
    inputStats,

    // Setters
    setInput,
    setMode,
    setVariableType,
    updateConfig,

    // Actions
    convert,
    generate,
    convertSingle,
    loadExample,
    reset,
    clearHistory,
    loadFromHistory,
    expand,
    abbreviate,
    applyConversion,
    applySuggestion,
  };
}
