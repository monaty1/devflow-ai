import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock zustand store before importing fetcher
vi.mock("@/lib/stores/ai-settings-store", () => ({
  useAISettingsStore: {
    getState: vi.fn().mockReturnValue({
      byokKey: "",
      byokProvider: "gemini",
    }),
  },
}));

describe("aiFetcher", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return data on successful response", async () => {
    const { aiFetcher } = await import("@/lib/api/fetcher");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { score: 85 }, error: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await aiFetcher<{ score: number }>("/api/ai/review", {
      code: "test",
    });
    expect(result).toEqual({ score: 85 });
  });

  it("should extract error message from JSON error response", async () => {
    const { aiFetcher } = await import("@/lib/api/fetcher");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({ data: null, error: "Rate limit exceeded" }),
        { status: 429, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(
      aiFetcher("/api/ai/review", { code: "test" }),
    ).rejects.toThrow("Rate limit exceeded");
  });

  it("should handle non-JSON error response gracefully", async () => {
    const { aiFetcher } = await import("@/lib/api/fetcher");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("<html>502 Bad Gateway</html>", {
        status: 502,
        headers: { "Content-Type": "text/html" },
      }),
    );

    await expect(
      aiFetcher("/api/ai/review", { code: "test" }),
    ).rejects.toThrow("Request failed (502)");
  });

  it("should throw on API-level error (200 with error field)", async () => {
    const { aiFetcher } = await import("@/lib/api/fetcher");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({ data: null, error: "Invalid code format" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(
      aiFetcher("/api/ai/review", { code: "test" }),
    ).rejects.toThrow("Invalid code format");
  });

  it("should include status code in fallback error message", async () => {
    const { aiFetcher } = await import("@/lib/api/fetcher");

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("", { status: 503 }),
    );

    await expect(
      aiFetcher("/api/ai/review", { code: "test" }),
    ).rejects.toThrow("Request failed (503)");
  });
});
