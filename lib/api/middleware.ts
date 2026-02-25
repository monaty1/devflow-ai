import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { ApiResult, BYOKConfig, AIProviderType } from "@/types";
import { getRateLimiter } from "@/infrastructure/services/rate-limiter";
import { getServerEnv } from "@/infrastructure/config/env";

/**
 * Extract client IP from request headers.
 */
export function getClientIP(request: NextRequest): string {
  // Prefer x-real-ip (set by reverse proxy like Vercel, not spoofable)
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  // Fallback to x-forwarded-for: take the LAST IP (set by trusted proxy)
  // First IP is client-controlled and spoofable
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((ip) => ip.trim()).filter(Boolean);
    const lastIp = ips.at(-1);
    if (lastIp) return lastIp;
  }

  return "127.0.0.1";
}

/**
 * Extract BYOK configuration from request headers.
 * Returns undefined if no BYOK headers present.
 */
const VALID_PROVIDERS: readonly AIProviderType[] = [
  "gemini",
  "groq",
  "openrouter",
  "pollinations",
] as const;

export function extractBYOK(request: NextRequest): BYOKConfig | undefined {
  const key = request.headers.get("x-devflow-api-key");
  const provider = request.headers.get("x-devflow-provider");

  if (!key || !provider) return undefined;
  if (!VALID_PROVIDERS.includes(provider as AIProviderType)) return undefined;

  return { key, provider: provider as AIProviderType };
}

/**
 * Check rate limit for the request.
 * Returns a 429 Response if blocked, or null if allowed.
 */
export function withRateLimit(
  request: NextRequest,
  isByok: boolean,
): NextResponse | null {
  const env = getServerEnv();
  const limiter = getRateLimiter(env.RATE_LIMIT_RPM, env.RATE_LIMIT_DAILY_TOKENS);
  const ip = getClientIP(request);
  const info = limiter.checkLimit(ip, isByok);

  if (!info.allowed) {
    return NextResponse.json(
      errorBody("Rate limit exceeded. Please try again later."),
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((info.retryAfterMs ?? 60_000) / 1000),
          ),
          "X-RateLimit-Remaining": String(info.remainingRequests),
        },
      },
    );
  }

  return null;
}

/**
 * Validate request body against a Zod schema.
 * Returns parsed data or a 400 Response.
 */
export async function validateBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>,
): Promise<{ data: T } | { error: NextResponse }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      error: NextResponse.json(errorBody("Invalid JSON body"), {
        status: 400,
      }),
    };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    const issues = result.error.issues.map(
      (i) => `${i.path.join(".")}: ${i.message}`,
    );
    return {
      error: NextResponse.json(
        errorBody(`Validation failed: ${issues.join("; ")}`),
        { status: 400 },
      ),
    };
  }

  return { data: result.data };
}

/**
 * Create a successful API response.
 */
export function successResponse<T>(data: T): NextResponse {
  const body: ApiResult<T> = { data, error: null };
  return NextResponse.json(body);
}

/**
 * Create an error API response.
 */
export function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json(errorBody(message), { status });
}

function errorBody(message: string): ApiResult<never> {
  return { data: null, error: message };
}
