import { describe, it, expect } from "vitest";
import {
  sortObjectKeys,
  processJson,
  validateJson,
  formatJson,
  minifyJson,
  jsonToTypeScript,
  extractJsonPaths,
  calculateJsonStats,
} from "@/lib/application/json-formatter";

describe("Prototype Pollution Protection", () => {
  describe("sortObjectKeys — dangerous key filtering", () => {
    it("should filter __proto__ key from objects", () => {
      const malicious = JSON.parse('{"__proto__": {"isAdmin": true}, "name": "safe"}');
      const result = sortObjectKeys(malicious) as Record<string, unknown>;

      expect(result).not.toHaveProperty("__proto__");
      expect(result).toHaveProperty("name", "safe");
    });

    it("should filter constructor key from objects", () => {
      const malicious = JSON.parse('{"constructor": {"polluted": true}, "id": 1}');
      const result = sortObjectKeys(malicious) as Record<string, unknown>;

      expect(result).not.toHaveProperty("constructor");
      expect(result).toHaveProperty("id", 1);
    });

    it("should filter prototype key from objects", () => {
      const malicious = JSON.parse('{"prototype": {"fn": "evil"}, "valid": true}');
      const result = sortObjectKeys(malicious) as Record<string, unknown>;

      expect(result).not.toHaveProperty("prototype");
      expect(result).toHaveProperty("valid", true);
    });

    it("should filter all three dangerous keys simultaneously", () => {
      const malicious = JSON.parse(
        '{"__proto__": {}, "constructor": {}, "prototype": {}, "safe": "value"}'
      );
      const result = sortObjectKeys(malicious) as Record<string, unknown>;

      expect(Object.keys(result)).toEqual(["safe"]);
      expect(result).toHaveProperty("safe", "value");
    });

    it("should filter dangerous keys in nested objects recursively", () => {
      const malicious = JSON.parse(
        '{"level1": {"__proto__": {"admin": true}, "name": "nested"}, "top": true}'
      );
      const result = sortObjectKeys(malicious) as Record<string, unknown>;
      const level1 = result["level1"] as Record<string, unknown>;

      expect(level1).not.toHaveProperty("__proto__");
      expect(level1).toHaveProperty("name", "nested");
      expect(result).toHaveProperty("top", true);
    });

    it("should filter dangerous keys inside arrays of objects", () => {
      const malicious = JSON.parse(
        '[{"__proto__": {}, "id": 1}, {"constructor": {}, "id": 2}]'
      );
      const result = sortObjectKeys(malicious) as Record<string, unknown>[];

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty("__proto__");
      expect(result[0]).toHaveProperty("id", 1);
      expect(result[1]).not.toHaveProperty("constructor");
      expect(result[1]).toHaveProperty("id", 2);
    });

    it("should preserve safe keys that look similar to dangerous keys", () => {
      const safe = JSON.parse(
        '{"__proto": "not dangerous", "constructors": "also safe", "prototyping": true}'
      );
      const result = sortObjectKeys(safe) as Record<string, unknown>;

      expect(result).toHaveProperty("__proto", "not dangerous");
      expect(result).toHaveProperty("constructors", "also safe");
      expect(result).toHaveProperty("prototyping", true);
    });

    it("should handle deeply nested pollution attempts (3+ levels)", () => {
      const malicious = JSON.parse(
        '{"a": {"b": {"c": {"__proto__": {"polluted": true}, "safe": 42}}}}'
      );
      const result = sortObjectKeys(malicious) as Record<string, unknown>;
      const deep = ((result["a"] as Record<string, unknown>)["b"] as Record<string, unknown>)[
        "c"
      ] as Record<string, unknown>;

      expect(deep).not.toHaveProperty("__proto__");
      expect(deep).toHaveProperty("safe", 42);
    });

    it("should return primitives unchanged", () => {
      expect(sortObjectKeys("string")).toBe("string");
      expect(sortObjectKeys(42)).toBe(42);
      expect(sortObjectKeys(null)).toBeNull();
      expect(sortObjectKeys(true)).toBe(true);
    });
  });

  describe("JSON.parse safety — no Object.prototype modification", () => {
    it("should not pollute Object.prototype via validateJson", () => {
      const before = Object.getOwnPropertyNames(Object.prototype).length;
      validateJson('{"__proto__": {"isAdmin": true}}');
      const after = Object.getOwnPropertyNames(Object.prototype).length;

      expect(after).toBe(before);
      expect((Object.prototype as Record<string, unknown>)["isAdmin"]).toBeUndefined();
    });

    it("should not pollute Object.prototype via formatJson", () => {
      const before = Object.getOwnPropertyNames(Object.prototype).length;
      formatJson('{"__proto__": {"polluted": true}}');
      const after = Object.getOwnPropertyNames(Object.prototype).length;

      expect(after).toBe(before);
      expect((Object.prototype as Record<string, unknown>)["polluted"]).toBeUndefined();
    });

    it("should not pollute Object.prototype via minifyJson", () => {
      const before = Object.getOwnPropertyNames(Object.prototype).length;
      minifyJson('{"__proto__": {"evil": true}}');
      const after = Object.getOwnPropertyNames(Object.prototype).length;

      expect(after).toBe(before);
      expect((Object.prototype as Record<string, unknown>)["evil"]).toBeUndefined();
    });

    it("should not pollute Object.prototype via processJson", () => {
      const before = Object.getOwnPropertyNames(Object.prototype).length;
      processJson('{"__proto__": {"isAdmin": true}}', "format");
      processJson('{"constructor": {"polluted": true}}', "minify");
      processJson('{"prototype": {"fn": "evil"}}', "validate");
      const after = Object.getOwnPropertyNames(Object.prototype).length;

      expect(after).toBe(before);
      expect((Object.prototype as Record<string, unknown>)["isAdmin"]).toBeUndefined();
      expect((Object.prototype as Record<string, unknown>)["polluted"]).toBeUndefined();
      expect((Object.prototype as Record<string, unknown>)["fn"]).toBeUndefined();
    });
  });

  describe("Other JSON operations — safe with dangerous keys as data", () => {
    it("jsonToTypeScript should handle __proto__ as a regular key name", () => {
      const result = jsonToTypeScript('{"__proto__": {"admin": true}, "name": "test"}');
      expect(result).toContain("interface");
      expect(result).toContain("name");
    });

    it("extractJsonPaths should include __proto__ as a valid path", () => {
      const paths = extractJsonPaths('{"__proto__": {"admin": true}, "name": "test"}');
      expect(paths.length).toBeGreaterThan(0);
    });

    it("calculateJsonStats should count dangerous keys in stats", () => {
      const stats = calculateJsonStats('{"__proto__": {}, "safe": "value"}');
      expect(stats.keys).toBeGreaterThanOrEqual(2);
    });

    it("should roundtrip JSON with dangerous keys through validate + format", () => {
      const input = '{"__proto__":{"admin":true},"name":"test"}';
      const validation = validateJson(input);
      expect(validation.isValid).toBe(true);

      const formatted = formatJson(input);
      expect(formatted).toContain('"name"');
    });
  });
});
