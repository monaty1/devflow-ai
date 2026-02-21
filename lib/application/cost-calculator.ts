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
  const totalCost = inputCost + outputCost;

  // Calculate Value Score: Performance per Million Dollars
  // higher is better — undefined when cost is zero (free models)
  const valueScore = model.benchmarkScore && totalCost > 0
    ? (model.benchmarkScore / totalCost)
    : undefined;

  return {
    id: model.id,
    model,
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost,
    calculatedAt: new Date().toISOString(),
    valueScore
  };
}

export function compareAllModels(
  inputTokens: number,
  outputTokens: number,
  customModels?: AIModel[]
): CostComparison {
  const models = customModels || AI_MODELS;
  const results = models.map((model) =>
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

export type Currency = "USD" | "EUR" | "GBP";

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
};

// Approximate static exchange rates (relative to USD)
const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
};

export function convertCost(cost: number, currency: Currency): number {
  return cost * EXCHANGE_RATES[currency];
}

export function formatCost(cost: number, currency: Currency = "USD", locale: "en" | "es" = "en"): string {
  const converted = convertCost(cost, currency);
  const symbol = CURRENCY_SYMBOLS[currency];
  if (converted < 0.0001) return `${symbol}0.00`;
  if (converted < 0.01) return `${symbol}${converted.toFixed(4)}`;
  if (converted < 1) return `${symbol}${converted.toFixed(3)}`;
  if (converted < 100) return `${symbol}${converted.toFixed(2)}`;
  const loc = locale === "es" ? "es-ES" : "en-US";
  return `${symbol}${converted.toLocaleString(loc, { minimumFractionDigits: 2 })}`;
}

export function exportComparisonCsv(comparison: CostComparison, currency: Currency = "USD"): string {
  const headers = ["Model", "Provider", "Input Cost", "Output Cost", "Total Cost", "Value Score"];
  const rows = comparison.results.map((r) => [
    r.model.displayName,
    r.model.provider,
    formatCost(r.inputCost, currency),
    formatCost(r.outputCost, currency),
    formatCost(r.totalCost, currency),
    r.valueScore ? (r.valueScore / 1_000_000).toFixed(2) : "N/A",
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
