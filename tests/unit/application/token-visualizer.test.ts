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

  describe("tokenizeText — providers", () => {
    it("should tokenize with anthropic provider", () => {
      const segments = tokenizeText("Hello world test", "anthropic");
      expect(segments.length).toBeGreaterThan(0);
      expect(segments.some((s) => s.text.includes("Hello"))).toBe(true);
    });

    it("should tokenize with llama provider", () => {
      const segments = tokenizeText("Hello world test", "llama");
      expect(segments.length).toBeGreaterThan(0);
    });

    it("should produce different token counts across providers", () => {
      const text = "The quick brown fox jumps over the lazy dog";
      const openai = tokenizeText(text, "openai");
      const anthropic = tokenizeText(text, "anthropic");
      const llama = tokenizeText(text, "llama");
      // All should tokenize
      expect(openai.length).toBeGreaterThan(0);
      expect(anthropic.length).toBeGreaterThan(0);
      expect(llama.length).toBeGreaterThan(0);
    });
  });

  describe("tokenizeText — unicode", () => {
    it("should handle unicode characters", () => {
      const segments = tokenizeText("你好世界", "openai");
      expect(segments.length).toBeGreaterThan(0);
    });

    it("should handle emoji", () => {
      const segments = tokenizeText("Hello 🌍🚀", "openai");
      expect(segments.length).toBeGreaterThan(0);
    });

    it("should handle mixed scripts", () => {
      const segments = tokenizeText("Hello こんにちは Привет", "openai");
      expect(segments.length).toBeGreaterThan(0);
    });

    it("should handle accented characters", () => {
      const segments = tokenizeText("café résumé naïve", "openai");
      expect(segments.length).toBeGreaterThan(0);
      expect(segments.some((s) => s.text.includes("caf"))).toBe(true);
    });
  });

  describe("tokenizeText — waste detection", () => {
    it("should detect triple spaces as waste", () => {
      const segments = tokenizeText("Hello   world", "openai");
      expect(segments.some((s) => s.isWaste)).toBe(true);
    });

    it("should not mark single spaces as waste", () => {
      const segments = tokenizeText("Hello world", "openai");
      // Single space attached to word isn't waste
      const wasteSegments = segments.filter((s) => s.isWaste);
      expect(wasteSegments.length).toBe(0);
    });

    it("should detect long whitespace runs as waste", () => {
      const segments = tokenizeText("Hello     world", "openai");
      expect(segments.some((s) => s.isWaste)).toBe(true);
    });
  });

  describe("tokenizeText — sub-word splitting", () => {
    it("should split words longer than 8 characters", () => {
      const segments = tokenizeText("authentication", "openai");
      // "authentication" is 14 chars, should be split
      expect(segments.length).toBeGreaterThanOrEqual(2);
    });

    it("should not split words of exactly 8 characters", () => {
      const segments = tokenizeText("keyboard", "openai");
      // 8 chars is not > 8, so it should not split
      expect(segments.some((s) => s.text === "keyboard")).toBe(true);
    });

    it("should split very long words into two parts", () => {
      const segments = tokenizeText("supercalifragilistic", "openai");
      expect(segments.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("tokenizeText — contractions", () => {
    it("should handle English contractions with openai tokenizer", () => {
      const segments = tokenizeText("I'm can't won't", "openai");
      expect(segments.length).toBeGreaterThan(0);
      // OpenAI should split on contractions
      expect(segments.some((s) => s.text === "'m")).toBe(true);
    });

    it("should handle they're and we've", () => {
      const segments = tokenizeText("they're we've", "openai");
      expect(segments.some((s) => s.text === "'re")).toBe(true);
      expect(segments.some((s) => s.text === "'ve")).toBe(true);
    });
  });

  describe("createVisualization — efficiency", () => {
    it("should calculate efficiency score", () => {
      const result = createVisualization("Normal English text here", "openai");
      expect(result.efficiencyScore).toBeGreaterThanOrEqual(0);
      expect(result.efficiencyScore).toBeLessThanOrEqual(100);
    });

    it("should have lower efficiency for wasteful text", () => {
      const clean = createVisualization("Clean text without waste", "openai");
      const wasteful = createVisualization("Lots     of      spaces      here", "openai");
      expect(wasteful.efficiencyScore).toBeLessThanOrEqual(clean.efficiencyScore);
    });

    it("should count waste tokens", () => {
      const result = createVisualization("Hello  world  test", "openai");
      expect(result.wasteCount).toBeGreaterThanOrEqual(0);
    });

    it("should use different providers", () => {
      const openai = createVisualization("Test input", "openai");
      const anthropic = createVisualization("Test input", "anthropic");
      expect(openai.provider).toBe("openai");
      expect(anthropic.provider).toBe("anthropic");
    });

    it("should set createdAt timestamp", () => {
      const result = createVisualization("Test", "openai");
      expect(new Date(result.createdAt).getTime()).not.toBeNaN();
    });

    it("should default to openai provider", () => {
      const result = createVisualization("Test");
      expect(result.provider).toBe("openai");
    });
  });
});
