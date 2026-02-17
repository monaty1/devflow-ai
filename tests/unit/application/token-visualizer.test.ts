import { describe, it, expect } from "vitest";
import {
  tokenizeText,
  createVisualization,
} from "@/lib/application/token-visualizer";

describe("Token Visualizer", () => {
  describe("tokenizeText", () => {
    it("should tokenize simple text", () => {
      const segments = tokenizeText("Hello world", "openai");

      expect(segments.length).toBeGreaterThan(0);
      // OpenAI tokenizer includes leading space with words: "Hello", " world"
      expect(segments.some((s) => s.text === "Hello")).toBe(true);
      expect(segments.some((s) => s.text === " world")).toBe(true);
    });

    it("should handle empty text", () => {
      const segments = tokenizeText("", "openai");

      expect(segments).toEqual([]);
    });

    it("should handle whitespace-only text", () => {
      const segments = tokenizeText("   ", "openai");

      // Whitespace-only text produces waste tokens (the regex matches whitespace)
      expect(segments.length).toBeGreaterThan(0);
      expect(segments.every((s) => s.isWaste)).toBe(true);
    });

    it("should split long words into sub-tokens", () => {
      const segments = tokenizeText("internationalization", "openai");

      // Long words (>6 chars) should be split
      expect(segments.length).toBeGreaterThan(1);
    });

    it("should handle punctuation as separate tokens", () => {
      const segments = tokenizeText("Hello, world!", "openai");

      expect(segments.some((s) => s.text === ",")).toBe(true);
      expect(segments.some((s) => s.text === "!")).toBe(true);
    });

    it("should handle numbers", () => {
      const segments = tokenizeText("The year is 2024", "openai");

      // OpenAI tokenizer includes leading space: " 2024"
      expect(segments.some((s) => s.text.includes("2024"))).toBe(true);
    });

    it("should assign unique token IDs", () => {
      const segments = tokenizeText("one two three", "openai");
      const ids = segments.map((s) => s.tokenId);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should assign colors to tokens", () => {
      const segments = tokenizeText("Hello world", "openai");

      for (const segment of segments) {
        expect(segment.color).toBeDefined();
        expect(segment.color).toContain("bg-");
      }
    });

    it("should cycle colors for many tokens", () => {
      const segments = tokenizeText("a b c d e f g h i j k l m n o p", "openai");

      // All segments should have colors
      for (const segment of segments) {
        expect(segment.color).toBeDefined();
      }
    });

    it("should not split short words", () => {
      const segments = tokenizeText("cat dog", "openai");

      expect(segments.find((s) => s.text === "cat")).toBeDefined();
      // OpenAI tokenizer includes leading space: " dog"
      expect(segments.find((s) => s.text === " dog")).toBeDefined();
    });

    it("should handle special characters", () => {
      const segments = tokenizeText("Hello... World!!!", "openai");

      expect(segments.length).toBeGreaterThan(0);
    });
  });

  describe("createVisualization", () => {
    it("should return a valid visualization result", () => {
      const result = createVisualization("Test input", "openai");

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("input", "Test input");
      expect(result).toHaveProperty("segments");
      expect(result).toHaveProperty("totalTokens");
      expect(result).toHaveProperty("createdAt");
    });

    it("should count total tokens correctly", () => {
      const result = createVisualization("Hello world", "openai");

      expect(result.totalTokens).toBe(result.segments.length);
    });

    it("should handle empty input", () => {
      const result = createVisualization("", "openai");

      expect(result.segments).toEqual([]);
      expect(result.totalTokens).toBe(0);
    });

    it("should generate unique IDs", () => {
      const result1 = createVisualization("Test", "openai");
      const result2 = createVisualization("Test", "openai");

      expect(result1.id).not.toBe(result2.id);
    });

    it("should preserve original input", () => {
      const input = "  Whitespace preserved  ";
      const result = createVisualization(input, "openai");

      expect(result.input).toBe(input);
    });
  });
});
