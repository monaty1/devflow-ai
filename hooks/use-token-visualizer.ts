"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { TokenVisualization, TokenizerProvider } from "@/types/token-visualizer";
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

function getSharedInput(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("devflow-shared-data") ?? "";
}

export function useTokenVisualizer(): UseTokenVisualizerReturn {
  const [input, setInput] = useState(getSharedInput);
  const [provider, setProvider] = useState<TokenizerProvider>("openai");
  const [visualization, setVisualization] = useState<TokenVisualization | null>(null);
  const [allProviderResults, setAllProviderResults] = useState<{ provider: TokenizerProvider; result: TokenVisualization }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Initialize worker
    const blob = new Blob([TOKEN_VISUALIZER_WORKER_SOURCE], { type: "application/javascript" });
    const worker = new Worker(URL.createObjectURL(blob));
    workerRef.current = worker;

    // Auto-tokenize shared data on mount via worker subscription
    if (!initializedRef.current) {
      initializedRef.current = true;
      const shared = getSharedInput();
      if (shared) {
        const handleInitMessage = (e: MessageEvent) => {
          if (e.data.type === "success") {
            if (e.data.compareAll) {
              setAllProviderResults(e.data.results);
              const selected = e.data.results.find(
                (r: { provider: TokenizerProvider; result: TokenVisualization }) => r.provider === "openai"
              )?.result;
              setVisualization(selected || e.data.results[0].result);
            } else {
              setVisualization(e.data.result);
            }
          }
          worker.removeEventListener("message", handleInitMessage);
        };
        worker.addEventListener("message", handleInitMessage);
        worker.postMessage({ input: shared, provider: "openai", compareAll: true });
      }
    }

    return () => {
      worker.terminate();
    };
  }, []);

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
            const selected = e.data.results.find((r: { provider: TokenizerProvider; result: TokenVisualization }) => r.provider === p)?.result;
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
