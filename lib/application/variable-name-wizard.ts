// Variable Name Wizard: Generate and convert variable names
// Supports multiple naming conventions and generates contextual suggestions

import type {
  NamingConvention,
  VariableType,
  ConversionResult,
  GenerationResult,
  NameAudit,
  NameSuggestion,
  WizardConfig,
} from "@/types/variable-name-wizard";
import { TYPE_CONVENTIONS } from "@/types/variable-name-wizard";

// --- Locale type (pure, no React) ---

type Locale = "en" | "es";

const WIZARD_STRINGS = {
  en: {
    reasoning: {
      recommendedConvention: (type: string) => `Recommended convention for ${type}`,
      optimalLength: "Optimal length",
      reactHookPattern: "Follows React hooks pattern",
      descriptiveActionPrefix: "Descriptive action prefix",
      standardConstantConvention: "Standard convention for constants",
      descriptiveName: "Descriptive name",
    },
    audit: {
      tooGeneric: (word: string) => `Too generic name: "${word}" does not describe the content.`,
      tooShort: "Name too short, may be unclear.",
      tooLong: "Excessively long name, consider simplifying.",
      booleanPrefix: "Boolean states should start with a verb (is, has, can...).",
      avoidNumbers: "Avoid numbers in names unless strictly necessary.",
      hungarianNotation: "Avoid Hungarian notation (strName, intCount); the type is already defined by the language.",
    },
  },
  es: {
    reasoning: {
      recommendedConvention: (type: string) => `Convención recomendada para ${type}`,
      optimalLength: "Longitud óptima",
      reactHookPattern: "Sigue el patrón de hooks de React",
      descriptiveActionPrefix: "Prefijo de acción descriptivo",
      standardConstantConvention: "Convención estándar para constantes",
      descriptiveName: "Nombre descriptivo",
    },
    audit: {
      tooGeneric: (word: string) => `Nombre demasiado genérico: "${word}" no describe el contenido.`,
      tooShort: "Nombre demasiado corto, puede ser poco claro.",
      tooLong: "Nombre excesivamente largo, considera simplificar.",
      booleanPrefix: "Los estados booleanos deberían empezar por un verbo (is, has, can...).",
      avoidNumbers: "Evita usar números en los nombres a menos que sea estrictamente necesario.",
      hungarianNotation: "Evita la notación húngara (strName, intCount); el tipo ya lo define el lenguaje.",
    },
  },
} as const;

// --- Detection Patterns ---

const CONVENTION_PATTERNS: Record<NamingConvention, RegExp> = {
  camelCase: /^[a-z][a-zA-Z0-9]*$/,
  PascalCase: /^[A-Z][a-zA-Z0-9]*$/,
  // eslint-disable-next-line security/detect-unsafe-regex -- bounded naming convention validators
  snake_case: /^[a-z][a-z0-9]*(_[a-z0-9]+)+$/,
  // eslint-disable-next-line security/detect-unsafe-regex
  SCREAMING_SNAKE_CASE: /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/,
  // eslint-disable-next-line security/detect-unsafe-regex
  "kebab-case": /^[a-z][a-z0-9]*(-[a-z0-9]+)+$/,
  flatcase: /^[a-z]+$/,
  UPPERCASE: /^[A-Z]+$/,
  lowercase: /^[a-z]+$/,
};

// --- Word Splitting ---

/**
 * Split a name into individual words regardless of convention
 */
