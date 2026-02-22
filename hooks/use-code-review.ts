"use client";

import { useState, useCallback } from "react";
import type { CodeReviewResult, SupportedLanguage } from "@/types/code-review";
import { reviewCode } from "@/lib/application/code-review";
import { useToolHistory } from "@/hooks/use-tool-history";

interface HistoryItem {
  id: string;
  input: string;
  output: string;
  timestamp: string;
}

interface UseCodeReviewReturn {
  result: CodeReviewResult | null;
  isReviewing: boolean;
  review: (code: string, language: SupportedLanguage) => Promise<CodeReviewResult>;
  reset: () => void;
  code: string;
  language: SupportedLanguage;
  setCode: (code: string) => void;
  setLanguage: (lang: SupportedLanguage) => void;
  applyRefactored: () => void;
  history: HistoryItem[];
  clearHistory: () => void;
}

export function useCodeReview(): UseCodeReviewReturn {
  const [result, setResult] = useState<CodeReviewResult | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<SupportedLanguage>("typescript");
  const { history, addToHistory: addItemToHistory, clearHistory } =
    useToolHistory<HistoryItem>("devflow-code-review-history", 15);

  const review = useCallback(
    async (
      codeToReview: string,
      lang: SupportedLanguage
    ): Promise<CodeReviewResult> => {
      setIsReviewing(true);
      try {
        const reviewResult = reviewCode(codeToReview, lang);
        setResult(reviewResult);
        addItemToHistory({
          id: crypto.randomUUID(),
          input: codeToReview.slice(0, 80) + (codeToReview.length > 80 ? "..." : ""),
          output: `Score: ${reviewResult.overallScore}/10 — ${reviewResult.issues.length} issues`,
          timestamp: new Date().toISOString(),
        });
        return reviewResult;
      } finally {
        setIsReviewing(false);
      }
    },
    [addItemToHistory]
  );

  const reset = useCallback(() => {
    setResult(null);
    setCode("");
  }, []);

  const applyRefactored = useCallback(() => {
    if (result?.refactoredCode) {
      setCode(result.refactoredCode);
    }
  }, [result]);

  return {
    result,
    isReviewing,
    review,
    reset,
    code,
    language,
    setCode,
    setLanguage,
    applyRefactored,
    history,
    clearHistory,
  };
}
