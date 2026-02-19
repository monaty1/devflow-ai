import { describe, it, expect } from "vitest";
import {
  aiReviewSchema,
  aiSuggestSchema,
  aiRefineSchema,
  aiTokenizeSchema,
} from "@/lib/api/schemas";

describe("aiReviewSchema", () => {
  it("should accept valid input", () => {
    const result = aiReviewSchema.safeParse({
      code: "const x = 1;",
      language: "typescript",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty code", () => {
    const result = aiReviewSchema.safeParse({
      code: "",
      language: "typescript",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid language", () => {
    const result = aiReviewSchema.safeParse({
      code: "x = 1",
      language: "cobol",
    });
    expect(result.success).toBe(false);
  });

  it("should reject code over 50K characters", () => {
    const result = aiReviewSchema.safeParse({
      code: "a".repeat(50_001),
      language: "typescript",
    });
    expect(result.success).toBe(false);
  });
});

describe("aiSuggestSchema", () => {
  it("should accept variable-name mode", () => {
    const result = aiSuggestSchema.safeParse({
      context: "a function that fetches user data",
      type: "function",
      language: "typescript",
      mode: "variable-name",
    });
    expect(result.success).toBe(true);
  });

  it("should accept regex-generate mode", () => {
    const result = aiSuggestSchema.safeParse({
      context: "match email addresses",
      mode: "regex-generate",
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing mode", () => {
    const result = aiSuggestSchema.safeParse({
      context: "test",
    });
    expect(result.success).toBe(false);
  });
});

describe("aiRefineSchema", () => {
  it("should accept valid input", () => {
    const result = aiRefineSchema.safeParse({
      prompt: "Write a function",
      goal: "clarity",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid goal", () => {
    const result = aiRefineSchema.safeParse({
      prompt: "test",
      goal: "speed",
    });
    expect(result.success).toBe(false);
  });

  it("should reject prompt over 10K characters", () => {
    const result = aiRefineSchema.safeParse({
      prompt: "a".repeat(10_001),
      goal: "clarity",
    });
    expect(result.success).toBe(false);
  });
});

describe("aiTokenizeSchema", () => {
  it("should accept valid input", () => {
    const result = aiTokenizeSchema.safeParse({
      text: "Hello world",
      model: "gpt-4o",
    });
    expect(result.success).toBe(true);
  });

  it("should accept cl100k_base encoding", () => {
    const result = aiTokenizeSchema.safeParse({
      text: "test",
      model: "cl100k_base",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid model", () => {
    const result = aiTokenizeSchema.safeParse({
      text: "test",
      model: "claude-3",
    });
    expect(result.success).toBe(false);
  });

  it("should reject text over 100K characters", () => {
    const result = aiTokenizeSchema.safeParse({
      text: "a".repeat(100_001),
      model: "gpt-4o",
    });
    expect(result.success).toBe(false);
  });
});
