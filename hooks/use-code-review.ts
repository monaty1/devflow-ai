"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { CodeReviewResult, SupportedLanguage } from "@/types/code-review";
import { CODE_REVIEW_WORKER_SOURCE } from "@/lib/application/code-review/worker-source";

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
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Initialize worker
    const blob = new Blob([CODE_REVIEW_WORKER_SOURCE], { type: "application/javascript" });
    const worker = new Worker(URL.createObjectURL(blob));
    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, []);

  const review = useCallback(
    async (
      codeToReview: string,
      lang: SupportedLanguage
    ): Promise<CodeReviewResult> => {
      setIsReviewing(true);

      return new Promise<CodeReviewResult>((resolve, reject) => {
        if (!workerRef.current) {
          setIsReviewing(false);
          reject(new Error("Worker not initialized"));
          return;
        }

        const worker = workerRef.current;

        const handleMessage = (e: MessageEvent) => {
          if (e.data.type === "success") {
            const reviewResult = e.data.result;
            setResult(reviewResult);
            setIsReviewing(false);
            worker.removeEventListener("message", handleMessage);
            resolve(reviewResult);
          } else {
            setIsReviewing(false);
            worker.removeEventListener("message", handleMessage);
            reject(new Error(e.data.error || "Review failed"));
          }
        };

        const handleError = (e: ErrorEvent) => {
          setIsReviewing(false);
          worker.removeEventListener("error", handleError);
          reject(new Error(e.message));
        };

        worker.addEventListener("message", handleMessage);
        worker.addEventListener("error", handleError);

        worker.postMessage({ code: codeToReview, language: lang });
      });
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
