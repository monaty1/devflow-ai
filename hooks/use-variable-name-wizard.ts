"use client";

import { useState, useCallback, useEffect } from "react";
import type {
  ConversionResult,
  GenerationResult,
  WizardConfig,
} from "@/types/variable-name-wizard";
import { convertToAll, generateSuggestions } from "@/lib/application/variable-name-wizard";
import { useLocaleStore } from "@/lib/stores/locale-store";

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

const STORAGE_KEY = "devflow-variable-name-wizard-config";

const DEFAULT_CONFIG: WizardConfig = {
  preferredConvention: "camelCase",
  maxSuggestions: 10,
  includeAbbreviations: false,
  language: "typescript",
  type: "variable",
};

function loadConfig(): WizardConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) } as WizardConfig;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function useVariableNameWizard(): UseVariableNameWizardReturn {
  const locale = useLocaleStore((s) => s.locale);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"convert" | "generate">("generate");
  const [config, setConfig] = useState<WizardConfig>(loadConfig);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch { /* quota exceeded — ignore */ }
  }, [config]);

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
      const result = generateSuggestions(input, config.type, config, locale);
      setGenerationResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  }, [input, config, locale]);

  const updateConfig = useCallback(<K extends keyof WizardConfig>(key: K, value: WizardConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setInput("");
    setConversionResult(null);
    setGenerationResult(null);
  }, []);

  const loadExample = useCallback(() => {
    setInput("get current user info");
  }, []);

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
