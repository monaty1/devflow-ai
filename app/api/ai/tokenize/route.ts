import { NextRequest } from "next/server";
import { encodingForModel, getEncoding } from "js-tiktoken";
import type { AITokenizeResult, AITokenSegment } from "@/types/ai";
import { aiTokenizeSchema } from "@/lib/api/schemas";
import {
  extractBYOK,
  withRateLimit,
  validateBody,
  successResponse,
  errorResponse,
  getClientIP,
} from "@/lib/api/middleware";
import { getRateLimiter } from "@/infrastructure/services/rate-limiter";
import { getServerEnv } from "@/infrastructure/config/env";

/**
 * Tokenize endpoint — uses real BPE tokenization via js-tiktoken.
 * No AI call needed, but still rate-limited to prevent abuse.
 */
export async function POST(request: NextRequest) {
  const byok = extractBYOK(request);
  const isByok = Boolean(byok);

  const rateLimited = withRateLimit(request, isByok);
  if (rateLimited) return rateLimited;

  const parsed = await validateBody(request, aiTokenizeSchema);
  if ("error" in parsed) return parsed.error;
  const { text, model } = parsed.data;

  try {
    const encoding = getEncodingForModel(model);
    const tokens = encoding.encode(text);

    const segments: AITokenSegment[] = [];
    const decoder = new TextDecoder("utf-8", { fatal: false });

    for (const tokenId of tokens) {
      const tokenBytes = encoding.decode([tokenId]);
      const tokenText =
        typeof tokenBytes === "string"
          ? tokenBytes
          : decoder.decode(tokenBytes as Uint8Array);
      segments.push({ text: tokenText, tokenId });
    }

    const result: AITokenizeResult = {
      segments,
      totalTokens: tokens.length,
      model,
    };

    // Record request for rate limiting (consistent with other AI routes)
    const env = getServerEnv();
    const limiter = getRateLimiter(env.RATE_LIMIT_RPM, env.RATE_LIMIT_DAILY_TOKENS);
    const ip = getClientIP(request);
    limiter.recordRequest(ip);

    return successResponse(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Tokenization failed";
    return errorResponse(message, 500);
  }
}

function getEncodingForModel(model: string) {
  switch (model) {
    case "gpt-4o":
    case "o200k_base":
      return getEncoding("o200k_base");
    case "gpt-4":
    case "gpt-3.5-turbo":
    case "cl100k_base":
      return getEncoding("cl100k_base");
    default:
      return encodingForModel("gpt-4o");
  }
}
