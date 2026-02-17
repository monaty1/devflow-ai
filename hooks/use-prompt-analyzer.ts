"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { PromptAnalysisResult } from "@/types/prompt-analyzer";
import { useToolHistory } from "@/hooks/use-tool-history";
import { PROMPT_ANALYZER_WORKER_SOURCE } from "@/lib/application/prompt-analyzer/worker-source";

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
  const workerRef = useRef<Worker | null>(null);
  
  const { history, addToHistory, clearHistory, removeFromHistory } =
    useToolHistory<PromptAnalysisResult>("devflow-analysis-history", 50);

  useEffect(() => {
    // Initialize worker
    const blob = new Blob([PROMPT_ANALYZER_WORKER_SOURCE], { type: "application/javascript" });
    const worker = new Worker(URL.createObjectURL(blob));
    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, []);

  const analyze = useCallback(
    async (prompt: string): Promise<PromptAnalysisResult> => {
      setIsAnalyzing(true);

      return new Promise<PromptAnalysisResult>((resolve, reject) => {
        if (!workerRef.current) {
          setIsAnalyzing(false);
          reject(new Error("Worker not initialized"));
          return;
        }

        const worker = workerRef.current;

        const handleMessage = (e: MessageEvent) => {
          if (e.data.type === "success") {
            const analysisResult = e.data.result;
            setResult(analysisResult);
            addToHistory(analysisResult);
            setIsAnalyzing(false);
            worker.removeEventListener("message", handleMessage);
            resolve(analysisResult);
          } else {
            setIsAnalyzing(false);
            worker.removeEventListener("message", handleMessage);
            reject(new Error(e.data.error || "Analysis failed"));
          }
        };

        const handleError = (e: ErrorEvent) => {
          setIsAnalyzing(false);
          worker.removeEventListener("error", handleError);
          reject(new Error(e.message));
        };

        worker.addEventListener("message", handleMessage);
        worker.addEventListener("error", handleError);

        worker.postMessage(prompt);
      });
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
