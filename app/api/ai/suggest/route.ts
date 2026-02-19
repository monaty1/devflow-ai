import { NextRequest } from "next/server";
import type { AISuggestResult } from "@/types/ai";
import { aiSuggestSchema } from "@/lib/api/schemas";
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
import {
  SUGGEST_VARIABLE_NAME_SYSTEM_PROMPT,
  SUGGEST_REGEX_SYSTEM_PROMPT,
} from "@/lib/api/prompts";

export async function POST(request: NextRequest) {
  const byok = extractBYOK(request);
  const isByok = Boolean(byok);

  const rateLimited = withRateLimit(request, isByok);
  if (rateLimited) return rateLimited;

  const parsed = await validateBody(request, aiSuggestSchema);
  if ("error" in parsed) return parsed.error;
  const { context, type, language, mode } = parsed.data;

  const provider = createAIProvider(byok);
  if (!provider) {
    return errorResponse("AI is not configured on this server", 503);
  }

  const isRegex = mode === "regex-generate";
  const systemPrompt = isRegex
    ? SUGGEST_REGEX_SYSTEM_PROMPT
    : SUGGEST_VARIABLE_NAME_SYSTEM_PROMPT;

  const userPrompt = isRegex
    ? `Generate a regex for: ${context}`
    : `Suggest names for a ${type ?? "variable"} in ${language ?? "typescript"}: ${context}`;

  try {
    const response = await provider.generateText(userPrompt, systemPrompt);

    const result = parseSuggestResponse(response.text);

    const env = getServerEnv();
    const limiter = getRateLimiter(env.RATE_LIMIT_RPM, env.RATE_LIMIT_DAILY_TOKENS);
    const ip = getClientIP(request);
    limiter.recordRequest(ip);
    limiter.recordTokens(ip, response.usage.totalTokens);

    return successResponse(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI request failed";
    return errorResponse(message, 502);
  }
}

function parseSuggestResponse(text: string): AISuggestResult {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned) as Record<string, unknown>;

  return {
    suggestions: Array.isArray(parsed["suggestions"])
      ? (parsed["suggestions"] as AISuggestResult["suggestions"])
      : [],
  };
}
