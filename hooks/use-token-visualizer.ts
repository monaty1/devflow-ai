"use client";

import { useState, useMemo } from "react";
import { createVisualization } from "@/lib/application/token-visualizer";
import type { TokenVisualization } from "@/types/token-visualizer";

export function useTokenVisualizer() {
  const [input, setInput] = useState("");

  const visualization: TokenVisualization | null = useMemo(() => {
    if (!input.trim()) return null;
    return createVisualization(input);
  }, [input]);

  const reset = () => setInput("");

  return { input, setInput, visualization, reset };
}
