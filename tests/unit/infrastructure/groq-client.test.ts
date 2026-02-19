import { describe, it, expect, vi, beforeEach } from "vitest";
import { GroqClient } from "@/infrastructure/external/groq-client";

describe("GroqClient", () => {
  let client: GroqClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new GroqClient("test-groq-key");
  });

  it("should report as available", () => {
    expect(client.isAvailable()).toBe(true);
  });

  it("should generate text via fetch and return normalized response", async () => {
    const mockResponse = {
      choices: [{ message: { content: '{"data": "test"}' } }],
      usage: {
        prompt_tokens: 15,
        completion_tokens: 25,
        total_tokens: 40,
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

    expect(result.text).toBe('{"data": "test"}');
    expect(result.provider).toBe("groq");
    expect(result.model).toBe("llama-3.1-70b-versatile");
    expect(result.usage.promptTokens).toBe(15);
    expect(result.usage.completionTokens).toBe(25);
    expect(result.usage.totalTokens).toBe(40);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);

    expect(fetch).toHaveBeenCalledWith(
      "https://api.groq.com/openai/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-groq-key",
        }),
      }),
    );
  });

  it("should throw on API error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve("Unauthorized"),
      }),
    );

    await expect(
      client.generateText("test", "system"),
    ).rejects.toThrow("Groq API error (401): Unauthorized");
  });

  it("should pass generation options", async () => {
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

    await client.generateText("p", "s", {
      maxTokens: 512,
      temperature: 0.5,
      topP: 0.9,
    });

    const callBody = JSON.parse(
      (vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit).body as string,
    );
    expect(callBody.max_tokens).toBe(512);
    expect(callBody.temperature).toBe(0.5);
    expect(callBody.top_p).toBe(0.9);
  });
});
