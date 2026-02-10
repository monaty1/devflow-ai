export interface RegexGroup {
  index: number;
  pattern: string;
  description: string;
  start: number;
  end: number;
}

export interface RegexToken {
  type:
    | "anchor"
    | "group"
    | "quantifier"
    | "charClass"
    | "escape"
    | "literal"
    | "alternation"
    | "flag";
  value: string;
  description: string;
  start: number;
  end: number;
}

export interface RegexAnalysis {
  id: string;
  pattern: string;
  flags: string;
  explanation: string;
  tokens: RegexToken[];
  groups: RegexGroup[];
  commonPattern: string | null;
  analyzedAt: string;
}

export interface TestMatch {
  match: string;
  index: number;
  groups: Record<string, string>;
}

export interface TestResult {
  pattern: string;
  input: string;
  isValid: boolean;
  matches: boolean;
  allMatches: TestMatch[];
  error: string | null;
}

export type RegexMode = "explain" | "generate" | "test";

export interface CommonPattern {
  id: string;
  name: string;
  pattern: string;
  description: string;
  examples: string[];
}
