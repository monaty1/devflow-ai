import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchLatestPrices } from "@/infrastructure/services/pricing-service";

describe("PricingService — fetchLatestPrices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const sampleData = {
    "gpt-4o": {
      input_cost_per_token: 0.0000025,
      output_cost_per_token: 0.00001,
      max_tokens: 128000,
      litellm_provider: "openai",
      mode: "chat",
    },
    "claude-3-5-sonnet-20241022": {
      input_cost_per_token: 0.000003,
      output_cost_per_token: 0.000015,
      max_tokens: 200000,
      litellm_provider: "anthropic",
      mode: "chat",
    },
    "o1-mini": {
      input_cost_per_token: 0.000003,
      output_cost_per_token: 0.000012,
      max_tokens: 128000,
      litellm_provider: "openai",
      mode: "chat",
    },
    "gemini-1.5-flash": {
      input_cost_per_token: 0.0000000375,
      output_cost_per_token: 0.00000015,
      max_tokens: 1048576,
      litellm_provider: "google",
      mode: "chat",
    },
    "gpt-4o-mini": {
      input_cost_per_token: 0.00000015,
      output_cost_per_token: 0.0000006,
      max_tokens: 128000,
      litellm_provider: "openai",
      mode: "chat",
    },
    // Model without pricing — should be filtered out
    "no-pricing-model": {
      max_tokens: 4096,
      litellm_provider: "openai",
      mode: "chat",
    },
    // Model with unknown provider — should be filtered out
    "unknown-provider-model": {
      input_cost_per_token: 0.00001,
      output_cost_per_token: 0.00002,
      max_tokens: 4096,
      litellm_provider: "some_unknown_provider",
      mode: "chat",
    },
    // Model without max_tokens
    "deepseek-chat": {
      input_cost_per_token: 0.00000014,
      output_cost_per_token: 0.00000028,
      litellm_provider: "deepseek",
      mode: "chat",
    },
  };

  it("should fetch and return array of AIModel with correct fields", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(sampleData),
      }),
    );

    const models = await fetchLatestPrices();

    expect(models.length).toBeGreaterThan(0);
    const gpt4o = models.find((m) => m.id === "gpt-4o");
    expect(gpt4o).toBeDefined();
    expect(gpt4o?.provider).toBe("openai");
    expect(gpt4o?.inputPricePerMToken).toBe(2.5);
    expect(gpt4o?.outputPricePerMToken).toBe(10);
    expect(gpt4o?.contextWindow).toBe(128000);
    expect(gpt4o?.displayName).toBe("GPT-4o");
  });

  it("should filter out models without input_cost_per_token", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(sampleData),
      }),
    );

    const models = await fetchLatestPrices();
    const noPricing = models.find((m) => m.id === "no-pricing-model");
    expect(noPricing).toBeUndefined();
  });

  it("should filter out models with unknown provider", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(sampleData),
      }),
    );

    const models = await fetchLatestPrices();
    const unknown = models.find((m) => m.id === "unknown-provider-model");
    expect(unknown).toBeUndefined();
  });

  it("should categorize o1-mini as reasoning", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(sampleData),
      }),
    );

    const models = await fetchLatestPrices();
    const o1mini = models.find((m) => m.id === "o1-mini");
    expect(o1mini?.category).toBe("reasoning");
  });

  it("should categorize gpt-4o-mini as lightweight", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(sampleData),
      }),
    );

    const models = await fetchLatestPrices();
    const mini = models.find((m) => m.id === "gpt-4o-mini");
    expect(mini?.category).toBe("lightweight");
  });

  it("should mark gpt-4o as popular", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(sampleData),
      }),
    );

    const models = await fetchLatestPrices();
    const gpt4o = models.find((m) => m.id === "gpt-4o");
    expect(gpt4o?.isPopular).toBe(true);
  });

  it("should format display names correctly", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(sampleData),
      }),
    );

    const models = await fetchLatestPrices();
    const gpt4oMini = models.find((m) => m.id === "gpt-4o-mini");
    expect(gpt4oMini?.displayName).toBe("GPT-4o Mini");

    const flash = models.find((m) => m.id === "gemini-1.5-flash");
    expect(flash?.displayName).toBe("Gemini 1.5 Flash");
  });

  it("should re-throw error on fetch failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
      }),
    );

    await expect(fetchLatestPrices()).rejects.toThrow("Failed to fetch prices");
  });

  it("should set contextWindow to 0 for model without max_tokens", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(sampleData),
      }),
    );

    const models = await fetchLatestPrices();
    const deepseek = models.find((m) => m.id === "deepseek-chat");
    expect(deepseek?.contextWindow).toBe(0);
  });
});
