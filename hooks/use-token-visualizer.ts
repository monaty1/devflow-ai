"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { TokenVisualization, TokenizerProvider } from "@/types/token-visualizer";
import { useSmartNavigation } from "@/hooks/use-smart-navigation";
import { TOKEN_VISUALIZER_WORKER_SOURCE } from "@/lib/application/token-visualizer/worker-source";

interface UseTokenVisualizerReturn {
  input: string;
  setInput: (input: string) => void;
  provider: TokenizerProvider;
  setProvider: (provider: TokenizerProvider) => void;
  visualization: TokenVisualization | null;
  allProviderResults: { provider: TokenizerProvider; result: TokenVisualization }[];
  isAnalyzing: boolean;
  tokenize: (input: string, provider: TokenizerProvider, compareAll?: boolean) => Promise<void>;
  reset: () => void;
}

export function useTokenVisualizer(): UseTokenVisualizerReturn {
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState<TokenizerProvider>("openai");
  const [visualization, setVisualization] = useState<TokenVisualization | null>(null);
  const [allProviderResults, setAllProviderResults] = useState<{ provider: TokenizerProvider; result: TokenVisualization }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  
  const { getSharedData } = useSmartNavigation();

  useEffect(() => {
    // Initialize worker
    const blob = new Blob([TOKEN_VISUALIZER_WORKER_SOURCE], { type: "application/javascript" });
    const worker = new Worker(URL.createObjectURL(blob));
    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, []);

  useEffect(() => {
    const shared = getSharedData();
    if (shared) {
      setInput(shared);
      tokenize(shared, provider, true);
    }
  }, [getSharedData]);

  const tokenize = useCallback(async (text: string, p: TokenizerProvider, compareAll: boolean = false) => {
    if (!text.trim()) return;
    setIsAnalyzing(true);

    return new Promise<void>((resolve, reject) => {
      if (!workerRef.current) {
        setIsAnalyzing(false);
        reject(new Error("Worker not initialized"));
        return;
      }

      const worker = workerRef.current;

      const handleMessage = (e: MessageEvent) => {
        if (e.data.type === "success") {
          if (e.data.compareAll) {
            setAllProviderResults(e.data.results);
            const selected = e.data.results.find((r: any) => r.provider === p)?.result;
            setVisualization(selected || e.data.results[0].result);
          } else {
            setVisualization(e.data.result);
          }
          setIsAnalyzing(false);
          worker.removeEventListener("message", handleMessage);
          resolve();
        } else {
          setIsAnalyzing(false);
          worker.removeEventListener("message", handleMessage);
          reject(new Error(e.data.error || "Tokenization failed"));
        }
      };

      worker.addEventListener("message", handleMessage);
      worker.postMessage({ input: text, provider: p, compareAll });
    });
  }, []);

  const reset = () => {
    setInput("");
    setProvider("openai");
    setVisualization(null);
    setAllProviderResults([]);
  };

  return {
    input,
    setInput,
    provider,
    setProvider,
    visualization,
    allProviderResults,
    isAnalyzing,
    tokenize,
    reset
  };
}
