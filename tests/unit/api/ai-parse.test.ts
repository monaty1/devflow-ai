import { describe, it, expect } from "vitest";

/**
 * Tests for AI response JSON parsing logic.
 * Each AI route uses the same pattern: strip markdown fences, then JSON.parse.
 * We test the shared pattern here by extracting the logic inline.
 */

function cleanAIResponse(text: string): string {
  return text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

function parseAIJson(text: string): Record<string, unknown> {
  const cleaned = cleanAIResponse(text);
  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    throw new Error(`AI returned malformed JSON: ${cleaned.slice(0, 200)}`);
  }
}

describe("AI Response JSON Parsing", () => {
  it("should parse valid JSON response", () => {
    const result = parseAIJson('{"score": 85, "issues": []}');
    expect(result["score"]).toBe(85);
    expect(result["issues"]).toEqual([]);
  });

  it("should strip markdown fences and parse", () => {
    const result = parseAIJson('```json\n{"score": 90}\n```');
    expect(result["score"]).toBe(90);
  });

  it("should throw descriptive error for malformed JSON", () => {
    expect(() => parseAIJson("this is not json")).toThrow(
      /AI returned malformed JSON: this is not json/,
    );
  });

  it("should include truncated content in error for long responses", () => {
    const longText = "x".repeat(300);
    expect(() => parseAIJson(longText)).toThrow(/AI returned malformed JSON/);
    try {
      parseAIJson(longText);
    } catch (e) {
      // Error message should be truncated to 200 chars max
      expect((e as Error).message.length).toBeLessThanOrEqual(
        "AI returned malformed JSON: ".length + 200,
      );
    }
  });

  it("should handle JSON with nested markdown fences", () => {
    const result = parseAIJson(
      '```json\n{"refinedPrompt": "use ```code``` blocks"}\n```',
    );
    expect(result["refinedPrompt"]).toBe("use code blocks");
  });

  it("should handle empty string after cleaning", () => {
    expect(() => parseAIJson("```json\n```")).toThrow(
      /AI returned malformed JSON/,
    );
  });
});
