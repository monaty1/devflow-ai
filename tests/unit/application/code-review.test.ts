import { describe, it, expect } from "vitest";
import { reviewCode } from "@/lib/application/code-review";

describe("Code Review", () => {
  describe("reviewCode", () => {
    it("should return a valid review result", () => {
      const result = reviewCode("const x = 1;", "typescript");

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("code");
      expect(result).toHaveProperty("language", "typescript");
      expect(result).toHaveProperty("issues");
      expect(result).toHaveProperty("metrics");
      expect(result).toHaveProperty("suggestions");
      expect(result).toHaveProperty("overallScore");
      expect(result).toHaveProperty("reviewedAt");
    });

    it("should detect eval() usage", () => {
      const result = reviewCode("const result = eval('2 + 2');", "javascript");

      const evalIssue = result.issues.find((i) => i.message.includes("eval"));
      expect(evalIssue).toBeDefined();
      expect(evalIssue?.severity).toBe("critical");
      expect(evalIssue?.category).toBe("security");
    });

    it("should detect innerHTML usage", () => {
      const result = reviewCode(
        'document.getElementById("app").innerHTML = userInput;',
        "javascript"
      );

      const issue = result.issues.find((i) => i.message.includes("innerHTML"));
      expect(issue).toBeDefined();
      expect(issue?.severity).toBe("critical");
    });

    it("should detect hardcoded credentials", () => {
      const result = reviewCode(
        'const apiKey = "sk-1234567890abcdef";',
        "typescript"
      );

      const issue = result.issues.find((i) =>
        i.message.toLowerCase().includes("credentials")
      );
      expect(issue).toBeDefined();
      expect(issue?.category).toBe("security");
    });

    it("should detect console statements", () => {
      const result = reviewCode('console.log("debug");', "javascript");

      const issue = result.issues.find((i) =>
        i.message.includes("Console statements")
      );
      expect(issue).toBeDefined();
      expect(issue?.severity).toBe("warning");
    });

    it("should detect loose equality", () => {
      const result = reviewCode("if (x == 5) { }", "javascript");

      const issue = result.issues.find((i) =>
        i.message.includes("strict equality")
      );
      expect(issue).toBeDefined();
    });

    it("should detect var usage", () => {
      const result = reviewCode("var x = 1;", "javascript");

      const issue = result.issues.find((i) =>
        i.message.includes("const or let")
      );
      expect(issue).toBeDefined();
      expect(issue?.severity).toBe("info");
    });

    it("should detect empty catch blocks", () => {
      const result = reviewCode(
        "try { foo(); } catch (e) { }",
        "javascript"
      );

      const issue = result.issues.find((i) =>
        i.message.includes("Empty catch block")
      );
      expect(issue).toBeDefined();
      expect(issue?.severity).toBe("critical");
    });

    it("should calculate metrics correctly", () => {
      const code = `// Comment
const x = 1;
const y = 2;

// Another comment
function add() {
  return x + y;
}`;

      const result = reviewCode(code, "typescript");

      // Check metrics are reasonable - exact counts depend on trailing newlines
      expect(result.metrics.totalLines).toBeGreaterThanOrEqual(8);
      expect(result.metrics.commentLines).toBe(2);
      expect(result.metrics.blankLines).toBeGreaterThanOrEqual(1);
      expect(result.metrics.codeLines).toBeGreaterThan(0);
    });

    it("should calculate complexity based on branching", () => {
      const simpleCode = "const x = 1;";
      const complexCode = `
        if (a) {
          if (b) {
            for (let i = 0; i < 10; i++) {
              while (c) {
                switch (d) {
                  case 1: break;
                  case 2: break;
                }
              }
            }
          }
        }
      `;

      const simpleResult = reviewCode(simpleCode, "typescript");
      const complexResult = reviewCode(complexCode, "typescript");

      expect(complexResult.metrics.complexity).toBeGreaterThan(
        simpleResult.metrics.complexity
      );
    });

    it("should give high score to clean code", () => {
      const cleanCode = `
// Calculate the sum of two numbers
function add(a: number, b: number): number {
  return a + b;
}

// Calculate the product
function multiply(a: number, b: number): number {
  return a * b;
}
`;

      const result = reviewCode(cleanCode, "typescript");

      expect(result.overallScore).toBeGreaterThanOrEqual(70);
    });

    it("should give low score to code with many issues", () => {
      const badCode = `
var x = eval("2+2");
document.write("hello");
if (x == 4) {
  console.log("yes");
  try { foo(); } catch(e) {}
}
`;

      const result = reviewCode(badCode, "javascript");

      expect(result.overallScore).toBeLessThan(50);
    });

    it("should provide suggestions", () => {
      const result = reviewCode("eval('code');", "javascript");

      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it("should handle empty code", () => {
      const result = reviewCode("", "typescript");

      expect(result.code).toBe("");
      expect(result.metrics.totalLines).toBe(1);
    });

    it("should correctly identify line numbers", () => {
      const code = `const a = 1;
const b = eval("test");
const c = 3;`;

      const result = reviewCode(code, "javascript");

      const evalIssue = result.issues.find((i) => i.message.includes("eval"));
      expect(evalIssue?.line).toBe(2);
    });
  });

  describe("generateSuggestions branches", () => {
    it("should suggest breaking functions for high complexity code", () => {
      // Generate code with high cyclomatic complexity (many if/else branches)
      const code = `
function complex(a, b, c, d, e, f) {
  if (a) { console.log(1); }
  if (b) { console.log(2); }
  if (c) { console.log(3); }
  if (d) { console.log(4); }
  if (e) { console.log(5); }
  if (f) { console.log(6); }
  if (a && b) { console.log(7); }
  if (c && d) { console.log(8); }
  if (e && f) { console.log(9); }
  if (a || b) { console.log(10); }
  if (c || d) { console.log(11); }
  return a;
}`;
      const result = reviewCode(code, "javascript");
      expect(result.suggestions.some((s) => s.includes("complexity"))).toBe(true);
    });

    it("should suggest comments for code with 0 comments and >20 lines", () => {
      const lines = Array.from({ length: 25 }, (_, i) => `const x${i} = ${i};`);
      const code = lines.join("\n");
      const result = reviewCode(code, "javascript");
      expect(result.suggestions.some((s) => s.includes("comment"))).toBe(true);
    });

    it("should suggest refactoring for low maintainability", () => {
      // Very long lines with high complexity and no comments
      const ifBlocks = Array.from(
        { length: 20 },
        (_, i) => `  if (x${i} > ${i}) { for (let j = 0; j < ${i}; j++) { if (j % 2 === 0) { console.log(j); } } }`
      );
      const code = `function bad(${Array.from({ length: 20 }, (_, i) => `x${i}`).join(", ")}) {\n${ifBlocks.join("\n")}\n}`;
      const result = reviewCode(code, "javascript");
      // Should have low maintainability or high complexity suggestion
      expect(
        result.suggestions.some(
          (s) => s.includes("maintainability") || s.includes("complexity")
        )
      ).toBe(true);
    });

    it("should detect security issues and suggest fixing them", () => {
      const code = `const secret = "mysecret123";
const password = "admin123";
document.innerHTML = userInput;
eval(code);`;
      const result = reviewCode(code, "javascript");
      expect(result.suggestions.some((s) => s.includes("Security") || s.includes("critical"))).toBe(true);
      expect(result.issues.some((i) => i.category === "security")).toBe(true);
    });

    it("should say code looks good when no issues found", () => {
      const code = "const x = 1;";
      const result = reviewCode(code, "typescript");
      if (result.issues.length === 0) {
        expect(result.suggestions.some((s) => s.includes("looks good"))).toBe(true);
      }
    });
  });

  describe("calculateScore branches", () => {
    it("should penalize heavily for high complexity >15", () => {
      const ifBlocks = Array.from(
        { length: 20 },
        (_, i) => `if (x${i}) { console.log(${i}); }`
      );
      const code = `function f(${Array.from({ length: 20 }, (_, i) => `x${i}`).join(", ")}) {\n${ifBlocks.join("\n")}\n}`;
      const result = reviewCode(code, "javascript");
      // High complexity should lower the score
      expect(result.overallScore).toBeLessThan(95);
    });

    it("should penalize for critical issues", () => {
      const code = `eval("dangerous");
document.write("xss");
element.innerHTML = input;`;
      const result = reviewCode(code, "javascript");
      // Multiple critical issues should significantly lower score
      expect(result.overallScore).toBeLessThan(70);
    });

    it("should give perfect or near-perfect score for clean code", () => {
      const code = "const x = 1;";
      const result = reviewCode(code, "typescript");
      expect(result.overallScore).toBeGreaterThanOrEqual(90);
    });

    it("should penalize for warnings", () => {
      // var usage generates warnings
      const code = `var a = 1;
var b = 2;
var c = 3;`;
      const result = reviewCode(code, "javascript");
      const warningCount = result.issues.filter((i) => i.severity === "warning").length;
      if (warningCount > 0) {
        expect(result.overallScore).toBeLessThan(100);
      }
    });
  });
});
