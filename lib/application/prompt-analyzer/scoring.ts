import type { SecurityFlag, ScoreCategory } from "@/types/prompt-analyzer";

export function calculateScore(
  anatomyScore: number,
  securityFlags: SecurityFlag[],
): number {
  // Primary score from anatomy (0-100 → 0-10)
  let score = anatomyScore / 10;

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

  return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
}

export function getScoreCategory(score: number): ScoreCategory {
  if (score >= 9) return "excellent";
  if (score >= 7) return "good";
  if (score >= 5) return "average";
  if (score >= 3) return "poor";
  return "critical";
}
