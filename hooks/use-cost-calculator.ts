"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  compareAllModels,
  calculateMonthlyCost,
} from "@/lib/application/cost-calculator";
import type { CostComparison, AIModel } from "@/types/cost-calculator";
import { AI_MODELS } from "@/config/ai-models";
import { fetchLatestPrices } from "@/infrastructure/services/pricing-service";
import { useSmartNavigation } from "@/hooks/use-smart-navigation";

export function useCostCalculator() {
  const [inputTokens, setInputTokens] = useState(1000);
  const [outputTokens, setOutputTokens] = useState(500);
  const [dailyRequests, setDailyRequests] = useState(100);
  const [selectedModelId, setSelectedModelId] = useState("gpt-4o");
  const [models, setModels] = useState<AIModel[]>(AI_MODELS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  
  const { getSharedData } = useSmartNavigation();

  useEffect(() => {
    const shared = getSharedData();
    if (shared) {
      // Estimate tokens from shared text (approx 4 chars per token)
      setInputTokens(Math.ceil(shared.length / 4));
    }
  }, [getSharedData]);

  const syncPrices = useCallback(async () => {
    setIsSyncing(true);
    try {
      const latest = await fetchLatestPrices();
      if (latest.length > 0) {
        setModels(latest);
        setLastSync(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("Failed to sync prices, using fallbacks", error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    syncPrices();
  }, [syncPrices]);

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
    isSyncing,
    lastSync,
    syncPrices,
    models
  };
}
