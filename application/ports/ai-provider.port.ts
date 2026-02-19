import type { AITextResponse, GenerateOptions } from "@/types/ai";

/**
 * Port interface for AI text generation providers.
 * Decouples business logic from specific AI SDKs (Gemini, Groq, etc.).
 */
export interface AIProviderPort {
  generateText(
    prompt: string,
    systemPrompt: string,
    options?: GenerateOptions,
  ): Promise<AITextResponse>;

  isAvailable(): boolean;
}
