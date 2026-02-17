export interface CodeReviewResult {
  id: string;
  code: string;
  language: SupportedLanguage;
  issues: CodeIssue[];
  metrics: CodeMetrics;
  suggestions: string[];
  overallScore: number;
  reviewedAt: string;
  refactoredCode?: string;
}

export type SupportedLanguage =
  | "typescript"
  | "javascript"
  | "python"
  | "go"
  | "rust"
  | "java"
  | "php"
  | "csharp";

export interface CodeIssue {
  line: number;
  column?: number | undefined;
  severity: "critical" | "warning" | "info";
  category: IssueCategory;
  message: string;
  suggestion?: string | undefined;
}

export type IssueCategory =
  | "security"
  | "performance"
  | "maintainability"
  | "best-practice"
  | "style";

export interface CodeMetrics {
  totalLines: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  complexity: number;
  maintainabilityIndex: number;
}
