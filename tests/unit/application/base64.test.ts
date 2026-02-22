import { describe, it, expect } from "vitest";
import {
  encodeBase64,
  decodeBase64,
  validateBase64,
  processBase64,
  getByteView,
  detectContent,
} from "@/lib/application/base64";
import { DEFAULT_BASE64_CONFIG } from "@/types/base64";

describe("Base64 Encoder/Decoder", () => {
  describe("encodeBase64", () => {
    it("should encode simple text", () => {
      const result = encodeBase64("Hello, World!");
      expect(result).toBe("SGVsbG8sIFdvcmxkIQ==");
    });

    it("should encode empty string", () => {
      const result = encodeBase64("");
      expect(result).toBe("");
    });

    it("should encode unicode characters", () => {
      const result = encodeBase64("Hello 世界");
      expect(result).toBeTruthy();
      // Verify roundtrip
      expect(decodeBase64(result)).toBe("Hello 世界");
    });

    it("should encode with URL-safe variant", () => {
      // Input that produces + and / in standard base64
      const input = ">>>???"; // Produces "Pj4+Pz8/" in standard
      const standard = encodeBase64(input, { ...DEFAULT_BASE64_CONFIG, variant: "standard" });
      const urlSafe = encodeBase64(input, { ...DEFAULT_BASE64_CONFIG, variant: "url-safe" });

      // Standard should have special chars
      expect(standard).toMatch(/[+/=]/);
      // URL-safe should not have + / =
      expect(urlSafe).not.toContain("+");
      expect(urlSafe).not.toContain("/");
      expect(urlSafe).not.toContain("=");
      // But should have - or _ replacements
      expect(urlSafe).toMatch(/[-_]|^[A-Za-z0-9]+$/);
    });

    it("should add line breaks when enabled", () => {
      const longText = "A".repeat(100);
      const result = encodeBase64(longText, {
        ...DEFAULT_BASE64_CONFIG,
        lineBreaks: true,
        lineLength: 20,
      });
      expect(result).toContain("\n");
      const lines = result.split("\n");
      expect(lines[0]!.length).toBeLessThanOrEqual(20);
    });
  });

  describe("decodeBase64", () => {
    it("should decode simple base64", () => {
      const result = decodeBase64("SGVsbG8sIFdvcmxkIQ==");
      expect(result).toBe("Hello, World!");
    });

    it("should decode empty string", () => {
      const result = decodeBase64("");
      expect(result).toBe("");
    });

    it("should decode URL-safe base64", () => {
      const urlSafe = "SGVsbG8sIFdvcmxkIQ"; // No padding
      const result = decodeBase64(urlSafe, { ...DEFAULT_BASE64_CONFIG, variant: "url-safe" });
      expect(result).toBe("Hello, World!");
    });

    it("should handle base64 with line breaks", () => {
      const withBreaks = "SGVs\nbG8s\nIFdv\ncmxk\nIQ==";
      const result = decodeBase64(withBreaks);
      expect(result).toBe("Hello, World!");
    });

    it("should decode unicode", () => {
      // First encode, then decode
      const original = "Hola Mundo 🌍";
      const encoded = encodeBase64(original);
      const decoded = decodeBase64(encoded);
      expect(decoded).toBe(original);
    });
  });

  describe("validateBase64", () => {
    it("should validate correct standard base64", () => {
      const result = validateBase64("SGVsbG8sIFdvcmxkIQ==");
      expect(result.isValid).toBe(true);
    });

    it("should validate correct URL-safe base64", () => {
      const result = validateBase64("SGVsbG8sIFdvcmxkIQ", "url-safe");
      expect(result.isValid).toBe(true);
    });

    it("should invalidate empty input", () => {
      const result = validateBase64("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Empty input");
    });

    it("should invalidate invalid characters", () => {
      const result = validateBase64("Hello World!");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Invalid");
    });

    it("should invalidate incorrect length", () => {
      const result = validateBase64("SGVsbG8"); // Missing padding
      expect(result.isValid).toBe(false);
    });

    it("should handle whitespace in base64", () => {
      const result = validateBase64("SGVs bG8s IFdv cmxk IQ==");
      expect(result.isValid).toBe(true);
    });
  });

  describe("processBase64", () => {
    it("should process encode mode", () => {
      const result = processBase64("Hello, World!", "encode");
      expect(result.isValid).toBe(true);
      expect(result.output).toBe("SGVsbG8sIFdvcmxkIQ==");
      expect(result.mode).toBe("encode");
    });

    it("should process decode mode", () => {
      const result = processBase64("SGVsbG8sIFdvcmxkIQ==", "decode");
      expect(result.isValid).toBe(true);
      expect(result.output).toBe("Hello, World!");
      expect(result.mode).toBe("decode");
    });

    it("should return error for empty input", () => {
      const result = processBase64("", "encode");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Empty input");
    });

    it("should return error for invalid base64 in decode mode", () => {
      const result = processBase64("not-valid-base64!!!", "decode");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should include stats in result", () => {
      const result = processBase64("Hello", "encode");
      expect(result.stats.inputLength).toBe(5);
      expect(result.stats.outputLength).toBeGreaterThan(0);
    });

    it("should include timestamp and id", () => {
      const result = processBase64("Hello", "encode");
      expect(result.id).toBeTruthy();
      expect(result.timestamp).toBeTruthy();
    });
  });

  describe("validateBase64 - uncovered branches", () => {
    it("should validate url-safe base64 that needs padding restoration", () => {
      // "Hello, World!" encodes to "SGVsbG8sIFdvcmxkIQ==" in standard
      // In url-safe without padding: "SGVsbG8sIFdvcmxkIQ"
      // This needs padding restoration (length % 4 !== 0)
      const result = validateBase64("SGVsbG8sIFdvcmxkIQ", "url-safe");
      expect(result.isValid).toBe(true);
    });

    it("should return isValid false with error for invalid standard base64 characters", () => {
      const result = validateBase64("Invalid!@#$Base64", "standard");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("Invalid");
    });

    it("should return isValid false with error for invalid url-safe base64 characters", () => {
      const result = validateBase64("Invalid+Base/64==", "url-safe");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("Invalid");
      expect(result.error).toContain("URL-safe");
    });

    it("should return isValid false for standard base64 with wrong length", () => {
      // Standard base64 must be multiple of 4
      const result = validateBase64("SGVsb"); // length 5, not multiple of 4
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("length");
    });
  });

  describe("getByteView", () => {
    it("should return hex, binary, and decimal for plain text", () => {
      const result = getByteView("Hi", false);
      expect(result.hex).toBe("48 69");
      expect(result.binary).toBe("01001000 01101001");
      expect(result.decimal).toEqual([72, 105]);
    });

    it("should decode base64 input and return byte view", () => {
      // "Hi" in base64 is "SGk="
      const result = getByteView("SGk=", true);
      expect(result.hex).toBe("48 69");
      expect(result.decimal).toEqual([72, 105]);
    });

    it("should return empty byte view for invalid base64", () => {
      const result = getByteView("!!!invalid!!!", true);
      expect(result.hex).toBe("");
      expect(result.binary).toBe("");
      expect(result.decimal).toEqual([]);
    });

    it("should handle empty string", () => {
      const result = getByteView("", false);
      expect(result.hex).toBe("");
      expect(result.decimal).toEqual([]);
    });
  });

  describe("detectContent", () => {
    it("should detect JSON object", () => {
      expect(detectContent('{"key": "value"}')).toBe("json");
    });

    it("should detect JSON array", () => {
      expect(detectContent('[1, 2, 3]')).toBe("json");
    });

    it("should detect JWT token", () => {
      expect(detectContent("eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abc123def456")).toBe("jwt");
    });

    it("should detect hex string", () => {
      expect(detectContent("48656c6c6f20")).toBe("hex");
    });

    it("should return text for plain text", () => {
      expect(detectContent("Hello World!")).toBe("text");
    });

    it("should detect image from data URI in base64 mode", () => {
      expect(detectContent("data:image/png;base64,abc", true)).toBe("image");
    });

    it("should return text for invalid base64 in base64 mode", () => {
      expect(detectContent("!!!not-base64!!!", true)).toBe("text");
    });

    it("should return text for invalid JSON-like content", () => {
      expect(detectContent("{not valid json}")).toBe("text");
    });
  });

  describe("processBase64 - additional coverage", () => {
    it("should include byteView and detectedType in encode result", () => {
      const result = processBase64("Hello", "encode");
      expect(result.byteView).toBeDefined();
      expect(result.detectedType).toBeDefined();
    });

    it("should include stats with compressionRatio for decode", () => {
      const result = processBase64("SGVsbG8sIFdvcmxkIQ==", "decode");
      expect(result.stats.compressionRatio).toBeGreaterThan(0);
    });

    it("should handle whitespace-only input as empty", () => {
      const result = processBase64("   ", "encode");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Empty input");
    });
  });

  describe("roundtrip encoding/decoding", () => {
    it("should roundtrip ASCII text", () => {
      const original = "Hello, World!";
      const encoded = encodeBase64(original);
      const decoded = decodeBase64(encoded);
      expect(decoded).toBe(original);
    });

    it("should roundtrip unicode text", () => {
      const original = "Héllo Wörld 日本語 🎉";
      const encoded = encodeBase64(original);
      const decoded = decodeBase64(encoded);
      expect(decoded).toBe(original);
    });

    it("should roundtrip JSON", () => {
      const original = JSON.stringify({ name: "John", age: 30 });
      const encoded = encodeBase64(original);
      const decoded = decodeBase64(encoded);
      expect(decoded).toBe(original);
      expect(JSON.parse(decoded)).toEqual({ name: "John", age: 30 });
    });

    it("should roundtrip with URL-safe variant", () => {
      const config = { ...DEFAULT_BASE64_CONFIG, variant: "url-safe" as const };
      const original = "Hello+World/Test=";
      const encoded = encodeBase64(original, config);
      const decoded = decodeBase64(encoded, config);
      expect(decoded).toBe(original);
    });
  });

  describe("getByteView — error reporting", () => {
    it("should return error field for invalid base64 input", () => {
      const result = getByteView("!!!invalid!!!", true);
      expect(result.error).toBe("Invalid base64 input");
      expect(result.hex).toBe("");
      expect(result.decimal).toEqual([]);
    });

    it("should not return error for valid base64 input", () => {
      const result = getByteView("SGVsbG8=", true);
      expect(result.error).toBeUndefined();
      expect(result.hex).toContain("48");
    });

    it("should not return error for plain text input", () => {
      const result = getByteView("Hello", false);
      expect(result.error).toBeUndefined();
      expect(result.decimal.length).toBeGreaterThan(0);
    });
  });
});
