import { describe, it, expect } from "vitest";
import {
  COMMIT_TYPES,
  EXAMPLE_COMMITS,
  generateCommitMessage,
  validateCommitMessage,
  parseCommitMessage,
  getCommitTypeInfo,
  suggestScope,
  analyzeDiff,
  generateChangelog,
} from "@/lib/application/git-commit-generator";
import { DEFAULT_COMMIT_CONFIG } from "@/types/git-commit-generator";
import type { CommitType, CommitResult } from "@/types/git-commit-generator";

describe("Git Commit Message Generator", () => {
  describe("COMMIT_TYPES", () => {
    it("should have all 11 commit types", () => {
      expect(COMMIT_TYPES).toHaveLength(11);
    });

    it("should have all required fields for each type", () => {
      COMMIT_TYPES.forEach((ct) => {
        expect(ct.type).toBeTruthy();
        expect(ct.label).toBeTruthy();
        expect(ct.description).toBeTruthy();
        expect(ct.emoji).toBeTruthy();
      });
    });

    it("should include core types", () => {
      const types = COMMIT_TYPES.map((ct) => ct.type);
      expect(types).toContain("feat");
      expect(types).toContain("fix");
      expect(types).toContain("docs");
      expect(types).toContain("refactor");
      expect(types).toContain("test");
    });

    it("should have unique type identifiers", () => {
      const types = COMMIT_TYPES.map((ct) => ct.type);
      const unique = new Set(types);
      expect(unique.size).toBe(types.length);
    });
  });

  describe("EXAMPLE_COMMITS", () => {
    it("should have examples for all 11 types", () => {
      const allTypes: CommitType[] = [
        "feat", "fix", "docs", "style", "refactor",
        "perf", "test", "chore", "ci", "build", "revert",
      ];
      allTypes.forEach((type) => {
        expect(EXAMPLE_COMMITS[type]).toBeTruthy();
      });
    });

    it("should have valid commit messages as examples", () => {
      Object.values(EXAMPLE_COMMITS).forEach((example) => {
        const validation = validateCommitMessage(example);
        expect(validation.isValid).toBe(true);
      });
    });

    it("each example should start with its type", () => {
      Object.entries(EXAMPLE_COMMITS).forEach(([type, example]) => {
        expect(example.startsWith(type)).toBe(true);
      });
    });
  });

  describe("generateCommitMessage", () => {
    it("should generate a simple commit message", () => {
      const config = { ...DEFAULT_COMMIT_CONFIG, type: "feat" as const, description: "add user login", useEmojis: false };
      const result = generateCommitMessage(config);
      expect(result.message).toBe("feat: add user login");
      expect(result.type).toBe("feat");
      expect(result.id).toBeTruthy();
      expect(result.timestamp).toBeTruthy();
    });

    it("should include scope when provided", () => {
      const config = {
        ...DEFAULT_COMMIT_CONFIG,
        type: "fix" as const,
        scope: "auth",
        description: "resolve token expiration",
        useEmojis: false,
      };
      const result = generateCommitMessage(config);
      expect(result.message).toBe("fix(auth): resolve token expiration");
    });

    it("should include body when provided", () => {
      const config = {
        ...DEFAULT_COMMIT_CONFIG,
        type: "feat" as const,
        description: "add OAuth2 support",
        body: "Implement Google and GitHub OAuth2 providers.\nIncludes token refresh logic.",
      };
      const result = generateCommitMessage(config);
      expect(result.message).toContain("feat: add OAuth2 support");
      expect(result.message).toContain("\n\nImplement Google and GitHub OAuth2 providers.");
    });

    it("should include breaking change in footer", () => {
      const config = {
        ...DEFAULT_COMMIT_CONFIG,
        type: "feat" as const,
        description: "change auth API",
        breakingChange: "removed password field from user endpoint",
      };
      const result = generateCommitMessage(config);
      expect(result.message).toContain("feat!: change auth API");
      expect(result.message).toContain("BREAKING CHANGE: removed password field from user endpoint");
    });

    it("should include issue references", () => {
      const config = {
        ...DEFAULT_COMMIT_CONFIG,
        type: "fix" as const,
        description: "resolve crash on login",
        issueRef: "#123, #456",
      };
      const result = generateCommitMessage(config);
      expect(result.message).toContain("Refs: #123, #456");
    });

    it("should normalize bare issue numbers", () => {
      const config = {
        ...DEFAULT_COMMIT_CONFIG,
        type: "fix" as const,
        description: "fix bug",
        issueRef: "123 456",
      };
      const result = generateCommitMessage(config);
      expect(result.message).toContain("#123");
      expect(result.message).toContain("#456");
    });

    it("should generate all commit types", () => {
      const types: CommitType[] = [
        "feat", "fix", "docs", "style", "refactor",
        "perf", "test", "chore", "ci", "build", "revert",
      ];

      types.forEach((type) => {
        const config = { ...DEFAULT_COMMIT_CONFIG, type, description: "some change", useEmojis: false };
        const result = generateCommitMessage(config);
        expect(result.message.startsWith(type)).toBe(true);
      });
    });

    it("should trim scope and description", () => {
      const config = {
        ...DEFAULT_COMMIT_CONFIG,
        type: "feat" as const,
        scope: "  auth  ",
        description: "  add login  ",
        useEmojis: false,
      };
      const result = generateCommitMessage(config);
      expect(result.message).toBe("feat(auth): add login");
    });

    it("should include both breaking change and issue refs", () => {
      const config = {
        ...DEFAULT_COMMIT_CONFIG,
        type: "feat" as const,
        description: "redesign API",
        breakingChange: "new response format",
        issueRef: "#100",
      };
      const result = generateCommitMessage(config);
      expect(result.message).toContain("BREAKING CHANGE: new response format");
      expect(result.message).toContain("Refs: #100");
    });

    it("should generate unique IDs", () => {
      const config = { ...DEFAULT_COMMIT_CONFIG, description: "test" };
      const r1 = generateCommitMessage(config);
      const r2 = generateCommitMessage(config);
      expect(r1.id).not.toBe(r2.id);
    });
  });

  describe("validateCommitMessage", () => {
    it("should validate a correct simple message", () => {
      const result = validateCommitMessage("feat: add login");
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate message with scope", () => {
      const result = validateCommitMessage("fix(auth): resolve bug");
      expect(result.isValid).toBe(true);
    });

    it("should validate message with breaking change marker", () => {
      const result = validateCommitMessage("feat!: change API");
      expect(result.isValid).toBe(true);
    });

    it("should invalidate empty message", () => {
      const result = validateCommitMessage("");
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should invalidate message without type", () => {
      const result = validateCommitMessage("add new feature");
      expect(result.isValid).toBe(false);
    });

    it("should invalidate message with unknown type", () => {
      const result = validateCommitMessage("feature: add login");
      expect(result.isValid).toBe(false);
    });

    it("should warn about long header", () => {
      const longDesc = "a".repeat(70);
      const result = validateCommitMessage(`feat: ${longDesc}`);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("72"))).toBe(true);
    });

    it("should warn about uppercase description", () => {
      const result = validateCommitMessage("feat: Add new feature");
      expect(result.errors.some((e) => e.includes("uppercase"))).toBe(true);
    });

    it("should warn about trailing period", () => {
      const result = validateCommitMessage("feat: add new feature.");
      expect(result.errors.some((e) => e.includes("period"))).toBe(true);
    });

    it("should validate multi-line message with blank separator", () => {
      const msg = "feat: add login\n\nImplements OAuth2 flow.";
      const result = validateCommitMessage(msg);
      expect(result.isValid).toBe(true);
    });

    it("should warn about missing blank line after header", () => {
      const msg = "feat: add login\nExtra line without blank separator";
      const result = validateCommitMessage(msg);
      expect(result.errors.some((e) => e.includes("Second line"))).toBe(true);
    });
  });

  describe("parseCommitMessage", () => {
    it("should parse a simple message", () => {
      const parsed = parseCommitMessage("feat: add login");
      expect(parsed).not.toBeNull();
      expect(parsed?.type).toBe("feat");
      expect(parsed?.description).toBe("add login");
      expect(parsed?.scope).toBe("");
    });

    it("should parse message with scope", () => {
      const parsed = parseCommitMessage("fix(auth): resolve bug");
      expect(parsed?.type).toBe("fix");
      expect(parsed?.scope).toBe("auth");
      expect(parsed?.description).toBe("resolve bug");
    });

    it("should parse message with body", () => {
      const msg = "feat: add login\n\nThis implements the login flow.\nMultiple lines in body.";
      const parsed = parseCommitMessage(msg);
      expect(parsed?.body).toContain("This implements the login flow.");
      expect(parsed?.body).toContain("Multiple lines in body.");
    });

    it("should parse breaking change marker", () => {
      const parsed = parseCommitMessage("feat!: new API\n\nBREAKING CHANGE: removed old endpoints");
      expect(parsed?.isBreaking).toBe(true);
      expect(parsed?.breakingChange).toBe("removed old endpoints");
    });

    it("should parse issue references in footer", () => {
      const msg = "fix: resolve bug\n\nRefs: #123, #456";
      const parsed = parseCommitMessage(msg);
      expect(parsed?.issueRefs).toContain("#123");
      expect(parsed?.issueRefs).toContain("#456");
    });

    it("should return null for empty input", () => {
      const parsed = parseCommitMessage("");
      expect(parsed).toBeNull();
    });

    it("should return null for malformed input", () => {
      const parsed = parseCommitMessage("just some random text");
      expect(parsed).toBeNull();
    });

    it("should parse header-only message", () => {
      const parsed = parseCommitMessage("docs: update readme");
      expect(parsed?.type).toBe("docs");
      expect(parsed?.description).toBe("update readme");
      expect(parsed?.body).toBe("");
    });

    it("should handle unknown type gracefully", () => {
      const parsed = parseCommitMessage("unknown: some change");
      expect(parsed).not.toBeNull();
      expect(parsed?.type).toBeNull();
    });

    it("should detect inline issue references", () => {
      const msg = "fix: resolve #42 crash";
      const parsed = parseCommitMessage(msg);
      expect(parsed?.issueRefs).toContain("#42");
    });
  });

  describe("getCommitTypeInfo", () => {
    it("should return info for feat", () => {
      const info = getCommitTypeInfo("feat");
      expect(info.type).toBe("feat");
      expect(info.label).toBeTruthy();
      expect(info.emoji).toBeTruthy();
    });

    it("should return info for all types", () => {
      const types: CommitType[] = [
        "feat", "fix", "docs", "style", "refactor",
        "perf", "test", "chore", "ci", "build", "revert",
      ];
      types.forEach((type) => {
        const info = getCommitTypeInfo(type);
        expect(info.type).toBe(type);
        expect(info.label).toBeTruthy();
      });
    });
  });

  describe("suggestScope", () => {
    it("should suggest auth for login-related descriptions", () => {
      const suggestions = suggestScope("fix login token expiration");
      expect(suggestions).toContain("auth");
    });

    it("should suggest api for endpoint-related descriptions", () => {
      const suggestions = suggestScope("add new REST endpoint for users");
      expect(suggestions).toContain("api");
    });

    it("should suggest ui for component-related descriptions", () => {
      const suggestions = suggestScope("update button style and modal layout");
      expect(suggestions).toContain("ui");
    });

    it("should suggest db for database-related descriptions", () => {
      const suggestions = suggestScope("add migration for user table");
      expect(suggestions).toContain("db");
    });

    it("should return empty array for empty input", () => {
      const suggestions = suggestScope("");
      expect(suggestions).toHaveLength(0);
    });

    it("should return max 5 suggestions", () => {
      // Description that matches many scopes
      const suggestions = suggestScope("login endpoint button database test deploy");
      expect(suggestions.length).toBeLessThanOrEqual(5);
    });

    it("should be case-insensitive", () => {
      const suggestions = suggestScope("Update DATABASE query");
      expect(suggestions).toContain("db");
    });

    it("should sort by relevance (more keyword matches first)", () => {
      const suggestions = suggestScope("login token session password");
      expect(suggestions[0]).toBe("auth");
    });
  });

  describe("analyzeDiff", () => {
    it("should extract file names from diff", () => {
      const diff = "diff --git a/src/app.ts b/src/app.ts\n+some code\n-old code";
      const result = analyzeDiff(diff);
      expect(result.filesChanged).toContain("src/app.ts");
    });

    it("should detect breaking changes", () => {
      const diff = "diff --git a/src/api.ts b/src/api.ts\n+BREAKING CHANGE: new API";
      const result = analyzeDiff(diff);
      expect(result.isBreaking).toBe(true);
    });

    it("should detect DEPRECATED as breaking", () => {
      const diff = "diff --git a/src/api.ts b/src/api.ts\n+DEPRECATED: old method";
      const result = analyzeDiff(diff);
      expect(result.isBreaking).toBe(true);
    });

    it("should suggest test type when only test files changed", () => {
      const diff = "diff --git a/tests/unit/app.test.ts b/tests/unit/app.test.ts\n+new test";
      const result = analyzeDiff(diff);
      expect(result.suggestedType).toBe("test");
    });

    it("should suggest docs type when only markdown files changed", () => {
      const diff = "diff --git a/README.md b/README.md\n+updated docs";
      const result = analyzeDiff(diff);
      expect(result.suggestedType).toBe("docs");
    });

    it("should suggest chore type when package.json changed", () => {
      const diff = "diff --git a/package.json b/package.json\n+new dep";
      const result = analyzeDiff(diff);
      expect(result.suggestedType).toBe("chore");
    });

    it("should suggest fix type when fix-related files changed", () => {
      const diff = "diff --git a/src/bugfix/resolver.ts b/src/bugfix/resolver.ts\n+fix code";
      const result = analyzeDiff(diff);
      expect(result.suggestedType).toBe("fix");
    });

    it("should suggest scope from first file directory", () => {
      const diff = "diff --git a/components/button.tsx b/components/button.tsx\n+change";
      const result = analyzeDiff(diff);
      expect(result.suggestedScope).toBe("components");
    });

    it("should default to feat for generic source files", () => {
      const diff = "diff --git a/src/feature/new.ts b/src/feature/new.ts\n+new feature";
      const result = analyzeDiff(diff);
      expect(result.suggestedType).toBe("feat");
    });

    it("should return empty scope when file has no directory", () => {
      const diff = "some random diff without file headers";
      const result = analyzeDiff(diff);
      expect(result.suggestedScope).toBe("");
      expect(result.filesChanged).toHaveLength(0);
    });

    it("should handle multiple files in diff", () => {
      const diff = [
        "diff --git a/src/a.ts b/src/a.ts",
        "+code",
        "diff --git a/src/b.ts b/src/b.ts",
        "+code",
      ].join("\n");
      const result = analyzeDiff(diff);
      expect(result.filesChanged).toHaveLength(2);
    });

    it("should detect test files with .spec. extension", () => {
      const diff = "diff --git a/test/app.spec.ts b/test/app.spec.ts\n+test";
      const result = analyzeDiff(diff);
      expect(result.suggestedType).toBe("test");
    });

    it("should detect docs in docs/ directory", () => {
      const diff = "diff --git a/docs/guide.md b/docs/guide.md\n+content";
      const result = analyzeDiff(diff);
      expect(result.suggestedType).toBe("docs");
    });
  });

  describe("generateChangelog", () => {
    it("should return empty string for no commits", () => {
      expect(generateChangelog([])).toBe("");
    });

    it("should generate changelog with feat section", () => {
      const commits: CommitResult[] = [{
        id: "1",
        message: "feat(ui): add button",
        type: "feat",
        scope: "ui",
        description: "add button",
        body: "",
        breakingChange: "",
        issueRef: "",
        timestamp: new Date().toISOString(),
      }];
      const result = generateChangelog(commits);
      expect(result).toContain("Features");
      expect(result).toContain("ui");
      expect(result).toContain("add button");
    });

    it("should generate changelog with fix section", () => {
      const commits: CommitResult[] = [{
        id: "2",
        message: "fix(api): resolve crash",
        type: "fix",
        scope: "api",
        description: "resolve crash",
        body: "",
        breakingChange: "",
        issueRef: "#42",
        timestamp: new Date().toISOString(),
      }];
      const result = generateChangelog(commits);
      expect(result).toContain("Bug Fixes");
      expect(result).toContain("#42");
    });

    it("should use 'general' scope when scope is empty", () => {
      const commits: CommitResult[] = [{
        id: "3",
        message: "feat: add feature",
        type: "feat",
        scope: "",
        description: "add feature",
        body: "",
        breakingChange: "",
        issueRef: "",
        timestamp: new Date().toISOString(),
      }];
      const result = generateChangelog(commits);
      expect(result).toContain("general");
    });

    it("should place unknown types in other section", () => {
      const commits: CommitResult[] = [{
        id: "4",
        message: "ci: update pipeline",
        type: "ci",
        scope: "github",
        description: "update pipeline",
        body: "",
        breakingChange: "",
        issueRef: "",
        timestamp: new Date().toISOString(),
      }];
      const result = generateChangelog(commits);
      expect(result).toContain("Other Changes");
    });

    it("should handle multiple commits in multiple sections", () => {
      const commits: CommitResult[] = [
        {
          id: "5", message: "feat: a", type: "feat", scope: "x",
          description: "a", body: "", breakingChange: "", issueRef: "",
          timestamp: new Date().toISOString(),
        },
        {
          id: "6", message: "fix: b", type: "fix", scope: "y",
          description: "b", body: "", breakingChange: "", issueRef: "",
          timestamp: new Date().toISOString(),
        },
        {
          id: "7", message: "perf: c", type: "perf", scope: "z",
          description: "c", body: "", breakingChange: "", issueRef: "",
          timestamp: new Date().toISOString(),
        },
      ];
      const result = generateChangelog(commits);
      expect(result).toContain("Features");
      expect(result).toContain("Bug Fixes");
      expect(result).toContain("Performance");
    });
  });

  describe("generateCommitMessage - emoji mode", () => {
    it("should include emoji when useEmojis is true", () => {
      const config = {
        ...DEFAULT_COMMIT_CONFIG,
        type: "feat" as const,
        description: "add feature",
        useEmojis: true,
      };
      const result = generateCommitMessage(config);
      expect(result.message).toContain("\u2728"); // sparkles emoji
    });

    it("should not include emoji when useEmojis is false", () => {
      const config = {
        ...DEFAULT_COMMIT_CONFIG,
        type: "feat" as const,
        description: "add feature",
        useEmojis: false,
      };
      const result = generateCommitMessage(config);
      expect(result.message.startsWith("feat:")).toBe(true);
    });
  });

  describe("validateCommitMessage - requireIssue", () => {
    it("should fail when requireIssue is true and no issue is provided", () => {
      const config = {
        ...DEFAULT_COMMIT_CONFIG,
        type: "feat" as const,
        description: "add feature",
        requireIssue: true,
        issueRef: "",
      };
      const result = validateCommitMessage("feat: add feature", config);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes("Issue Reference"))).toBe(true);
    });

    it("should pass when requireIssue is true and issue is provided", () => {
      const config = {
        ...DEFAULT_COMMIT_CONFIG,
        type: "feat" as const,
        description: "add feature",
        requireIssue: true,
        issueRef: "#123",
      };
      const result = validateCommitMessage("feat: add feature", config);
      expect(result.isValid).toBe(true);
    });

    it("should detect empty description after colon", () => {
      const result = validateCommitMessage("feat: ");
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes("Description is empty"))).toBe(true);
    });
  });

  describe("parseCommitMessage - additional branches", () => {
    it("should parse breaking change from footer without ! mark", () => {
      const msg = "feat: change api\n\nBREAKING CHANGE: removed old endpoints";
      const parsed = parseCommitMessage(msg);
      expect(parsed?.isBreaking).toBe(true);
      expect(parsed?.breakingChange).toBe("removed old endpoints");
    });

    it("should set breakingChange to 'Yes' when ! mark but no footer detail", () => {
      const parsed = parseCommitMessage("feat!: new api");
      expect(parsed?.isBreaking).toBe(true);
      expect(parsed?.breakingChange).toBe("Yes");
    });

    it("should parse footer with generic key-value format", () => {
      const msg = "feat: add feature\n\nSigned-off-by: Author";
      const parsed = parseCommitMessage(msg);
      // Signed-off-by matches /^[\w-]+:\s/ so it goes to footer
      expect(parsed?.body).toBe("");
    });

    it("should handle body lines before footer", () => {
      const msg = "feat: feature\n\nThis is the body.\nMore body.\n\nRefs: #99";
      const parsed = parseCommitMessage(msg);
      expect(parsed?.body).toContain("This is the body.");
      expect(parsed?.body).toContain("More body.");
      expect(parsed?.issueRefs).toContain("#99");
    });

    it("should parse Refs line with multiple refs", () => {
      const msg = "fix: bug\n\nRefs: #1, #2, #3";
      const parsed = parseCommitMessage(msg);
      expect(parsed?.issueRefs).toContain("#1");
      expect(parsed?.issueRefs).toContain("#2");
      expect(parsed?.issueRefs).toContain("#3");
    });

    it("should not duplicate inline refs that are also in Refs footer", () => {
      const msg = "fix: resolve #42\n\nRefs: #42";
      const parsed = parseCommitMessage(msg);
      const count42 = parsed?.issueRefs.filter(r => r === "#42").length;
      expect(count42).toBe(1);
    });

    it("should parse body without blank separator line", () => {
      const msg = "feat: feature\nbody line here";
      const parsed = parseCommitMessage(msg);
      expect(parsed?.body).toContain("body line here");
    });
  });
});
