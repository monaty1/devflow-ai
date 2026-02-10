export interface AIModel {
  id: string;
  provider: AIProvider;
  name: string;
  displayName: string;
  inputPricePerMToken: number;
  outputPricePerMToken: number;
  contextWindow: number;
  maxOutput: number;
  isPopular: boolean;
}

export type AIProvider = "openai" | "anthropic" | "google" | "meta";

export interface CostCalculation {
  id: string;
  model: AIModel;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  calculatedAt: string;
}

export interface CostComparison {
  inputTokens: number;
  outputTokens: number;
  results: CostCalculation[];
}
