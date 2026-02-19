import { z } from "zod";

/**
 * Server-side environment variables schema.
 * All keys are server-only (no NEXT_PUBLIC_ prefix) — never exposed to the browser.
 */
const serverEnvSchema = z.object({
  GEMINI_API_KEY: z.string().min(1).optional(),
  GROQ_API_KEY: z.string().min(1).optional(),
  RATE_LIMIT_RPM: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_DAILY_TOKENS: z.coerce.number().int().positive().default(500_000),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

/**
 * Parse and validate server environment variables.
 * Cached after first call.
 */
export function getServerEnv(): ServerEnv {
  if (cachedEnv) return cachedEnv;

  const result = serverEnvSchema.safeParse({
    GEMINI_API_KEY: process.env["GEMINI_API_KEY"],
    GROQ_API_KEY: process.env["GROQ_API_KEY"],
    RATE_LIMIT_RPM: process.env["RATE_LIMIT_RPM"],
    RATE_LIMIT_DAILY_TOKENS: process.env["RATE_LIMIT_DAILY_TOKENS"],
  });

  if (!result.success) {
    console.error("[env] Invalid server environment:", result.error.flatten());
    // Return defaults — AI will simply be unavailable
    cachedEnv = {
      GEMINI_API_KEY: undefined,
      GROQ_API_KEY: undefined,
      RATE_LIMIT_RPM: 10,
      RATE_LIMIT_DAILY_TOKENS: 500_000,
    };
    return cachedEnv;
  }

  cachedEnv = result.data;
  return cachedEnv;
}

/** Check if any AI provider is configured on the server */
export function isAIConfigured(): boolean {
  const env = getServerEnv();
  return Boolean(env.GEMINI_API_KEY ?? env.GROQ_API_KEY);
}
