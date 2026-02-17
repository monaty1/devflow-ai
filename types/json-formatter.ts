// JSON Formatter Types

export type JsonFormatMode = "format" | "minify" | "validate" | "to-yaml" | "to-xml" | "to-csv";

export interface JsonFormatterConfig {
  indentSize: 2 | 4;
  sortKeys: boolean;
  quoteStyle: "double" | "single";
  escapeHtml: boolean;
}

export const DEFAULT_FORMATTER_CONFIG: JsonFormatterConfig = {
  indentSize: 2,
  sortKeys: false,
  quoteStyle: "double",
  escapeHtml: false,
};

export interface JsonValidationError {
  line: number;
  column: number;
  message: string;
  fixable?: boolean;
  suggestedFix?: string;
}

export interface JsonFormatResult {
  id: string;
  input: string;
  output: string;
  mode: JsonFormatMode;
  isValid: boolean;
  error?: JsonValidationError;
  stats: JsonStats;
  timestamp: string;
}

export interface JsonStats {
  keys: number;
  values: number;
  depth: number;
  arrays: number;
  objects: number;
  strings: number;
  numbers: number;
  booleans: number;
  nulls: number;
  sizeBytes: number;
  minifiedSize: number;
}

export interface JsonPathResult {
  path: string;
  value: unknown;
  type: string;
}
