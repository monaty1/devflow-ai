export const REGEX_HUMANIZER_WORKER_SOURCE = `
// --- Self-contained Regex Humanizer Logic ---

// --- Constants ---
const DANGEROUS_PATTERNS = [
  {
    pattern: /(\\(.*\\)\\*|\\(.*\\)\\+|\\(.*\\){\\d+,})\\*/,
    message: "Nested quantifiers (e.g., (a*)*) can cause catastrophic backtracking.",
    severity: "critical"
  },
  {
    pattern: /(\\.\\/\\*){3,}/,
    message: "Multiple overlapping wildcards (.*.*.*) may degrade performance.",
    severity: "warning"
  },
  {
    pattern: /\\[.*\\]\\*|\\+/,
    message: "Loose character classes with quantifiers can be slow if followed by overlapping literal characters.",
    severity: "info"
  }
];

const COMMON_PATTERNS = [
  { id: "email", name: "Email Address", pattern: "^[^@\\\\s]+@[^@\\\\s]+\\\\.[^@\\\\s]+$", description: "Validates standard email format." },
  { id: "url", name: "URL", pattern: "^https?:\\\\/\\\\/[\\\\w\\\\-\\\\.]+(?::\\\\d+)?(?:\\\\/[\\\\w\\\\-./?%&=]*)?$", description: "Matches HTTP/HTTPS URLs." },
  { id: "ipv4", name: "IPv4 Address", pattern: "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$", description: "Matches valid IPv4 addresses." },
  { id: "date-iso", name: "ISO 8601 Date", pattern: "^\\\\d{4}-\\\\d{2}-\\\\d{2}(?:T\\\\d{2}:\\\\d{2}:\\\\d{2}(?:\\\\.\\\\d+)?)?(?:Z|[+-]\\\\d{2}:\\\\d{2})?$", description: "Matches dates in YYYY-MM-DD format." },
  { id: "password", name: "Strong Password", pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\\\d)(?=.*[@$!%*?&])[A-Za-z\\\\d@$!%*?&]{8,}$", description: "At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char." },
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
  "\\\\d": "Digit (0-9)",
  "\\\\w": "Word character (a-z, A-Z, 0-9, _)",
  "\\\\s": "Whitespace (space, tab, newline)",
  "\\\\b": "Word boundary",
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
  var warnings = [];
  var score = 100;

  for (var d = 0; d < DANGEROUS_PATTERNS.length; d++) {
    var danger = DANGEROUS_PATTERNS[d];
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
    warnings: warnings
  };
}

function findMatchingBracket(str, start, open, close) {
  var depth = 0;
  for (var i = start; i < str.length; i++) {
    if (str[i] === "\\\\" && i + 1 < str.length) {
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
  var inner = charClass.slice(1, -1);
  var isNegated = inner.startsWith("^");
  var content = isNegated ? inner.slice(1) : inner;
  var parts = [];

  if (content.includes("a-z")) parts.push("lowercase letters");
  if (content.includes("A-Z")) parts.push("uppercase letters");
  if (content.includes("0-9")) parts.push("digits");
  if (content.includes("\\\\d")) parts.push("digits");
  if (content.includes("\\\\w")) parts.push("word chars");
  if (content.includes("\\\\s")) parts.push("whitespace");

  var specials = content
    .replace(/[a-z]-[a-z]|[A-Z]-[A-Z]|[0-9]-[0-9]|\\\\[dws]/gi, "")
    .replace(/[\\\\[\\\\]^]/g, "");

  if (specials) parts.push("chars: " + specials.split("").join(", "));

  var desc = parts.length > 0 ? parts.join(", ") : "set of characters";
  return isNegated ? "Any char EXCEPT: " + desc : "One of: " + desc;
}

function explainGroup(group) {
  var inner = group.slice(1, -1);
  if (inner.startsWith("?:")) return "Non-capturing group: " + inner.slice(2);
  if (inner.startsWith("?=")) return "Positive Lookahead: followed by " + inner.slice(2);
  if (inner.startsWith("?!")) return "Negative Lookahead: NOT followed by " + inner.slice(2);
  if (inner.startsWith("?<=")) return "Positive Lookbehind: preceded by " + inner.slice(3);
  if (inner.startsWith("?<!")) return "Negative Lookbehind: NOT preceded by " + inner.slice(3);
  return "Capturing Group: " + inner;
}

function explainQuantifier(quantifier) {
  var match = quantifier.match(/\\{(\\d+)(?:,(\\d*))?\\}/);
  if (!match || !match[1]) return "Quantifier: " + quantifier;
  var min = match[1];
  var max = match[2];
  if (max === undefined) return "Exactly " + min + " times";
  if (max === "") return min + " or more times";
  return "Between " + min + " and " + max + " times";
}

function tokenizeRegex(pattern) {
  var tokens = [];
  var i = 0;

  while (i < pattern.length) {
    var char = pattern[i];
    var nextChar = pattern[i + 1] || "";

    if (char === "\\\\") {
      var escapeSeq = char + nextChar;
      tokens.push({
        type: "escape",
        value: escapeSeq,
        description: TOKEN_EXPLANATIONS[escapeSeq] || "Escaped: " + nextChar,
        start: i,
        end: i + 2,
      });
      i += 2;
      continue;
    }

    if (char === "[") {
      var end = findMatchingBracket(pattern, i, "[", "]");
      var content = pattern.slice(i, end + 1);
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
      var end = findMatchingBracket(pattern, i, "(", ")");
      var content = pattern.slice(i, end + 1);
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
      var end = pattern.indexOf("}", i);
      if (end !== -1) {
        var content = pattern.slice(i, end + 1);
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
        description: TOKEN_EXPLANATIONS[char] || "Quantifier: " + char,
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
        description: TOKEN_EXPLANATIONS[char] || "Anchor: " + char,
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
      description: "Literal: " + char,
      start: i,
      end: i + 1,
    });
    i++;
  }
  return tokens;
}

function extractGroups(pattern) {
  var groups = [];
  var groupIndex = 0;
  var depth = 0;
  var groupStart = -1;

  for (var i = 0; i < pattern.length; i++) {
    if (pattern[i] === "\\\\" && i + 1 < pattern.length) {
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
        var content = pattern.slice(groupStart, i + 1);
        var inner = content.slice(1, -1);
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
  var normalized = pattern.replace(/\\\\\\\\/g, "");
  for (var c = 0; c < COMMON_PATTERNS.length; c++) {
    var common = COMMON_PATTERNS[c];
    var normCommon = common.pattern.replace(/\\\\\\\\/g, "");
    if (normalized === normCommon) return common;
  }
  if (pattern.includes("@") && pattern.includes("\\\\.")) return COMMON_PATTERNS.find(function(p) { return p.id === "email"; });
  if (pattern.includes("https?") || pattern.includes("http")) return COMMON_PATTERNS.find(function(p) { return p.id === "url"; });
  return null;
}

function buildExplanation(tokens, groups, commonPattern, flags) {
  var lines = [];
  if (commonPattern) {
    lines.push("Detected Pattern: " + commonPattern.name);
    lines.push("   " + commonPattern.description);
    lines.push("");
  }
  lines.push("Pattern Breakdown:");
  lines.push("");
  for (var t = 0; t < tokens.length; t++) {
    lines.push("   " + tokens[t].value + " -> " + tokens[t].description);
  }
  if (groups.length > 0) {
    lines.push("");
    lines.push("Capture Groups:");
    for (var g = 0; g < groups.length; g++) {
      lines.push("   Group " + groups[g].index + ": " + groups[g].pattern);
      lines.push("      " + groups[g].description);
    }
  }
  if (flags) {
    lines.push("");
    lines.push("Flags:");
    if (flags.includes("g")) lines.push("   g -> Global");
    if (flags.includes("i")) lines.push("   i -> Case Insensitive");
    if (flags.includes("m")) lines.push("   m -> Multiline");
  }
  return lines.join("\\n");
}

function generateRegex(description) {
  var desc = description.toLowerCase();
  if (desc.includes("email")) return COMMON_PATTERNS.find(function(p) { return p.id === "email"; }).pattern;
  if (desc.includes("url")) return COMMON_PATTERNS.find(function(p) { return p.id === "url"; }).pattern;
  if (desc.includes("ip")) return COMMON_PATTERNS.find(function(p) { return p.id === "ipv4"; }).pattern;
  if (desc.includes("date")) return COMMON_PATTERNS.find(function(p) { return p.id === "date-iso"; }).pattern;
  if (desc.includes("digit")) {
    var match = desc.match(/(\\d+)/);
    if (match) return "^\\\\d{" + match[1] + "}$";
    return "^\\\\d+$";
  }
  return "^.*$";
}

function testRegex(patternInput, input) {
  var pattern = patternInput;
  var flags = "g";
  var regexMatch = patternInput.match(/^\\/(.+)\\/([gimsuy]*)$/);
  if (regexMatch && regexMatch[1]) {
    pattern = regexMatch[1];
    flags = regexMatch[2] || "g";
    if (!flags.includes("g")) flags += "g";
  }

  try {
    var regex = new RegExp(pattern, flags);
    var allMatches = [];
    var MAX_MATCHES = 500;
    var TIMEOUT_MS = 2000;
    var startTime = Date.now();

    var match;
    while ((match = regex.exec(input)) !== null) {
      if (allMatches.length >= MAX_MATCHES || Date.now() - startTime > TIMEOUT_MS) break;

      var groups = {};
      var groupColors = {};
      if (match.groups) Object.assign(groups, match.groups);

      for (var i = 1; i < match.length; i++) {
        if (match[i] !== undefined) {
          groups["$" + i] = match[i];
          groupColors["$" + i] = GROUP_COLORS[(i - 1) % GROUP_COLORS.length];
        }
      }

      allMatches.push({
        match: match[0],
        index: match.index,
        groups: groups,
        groupColors: groupColors
      });

      if (match[0].length === 0) regex.lastIndex++;
    }

    return {
      pattern: pattern,
      input: input,
      isValid: true,
      matches: allMatches.length > 0,
      allMatches: allMatches,
      error: null
    };
  } catch (e) {
    return {
      pattern: pattern,
      input: input,
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
    var data = e.data;
    var action = data.action;
    var payload = data.payload;

    if (action === "explain") {
      var patternInput = payload.patternInput;
      var pattern = patternInput;
      var flags = "";

      var match = patternInput.match(/^\\/(.+)\\/([gimsuy]*)$/);
      if (match && match[1]) {
        pattern = match[1];
        flags = match[2] || "";
      }

      var tokens = tokenizeRegex(pattern);
      var groups = extractGroups(pattern);
      var commonPattern = detectCommonPattern(pattern);
      var safety = performSafetyAnalysis(pattern);
      var explanation = buildExplanation(tokens, groups, commonPattern, flags);

      self.postMessage({
        type: "success",
        result: {
          id: crypto.randomUUID(),
          pattern: pattern,
          flags: flags,
          flavor: "javascript",
          explanation: explanation,
          tokens: tokens,
          groups: groups,
          commonPattern: commonPattern ? commonPattern.name : null,
          safetyScore: safety.score,
          isDangerous: safety.isDangerous,
          warnings: safety.warnings,
          analyzedAt: new Date().toISOString()
        }
      });
    } else if (action === "test") {
      var testPattern = payload.pattern;
      var text = payload.text;
      var result = testRegex(testPattern, text);
      self.postMessage({ type: "success", result: result });
    } else if (action === "generate") {
      var description = payload.description;
      var regex = generateRegex(description);
      self.postMessage({ type: "success", result: regex });
    }
  } catch (err) {
    self.postMessage({ type: "error", error: err.message });
  }
};
`;
