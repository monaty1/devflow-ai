import type { AIStatusResult } from "@/types/ai";
import { isAIConfigured, getServerEnv } from "@/infrastructure/config/env";
import { successResponse } from "@/lib/api/middleware";

/**
 * Health check endpoint — reports whether AI is configured and what limits apply.
 * No rate limiting on this endpoint.
 */
export async function GET() {
  const env = getServerEnv();
  const configured = isAIConfigured();

  const provider = env.GEMINI_API_KEY
    ? ("gemini" as const)
    : env.GROQ_API_KEY
      ? ("groq" as const)
      : null;

  const result: AIStatusResult = {
    configured,
    provider,
    limits: {
      rpm: env.RATE_LIMIT_RPM,
      dailyTokens: env.RATE_LIMIT_DAILY_TOKENS,
    },
  };

  return successResponse(result);
}
