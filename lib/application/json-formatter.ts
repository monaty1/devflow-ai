// JSON Formatter Application Logic

import type {
  JsonFormatterConfig,
  JsonFormatResult,
  JsonValidationError,
  JsonStats,
  JsonPathResult,
  JsonFormatMode,
} from "@/types/json-formatter";
import { DEFAULT_FORMATTER_CONFIG } from "@/types/json-formatter";

/**
 * Validates JSON string and returns error details if invalid
 */
export function validateJson(input: string): { isValid: boolean; error?: JsonValidationError } {
  if (!input.trim()) {
    return { isValid: false, error: { line: 1, column: 1, message: "Empty input" } };
  }

  try {
    JSON.parse(input);
    return { isValid: true };
  } catch (e) {
    const error = e as SyntaxError;
    const match = error.message.match(/at position (\d+)/);
    const position = match?.[1] ? parseInt(match[1], 10) : 0;

    // Calculate line and column from position
    const lines = input.substring(0, position).split("\n");
    const line = lines.length;
    const column = (lines[lines.length - 1]?.length || 0) + 1;

    return {
      isValid: false,
      error: {
        line,
        column,
        message: error.message.replace(/^JSON\.parse: /, ""),
        fixable: /unexpected|expected|token/i.test(error.message),
      },
    };
  }
}

/**
 * Attempts to fix common JSON syntax errors
 */
export function fixJson(input: string): string {
  let fixed = input.trim();

  // 1. Replace single quotes with double quotes (basic heuristic)
  fixed = fixed.replace(/'([^']*)'/g, '"$1"');

  // 2. Remove trailing commas
  fixed = fixed.replace(/,\s*([}\]])/g, "$1");

  // 3. Add quotes to unquoted keys
  fixed = fixed.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');

  // 4. Fix missing opening/closing braces if very simple
  const openBraces = (fixed.match(/{/g) || []).length;
  const closeBraces = (fixed.match(/}/g) || []).length;
  if (openBraces > closeBraces) fixed += "}".repeat(openBraces - closeBraces);
  
  const openBrackets = (fixed.match(/\[/g) || []).length;
  const closeBrackets = (fixed.match(/\]/g) || []).length;
  if (openBrackets > closeBrackets) fixed += "]".repeat(openBrackets - closeBrackets);

  return fixed;
}

/**
 * Basic JSON to YAML conversion (without external libs for weight)
 */
export function jsonToYaml(obj: unknown, indent = 0): string {
  const spaces = "  ".repeat(indent);
  if (obj === null) return "null";
  if (typeof obj !== "object") return String(obj);

  if (Array.isArray(obj)) {
    return obj.map(item => `\n${spaces}- ${jsonToYaml(item, indent + 1)}`).join("").trim();
  }

  return Object.entries(obj)
    .map(([key, value]) => {
      const val = typeof value === "object" && value !== null 
        ? `\n${jsonToYaml(value, indent + 1)}` 
        : ` ${value}`;
      return `${spaces}${key}:${val}`;
    })
    .join("\n");
}

/**
 * Basic JSON to XML conversion
 */
export function jsonToXml(obj: unknown, rootName = "root"): string {
  function toXml(val: unknown, name: string): string {
    if (val === null) return `<${name}/>`;
    if (Array.isArray(val)) {
      return val.map(item => toXml(item, "item")).join("");
    }
    if (typeof val === "object") {
      const children = Object.entries(val)
        .map(([k, v]) => toXml(v, k))
        .join("");
      return `<${name}>${children}</${name}>`;
    }
    return `<${name}>${val}</${name}>`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n${toXml(obj, rootName)}`;
}

/**
 * Basic JSON to CSV conversion
 */
export function jsonToCsv(obj: unknown): string {
  const arr = Array.isArray(obj) ? obj : [obj];
  if (arr.length === 0) return "";
  
  const headers = Object.keys(arr[0] || {});
  const rows = arr.map(item => 
    headers.map(header => {
      const val = item[header];
      return typeof val === "string" ? `"${val.replace(/"/g, '""')}"` : val;
    }).join(",")
  );
  
  return [headers.join(","), ...rows].join("\n");
}

