import type { AIProviderPort } from "@/application/ports/ai-provider.port";
import type { AITextResponse, GenerateOptions } from "@/types/ai";

const MODEL_ID = "openai";
const POLLINATIONS_API_URL =
  "https://text.pollinations.ai/openai";

interface PollinationsChatResponse {
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
 * Pollinations AI provider — 100% free, no API key required.
 * Uses the OpenAI-compatible chat completions endpoint.
 * Rate limits: ~1 req/15s anonymous, ~1 req/5s with seed.
 */
export class PollinationsClient implements AIProviderPort {
  isAvailable(): boolean {
    return true;
  }

  async generateText(
    prompt: string,
    systemPrompt: string,
    options?: GenerateOptions,
  ): Promise<AITextResponse> {
    const start = Date.now();

    const response = await fetch(POLLINATIONS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
        `Pollinations API error (${response.status}): ${errorText}`,
      );
    }

    const data = (await response.json()) as PollinationsChatResponse;
    const durationMs = Date.now() - start;

    const text = data.choices[0]?.message?.content ?? "";

    return {
      text,
      provider: "pollinations",
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
