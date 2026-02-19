import { describe, it, expect } from "vitest";
import {
  detectDataTypes,
  getRecommendations,
} from "@/lib/application/tool-recommendations";

describe("detectDataTypes", () => {
  it("returns empty array for empty string", () => {
    expect(detectDataTypes("")).toEqual([]);
    expect(detectDataTypes("  ")).toEqual([]);
  });

  it("detects valid JSON object", () => {
    const result = detectDataTypes('{"name": "test"}');
    expect(result).toContain("json");
  });

  it("detects valid JSON array", () => {
    const result = detectDataTypes('[1, 2, 3]');
    expect(result).toContain("json");
  });

  it("does not detect invalid JSON", () => {
    const result = detectDataTypes("{not valid json}");
    expect(result).not.toContain("json");
  });

  it("detects code patterns", () => {
    const result = detectDataTypes("const x = 42; function foo() {}");
    expect(result).toContain("code");
  });

  it("detects prompt patterns", () => {
    const result = detectDataTypes(
      "Please write a function that calculates the sum of two numbers and returns the result"
    );
    expect(result).toContain("prompt");
  });

  it("detects cron expression", () => {
    const result = detectDataTypes("0 0 * * 1");
    expect(result).toContain("cron");
  });

  it("detects UUID", () => {
    const result = detectDataTypes("550e8400-e29b-41d4-a716-446655440000");
    expect(result).toContain("uuid");
  });

  it("detects regex", () => {
    const result = detectDataTypes("/^[a-z]+$/gi");
    expect(result).toContain("regex");
  });

  it("detects CSS/Tailwind classes", () => {
    const result = detectDataTypes("bg-red-500 text-white flex items-center");
    expect(result).toContain("css-classes");
  });

  it("detects commit message", () => {
    const result = detectDataTypes("feat(auth): add login flow");
    expect(result).toContain("commit-message");
  });

  it("detects multiple types simultaneously", () => {
    const result = detectDataTypes(
      'const data = {"id": "550e8400-e29b-41d4-a716-446655440000"}'
    );
    expect(result).toContain("code");
    expect(result).toContain("uuid");
  });
});

describe("getRecommendations", () => {
  it("returns empty array for unknown tool", () => {
    const result = getRecommendations({
      toolId: "unknown-tool",
      input: "",
      output: "",
      detectedTypes: [],
    });
    expect(result).toEqual([]);
  });

  it("recommends DTO-Matic and Token Visualizer for JSON formatter with JSON", () => {
    const result = getRecommendations({
      toolId: "json-formatter",
      input: '{"name": "test"}',
      output: '{\n  "name": "test"\n}',
      detectedTypes: ["json"],
    });
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result.some((r) => r.toolSlug === "dto-matic")).toBe(true);
    expect(result.some((r) => r.toolSlug === "token-visualizer")).toBe(true);
  });

  it("recommends Token Visualizer and Cost Calculator for prompt analyzer", () => {
    const result = getRecommendations({
      toolId: "prompt-analyzer",
      input: "Write a function",
      output: "",
      detectedTypes: ["prompt"],
    });
    expect(result.some((r) => r.toolSlug === "token-visualizer")).toBe(true);
    expect(result.some((r) => r.toolSlug === "cost-calculator")).toBe(true);
  });

  it("recommends Variable Name Wizard for code review with code", () => {
    const result = getRecommendations({
      toolId: "code-review",
      input: "function test() {}",
      output: "",
      detectedTypes: ["code"],
    });
    expect(result.some((r) => r.toolSlug === "variable-name-wizard")).toBe(true);
  });

  it("recommends JSON formatter for base64 when output is JSON", () => {
    const result = getRecommendations({
      toolId: "base64",
      input: "eyJuYW1lIjoiSm9obiJ9",
      output: '{"name":"John"}',
      detectedTypes: ["base64"],
    });
    expect(result.some((r) => r.toolSlug === "json-formatter")).toBe(true);
  });

  it("returns at most 3 recommendations", () => {
    const result = getRecommendations({
      toolId: "json-formatter",
      input: '{"name": "test"}',
      output: '{\n  "name": "test"\n}',
      detectedTypes: ["json", "code"],
    });
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it("never recommends the current tool", () => {
    const result = getRecommendations({
      toolId: "json-formatter",
      input: '{"a":1}',
      output: '{"a": 1}',
      detectedTypes: ["json"],
    });
    expect(result.every((r) => r.toolSlug !== "json-formatter")).toBe(true);
  });

  it("deduplicates recommendations by toolSlug", () => {
    const result = getRecommendations({
      toolId: "dto-matic",
      input: '{"name": "test"}',
      output: "interface Test { name: string }",
      detectedTypes: ["json", "code"],
    });
    const slugs = result.map((r) => r.toolSlug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("recommends Cost Calculator and Prompt Analyzer for token visualizer", () => {
    const result = getRecommendations({
      toolId: "token-visualizer",
      input: "Hello world",
      output: "",
      detectedTypes: [],
    });
    expect(result.some((r) => r.toolSlug === "cost-calculator")).toBe(true);
    expect(result.some((r) => r.toolSlug === "prompt-analyzer")).toBe(true);
  });

  it("includes dataToPass when relevant", () => {
    const result = getRecommendations({
      toolId: "json-formatter",
      input: '{"a":1}',
      output: '{\n  "a": 1\n}',
      detectedTypes: ["json"],
    });
    const dtoRec = result.find((r) => r.toolSlug === "dto-matic");
    expect(dtoRec?.dataToPass).toBeTruthy();
  });
});
