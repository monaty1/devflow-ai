"use client";

import useSWRMutation from "swr/mutation";
import type { AISuggestResult } from "@/types/ai";
import { aiFetcher } from "@/lib/api/fetcher";

interface SuggestArgs {
  context: string;
  type?: string | undefined;
  language?: string | undefined;
  mode: "variable-name" | "regex-generate" | "commit-message" | "cron-generate" | "json-explain";
}

async function suggestFetcher(
  _key: string,
  { arg }: { arg: SuggestArgs },
): Promise<AISuggestResult> {
  return aiFetcher<AISuggestResult>("/api/ai/suggest", arg);
}

export function useAISuggest() {
  const { trigger, data, error, isMutating } = useSWRMutation(
    "/api/ai/suggest",
    suggestFetcher,
  );

  return {
    suggestWithAI: (context: string, type?: string, language?: string) =>
      trigger({ context, type, language, mode: "variable-name" }),
    generateRegexWithAI: (description: string) =>
      trigger({ context: description, mode: "regex-generate" }),
    generateCommitWithAI: (description: string) =>
      trigger({ context: description, mode: "commit-message" }),
    generateCronWithAI: (description: string) =>
      trigger({ context: description, mode: "cron-generate" }),
    explainJsonWithAI: (json: string) =>
      trigger({ context: json, mode: "json-explain" }),
    aiResult: data ?? null,
    aiError: error as Error | null,
    isAILoading: isMutating,
  };
}
