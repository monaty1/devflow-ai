import type { PromptIssue, SecurityFlag, ScoreCategory } from "@/types/prompt-analyzer";

export function calculateScore(
  prompt: string,
  issues: PromptIssue[],
  securityFlags: SecurityFlag[],
): number {
  let score = 10;

  // Deduct for issues
  for (const issue of issues) {
    switch (issue.severity) {
      case "high":
        score -= 2;
        break;
      case "medium":
        score -= 1;
        break;
      case "low":
        score -= 0.5;
        break;
    }
  }

  // Deduct for security flags
  for (const flag of securityFlags) {
    switch (flag.severity) {
      case "critical":
        score -= 3;
        break;
      case "warning":
        score -= 1.5;
        break;
      case "info":
        score -= 0.5;
        break;
    }
  }

  // Bonus for good practices
  if (/\b(step\s*by\s*step|first|then|finally)\b/i.test(prompt)) {
    score += 0.5; // Clear structure
  }
  if (/\b(example|e\.g\.|for\s+instance)\b/i.test(prompt)) {
    score += 0.5; // Includes examples
  }
  if (prompt.length >= 50 && prompt.length <= 2000) {
    score += 0.5; // Good length
  }

  // New bonuses
  if (/\b(avoid|do\s+not|don['']t|never|must\s+not)\b/i.test(prompt)) {
    score += 0.5; // Contains constraints
  }
  if (/\b(beginner|expert|developer|user|audience|reader|student|professional)\b/i.test(prompt)) {
    score += 0.5; // Contains audience specification
  }
  if (/\b(json|markdown|list|table|csv|yaml|xml|bullet\s*points?)\b/i.test(prompt)) {
    score += 0.5; // Contains specific output format
  }

  return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
}

export function getScoreCategory(score: number): ScoreCategory {
  if (score >= 9) return "excellent";
  if (score >= 7) return "good";
  if (score >= 5) return "average";
  if (score >= 3) return "poor";
  return "critical";
}
