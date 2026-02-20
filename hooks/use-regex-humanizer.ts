"use client";

import { useState, useCallback } from "react";
import type { RegexAnalysis, TestResult } from "@/types/regex-humanizer";
import { explainRegex, generateRegex, testRegex } from "@/lib/application/regex-humanizer";
import { useLocaleStore } from "@/lib/stores/locale-store";

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
  const locale = useLocaleStore((s) => s.locale);
  const [pattern, setPattern] = useState("");
  const [explanation, setExplanation] = useState<RegexAnalysis | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const explain = useCallback(async (patternInput: string) => {
    if (!patternInput.trim()) return;
    setIsExplaining(true);
    try {
      const result = explainRegex(patternInput, "javascript", locale);
      setExplanation(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExplaining(false);
    }
  }, [locale]);

  const generate = useCallback(async (description: string) => {
    if (!description.trim()) return;
    setIsGenerating(true);
    try {
      const regex = generateRegex(description, locale);
      setPattern(regex);
      // Auto-explain generated regex
      const explanationResult = explainRegex(regex, "javascript", locale);
      setExplanation(explanationResult);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  }, [locale]);

  const test = useCallback(async (regexPattern: string, text: string) => {
    try {
      const result = testRegex(regexPattern, text, locale);
      setTestResult(result);
    } catch (e) {
      console.error(e);
    }
  }, [locale]);

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
