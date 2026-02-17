// Git Commit Message Generator Types

export type CommitType =
  | "feat"
  | "fix"
  | "docs"
  | "style"
  | "refactor"
  | "perf"
  | "test"
  | "chore"
  | "ci"
  | "build"
  | "revert";

export interface CommitConfig {
  type: CommitType;
  scope: string;
  description: string;
  body: string;
  breakingChange: string;
  issueRef: string;
  useEmojis: boolean;
  requireIssue: boolean;
}

export const DEFAULT_COMMIT_CONFIG: CommitConfig = {
  type: "feat",
  scope: "",
  description: "",
  body: "",
  breakingChange: "",
  issueRef: "",
  useEmojis: true,
  requireIssue: false,
};

export interface DiffAnalysis {
  suggestedType: CommitType;
  suggestedScope: string;
  isBreaking: boolean;
  filesChanged: string[];
}

export interface CommitResult {
  id: string;
  message: string;
  type: CommitType;
  scope: string;
  description: string;
  body: string;
  breakingChange: string;
  issueRef: string;
  timestamp: string;
}

export interface CommitTypeInfo {
  type: CommitType;
  label: string;
  description: string;
  emoji: string;
}

export interface CommitValidation {
  isValid: boolean;
  errors: string[];
}

export interface ParsedCommit {
  type: CommitType | null;
  scope: string;
  description: string;
  body: string;
  breakingChange: string;
  issueRefs: string[];
  isBreaking: boolean;
}
