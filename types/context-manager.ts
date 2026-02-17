export interface ContextDocument {
  id: string;
  title: string;
  content: string;
  type: DocumentType;
  priority: Priority;
  tags: string[];
  tokenCount: number;
  createdAt: string;
  filePath?: string | undefined;
  instructions?: string | undefined;
}

export type DocumentType = "code" | "documentation" | "api" | "notes" | "other";

export type Priority = "high" | "medium" | "low";

export interface ContextWindow {
  id: string;
  name: string;
  documents: ContextDocument[];
  totalTokens: number;
  maxTokens: number;
  utilizationPercentage: number;
  createdAt: string;
}

export interface ExportedContext {
  format: "xml" | "json" | "markdown";
  content: string;
  filename: string;
}
