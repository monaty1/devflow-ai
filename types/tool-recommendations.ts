/** A single tool recommendation based on current context */
export interface ToolRecommendation {
  toolSlug: string;
  toolName: string;
  reason: string;
  dataToPass?: string;
}

/** Context from the current tool to generate recommendations */
export interface ToolContext {
  toolId: string;
  input: string;
  output: string;
  detectedTypes: DetectedDataType[];
}

/** Types of data we can detect in tool inputs/outputs */
export type DetectedDataType =
  | "json"
  | "code"
  | "prompt"
  | "base64"
  | "cron"
  | "uuid"
  | "regex"
  | "url"
  | "css-classes"
  | "commit-message";
