import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { ApiResult, BYOKConfig, AIProviderType } from "@/types";
import { getRateLimiter } from "@/infrastructure/services/rate-limiter";
import { getServerEnv } from "@/infrastructure/config/env";

/**
 * Extract client IP from request headers.
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "127.0.0.1";
}

/**
 * Extract BYOK configuration from request headers.
 * Returns undefined if no BYOK headers present.
 */
export function extractBYOK(request: NextRequest): BYOKConfig | undefined {
  const key = request.headers.get("x-devflow-api-key");
  const provider = request.headers.get("x-devflow-provider") as
    | AIProviderType
    | null;

  if (!key || !provider) return undefined;
  if (provider !== "gemini" && provider !== "groq") return undefined;

  return { key, provider };
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
