import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock env module
const mockGetServerEnv = vi.fn();
vi.mock("@/infrastructure/config/env", () => ({
  getServerEnv: () => mockGetServerEnv(),
}));

// Mock all provider constructors
vi.mock("@/infrastructure/external/gemini-client", () => ({
  GeminiClient: class MockGeminiClient {
    _provider = "gemini" as const;
    constructor(public apiKey: string) {}
    isAvailable() { return true; }
  },
}));

vi.mock("@/infrastructure/external/groq-client", () => ({
  GroqClient: class MockGroqClient {
    _provider = "groq" as const;
    constructor(public apiKey: string) {}
    isAvailable() { return true; }
  },
}));

vi.mock("@/infrastructure/external/openrouter-client", () => ({
  OpenRouterClient: class MockOpenRouterClient {
    _provider = "openrouter" as const;
    constructor(public apiKey: string) {}
    isAvailable() { return true; }
  },
}));

vi.mock("@/infrastructure/external/pollinations-client", () => ({
  PollinationsClient: class MockPollinationsClient {
    _provider = "pollinations" as const;
    isAvailable() { return true; }
  },
}));

import { createAIProvider } from "@/infrastructure/external/ai-provider-factory";

const defaultEnv = {
  GEMINI_API_KEY: undefined,
  GROQ_API_KEY: undefined,
  OPENROUTER_API_KEY: undefined,
  RATE_LIMIT_RPM: 10,
  RATE_LIMIT_DAILY_TOKENS: 500_000,
};

describe("createAIProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerEnv.mockReturnValue({ ...defaultEnv });
  });

  // --- BYOK tests ---

  it("returns GeminiClient when BYOK provider is gemini", () => {
    const provider = createAIProvider({ key: "user-key", provider: "gemini" });
    expect(provider).not.toBeNull();
    expect((provider as unknown as { _provider: string })._provider).toBe("gemini");
  });

  it("returns GroqClient when BYOK provider is groq", () => {
    const provider = createAIProvider({ key: "user-key", provider: "groq" });
    expect(provider).not.toBeNull();
    expect((provider as unknown as { _provider: string })._provider).toBe("groq");
  });

  it("returns OpenRouterClient when BYOK provider is openrouter", () => {
    const provider = createAIProvider({ key: "user-key", provider: "openrouter" });
    expect(provider).not.toBeNull();
    expect((provider as unknown as { _provider: string })._provider).toBe("openrouter");
  });

  it("returns PollinationsClient when BYOK provider is pollinations", () => {
    const provider = createAIProvider({ key: "user-key", provider: "pollinations" });
    expect(provider).not.toBeNull();
    expect((provider as unknown as { _provider: string })._provider).toBe("pollinations");
  });

  // --- Env-based tests ---

  it("returns GeminiClient when GEMINI_API_KEY is set", () => {
    mockGetServerEnv.mockReturnValue({ ...defaultEnv, GEMINI_API_KEY: "gm-key" });
    const provider = createAIProvider();
    expect((provider as unknown as { _provider: string })._provider).toBe("gemini");
  });

  it("returns GroqClient when GROQ_API_KEY is set (no Gemini)", () => {
    mockGetServerEnv.mockReturnValue({ ...defaultEnv, GROQ_API_KEY: "gq-key" });
    const provider = createAIProvider();
    expect((provider as unknown as { _provider: string })._provider).toBe("groq");
  });

  it("returns OpenRouterClient when OPENROUTER_API_KEY is set (no Gemini/Groq)", () => {
    mockGetServerEnv.mockReturnValue({ ...defaultEnv, OPENROUTER_API_KEY: "or-key" });
    const provider = createAIProvider();
    expect((provider as unknown as { _provider: string })._provider).toBe("openrouter");
  });

  it("returns PollinationsClient (fallback) when no keys are set", () => {
    mockGetServerEnv.mockReturnValue({ ...defaultEnv });
    const provider = createAIProvider();
    expect(provider).not.toBeNull();
    expect((provider as unknown as { _provider: string })._provider).toBe("pollinations");
  });

  it("BYOK takes priority over env vars", () => {
    mockGetServerEnv.mockReturnValue({ ...defaultEnv, GEMINI_API_KEY: "gm-key" });
    const provider = createAIProvider({ key: "user-key", provider: "groq" });
    expect((provider as unknown as { _provider: string })._provider).toBe("groq");
  });

  it("createAIProvider never returns null (Pollinations always available)", () => {
    mockGetServerEnv.mockReturnValue({ ...defaultEnv });
    const provider = createAIProvider();
    expect(provider).not.toBeNull();
  });
});
