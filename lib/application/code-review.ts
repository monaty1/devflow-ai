import type {
  CodeReviewResult,
  SupportedLanguage,
  CodeIssue,
  CodeMetrics,
  IssueCategory,
} from "@/types/code-review";

interface Pattern {
  pattern: RegExp;
  severity: CodeIssue["severity"];
  category: IssueCategory;
  message: string;
  suggestion?: string;
}

const SECURITY_PATTERNS: Pattern[] = [
  {
    pattern: /\beval\s*\(/g,
    severity: "critical",
    category: "security",
    message: "Avoid using eval() - it can execute arbitrary code",
    suggestion: "Use JSON.parse() for JSON data or Function constructor for specific cases",
  },
  {
    pattern: /\.innerHTML\s*=/g,
    severity: "critical",
    category: "security",
    message: "innerHTML can lead to XSS vulnerabilities",
    suggestion: "Use textContent or sanitize HTML with DOMPurify",
  },
  {
    pattern: /\bdocument\.write\s*\(/g,
    severity: "critical",
    category: "security",
    message: "document.write() can cause security issues and performance problems",
    suggestion: "Use DOM manipulation methods instead",
  },
  {
    pattern: /(password|secret|api[_-]?key|token)\s*[:=]\s*["'`][^"'`]+["'`]/gi,
    severity: "critical",
    category: "security",
    message: "Hardcoded credentials detected - use environment variables",
    suggestion: "Move sensitive data to environment variables",
  },
  {
    pattern: /new\s+Function\s*\(/g,
    severity: "warning",
    category: "security",
    message: "Function constructor can execute arbitrary code",
    suggestion: "Avoid dynamic code execution when possible",
  },
];

const QUALITY_PATTERNS: Pattern[] = [
  {
    pattern: /console\.(log|debug|info|warn|error)\s*\(/g,
    severity: "warning",
    category: "best-practice",
    message: "Console statements should be removed in production",
    suggestion: "Use a proper logging library or remove debug statements",
  },
  {
    pattern: /==(?!=)/g,
    severity: "warning",
    category: "best-practice",
    message: "Use strict equality (===) instead of loose equality (==)",
    suggestion: "Replace == with === for type-safe comparisons",
  },
  {
    pattern: /!=(?!=)/g,
    severity: "warning",
    category: "best-practice",
    message: "Use strict inequality (!==) instead of loose inequality (!=)",
    suggestion: "Replace != with !== for type-safe comparisons",
  },
  {
    pattern: /var\s+\w+/g,
    severity: "info",
    category: "best-practice",
    message: "Use const or let instead of var",
    suggestion: "Replace var with const for immutable values or let for mutable ones",
  },
  {
    pattern: /catch\s*\([^)]*\)\s*\{\s*\}/g,
    severity: "critical",
    category: "maintainability",
    message: "Empty catch block - errors are being silently ignored",
    suggestion: "Handle the error or at least log it",
  },
  {
    pattern: /TODO|FIXME|HACK|XXX/gi,
    severity: "info",
    category: "maintainability",
    message: "TODO/FIXME comment found - consider addressing it",
  },
  {
    pattern: /function\s+\w+\s*\([^)]{100,}\)/g,
    severity: "warning",
    category: "maintainability",
    message: "Function has too many parameters",
    suggestion: "Consider using an options object instead",
  },
  {
    pattern: /if\s*\([^)]+\)\s*\{[^}]{500,}\}/gs,
    severity: "warning",
    category: "maintainability",
    message: "Long conditional block detected",
    suggestion: "Consider extracting into a separate function",
  },
];

function findLineNumber(code: string, index: number): number {
  return code.slice(0, index).split("\n").length;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Reserved for language-specific patterns
function detectIssues(code: string, _language: SupportedLanguage): CodeIssue[] {
  const issues: CodeIssue[] = [];
  const allPatterns = [...SECURITY_PATTERNS, ...QUALITY_PATTERNS];

  for (const patternDef of allPatterns) {
    const regex = new RegExp(patternDef.pattern.source, patternDef.pattern.flags);
    let match;

    while ((match = regex.exec(code)) !== null) {
      const issue: CodeIssue = {
        line: findLineNumber(code, match.index),
        severity: patternDef.severity,
        category: patternDef.category,
        message: patternDef.message,
      };
      if (patternDef.suggestion) {
        issue.suggestion = patternDef.suggestion;
      }
      issues.push(issue);
    }
  }

  return issues.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

function calculateMetrics(code: string): CodeMetrics {
  const lines = code.split("\n");
  const totalLines = lines.length;

  let commentLines = 0;
  let blankLines = 0;
  let codeLines = 0;
  let inMultilineComment = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "") {
      blankLines++;
      continue;
    }

    if (inMultilineComment) {
      commentLines++;
      if (trimmed.includes("*/")) {
        inMultilineComment = false;
      }
      continue;
    }

    if (trimmed.startsWith("/*")) {
      commentLines++;
      if (!trimmed.includes("*/")) {
        inMultilineComment = true;
      }
      continue;
    }

    if (trimmed.startsWith("//") || trimmed.startsWith("#")) {
      commentLines++;
      continue;
    }

    codeLines++;
  }

  // Simplified complexity calculation
  const branchKeywords = /\b(if|else|for|while|switch|case|catch|&&|\|\||\?)\b/g;
  const matches = code.match(branchKeywords);
  const complexity = 1 + (matches?.length ?? 0);

  // Maintainability Index (simplified)
  const avgLineLength = code.length / Math.max(totalLines, 1);
  const commentRatio = commentLines / Math.max(codeLines, 1);
  const maintainabilityIndex = Math.min(
    100,
    Math.max(
      0,
      100 - complexity * 2 - avgLineLength * 0.1 + commentRatio * 20
    )
  );

  return {
    totalLines,
    codeLines,
    commentLines,
    blankLines,
    complexity,
    maintainabilityIndex: Math.round(maintainabilityIndex),
  };
}

function generateSuggestions(issues: CodeIssue[], metrics: CodeMetrics): string[] {
  const suggestions: string[] = [];

  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  if (criticalCount > 0) {
    suggestions.push(
      `Address ${criticalCount} critical issue${criticalCount > 1 ? "s" : ""} immediately`
    );
  }

  if (warningCount > 3) {
    suggestions.push("Consider a code quality review session to address warnings");
  }

  if (metrics.complexity > 10) {
    suggestions.push("High cyclomatic complexity - consider breaking into smaller functions");
  }

  if (metrics.commentLines === 0 && metrics.codeLines > 20) {
    suggestions.push("Add comments to explain complex logic");
  }

  if (metrics.maintainabilityIndex < 50) {
    suggestions.push("Low maintainability score - consider refactoring");
  }

  const hasSecurityIssues = issues.some((i) => i.category === "security");
  if (hasSecurityIssues) {
    suggestions.push("Security vulnerabilities detected - prioritize fixing them");
  }

  if (suggestions.length === 0) {
    suggestions.push("Code looks good! Keep following best practices.");
  }

  return suggestions;
}

function calculateScore(issues: CodeIssue[], metrics: CodeMetrics): number {
  let score = 100;

  for (const issue of issues) {
    switch (issue.severity) {
      case "critical":
        score -= 15;
        break;
      case "warning":
        score -= 5;
        break;
      case "info":
        score -= 1;
        break;
    }
  }

  // Adjust for metrics
  if (metrics.complexity > 15) score -= 10;
  else if (metrics.complexity > 10) score -= 5;

  if (metrics.maintainabilityIndex < 40) score -= 10;
  else if (metrics.maintainabilityIndex < 60) score -= 5;

  return Math.max(0, Math.min(100, score));
}

export function reviewCode(
  code: string,
  language: SupportedLanguage
): CodeReviewResult {
  const trimmedCode = code.trim();
  const issues = detectIssues(trimmedCode, language);
  const metrics = calculateMetrics(trimmedCode);
  const suggestions = generateSuggestions(issues, metrics);
  const overallScore = calculateScore(issues, metrics);

  return {
    id: crypto.randomUUID(),
    code: trimmedCode,
    language,
    issues,
    metrics,
    suggestions,
    overallScore,
    reviewedAt: new Date().toISOString(),
  };
}
