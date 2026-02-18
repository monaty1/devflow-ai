"use client";

import { useState, useCallback } from "react";
import type { RegexAnalysis, TestResult } from "@/types/regex-humanizer";
import { explainRegex, generateRegex, testRegex } from "@/lib/application/regex-humanizer";

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

  const explain = useCallback(async (patternInput: string) => {
    if (!patternInput.trim()) return;
    setIsExplaining(true);
    try {
      const result = explainRegex(patternInput);
      setExplanation(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExplaining(false);
    }
  }, []);

  const generate = useCallback(async (description: string) => {
    if (!description.trim()) return;
    setIsGenerating(true);
    try {
      const regex = generateRegex(description);
      setPattern(regex);
      // Auto-explain generated regex
      const explanationResult = explainRegex(regex);
      setExplanation(explanationResult);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const test = useCallback(async (regexPattern: string, text: string) => {
    try {
      const result = testRegex(regexPattern, text);
      setTestResult(result);
    } catch (e) {
      console.error(e);
    }
  }, []);

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
