"use client";

import { useState, useCallback } from "react";
import type {
  ConversionResult,
  GenerationResult,
  WizardConfig,
} from "@/types/variable-name-wizard";
import { convertToAll, generateSuggestions } from "@/lib/application/variable-name-wizard";

interface UseVariableNameWizardReturn {
  input: string;
  mode: "convert" | "generate";
  config: WizardConfig;
  conversionResult: ConversionResult | null;
  generationResult: GenerationResult | null;
  isProcessing: boolean;
  setInput: (input: string) => void;
  setMode: (mode: "convert" | "generate") => void;
  updateConfig: <K extends keyof WizardConfig>(key: K, value: WizardConfig[K]) => void;
  convert: () => Promise<void>;
  generate: () => Promise<void>;
  reset: () => void;
  loadExample: () => void;
}

export function useVariableNameWizard(): UseVariableNameWizardReturn {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"convert" | "generate">("generate");
  const [config, setConfig] = useState<WizardConfig>({
    preferredConvention: "camelCase",
    maxSuggestions: 10,
    includeAbbreviations: false,
    language: "typescript",
    type: "variable",
  });
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const convert = useCallback(async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    try {
      const result = convertToAll(input);
      setConversionResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  }, [input]);

  const generate = useCallback(async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    try {
      const result = generateSuggestions(input, config.type, config);
      setGenerationResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  }, [input, config]);

  const updateConfig = <K extends keyof WizardConfig>(key: K, value: WizardConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => {
    setInput("");
    setConversionResult(null);
    setGenerationResult(null);
  };

  const loadExample = () => {
    setInput("get current user info");
  };

  return {
    input,
    mode,
    config,
    conversionResult,
    generationResult,
    isProcessing,
    setInput,
    setMode,
    updateConfig,
    convert,
    generate,
    reset,
    loadExample,
  };
}
