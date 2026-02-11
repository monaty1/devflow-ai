import { describe, it, expect } from "vitest";
import {
  validateJson,
  formatJson,
  minifyJson,
  sortObjectKeys,
  calculateJsonStats,
  extractJsonPaths,
  getValueAtPath,
  compareJson,
  jsonToTypeScript,
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
  });
});
