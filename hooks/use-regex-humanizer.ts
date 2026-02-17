"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { RegexAnalysis, TestResult } from "@/types/regex-humanizer";
import { REGEX_HUMANIZER_WORKER_SOURCE } from "@/lib/application/regex-humanizer/worker-source";

interface UseRegexHumanizerReturn {
  pattern: string;
  explanation: RegexAnalysis | null;
  testResult: TestResult | null;
  isExplaining: boolean;
  isGenerating: boolean;
  setPattern: (pattern: string) => void;
  explain: (pattern: string) => Promise<void>;
  generate: (description: string) => Promise<void>;
  test: (pattern: string, text: string) => Promise<void>;
  reset: () => void;
}

export function useRegexHumanizer(): UseRegexHumanizerReturn {
  const [pattern, setPattern] = useState("");
  const [explanation, setExplanation] = useState<RegexAnalysis | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const blob = new Blob([REGEX_HUMANIZER_WORKER_SOURCE], { type: "application/javascript" });
    const worker = new Worker(URL.createObjectURL(blob));
    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, []);

  const runWorker = useCallback((action: string, payload: Record<string, unknown>): Promise<unknown> => {
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

  const explain = useCallback(async (patternInput: string) => {
    if (!patternInput.trim()) return;
    setIsExplaining(true);
    try {
      const result = await runWorker("explain", { patternInput }) as RegexAnalysis;
      setExplanation(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExplaining(false);
    }
  }, [runWorker]);

  const generate = useCallback(async (description: string) => {
    if (!description.trim()) return;
    setIsGenerating(true);
    try {
      const regex = await runWorker("generate", { description }) as string;
      setPattern(regex);
      // Auto-explain generated regex
      const explanationResult = await runWorker("explain", { patternInput: regex }) as RegexAnalysis;
      setExplanation(explanationResult);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  }, [runWorker]);

  const test = useCallback(async (regexPattern: string, text: string) => {
    try {
      const result = await runWorker("test", { pattern: regexPattern, text }) as TestResult;
      setTestResult(result);
    } catch (e) {
      console.error(e);
    }
  }, [runWorker]);

  const reset = useCallback(() => {
    setPattern("");
    setExplanation(null);
    setTestResult(null);
  }, []);

  return {
    pattern,
    explanation,
    testResult,
    isExplaining,
    isGenerating,
    setPattern,
    explain,
    generate,
    test,
    reset,
  };
}
