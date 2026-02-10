// Global TypeScript Types

export type { Tool, ToolCategory, FavoriteItem } from "./tools";
export type {
  PromptAnalysisResult,
  ScoreCategory,
  PromptIssue,
  IssueType,
  SecurityFlag,
  SecurityFlagType,
} from "./prompt-analyzer";
export type {
  AIModel,
  AIProvider,
  CostCalculation,
  CostComparison,
} from "./cost-calculator";
export type {
  TokenSegment,
  TokenVisualization,
} from "./token-visualizer";
export type {
  CodeReviewResult,
  SupportedLanguage,
  CodeIssue,
  IssueCategory,
  CodeMetrics,
} from "./code-review";
export type {
  ContextDocument,
  DocumentType,
  Priority,
  ContextWindow,
  ExportedContext,
} from "./context-manager";

export interface ApiResponse<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: string;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
