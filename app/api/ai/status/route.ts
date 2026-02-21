import type { AIStatusResult } from "@/types/ai";
import { getServerEnv } from "@/infrastructure/config/env";
import { successResponse } from "@/lib/api/middleware";

/**
 * Health check endpoint — reports whether AI is configured and what limits apply.
 * No rate limiting on this endpoint.
 */
export async function GET() {
  const env = getServerEnv();
  // Always configured — Pollinations fallback requires no API key
  const configured = true;

  const provider = env.GEMINI_API_KEY
    ? ("gemini" as const)
    : env.GROQ_API_KEY
      ? ("groq" as const)
      : env.OPENROUTER_API_KEY
        ? ("openrouter" as const)
        : ("pollinations" as const);

  const premiumConfigured = Boolean(
    env.GEMINI_API_KEY || env.GROQ_API_KEY || env.OPENROUTER_API_KEY,
  );

  const result: AIStatusResult = {
    configured,
    provider,
    premiumConfigured,
    limits: {
      rpm: env.RATE_LIMIT_RPM,
      dailyTokens: env.RATE_LIMIT_DAILY_TOKENS,
    },
  };

  return successResponse(result);
}