/**
 * Formats JSON with specified indentation
 */
export function formatJson(
  input: string,
  config: JsonFormatterConfig = DEFAULT_FORMATTER_CONFIG
): string {
  const parsed = JSON.parse(input);

  if (config.sortKeys) {
    const sorted = sortObjectKeys(parsed);
    return JSON.stringify(sorted, null, config.indentSize);
  }

  return JSON.stringify(parsed, null, config.indentSize);
}

/**
 * Minifies JSON by removing whitespace
 */
export function minifyJson(input: string): string {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed);
}

const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/**
 * Recursively sorts object keys alphabetically.
 * Filters out dangerous keys to prevent prototype pollution.
 */
export function sortObjectKeys(obj: unknown): unknown {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }

  const sorted: Record<string, unknown> = {};
  const keys = Object.keys(obj as Record<string, unknown>)
    .filter((k) => !DANGEROUS_KEYS.has(k))
    .sort();

  for (const key of keys) {
    sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
  }

  return sorted;
}

/**
 * Calculates statistics about the JSON structure
 */
export function calculateJsonStats(input: string): JsonStats {
  const parsed = JSON.parse(input);

  const stats: JsonStats = {
    keys: 0,
    values: 0,
    depth: 0,
    arrays: 0,
    objects: 0,
    strings: 0,
    numbers: 0,
    booleans: 0,
    nulls: 0,
    sizeBytes: new Blob([input]).size,
    minifiedSize: new Blob([JSON.stringify(parsed)]).size,
  };

  function traverse(value: unknown, currentDepth: number): void {
    stats.depth = Math.max(stats.depth, currentDepth);

    if (value === null) {
      stats.nulls++;
      stats.values++;
      return;
    }

    if (Array.isArray(value)) {
      stats.arrays++;
      for (const item of value) {
        traverse(item, currentDepth + 1);
      }
      return;
    }

    if (typeof value === "object") {
      stats.objects++;
      const entries = Object.entries(value as Record<string, unknown>);
      stats.keys += entries.length;

      for (const [, v] of entries) {
        traverse(v, currentDepth + 1);
      }
      return;
    }

    stats.values++;

    if (typeof value === "string") {
      stats.strings++;
    } else if (typeof value === "number") {
      stats.numbers++;
    } else if (typeof value === "boolean") {
      stats.booleans++;
    }
  }

  traverse(parsed, 0);

  return stats;
}

/**
 * Extracts all paths from JSON
 */
export function extractJsonPaths(input: string): JsonPathResult[] {
  const parsed = JSON.parse(input);
  const paths: JsonPathResult[] = [];

  function traverse(value: unknown, path: string): void {
    const type = value === null ? "null" : Array.isArray(value) ? "array" : typeof value;

    paths.push({ path: path || "$", value, type });

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        traverse(item, `${path}[${index}]`);
      });
    } else if (value !== null && typeof value === "object") {
      for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
        const newPath = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)
          ? `${path}.${key}`
          : `${path}["${key}"]`;
        traverse(v, newPath);
      }
    }
  }

  traverse(parsed, "$");

  return paths;
}

/**
 * Gets value at a specific JSON path
 */
export function getValueAtPath(input: string, path: string): unknown {
  const parsed = JSON.parse(input);

  if (path === "$") return parsed;

  // Remove leading $. if present
  const cleanPath = path.replace(/^\$\.?/, "");

  // Split path into parts
  const parts = cleanPath.match(/[^.[\]]+|\[\d+\]/g) || [];

  let current: unknown = parsed;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (part.startsWith("[") && part.endsWith("]")) {
      // Array index
      const index = parseInt(part.slice(1, -1), 10);
      if (Array.isArray(current)) {
        current = current[index];
      } else {
        return undefined;
      }
    } else {
      // Object key
      if (typeof current === "object" && current !== null) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
  }

  return current;
}

/**
 * Compares two JSON strings for equality
 */
export function compareJson(json1: string, json2: string): boolean {
  try {
    const parsed1 = JSON.parse(json1);
    const parsed2 = JSON.parse(json2);
    return JSON.stringify(sortObjectKeys(parsed1)) === JSON.stringify(sortObjectKeys(parsed2));
  } catch {
    return false;
  }
}

