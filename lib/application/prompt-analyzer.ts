import type {
  PromptAnalysisResult,
  PromptIssue,
  SecurityFlag,
  ScoreCategory,
  IssueType,
  SecurityFlagType,
} from "@/types/prompt-analyzer";

// Security detection patterns
const INJECTION_PATTERNS: {
  pattern: RegExp;
  type: SecurityFlagType;
  severity: "critical" | "warning" | "info";
  description: string;
}[] = [
  {
    pattern: /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?)/i,
    type: "ignore_instruction",
    severity: "critical",
    description: "Attempt to ignore previous instructions detected",
  },
  {
    pattern: /you\s+are\s+(now|actually)\s+a/i,
    type: "role_override",
    severity: "critical",
    description: "Role override attempt detected",
  },
  {
    pattern: /pretend\s+(you('re|are)|to\s+be)/i,
    type: "role_override",
    severity: "warning",
    description: "Role pretending instruction detected",
  },
  {
    pattern: /forget\s+(everything|all|your)/i,
    type: "ignore_instruction",
    severity: "critical",
    description: "Memory reset attempt detected",
  },
  {
    pattern: /jailbreak|dan\s+mode|developer\s+mode/i,
    type: "jailbreak_attempt",
    severity: "critical",
    description: "Jailbreak attempt detected",
  },
  {
    pattern: /bypass\s+(safety|filter|restriction)/i,
    type: "jailbreak_attempt",
    severity: "critical",
    description: "Safety bypass attempt detected",
  },
  {
    pattern: /reveal\s+(your|the)\s+(system|initial)\s+prompt/i,
    type: "data_exfiltration",
    severity: "warning",
    description: "System prompt extraction attempt detected",
  },
  {
    pattern: /\[system\]|\[admin\]|<\s*system\s*>/i,
    type: "prompt_injection",
    severity: "critical",
    description: "System tag injection detected",
  },
  {
    pattern: /act\s+as\s+(if|though)\s+you\s+(have\s+)?no\s+(restrictions?|rules?|limits?)/i,
    type: "jailbreak_attempt",
    severity: "critical",
    description: "Restriction bypass attempt detected",
  },
];

// Quality issue patterns
const QUALITY_PATTERNS: {
  check: (prompt: string) => boolean;
  type: IssueType;
  severity: "high" | "medium" | "low";
  message: string;
}[] = [
  {
    check: (p) => p.length < 20,
    type: "vague_instruction",
    severity: "high",
    message: "Prompt is too short and may lack necessary context",
  },
  {
    check: (p) => !/\b(you|assistant|ai|model)\b/i.test(p) && p.length > 50,
    type: "missing_role",
    severity: "medium",
    message: "Consider defining a clear role for the AI",
  },
  {
    check: (p) =>
      !/\b(format|output|return|respond|provide)\b/i.test(p) && p.length > 100,
    type: "no_output_format",
    severity: "medium",
    message: "No clear output format specified",
  },
  {
    check: (p) => p.length > 4000,
    type: "too_long",
    severity: "low",
    message: "Prompt is very long, consider breaking it into smaller parts",
  },
  {
    check: (p) => {
      const words = p.toLowerCase().split(/\s+/);
      const uniqueWords = new Set(words);
      return words.length > 20 && uniqueWords.size / words.length < 0.5;
    },
    type: "redundant",
    severity: "low",
    message: "Prompt contains repetitive content",
  },
  {
    check: (p) =>
      !/\b(context|background|given|assume|scenario)\b/i.test(p) &&
      p.length > 100,
    type: "missing_context",
    severity: "medium",
    message: "Consider adding more context or background information",
  },
];

function detectIssues(prompt: string): PromptIssue[] {
  const issues: PromptIssue[] = [];

  for (const pattern of QUALITY_PATTERNS) {
    if (pattern.check(prompt)) {
      issues.push({
        type: pattern.type,
        severity: pattern.severity,
        message: pattern.message,
      });
    }
  }

  return issues;
}

function detectSecurityFlags(prompt: string): SecurityFlag[] {
  const flags: SecurityFlag[] = [];

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.pattern.test(prompt)) {
      flags.push({
        type: pattern.type,
        severity: pattern.severity,
        description: pattern.description,
      });
    }
  }

  return flags;
}

function calculateScore(
  prompt: string,
  issues: PromptIssue[],
  securityFlags: SecurityFlag[]
): number {
  let score = 10;

  // Deduct for issues
  for (const issue of issues) {
    switch (issue.severity) {
      case "high":
        score -= 2;
        break;
      case "medium":
        score -= 1;
        break;
      case "low":
        score -= 0.5;
        break;
    }
  }

  // Deduct for security flags
  for (const flag of securityFlags) {
    switch (flag.severity) {
      case "critical":
        score -= 3;
        break;
      case "warning":
        score -= 1.5;
        break;
      case "info":
        score -= 0.5;
        break;
    }
  }

  // Bonus for good practices
  if (/\b(step\s*by\s*step|first|then|finally)\b/i.test(prompt)) {
    score += 0.5; // Clear structure
  }
  if (/\b(example|e\.g\.|for\s+instance)\b/i.test(prompt)) {
    score += 0.5; // Includes examples
  }
  if (prompt.length >= 50 && prompt.length <= 2000) {
    score += 0.5; // Good length
  }

  return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
}

function getScoreCategory(score: number): ScoreCategory {
  if (score >= 9) return "excellent";
  if (score >= 7) return "good";
  if (score >= 5) return "average";
  if (score >= 3) return "poor";
  return "critical";
}

function generateSuggestions(
  issues: PromptIssue[],
  securityFlags: SecurityFlag[]
): string[] {
  const suggestions: string[] = [];

  // Suggestions based on issues
  const issueTypes = new Set(issues.map((i) => i.type));

  if (issueTypes.has("vague_instruction")) {
    suggestions.push(
      "Add more specific details about what you want to accomplish"
    );
  }
  if (issueTypes.has("missing_context")) {
    suggestions.push(
      "Provide background information or context for better results"
    );
  }
  if (issueTypes.has("no_output_format")) {
    suggestions.push(
      'Specify the desired output format (e.g., "Respond in JSON format")'
    );
  }
  if (issueTypes.has("missing_role")) {
    suggestions.push(
      'Define a role for the AI (e.g., "Act as a senior developer...")'
    );
  }
  if (issueTypes.has("too_long")) {
    suggestions.push(
      "Consider breaking this into multiple smaller, focused prompts"
    );
  }
  if (issueTypes.has("redundant")) {
    suggestions.push("Remove repetitive content to make the prompt more concise");
  }

  // Security-related suggestions
  if (securityFlags.length > 0) {
    suggestions.push(
      "Review and remove any content that could be interpreted as prompt injection"
    );
  }

  // General suggestions if score is low
  if (suggestions.length === 0) {
    suggestions.push("Your prompt looks good! Consider adding examples for even better results.");
  }

  return suggestions;
}

function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
}

export function analyzePrompt(prompt: string): PromptAnalysisResult {
  const trimmedPrompt = prompt.trim();
  const issues = detectIssues(trimmedPrompt);
  const securityFlags = detectSecurityFlags(trimmedPrompt);
  const score = calculateScore(trimmedPrompt, issues, securityFlags);
  const category = getScoreCategory(score);
  const suggestions = generateSuggestions(issues, securityFlags);
  const tokenCount = estimateTokens(trimmedPrompt);

  return {
    id: crypto.randomUUID(),
    prompt: trimmedPrompt,
    score,
    category,
    issues,
    suggestions,
    securityFlags,
    analyzedAt: new Date().toISOString(),
    tokenCount,
  };
}
