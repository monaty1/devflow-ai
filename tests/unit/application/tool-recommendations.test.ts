import { describe, it, expect } from "vitest";
import {
  detectDataTypes,
  getRecommendations,
} from "@/lib/application/tool-recommendations";

describe("detectDataTypes", () => {
  // ── Empty / whitespace ────────────────────────────────────────────────────
  it("returns empty array for empty string", () => {
    expect(detectDataTypes("")).toEqual([]);
    expect(detectDataTypes("  ")).toEqual([]);
  });

  // ── JSON detection ────────────────────────────────────────────────────────
  it("detects valid JSON object", () => {
    const result = detectDataTypes('{"name": "test"}');
    expect(result).toContain("json");
  });

  it("detects valid JSON array", () => {
    const result = detectDataTypes('[1, 2, 3]');
    expect(result).toContain("json");
  });

  it("does not detect invalid JSON object", () => {
    const result = detectDataTypes("{not valid json}");
    expect(result).not.toContain("json");
  });

  it("does not detect invalid JSON array", () => {
    const result = detectDataTypes("[not, valid, json]");
    expect(result).not.toContain("json");
  });

  it("does not detect JSON for text that does not start with { or [", () => {
    const result = detectDataTypes("plain text with no json markers");
    expect(result).not.toContain("json");
  });

  // ── Code detection ────────────────────────────────────────────────────────
  it("detects code — const keyword", () => {
    const result = detectDataTypes("const x = 42;");
    expect(result).toContain("code");
  });

  it("detects code — function keyword", () => {
    const result = detectDataTypes("function foo() {}");
    expect(result).toContain("code");
  });

  it("detects code — let keyword", () => {
    const result = detectDataTypes("let counter = 0;");
    expect(result).toContain("code");
  });

  it("detects code — var keyword", () => {
    const result = detectDataTypes("var legacy = true;");
    expect(result).toContain("code");
  });

  it("detects code — import keyword", () => {
    const result = detectDataTypes("import React from 'react';");
    expect(result).toContain("code");
  });

  it("detects code — export keyword", () => {
    const result = detectDataTypes("export default function App() {}");
    expect(result).toContain("code");
  });

  it("detects code — class keyword", () => {
    const result = detectDataTypes("class MyClass extends BaseClass {}");
    expect(result).toContain("code");
  });

  it("detects code — interface keyword", () => {
    const result = detectDataTypes("interface User { name: string; age: number; }");
    expect(result).toContain("code");
  });

  it("detects code — type keyword", () => {
    const result = detectDataTypes("type UserId = string | number;");
    expect(result).toContain("code");
  });

  it("does not detect code in plain text without code keywords", () => {
    const result = detectDataTypes("hello world no programming here at all");
    expect(result).not.toContain("code");
  });

  // ── Prompt detection ──────────────────────────────────────────────────────
  it("detects prompt — write keyword with text > 50 chars", () => {
    const result = detectDataTypes(
      "Please write a function that calculates the sum of two numbers and returns the result"
    );
    expect(result).toContain("prompt");
  });

  it("detects prompt — generate keyword", () => {
    const result = detectDataTypes(
      "Can you generate a comprehensive list of best practices for REST API design?"
    );
    expect(result).toContain("prompt");
  });

  it("detects prompt — explain keyword", () => {
    const result = detectDataTypes(
      "Please explain how the JavaScript event loop works and handles async operations"
    );
    expect(result).toContain("prompt");
  });

  it("detects prompt — analyze keyword", () => {
    const result = detectDataTypes(
      "Please analyze the following code and identify potential performance improvements"
    );
    expect(result).toContain("prompt");
  });

  it("detects prompt — describe keyword", () => {
    const result = detectDataTypes(
      "Can you describe the main differences between REST and GraphQL APIs?"
    );
    expect(result).toContain("prompt");
  });

  it("detects prompt — help keyword", () => {
    const result = detectDataTypes(
      "I need help understanding how to properly implement authentication in a Next.js application"
    );
    expect(result).toContain("prompt");
  });

  it("detects prompt — create keyword", () => {
    const result = detectDataTypes(
      "Please create a comprehensive test suite for the following TypeScript utility functions"
    );
    expect(result).toContain("prompt");
  });

  it("does not detect prompt when text is exactly 50 chars (boundary — > 50 required)", () => {
    // 50 chars exactly — condition is text.length > 50 (strictly greater)
    const text50 = "please write me something short for the test now!!";
    expect(text50.length).toBe(50);
    const result = detectDataTypes(text50);
    expect(result).not.toContain("prompt");
  });

  it("does not detect prompt for very short text with prompt keyword", () => {
    const result = detectDataTypes("please help");
    expect(result).not.toContain("prompt");
  });

  it("does not detect prompt for long text without prompt keywords", () => {
    const result = detectDataTypes(
      "The quick brown fox jumps over the lazy dog. This sentence has no instruction keywords in it."
    );
    expect(result).not.toContain("prompt");
  });

  // ── Base64 detection ──────────────────────────────────────────────────────
  it("detects base64 — long valid base64 string (length > 20, mod 4 = 0)", () => {
    // 'dGhpcyBpcyBhIGxvbmdlciBiYXNlNjQgc3RyaW5n' = base64 for 'this is a longer base64 string'
    const result = detectDataTypes("dGhpcyBpcyBhIGxvbmdlciBiYXNlNjQgc3RyaW5n");
    expect(result).toContain("base64");
  });

  it("detects base64 — exactly 24 chars (> 20, mod 4 = 0)", () => {
    // 24-char base64-only string: 24 > 20, 24 % 4 = 0
    const result = detectDataTypes("ABCDEFGHIJKLMNOPQRSTUVWX");
    expect(result).toContain("base64");
  });

  it("does not detect base64 for text with length exactly 20 (boundary — > 20 required)", () => {
    // 'eyJuYW1lIjoiSm9obiJ9' is exactly 20 chars
    const str20 = "eyJuYW1lIjoiSm9obiJ9";
    expect(str20.length).toBe(20);
    const result = detectDataTypes(str20);
    expect(result).not.toContain("base64");
  });

  it("does not detect base64 for short text (length < 20)", () => {
    const result = detectDataTypes("dGVzdA=="); // 8 chars
    expect(result).not.toContain("base64");
  });

  it("does not detect base64 when length mod 4 is not 0", () => {
    // 22 chars of base64-alphabet chars: 22 % 4 = 2 ≠ 0 → NOT base64
    const result = detectDataTypes("ABCDEFGHIJKLMNOPQRSTUV");
    expect(result).not.toContain("base64");
  });

  it("does not detect base64 when text contains non-base64 characters", () => {
    const result = detectDataTypes("this has spaces and punctuation! @#$% longer string here");
    expect(result).not.toContain("base64");
  });

  // ── Cron detection ────────────────────────────────────────────────────────
  it("detects cron expression — standard 5-field", () => {
    const result = detectDataTypes("0 0 * * 1");
    expect(result).toContain("cron");
  });

  it("detects cron expression — complex fields with ranges and lists", () => {
    const result = detectDataTypes("*/5 0-23 1,15 * 1-5");
    expect(result).toContain("cron");
  });

  it("does not detect cron for text with only 4 fields", () => {
    const result = detectDataTypes("0 0 * *");
    expect(result).not.toContain("cron");
  });

  it("does not detect cron for plain text", () => {
    const result = detectDataTypes("this is not a cron expression at all");
    expect(result).not.toContain("cron");
  });

  // ── UUID detection ────────────────────────────────────────────────────────
  it("detects UUID — standard format", () => {
    const result = detectDataTypes("550e8400-e29b-41d4-a716-446655440000");
    expect(result).toContain("uuid");
  });

  it("detects UUID — embedded in text", () => {
    const result = detectDataTypes("User ID: 123e4567-e89b-12d3-a456-426614174000 was created.");
    expect(result).toContain("uuid");
  });

  it("detects UUID — uppercase", () => {
    const result = detectDataTypes("550E8400-E29B-41D4-A716-446655440000");
    expect(result).toContain("uuid");
  });

  it("does not detect UUID for plain hex without dashes", () => {
    const result = detectDataTypes("550e8400e29b41d4a716446655440000");
    expect(result).not.toContain("uuid");
  });

  it("does not detect UUID for random text", () => {
    const result = detectDataTypes("this is just regular text without any UUID");
    expect(result).not.toContain("uuid");
  });

  // ── Regex detection ───────────────────────────────────────────────────────
  it("detects regex — with multiple flags", () => {
    const result = detectDataTypes("/^[a-z]+$/gi");
    expect(result).toContain("regex");
  });

  it("detects regex — with no flags", () => {
    const result = detectDataTypes("/^hello$/");
    expect(result).toContain("regex");
  });

  it("detects regex — with single flag", () => {
    const result = detectDataTypes("/hello world/i");
    expect(result).toContain("regex");
  });

  it("does not detect regex for plain text", () => {
    const result = detectDataTypes("this is just plain text without slashes");
    expect(result).not.toContain("regex");
  });

  // ── CSS/Tailwind detection ────────────────────────────────────────────────
  it("detects CSS/Tailwind — bg- prefix", () => {
    const result = detectDataTypes("bg-red-500 text-white flex items-center");
    expect(result).toContain("css-classes");
  });

  it("detects CSS/Tailwind — grid keyword", () => {
    const result = detectDataTypes("grid grid-cols-3 gap-4 p-8");
    expect(result).toContain("css-classes");
  });

  it("detects CSS/Tailwind — rounded keyword", () => {
    const result = detectDataTypes("rounded-lg shadow-md border border-gray-200");
    expect(result).toContain("css-classes");
  });

  it("detects CSS/Tailwind — m- prefix", () => {
    const result = detectDataTypes("m-4 p-2 flex items-center justify-between");
    expect(result).toContain("css-classes");
  });

  it("detects CSS/Tailwind — text- prefix", () => {
    const result = detectDataTypes("text-lg font-bold text-gray-900");
    expect(result).toContain("css-classes");
  });

  it("does not detect CSS classes for plain text", () => {
    const result = detectDataTypes("hello world this sentence has no css classes");
    expect(result).not.toContain("css-classes");
  });

  // ── Commit message detection ──────────────────────────────────────────────
  it("detects commit message — feat with scope", () => {
    const result = detectDataTypes("feat(auth): add login flow");
    expect(result).toContain("commit-message");
  });

  it("detects commit message — fix without scope", () => {
    const result = detectDataTypes("fix: correct typo in README");
    expect(result).toContain("commit-message");
  });

  it("detects commit message — docs type", () => {
    const result = detectDataTypes("docs(readme): update installation guide");
    expect(result).toContain("commit-message");
  });

  it("detects commit message — style type", () => {
    const result = detectDataTypes("style: fix lint warnings");
    expect(result).toContain("commit-message");
  });

  it("detects commit message — refactor type", () => {
    const result = detectDataTypes("refactor(api): extract service layer");
    expect(result).toContain("commit-message");
  });

  it("detects commit message — test type", () => {
    const result = detectDataTypes("test: add unit tests for auth module");
    expect(result).toContain("commit-message");
  });

  it("detects commit message — chore type", () => {
    const result = detectDataTypes("chore: update dependencies");
    expect(result).toContain("commit-message");
  });

  it("detects commit message — ci type", () => {
    const result = detectDataTypes("ci: add github actions workflow");
    expect(result).toContain("commit-message");
  });

  it("detects commit message — perf type with scope", () => {
    const result = detectDataTypes("perf(db): optimize query performance");
    expect(result).toContain("commit-message");
  });

  it("does not detect commit message for plain text", () => {
    const result = detectDataTypes("added a new feature to the system");
    expect(result).not.toContain("commit-message");
  });

  // ── Multi-type simultaneous detection ─────────────────────────────────────
  it("detects code and uuid simultaneously", () => {
    const result = detectDataTypes(
      'const data = {"id": "550e8400-e29b-41d4-a716-446655440000"}'
    );
    expect(result).toContain("code");
    expect(result).toContain("uuid");
  });

  it("detects json and uuid simultaneously", () => {
    const result = detectDataTypes('{"id":"550e8400-e29b-41d4-a716-446655440000","name":"test"}');
    expect(result).toContain("json");
    expect(result).toContain("uuid");
  });
});

