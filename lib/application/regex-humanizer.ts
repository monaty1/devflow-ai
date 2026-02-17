import type {
  RegexAnalysis,
  RegexToken,
  RegexGroup,
  TestResult,
  TestMatch,
  CommonPattern,
} from "@/types/regex-humanizer";

// --- Common Patterns Database ---
export const COMMON_PATTERNS: CommonPattern[] = [
  {
    id: "email",
    name: "Email",
    pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    description: "Dirección de correo electrónico",
    examples: ["user@example.com", "name.surname@domain.org"],
  },
  {
    id: "url",
    name: "URL",
    pattern: "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)",
    description: "URL web (http o https)",
    examples: ["https://example.com", "http://www.test.org/path?query=1"],
  },
  {
    id: "phone-es",
    name: "Teléfono ES",
    pattern: "^[679]\\d{8}$",
    description: "Teléfono móvil español (9 dígitos)",
    examples: ["612345678", "912345678"],
  },
  {
    id: "date-iso",
    name: "Fecha ISO",
    pattern: "^\\d{4}-\\d{2}-\\d{2}$",
    description: "Fecha en formato ISO (YYYY-MM-DD)",
    examples: ["2024-01-15", "2023-12-31"],
  },
  {
    id: "ipv4",
    name: "IPv4",
    pattern: "^(\\d{1,3}\\.){3}\\d{1,3}$",
    description: "Dirección IP versión 4",
    examples: ["192.168.1.1", "10.0.0.255"],
  },
  {
    id: "password",
    name: "Password",
    pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$",
    description: "Contraseña segura (8+ chars, mayúscula, minúscula, número)",
    examples: ["Password1", "Secure123"],
  },
  {
    id: "dni-es",
    name: "DNI España",
    pattern: "^\\d{8}[A-Z]$",
    description: "DNI español (8 dígitos + letra)",
    examples: ["12345678A", "87654321Z"],
  },
  {
    id: "hex-color",
    name: "Color Hex",
    pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
    description: "Color hexadecimal (#RGB o #RRGGBB)",
    examples: ["#FFF", "#3498db"],
  },
];

// --- Token Explanations (Spanish) ---
const TOKEN_EXPLANATIONS: Record<string, string> = {
  "^": "Inicio de la línea/cadena",
  "$": "Final de la línea/cadena",
  ".": "Cualquier carácter (excepto salto de línea)",
  "*": "Cero o más repeticiones del elemento anterior",
  "+": "Una o más repeticiones del elemento anterior",
  "?": "Cero o una repetición (opcional)",
  "\\d": "Cualquier dígito (0-9)",
  "\\D": "Cualquier carácter que NO sea dígito",
  "\\w": "Carácter de palabra (letra, dígito o guión bajo)",
  "\\W": "Carácter que NO sea de palabra",
  "\\s": "Espacio en blanco (espacio, tab, salto de línea)",
  "\\S": "Cualquier carácter que NO sea espacio en blanco",
  "\\b": "Límite de palabra",
  "\\B": "NO límite de palabra",
  "\\n": "Salto de línea",
  "\\t": "Tabulador",
  "\\r": "Retorno de carro",
  "|": "Alternativa (OR): coincide con lo de la izquierda O la derecha",
  "\\\\": "Barra invertida literal",
  "\\.": "Punto literal",
  "\\@": "Arroba literal",
  "\\-": "Guión literal",
};

// --- Parse and Explain Regex ---
export function explainRegex(patternInput: string): RegexAnalysis {
  // Extract pattern and flags
  let pattern = patternInput;
  let flags = "";

  // Handle /pattern/flags format
  const regexMatch = patternInput.match(/^\/(.+)\/([gimsuy]*)$/);
  if (regexMatch && regexMatch[1]) {
    pattern = regexMatch[1];
    flags = regexMatch[2] ?? "";
  }

  const tokens = tokenizeRegex(pattern);
  const groups = extractGroups(pattern);
  const commonPattern = detectCommonPattern(pattern);

  // Build explanation
  const explanation = buildExplanation(tokens, groups, commonPattern, flags);

  return {
    id: crypto.randomUUID(),
    pattern,
    flags,
    explanation,
    tokens,
    groups,
    commonPattern: commonPattern?.name ?? null,
    analyzedAt: new Date().toISOString(),
  };
}

