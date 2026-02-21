import { describe, it, expect, vi, beforeEach } from "vitest";
import { PollinationsClient } from "@/infrastructure/external/pollinations-client";

describe("PollinationsClient", () => {
  let client: PollinationsClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new PollinationsClient();
  });

  it("should report as available", () => {
    expect(client.isAvailable()).toBe(true);
  });

  it("should not require an API key (constructor takes no args)", () => {
    const c = new PollinationsClient();
    expect(c.isAvailable()).toBe(true);
  });

  it("should generate text and return normalized response", async () => {
    const mockResponse = {
      choices: [{ message: { content: "pollinations response" } }],
      usage: {
        prompt_tokens: 8,
        completion_tokens: 16,
        total_tokens: 24,
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

    expect(result.text).toBe("pollinations response");
    expect(result.provider).toBe("pollinations");
    expect(result.model).toBe("openai");
    expect(result.usage.promptTokens).toBe(8);
    expect(result.usage.completionTokens).toBe(16);
    expect(result.usage.totalTokens).toBe(24);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);

    expect(fetch).toHaveBeenCalledWith(
      "https://text.pollinations.ai/openai",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("should throw on API error with status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Internal Server Error"),
      }),
    );

    await expect(
      client.generateText("test", "system"),
    ).rejects.toThrow("Pollinations API error (500): Internal Server Error");
  });
});
