export const PROMPT_ANALYZER_WORKER_SOURCE = `
// --- Self-contained Prompt Analyzer Logic ---

// --- Constants ---
const QUALITY_PATTERNS = [
  {
    type: "vague_instruction",
    pattern: /\b(do something|help me|fix this|make it better)\b/i,
    severity: "high",
    message: "Instruction is too vague. Be specific about the task.",
  },
  {
    type: "missing_context",
    pattern: /\b(it|this|that|the code|the text)\b/i,
    severity: "medium",
    message: "Context might be missing. Specify what 'it' refers to.",
  },
  {
    type: "no_output_format",
    pattern: /\b(output|format|return|json|csv|markdown|list|table)\b/i,
    severity: "medium",
    message: "No output format specified. Define how you want the result.",
    invert: true, 
  },
  {
    type: "missing_role",
    pattern: /\b(act as|you are|role|expert|teacher|coder)\b/i,
    severity: "medium",
    message: "No role assigned. Assigning a persona improves quality.",
    invert: true,
  },
];

const SECURITY_PATTERNS = [
  {
    type: "prompt_injection",
    pattern: /\b(ignore previous instructions|system prompt|new rule)\b/i,
    severity: "critical",
    message: "Potential prompt injection detected.",
  },
  {
    type: "jailbreak_attempt",
    pattern: /\b(DAN|do anything now|unfiltered|jailbreak)\b/i,
    severity: "critical",
    message: "Jailbreak attempt pattern detected.",
  },
  {
    type: "pii_leak",
    pattern: /\b(\d{3}-\d{2}-\d{4}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/,
    severity: "high",
    message: "Potential PII (SSN or Email) detected.",
  },
];

// --- Helper Functions ---

function detectIssues(prompt) {
  const issues = [];
  
  if (prompt.length < 10) {
    issues.push({
      type: "too_short",
      severity: "high",
      message: "Prompt is too short to be effective.",
    });
  }

  if (prompt.length > 4000 * 4) { // Roughly 4000 tokens
    issues.push({
      type: "too_long",
      severity: "medium",
      message: "Prompt is very long. Consider splitting or summarizing.",
    });
  }

  for (const p of QUALITY_PATTERNS) {
    const match = p.pattern.test(prompt);
    if (p.invert ? !match : match) {
      issues.push({
        type: p.type,
        severity: p.severity,
        message: p.message,
      });
    }
  }

  return issues;
}

function detectSecurityFlags(prompt) {
  const flags = [];
  for (const p of SECURITY_PATTERNS) {
    if (p.pattern.test(prompt)) {
      flags.push({
        type: p.type,
        severity: p.severity,
        message: p.message,
      });
    }
  }
  return flags;
}

function calculateScore(prompt, issues, securityFlags) {
  let score = 10;

  // Penalize for issues
  for (const issue of issues) {
    if (issue.severity === "high") score -= 2;
    if (issue.severity === "medium") score -= 1;
  }

  // Penalize for security flags
  if (securityFlags.length > 0) {
    score -= 5;
  }

  return Math.max(1, Math.min(10, score));
}

function getScoreCategory(score) {
  if (score >= 8) return "excellent";
  if (score >= 5) return "good";
  if (score >= 3) return "fair";
  return "poor";
}

function generateSuggestions(issues, securityFlags) {
  const suggestions = [];

  if (issues.some(i => i.type === "vague_instruction")) {
    suggestions.push("Add specific verbs: 'Analyze', 'Write', 'Summarize'.");
  }
  if (issues.some(i => i.type === "missing_context")) {
    suggestions.push("Paste the code or text you want me to work on.");
  }
  if (issues.some(i => i.type === "no_output_format")) {
    suggestions.push("Specify format: 'Return as a JSON list' or 'Use Markdown'.");
  }
  if (issues.some(i => i.type === "missing_role")) {
    suggestions.push("Start with 'Act as a Senior Developer' or 'You are an expert'.");
  }
  
  if (securityFlags.length > 0) {
    suggestions.push("REMOVE any personal data or attempt to bypass rules.");
  }

  if (suggestions.length === 0) {
    suggestions.push("Try adding 'Let's think step by step' for better reasoning.");
  }

  return suggestions;
}

function refinePrompt(prompt, issues) {
  let refined = prompt;

  if (issues.some(i => i.type === "missing_role")) {
    refined = "Act as an expert in this field.\\n\\n" + refined;
  }

  if (issues.some(i => i.type === "no_output_format")) {
    refined += "\\n\\nPlease format the output clearly.";
  }

  if (issues.some(i => i.type === "vague_instruction")) {
    // Basic heuristics to improve verbs
    refined = refined.replace(/help me/i, "Assist me by providing a detailed solution for");
    refined = refined.replace(/fix this/i, "Analyze and fix the following code/text");
  }

  return refined;
}

function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// --- Main Analysis Function ---

self.onmessage = function(e) {
  try {
    const prompt = e.data;
    const trimmedPrompt = prompt.trim();
    
    const issues = detectIssues(trimmedPrompt);
    const securityFlags = detectSecurityFlags(trimmedPrompt);
    const score = calculateScore(trimmedPrompt, issues, securityFlags);
    const category = getScoreCategory(score);
    const suggestions = generateSuggestions(issues, securityFlags);
    const tokenCount = estimateTokens(trimmedPrompt);
    const refinedPrompt = refinePrompt(trimmedPrompt, issues);

    const result = {
      id: crypto.randomUUID(), // Will use worker's crypto
      prompt: trimmedPrompt,
      score,
      category,
      issues,
      suggestions,
      securityFlags,
      analyzedAt: new Date().toISOString(),
      tokenCount,
      refinedPrompt,
    };

    self.postMessage({ type: "success", result });
  } catch (err) {
    self.postMessage({ type: "error", error: err.message });
  }
};
`;