export function splitIntoWords(name: string): string[] {
  // Handle empty or whitespace
  if (!name.trim()) return [];

  // Replace separators with spaces
  const normalized = name
    .replace(/[-_]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase split
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2"); // Handle ACRONYMs

  // Split and filter empty strings
  return normalized
    .split(/\s+/)
    .map((word) => word.toLowerCase())
    .filter(Boolean);
}

// --- Convention Detection ---

/**
 * Detect the naming convention of a given name
 */
export function detectConvention(name: string): NamingConvention | "unknown" {
  if (!name.trim()) return "unknown";

  // Check for multi-word patterns first (more specific)
  if (CONVENTION_PATTERNS.snake_case.test(name)) return "snake_case";
  if (CONVENTION_PATTERNS.SCREAMING_SNAKE_CASE.test(name)) return "SCREAMING_SNAKE_CASE";
  if (CONVENTION_PATTERNS["kebab-case"].test(name)) return "kebab-case";

  // Check for single/multi word camel/pascal
  if (/^[a-z][a-zA-Z0-9]*$/.test(name) && /[A-Z]/.test(name)) return "camelCase";
  if (/^[A-Z][a-zA-Z0-9]*$/.test(name) && name.length > 1) return "PascalCase";

  // Check simple patterns
  if (CONVENTION_PATTERNS.UPPERCASE.test(name) && name.length > 1) return "UPPERCASE";
  if (CONVENTION_PATTERNS.lowercase.test(name)) return "lowercase";
  if (CONVENTION_PATTERNS.flatcase.test(name)) return "flatcase";

  return "unknown";
}

// --- Conversion Functions ---

/**
 * Convert words to camelCase
 */
function toCamelCase(words: string[]): string {
  if (words.length === 0) return "";
  return words
    .map((word, index) =>
      index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join("");
}

/**
 * Convert words to PascalCase
 */
function toPascalCase(words: string[]): string {
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

/**
 * Convert words to snake_case
 */
function toSnakeCase(words: string[]): string {
  return words.map((word) => word.toLowerCase()).join("_");
}

/**
 * Convert words to SCREAMING_SNAKE_CASE
 */
function toScreamingSnakeCase(words: string[]): string {
  return words.map((word) => word.toUpperCase()).join("_");
}

/**
 * Convert words to kebab-case
 */
function toKebabCase(words: string[]): string {
  return words.map((word) => word.toLowerCase()).join("-");
}

/**
 * Convert words to flatcase
 */
function toFlatCase(words: string[]): string {
  return words.map((word) => word.toLowerCase()).join("");
}

/**
 * Convert words to UPPERCASE
 */
function toUpperCase(words: string[]): string {
  return words.map((word) => word.toUpperCase()).join("");
}

/**
 * Convert words to lowercase
 */
function toLowerCase(words: string[]): string {
  return words.map((word) => word.toLowerCase()).join("");
}

// --- Main Conversion ---

/**
 * Convert a name to a specific convention
 */
export function convertTo(name: string, convention: NamingConvention): string {
  const words = splitIntoWords(name);
  if (words.length === 0) return name;

  switch (convention) {
    case "camelCase":
      return toCamelCase(words);
    case "PascalCase":
      return toPascalCase(words);
    case "snake_case":
      return toSnakeCase(words);
    case "SCREAMING_SNAKE_CASE":
      return toScreamingSnakeCase(words);
    case "kebab-case":
      return toKebabCase(words);
    case "flatcase":
      return toFlatCase(words);
    case "UPPERCASE":
      return toUpperCase(words);
    case "lowercase":
      return toLowerCase(words);
    default:
      return name;
  }
}

/**
 * Convert a name to all conventions
 */
export function convertToAll(name: string): ConversionResult {
  const original = name.trim();
  const originalConvention = detectConvention(original);

  const conversions: Record<NamingConvention, string> = {
    camelCase: convertTo(original, "camelCase"),
    PascalCase: convertTo(original, "PascalCase"),
    snake_case: convertTo(original, "snake_case"),
    SCREAMING_SNAKE_CASE: convertTo(original, "SCREAMING_SNAKE_CASE"),
    "kebab-case": convertTo(original, "kebab-case"),
    flatcase: convertTo(original, "flatcase"),
    UPPERCASE: convertTo(original, "UPPERCASE"),
    lowercase: convertTo(original, "lowercase"),
  };

  return {
    id: crypto.randomUUID(),
    original,
    originalConvention,
    conversions,
    timestamp: new Date().toISOString(),
  };
}

// --- Name Generation ---

// Common prefixes for different contexts
const PREFIXES = {
  boolean: ["is", "has", "can", "should", "will", "did", "was", "are"],
  getter: ["get", "fetch", "load", "retrieve", "find", "query"],
  setter: ["set", "update", "change", "modify", "assign"],
  handler: ["handle", "on", "process"],
  validator: ["validate", "check", "verify", "ensure", "assert"],
  transformer: ["to", "from", "parse", "format", "convert", "transform"],
  counter: ["count", "total", "num", "number"],
  list: ["list", "all", "items", "entries", "collection"],
};

// Common suffixes
const SUFFIXES = {
  state: ["state", "status", "mode", "flag"],
  data: ["data", "info", "details", "config", "options", "settings"],
  action: ["action", "event", "callback", "handler"],
  result: ["result", "response", "output", "value"],
  error: ["error", "exception", "fault"],
  time: ["time", "date", "timestamp", "duration", "interval"],
  id: ["id", "key", "index", "ref"],
};

/**
 * Generate word variations
 */
function generateWordVariations(words: string[]): string[][] {
  const variations: string[][] = [words];

  // Add prefix variations for single/short words
  if (words.length <= 2) {
    for (const prefix of PREFIXES.getter.slice(0, 2)) {
      variations.push([prefix, ...words]);
    }
    if (words.length === 1) {
      for (const suffix of SUFFIXES.data.slice(0, 2)) {
        variations.push([...words, suffix]);
      }
    }
  }

  return variations;
}

/**
 * Score a name suggestion
 */
function scoreSuggestion(
  words: string[],
  type: VariableType,
  convention: NamingConvention
): number {
  let score = 50;

  // Reward appropriate convention for the type
  const preferredConventions = TYPE_CONVENTIONS[type];
  if (preferredConventions.includes(convention)) {
    score += 20;
  }

  // Reward appropriate length (2-4 words is ideal)
  if (words.length >= 2 && words.length <= 4) {
    score += 15;
  } else if (words.length === 1) {
    score -= 10;
  } else if (words.length > 5) {
    score -= 15;
  }

  // Reward appropriate prefixes for types
  const firstWord = words[0]?.toLowerCase() ?? "";

  if (type === "function" || type === "hook") {
    if ([...PREFIXES.getter, ...PREFIXES.handler, ...PREFIXES.validator].includes(firstWord)) {
      score += 15;
    }
  }

  if (type === "hook" && firstWord === "use") {
    score += 20;
  }

  if (type === "component" && convention === "PascalCase") {
    score += 10;
  }

  if (type === "constant" && convention === "SCREAMING_SNAKE_CASE") {
    score += 10;
  }

  // Ensure score is between 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Generate reasoning for a suggestion
 */
function generateReasoning(
  words: string[],
  type: VariableType,
  convention: NamingConvention,
  locale: Locale = "en"
): string {
  const s = WIZARD_STRINGS[locale].reasoning;
  const parts: string[] = [];

  const preferredConventions = TYPE_CONVENTIONS[type];
  if (preferredConventions.includes(convention)) {
    parts.push(s.recommendedConvention(type));
  }

  if (words.length >= 2 && words.length <= 3) {
    parts.push(s.optimalLength);
  }

  const firstWord = words[0]?.toLowerCase() ?? "";
  if (type === "hook" && firstWord === "use") {
    parts.push(s.reactHookPattern);
  }

  if (type === "function" && PREFIXES.getter.includes(firstWord)) {
    parts.push(s.descriptiveActionPrefix);
  }

  if (type === "constant" && convention === "SCREAMING_SNAKE_CASE") {
    parts.push(s.standardConstantConvention);
  }

  return parts.length > 0 ? parts.join(". ") : s.descriptiveName;
}

// --- Auditing ---

function performAudit(name: string, _type: VariableType, locale: Locale = "en"): NameAudit {
  const a = WIZARD_STRINGS[locale].audit;
  const findings: string[] = [];
  const words = splitIntoWords(name);
  const lowerName = name.toLowerCase();

  // 1. Generic names
  const genericTerms = ["data", "info", "item", "value", "obj", "object", "thing", "process"];
  if (words.length === 1 && genericTerms.includes(words[0]!)) {
    findings.push(a.tooGeneric(words[0]!));
  }

  // 2. Length issues
  if (name.length < 3 && !["i", "j", "x", "y"].includes(name)) {
    findings.push(a.tooShort);
  }
  if (name.length > 35) {
    findings.push(a.tooLong);
  }

  // 3. Boolean prefixing
  if (lowerName.includes("loading") && !/^(is|has|should|can|will)/.test(lowerName)) {
    findings.push(a.booleanPrefix);
  }

  // 4. Numbers in names
  if (/\d/.test(name)) {
    findings.push(a.avoidNumbers);
  }

  // 5. Hungarian notation detection
  if (/^(str|int|arr|obj|bool|fn)[A-Z]/.test(name)) {
    findings.push(a.hungarianNotation);
  }

  let status: NameAudit["status"] = "good";
  if (findings.length >= 2) status = "error";
  else if (findings.length === 1) status = "warning";

  return { status, findings };
}

/**
 * Generate name suggestions based on context
 */
export function generateSuggestions(
  context: string,
  type: VariableType,
  config: WizardConfig,
  locale: Locale = "en"
): GenerationResult {
  const words = splitIntoWords(context);
  if (words.length === 0) {
    return {
      id: crypto.randomUUID(),
      context,
      type,
      suggestions: [],
      timestamp: new Date().toISOString(),
    };
  }

  const suggestions: NameSuggestion[] = [];
  const seenNames = new Set<string>();

  // Get appropriate conventions for this type
  const conventions = TYPE_CONVENTIONS[type];

  // Generate variations
  const wordVariations = generateWordVariations(words);

  // Special handling for hooks
  if (type === "hook" && words[0] !== "use") {
    wordVariations.unshift(["use", ...words]);
  }

  // Generate suggestions for each variation and convention
  for (const variation of wordVariations) {
    for (const convention of conventions) {
      const name = convertTo(variation.join(" "), convention);

      if (seenNames.has(name)) continue;
      seenNames.add(name);

      const score = scoreSuggestion(variation, type, convention);
      const reasoning = generateReasoning(variation, type, convention, locale);
      const audit = performAudit(name, type, locale);

      suggestions.push({
        id: crypto.randomUUID(),
        name,
        convention,
        score,
        reasoning,
        audit
      });
    }
  }

  // Sort by score and limit
  const sortedSuggestions = suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, config.maxSuggestions);

  return {
    id: crypto.randomUUID(),
    context,
    type,
    suggestions: sortedSuggestions,
    timestamp: new Date().toISOString(),
  };
}

// --- Validation ---

/**
 * Check if a name is valid for a given convention
 */
export function isValidForConvention(name: string, convention: NamingConvention): boolean {
  const pattern = CONVENTION_PATTERNS[convention];
  return pattern.test(name);
}

/**
 * Check if input is valid (non-empty)
 */
export function isValidInput(input: string): boolean {
  return input.trim().length > 0;
}

// --- Common Abbreviations ---

export const COMMON_ABBREVIATIONS: Record<string, string> = {
  // Full → Abbreviated
  application: "app",
  argument: "arg",
  arguments: "args",
  attribute: "attr",
  attributes: "attrs",
  authentication: "auth",
  authorization: "auth",
  average: "avg",
  boolean: "bool",
  button: "btn",
  callback: "cb",
  character: "char",
  collection: "coll",
  command: "cmd",
  component: "comp",
  configuration: "config",
  connection: "conn",
  context: "ctx",
  controller: "ctrl",
  coordinate: "coord",
  coordinates: "coords",
  current: "curr",
  database: "db",
  default: "def",
  definition: "def",
  delete: "del",
  destination: "dest",
  development: "dev",
  difference: "diff",
  directory: "dir",
  document: "doc",
  documents: "docs",
  element: "el",
  elements: "els",
  environment: "env",
  error: "err",
  event: "evt",
  execute: "exec",
  expression: "expr",
  extension: "ext",
  function: "fn",
  handler: "hdlr",
  header: "hdr",
  height: "h",
  image: "img",
  implementation: "impl",
  import: "imp",
  index: "idx",
  information: "info",
  initialize: "init",
  instance: "inst",
  integer: "int",
  iterator: "iter",
  javascript: "js",
  language: "lang",
  length: "len",
  library: "lib",
  location: "loc",
  manager: "mgr",
  maximum: "max",
  memory: "mem",
  message: "msg",
  middleware: "mw",
  minimum: "min",
  miscellaneous: "misc",
  module: "mod",
  navigation: "nav",
  number: "num",
  object: "obj",
  operation: "op",
  option: "opt",
  options: "opts",
  package: "pkg",
  parameter: "param",
  parameters: "params",
  password: "pwd",
  picture: "pic",
  pointer: "ptr",
  position: "pos",
  preference: "pref",
  preferences: "prefs",
  previous: "prev",
  production: "prod",
  property: "prop",
  properties: "props",
  query: "qry",
  random: "rand",
  reference: "ref",
  references: "refs",
  register: "reg",
  regular: "reg",
  repository: "repo",
  request: "req",
  response: "res",
  result: "res",
  return: "ret",
  revision: "rev",
  selected: "sel",
  selection: "sel",
  sequence: "seq",
  server: "srv",
  service: "svc",
  session: "sess",
  source: "src",
  specification: "spec",
  standard: "std",
  statistic: "stat",
  statistics: "stats",
  string: "str",
  structure: "struct",
  synchronize: "sync",
  system: "sys",
  table: "tbl",
  temp: "tmp",
  temporary: "tmp",
  text: "txt",
  timestamp: "ts",
  transaction: "tx",
  typescript: "ts",
  utility: "util",
  utilities: "utils",
  value: "val",
  values: "vals",
  variable: "var",
  variables: "vars",
  version: "ver",
  vertical: "vert",
  width: "w",
  window: "win",
};

/**
 * Expand abbreviations in a name
 */
export function expandAbbreviations(name: string): string {
  const words = splitIntoWords(name);
  const reverseAbbreviations = Object.fromEntries(
    Object.entries(COMMON_ABBREVIATIONS).map(([full, abbr]) => [abbr, full])
  );

  const expanded = words.map((word) => reverseAbbreviations[word] ?? word);
  return expanded.join(" ");
}

/**
 * Abbreviate a name using common abbreviations
 */
export function abbreviateName(name: string): string {
  const words = splitIntoWords(name);
  const abbreviated = words.map((word) => COMMON_ABBREVIATIONS[word] ?? word);
  return abbreviated.join(" ");
}

// --- Example Inputs ---

export const EXAMPLE_INPUTS = [
  "user authentication status",
  "get current user data",
  "handle form submit",
  "is loading complete",
  "max retry attempts",
  "calculate total price",
];
