import { describe, it, expect } from "vitest";
import {
  validateJson,
  fixJson,
  formatJson,
  minifyJson,
  sortObjectKeys,
  calculateJsonStats,
  extractJsonPaths,
  getValueAtPath,
  compareJson,
  diffJsonLines,
  jsonToTypeScript,
  jsonToYaml,
  jsonToXml,
  jsonToCsv,
  processJson,
  EXAMPLE_JSON,
} from "@/lib/application/json-formatter";
import { DEFAULT_FORMATTER_CONFIG } from "@/types/json-formatter";

describe("JSON Formatter", () => {
  describe("validateJson", () => {
    it("should validate correct JSON", () => {
      const result = validateJson('{"name": "John"}');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should invalidate incorrect JSON", () => {
      const result = validateJson('{"name": }');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should return error for empty input", () => {
      const result = validateJson("");
      expect(result.isValid).toBe(false);
      expect(result.error?.message).toBe("Empty input");
    });

    it("should handle arrays", () => {
      const result = validateJson("[1, 2, 3]");
      expect(result.isValid).toBe(true);
    });

    it("should handle nested objects", () => {
      const result = validateJson('{"a": {"b": {"c": 1}}}');
      expect(result.isValid).toBe(true);
    });
  });

  describe("formatJson", () => {
    it("should format with default indentation (2 spaces)", () => {
      const input = '{"name":"John","age":30}';
      const result = formatJson(input);
      expect(result).toContain("  ");
      expect(result).toContain('"name": "John"');
    });

    it("should format with 4 spaces indentation", () => {
      const input = '{"name":"John"}';
      const result = formatJson(input, { ...DEFAULT_FORMATTER_CONFIG, indentSize: 4 });
      expect(result).toContain("    ");
    });

    it("should sort keys when enabled", () => {
      const input = '{"z": 1, "a": 2, "m": 3}';
      const result = formatJson(input, { ...DEFAULT_FORMATTER_CONFIG, sortKeys: true });
      const lines = result.split("\n");
      expect(lines[1]).toContain('"a"');
    });
  });

  describe("minifyJson", () => {
    it("should remove all whitespace", () => {
      const input = `{
        "name": "John",
        "age": 30
      }`;
      const result = minifyJson(input);
      expect(result).not.toContain("\n");
      expect(result).not.toContain("  ");
      expect(result).toBe('{"name":"John","age":30}');
    });
  });

  describe("sortObjectKeys", () => {
    it("should sort object keys alphabetically", () => {
      const obj = { z: 1, a: 2, m: 3 };
      const sorted = sortObjectKeys(obj) as Record<string, number>;
      const keys = Object.keys(sorted);
      expect(keys).toEqual(["a", "m", "z"]);
    });

    it("should sort nested objects", () => {
      const obj = { z: { c: 1, a: 2 }, a: 1 };
      const sorted = sortObjectKeys(obj) as Record<string, unknown>;
      const outerKeys = Object.keys(sorted);
      expect(outerKeys).toEqual(["a", "z"]);
    });

    it("should handle arrays", () => {
      const obj = { arr: [{ z: 1, a: 2 }] };
      const sorted = sortObjectKeys(obj) as Record<string, unknown[]>;
      const innerObj = sorted["arr"]![0] as Record<string, number>;
      const keys = Object.keys(innerObj);
      expect(keys).toEqual(["a", "z"]);
    });

    it("should return primitive values unchanged", () => {
      expect(sortObjectKeys(42)).toBe(42);
      expect(sortObjectKeys("test")).toBe("test");
      expect(sortObjectKeys(null)).toBe(null);
    });
  });

  describe("calculateJsonStats", () => {
    it("should count keys and values", () => {
      const input = '{"a": 1, "b": 2}';
      const stats = calculateJsonStats(input);
      expect(stats.keys).toBe(2);
      expect(stats.numbers).toBe(2);
    });

    it("should count different value types", () => {
      const input = '{"str": "text", "num": 42, "bool": true, "nil": null}';
      const stats = calculateJsonStats(input);
      expect(stats.strings).toBe(1);
      expect(stats.numbers).toBe(1);
      expect(stats.booleans).toBe(1);
      expect(stats.nulls).toBe(1);
    });

    it("should calculate depth", () => {
      const input = '{"a": {"b": {"c": 1}}}';
      const stats = calculateJsonStats(input);
      expect(stats.depth).toBe(3);
    });

    it("should count arrays and objects", () => {
      const input = '{"arr": [1, 2], "obj": {"x": 1}}';
      const stats = calculateJsonStats(input);
      expect(stats.arrays).toBe(1);
      expect(stats.objects).toBe(2); // root + nested obj
    });
  });

  describe("extractJsonPaths", () => {
    it("should extract root path", () => {
      const paths = extractJsonPaths('{"name": "John"}');
      expect(paths[0]!.path).toBe("$");
    });

    it("should extract nested paths", () => {
      const input = '{"user": {"name": "John"}}';
      const paths = extractJsonPaths(input);
      const pathStrings = paths.map((p) => p.path);
      expect(pathStrings).toContain("$.user");
      expect(pathStrings).toContain("$.user.name");
    });

    it("should extract array paths", () => {
      const input = '{"items": [1, 2]}';
      const paths = extractJsonPaths(input);
      const pathStrings = paths.map((p) => p.path);
      expect(pathStrings).toContain("$.items[0]");
      expect(pathStrings).toContain("$.items[1]");
    });
  });

  describe("getValueAtPath", () => {
    it("should get root value", () => {
      const input = '{"name": "John"}';
      const value = getValueAtPath(input, "$");
      expect(value).toEqual({ name: "John" });
    });

    it("should get nested value", () => {
      const input = '{"user": {"name": "John"}}';
      const value = getValueAtPath(input, "$.user.name");
      expect(value).toBe("John");
    });

    it("should get array element", () => {
      const input = '{"items": [10, 20, 30]}';
      const value = getValueAtPath(input, "$.items[1]");
      expect(value).toBe(20);
    });

    it("should return undefined for invalid path", () => {
      const input = '{"name": "John"}';
      const value = getValueAtPath(input, "$.invalid.path");
      expect(value).toBeUndefined();
    });
  });

  describe("compareJson", () => {
    it("should return true for equal JSON", () => {
      const json1 = '{"a": 1, "b": 2}';
      const json2 = '{"b": 2, "a": 1}';
      expect(compareJson(json1, json2)).toBe(true);
    });

    it("should return false for different JSON", () => {
      const json1 = '{"a": 1}';
      const json2 = '{"a": 2}';
      expect(compareJson(json1, json2)).toBe(false);
    });

    it("should handle invalid JSON", () => {
      expect(compareJson("invalid", '{"a": 1}')).toBe(false);
    });
  });

  describe("diffJsonLines", () => {
    it("should return all unchanged for identical JSON", () => {
      const json = '{"a": 1, "b": 2}';
      const result = diffJsonLines(json, json);
      expect(result.addedCount).toBe(0);
      expect(result.removedCount).toBe(0);
      expect(result.unchangedCount).toBeGreaterThan(0);
      expect(result.lines.every((l) => l.status === "unchanged")).toBe(true);
    });

    it("should detect added lines", () => {
      const json1 = '{"a": 1}';
      const json2 = '{"a": 1, "b": 2}';
      const result = diffJsonLines(json1, json2);
      expect(result.addedCount).toBeGreaterThan(0);
      expect(result.lines.some((l) => l.status === "added" && l.content.includes('"b"'))).toBe(true);
    });

    it("should detect removed lines", () => {
      const json1 = '{"a": 1, "b": 2}';
      const json2 = '{"a": 1}';
      const result = diffJsonLines(json1, json2);
      expect(result.removedCount).toBeGreaterThan(0);
      expect(result.lines.some((l) => l.status === "removed" && l.content.includes('"b"'))).toBe(true);
    });

    it("should detect changed values", () => {
      const json1 = '{"a": 1}';
      const json2 = '{"a": 99}';
      const result = diffJsonLines(json1, json2);
      expect(result.addedCount).toBeGreaterThan(0);
      expect(result.removedCount).toBeGreaterThan(0);
    });

    it("should handle invalid JSON gracefully", () => {
      const result = diffJsonLines("not json", '{"a": 1}');
      expect(result.lines.length).toBeGreaterThan(0);
    });
  });

  describe("jsonToTypeScript", () => {
    it("should generate interface for simple object", () => {
      const input = '{"name": "John", "age": 30}';
      const result = jsonToTypeScript(input, "User");
      expect(result).toContain("interface User");
      expect(result).toContain("name: string");
      expect(result).toContain("age: number");
    });

    it("should handle arrays", () => {
      const input = '{"items": [1, 2, 3]}';
      const result = jsonToTypeScript(input);
      expect(result).toContain("items: number[]");
    });

    it("should handle nested objects", () => {
      const input = '{"user": {"name": "John"}}';
      const result = jsonToTypeScript(input);
      expect(result).toContain("interface User");
    });
  });

  describe("processJson", () => {
    it("should process valid JSON in format mode", () => {
      const result = processJson('{"name": "John"}', "format");
      expect(result.isValid).toBe(true);
      expect(result.output).toContain('"name"');
    });

    it("should process valid JSON in minify mode", () => {
      const result = processJson('{ "name": "John" }', "minify");
      expect(result.isValid).toBe(true);
      expect(result.output).toBe('{"name":"John"}');
    });

    it("should return error for invalid JSON", () => {
      const result = processJson('{"name": }', "format");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should include stats in result", () => {
      const result = processJson('{"a": 1, "b": 2}', "format");
      expect(result.stats.keys).toBe(2);
    });
  });

  describe("EXAMPLE_JSON", () => {
    it("should have valid simple example", () => {
      expect(validateJson(EXAMPLE_JSON.simple).isValid).toBe(true);
    });

    it("should have valid complex example", () => {
      expect(validateJson(EXAMPLE_JSON.complex).isValid).toBe(true);
    });

    it("should have valid minified example", () => {
      expect(validateJson(EXAMPLE_JSON.minified).isValid).toBe(true);
    });

    it("should have invalid example for testing", () => {
      expect(validateJson(EXAMPLE_JSON.invalid).isValid).toBe(false);
    });
  });

  describe("jsonToTypeScript - edge cases", () => {
    it("should generate type for empty array", () => {
      const result = jsonToTypeScript("[]", "Items");
      expect(result).toContain("unknown[]");
      expect(result).toContain("Items");
    });

    it("should generate type for primitive array", () => {
      const result = jsonToTypeScript("[1, 2, 3]", "Numbers");
      expect(result).toContain("number[]");
      expect(result).toContain("Numbers");
    });

    it("should generate type for object array", () => {
      const result = jsonToTypeScript('[{"id": 1, "name": "test"}]', "Users");
      expect(result).toContain("UsersItem");
      expect(result).toContain("id");
      expect(result).toContain("name");
    });

    it("should generate type for non-object input (string)", () => {
      const result = jsonToTypeScript('"hello"', "Value");
      expect(result).toContain("Value");
      expect(result).toContain("string");
    });

    it("should generate type for non-object input (number)", () => {
      const result = jsonToTypeScript("42", "Count");
      expect(result).toContain("Count");
      expect(result).toContain("number");
    });

    it("should generate type for boolean input", () => {
      const result = jsonToTypeScript("true", "Flag");
      expect(result).toContain("Flag");
      expect(result).toContain("boolean");
    });

    it("should handle nested objects", () => {
      const result = jsonToTypeScript('{"user": {"name": "John", "age": 30}}', "Root");
      expect(result).toContain("User");
      expect(result).toContain("name");
    });
  });

  describe("processJson - mode branches", () => {
    it("should process with format mode", () => {
      const result = processJson('{"a":1}', "format");
      expect(result.isValid).toBe(true);
      expect(result.output).toContain("a");
      expect(result.mode).toBe("format");
    });

    it("should process with minify mode", () => {
      const result = processJson('{ "a" : 1 }', "minify");
      expect(result.isValid).toBe(true);
      expect(result.output).toBe('{"a":1}');
      expect(result.mode).toBe("minify");
    });

    it("should process with validate mode", () => {
      const result = processJson('{"a": 1}', "validate");
      expect(result.isValid).toBe(true);
      expect(result.mode).toBe("validate");
    });

    it("should return error for invalid JSON", () => {
      const result = processJson("{invalid}", "format");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle default/unknown mode", () => {
      // Cast to bypass type check for testing the default branch
      const result = processJson('{"a": 1}', "unknown" as "format");
      expect(result.isValid).toBe(true);
      // Default case returns input unchanged
      expect(result.output).toBe('{"a": 1}');
    });

    it("should include stats in result", () => {
      const result = processJson('{"name": "John", "age": 30}', "format");
      expect(result.isValid).toBe(true);
      expect(result.stats).toBeDefined();
      expect(result.stats!.keys).toBeGreaterThan(0);
    });

    it("should process with to-yaml mode", () => {
      const result = processJson('{"name": "John", "age": 30}', "to-yaml");
      expect(result.isValid).toBe(true);
      expect(result.mode).toBe("to-yaml");
      expect(result.output).toContain("name:");
      expect(result.output).toContain("age:");
    });

    it("should process with to-xml mode", () => {
      const result = processJson('{"name": "John"}', "to-xml");
      expect(result.isValid).toBe(true);
      expect(result.mode).toBe("to-xml");
      expect(result.output).toContain("<?xml");
      expect(result.output).toContain("<root>");
      expect(result.output).toContain("<name>John</name>");
    });

    it("should process with to-csv mode", () => {
      const result = processJson('[{"name": "John", "age": 30}]', "to-csv");
      expect(result.isValid).toBe(true);
      expect(result.mode).toBe("to-csv");
      expect(result.output).toContain("name,age");
      expect(result.output).toContain('"John"');
    });
  });

  describe("fixJson", () => {
    it("should replace single quotes with double quotes", () => {
      const result = fixJson("{'name': 'John'}");
      expect(result).toContain('"name"');
      expect(result).toContain('"John"');
    });

    it("should remove trailing commas", () => {
      const result = fixJson('{"name": "John", "age": 30, }');
      expect(result).not.toMatch(/,\s*}/);
    });

    it("should add quotes to unquoted keys", () => {
      const result = fixJson("{name: \"John\"}");
      expect(result).toContain('"name"');
    });

    it("should fix missing closing braces", () => {
      const result = fixJson('{"name": "John"');
      expect(result).toContain("}");
    });

    it("should fix missing closing brackets", () => {
      const result = fixJson("[1, 2, 3");
      expect(result).toContain("]");
    });

    it("should handle already valid JSON", () => {
      const input = '{"name": "John"}';
      const result = fixJson(input);
      expect(JSON.parse(result)).toEqual({ name: "John" });
    });

    it("should trim whitespace", () => {
      const result = fixJson('  {"a": 1}  ');
      expect(result).toBe('{"a": 1}');
    });
  });

  describe("jsonToYaml", () => {
    it("should convert null to 'null'", () => {
      expect(jsonToYaml(null)).toBe("null");
    });

    it("should convert primitive values to string", () => {
      expect(jsonToYaml(42)).toBe("42");
      expect(jsonToYaml("hello")).toBe("hello");
      expect(jsonToYaml(true)).toBe("true");
    });

    it("should convert simple object to YAML", () => {
      const result = jsonToYaml({ name: "John", age: 30 });
      expect(result).toContain("name: John");
      expect(result).toContain("age: 30");
    });

    it("should convert array to YAML with dashes", () => {
      const result = jsonToYaml([1, 2, 3]);
      expect(result).toContain("- 1");
      expect(result).toContain("- 2");
      expect(result).toContain("- 3");
    });

    it("should convert nested objects to YAML", () => {
      const result = jsonToYaml({ user: { name: "John" } });
      expect(result).toContain("user:");
      expect(result).toContain("name: John");
    });

    it("should handle objects with null values", () => {
      const result = jsonToYaml({ data: null });
      expect(result).toContain("data:");
    });

    it("should handle arrays of objects", () => {
      const result = jsonToYaml([{ id: 1 }, { id: 2 }]);
      expect(result).toContain("id: 1");
      expect(result).toContain("id: 2");
    });
  });

  describe("jsonToXml", () => {
    it("should generate XML header", () => {
      const result = jsonToXml({});
      expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    });

    it("should wrap in root element", () => {
      const result = jsonToXml({ name: "John" });
      expect(result).toContain("<root>");
      expect(result).toContain("</root>");
    });

    it("should convert simple values", () => {
      const result = jsonToXml({ name: "John", age: 30 });
      expect(result).toContain("<name>John</name>");
      expect(result).toContain("<age>30</age>");
    });

    it("should convert arrays with item elements", () => {
      const result = jsonToXml({ items: [1, 2, 3] });
      expect(result).toContain("<item>1</item>");
      expect(result).toContain("<item>2</item>");
    });

    it("should handle null values as self-closing tags", () => {
      const result = jsonToXml(null, "data");
      expect(result).toContain("<data/>");
    });

    it("should handle nested objects", () => {
      const result = jsonToXml({ user: { name: "John" } });
      expect(result).toContain("<user><name>John</name></user>");
    });

    it("should accept custom root name", () => {
      const result = jsonToXml({ a: 1 }, "custom");
      expect(result).toContain("<custom>");
      expect(result).toContain("</custom>");
    });
  });

  describe("jsonToCsv", () => {
    it("should convert array of objects to CSV", () => {
      const result = jsonToCsv([
        { name: "John", age: 30 },
        { name: "Jane", age: 25 },
      ]);
      expect(result).toContain("name,age");
      expect(result).toContain('"John",30');
      expect(result).toContain('"Jane",25');
    });

    it("should convert single object to CSV", () => {
      const result = jsonToCsv({ name: "John", age: 30 });
      expect(result).toContain("name,age");
      expect(result).toContain('"John",30');
    });

    it("should return empty string for empty array", () => {
      const result = jsonToCsv([]);
      expect(result).toBe("");
    });

    it("should escape double quotes in strings", () => {
      const result = jsonToCsv([{ text: 'He said "hello"' }]);
      expect(result).toContain('""hello""');
    });

    it("should handle numeric and boolean values without quotes", () => {
      const result = jsonToCsv([{ num: 42, flag: true }]);
      const lines = result.split("\n");
      expect(lines[1]).toBe("42,true");
    });
  });

  describe("validateJson - error detail branches", () => {
    it("should set fixable flag for token-related errors", () => {
      const result = validateJson('{"name": undefined}');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should calculate line and column for multi-line errors", () => {
      const result = validateJson('{\n  "name": \n}');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error!.line).toBeGreaterThanOrEqual(1);
      expect(result.error!.column).toBeGreaterThanOrEqual(1);
    });
  });

  describe("sortObjectKeys - dangerous keys", () => {
    it("should filter out __proto__ key", () => {
      const obj = JSON.parse('{"__proto__": "bad", "safe": 1}');
      const sorted = sortObjectKeys(obj) as Record<string, unknown>;
      expect(Object.keys(sorted)).toEqual(["safe"]);
    });

    it("should filter out constructor key", () => {
      const obj = { constructor: "bad", safe: 1 };
      const sorted = sortObjectKeys(obj) as Record<string, unknown>;
      expect(Object.keys(sorted)).toEqual(["safe"]);
    });
  });

  describe("extractJsonPaths - special key names", () => {
    it("should bracket-quote keys with special characters", () => {
      const input = '{"some-key": 1, "another.key": 2}';
      const paths = extractJsonPaths(input);
      const pathStrings = paths.map((p) => p.path);
      expect(pathStrings).toContain('$["some-key"]');
      expect(pathStrings).toContain('$["another.key"]');
    });

    it("should set correct types for path entries", () => {
      const input = '{"arr": [1], "obj": {}, "str": "hello", "num": 42, "nil": null}';
      const paths = extractJsonPaths(input);
      const typeMap = new Map(paths.map((p) => [p.path, p.type]));
      expect(typeMap.get("$.arr")).toBe("array");
      expect(typeMap.get("$.obj")).toBe("object");
      expect(typeMap.get("$.str")).toBe("string");
      expect(typeMap.get("$.num")).toBe("number");
      expect(typeMap.get("$.nil")).toBe("null");
    });
  });

  describe("getValueAtPath - edge cases", () => {
    it("should return undefined when traversing through null", () => {
      const input = '{"a": null}';
      const value = getValueAtPath(input, "$.a.b");
      expect(value).toBeUndefined();
    });

    it("should return undefined when using array index on non-array", () => {
      const input = '{"a": "string"}';
      const value = getValueAtPath(input, "$.a[0]");
      expect(value).toBeUndefined();
    });

    it("should return undefined when using object key on non-object", () => {
      const input = '{"a": 42}';
      const value = getValueAtPath(input, "$.a.b");
      expect(value).toBeUndefined();
    });

    it("should handle path without leading $.", () => {
      const input = '{"name": "John"}';
      const value = getValueAtPath(input, "name");
      expect(value).toBe("John");
    });
  });

  describe("jsonToTypeScript - additional branches", () => {
    it("should handle null value in object", () => {
      const result = jsonToTypeScript('{"data": null}', "Response");
      expect(result).toContain("data: null");
    });

    it("should handle empty array in object", () => {
      const result = jsonToTypeScript('{"items": []}', "Response");
      expect(result).toContain("items: unknown[]");
    });

    it("should handle array of objects in object", () => {
      const result = jsonToTypeScript('{"users": [{"name": "John"}]}', "Data");
      expect(result).toContain("interface UsersItem");
      expect(result).toContain("users: UsersItem[]");
    });

    it("should handle keys needing quoting", () => {
      const result = jsonToTypeScript('{"some-key": "value"}', "Data");
      expect(result).toContain('"some-key"');
    });
  });

  describe("calculateJsonStats - size properties", () => {
    it("should calculate sizeBytes and minifiedSize", () => {
      const input = '{\n  "name": "John"\n}';
      const stats = calculateJsonStats(input);
      expect(stats.sizeBytes).toBeGreaterThan(0);
      expect(stats.minifiedSize).toBeGreaterThan(0);
      expect(stats.minifiedSize).toBeLessThanOrEqual(stats.sizeBytes);
    });

    it("should handle values count correctly", () => {
      const input = '{"a": "text", "b": 42}';
      const stats = calculateJsonStats(input);
      expect(stats.values).toBe(2);
    });
  });

  describe("fixJson — escaped quotes", () => {
    it("should handle escaped single quotes inside strings", () => {
      const input = "{'name': 'it\\'s a test'}";
      const fixed = fixJson(input);
      // Should not break on escaped quote
      expect(fixed).toContain('"name"');
    });

    it("should replace simple single quotes", () => {
      const input = "{'key': 'value'}";
      const fixed = fixJson(input);
      expect(fixed).toBe('{"key": "value"}');
    });

    it("should handle nested single quotes correctly", () => {
      const input = "{'data': {'nested': 'val'}}";
      const fixed = fixJson(input);
      expect(fixed).toContain('"nested"');
      expect(fixed).toContain('"val"');
    });
  });
});
