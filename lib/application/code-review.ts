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

const COMMON_PATTERNS: Pattern[] = [
  {
    pattern: /(password|secret|api[_-]?key|token)\s*[:=]\s*["'`][^"'`]+["'`]/gi,
    severity: "critical",
    category: "security",
    message: "Hardcoded credentials detected",
    suggestion: "Use environment variables or a secret manager",
  },
  {
    pattern: /TODO|FIXME|HACK/gi,
    severity: "info",
    category: "maintainability",
    message: "Technical debt marker found",
  }
];

const LANGUAGE_PATTERNS: Record<SupportedLanguage, Pattern[]> = {
  javascript: [
    { pattern: /\beval\s*\(/g, severity: "critical", category: "security", message: "Avoid eval()", suggestion: "Use JSON.parse()" },
    { pattern: /==(?!=)/g, severity: "warning", category: "best-practice", message: "Use strict equality (===)", suggestion: "Replace == with ===" },
    { pattern: /var\s+\w+/g, severity: "info", category: "best-practice", message: "Avoid var", suggestion: "Use const or let" }
  ],
  typescript: [
    { pattern: /:\s*any\b/g, severity: "warning", category: "best-practice", message: "Avoid 'any' type", suggestion: "Use a more specific type or 'unknown'" },
    { pattern: /\beval\s*\(/g, severity: "critical", category: "security", message: "Avoid eval()", suggestion: "Use JSON.parse()" },
    { pattern: /@ts-ignore/g, severity: "warning", category: "maintainability", message: "Avoid ts-ignore", suggestion: "Fix the type error or use @ts-expect-error" }
  ],
  python: [
    { pattern: /\beval\s*\(/g, severity: "critical", category: "security", message: "Avoid eval()", suggestion: "Use ast.literal_eval()" },
    { pattern: /\bos\.system\s*\(/g, severity: "critical", category: "security", message: "Insecure command execution", suggestion: "Use subprocess.run() with shell=False" },
    { pattern: /except:\s*$/gm, severity: "critical", category: "best-practice", message: "Bare except block", suggestion: "Catch specific exceptions" }
  ],
  java: [
    { pattern: /\.printStackTrace\(\)/g, severity: "warning", category: "best-practice", message: "Avoid printStackTrace()", suggestion: "Use a proper logger (SLF4J, Log4j2)" },
    { pattern: /System\.out\.print/g, severity: "warning", category: "best-practice", message: "Avoid System.out.println", suggestion: "Use a logger" },
    { pattern: /catch\s*\(Exception\s+e\)/g, severity: "warning", category: "best-practice", message: "Catching generic Exception", suggestion: "Catch specific checked exceptions" },
    { pattern: /new\s+Thread\s*\(/g, severity: "info", category: "performance", message: "Manual thread creation", suggestion: "Use an ExecutorService" }
  ],
  php: [
    { pattern: /\b(eval|exec|system|passthru|shell_exec)\s*\(/g, severity: "critical", category: "security", message: "Dangerous function execution", suggestion: "Avoid these functions as they are prone to injection" },
    { pattern: /\$_GET| \$_POST| \$_REQUEST/g, severity: "warning", category: "security", message: "Direct superglobal access", suggestion: "Use filter_input() or a framework request object" },
    { pattern: /mysql_query\s*\(/g, severity: "critical", category: "security", message: "Deprecated MySQL extension", suggestion: "Use PDO or MySQLi with prepared statements" },
    { pattern: /@\w+\s*\(/g, severity: "warning", category: "best-practice", message: "Error suppression operator used (@)", suggestion: "Handle errors properly instead of suppressing them" }
  ],
  csharp: [
    { pattern: /\bpublic\s+\w+\s+\w+;/g, severity: "warning", category: "best-practice", message: "Public field detected", suggestion: "Use properties with { get; set; } instead" },
    { pattern: /catch\s*\{\s*\}/g, severity: "critical", category: "maintainability", message: "Empty catch block", suggestion: "Log or handle the exception" },
    { pattern: /\.Result\b|\.Wait\(\)/g, severity: "warning", category: "performance", message: "Sync-over-async detected", suggestion: "Use await instead" }
  ],
  go: [
    { pattern: /panic\s*\(/g, severity: "warning", category: "best-practice", message: "Use of panic()", suggestion: "Return an error instead of panicking" },
    { pattern: /if\s+err\s*!=\s*nil\s*{\s*}/g, severity: "critical", category: "maintainability", message: "Empty error check", suggestion: "Handle or return the error" }
  ],
  rust: [
    { pattern: /\.unwrap\(\)/g, severity: "warning", category: "best-practice", message: "Potential panic with .unwrap()", suggestion: "Use .expect() or handle the Option/Result" },
    { pattern: /\bunsafe\b/g, severity: "info", category: "security", message: "Unsafe block detected", suggestion: "Ensure safety invariants are upheld" }
  ]
};

function findLineNumber(code: string, index: number): number {
  return code.slice(0, index).split("\n").length;
}

export function detectIssues(code: string, language: SupportedLanguage): CodeIssue[] {
  const issues: CodeIssue[] = [];
  const patterns = [...COMMON_PATTERNS, ...(LANGUAGE_PATTERNS[language] ?? [])];

  for (const patternDef of patterns) {
    const regex = new RegExp(patternDef.pattern.source, patternDef.pattern.flags);
    let match;

    while ((match = regex.exec(code)) !== null) {
      issues.push({
        line: findLineNumber(code, match.index),
        severity: patternDef.severity,
        category: patternDef.category,
        message: patternDef.message,
        suggestion: patternDef.suggestion,
      });
    }
  }

  return issues.sort((a, b) => a.line - b.line);
}

export function calculateMetrics(code: string): CodeMetrics {
  const lines = code.split("\n");
  const complexityKeywords = /\b(if|for|while|case|&&|\|\||catch|map|filter|reduce)\b/g;
  const complexity = 1 + (code.match(complexityKeywords)?.length ?? 0);
  
  const codeLines = lines.filter(l => l.trim() && !l.trim().startsWith("//") && !l.trim().startsWith("#")).length;
  const commentLines = lines.length - codeLines - lines.filter(l => !l.trim()).length;

  return {
    totalLines: lines.length,
    codeLines,
    commentLines,
    blankLines: lines.length - codeLines - commentLines,
    complexity,
    maintainabilityIndex: Math.max(0, 100 - (complexity * 3) - (lines.length / 10))
  };
}

export function reviewCode(code: string, language: SupportedLanguage): CodeReviewResult {
  const issues = detectIssues(code, language);
  const metrics = calculateMetrics(code);
  const refactoredCode = generateRefactoredCode(code, language, issues);
  
  let score = 100;
  issues.forEach(i => {
    if (i.severity === "critical") score -= 20;
    if (i.severity === "warning") score -= 10;
    if (i.severity === "info") score -= 2;
  });

  return {
    id: crypto.randomUUID(),
    code,
    language,
    issues,
    metrics,
    suggestions: generateSuggestions(issues, metrics),
    overallScore: Math.max(0, score),
    reviewedAt: new Date().toISOString(),
    refactoredCode
  };
}

function generateRefactoredCode(code: string, language: SupportedLanguage, issues: CodeIssue[]): string {
  let refactored = code;

  // Generic refactors
  if (language === "javascript" || language === "typescript") {
    refactored = refactored.replace(/\bvar\s+/g, "const ");
    refactored = refactored.replace(/==(?!=)/g, "===");
    refactored = refactored.replace(/!=(?!=)/g, "!==");
  }

  if (language === "java") {
    refactored = refactored.replace(/\.printStackTrace\(\)/g, ".error(e.getMessage(), e)");
    refactored = refactored.replace(/System\.out\.println/g, "logger.info");
  }

  if (language === "php") {
    refactored = refactored.replace(/mysql_query\s*\(/g, "$pdo->query(");
  }

  // If no changes were made and there are critical issues, we don't return refactored code
  // unless we have specific logic for it.
  return refactored !== code ? refactored : "";
}

function generateSuggestions(issues: CodeIssue[], metrics: CodeMetrics): string[] {
  const suggestions: string[] = [];
  if (issues.some(i => i.category === "security")) suggestions.push("Prioritize fixing security vulnerabilities");
  if (metrics.complexity > 10) suggestions.push("Consider refactoring complex logic into smaller functions");
  if (metrics.maintainabilityIndex < 60) suggestions.push("Improve code maintainability by reducing function size and adding documentation");
  if (suggestions.length === 0) suggestions.push("Code quality is excellent, keep following these patterns!");
  return suggestions;
}
