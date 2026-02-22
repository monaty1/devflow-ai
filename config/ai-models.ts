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
    benchmarkScore: 88.7,
    updatedAt: "2026-02-15",
    category: "general"
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
    benchmarkScore: 82.0,
    updatedAt: "2026-02-15",
    category: "lightweight"
  },
  {
    id: "o1",
    provider: "openai",
    name: "o1-2024-12-17",
    displayName: "O1 (Full Reasoning)",
    inputPricePerMToken: 15.0,
    outputPricePerMToken: 60.0,
    contextWindow: 128000,
    maxOutput: 32768,
    isPopular: true,
    benchmarkScore: 92.3,
    updatedAt: "2026-02-15",
    category: "reasoning"
  },

  // Anthropic
  {
    id: "claude-opus-4-6",
    provider: "anthropic",
    name: "claude-opus-4-6",
    displayName: "Claude Opus 4.6",
    inputPricePerMToken: 15.0,
    outputPricePerMToken: 75.0,
    contextWindow: 200000,
    maxOutput: 32000,
    isPopular: true,
    benchmarkScore: 95.2,
    updatedAt: "2026-02-22",
    category: "general"
  },
  {
    id: "claude-sonnet-4-6",
    provider: "anthropic",
    name: "claude-sonnet-4-6",
    displayName: "Claude Sonnet 4.6",
    inputPricePerMToken: 3.0,
    outputPricePerMToken: 15.0,
    contextWindow: 200000,
    maxOutput: 16384,
    isPopular: true,
    benchmarkScore: 92.1,
    updatedAt: "2026-02-22",
    category: "general"
  },
  {
    id: "claude-haiku-4-5",
    provider: "anthropic",
    name: "claude-haiku-4-5-20251001",
    displayName: "Claude 4.5 Haiku",
    inputPricePerMToken: 0.8,
    outputPricePerMToken: 4.0,
    contextWindow: 200000,
    maxOutput: 16384,
    isPopular: true,
    benchmarkScore: 82.0,
    updatedAt: "2026-02-22",
    category: "lightweight"
  },

  // DeepSeek (High Value)
  {
    id: "deepseek-v3",
    provider: "deepseek",
    name: "deepseek-v3",
    displayName: "DeepSeek V3",
    inputPricePerMToken: 0.14,
    outputPricePerMToken: 0.28,
    contextWindow: 64000,
    maxOutput: 8192,
    isPopular: true,
    benchmarkScore: 88.5,
    updatedAt: "2026-02-15",
    category: "general"
  },
  {
    id: "deepseek-r1",
    provider: "deepseek",
    name: "deepseek-reasoner",
    displayName: "DeepSeek R1 (Reasoning)",
    inputPricePerMToken: 0.55,
    outputPricePerMToken: 2.19,
    contextWindow: 64000,
    maxOutput: 8192,
    isPopular: true,
    benchmarkScore: 90.8,
    updatedAt: "2026-02-15",
    category: "reasoning"
  },

  // Groq (Performance/Speed)
  {
    id: "llama-3-1-70b-groq",
    provider: "groq",
    name: "llama-3.1-70b-versatile",
    displayName: "Llama 3.1 70B (Groq)",
    inputPricePerMToken: 0.59,
    outputPricePerMToken: 0.79,
    contextWindow: 128000,
    maxOutput: 8192,
    isPopular: true,
    benchmarkScore: 86.0,
    updatedAt: "2026-02-15",
    category: "general"
  },

  // Google
  {
    id: "gemini-2-0-flash",
    provider: "google",
    name: "gemini-2.0-flash-exp",
    displayName: "Gemini 2.0 Flash",
    inputPricePerMToken: 0.1,
    outputPricePerMToken: 0.4,
    contextWindow: 1000000,
    maxOutput: 8192,
    isPopular: true,
    benchmarkScore: 82.5,
    updatedAt: "2026-02-15",
    category: "lightweight"
  }
];

export const PROVIDER_LABELS: Record<
  string,
  { label: string; color: string; emoji: string }
> = {
  openai: {
    label: "OpenAI",
    color: "bg-zinc-100 text-zinc-900 dark:bg-zinc-900/30 dark:text-zinc-200",
    emoji: "🤖",
  },
  anthropic: {
    label: "Anthropic",
    color: "bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200",
    emoji: "🔮",
  },
  google: {
    label: "Google",
    color: "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
    emoji: "🌐",
  },
  deepseek: {
    label: "DeepSeek",
    color: "bg-cyan-100 text-cyan-900 dark:bg-cyan-900/30 dark:text-cyan-200",
    emoji: "🐋",
  },
  groq: {
    label: "Groq",
    color: "bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200",
    emoji: "⚡",
  },
  meta: {
    label: "Meta",
    color: "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
    emoji: "🦙",
  },
};
