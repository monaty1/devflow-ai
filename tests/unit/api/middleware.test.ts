import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import {
  getClientIP,
  extractBYOK,
  successResponse,
  errorResponse,
} from "@/lib/api/middleware";

// Mock rate limiter and env to avoid import issues
vi.mock("@/infrastructure/services/rate-limiter", () => ({
  getRateLimiter: vi.fn().mockReturnValue({
    checkLimit: vi.fn().mockReturnValue({
      allowed: true,
      remainingRequests: 10,
      remainingTokens: 500_000,
      retryAfterMs: null,
    }),
    recordRequest: vi.fn(),
    recordTokens: vi.fn(),
  }),
}));

vi.mock("@/infrastructure/config/env", () => ({
  getServerEnv: vi.fn().mockReturnValue({
    RATE_LIMIT_RPM: 10,
    RATE_LIMIT_DAILY_TOKENS: 500_000,
  }),
}));

function makeRequest(
  headers: Record<string, string> = {},
  body?: unknown,
): NextRequest {
  const url = "http://localhost:3000/api/ai/test";
  return new NextRequest(url, {
    method: "POST",
    headers: new Headers(headers),
    body: body !== undefined ? JSON.stringify(body) : null,
  });
}

describe("getClientIP", () => {
  it("should extract IP from x-forwarded-for", () => {
    const req = makeRequest({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(getClientIP(req)).toBe("1.2.3.4");
  });

  it("should extract IP from x-real-ip", () => {
    const req = makeRequest({ "x-real-ip": "10.0.0.1" });
    expect(getClientIP(req)).toBe("10.0.0.1");
  });

  it("should default to 127.0.0.1", () => {
    const req = makeRequest();
    expect(getClientIP(req)).toBe("127.0.0.1");
  });
});

describe("extractBYOK", () => {
  it("should extract BYOK config from headers", () => {
    const req = makeRequest({
      "x-devflow-api-key": "my-key",
      "x-devflow-provider": "gemini",
    });
    const byok = extractBYOK(req);
    expect(byok).toEqual({ key: "my-key", provider: "gemini" });
  });

  it("should return undefined when headers are missing", () => {
    const req = makeRequest();
    expect(extractBYOK(req)).toBeUndefined();
  });

  it("should return undefined for invalid provider", () => {
    const req = makeRequest({
      "x-devflow-api-key": "key",
      "x-devflow-provider": "openai",
    });
    expect(extractBYOK(req)).toBeUndefined();
  });
});

describe("successResponse", () => {
  it("should wrap data in ApiResult format", async () => {
    const response = successResponse({ score: 85 });
    const body = await response.json();
    expect(body).toEqual({ data: { score: 85 }, error: null });
    expect(response.status).toBe(200);
  });
});

describe("errorResponse", () => {
  it("should return error with status code", async () => {
    const response = errorResponse("Not found", 404);
    const body = await response.json();
    expect(body).toEqual({ data: null, error: "Not found" });
    expect(response.status).toBe(404);
  });
});

describe("validateBody", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should validate and return parsed data", async () => {
    const { validateBody } = await import("@/lib/api/middleware");
    const { z } = await import("zod");
    const schema = z.object({ name: z.string() });

    const req = makeRequest(
      { "content-type": "application/json" },
      { name: "test" },
    );
    const result = await validateBody(req, schema);

    expect("data" in result).toBe(true);
    if ("data" in result) {
      expect(result.data).toEqual({ name: "test" });
    }
  });

  it("should return 400 for invalid data", async () => {
    const { validateBody } = await import("@/lib/api/middleware");
    const { z } = await import("zod");
    const schema = z.object({ name: z.string() });

    const req = makeRequest(
      { "content-type": "application/json" },
      { name: 123 },
    );
    const result = await validateBody(req, schema);

    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error.status).toBe(400);
    }
  });
});
