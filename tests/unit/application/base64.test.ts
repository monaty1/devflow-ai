import { describe, it, expect } from "vitest";
import {
  encodeBase64,
  decodeBase64,
  validateBase64,
  calculateBase64Stats,
  processBase64,
  fileToDataUrl,
  dataUrlToBase64,
  EXAMPLE_BASE64,
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
      expect(lines[0].length).toBeLessThanOrEqual(20);
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

  describe("calculateBase64Stats", () => {
    it("should calculate encode stats", () => {
      const input = "Hello";
      const output = "SGVsbG8=";
      const stats = calculateBase64Stats(input, output, "encode");

      expect(stats.inputLength).toBe(5);
      expect(stats.outputLength).toBe(8);
      expect(stats.compressionRatio).toBeGreaterThan(1); // Base64 increases size
    });

    it("should calculate decode stats", () => {
      const input = "SGVsbG8=";
      const output = "Hello";
      const stats = calculateBase64Stats(input, output, "decode");

      expect(stats.inputLength).toBe(8);
      expect(stats.outputLength).toBe(5);
      expect(stats.compressionRatio).toBeGreaterThan(1);
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

  describe("fileToDataUrl", () => {
    it("should create data URL with default mime type", () => {
      const base64 = "SGVsbG8=";
      const result = fileToDataUrl(base64);
      expect(result).toBe("data:application/octet-stream;base64,SGVsbG8=");
    });

    it("should create data URL with custom mime type", () => {
      const base64 = "SGVsbG8=";
      const result = fileToDataUrl(base64, "text/plain");
      expect(result).toBe("data:text/plain;base64,SGVsbG8=");
    });

    it("should create image data URL", () => {
      const base64 = "iVBORw0KGgo=";
      const result = fileToDataUrl(base64, "image/png");
      expect(result).toBe("data:image/png;base64,iVBORw0KGgo=");
    });
  });

  describe("dataUrlToBase64", () => {
    it("should extract base64 from data URL", () => {
      const dataUrl = "data:text/plain;base64,SGVsbG8=";
      const result = dataUrlToBase64(dataUrl);
      expect(result).toEqual({
        mimeType: "text/plain",
        base64: "SGVsbG8=",
      });
    });

    it("should extract from image data URL", () => {
      const dataUrl = "data:image/png;base64,iVBORw0KGgo=";
      const result = dataUrlToBase64(dataUrl);
      expect(result?.mimeType).toBe("image/png");
      expect(result?.base64).toBe("iVBORw0KGgo=");
    });

    it("should return null for invalid data URL", () => {
      const result = dataUrlToBase64("not-a-data-url");
      expect(result).toBeNull();
    });

    it("should return null for non-base64 data URL", () => {
      const result = dataUrlToBase64("data:text/plain,Hello");
      expect(result).toBeNull();
    });
  });

  describe("EXAMPLE_BASE64", () => {
    it("should have valid text example", () => {
      expect(EXAMPLE_BASE64.text).toBeTruthy();
    });

    it("should have valid JSON example", () => {
      expect(() => JSON.parse(EXAMPLE_BASE64.json)).not.toThrow();
    });

    it("should have valid encoded example", () => {
      const validation = validateBase64(EXAMPLE_BASE64.encoded);
      expect(validation.isValid).toBe(true);
    });

    it("should have valid URL-safe example", () => {
      const validation = validateBase64(EXAMPLE_BASE64.urlSafe, "url-safe");
      expect(validation.isValid).toBe(true);
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
});
