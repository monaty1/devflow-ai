import type {
  AIModel,
  CostCalculation,
  CostComparison,
} from "@/types/cost-calculator";
import { AI_MODELS } from "@/config/ai-models";

export function calculateCost(
  model: AIModel,
  inputTokens: number,
  outputTokens: number
): CostCalculation {
  const inputCost = (inputTokens / 1_000_000) * model.inputPricePerMToken;
  const outputCost = (outputTokens / 1_000_000) * model.outputPricePerMToken;

  return {
    id: `${model.id}-${Date.now()}`,
    model,
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
    calculatedAt: new Date().toISOString(),
  };
}

export function compareAllModels(
  inputTokens: number,
  outputTokens: number
): CostComparison {
  const results = AI_MODELS.map((model) =>
    calculateCost(model, inputTokens, outputTokens)
  ).sort((a, b) => a.totalCost - b.totalCost);

  return { inputTokens, outputTokens, results };
}

export function calculateMonthlyCost(
  model: AIModel,
  dailyRequests: number,
  avgInputTokens: number,
  avgOutputTokens: number,
  daysPerMonth: number = 30
): number {
  const dailyCost =
    dailyRequests *
    ((avgInputTokens / 1_000_000) * model.inputPricePerMToken +
      (avgOutputTokens / 1_000_000) * model.outputPricePerMToken);

  return dailyCost * daysPerMonth;
}

export function formatCost(cost: number): string {
  if (cost < 0.0001) return "$0.00";
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  if (cost < 1) return `$${cost.toFixed(3)}`;
  if (cost < 100) return `$${cost.toFixed(2)}`;
  return `$${cost.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}
