import type { PromptAnalysisResult } from "@/types/prompt-analyzer";
import { detectAnatomy, calculateAnatomyScore } from "./anatomy-detector";
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
  const dimensions = detectAnatomy(trimmedPrompt);
  const anatomyScore = calculateAnatomyScore(dimensions);
  const issues = detectIssues(trimmedPrompt);
  const securityFlags = detectSecurityFlags(trimmedPrompt);
  const score = calculateScore(anatomyScore, securityFlags);
  const category = getScoreCategory(score);
  const suggestions = generateSuggestions(dimensions, issues, securityFlags);
  const tokenCount = estimateTokens(trimmedPrompt);
  const refinedPrompt = refinePrompt(trimmedPrompt, issues);

  return {
    id: crypto.randomUUID(),
    prompt: trimmedPrompt,
    score,
    category,
    dimensions,
    anatomyScore,
    issues,
    suggestions,
    securityFlags,
    analyzedAt: new Date().toISOString(),
    tokenCount,
    refinedPrompt,
  };
}
