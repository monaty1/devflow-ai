import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Google AI SDK with a proper class constructor
const mockGenerateContent = vi.fn();
const mockGetGenerativeModel = vi.fn().mockReturnValue({
  generateContent: mockGenerateContent,
});

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class MockGoogleGenerativeAI {
    getGenerativeModel = mockGetGenerativeModel;
  },
}));

import { GeminiClient } from "@/infrastructure/external/gemini-client";

describe("GeminiClient", () => {
  let client: GeminiClient;

  beforeEach(() => {
    vi.clearAllMocks();
    // Re-set return value after clearAllMocks
    mockGetGenerativeModel.mockReturnValue({
      generateContent: mockGenerateContent,
    });
    client = new GeminiClient("test-api-key");
  });

  it("should report as available", () => {
    expect(client.isAvailable()).toBe(true);
  });

  it("should generate text and return normalized response", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => '{"result": "test"}',
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 20,
          totalTokenCount: 30,
        },
      },
    });

    const result = await client.generateText("test prompt", "system prompt");

    expect(result.text).toBe('{"result": "test"}');
    expect(result.provider).toBe("gemini");
    expect(result.model).toBe("gemini-2.0-flash");
    expect(result.usage.promptTokens).toBe(10);
    expect(result.usage.completionTokens).toBe(20);
    expect(result.usage.totalTokens).toBe(30);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("should handle missing usage metadata gracefully", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => "response",
        usageMetadata: undefined,
      },
    });

    const result = await client.generateText("test", "system");

    expect(result.usage.promptTokens).toBe(0);
    expect(result.usage.completionTokens).toBe(0);
    expect(result.usage.totalTokens).toBe(0);
  });

  it("should pass options to the model config", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => "ok",
        usageMetadata: {
          promptTokenCount: 0,
          candidatesTokenCount: 0,
          totalTokenCount: 0,
        },
      },
    });

    await client.generateText("p", "s", {
      maxTokens: 1024,
      temperature: 0.7,
    });

    expect(mockGetGenerativeModel).toHaveBeenCalledWith(
      expect.objectContaining({
        generationConfig: expect.objectContaining({
          maxOutputTokens: 1024,
          temperature: 0.7,
        }),
      }),
    );
  });
});
