import type { AIProviderPort } from "@/application/ports/ai-provider.port";
import type { AITextResponse, GenerateOptions } from "@/types/ai";

const MODEL_ID = "llama-3.1-70b-versatile";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

interface GroqChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Groq AI provider implementation.
 * Uses raw fetch to the OpenAI-compatible API (no extra dependency).
 */
export class GroqClient implements AIProviderPort {
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

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
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
      throw new Error(`Groq API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as GroqChatResponse;
    const durationMs = Date.now() - start;

    const text = data.choices[0]?.message?.content ?? "";

    return {
      text,
      provider: "groq",
      model: MODEL_ID,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
      durationMs,
    };
  }
}
