import { NextRequest } from "next/server";
import type { AIReviewResult } from "@/types/ai";
import { aiReviewSchema } from "@/lib/api/schemas";
import {
  extractBYOK,
  withRateLimit,
  validateBody,
  successResponse,
  errorResponse,
  getClientIP,
} from "@/lib/api/middleware";
import { createAIProvider } from "@/infrastructure/external/ai-provider-factory";
import { getRateLimiter } from "@/infrastructure/services/rate-limiter";
import { getServerEnv } from "@/infrastructure/config/env";
import { CODE_REVIEW_SYSTEM_PROMPT } from "@/lib/api/prompts";

export async function POST(request: NextRequest) {
  // 1. Extract BYOK
  const byok = extractBYOK(request);
  const isByok = Boolean(byok);

  // 2. Rate limit check
  const rateLimited = withRateLimit(request, isByok);
  if (rateLimited) return rateLimited;

  // 3. Validate body
  const parsed = await validateBody(request, aiReviewSchema);
  if ("error" in parsed) return parsed.error;
  const { code, language } = parsed.data;

  // 4. Create provider
  const provider = createAIProvider(byok);
  if (!provider) {
    return errorResponse("AI is not configured on this server", 503);
  }

  // 5. Build prompt
  const userPrompt = `Language: ${language}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\``;

  try {
    // 6. Call AI
    const response = await provider.generateText(
      userPrompt,
      CODE_REVIEW_SYSTEM_PROMPT,
    );

    // 7. Parse JSON response
    const result = parseReviewResponse(response.text);

    // 8. Record token usage
    const env = getServerEnv();
    const limiter = getRateLimiter(env.RATE_LIMIT_RPM, env.RATE_LIMIT_DAILY_TOKENS);
    const ip = getClientIP(request);
    limiter.recordRequest(ip);
    limiter.recordTokens(ip, response.usage.totalTokens);

    // 9. Return typed response
    return successResponse(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI request failed";
    return errorResponse(message, 502);
  }
}

function parseReviewResponse(text: string): AIReviewResult {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned) as Record<string, unknown>;

  return {
    issues: Array.isArray(parsed["issues"])
      ? (parsed["issues"] as AIReviewResult["issues"])
      : [],
    score: typeof parsed["score"] === "number" ? parsed["score"] : 50,
    suggestions: Array.isArray(parsed["suggestions"])
      ? (parsed["suggestions"] as string[])
      : [],
    refactoredCode:
      typeof parsed["refactoredCode"] === "string"
        ? parsed["refactoredCode"]
        : "",
  };
}
