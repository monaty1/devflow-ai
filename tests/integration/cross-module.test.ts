import { describe, it, expect } from "vitest";

// JSON + DTO pipeline
import {
  validateJson,
  formatJson,
  minifyJson,
  jsonToTypeScript,
  extractJsonPaths,
  calculateJsonStats,
  sortObjectKeys,
  compareJson,
} from "@/lib/application/json-formatter";
import { generateCode, isValidJson } from "@/lib/application/dto-matic";

// Base64
import {
  encodeBase64,
  decodeBase64,
  validateBase64,
  processBase64,
} from "@/lib/application/base64";

// Code quality chain
import { reviewCode } from "@/lib/application/code-review";
import { tokenizeText, createVisualization } from "@/lib/application/token-visualizer";
import { analyzePrompt } from "@/lib/application/prompt-analyzer";

// UUID
import { generateUuid, validateUuid, formatUuid } from "@/lib/application/uuid-generator";

// Variable naming + Git commit
import { convertToAll, detectConvention } from "@/lib/application/variable-name-wizard";
import {
  generateCommitMessage,
  validateCommitMessage,
  parseCommitMessage,
} from "@/lib/application/git-commit-generator";

// Cron
import {
  parseExpression,
  buildExpression,
  validateExpression,
  explainExpression,
} from "@/lib/application/cron-builder";

// Regex
import { generateRegex, testRegex, explainRegex, isValidRegex } from "@/lib/application/regex-humanizer";

