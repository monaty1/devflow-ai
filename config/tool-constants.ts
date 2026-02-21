/**
 * Centralized configurable constants for tool behavior.
 * Extracted from individual tool modules for easier tuning.
 */

export const REGEX_TESTER = {
  /** Maximum number of matches before stopping */
  MAX_MATCHES: 1000,
  /** Timeout for regex execution (ms) */
  TIMEOUT_MS: 5000,
} as const;

export const CONTEXT_MANAGER = {
  /** Default maximum tokens for a context window */
  DEFAULT_MAX_TOKENS: 128000,
} as const;
