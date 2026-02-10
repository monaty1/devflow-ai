import type { AIModel } from "@/types/cost-calculator";

export const AI_MODELS: AIModel[] = [
  // OpenAI
  {
    id: "gpt-4o",
    provider: "openai",
    name: "gpt-4o",
    displayName: "GPT-4o",
    inputPricePerMToken: 2.5,
    outputPricePerMToken: 10.0,
    contextWindow: 128000,
    maxOutput: 16384,
    isPopular: true,
  },
  {
    id: "gpt-4o-mini",
    provider: "openai",
    name: "gpt-4o-mini",
    displayName: "GPT-4o Mini",
    inputPricePerMToken: 0.15,
    outputPricePerMToken: 0.6,
    contextWindow: 128000,
    maxOutput: 16384,
    isPopular: true,
  },
  {
    id: "gpt-4-turbo",
    provider: "openai",
    name: "gpt-4-turbo",
    displayName: "GPT-4 Turbo",
    inputPricePerMToken: 10.0,
    outputPricePerMToken: 30.0,
    contextWindow: 128000,
    maxOutput: 4096,
    isPopular: false,
  },
  {
    id: "o1-preview",
    provider: "openai",
    name: "o1-preview",
    displayName: "O1 Preview",
    inputPricePerMToken: 15.0,
    outputPricePerMToken: 60.0,
    contextWindow: 128000,
    maxOutput: 32768,
    isPopular: false,
  },

  // Anthropic
  {
    id: "claude-opus-4-5",
    provider: "anthropic",
    name: "claude-opus-4-5-20251101",
    displayName: "Claude Opus 4.5",
    inputPricePerMToken: 15.0,
    outputPricePerMToken: 75.0,
    contextWindow: 200000,
    maxOutput: 16384,
    isPopular: true,
  },
  {
    id: "claude-sonnet-4-5",
    provider: "anthropic",
    name: "claude-sonnet-4-5-20250929",
    displayName: "Claude Sonnet 4.5",
    inputPricePerMToken: 3.0,
    outputPricePerMToken: 15.0,
    contextWindow: 200000,
    maxOutput: 16384,
    isPopular: true,
  },
  {
    id: "claude-haiku-4-5",
    provider: "anthropic",
    name: "claude-haiku-4-5-20251001",
    displayName: "Claude Haiku 4.5",
    inputPricePerMToken: 0.8,
    outputPricePerMToken: 4.0,
    contextWindow: 200000,
    maxOutput: 16384,
    isPopular: true,
  },

  // Google
  {
    id: "gemini-pro",
    provider: "google",
    name: "gemini-1.5-pro",
    displayName: "Gemini 1.5 Pro",
    inputPricePerMToken: 1.25,
    outputPricePerMToken: 5.0,
    contextWindow: 1000000,
    maxOutput: 8192,
    isPopular: true,
  },
  {
    id: "gemini-flash",
    provider: "google",
    name: "gemini-1.5-flash",
    displayName: "Gemini 1.5 Flash",
    inputPricePerMToken: 0.075,
    outputPricePerMToken: 0.3,
    contextWindow: 1000000,
    maxOutput: 8192,
    isPopular: false,
  },

  // Meta
  {
    id: "llama-3-70b",
    provider: "meta",
    name: "llama-3-70b-instruct",
    displayName: "Llama 3 70B",
    inputPricePerMToken: 0.9,
    outputPricePerMToken: 2.7,
    contextWindow: 8192,
    maxOutput: 2048,
    isPopular: false,
  },
];

export const PROVIDER_LABELS: Record<
  string,
  { label: string; color: string; emoji: string }
> = {
  openai: {
    label: "OpenAI",
    color: "bg-gray-100 text-gray-900 dark:bg-gray-900/30 dark:text-gray-200",
    emoji: "🤖",
  },
  anthropic: {
    label: "Anthropic",
    color: "bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-200",
    emoji: "🔮",
  },
  google: {
    label: "Google",
    color: "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
    emoji: "🌐",
  },
  meta: {
    label: "Meta",
    color: "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
    emoji: "🦙",
  },
};
