// Variable Name Wizard Types
// Generate and convert variable names between naming conventions

export interface NameSuggestion {
  id: string;
  name: string;
  convention: NamingConvention;
  score: number;
  reasoning: string;
  audit?: NameAudit;
}

export interface NameAudit {
  status: "good" | "warning" | "error";
  findings: string[];
}

export interface ConversionResult {
  id: string;
  original: string;
  originalConvention: NamingConvention | "unknown";
  conversions: Record<NamingConvention, string>;
  timestamp: string;
}

export interface GenerationResult {
  id: string;
  context: string;
  type: VariableType;
  suggestions: NameSuggestion[];
  timestamp: string;
}

export type NamingConvention =
  | "camelCase"
  | "PascalCase"
  | "snake_case"
  | "SCREAMING_SNAKE_CASE"
  | "kebab-case"
  | "flatcase"
  | "UPPERCASE"
  | "lowercase";

export type VariableType =
  | "variable"
  | "function"
  | "class"
  | "constant"
  | "interface"
  | "type"
  | "enum"
  | "component"
  | "hook"
  | "file"
  | "css-class";

export type VariableLanguage = "typescript" | "javascript" | "python" | "go" | "rust" | "csharp" | "java" | "general";

export interface WizardConfig {
  preferredConvention: NamingConvention;
  maxSuggestions: number;
  language: VariableLanguage;
  type: VariableType;
}

export const DEFAULT_WIZARD_CONFIG: WizardConfig = {
  preferredConvention: "camelCase",
  maxSuggestions: 10,
  language: "typescript",
  type: "variable",
};

export const TYPE_CONVENTIONS: Record<VariableType, NamingConvention[]> = {
  variable: ["camelCase", "snake_case"],
  function: ["camelCase", "snake_case"],
  class: ["PascalCase"],
  constant: ["SCREAMING_SNAKE_CASE", "camelCase"],
  interface: ["PascalCase"],
  type: ["PascalCase"],
  enum: ["PascalCase"],
  component: ["PascalCase"],
  hook: ["camelCase"], // useXxx
  file: ["kebab-case", "snake_case", "PascalCase"],
  "css-class": ["kebab-case"],
};
