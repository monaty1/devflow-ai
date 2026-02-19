"use client";

import useSWRMutation from "swr/mutation";
import type { AIReviewResult } from "@/types/ai";
import type { SupportedLanguage } from "@/types/code-review";
import { aiFetcher } from "@/lib/api/fetcher";

async function reviewFetcher(
  _key: string,
  { arg }: { arg: { code: string; language: SupportedLanguage } },
): Promise<AIReviewResult> {
  return aiFetcher<AIReviewResult>("/api/ai/review", arg);
}

export function useAICodeReview() {
  const { trigger, data, error, isMutating } = useSWRMutation(
    "/api/ai/review",
    reviewFetcher,
  );

  return {
    reviewWithAI: (code: string, language: SupportedLanguage) =>
      trigger({ code, language }),
    aiResult: data ?? null,
    aiError: error as Error | null,
    isAILoading: isMutating,
  };
}
