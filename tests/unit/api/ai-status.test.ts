import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock env module — must be before import
const mockGetServerEnv = vi.fn();
vi.mock("@/infrastructure/config/env", () => ({
  getServerEnv: () => mockGetServerEnv(),
}));

// Mock NextResponse.json
vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((body: unknown) => ({
      json: () => Promise.resolve(body),
    })),
  },
  NextRequest: class {},
}));

import { GET } from "@/app/api/ai/status/route";

const defaultEnv = {
  GEMINI_API_KEY: undefined,
  GROQ_API_KEY: undefined,
  OPENROUTER_API_KEY: undefined,
  RATE_LIMIT_RPM: 10,
  RATE_LIMIT_DAILY_TOKENS: 500_000,
};

describe("GET /api/ai/status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns pollinations provider when no env vars are set", async () => {
    mockGetServerEnv.mockReturnValue({ ...defaultEnv });
    const response = await GET();
    const body = await response.json();
    expect(body.data.provider).toBe("pollinations");
    expect(body.data.premiumConfigured).toBe(false);
  });

  it("returns gemini provider when GEMINI_API_KEY is set", async () => {
    mockGetServerEnv.mockReturnValue({ ...defaultEnv, GEMINI_API_KEY: "gm-key" });
    const response = await GET();
    const body = await response.json();
    expect(body.data.provider).toBe("gemini");
    expect(body.data.premiumConfigured).toBe(true);
  });

  it("returns groq provider when GROQ_API_KEY is set", async () => {
    mockGetServerEnv.mockReturnValue({ ...defaultEnv, GROQ_API_KEY: "gq-key" });
    const response = await GET();
    const body = await response.json();
    expect(body.data.provider).toBe("groq");
    expect(body.data.premiumConfigured).toBe(true);
  });

  it("returns openrouter provider when OPENROUTER_API_KEY is set", async () => {
    mockGetServerEnv.mockReturnValue({ ...defaultEnv, OPENROUTER_API_KEY: "or-key" });
    const response = await GET();
    const body = await response.json();
    expect(body.data.provider).toBe("openrouter");
    expect(body.data.premiumConfigured).toBe(true);
  });

  it("always reports configured = true (Pollinations fallback)", async () => {
    mockGetServerEnv.mockReturnValue({ ...defaultEnv });
    const response = await GET();
    const body = await response.json();
    expect(body.data.configured).toBe(true);
  });
});
