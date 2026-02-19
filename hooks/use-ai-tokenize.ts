"use client";

import useSWRMutation from "swr/mutation";
import type { AITokenizeResult } from "@/types/ai";
import { aiFetcher } from "@/lib/api/fetcher";

interface TokenizeArgs {
  text: string;
  model: string;
}

async function tokenizeFetcher(
  _key: string,
  { arg }: { arg: TokenizeArgs },
): Promise<AITokenizeResult> {
  return aiFetcher<AITokenizeResult>("/api/ai/tokenize", arg);
}

export function useAITokenize() {
  const { trigger, data, error, isMutating } = useSWRMutation(
    "/api/ai/tokenize",
    tokenizeFetcher,
  );

  return {
    tokenizeReal: (text: string, model: string) => trigger({ text, model }),
    aiResult: data ?? null,
    aiError: error as Error | null,
    isAILoading: isMutating,
  };
}
