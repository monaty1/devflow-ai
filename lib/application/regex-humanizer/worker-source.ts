export const REGEX_HUMANIZER_WORKER_SOURCE = `
// --- Self-contained Regex Humanizer Logic ---

// --- Constants ---
const DANGEROUS_PATTERNS = [
  {
    pattern: /(\(.*\)\*|\(.*\)\+|\(.*\){\d+,})\*/,
    message: "Nested quantifiers (e.g., (a*)*) can cause catastrophic backtracking.",
    severity: "critical"
  },
  {
    pattern: /(\.\*){3,}/,
    message: "Multiple overlapping wildcards (.*.*.*) may degrade performance.",
    severity: "warning"
  },
  {
    pattern: /\[.*\]\*|\+/,
    message: "Loose character classes with quantifiers can be slow if followed by overlapping literal characters.",
    severity: "info"
  }
];

const COMMON_PATTERNS = [
  { id: "email", name: "Email Address", pattern: "^[^@\s]+@[^@\s]+\.[^@\s]+$", description: "Validates standard email format." },
  { id: "url", name: "URL", pattern: "^https?:\/\/[\w\-\.]+(?::\d+)?(?:\/[\w\-./?%&=]*)?$", description: "Matches HTTP/HTTPS URLs." },
  { id: "ipv4", name: "IPv4 Address", pattern: "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$", description: "Matches valid IPv4 addresses." },
  { id: "date-iso", name: "ISO 8601 Date", pattern: "^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?$", description: "Matches dates in YYYY-MM-DD format." },
  { id: "password", name: "Strong Password", pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", description: "At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char." },
  { id: "hex-color", name: "Hex Color", pattern: "^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$", description: "Matches hex color codes (e.g. #FFF or #FFFFFF)." }
];

const TOKEN_EXPLANATIONS = {
  "^": "Start of string anchor",
  "$": "End of string anchor",
  "*": "0 or more times",
  "+": "1 or more times",
  "?": "0 or 1 time (optional)",
  ".": "Any character except newline",
  "|": "OR (alternation)",
  "\d": "Digit (0-9)",
  "\w": "Word character (a-z, A-Z, 0-9, _)",
  "\s": "Whitespace (space, tab, newline)",
  "\b": "Word boundary",
};

const GROUP_COLORS = [
  "text-blue-600 dark:text-blue-400",
  "text-emerald-600 dark:text-emerald-400",
  "text-purple-600 dark:text-purple-400",
  "text-amber-600 dark:text-amber-400",
  "text-rose-600 dark:text-rose-400",
  "text-indigo-600 dark:text-indigo-400",
];

// --- Helper Functions ---

function performSafetyAnalysis(pattern) {
  const warnings = [];
  let score = 100;

  for (const danger of DANGEROUS_PATTERNS) {
    // We create a regex from the danger pattern string since we can't pass regex objects directly in messages easily in all contexts, 
    // but here we defined them as objects. 
    // However, DANGEROUS_PATTERNS above uses regex literals.
    // In a worker string, we need to be careful. The regex literals above are fine.
    if (danger.pattern.test(pattern)) {
      warnings.push(danger.message);
      if (danger.severity === "critical") score -= 50;
      if (danger.severity === "warning") score -= 20;
      if (danger.severity === "info") score -= 5;
    }
  }

  return {
    score: Math.max(0, score),
    isDangerous: score <= 50,
    warnings
  };
}

function findMatchingBracket(str, start, open, close) {
  let depth = 0;
  for (let i = start; i < str.length; i++) {
    if (str[i] === "" && i + 1 < str.length) {
      i++;
      continue;
    }
    if (str[i] === open) depth++;
    if (str[i] === close) depth--;
    if (depth === 0) return i;
  }
  return str.length - 1;
}

function explainCharClass(charClass) {
  const inner = charClass.slice(1, -1);
  const isNegated = inner.startsWith("^");
  const content = isNegated ? inner.slice(1) : inner;
  const parts = [];

  if (content.includes("a-z")) parts.push("lowercase letters");
  if (content.includes("A-Z")) parts.push("uppercase letters");
  if (content.includes("0-9")) parts.push("digits");
  if (content.includes("\d")) parts.push("digits");
  if (content.includes("\w")) parts.push("word chars");
  if (content.includes("\s")) parts.push("whitespace");

  const specials = content
    .replace(/[a-z]-[a-z]|[A-Z]-[A-Z]|[0-9]-[0-9]|\[dws]/gi, "")
    .replace(/[\[\]^]/g, "");
  
  if (specials) parts.push(`chars: \${specials.split("").join(", ")}`);

  const desc = parts.length > 0 ? parts.join(", ") : "set of characters";
  return isNegated ? `Any char EXCEPT: \${desc}` : `One of: \${desc}`;
}

function explainGroup(group) {
  const inner = group.slice(1, -1);
  if (inner.startsWith("?:")) return `Non-capturing group: \${inner.slice(2)}`;
  if (inner.startsWith("?=")) return `Positive Lookahead: followed by \${inner.slice(2)}`;
  if (inner.startsWith("?!")) return `Negative Lookahead: NOT followed by \${inner.slice(2)}`;
  if (inner.startsWith("?<=")) return `Positive Lookbehind: preceded by \${inner.slice(3)}`;
  if (inner.startsWith("?<!")) return `Negative Lookbehind: NOT preceded by \${inner.slice(3)}`;
  return `Capturing Group: \${inner}`;
}

function explainQuantifier(quantifier) {
  const match = quantifier.match(/\{(\d+)(?:,(\d*))?\}/);
  if (!match || !match[1]) return `Quantifier: \${quantifier}`;
  const min = match[1];
  const max = match[2];
  if (max === undefined) return `Exactly \${min} times`;
  if (max === "") return `\${min} or more times`;
  return `Between \${min} and \${max} times`;
}

function tokenizeRegex(pattern) {
  const tokens = [];
  let i = 0;

  while (i < pattern.length) {
    const char = pattern[i];
    const nextChar = pattern[i + 1] || "";

    if (char === "") {
      const escapeSeq = char + nextChar;
      tokens.push({
        type: "escape",
        value: escapeSeq,
        description: TOKEN_EXPLANATIONS[escapeSeq] || `Escaped: "\${nextChar}"`,
        start: i,
        end: i + 2,
      });
      i += 2;
      continue;
    }

    if (char === "[") {
      const end = findMatchingBracket(pattern, i, "[", "]");
      const content = pattern.slice(i, end + 1);
      tokens.push({
        type: "charClass",
        value: content,
        description: explainCharClass(content),
        start: i,
        end: end + 1,
      });
      i = end + 1;
      continue;
    }

    if (char === "(") {
      const end = findMatchingBracket(pattern, i, "(", ")");
      const content = pattern.slice(i, end + 1);
      tokens.push({
        type: "group",
        value: content,
        description: explainGroup(content),
        start: i,
        end: end + 1,
      });
      i = end + 1;
      continue;
    }

    if (char === "{") {
      const end = pattern.indexOf("}", i);
      if (end !== -1) {
        const content = pattern.slice(i, end + 1);
        tokens.push({
          type: "quantifier",
          value: content,
          description: explainQuantifier(content),
          start: i,
          end: end + 1,
        });
        i = end + 1;
        continue;
      }
    }

    if ("*+?".includes(char)) {
      tokens.push({
        type: "quantifier",
        value: char,
        description: TOKEN_EXPLANATIONS[char] || `Quantifier: \${char}`,
        start: i,
        end: i + 1,
      });
      i++;
      continue;
    }

    if ("^$".includes(char)) {
      tokens.push({
        type: "anchor",
        value: char,
        description: TOKEN_EXPLANATIONS[char] || `Anchor: \${char}`,
        start: i,
        end: i + 1,
      });
      i++;
      continue;
    }

    if (char === "|") {
      tokens.push({
        type: "alternation",
        value: char,
        description: "OR (Alternation)",
        start: i,
        end: i + 1,
      });
      i++;
      continue;
    }

    if (char === ".") {
      tokens.push({
        type: "literal",
        value: char,
        description: "Any character (except newline)",
        start: i,
        end: i + 1,
      });
      i++;
      continue;
    }

    tokens.push({
      type: "literal",
      value: char,
      description: `Literal: "\${char}"`,
      start: i,
      end: i + 1,
    });
    i++;
  }
  return tokens;
}

function extractGroups(pattern) {
  const groups = [];
  let groupIndex = 0;
  let depth = 0;
  let groupStart = -1;

  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === "" && i + 1 < pattern.length) {
      i++;
      continue;
    }
    if (pattern[i] === "(") {
      if (depth === 0) groupStart = i;
      depth++;
    }
    if (pattern[i] === ")") {
      depth--;
      if (depth === 0 && groupStart !== -1) {
        const content = pattern.slice(groupStart, i + 1);
        const inner = content.slice(1, -1);
        if (!inner.startsWith("?:") && !inner.startsWith("?")) {
          groupIndex++;
          groups.push({
            index: groupIndex,
            pattern: content,
            description: explainGroup(content),
            start: groupStart,
            end: i + 1,
          });
        }
        groupStart = -1;
      }
    }
  }
  return groups;
}

function detectCommonPattern(pattern) {
  const normalized = pattern.replace(/\/g, "");
  for (const common of COMMON_PATTERNS) {
    const normCommon = common.pattern.replace(/\/g, "");
    if (normalized === normCommon) return common;
  }
  if (pattern.includes("@") && pattern.includes("\.")) return COMMON_PATTERNS.find(p => p.id === "email");
  if (pattern.includes("https?") || pattern.includes("http")) return COMMON_PATTERNS.find(p => p.id === "url");
  return null;
}

function buildExplanation(tokens, groups, commonPattern, flags) {
  const lines = [];
  if (commonPattern) {
    lines.push(`📋 Detected Pattern: \${commonPattern.name}`);
    lines.push(`   \${commonPattern.description}`);
    lines.push("");
  }
  lines.push("📝 Pattern Breakdown:");
  lines.push("");
  for (const t of tokens) {
    lines.push(`   \${t.value} → \${t.description}`);
  }
  if (groups.length > 0) {
    lines.push("");
    lines.push("🎯 Capture Groups:");
    for (const g of groups) {
      lines.push(`   Group \${g.index}: \${g.pattern}`);
      lines.push(`      \${g.description}`);
    }
  }
  if (flags) {
    lines.push("");
    lines.push("🚩 Flags:");
    if (flags.includes("g")) lines.push("   g → Global");
    if (flags.includes("i")) lines.push("   i → Case Insensitive");
    if (flags.includes("m")) lines.push("   m → Multiline");
  }
  return lines.join("
");
}

function generateRegex(description) {
  const desc = description.toLowerCase();
  if (desc.includes("email")) return COMMON_PATTERNS.find(p => p.id === "email").pattern;
  if (desc.includes("url")) return COMMON_PATTERNS.find(p => p.id === "url").pattern;
  if (desc.includes("ip")) return COMMON_PATTERNS.find(p => p.id === "ipv4").pattern;
  if (desc.includes("date")) return COMMON_PATTERNS.find(p => p.id === "date-iso").pattern;
  if (desc.includes("digit")) {
    const match = desc.match(/(\d+)/);
    if (match) return `^\d{\${match[1]}}$`;
    return "^\d+$";
  }
  return "^.*$";
}

function testRegex(patternInput, input) {
  let pattern = patternInput;
  let flags = "g";
  const regexMatch = patternInput.match(/^\/(.+)\/([gimsuy]*)$/);
  if (regexMatch && regexMatch[1]) {
    pattern = regexMatch[1];
    flags = regexMatch[2] || "g";
    if (!flags.includes("g")) flags += "g";
  }

  try {
    const regex = new RegExp(pattern, flags);
    const allMatches = [];
    const MAX_MATCHES = 500;
    const TIMEOUT_MS = 2000;
    const startTime = Date.now();

    let match;
    while ((match = regex.exec(input)) !== null) {
      if (allMatches.length >= MAX_MATCHES || Date.now() - startTime > TIMEOUT_MS) break;

      const groups = {};
      const groupColors = {};
      if (match.groups) Object.assign(groups, match.groups);
      
      for (let i = 1; i < match.length; i++) {
        if (match[i] !== undefined) {
          groups[`$\${i}`] = match[i];
          groupColors[`$\${i}`] = GROUP_COLORS[(i - 1) % GROUP_COLORS.length];
        }
      }

      allMatches.push({
        match: match[0],
        index: match.index,
        groups,
        groupColors
      });

      if (match[0].length === 0) regex.lastIndex++;
    }

    return {
      pattern,
      input,
      isValid: true,
      matches: allMatches.length > 0,
      allMatches,
      error: null
    };
  } catch (e) {
    return {
      pattern,
      input,
      isValid: false,
      matches: false,
      allMatches: [],
      error: e.message
    };
  }
}

// --- Main Message Handler ---

self.onmessage = function(e) {
  try {
    const { action, payload } = e.data;

    if (action === "explain") {
      const { patternInput } = payload;
      let pattern = patternInput;
      let flags = "";
      
      const match = patternInput.match(/^\/(.+)\/([gimsuy]*)$/);
      if (match && match[1]) {
        pattern = match[1];
        flags = match[2] || "";
      }

      const tokens = tokenizeRegex(pattern);
      const groups = extractGroups(pattern);
      const commonPattern = detectCommonPattern(pattern);
      const safety = performSafetyAnalysis(pattern);
      const explanation = buildExplanation(tokens, groups, commonPattern, flags);

      self.postMessage({
        type: "success",
        result: {
          id: crypto.randomUUID(),
          pattern,
          flags,
          flavor: "javascript",
          explanation,
          tokens,
          groups,
          commonPattern: commonPattern ? commonPattern.name : null,
          safetyScore: safety.score,
          isDangerous: safety.isDangerous,
          warnings: safety.warnings,
          analyzedAt: new Date().toISOString()
        }
      });
    } else if (action === "test") {
      const { pattern, text } = payload;
      const result = testRegex(pattern, text);
      self.postMessage({ type: "success", result });
    } else if (action === "generate") {
      const { description } = payload;
      const regex = generateRegex(description);
      self.postMessage({ type: "success", result: regex });
    }
  } catch (err) {
    self.postMessage({ type: "error", error: err.message });
  }
};
`;
