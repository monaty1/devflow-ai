"use client";

import { useState, useMemo, useCallback } from "react";
import {
  compareAllModels,
  calculateMonthlyCost,
} from "@/lib/application/cost-calculator";
import type { CostComparison } from "@/types/cost-calculator";
import { AI_MODELS } from "@/config/ai-models";

export function useCostCalculator() {
  const [inputTokens, setInputTokens] = useState(1000);
  const [outputTokens, setOutputTokens] = useState(500);
  const [dailyRequests, setDailyRequests] = useState(100);
  const [selectedModelId, setSelectedModelId] = useState("gpt-4o");

  const comparison: CostComparison | null = useMemo(() => {
    if (inputTokens <= 0 && outputTokens <= 0) return null;
    return compareAllModels(inputTokens, outputTokens);
  }, [inputTokens, outputTokens]);

  const selectedModel = useMemo(
    () => AI_MODELS.find((m) => m.id === selectedModelId),
    [selectedModelId]
  );

  const monthlyCost = useMemo(() => {
    if (!selectedModel) return 0;
    return calculateMonthlyCost(
      selectedModel,
      dailyRequests,
      inputTokens,
      outputTokens
    );
  }, [selectedModel, dailyRequests, inputTokens, outputTokens]);

  const reset = useCallback(() => {
    setInputTokens(1000);
    setOutputTokens(500);
    setDailyRequests(100);
    setSelectedModelId("gpt-4o");
  }, []);

  return {
    inputTokens,
    setInputTokens,
    outputTokens,
    setOutputTokens,
    dailyRequests,
    setDailyRequests,
    selectedModelId,
    setSelectedModelId,
    comparison,
    monthlyCost,
    reset,
  };
}
