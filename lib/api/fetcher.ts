import type { ApiResult } from "@/types";
import { useAISettingsStore } from "@/lib/stores/ai-settings-store";

/**
 * Typed fetcher for AI API endpoints.
 * Reads BYOK from Zustand store (external access, no hook needed).
 * Adds BYOK headers when a user key is set.
 */
export async function aiFetcher<T>(
  url: string,
  body: unknown,
): Promise<T> {
  const { byokKey, byokProvider } = useAISettingsStore.getState();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (byokKey) {
    headers["X-DevFlow-API-Key"] = byokKey;
    headers["X-DevFlow-Provider"] = byokProvider;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`;
    try {
      const errorBody = (await response.json()) as ApiResult<never>;
      if ("error" in errorBody && errorBody.error) {
        errorMessage = errorBody.error;
      }
    } catch {
      // Response is not JSON (e.g. 502 HTML from proxy)
    }
    throw new Error(errorMessage);
  }

  const result = (await response.json()) as ApiResult<T>;

  if (result.error !== null) {
    throw new Error(result.error);
  }

  return result.data;
}

/**
 * Fetch AI status (GET endpoint).
 */
export async function fetchAIStatus<T>(): Promise<T> {
  const response = await fetch("/api/ai/status");
  const result = (await response.json()) as ApiResult<T>;

  if (result.error !== null) {
    throw new Error(result.error);
  }

  return result.data;
}