function tokenizeRegex(pattern: string): RegexToken[] {
  const tokens: RegexToken[] = [];
  let i = 0;

  while (i < pattern.length) {
    const char = pattern[i] as string;
    const nextChar = pattern[i + 1] ?? "";

    // Escape sequences
    if (char === "\\") {
      const escapeSeq = char + (nextChar || "");
      const description =
        TOKEN_EXPLANATIONS[escapeSeq] ||
        `Carácter escapado: "${nextChar}" literal`;
      tokens.push({
        type: "escape",
        value: escapeSeq,
        description,
        start: i,
        end: i + 2,
      });
      i += 2;
      continue;
    }

    // Character classes [...]
    if (char === "[") {
      const end = findMatchingBracket(pattern, i, "[", "]");
      const classContent = pattern.slice(i, end + 1);
      tokens.push({
        type: "charClass",
        value: classContent,
        description: explainCharClass(classContent),
        start: i,
        end: end + 1,
      });
      i = end + 1;
      continue;
    }

    // Groups (...)
    if (char === "(") {
      const end = findMatchingBracket(pattern, i, "(", ")");
      const groupContent = pattern.slice(i, end + 1);
      tokens.push({
        type: "group",
        value: groupContent,
        description: explainGroup(groupContent),
        start: i,
        end: end + 1,
      });
      i = end + 1;
      continue;
    }

    // Quantifiers
    if (char === "{") {
      const end = pattern.indexOf("}", i);
      if (end !== -1) {
        const quantifier = pattern.slice(i, end + 1);
        tokens.push({
          type: "quantifier",
          value: quantifier,
          description: explainQuantifier(quantifier),
          start: i,
          end: end + 1,
        });
        i = end + 1;
        continue;
      }
    }

    // Simple quantifiers
    if ("*+?".includes(char)) {
      tokens.push({
        type: "quantifier",
        value: char,
        description: TOKEN_EXPLANATIONS[char] || `Cuantificador: ${char}`,
        start: i,
        end: i + 1,
      });
      i++;
      continue;
    }

    // Anchors
    if ("^$".includes(char)) {
      tokens.push({
        type: "anchor",
        value: char,
        description: TOKEN_EXPLANATIONS[char] || `Ancla: ${char}`,
        start: i,
        end: i + 1,
      });
      i++;
      continue;
    }

    // Alternation
    if (char === "|") {
      tokens.push({
        type: "alternation",
        value: char,
        description: TOKEN_EXPLANATIONS[char] ?? `Alternación: ${char}`,
        start: i,
        end: i + 1,
      });
      i++;
      continue;
    }

    // Dot
    if (char === ".") {
      tokens.push({
        type: "literal",
        value: char,
        description: TOKEN_EXPLANATIONS[char] ?? `Metacarácter: ${char}`,
        start: i,
        end: i + 1,
      });
      i++;
      continue;
    }

    // Literal character
    tokens.push({
      type: "literal",
      value: char,
      description: `Carácter literal: "${char}"`,
      start: i,
      end: i + 1,
    });
    i++;
  }

  return tokens;
}

function findMatchingBracket(
  str: string,
  start: number,
  open: string,
  close: string
): number {
  let depth = 0;
  for (let i = start; i < str.length; i++) {
    if (str[i] === "\\" && i + 1 < str.length) {
      i++; // Skip escaped characters
      continue;
    }
    if (str[i] === open) depth++;
    if (str[i] === close) depth--;
    if (depth === 0) return i;
  }
  return str.length - 1;
}

function explainCharClass(charClass: string): string {
  const inner = charClass.slice(1, -1);
  const isNegated = inner.startsWith("^");
  const content = isNegated ? inner.slice(1) : inner;

  const parts: string[] = [];

  if (content.includes("a-z")) parts.push("letras minúsculas");
  if (content.includes("A-Z")) parts.push("letras mayúsculas");
  if (content.includes("0-9")) parts.push("dígitos");
  if (content.includes("\\d")) parts.push("dígitos");
  if (content.includes("\\w")) parts.push("caracteres de palabra");
  if (content.includes("\\s")) parts.push("espacios");

  // Check for specific characters
  const specials = content
    .replace(/[a-z]-[a-z]|[A-Z]-[A-Z]|[0-9]-[0-9]|\\[dws]/gi, "")
    .replace(/[\[\]^]/g, "");
  if (specials) {
    parts.push(`caracteres: ${specials.split("").join(", ")}`);
  }

  const desc = parts.length > 0 ? parts.join(", ") : "conjunto de caracteres";
  return isNegated ? `Cualquier carácter EXCEPTO: ${desc}` : `Uno de: ${desc}`;
}

function explainGroup(group: string): string {
  const inner = group.slice(1, -1);

  if (inner.startsWith("?:")) {
    return `Grupo no capturador: ${inner.slice(2)}`;
  }
  if (inner.startsWith("?=")) {
    return `Lookahead positivo: seguido de ${inner.slice(2)}`;
  }
  if (inner.startsWith("?!")) {
    return `Lookahead negativo: NO seguido de ${inner.slice(2)}`;
  }
  if (inner.startsWith("?<=")) {
    return `Lookbehind positivo: precedido por ${inner.slice(3)}`;
  }
  if (inner.startsWith("?<!")) {
    return `Lookbehind negativo: NO precedido por ${inner.slice(3)}`;
  }

  return `Grupo de captura: ${inner}`;
}

