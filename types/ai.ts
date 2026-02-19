// AI Integration Types

/** Supported AI providers */
export type AIProviderType = "gemini" | "groq" | "openrouter" | "pollinations";

/** BYOK (Bring Your Own Key) configuration */
export interface BYOKConfig {
  key: string;
  provider: AIProviderType;
}

/** Token usage from an AI call */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/** Normalized AI text response */
export interface AITextResponse {
  text: string;
  provider: AIProviderType;
  model: string;
  usage: TokenUsage;
  durationMs: number;
}

/** Options for AI text generation */
export interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

/** AI-powered code review result */
export interface AIReviewResult {
  issues: AIReviewIssue[];
  score: number;
  suggestions: string[];
  refactoredCode: string;
}

export interface AIReviewIssue {
  line: number;
  severity: "critical" | "warning" | "info";
  category: string;
  message: string;
  suggestion: string;
}

/** AI-powered name/regex suggestion result */
export interface AISuggestResult {
  suggestions: AISuggestion[];
}

export interface AISuggestion {
  value: string;
  score: number;
  reasoning: string;
}

/** AI-powered prompt refinement result */
export interface AIRefineResult {
  refinedPrompt: string;
  changelog: string[];
  score: number;
}

/** Real BPE tokenization result */
export interface AITokenizeResult {
  segments: AITokenSegment[];
  totalTokens: number;
  model: string;
}

export interface AITokenSegment {
  text: string;
  tokenId: number;
}

/** Rate limit status info */
export interface RateLimitInfo {
  allowed: boolean;
  remainingRequests: number;
  remainingTokens: number;
  retryAfterMs: number | null;
}

/** AI service health status */
export interface AIStatusResult {
  configured: boolean;
  provider: AIProviderType | null;
  limits: {
    rpm: number;
    dailyTokens: number;
  };
}
