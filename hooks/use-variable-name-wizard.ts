"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type {
  ConversionResult,
  GenerationResult,
  WizardConfig,
  NamingConvention,
} from "@/types/variable-name-wizard";
import { VARIABLE_NAME_WIZARD_WORKER_SOURCE } from "@/lib/application/variable-name-wizard/worker-source";

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
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const blob = new Blob([VARIABLE_NAME_WIZARD_WORKER_SOURCE], { type: "application/javascript" });
    const worker = new Worker(URL.createObjectURL(blob));
    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, []);

  const runWorker = useCallback((action: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error("Worker not initialized"));
        return;
      }

      const worker = workerRef.current;

      const handleMessage = (e: MessageEvent) => {
        if (e.data.type === "success") {
          worker.removeEventListener("message", handleMessage);
          resolve(e.data.result);
        } else {
          worker.removeEventListener("message", handleMessage);
          reject(new Error(e.data.error || "Worker error"));
        }
      };

      worker.addEventListener("message", handleMessage);
      worker.postMessage({ action, payload });
    });
  }, []);

  const convert = useCallback(async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    try {
      const result = await runWorker("convert", { name: input });
      setConversionResult({
        id: crypto.randomUUID(),
        original: input,
        originalConvention: "unknown",
        conversions: result['conversions'] as Record<NamingConvention, string>,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  }, [input, runWorker]);

  const generate = useCallback(async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    try {
      const result = await runWorker("generate", {
        context: input,
        language: config.language,
        type: config.type
      });
      setGenerationResult(result as unknown as GenerationResult);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  }, [input, config, runWorker]);

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
