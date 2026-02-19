import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIProviderPort } from "@/application/ports/ai-provider.port";
import type { AITextResponse, GenerateOptions } from "@/types/ai";

const MODEL_ID = "gemini-2.0-flash";

/**
 * Google Gemini AI provider implementation.
 * Uses the official @google/generative-ai SDK.
 */
export class GeminiClient implements AIProviderPort {
  private readonly client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  isAvailable(): boolean {
    return true;
  }

  async generateText(
    prompt: string,
    systemPrompt: string,
    options?: GenerateOptions,
  ): Promise<AITextResponse> {
    const model = this.client.getGenerativeModel({
      model: MODEL_ID,
      systemInstruction: systemPrompt,
      generationConfig: {
        maxOutputTokens: options?.maxTokens ?? 4096,
        temperature: options?.temperature ?? 0.3,
        topP: options?.topP ?? 0.95,
      },
    });

    const start = Date.now();
    const result = await model.generateContent(prompt);
    const durationMs = Date.now() - start;

    const response = result.response;
    const text = response.text();
    const usage = response.usageMetadata;

    return {
      text,
      provider: "gemini",
      model: MODEL_ID,
      usage: {
        promptTokens: usage?.promptTokenCount ?? 0,
        completionTokens: usage?.candidatesTokenCount ?? 0,
        totalTokens: usage?.totalTokenCount ?? 0,
      },
      durationMs,
    };
  }
}
