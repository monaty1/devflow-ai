"use client";

import { useState, useMemo, useCallback } from "react";
import useSWR from "swr";
import {
  compareAllModels,
  calculateMonthlyCost,
} from "@/lib/application/cost-calculator";
import type { CostComparison } from "@/types/cost-calculator";
import { AI_MODELS } from "@/config/ai-models";
import { fetchLatestPrices, PRICING_CACHE_KEY } from "@/infrastructure/services/pricing-service";


function getInitialInputTokens(): number {
  if (typeof window === "undefined") return 1000;
  try {
    const shared = localStorage.getItem("devflow-shared-data");
    if (shared) return Math.ceil(shared.length / 4);
  } catch {
    // Storage unavailable
  }
  return 1000;
}

export function useCostCalculator() {
  const [inputTokens, setInputTokens] = useState(getInitialInputTokens);
  const [outputTokens, setOutputTokens] = useState(500);
  const [dailyRequests, setDailyRequests] = useState(100);
  const [selectedModelId, setSelectedModelId] = useState("gpt-4o");
  
  const { data: latestModels, isValidating, mutate } = useSWR(
    PRICING_CACHE_KEY,
    fetchLatestPrices,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 3600000, // 1 hour
    }
  );

  const models = useMemo(() => {
    return latestModels && latestModels.length > 0 ? latestModels : AI_MODELS;
  }, [latestModels]);

  const comparison: CostComparison | null = useMemo(() => {
    if (inputTokens <= 0 && outputTokens <= 0) return null;
    return compareAllModels(inputTokens, outputTokens, models);
  }, [inputTokens, outputTokens, models]);

  const selectedModel = useMemo(
    () => models.find((m) => m.id === selectedModelId) || models[0],
    [selectedModelId, models]
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
    isSyncing: isValidating,
    lastSync: latestModels ? new Date().toISOString() : null,
    syncPrices: () => mutate(),
    models
  };
}
