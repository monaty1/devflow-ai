import { describe, it, expect, vi, beforeEach } from "vitest";

// We need to re-import fresh each test because env.ts has module-level cache
// Use dynamic import + vi.resetModules pattern

describe("infrastructure/config/env", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    // Clear all provider keys
    delete process.env["GEMINI_API_KEY"];
    delete process.env["GROQ_API_KEY"];
    delete process.env["OPENROUTER_API_KEY"];
    delete process.env["RATE_LIMIT_RPM"];
    delete process.env["RATE_LIMIT_DAILY_TOKENS"];
  });

  // --- getServerEnv ---

  it("returns default rate limits when no env vars are set", async () => {
    const { getServerEnv } = await import("@/infrastructure/config/env");
    const env = getServerEnv();
    expect(env.RATE_LIMIT_RPM).toBe(10);
    expect(env.RATE_LIMIT_DAILY_TOKENS).toBe(500_000);
  });

  it("returns undefined API keys when none are configured", async () => {
    const { getServerEnv } = await import("@/infrastructure/config/env");
    const env = getServerEnv();
    expect(env.GEMINI_API_KEY).toBeUndefined();
    expect(env.GROQ_API_KEY).toBeUndefined();
    expect(env.OPENROUTER_API_KEY).toBeUndefined();
  });

  it("parses GEMINI_API_KEY from env", async () => {
    process.env["GEMINI_API_KEY"] = "test-gemini-key";
    const { getServerEnv } = await import("@/infrastructure/config/env");
    const env = getServerEnv();
    expect(env.GEMINI_API_KEY).toBe("test-gemini-key");
  });

  it("parses GROQ_API_KEY from env", async () => {
    process.env["GROQ_API_KEY"] = "test-groq-key";
    const { getServerEnv } = await import("@/infrastructure/config/env");
    const env = getServerEnv();
    expect(env.GROQ_API_KEY).toBe("test-groq-key");
  });

  it("parses OPENROUTER_API_KEY from env", async () => {
    process.env["OPENROUTER_API_KEY"] = "test-or-key";
    const { getServerEnv } = await import("@/infrastructure/config/env");
    const env = getServerEnv();
    expect(env.OPENROUTER_API_KEY).toBe("test-or-key");
  });

  it("coerces RATE_LIMIT_RPM from string", async () => {
    process.env["RATE_LIMIT_RPM"] = "25";
    const { getServerEnv } = await import("@/infrastructure/config/env");
    const env = getServerEnv();
    expect(env.RATE_LIMIT_RPM).toBe(25);
  });

  it("coerces RATE_LIMIT_DAILY_TOKENS from string", async () => {
    process.env["RATE_LIMIT_DAILY_TOKENS"] = "1000000";
    const { getServerEnv } = await import("@/infrastructure/config/env");
    const env = getServerEnv();
    expect(env.RATE_LIMIT_DAILY_TOKENS).toBe(1_000_000);
  });

  it("returns defaults on invalid env (e.g. negative RPM)", async () => {
    process.env["RATE_LIMIT_RPM"] = "-5";
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { getServerEnv } = await import("@/infrastructure/config/env");
    const env = getServerEnv();
    // Should return defaults because validation fails
    expect(env.RATE_LIMIT_RPM).toBe(10);
    expect(env.RATE_LIMIT_DAILY_TOKENS).toBe(500_000);
    consoleSpy.mockRestore();
  });

  it("caches result on subsequent calls", async () => {
    process.env["GEMINI_API_KEY"] = "cached-key";
    const { getServerEnv } = await import("@/infrastructure/config/env");
    const first = getServerEnv();
    // Mutate env — should NOT affect cached result
    process.env["GEMINI_API_KEY"] = "different-key";
    const second = getServerEnv();
    expect(first).toBe(second); // Same reference
    expect(second.GEMINI_API_KEY).toBe("cached-key");
  });

  // --- isAIConfigured ---

  it("isAIConfigured returns false when no provider keys are set", async () => {
    const { isAIConfigured } = await import("@/infrastructure/config/env");
    expect(isAIConfigured()).toBe(false);
  });

  it("isAIConfigured returns true when GEMINI_API_KEY is set", async () => {
    process.env["GEMINI_API_KEY"] = "gm-key";
    const { isAIConfigured } = await import("@/infrastructure/config/env");
    expect(isAIConfigured()).toBe(true);
  });

  it("isAIConfigured returns true when GROQ_API_KEY is set", async () => {
    process.env["GROQ_API_KEY"] = "gq-key";
    const { isAIConfigured } = await import("@/infrastructure/config/env");
    expect(isAIConfigured()).toBe(true);
  });

  it("isAIConfigured returns true when OPENROUTER_API_KEY is set", async () => {
    process.env["OPENROUTER_API_KEY"] = "or-key";
    const { isAIConfigured } = await import("@/infrastructure/config/env");
    expect(isAIConfigured()).toBe(true);
  });
});
