"use client";

import { useState, useCallback } from "react";
import type { PromptAnalysisResult } from "@/types/prompt-analyzer";
import { analyzePrompt } from "@/lib/application/prompt-analyzer";

const STORAGE_KEY = "devflow-analysis-history";
const MAX_HISTORY = 50;

function getInitialHistory(): PromptAnalysisResult[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as PromptAnalysisResult[];
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

interface UsePromptAnalyzerReturn {
  result: PromptAnalysisResult | null;
  history: PromptAnalysisResult[];
  isAnalyzing: boolean;
  analyze: (prompt: string) => Promise<PromptAnalysisResult>;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
}

export function usePromptAnalyzer(): UsePromptAnalyzerReturn {
  const [result, setResult] = useState<PromptAnalysisResult | null>(null);
  const [history, setHistory] = useState<PromptAnalysisResult[]>(getInitialHistory);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Save history to localStorage
  const saveHistory = useCallback((newHistory: PromptAnalysisResult[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const analyze = useCallback(
    async (prompt: string): Promise<PromptAnalysisResult> => {
      setIsAnalyzing(true);

      // Simulate network delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 800));

      const analysisResult = analyzePrompt(prompt);
      setResult(analysisResult);

      // Add to history (most recent first)
      const newHistory = [analysisResult, ...history].slice(0, MAX_HISTORY);
      setHistory(newHistory);
      saveHistory(newHistory);

      setIsAnalyzing(false);
      return analysisResult;
    },
    [history, saveHistory]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, [saveHistory]);

  const removeFromHistory = useCallback(
    (id: string) => {
      const newHistory = history.filter((item) => item.id !== id);
      setHistory(newHistory);
      saveHistory(newHistory);
    },
    [history, saveHistory]
  );

  return {
    result,
    history,
    isAnalyzing,
    analyze,
    clearHistory,
    removeFromHistory,
  };
}
