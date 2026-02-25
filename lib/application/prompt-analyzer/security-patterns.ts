import type { SecurityFlag, SecurityFlagType } from "@/types/prompt-analyzer";

const INJECTION_PATTERNS: {
  pattern: RegExp;
  type: SecurityFlagType;
  severity: "critical" | "warning" | "info";
  description: string;
}[] = [
  {
    // eslint-disable-next-line security/detect-unsafe-regex -- static prompt injection detection
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
    // eslint-disable-next-line security/detect-unsafe-regex -- static jailbreak detection
    pattern: /act\s+as\s+(if|though)\s+you\s+(have\s+)?no\s+(restrictions?|rules?|limits?)/i,
    type: "jailbreak_attempt",
    severity: "critical",
    description: "Restriction bypass attempt detected",
  },
  {
    pattern: /echo\s+back\s+the\s+content\s+of/i,
    type: "data_exfiltration",
    severity: "warning",
    description: "Potential data exfiltration attempt",
  },
  {
    pattern: /decode\s+this\s+base64/i,
    type: "prompt_injection",
    severity: "info",
    description: "Obfuscated content (Base64) detected",
  },
  {
    pattern: /from\s+now\s+on,\s+every\s+response\s+must/i,
    type: "role_override",
    severity: "warning",
    description: "Constraint override attempt",
  },
  {
    pattern: /markdown\s+link\s+to\s+https?:\/\//i,
    type: "data_exfiltration",
    severity: "info",
    description: "Potential tracking pixel or exfiltration via Markdown link",
  },
  {
    // eslint-disable-next-line security/detect-unsafe-regex -- bounded repetition for obfuscation detection
    pattern: /\b([a-z]\s+){5,}/i,
    type: "prompt_injection",
    severity: "warning",
    description: "Suspicious spacing detected (potential payload splitting)",
  },
  {
    pattern: /translate\s+the\s+following\s+and\s+ignore/i,
    type: "jailbreak_attempt",
    severity: "critical",
    description: "Indirect injection via translation task detected",
  },
  {
    pattern: /reveal\s+the\s+hidden\s+text\s+above/i,
    type: "data_exfiltration",
    severity: "critical",
    description: "Attempt to reveal hidden context detected",
  },
];

export function detectSecurityFlags(prompt: string): SecurityFlag[] {
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
