import { describe, it, expect } from "vitest";
import {
  tokenizeText,
  createVisualization,
} from "@/lib/application/token-visualizer";

describe("Token Visualizer", () => {
  describe("tokenizeText", () => {
    it("should tokenize simple text", () => {
      const segments = tokenizeText("Hello world");

      expect(segments.length).toBeGreaterThan(0);
      expect(segments.some((s) => s.text === "Hello")).toBe(true);
      expect(segments.some((s) => s.text === "world")).toBe(true);
    });

    it("should handle empty text", () => {
      const segments = tokenizeText("");

      expect(segments).toEqual([]);
    });

    it("should handle whitespace-only text", () => {
      const segments = tokenizeText("   ");

      expect(segments).toEqual([]);
    });

    it("should split long words into sub-tokens", () => {
      const segments = tokenizeText("internationalization");

      // Long words (>6 chars) should be split
      expect(segments.length).toBeGreaterThan(1);
    });

    it("should handle punctuation as separate tokens", () => {
      const segments = tokenizeText("Hello, world!");

      expect(segments.some((s) => s.text === ",")).toBe(true);
      expect(segments.some((s) => s.text === "!")).toBe(true);
    });

    it("should handle numbers", () => {
      const segments = tokenizeText("The year is 2024");

      expect(segments.some((s) => s.text === "2024")).toBe(true);
    });

    it("should assign unique token IDs", () => {
      const segments = tokenizeText("one two three");
      const ids = segments.map((s) => s.tokenId);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should assign colors to tokens", () => {
      const segments = tokenizeText("Hello world");

      for (const segment of segments) {
        expect(segment.color).toBeDefined();
        expect(segment.color).toContain("bg-");
      }
    });

    it("should cycle colors for many tokens", () => {
      const segments = tokenizeText("a b c d e f g h i j k l m n o p");

      // All segments should have colors
      for (const segment of segments) {
        expect(segment.color).toBeDefined();
      }
    });

    it("should not split short words", () => {
      const segments = tokenizeText("cat dog");

      expect(segments.find((s) => s.text === "cat")).toBeDefined();
      expect(segments.find((s) => s.text === "dog")).toBeDefined();
    });

    it("should handle special characters", () => {
      const segments = tokenizeText("Hello... World!!!");

      expect(segments.length).toBeGreaterThan(0);
    });
  });

  describe("createVisualization", () => {
    it("should return a valid visualization result", () => {
      const result = createVisualization("Test input");

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("input", "Test input");
      expect(result).toHaveProperty("segments");
      expect(result).toHaveProperty("totalTokens");
      expect(result).toHaveProperty("estimatedCost");
      expect(result).toHaveProperty("createdAt");
    });

    it("should count total tokens correctly", () => {
      const result = createVisualization("Hello world");

      expect(result.totalTokens).toBe(result.segments.length);
    });

    it("should estimate costs", () => {
      const result = createVisualization("Test");

      expect(result.estimatedCost.gpt4).toBeGreaterThanOrEqual(0);
      expect(result.estimatedCost.claude).toBeGreaterThanOrEqual(0);
    });

    it("should have higher claude cost than gpt4 per token", () => {
      const result = createVisualization("Test content here");

      // Based on the code: gpt4 = 2.5/M, claude = 3.0/M
      if (result.totalTokens > 0) {
        expect(result.estimatedCost.claude).toBeGreaterThan(
          result.estimatedCost.gpt4
        );
      }
    });

    it("should handle empty input", () => {
      const result = createVisualization("");

      expect(result.segments).toEqual([]);
      expect(result.totalTokens).toBe(0);
      expect(result.estimatedCost.gpt4).toBe(0);
      expect(result.estimatedCost.claude).toBe(0);
    });

    it("should generate unique IDs", () => {
      const result1 = createVisualization("Test");
      const result2 = createVisualization("Test");

      expect(result1.id).not.toBe(result2.id);
    });

    it("should scale cost with token count", () => {
      const short = createVisualization("Hi");
      const long = createVisualization(
        "This is a much longer text that should have significantly more tokens"
      );

      expect(long.estimatedCost.gpt4).toBeGreaterThan(short.estimatedCost.gpt4);
      expect(long.estimatedCost.claude).toBeGreaterThan(
        short.estimatedCost.claude
      );
    });

    it("should preserve original input", () => {
      const input = "  Whitespace preserved  ";
      const result = createVisualization(input);

      expect(result.input).toBe(input);
    });
  });
});
