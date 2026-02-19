import type { AIProviderPort } from "@/application/ports/ai-provider.port";
import type { AIProviderType, BYOKConfig } from "@/types/ai";
import { getServerEnv } from "@/infrastructure/config/env";
import { GeminiClient } from "./gemini-client";
import { GroqClient } from "./groq-client";
import { OpenRouterClient } from "./openrouter-client";
import { PollinationsClient } from "./pollinations-client";

/**
 * Creates an AI provider instance based on available configuration.
 *
 * Priority:
 * 1. BYOK key (user's own key) → use their chosen provider
 * 2. GEMINI_API_KEY env var → Gemini 2.0 Flash
 * 3. GROQ_API_KEY env var → Groq Llama 3.1 70B
 * 4. OPENROUTER_API_KEY env var → OpenRouter free models
 * 5. Pollinations fallback → always available, no key needed
 */
export function createAIProvider(byok?: BYOKConfig): AIProviderPort | null {
  // 1. BYOK — user provides their own key
  if (byok?.key) {
    return createProviderByType(byok.provider, byok.key);
  }

  // 2. Server-configured providers (highest quality first)
  const env = getServerEnv();

  if (env.GEMINI_API_KEY) {
    return new GeminiClient(env.GEMINI_API_KEY);
  }

  if (env.GROQ_API_KEY) {
    return new GroqClient(env.GROQ_API_KEY);
  }

  if (env.OPENROUTER_API_KEY) {
    return new OpenRouterClient(env.OPENROUTER_API_KEY);
  }

  // 3. Pollinations — free, no API key needed (always available)
  return new PollinationsClient();
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
    case "openrouter":
      return new OpenRouterClient(key);
    case "pollinations":
      return new PollinationsClient();
  }
}