function explainQuantifier(quantifier: string): string {
  const match = quantifier.match(/\{(\d+)(?:,(\d*))?\}/);
  if (!match || !match[1]) return `Cuantificador: ${quantifier}`;

  const min = match[1];
  const max = match[2];

  if (max === undefined) {
    return `Exactamente ${min} repeticiones`;
  }
  if (max === "") {
    return `${min} o más repeticiones`;
  }
  return `Entre ${min} y ${max} repeticiones`;
}

function extractGroups(pattern: string): RegexGroup[] {
  const groups: RegexGroup[] = [];
  let groupIndex = 0;
  let depth = 0;
  let groupStart = -1;

  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === "\\" && i + 1 < pattern.length) {
      i++; // Skip escaped
      continue;
    }

    if (pattern[i] === "(") {
      if (depth === 0) {
        groupStart = i;
      }
      depth++;
    }

    if (pattern[i] === ")") {
      depth--;
      if (depth === 0 && groupStart !== -1) {
        const groupContent = pattern.slice(groupStart, i + 1);
        const inner = groupContent.slice(1, -1);

        // Skip non-capturing groups for numbering
        if (!inner.startsWith("?:") && !inner.startsWith("?")) {
          groupIndex++;
          groups.push({
            index: groupIndex,
            pattern: groupContent,
            description: explainGroup(groupContent),
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

function detectCommonPattern(pattern: string): CommonPattern | null {
  const normalizedPattern = pattern.replace(/\\\\/g, "\\");

  for (const common of COMMON_PATTERNS) {
    // Normalize both patterns for comparison
    const normalizedCommon = common.pattern.replace(/\\\\/g, "\\");
    if (normalizedPattern === normalizedCommon) {
      return common;
    }
  }

  // Check for partial matches
  if (pattern.includes("@") && pattern.includes("\\.")) {
    return COMMON_PATTERNS.find((p) => p.id === "email") ?? null;
  }
  if (pattern.includes("https?") || pattern.includes("http")) {
    return COMMON_PATTERNS.find((p) => p.id === "url") ?? null;
  }

  return null;
}

function buildExplanation(
  tokens: RegexToken[],
  groups: RegexGroup[],
  commonPattern: CommonPattern | null,
  flags: string
): string {
  const lines: string[] = [];

  if (commonPattern) {
    lines.push(`📋 Patrón detectado: ${commonPattern.name}`);
    lines.push(`   ${commonPattern.description}`);
    lines.push("");
  }

  lines.push("📝 Desglose del patrón:");
  lines.push("");

  for (const token of tokens) {
    const indent = "   ";
    lines.push(`${indent}${token.value} → ${token.description}`);
  }

  if (groups.length > 0) {
    lines.push("");
    lines.push("🎯 Grupos de captura:");
    for (const group of groups) {
      lines.push(`   Grupo ${group.index}: ${group.pattern}`);
      lines.push(`      ${group.description}`);
    }
  }

  if (flags) {
    lines.push("");
    lines.push("🚩 Flags:");
    if (flags.includes("g")) lines.push("   g → Global (todas las coincidencias)");
    if (flags.includes("i")) lines.push("   i → Insensible a mayúsculas/minúsculas");
    if (flags.includes("m")) lines.push("   m → Multilínea (^ y $ por línea)");
    if (flags.includes("s")) lines.push("   s → Dotall (. incluye saltos de línea)");
    if (flags.includes("u")) lines.push("   u → Unicode");
    if (flags.includes("y")) lines.push("   y → Sticky (búsqueda desde lastIndex)");
  }

  return lines.join("\n");
}

// --- Generate Regex from Description ---
export function generateRegex(description: string): string {
  const desc = description.toLowerCase();

  // Check for common pattern keywords
  if (desc.includes("email") || desc.includes("correo")) {
    return COMMON_PATTERNS.find((p) => p.id === "email")!.pattern;
  }
  if (desc.includes("url") || desc.includes("enlace") || desc.includes("web")) {
    return COMMON_PATTERNS.find((p) => p.id === "url")!.pattern;
  }
  if (
    desc.includes("teléfono") ||
    desc.includes("telefono") ||
    desc.includes("móvil") ||
    desc.includes("movil")
  ) {
    if (desc.includes("español") || desc.includes("espanol") || desc.includes("es")) {
      return COMMON_PATTERNS.find((p) => p.id === "phone-es")!.pattern;
    }
    return "^\\+?[\\d\\s\\-\\(\\)]+$";
  }
  if (desc.includes("fecha") || desc.includes("date")) {
    if (desc.includes("iso")) {
      return COMMON_PATTERNS.find((p) => p.id === "date-iso")!.pattern;
    }
    if (desc.includes("dd/mm") || desc.includes("día/mes")) {
      return "^\\d{2}/\\d{2}/\\d{4}$";
    }
    return COMMON_PATTERNS.find((p) => p.id === "date-iso")!.pattern;
  }
  if (desc.includes("ip") || desc.includes("ipv4")) {
    return COMMON_PATTERNS.find((p) => p.id === "ipv4")!.pattern;
  }
  if (desc.includes("contraseña") || desc.includes("password")) {
    return COMMON_PATTERNS.find((p) => p.id === "password")!.pattern;
  }
  if (desc.includes("dni") || desc.includes("nif")) {
    return COMMON_PATTERNS.find((p) => p.id === "dni-es")!.pattern;
  }
  if (desc.includes("color") || desc.includes("hex")) {
    return COMMON_PATTERNS.find((p) => p.id === "hex-color")!.pattern;
  }

  // Parse digit patterns
  const digitMatch = desc.match(/(\d+)\s*dígitos?/);
  if (digitMatch && digitMatch[1]) {
    const count = digitMatch[1];
    if (desc.includes("empezando por") || desc.includes("empieza")) {
      const startMatch = desc.match(/(?:empezando por|empieza(?:n)? (?:por|con))\s*([0-9,\s]+)/);
      if (startMatch && startMatch[1]) {
        const starts = startMatch[1].replace(/\s/g, "").split(",").join("");
        return `^[${starts}]\\d{${parseInt(count) - 1}}$`;
      }
    }
    return `^\\d{${count}}$`;
  }

  // Parse letter patterns
  if (desc.includes("letra") || desc.includes("letras")) {
    if (desc.includes("mayúscula") || desc.includes("mayuscula")) {
      return "^[A-Z]+$";
    }
    if (desc.includes("minúscula") || desc.includes("minuscula")) {
      return "^[a-z]+$";
    }
    return "^[a-zA-Z]+$";
  }

  // Alphanumeric
  if (desc.includes("alfanumérico") || desc.includes("alfanumerico")) {
    return "^[a-zA-Z0-9]+$";
  }

  // Default: return a basic pattern hint
  return "^.*$";
}

// --- Test Regex ---
export function testRegex(patternInput: string, input: string): TestResult {
  let pattern = patternInput;
  let flags = "g";

  // Handle /pattern/flags format
  const regexMatch = patternInput.match(/^\/(.+)\/([gimsuy]*)$/);
  if (regexMatch && regexMatch[1]) {
    pattern = regexMatch[1];
    flags = regexMatch[2] || "g";
    if (!flags.includes("g")) flags += "g";
  }

  try {
    const regex = new RegExp(pattern, flags);
    const allMatches: TestMatch[] = [];
    const MAX_MATCHES = 500;
    const TIMEOUT_MS = 2000;
    const startTime = Date.now();

    let match;
    while ((match = regex.exec(input)) !== null) {
      if (allMatches.length >= MAX_MATCHES || Date.now() - startTime > TIMEOUT_MS) {
        break;
      }

      const groups: Record<string, string> = {};

      // Named groups
      if (match.groups) {
        Object.assign(groups, match.groups);
      }

      // Numbered groups
      for (let i = 1; i < match.length; i++) {
        const groupValue = match[i];
        if (groupValue !== undefined) {
          groups[`$${i}`] = groupValue;
        }
      }

      allMatches.push({
        match: match[0] ?? "",
        index: match.index,
        groups,
      });

      // Prevent infinite loops with zero-length matches
      if ((match[0] ?? "").length === 0) {
        regex.lastIndex++;
      }
    }

    return {
      pattern,
      input,
      isValid: true,
      matches: allMatches.length > 0,
      allMatches,
      error: null,
    };
  } catch (e) {
    return {
      pattern,
      input,
      isValid: false,
      matches: false,
      allMatches: [],
      error: e instanceof Error ? e.message : "Regex inválida",
    };
  }
}

// --- Validate Regex Syntax ---
export function isValidRegex(pattern: string): boolean {
  try {
    // Handle /pattern/flags format
    const match = pattern.match(/^\/(.+)\/([gimsuy]*)$/);
    if (match && match[1]) {
      new RegExp(match[1], match[2] ?? "");
    } else {
      new RegExp(pattern);
    }
    return true;
  } catch {
    return false;
  }
}
