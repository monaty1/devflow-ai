"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { TokenVisualization, TokenizerProvider } from "@/types/token-visualizer";
import { createVisualization } from "@/lib/application/token-visualizer";

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

const ALL_PROVIDERS: TokenizerProvider[] = ["openai", "anthropic", "llama"];

export function useTokenVisualizer(): UseTokenVisualizerReturn {
  const [input, setInput] = useState(getSharedInput);
  const [provider, setProvider] = useState<TokenizerProvider>("openai");
  const [visualization, setVisualization] = useState<TokenVisualization | null>(null);
  const [allProviderResults, setAllProviderResults] = useState<{ provider: TokenizerProvider; result: TokenVisualization }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const initializedRef = useRef(false);

  // Auto-tokenize shared data on mount
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      const shared = getSharedInput();
      if (shared) {
        const results = ALL_PROVIDERS.map(p => ({
          provider: p,
          result: createVisualization(shared, p),
        }));
        setAllProviderResults(results);
        const selected = results.find(r => r.provider === "openai")?.result;
        setVisualization(selected ?? results[0]?.result ?? null);
      }
    }
  }, []);

  const tokenize = useCallback(async (text: string, p: TokenizerProvider, compareAll: boolean = false) => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    try {
      if (compareAll) {
        const results = ALL_PROVIDERS.map(prov => ({
          provider: prov,
          result: createVisualization(text, prov),
        }));
        setAllProviderResults(results);
        const selected = results.find(r => r.provider === p)?.result;
        setVisualization(selected ?? results[0]?.result ?? null);
      } else {
        const result = createVisualization(text, p);
        setVisualization(result);
      }
    } finally {
      setIsAnalyzing(false);
    }
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
