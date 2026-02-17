import type { PromptIssue, IssueType } from "@/types/prompt-analyzer";

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
  // --- New stricter detections ---
  {
    check: (p) =>
      /\b(something|stuff|things?|etc\.?|whatever)\b/i.test(p),
    type: "vague_terms",
    severity: "medium",
    message: "Prompt contains vague terms like \"something\", \"stuff\", or \"things\"",
  },
  {
    check: (p) =>
      p.length > 150 &&
      !/\b(avoid|do\s+not|don['']t|never|must\s+not|should\s+not)\b/i.test(p),
    type: "no_constraints",
    severity: "low",
    message: "Long prompt without constraints — consider adding what to avoid",
  },
  {
    check: (p) =>
      p.length > 150 &&
      !/\b(should|must|ensure|goal|expect|require)\b/i.test(p),
    type: "no_success_criteria",
    severity: "low",
    message: "No success criteria defined — add what the output should achieve",
  },
  {
    check: (p) =>
      p.length > 200 &&
      !/\b(beginner|expert|developer|user|audience|reader|student|professional)\b/i.test(p),
    type: "no_audience",
    severity: "low",
    message: "No target audience specified for this long prompt",
  },
  {
    check: (p) =>
      p.length > 300 &&
      !/\b(example|e\.g\.|here\s+is\s+an|instance|sample|input:|output:)\b/i.test(p),
    type: "missing_examples",
    severity: "low",
    message: "Long prompt without examples (few-shot) — consider adding sample input/output",
  },
  {
    check: (p) =>
      !/\b(step\s*by\s*step|think|reasoning|deliberate|analyze|thought\s*process|break\s*down|logic|first\s*,|then\s*,|finally\s*)\b/i.test(p) &&
      p.length > 200,
    type: "no_chain_of_thought",
    severity: "low",
    message: "Consider asking the AI to \"think step-by-step\" for better results",
  },
  {
    check: (p) =>
      p.length > 300 &&
      !/(###|"""|'''|---|===|<[a-z_]+>)/.test(p),
    type: "missing_delimiters",
    severity: "medium",
    message: "Long prompt without clear delimiters (###, XML tags, etc.) — can lead to instruction confusion",
  },
  {
    check: (p) =>
      p.length > 500 &&
      !/\n\n/.test(p),
    type: "poor_structure",
    severity: "medium",
    message: "Prompt lacks structural breaks — consider using paragraphs and headers",
  },
  {
    check: (p) =>
      /\b(terminal|linux|shell|bash|console|game|simulation|virtualization)\b/i.test(p) &&
      !/\b(only|avoid|strictly|ignore)\b/i.test(p),
    type: "virtualization_risk",
    severity: "medium",
    message: "Virtualization or simulation detected without strong constraints — higher risk of jailbreak",
  },
];

export function detectIssues(prompt: string): PromptIssue[] {
  const issues: PromptIssue[] = [];

  for (const pattern of QUALITY_PATTERNS) {
    if (pattern.check(prompt)) {
      // Enhance severity for long prompts missing role or output format
      let { severity } = pattern;
      if (
        prompt.length > 200 &&
        (pattern.type === "missing_role" || pattern.type === "no_output_format")
      ) {
        severity = "high";
      }

      issues.push({
        type: pattern.type,
        severity,
        message: pattern.message,
      });
    }
  }

  return issues;
}
