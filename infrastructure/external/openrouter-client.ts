import type { AIProviderPort } from "@/application/ports/ai-provider.port";
import type { AITextResponse, GenerateOptions } from "@/types/ai";

const MODEL_ID = "meta-llama/llama-3.3-70b-instruct:free";
const OPENROUTER_API_URL =
  "https://openrouter.ai/api/v1/chat/completions";

interface OpenRouterChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenRouter AI provider — free tier with API key.
 * Uses the OpenAI-compatible chat completions endpoint.
 * Free models: Llama 3.3 70B, DeepSeek R1, Gemma 3, Mistral Small, etc.
 * Rate limits: 20 req/min, 50 req/day (free tier).
 */
export class OpenRouterClient implements AIProviderPort {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  isAvailable(): boolean {
    return true;
  }

  async generateText(
    prompt: string,
    systemPrompt: string,
    options?: GenerateOptions,
  ): Promise<AITextResponse> {
    const start = Date.now();

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "HTTP-Referer": "https://devflowai.vercel.app",
        "X-Title": "DevFlow AI",
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        max_tokens: options?.maxTokens ?? 4096,
        temperature: options?.temperature ?? 0.3,
        top_p: options?.topP ?? 0.95,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenRouter API error (${response.status}): ${errorText}`,
      );
    }

    const data = (await response.json()) as OpenRouterChatResponse;
    const durationMs = Date.now() - start;

    const text = data.choices[0]?.message?.content ?? "";

    return {
      text,
      provider: "openrouter",
      model: MODEL_ID,
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      },
      durationMs,
    };
  }
}