describe("getRecommendations", () => {
  // ── Unknown tool ──────────────────────────────────────────────────────────
  it("returns empty array for unknown tool", () => {
    const result = getRecommendations({
      toolId: "unknown-tool",
      input: "",
      output: "",
      detectedTypes: [],
    });
    expect(result).toEqual([]);
  });

  // ── json-formatter rules ──────────────────────────────────────────────────
  it("recommends DTO-Matic and Token Visualizer for json-formatter with json detected", () => {
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

  it("does not recommend for json-formatter when json is NOT in detectedTypes", () => {
    const result = getRecommendations({
      toolId: "json-formatter",
      input: "plain text",
      output: "",
      detectedTypes: ["code"],
    });
    expect(result.some((r) => r.toolSlug === "dto-matic")).toBe(false);
    expect(result.some((r) => r.toolSlug === "token-visualizer")).toBe(false);
  });

  it("uses output as dataToPass for json-formatter when output is present", () => {
    const result = getRecommendations({
      toolId: "json-formatter",
      input: '{"a":1}',
      output: '{\n  "a": 1\n}',
      detectedTypes: ["json"],
    });
    const dtoRec = result.find((r) => r.toolSlug === "dto-matic");
    expect(dtoRec?.dataToPass).toBe('{\n  "a": 1\n}');
  });

  it("falls back to input as dataToPass for json-formatter when output is empty", () => {
    const result = getRecommendations({
      toolId: "json-formatter",
      input: '{"a":1}',
      output: "",
      detectedTypes: ["json"],
    });
    const dtoRec = result.find((r) => r.toolSlug === "dto-matic");
    // output is falsy (""), so dataToPass should fall back to input
    expect(dtoRec?.dataToPass).toBe('{"a":1}');
  });

  // ── dto-matic rules ───────────────────────────────────────────────────────
  it("recommends JSON Formatter and Code Review for dto-matic with output", () => {
    const result = getRecommendations({
      toolId: "dto-matic",
      input: '{"name": "test"}',
      output: "interface Test { name: string }",
      detectedTypes: ["code"],
    });
    expect(result.some((r) => r.toolSlug === "json-formatter")).toBe(true);
    expect(result.some((r) => r.toolSlug === "code-review")).toBe(true);
  });

  it("does not recommend for dto-matic when output is empty", () => {
    const result = getRecommendations({
      toolId: "dto-matic",
      input: '{"name": "test"}',
      output: "",
      detectedTypes: ["json"],
    });
    expect(result.some((r) => r.toolSlug === "json-formatter")).toBe(false);
    expect(result.some((r) => r.toolSlug === "code-review")).toBe(false);
  });

  it("passes input as dataToPass for dto-matic json-formatter recommendation", () => {
    const result = getRecommendations({
      toolId: "dto-matic",
      input: '{"name": "test"}',
      output: "interface Test { name: string }",
      detectedTypes: ["code"],
    });
    const jsonRec = result.find((r) => r.toolSlug === "json-formatter");
    expect(jsonRec?.dataToPass).toBe('{"name": "test"}');
  });

  it("passes output as dataToPass for dto-matic code-review recommendation", () => {
    const result = getRecommendations({
      toolId: "dto-matic",
      input: '{"name": "test"}',
      output: "interface Test { name: string }",
      detectedTypes: ["code"],
    });
    const codeRec = result.find((r) => r.toolSlug === "code-review");
    expect(codeRec?.dataToPass).toBe("interface Test { name: string }");
  });

  // ── prompt-analyzer rules ─────────────────────────────────────────────────
  it("recommends Token Visualizer and Cost Calculator for prompt-analyzer with input", () => {
    const result = getRecommendations({
      toolId: "prompt-analyzer",
      input: "Write a function",
      output: "",
      detectedTypes: ["prompt"],
    });
    expect(result.some((r) => r.toolSlug === "token-visualizer")).toBe(true);
    expect(result.some((r) => r.toolSlug === "cost-calculator")).toBe(true);
  });

  it("does not recommend for prompt-analyzer when input is empty", () => {
    const result = getRecommendations({
      toolId: "prompt-analyzer",
      input: "",
      output: "Analysis complete",
      detectedTypes: [],
    });
    expect(result.some((r) => r.toolSlug === "token-visualizer")).toBe(false);
    expect(result.some((r) => r.toolSlug === "cost-calculator")).toBe(false);
  });

  it("passes input as dataToPass for prompt-analyzer token-visualizer recommendation", () => {
    const result = getRecommendations({
      toolId: "prompt-analyzer",
      input: "Analyze this prompt content",
      output: "",
      detectedTypes: ["prompt"],
    });
    const rec = result.find((r) => r.toolSlug === "token-visualizer");
    expect(rec?.dataToPass).toBe("Analyze this prompt content");
  });

  // ── code-review rules ─────────────────────────────────────────────────────
  it("recommends Variable Name Wizard for code-review when code is detected", () => {
    const result = getRecommendations({
      toolId: "code-review",
      input: "function test() {}",
      output: "",
      detectedTypes: ["code"],
    });
    expect(result.some((r) => r.toolSlug === "variable-name-wizard")).toBe(true);
  });

  it("does not recommend for code-review when code is NOT in detectedTypes", () => {
    const result = getRecommendations({
      toolId: "code-review",
      input: "Some plain prose",
      output: "No issues found",
      detectedTypes: ["prompt"],
    });
    expect(result.some((r) => r.toolSlug === "variable-name-wizard")).toBe(false);
  });

  // ── base64 rules ──────────────────────────────────────────────────────────
  it("recommends JSON Formatter for base64 when output is JSON", () => {
    const result = getRecommendations({
      toolId: "base64",
      input: "eyJuYW1lIjoiSm9obiJ9",
      output: '{"name":"John"}',
      detectedTypes: ["base64"],
    });
    expect(result.some((r) => r.toolSlug === "json-formatter")).toBe(true);
  });

  it("does not recommend JSON Formatter for base64 when output is plain text (not JSON)", () => {
    const result = getRecommendations({
      toolId: "base64",
      input: "SGVsbG8gV29ybGQ=",
      output: "Hello World",
      detectedTypes: ["base64"],
    });
    expect(result.some((r) => r.toolSlug === "json-formatter")).toBe(false);
  });

  it("does not recommend for base64 when output is empty", () => {
    const result = getRecommendations({
      toolId: "base64",
      input: "SGVsbG8=",
      output: "",
      detectedTypes: ["base64"],
    });
    expect(result.some((r) => r.toolSlug === "json-formatter")).toBe(false);
  });

  // ── regex-humanizer rules ─────────────────────────────────────────────────
  it("recommends Variable Name Wizard for regex-humanizer with input", () => {
    const result = getRecommendations({
      toolId: "regex-humanizer",
      input: "/^[a-z]+$/gi",
      output: "Matches one or more lowercase letters",
      detectedTypes: ["regex"],
    });
    expect(result.some((r) => r.toolSlug === "variable-name-wizard")).toBe(true);
  });

  it("passes input as dataToPass for regex-humanizer recommendation", () => {
    const result = getRecommendations({
      toolId: "regex-humanizer",
      input: "/^[a-z]+$/gi",
      output: "Matches lowercase letters",
      detectedTypes: ["regex"],
    });
    const rec = result.find((r) => r.toolSlug === "variable-name-wizard");
    expect(rec?.dataToPass).toBe("/^[a-z]+$/gi");
  });

  it("does not recommend for regex-humanizer when input is empty", () => {
    const result = getRecommendations({
      toolId: "regex-humanizer",
      input: "",
      output: "",
      detectedTypes: [],
    });
    expect(result.some((r) => r.toolSlug === "variable-name-wizard")).toBe(false);
  });

  // ── git-commit-generator rules ────────────────────────────────────────────
  it("recommends Code Review for git-commit-generator", () => {
    const result = getRecommendations({
      toolId: "git-commit-generator",
      input: "feat: add user auth",
      output: "",
      detectedTypes: ["commit-message"],
    });
    expect(result.some((r) => r.toolSlug === "code-review")).toBe(true);
  });

  it("recommends Code Review for git-commit-generator even with empty input/output", () => {
    const result = getRecommendations({
      toolId: "git-commit-generator",
      input: "",
      output: "",
      detectedTypes: [],
    });
    expect(result.some((r) => r.toolSlug === "code-review")).toBe(true);
  });

  // ── tailwind-sorter rules ─────────────────────────────────────────────────
  it("recommends Code Review for tailwind-sorter when output is present", () => {
    const result = getRecommendations({
      toolId: "tailwind-sorter",
      input: "flex bg-red-500 text-white",
      output: "bg-red-500 flex text-white",
      detectedTypes: ["css-classes"],
    });
    expect(result.some((r) => r.toolSlug === "code-review")).toBe(true);
  });

  it("does not recommend for tailwind-sorter when output is empty", () => {
    const result = getRecommendations({
      toolId: "tailwind-sorter",
      input: "flex bg-red-500",
      output: "",
      detectedTypes: ["css-classes"],
    });
    expect(result.some((r) => r.toolSlug === "code-review")).toBe(false);
  });

  // ── token-visualizer rules ────────────────────────────────────────────────
  it("recommends Cost Calculator and Prompt Analyzer for token-visualizer with input", () => {
    const result = getRecommendations({
      toolId: "token-visualizer",
      input: "Hello world",
      output: "",
      detectedTypes: [],
    });
    expect(result.some((r) => r.toolSlug === "cost-calculator")).toBe(true);
    expect(result.some((r) => r.toolSlug === "prompt-analyzer")).toBe(true);
  });

  it("does not recommend for token-visualizer when input is empty", () => {
    const result = getRecommendations({
      toolId: "token-visualizer",
      input: "",
      output: "42 tokens",
      detectedTypes: [],
    });
    expect(result.some((r) => r.toolSlug === "cost-calculator")).toBe(false);
    expect(result.some((r) => r.toolSlug === "prompt-analyzer")).toBe(false);
  });

  it("passes input as dataToPass for token-visualizer prompt-analyzer recommendation", () => {
    const result = getRecommendations({
      toolId: "token-visualizer",
      input: "Analyze this prompt",
      output: "",
      detectedTypes: [],
    });
    const rec = result.find((r) => r.toolSlug === "prompt-analyzer");
    expect(rec?.dataToPass).toBe("Analyze this prompt");
  });

  // ── context-manager rules ─────────────────────────────────────────────────
  it("recommends Token Visualizer and Cost Calculator for context-manager", () => {
    const result = getRecommendations({
      toolId: "context-manager",
      input: "System: You are helpful. User: Hello.",
      output: "",
      detectedTypes: [],
    });
    expect(result.some((r) => r.toolSlug === "token-visualizer")).toBe(true);
    expect(result.some((r) => r.toolSlug === "cost-calculator")).toBe(true);
  });

  it("recommends for context-manager even with empty input and output", () => {
    const result = getRecommendations({
      toolId: "context-manager",
      input: "",
      output: "",
      detectedTypes: [],
    });
    expect(result.some((r) => r.toolSlug === "token-visualizer")).toBe(true);
    expect(result.some((r) => r.toolSlug === "cost-calculator")).toBe(true);
  });

  // ── uuid-generator rules ──────────────────────────────────────────────────
  it("recommends Variable Name Wizard for uuid-generator", () => {
    const result = getRecommendations({
      toolId: "uuid-generator",
      input: "",
      output: "550e8400-e29b-41d4-a716-446655440000",
      detectedTypes: ["uuid"],
    });
    expect(result.some((r) => r.toolSlug === "variable-name-wizard")).toBe(true);
  });

  // ── cron-builder rules ────────────────────────────────────────────────────
  it("recommends Git Commit Generator for cron-builder", () => {
    const result = getRecommendations({
      toolId: "cron-builder",
      input: "0 0 * * 1",
      output: "Every Monday at midnight",
      detectedTypes: ["cron"],
    });
    expect(result.some((r) => r.toolSlug === "git-commit-generator")).toBe(true);
  });

  // ── http-status-finder rules ──────────────────────────────────────────────
  it("recommends Code Review for http-status-finder", () => {
    const result = getRecommendations({
      toolId: "http-status-finder",
      input: "404",
      output: "Not Found",
      detectedTypes: [],
    });
    expect(result.some((r) => r.toolSlug === "code-review")).toBe(true);
  });

  // ── cost-calculator rules ─────────────────────────────────────────────────
  it("recommends Context Manager for cost-calculator", () => {
    const result = getRecommendations({
      toolId: "cost-calculator",
      input: "1000",
      output: "$0.002",
      detectedTypes: [],
    });
    expect(result.some((r) => r.toolSlug === "context-manager")).toBe(true);
  });

  // ── Global constraints ────────────────────────────────────────────────────
  it("returns at most 3 recommendations", () => {
    const result = getRecommendations({
      toolId: "json-formatter",
      input: '{"name": "test"}',
      output: '{\n  "name": "test"\n}',
      detectedTypes: ["json", "code"],
    });
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it("never recommends the current tool itself", () => {
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

  it("all recommendations have required fields: toolSlug, toolName, reason", () => {
    const contexts = [
      { toolId: "git-commit-generator", input: "changes", output: "", detectedTypes: [] },
      { toolId: "cron-builder", input: "0 * * * *", output: "", detectedTypes: [] },
      { toolId: "http-status-finder", input: "200", output: "", detectedTypes: [] },
      { toolId: "cost-calculator", input: "prompt", output: "", detectedTypes: [] },
      { toolId: "uuid-generator", input: "", output: "abc-123", detectedTypes: [] },
    ];
    for (const ctx of contexts) {
      const result = getRecommendations(ctx);
      for (const rec of result) {
        expect(rec.toolSlug).toBeTruthy();
        expect(rec.toolName).toBeTruthy();
        expect(rec.reason).toBeTruthy();
      }
    }
  });

  it("includes dataToPass when the rule provides it", () => {
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
