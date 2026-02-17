"use client";

import { useState, useMemo, useEffect } from "react";
import { createVisualization } from "@/lib/application/token-visualizer";
import type { TokenVisualization, TokenizerProvider } from "@/types/token-visualizer";
import { useSmartNavigation } from "@/hooks/use-smart-navigation";

export function useTokenVisualizer() {
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState<TokenizerProvider>("openai");
  const { getSharedData } = useSmartNavigation();

  useEffect(() => {
    const shared = getSharedData();
    if (shared) {
      setInput(shared);
    }
  }, [getSharedData]);

  const visualization: TokenVisualization | null = useMemo(() => {
    if (!input) return null;
    return createVisualization(input, provider);
  }, [input, provider]);

  const allProviderResults = useMemo(() => {
    if (!input) return [];
    return (["openai", "anthropic", "llama"] as TokenizerProvider[]).map(p => ({
      provider: p,
      result: createVisualization(input, p)
    }));
  }, [input]);

  const reset = () => {
    setInput("");
    setProvider("openai");
  };

  return { 
    input, 
    setInput, 
    provider, 
    setProvider, 
    visualization, 
    allProviderResults,
    reset 
  };
}
