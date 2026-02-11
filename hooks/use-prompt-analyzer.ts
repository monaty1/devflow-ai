"use client";

import { useState, useCallback } from "react";
import type { PromptAnalysisResult } from "@/types/prompt-analyzer";
import { analyzePrompt } from "@/lib/application/prompt-analyzer";
import { useToolHistory } from "@/hooks/use-tool-history";

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { history, addToHistory, clearHistory, removeFromHistory } =
    useToolHistory<PromptAnalysisResult>("devflow-analysis-history", 50);

  const analyze = useCallback(
    async (prompt: string): Promise<PromptAnalysisResult> => {
      setIsAnalyzing(true);

      // Simulate network delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 800));

      const analysisResult = analyzePrompt(prompt);
      setResult(analysisResult);
      addToHistory(analysisResult);

      setIsAnalyzing(false);
      return analysisResult;
    },
    [addToHistory],
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