/**
 * Converts JSON to other formats
 */
export function jsonToTypeScript(input: string, rootName: string = "Root"): string {
  const parsed = JSON.parse(input);

  function getType(value: unknown, name: string): string {
    if (value === null) return "null";
    if (Array.isArray(value)) {
      if (value.length === 0) return "unknown[]";
      const itemType = getType(value[0], `${name}Item`);
      return `${itemType}[]`;
    }
    if (typeof value === "object") {
      return name;
    }
    return typeof value;
  }

  function generateInterface(obj: Record<string, unknown>, name: string): string[] {
    const lines: string[] = [`interface ${name} {`];
    const nestedInterfaces: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const safeName = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key) ? key : `"${key}"`;
      const nestedName = key.charAt(0).toUpperCase() + key.slice(1);

      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        lines.push(`  ${safeName}: ${nestedName};`);
        nestedInterfaces.push(...generateInterface(value as Record<string, unknown>, nestedName));
      } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
        const itemName = `${nestedName}Item`;
        lines.push(`  ${safeName}: ${itemName}[];`);
        nestedInterfaces.push(...generateInterface(value[0] as Record<string, unknown>, itemName));
      } else {
        lines.push(`  ${safeName}: ${getType(value, nestedName)};`);
      }
    }

    lines.push("}");
    return [...nestedInterfaces, ...lines];
  }

  if (typeof parsed !== "object" || parsed === null) {
    return `type ${rootName} = ${typeof parsed};`;
  }

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) {
      return `type ${rootName} = unknown[];`;
    }
    if (typeof parsed[0] === "object" && parsed[0] !== null) {
      const interfaces = generateInterface(parsed[0] as Record<string, unknown>, `${rootName}Item`);
      return [...interfaces, "", `type ${rootName} = ${rootName}Item[];`].join("\n");
    }
    return `type ${rootName} = ${typeof parsed[0]}[];`;
  }

  return generateInterface(parsed as Record<string, unknown>, rootName).join("\n");
}

/**
 * Main format function
 */
export function processJson(
  input: string,
  mode: JsonFormatMode,
  config: JsonFormatterConfig = DEFAULT_FORMATTER_CONFIG
): JsonFormatResult {
  const validation = validateJson(input);

  if (!validation.isValid) {
    return {
      id: crypto.randomUUID(),
      input,
      output: "",
      mode,
      isValid: false,
      error: validation.error ?? { line: 1, column: 1, message: "Invalid JSON" },
      stats: {
        keys: 0,
        values: 0,
        depth: 0,
        arrays: 0,
        objects: 0,
        strings: 0,
        numbers: 0,
        booleans: 0,
        nulls: 0,
        sizeBytes: new Blob([input]).size,
        minifiedSize: 0,
      },
      timestamp: new Date().toISOString(),
    };
  }

  let output: string;

  switch (mode) {
    case "format":
      output = formatJson(input, config);
      break;
    case "minify":
      output = minifyJson(input);
      break;
    case "validate":
      output = formatJson(input, config);
      break;
    case "to-yaml":
      output = jsonToYaml(JSON.parse(input));
      break;
    case "to-xml":
      output = jsonToXml(JSON.parse(input));
      break;
    case "to-csv":
      output = jsonToCsv(JSON.parse(input));
      break;
    default:
      output = input;
  }

  const stats = calculateJsonStats(input);

  return {
    id: crypto.randomUUID(),
    input,
    output,
    mode,
    isValid: true,
    stats,
    timestamp: new Date().toISOString(),
  };
}

// Example inputs for demo
export const EXAMPLE_JSON = {
  simple: `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com"
}`,
  complex: `{
  "users": [
    {"id": 1, "name": "Alice", "roles": ["admin", "user"]},
    {"id": 2, "name": "Bob", "roles": ["user"]}
  ],
  "metadata": {
    "total": 2,
    "page": 1,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}`,
  minified: `{"name":"John","items":[1,2,3],"active":true,"data":null}`,
  invalid: `{"name": "John", "age": }`,
};
