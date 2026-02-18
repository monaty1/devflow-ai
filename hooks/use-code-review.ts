"use client";

import { useState, useCallback } from "react";
import type { CodeReviewResult, SupportedLanguage } from "@/types/code-review";
import { reviewCode } from "@/lib/application/code-review";

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
}

export function useCodeReview(): UseCodeReviewReturn {
  const [result, setResult] = useState<CodeReviewResult | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<SupportedLanguage>("typescript");

  const review = useCallback(
    async (
      codeToReview: string,
      lang: SupportedLanguage
    ): Promise<CodeReviewResult> => {
      setIsReviewing(true);
      try {
        const reviewResult = reviewCode(codeToReview, lang);
        setResult(reviewResult);
        return reviewResult;
      } finally {
        setIsReviewing(false);
      }
    },
    []
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
    applyRefactored
  };
}
