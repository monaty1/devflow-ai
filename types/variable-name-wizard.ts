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
  includeAbbreviations: boolean;
  language: VariableLanguage;
  type: VariableType;
}

export const DEFAULT_WIZARD_CONFIG: WizardConfig = {
  preferredConvention: "camelCase",
  maxSuggestions: 5,
  includeAbbreviations: false,
  language: "typescript",
  type: "variable",
};

export const CONVENTION_LABELS: Record<NamingConvention, string> = {
  camelCase: "camelCase",
  PascalCase: "PascalCase",
  snake_case: "snake_case",
  SCREAMING_SNAKE_CASE: "SCREAMING_SNAKE_CASE",
  "kebab-case": "kebab-case",
  flatcase: "flatcase",
  UPPERCASE: "UPPERCASE",
  lowercase: "lowercase",
};

export const CONVENTION_EXAMPLES: Record<NamingConvention, string> = {
  camelCase: "userName, isActive, getTotal",
  PascalCase: "UserName, IsActive, GetTotal",
  snake_case: "user_name, is_active, get_total",
  SCREAMING_SNAKE_CASE: "USER_NAME, IS_ACTIVE, MAX_SIZE",
  "kebab-case": "user-name, is-active, get-total",
  flatcase: "username, isactive, gettotal",
  UPPERCASE: "USERNAME, ISACTIVE, GETTOTAL",
  lowercase: "username, isactive, gettotal",
};

export const TYPE_LABELS: Record<VariableType, string> = {
  variable: "Variable",
  function: "Función",
  class: "Clase",
  constant: "Constante",
  interface: "Interface",
  type: "Type Alias",
  enum: "Enum",
  component: "Componente React",
  hook: "Hook React",
  file: "Nombre de archivo",
  "css-class": "Clase CSS",
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
