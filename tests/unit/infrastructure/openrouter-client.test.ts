import { describe, it, expect, vi, beforeEach } from "vitest";
import { OpenRouterClient } from "@/infrastructure/external/openrouter-client";

describe("OpenRouterClient", () => {
  let client: OpenRouterClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new OpenRouterClient("test-or-key");
  });

  it("should report as available", () => {
    expect(client.isAvailable()).toBe(true);
  });

  it("should generate text and return normalized response", async () => {
    const mockResponse = {
      choices: [{ message: { content: '{"result": "openrouter-test"}' } }],
      usage: {
        prompt_tokens: 12,
        completion_tokens: 22,
        total_tokens: 34,
      },
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }),
    );

    const result = await client.generateText("test prompt", "system prompt");

    expect(result.text).toBe('{"result": "openrouter-test"}');
    expect(result.provider).toBe("openrouter");
    expect(result.model).toBe("meta-llama/llama-3.3-70b-instruct:free");
    expect(result.usage.promptTokens).toBe(12);
    expect(result.usage.completionTokens).toBe(22);
    expect(result.usage.totalTokens).toBe(34);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);

    expect(fetch).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-or-key",
        }),
      }),
    );
  });

  it("should throw on API error with status and body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: () => Promise.resolve("Forbidden"),
      }),
    );

    await expect(
      client.generateText("test", "system"),
    ).rejects.toThrow("OpenRouter API error (403): Forbidden");
  });

  it("should use default options (maxTokens 4096, temperature 0.3)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: "ok" } }],
            usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
          }),
      }),
    );

    await client.generateText("p", "s");

    const callBody = JSON.parse(
      (vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit).body as string,
    );
    expect(callBody.max_tokens).toBe(4096);
    expect(callBody.temperature).toBe(0.3);
    expect(callBody.top_p).toBe(0.95);
  });
});