describe("Cross-Module Integration Tests", () => {
  describe("JSON → DTO → TypeScript pipeline", () => {
    const sampleJson = '{"user":{"name":"Alice","age":30,"emails":["a@b.com"]}}';

    it("should validate, format, then generate TypeScript types", () => {
      const validation = validateJson(sampleJson);
      expect(validation.isValid).toBe(true);

      const formatted = formatJson(sampleJson);
      expect(formatted).toContain('"user"');

      const tsTypes = jsonToTypeScript(formatted, "UserResponse");
      expect(tsTypes).toContain("interface");
      expect(tsTypes).toContain("name");
      expect(tsTypes).toContain("string");
    });

    it("should validate, format, then generate DTO code", () => {
      const validation = validateJson(sampleJson);
      expect(validation.isValid).toBe(true);

      const result = generateCode(sampleJson, {
        mode: "quick",
        targetLanguage: "typescript",
        rootName: "User",
        naming: "PascalCase",
        optionalFields: false,
        detectDates: false,
        detectSemanticTypes: false,
        exportTypes: true,
        readonlyEntities: false,
        generateMappers: false,
        generateZod: false,
      });

      expect(result.files.length).toBeGreaterThan(0);
      expect(result.files[0]!.content).toContain("User");
    });

    it("should minify → validate with dto-matic → extract paths", () => {
      const minified = minifyJson(formatJson(sampleJson));
      expect(isValidJson(minified)).toBe(true);

      const paths = extractJsonPaths(minified);
      expect(paths.length).toBeGreaterThan(0);

      const stats = calculateJsonStats(minified);
      expect(stats.keys).toBeGreaterThanOrEqual(3);
    });

    it("should sort keys then compare with original", () => {
      const parsed = JSON.parse(sampleJson) as unknown;
      const sorted = sortObjectKeys(parsed);
      const sortedStr = JSON.stringify(sorted);
      const originalStr = JSON.stringify(parsed);

      expect(compareJson(sortedStr, originalStr)).toBe(true);
    });
  });

  describe("Base64 roundtrip with JSON payloads", () => {
    it("should encode JSON → decode → validate JSON integrity", () => {
      const original = '{"token":"abc123","role":"admin"}';
      const encoded = encodeBase64(original);
      const decoded = decodeBase64(encoded);

      expect(decoded).toBe(original);

      const validation = validateJson(decoded);
      expect(validation.isValid).toBe(true);
    });

    it("should encode → validate base64 → decode → compare JSON", () => {
      const json1 = '{"a":1,"b":2}';
      const encoded = encodeBase64(json1);

      const b64Validation = validateBase64(encoded);
      expect(b64Validation.isValid).toBe(true);

      const decoded = decodeBase64(encoded);
      expect(compareJson(decoded, json1)).toBe(true);
    });

    it("should processBase64 encode then decode back to original", () => {
      const input = "Hello DevFlowAI Integration Test!";
      const encodeResult = processBase64(input, "encode");
      expect(encodeResult.output.length).toBeGreaterThan(0);

      const decodeResult = processBase64(encodeResult.output, "decode");
      expect(decodeResult.output).toBe(input);
    });
  });

  describe("Code review → Token visualization pipeline", () => {
    const tsCode = `function greet(name: string): string {
  if (name === "") {
    return "Hello, World!";
  }
  return "Hello, " + name + "!";
}`;

    it("should review code then tokenize the review suggestions", () => {
      const review = reviewCode(tsCode, "typescript");
      expect(review.issues).toBeDefined();
      expect(review.suggestions).toBeDefined();
      expect(review.overallScore).toBeGreaterThanOrEqual(0);

      const suggestionsText = review.suggestions.join(". ");
      const tokens = tokenizeText(suggestionsText, "openai");
      expect(tokens.length).toBeGreaterThan(0);
    });

    it("should create visualization from code and measure token cost", () => {
      const viz = createVisualization(tsCode, "openai");
      expect(viz.segments.length).toBeGreaterThan(0);
      expect(viz.totalTokens).toBeGreaterThan(0);
    });
  });

  describe("Prompt analysis → Token cost estimation", () => {
    it("should analyze a prompt and then visualize its token usage", () => {
      const prompt =
        "You are an expert TypeScript developer. Review this code for bugs and suggest improvements. Be concise.";
      const analysis = analyzePrompt(prompt);

      expect(analysis.tokenCount).toBeGreaterThan(0);
      expect(analysis.score).toBeGreaterThanOrEqual(0);

      const viz = createVisualization(prompt);
      expect(viz.totalTokens).toBeGreaterThan(0);
    });
  });

  describe("UUID → JSON → TypeScript type generation", () => {
    it("should generate UUIDs, wrap in JSON, then produce TypeScript types", () => {
      const uuid1 = generateUuid("v4");
      const uuid2 = generateUuid("v4");

      expect(validateUuid(uuid1).isValid).toBe(true);
      expect(validateUuid(uuid2).isValid).toBe(true);

      const json = JSON.stringify({ id: uuid1, correlationId: uuid2, timestamp: Date.now() });
      const validation = validateJson(json);
      expect(validation.isValid).toBe(true);

      const tsTypes = jsonToTypeScript(json, "TraceEvent");
      expect(tsTypes).toContain("id");
      expect(tsTypes).toContain("correlationId");
    });

    it("should format UUID then embed in JSON and extract paths", () => {
      const uuid = generateUuid("v4");
      const upper = formatUuid(uuid, "uppercase");
      const json = JSON.stringify({ recordId: upper });

      const paths = extractJsonPaths(json);
      expect(paths.some((p) => p.path.includes("recordId"))).toBe(true);
    });
  });

  describe("Variable naming → Git commit message pipeline", () => {
    it("should convert variable name then use convention in commit scope", () => {
      const result = convertToAll("userProfileSettings");
      expect(result.conversions.camelCase).toBe("userProfileSettings");
      expect(result.conversions.snake_case).toBe("user_profile_settings");
      expect(result.conversions["kebab-case"]).toBe("user-profile-settings");

      const convention = detectConvention("userProfileSettings");
      expect(convention).toBe("camelCase");

      const commit = generateCommitMessage({
        type: "feat",
        scope: result.conversions["kebab-case"],
        description: "add profile settings page",
        body: "",
        breakingChange: "",
        issueRef: "",
        useEmojis: false,
        requireIssue: false,
      });

      expect(commit.message).toContain("feat");
      expect(commit.message).toContain("user-profile-settings");

      const validation = validateCommitMessage(commit.message);
      expect(validation.isValid).toBe(true);
    });

    it("should generate a commit, parse it, and validate roundtrip", () => {
      const commit = generateCommitMessage({
        type: "fix",
        scope: "auth",
        description: "resolve token expiry race condition",
        body: "",
        breakingChange: "",
        useEmojis: false,
        requireIssue: false,
        issueRef: "",
      });

      const parsed = parseCommitMessage(commit.message);
      expect(parsed).not.toBeNull();
      expect(parsed!.type).toBe("fix");
      expect(parsed!.scope).toBe("auth");
    });
  });

  describe("Cron expression roundtrip", () => {
    it("should parse → build → validate → explain a cron expression", () => {
      const original = "0 9 * * 1-5";
      const parsed = parseExpression(original);
      const rebuilt = buildExpression(parsed);

      const validation = validateExpression(rebuilt);
      expect(validation.isValid).toBe(true);

      const explanation = explainExpression(rebuilt);
      expect(explanation.humanReadable.length).toBeGreaterThan(0);
    });

    it("should handle complex cron and maintain consistency", () => {
      const complex = "*/15 8-17 * * 1,3,5";
      const validation = validateExpression(complex);
      expect(validation.isValid).toBe(true);

      const parsed = parseExpression(complex);
      const rebuilt = buildExpression(parsed);
      const revalidation = validateExpression(rebuilt);
      expect(revalidation.isValid).toBe(true);
    });
  });

  describe("Regex generate → test → explain pipeline", () => {
    it("should generate a regex from description, test it, then explain it", () => {
      const pattern = generateRegex("email address");
      expect(isValidRegex(pattern)).toBe(true);

      const testResult = testRegex(pattern, "user@example.com");
      expect(testResult.matches).toBe(true);

      const analysis = explainRegex(pattern);
      expect(analysis.explanation.length).toBeGreaterThan(0);
    });

    it("should explain a regex then test it against sample input", () => {
      const pattern = "\\d{3}-\\d{4}";
      const analysis = explainRegex(pattern);
      expect(analysis.explanation.length).toBeGreaterThan(0);

      const testResult = testRegex(pattern, "Call 555-1234 or 888-9999");
      expect(testResult.allMatches.length).toBe(2);
    });
  });

  describe("Multi-tool data transformation", () => {
    it("should JSON format → Base64 encode → decode → validate JSON", () => {
      const data = { tools: ["json", "base64", "uuid"], count: 3 };
      const formatted = formatJson(JSON.stringify(data));
      const encoded = encodeBase64(formatted);
      const decoded = decodeBase64(encoded);
      const validation = validateJson(decoded);

      expect(validation.isValid).toBe(true);
      expect(compareJson(decoded, JSON.stringify(data))).toBe(true);
    });

    it("should generate UUID → encode as base64 → decode → validate UUID", () => {
      const uuid = generateUuid("v4");
      const encoded = encodeBase64(uuid);
      const decoded = decodeBase64(encoded);

      expect(validateUuid(decoded).isValid).toBe(true);
      expect(decoded).toBe(uuid);
    });
  });
});
