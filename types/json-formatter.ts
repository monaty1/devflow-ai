// JSON Formatter Types

export type JsonFormatMode = "format" | "minify" | "validate";

export interface JsonFormatterConfig {
  indentSize: 2 | 4;
  sortKeys: boolean;
  quoteStyle: "double" | "single";
}

export const DEFAULT_FORMATTER_CONFIG: JsonFormatterConfig = {
  indentSize: 2,
  sortKeys: false,
  quoteStyle: "double",
};

export interface JsonValidationError {
  line: number;
  column: number;
  message: string;
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
