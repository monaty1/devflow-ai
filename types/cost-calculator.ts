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
  benchmarkScore?: number; // MMLU or similar
  updatedAt: string;
  category: "general" | "reasoning" | "coding" | "lightweight";
}

export type AIProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "meta"
  | "mistral"
  | "groq"
  | "deepseek"
  | "together";

export interface CostCalculation {
  id: string;
  model: AIModel;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  calculatedAt: string;
  valueScore?: number;
}

export interface CostComparison {
  inputTokens: number;
  outputTokens: number;
  results: CostCalculation[];
}
