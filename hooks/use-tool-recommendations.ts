"use client";

import { useMemo } from "react";
import {
  detectDataTypes,
  getRecommendations,
} from "@/lib/application/tool-recommendations";
import type { ToolRecommendation } from "@/types/tool-recommendations";

/**
 * Hook that provides context-aware tool recommendations
 * based on current tool input/output.
 */
export function useToolRecommendations(
  toolId: string,
  input: string,
  output: string
): ToolRecommendation[] {
  return useMemo(() => {
    const detectedTypes = detectDataTypes(input || output);
    return getRecommendations({
      toolId,
      input,
      output,
      detectedTypes,
    });
  }, [toolId, input, output]);
}
