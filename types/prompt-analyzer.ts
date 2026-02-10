export interface PromptAnalysisResult {
  id: string;
  prompt: string;
  score: number;
  category: ScoreCategory;
  issues: PromptIssue[];
  suggestions: string[];
  securityFlags: SecurityFlag[];
  analyzedAt: string;
  tokenCount: number;
}

export type ScoreCategory =
  | "excellent" // 9-10
  | "good" // 7-8
  | "average" // 5-6
  | "poor" // 3-4
  | "critical"; // 1-2

export interface PromptIssue {
  type: IssueType;
  severity: "high" | "medium" | "low";
  message: string;
  location?: string;
}

export type IssueType =
  | "vague_instruction"
  | "missing_context"
  | "no_output_format"
  | "too_long"
  | "redundant"
  | "missing_role";

export interface SecurityFlag {
  type: SecurityFlagType;
  severity: "critical" | "warning" | "info";
  description: string;
}

export type SecurityFlagType =
  | "prompt_injection"
  | "role_override"
  | "data_exfiltration"
  | "jailbreak_attempt"
  | "ignore_instruction";
