import type { AIProviderPort } from "@/application/ports/ai-provider.port";
import type { AIProviderType, BYOKConfig } from "@/types/ai";
import { getServerEnv } from "@/infrastructure/config/env";
import { GeminiClient } from "./gemini-client";
import { GroqClient } from "./groq-client";

/**
 * Creates an AI provider instance based on available configuration.
 *
 * Priority:
 * 1. BYOK key (user's own key) → use their chosen provider
 * 2. GEMINI_API_KEY env var → use Gemini free tier
 * 3. GROQ_API_KEY env var → use Groq fallback
 * 4. Nothing configured → returns null
 */
export function createAIProvider(byok?: BYOKConfig): AIProviderPort | null {
  // 1. BYOK — user provides their own key
  if (byok?.key) {
    return createProviderByType(byok.provider, byok.key);
  }

  // 2. Server-configured providers
  const env = getServerEnv();

  if (env.GEMINI_API_KEY) {
    return new GeminiClient(env.GEMINI_API_KEY);
  }

  if (env.GROQ_API_KEY) {
    return new GroqClient(env.GROQ_API_KEY);
  }

  // 3. Nothing available
  return null;
}

function createProviderByType(
  provider: AIProviderType,
  key: string,
): AIProviderPort {
  switch (provider) {
    case "gemini":
      return new GeminiClient(key);
    case "groq":
      return new GroqClient(key);
  }
}
