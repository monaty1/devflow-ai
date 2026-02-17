import type { AIModel, AIProvider } from "@/types/cost-calculator";

const LITELLM_URL = "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";
export const PRICING_CACHE_KEY = "latest-ai-prices";

export interface LiteLLMModel {
  input_cost_per_token?: number;
  output_cost_per_token?: number;
  max_tokens?: number;
  litellm_provider?: string;
  mode?: string;
}

export async function fetchLatestPrices(): Promise<AIModel[]> {
  try {
    const response = await fetch(LITELLM_URL);
    if (!response.ok) throw new Error("Failed to fetch prices");
    
    const data: Record<string, LiteLLMModel> = await response.json();
    const models: AIModel[] = [];

    // We filter for common providers and models that have pricing info
    for (const [id, info] of Object.entries(data)) {
      if (!info.input_cost_per_token || !info.output_cost_per_token) continue;

      const provider = mapProvider(info.litellm_provider || "");
      if (!provider) continue;

      models.push({
        id,
        provider,
        name: id,
        displayName: formatDisplayName(id),
        // Convert cost per token to cost per 1M tokens
        inputPricePerMToken: info.input_cost_per_token * 1_000_000,
        outputPricePerMToken: info.output_cost_per_token * 1_000_000,
        contextWindow: info.max_tokens || 0,
        maxOutput: 4096, // Default as it's not always in the JSON
        isPopular: isPopularModel(id),
        updatedAt: new Date().toISOString().split("T")[0] ?? "",
        category: mapCategory(id, info.mode || "")
      });
    }

    return models;
  } catch (error) {
    console.error("Error syncing prices:", error);
    throw error;
  }
}

function mapProvider(litellmProvider: string): AIProvider | null {
  const p = litellmProvider.toLowerCase();
  if (p === "openai") return "openai";
  if (p === "anthropic") return "anthropic";
  if (p === "google") return "google";
  if (p === "deepseek") return "deepseek";
  if (p === "groq") return "groq";
  if (p === "mistral") return "mistral";
  if (p === "together_ai") return "together";
  return null;
}

function mapCategory(id: string, _mode: string): AIModel["category"] {
  const lowId = id.toLowerCase();
  if (lowId.includes("o1") || lowId.includes("reasoner") || lowId.includes("r1")) return "reasoning";
  if (lowId.includes("mini") || lowId.includes("flash") || lowId.includes("haiku")) return "lightweight";
  if (lowId.includes("coder") || lowId.includes("coding")) return "coding";
  return "general";
}

function isPopularModel(id: string): boolean {
  const popular = ["gpt-4o", "claude-3-5-sonnet", "gemini-1.5-pro", "deepseek-v3", "o1"];
  return popular.some(p => id.toLowerCase().includes(p));
}

function formatDisplayName(id: string): string {
  return id.split("/").pop() || id;
}
