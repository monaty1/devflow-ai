"use client";

import { useState, useCallback } from "react";
import { reviewCode } from "@/lib/application/code-review";
import type { CodeReviewResult, SupportedLanguage } from "@/types/code-review";

interface UseCodeReviewReturn {
  result: CodeReviewResult | null;
  isReviewing: boolean;
  review: (code: string, language: SupportedLanguage) => Promise<CodeReviewResult>;
  reset: () => void;
}

export function useCodeReview(): UseCodeReviewReturn {
  const [result, setResult] = useState<CodeReviewResult | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  const review = useCallback(
    async (
      code: string,
      language: SupportedLanguage
    ): Promise<CodeReviewResult> => {
      setIsReviewing(true);

      // Simulate processing time for better UX
      await new Promise((resolve) => setTimeout(resolve, 600));

      const reviewResult = reviewCode(code, language);
      setResult(reviewResult);
      setIsReviewing(false);

      return reviewResult;
    },
    []
  );

  const reset = useCallback(() => {
    setResult(null);
  }, []);

  return { result, isReviewing, review, reset };
}
