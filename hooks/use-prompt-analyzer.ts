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

      // Perform analysis immediately (CPU bound but fast for typical prompts)
      // In a real heavy app, this could be moved to a Web Worker
      try {
        const analysisResult = analyzePrompt(prompt);
        setResult(analysisResult);
        addToHistory(analysisResult);
        return analysisResult;
      } finally {
        setIsAnalyzing(false);
      }
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
