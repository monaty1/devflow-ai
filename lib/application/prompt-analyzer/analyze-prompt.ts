import type { PromptAnalysisResult } from "@/types/prompt-analyzer";
import { detectIssues } from "./quality-patterns";
import { detectSecurityFlags } from "./security-patterns";
import { calculateScore, getScoreCategory } from "./scoring";
import { generateSuggestions } from "./suggestions";
import { refinePrompt } from "./refinement";

function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
}

export function analyzePrompt(prompt: string): PromptAnalysisResult {
  const trimmedPrompt = prompt.trim();
  const issues = detectIssues(trimmedPrompt);
  const securityFlags = detectSecurityFlags(trimmedPrompt);
  const score = calculateScore(trimmedPrompt, issues, securityFlags);
  const category = getScoreCategory(score);
  const suggestions = generateSuggestions(issues, securityFlags);
  const tokenCount = estimateTokens(trimmedPrompt);
  const refinedPrompt = refinePrompt(trimmedPrompt, issues);

  return {
    id: crypto.randomUUID(),
    prompt: trimmedPrompt,
    score,
    category,
    issues,
    suggestions,
    securityFlags,
    analyzedAt: new Date().toISOString(),
    tokenCount,
    refinedPrompt,
  };
}
