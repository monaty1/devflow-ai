import type {
  RegexAnalysis,
  RegexToken,
  RegexGroup,
  TestResult,
  TestMatch,
  CommonPattern,
  RegexFlavor,
} from "@/types/regex-humanizer";

// --- Locale type (no React dependency) ---
type RegexLocale = "en" | "es";

// --- i18n Strings ---
const REGEX_STRINGS = {
  en: {
    // Token explanations
    tokens: {
      "\\d": "Any digit (0-9)",
      "\\D": "Any character that is NOT a digit",
      "\\w": "Any word character (a-z, A-Z, 0-9, _)",
      "\\W": "Any character that is NOT a word character",
      "\\s": "Any whitespace (space, tab, newline)",
      "\\S": "Any character that is NOT whitespace",
      "\\b": "Word boundary",
      "\\B": "NOT a word boundary",
      "\\n": "Newline",
      "\\t": "Tab",
      "\\r": "Carriage return",
      "\\0": "Null character",
      "\\.": "Literal dot",
      "\\\\": "Literal backslash",
      "\\(": "Literal opening parenthesis",
      "\\)": "Literal closing parenthesis",
      "\\[": "Literal opening bracket",
      "\\]": "Literal closing bracket",
      "\\{": "Literal opening brace",
      "\\}": "Literal closing brace",
      "\\+": "Literal plus sign",
      "\\*": "Literal asterisk",
      "\\?": "Literal question mark",
      "\\^": "Literal caret",
      "\\$": "Literal dollar sign",
      "\\|": "Literal pipe",
      "*": "Zero or more repetitions (greedy)",
      "+": "One or more repetitions (greedy)",
      "?": "Zero or one repetition (optional)",
      "^": "Start of string",
      "$": "End of string",
      "|": "Alternation (OR)",
      ".": "Any character except newline",
    } as Record<string, string>,

    // Fallback descriptions
    escapedChar: (ch: string) => `Escaped character: "${ch}" literal`,
    quantifierFallback: (q: string) => `Quantifier: ${q}`,
    anchorFallback: (a: string) => `Anchor: ${a}`,
    alternationFallback: (a: string) => `Alternation: ${a}`,
    metacharFallback: (m: string) => `Metacharacter: ${m}`,
    literalChar: (ch: string) => `Literal character: "${ch}"`,

    // Character class parts
    lowercaseLetters: "lowercase letters",
    uppercaseLetters: "uppercase letters",
    digits: "digits",
    wordChars: "word characters",
    spaces: "whitespace",
    characters: (chars: string) => `characters: ${chars}`,
    charSet: "character set",
    anyCharExcept: (desc: string) => `Any character EXCEPT: ${desc}`,
    oneOf: (desc: string) => `One of: ${desc}`,

    // Group explanations
    nonCapturingGroup: (inner: string) => `Non-capturing group: ${inner}`,
    positiveLookahead: (inner: string) => `Positive lookahead: followed by ${inner}`,
    negativeLookahead: (inner: string) => `Negative lookahead: NOT followed by ${inner}`,
    positiveLookbehind: (inner: string) => `Positive lookbehind: preceded by ${inner}`,
    negativeLookbehind: (inner: string) => `Negative lookbehind: NOT preceded by ${inner}`,
    captureGroup: (inner: string) => `Capture group: ${inner}`,

    // Quantifier explanations
    quantifierLabel: (q: string) => `Quantifier: ${q}`,
    exactlyN: (n: string) => `Exactly ${n} repetitions`,
    nOrMore: (n: string) => `${n} or more repetitions`,
    betweenNAndM: (n: string, m: string) => `Between ${n} and ${m} repetitions`,

    // buildExplanation labels
    patternDetected: (name: string) => `Pattern detected: ${name}`,
    patternBreakdown: "Pattern breakdown:",
    captureGroups: "Capture groups:",
    groupLabel: (idx: number, pat: string) => `Group ${idx}: ${pat}`,
    flags: "Flags:",
    flagG: "g → Global (all matches)",
    flagI: "i → Case insensitive",
    flagM: "m → Multiline (^ and $ per line)",
    flagS: "s → Dotall (. includes newlines)",
    flagU: "u → Unicode",
    flagY: "y → Sticky (search from lastIndex)",

    // testRegex error
    invalidRegex: "Invalid regex",

    // Common patterns
    commonPatterns: {
      email: {
        name: "Email",
        description: "Validates a basic email address",
        examples: ["user@example.com", "name.surname@domain.co"],
      },
      url: {
        name: "URL",
        description: "Validates an HTTP or HTTPS URL",
        examples: ["https://example.com", "http://www.example.com/path"],
      },
      "phone-es": {
        name: "Phone (Spain)",
        description: "Validates a Spanish phone number",
        examples: ["+34612345678", "612345678"],
      },
      "date-iso": {
        name: "ISO 8601 Date",
        description: "Validates a date in ISO 8601 format",
        examples: ["2024-01-15", "2024-01-15T10:30:00"],
      },
      ipv4: {
        name: "IPv4",
        description: "Validates an IPv4 address",
        examples: ["192.168.1.1", "10.0.0.1"],
      },
      password: {
        name: "Secure Password",
        description: "Minimum 8 characters with uppercase, lowercase, digit and special character",
        examples: ["P@ssw0rd!", "Segura#123"],
      },
      "dni-es": {
        name: "DNI/NIF (Spain)",
        description: "Validates a Spanish DNI/NIF",
        examples: ["12345678Z", "00000000T"],
      },
      "hex-color": {
        name: "Hex Color",
        description: "Validates a hexadecimal color code",
        examples: ["#FFF", "#FF5733"],
      },
    } as Record<string, { name: string; description: string; examples: string[] }>,

    // generateRegex keyword detection
    keywords: {
      email: ["email", "correo"],
      url: ["url", "link", "web", "enlace"],
      phone: ["phone", "telephone", "teléfono", "telefono", "mobile", "móvil", "movil"],
      phoneSpanish: ["spanish", "español", "espanol", "spain", "es"],
      date: ["date", "fecha"],
      dateIso: ["iso"],
      dateDDMM: ["dd/mm", "día/mes", "day/month"],
      ip: ["ip", "ipv4"],
      password: ["password", "contraseña"],
      dni: ["dni", "nif"],
      color: ["color", "hex"],
      digits: /(\d+)\s*digits?/,
      digitsEs: /(\d+)\s*dígitos?/,
      startingWith: /(?:starting with|starts? with)\s*([0-9,\s]+)/,
      startingWithEs: /(?:empezando por|empieza(?:n)? (?:por|con))\s*([0-9,\s]+)/,
      letters: ["letter", "letters", "letra", "letras"],
      uppercase: ["uppercase", "mayúscula", "mayuscula"],
      lowercase: ["lowercase", "minúscula", "minuscula"],
      alphanumeric: ["alphanumeric", "alfanumérico", "alfanumerico"],
    },
  },
  es: {
    // Token explanations
    tokens: {
      "\\d": "Cualquier dígito (0-9)",
      "\\D": "Cualquier carácter que NO sea dígito",
      "\\w": "Cualquier carácter de palabra (a-z, A-Z, 0-9, _)",
      "\\W": "Cualquier carácter que NO sea de palabra",
      "\\s": "Cualquier espacio en blanco (espacio, tab, nueva línea)",
      "\\S": "Cualquier carácter que NO sea espacio en blanco",
      "\\b": "Límite de palabra",
      "\\B": "NO límite de palabra",
      "\\n": "Nueva línea",
      "\\t": "Tabulación",
      "\\r": "Retorno de carro",
      "\\0": "Carácter nulo",
      "\\.": "Punto literal",
      "\\\\": "Barra invertida literal",
      "\\(": "Paréntesis de apertura literal",
      "\\)": "Paréntesis de cierre literal",
      "\\[": "Corchete de apertura literal",
      "\\]": "Corchete de cierre literal",
      "\\{": "Llave de apertura literal",
      "\\}": "Llave de cierre literal",
      "\\+": "Signo más literal",
      "\\*": "Asterisco literal",
      "\\?": "Signo de interrogación literal",
      "\\^": "Acento circunflejo literal",
      "\\$": "Signo de dólar literal",
      "\\|": "Barra vertical literal",
      "*": "Cero o más repeticiones (greedy)",
      "+": "Una o más repeticiones (greedy)",
      "?": "Cero o una repetición (opcional)",
      "^": "Inicio de cadena",
      "$": "Fin de cadena",
      "|": "Alternación (OR)",
      ".": "Cualquier carácter excepto nueva línea",
    } as Record<string, string>,

    // Fallback descriptions
    escapedChar: (ch: string) => `Carácter escapado: "${ch}" literal`,
    quantifierFallback: (q: string) => `Cuantificador: ${q}`,
    anchorFallback: (a: string) => `Ancla: ${a}`,
    alternationFallback: (a: string) => `Alternación: ${a}`,
    metacharFallback: (m: string) => `Metacarácter: ${m}`,
    literalChar: (ch: string) => `Carácter literal: "${ch}"`,

    // Character class parts
    lowercaseLetters: "letras minúsculas",
    uppercaseLetters: "letras mayúsculas",
    digits: "dígitos",
    wordChars: "caracteres de palabra",
    spaces: "espacios",
    characters: (chars: string) => `caracteres: ${chars}`,
    charSet: "conjunto de caracteres",
    anyCharExcept: (desc: string) => `Cualquier carácter EXCEPTO: ${desc}`,
    oneOf: (desc: string) => `Uno de: ${desc}`,

    // Group explanations
    nonCapturingGroup: (inner: string) => `Grupo no capturador: ${inner}`,
    positiveLookahead: (inner: string) => `Lookahead positivo: seguido de ${inner}`,
    negativeLookahead: (inner: string) => `Lookahead negativo: NO seguido de ${inner}`,
    positiveLookbehind: (inner: string) => `Lookbehind positivo: precedido por ${inner}`,
    negativeLookbehind: (inner: string) => `Lookbehind negativo: NO precedido por ${inner}`,
    captureGroup: (inner: string) => `Grupo de captura: ${inner}`,

    // Quantifier explanations
    quantifierLabel: (q: string) => `Cuantificador: ${q}`,
    exactlyN: (n: string) => `Exactamente ${n} repeticiones`,
    nOrMore: (n: string) => `${n} o más repeticiones`,
    betweenNAndM: (n: string, m: string) => `Entre ${n} y ${m} repeticiones`,

    // buildExplanation labels
    patternDetected: (name: string) => `Patrón detectado: ${name}`,
    patternBreakdown: "Desglose del patrón:",
    captureGroups: "Grupos de captura:",
    groupLabel: (idx: number, pat: string) => `Grupo ${idx}: ${pat}`,
    flags: "Flags:",
    flagG: "g → Global (todas las coincidencias)",
    flagI: "i → Insensible a mayúsculas/minúsculas",
    flagM: "m → Multilínea (^ y $ por línea)",
    flagS: "s → Dotall (. incluye saltos de línea)",
    flagU: "u → Unicode",
    flagY: "y → Sticky (búsqueda desde lastIndex)",

    // testRegex error
    invalidRegex: "Regex inválida",

    // Common patterns
    commonPatterns: {
      email: {
        name: "Email",
        description: "Valida una dirección de correo electrónico básica",
        examples: ["user@example.com", "nombre.apellido@dominio.es"],
      },
      url: {
        name: "URL",
        description: "Valida una URL HTTP o HTTPS",
        examples: ["https://example.com", "http://www.ejemplo.es/ruta"],
      },
      "phone-es": {
        name: "Teléfono (España)",
        description: "Valida un número de teléfono español",
        examples: ["+34612345678", "612345678"],
      },
      "date-iso": {
        name: "Fecha ISO 8601",
        description: "Valida una fecha en formato ISO 8601",
        examples: ["2024-01-15", "2024-01-15T10:30:00"],
      },
      ipv4: {
        name: "IPv4",
        description: "Valida una dirección IPv4",
        examples: ["192.168.1.1", "10.0.0.1"],
      },
      password: {
        name: "Contraseña Segura",
        description: "Mínimo 8 caracteres con mayúscula, minúscula, dígito y carácter especial",
        examples: ["P@ssw0rd!", "Segura#123"],
      },
      "dni-es": {
        name: "DNI/NIF (España)",
        description: "Valida un DNI/NIF español",
        examples: ["12345678Z", "00000000T"],
      },
      "hex-color": {
        name: "Color Hexadecimal",
        description: "Valida un código de color hexadecimal",
        examples: ["#FFF", "#FF5733"],
      },
    } as Record<string, { name: string; description: string; examples: string[] }>,

    // generateRegex keyword detection (same as en — both languages accepted)
    keywords: {
      email: ["email", "correo"],
      url: ["url", "link", "web", "enlace"],
      phone: ["phone", "telephone", "teléfono", "telefono", "mobile", "móvil", "movil"],
      phoneSpanish: ["spanish", "español", "espanol", "spain", "es"],
      date: ["date", "fecha"],
      dateIso: ["iso"],
      dateDDMM: ["dd/mm", "día/mes", "day/month"],
      ip: ["ip", "ipv4"],
      password: ["password", "contraseña"],
      dni: ["dni", "nif"],
      color: ["color", "hex"],
      digits: /(\d+)\s*digits?/,
      digitsEs: /(\d+)\s*dígitos?/,
      startingWith: /(?:starting with|starts? with)\s*([0-9,\s]+)/,
      startingWithEs: /(?:empezando por|empieza(?:n)? (?:por|con))\s*([0-9,\s]+)/,
      letters: ["letter", "letters", "letra", "letras"],
      uppercase: ["uppercase", "mayúscula", "mayuscula"],
      lowercase: ["lowercase", "minúscula", "minuscula"],
      alphanumeric: ["alphanumeric", "alfanumérico", "alfanumerico"],
    },
  },
} as const;

// Helper to get the strings object for a locale
function getStrings(locale: RegexLocale) {
  return REGEX_STRINGS[locale];
}

// --- Advanced Safety Patterns (ReDoS Detection) ---
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
    pattern: /\[.*\](\*|\+)/,
    message: "Loose character classes with quantifiers can be slow if followed by overlapping literal characters.",
    severity: "info"
  }
];

// --- Common Patterns (locale-aware getter) ---
function getCommonPatterns(locale: RegexLocale): CommonPattern[] {
  const s = getStrings(locale);
  const patternData = s.commonPatterns;

  return [
    {
      id: "email",
      name: patternData["email"]?.name ?? "Email",
      pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
      description: patternData["email"]?.description ?? "",
      examples: patternData["email"]?.examples ?? [],
    },
    {
      id: "url",
      name: patternData["url"]?.name ?? "URL",
      pattern: "^https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+([\\w.,@?^=%&:/~+#\\-]*[\\w@?^=%&/~+#\\-])?$",
      description: patternData["url"]?.description ?? "",
      examples: patternData["url"]?.examples ?? [],
    },
    {
      id: "phone-es",
      name: patternData["phone-es"]?.name ?? "Phone (Spain)",
      pattern: "^(\\+34)?[6-9]\\d{8}$",
      description: patternData["phone-es"]?.description ?? "",
      examples: patternData["phone-es"]?.examples ?? [],
    },
    {
      id: "date-iso",
      name: patternData["date-iso"]?.name ?? "ISO 8601 Date",
      pattern: "^\\d{4}-\\d{2}-\\d{2}(T\\d{2}:\\d{2}:\\d{2})?",
      description: patternData["date-iso"]?.description ?? "",
      examples: patternData["date-iso"]?.examples ?? [],
    },
    {
      id: "ipv4",
      name: patternData["ipv4"]?.name ?? "IPv4",
      pattern: "^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$",
      description: patternData["ipv4"]?.description ?? "",
      examples: patternData["ipv4"]?.examples ?? [],
    },
    {
      id: "password",
      name: patternData["password"]?.name ?? "Secure Password",
      pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
      description: patternData["password"]?.description ?? "",
      examples: patternData["password"]?.examples ?? [],
    },
    {
      id: "dni-es",
      name: patternData["dni-es"]?.name ?? "DNI/NIF (Spain)",
      pattern: "^\\d{8}[A-Z]$",
      description: patternData["dni-es"]?.description ?? "",
      examples: patternData["dni-es"]?.examples ?? [],
    },
    {
      id: "hex-color",
      name: patternData["hex-color"]?.name ?? "Hex Color",
      pattern: "^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$",
      description: patternData["hex-color"]?.description ?? "",
      examples: patternData["hex-color"]?.examples ?? [],
    },
  ];
}

// Backward-compatible export: defaults to "en"
export const COMMON_PATTERNS: CommonPattern[] = getCommonPatterns("en");

// Locale-aware export
export { getCommonPatterns };

// --- Parse and Explain Regex ---
export function explainRegex(
  patternInput: string,
  flavor: RegexFlavor = "javascript",
  locale: RegexLocale = "en"
): RegexAnalysis {
  // Extract pattern and flags
  let pattern = patternInput;
  let flags = "";

  // Handle /pattern/flags format
  const regexMatch = patternInput.match(/^\/(.+)\/([gimsuy]*)$/);
  if (regexMatch && regexMatch[1]) {
    pattern = regexMatch[1];
    flags = regexMatch[2] ?? "";
  }

  const tokens = tokenizeRegex(pattern, locale);
  const groups = extractGroups(pattern, locale);
  const patterns = getCommonPatterns(locale);
  const commonPattern = detectCommonPattern(pattern, patterns);
  const safety = performSafetyAnalysis(pattern);

  // Build explanation
  const explanation = buildExplanation(tokens, groups, commonPattern, flags, locale);

  return {
    id: crypto.randomUUID(),
    pattern,
    flags,
    flavor,
    explanation,
    tokens,
    groups,
    commonPattern: commonPattern?.name ?? null,
    safetyScore: safety.score,
    isDangerous: safety.isDangerous,
    warnings: safety.warnings,
    analyzedAt: new Date().toISOString(),
  };
}

function performSafetyAnalysis(pattern: string): { score: number; isDangerous: boolean; warnings: string[] } {
  const warnings: string[] = [];
  let score = 100;

  for (const danger of DANGEROUS_PATTERNS) {
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

function tokenizeRegex(pattern: string, locale: RegexLocale = "en"): RegexToken[] {
  const s = getStrings(locale);
  const tokenExplanations = s.tokens;
  const tokens: RegexToken[] = [];
  let i = 0;

  while (i < pattern.length) {
    const char = pattern[i] as string;
    const nextChar = pattern[i + 1] ?? "";

    // Escape sequences
    if (char === "\\") {
      const escapeSeq = char + (nextChar || "");
      const description =
        tokenExplanations[escapeSeq] ??
        s.escapedChar(nextChar);
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
        description: explainCharClass(classContent, locale),
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
        description: explainGroup(groupContent, locale),
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
          description: explainQuantifier(quantifier, locale),
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
        description: tokenExplanations[char] ?? s.quantifierFallback(char),
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
        description: tokenExplanations[char] ?? s.anchorFallback(char),
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
        description: tokenExplanations[char] ?? s.alternationFallback(char),
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
        description: tokenExplanations[char] ?? s.metacharFallback(char),
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
      description: s.literalChar(char),
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

function explainCharClass(charClass: string, locale: RegexLocale = "en"): string {
  const s = getStrings(locale);
  const inner = charClass.slice(1, -1);
  const isNegated = inner.startsWith("^");
  const content = isNegated ? inner.slice(1) : inner;

  const parts: string[] = [];

  if (content.includes("a-z")) parts.push(s.lowercaseLetters);
  if (content.includes("A-Z")) parts.push(s.uppercaseLetters);
  if (content.includes("0-9")) parts.push(s.digits);
  if (content.includes("\\d")) parts.push(s.digits);
  if (content.includes("\\w")) parts.push(s.wordChars);
  if (content.includes("\\s")) parts.push(s.spaces);

  // Check for specific characters
  const specials = content
    .replace(/[a-z]-[a-z]|[A-Z]-[A-Z]|[0-9]-[0-9]|\\[dws]/gi, "")
    .replace(/[\[\]^]/g, "");
  if (specials) {
    parts.push(s.characters(specials.split("").join(", ")));
  }

  const desc = parts.length > 0 ? parts.join(", ") : s.charSet;
  return isNegated ? s.anyCharExcept(desc) : s.oneOf(desc);
}

function explainGroup(group: string, locale: RegexLocale = "en"): string {
  const s = getStrings(locale);
  const inner = group.slice(1, -1);

  if (inner.startsWith("?:")) {
    return s.nonCapturingGroup(inner.slice(2));
  }
  if (inner.startsWith("?=")) {
    return s.positiveLookahead(inner.slice(2));
  }
  if (inner.startsWith("?!")) {
    return s.negativeLookahead(inner.slice(2));
  }
  if (inner.startsWith("?<=")) {
    return s.positiveLookbehind(inner.slice(3));
  }
  if (inner.startsWith("?<!")) {
    return s.negativeLookbehind(inner.slice(3));
  }

  return s.captureGroup(inner);
}

function explainQuantifier(quantifier: string, locale: RegexLocale = "en"): string {
  const s = getStrings(locale);
  const match = quantifier.match(/\{(\d+)(?:,(\d*))?\}/);
  if (!match || !match[1]) return s.quantifierLabel(quantifier);

  const min = match[1];
  const max = match[2];

  if (max === undefined) {
    return s.exactlyN(min);
  }
  if (max === "") {
    return s.nOrMore(min);
  }
  return s.betweenNAndM(min, max);
}

function extractGroups(pattern: string, locale: RegexLocale = "en"): RegexGroup[] {
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
            description: explainGroup(groupContent, locale),
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

function detectCommonPattern(pattern: string, patterns: CommonPattern[]): CommonPattern | null {
  const normalizedPattern = pattern.replace(/\\\\/g, "\\");

  for (const common of patterns) {
    // Normalize both patterns for comparison
    const normalizedCommon = common.pattern.replace(/\\\\/g, "\\");
    if (normalizedPattern === normalizedCommon) {
      return common;
    }
  }

  // Check for partial matches
  if (pattern.includes("@") && pattern.includes("\\.")) {
    return patterns.find((p) => p.id === "email") ?? null;
  }
  if (pattern.includes("https?") || pattern.includes("http")) {
    return patterns.find((p) => p.id === "url") ?? null;
  }

  return null;
}

function buildExplanation(
  tokens: RegexToken[],
  groups: RegexGroup[],
  commonPattern: CommonPattern | null,
  flags: string,
  locale: RegexLocale = "en"
): string {
  const s = getStrings(locale);
  const lines: string[] = [];

  if (commonPattern) {
    lines.push(`\u{1F4CB} ${s.patternDetected(commonPattern.name)}`);
    lines.push(`   ${commonPattern.description}`);
    lines.push("");
  }

  lines.push(`\u{1F4DD} ${s.patternBreakdown}`);
  lines.push("");

  for (const token of tokens) {
    const indent = "   ";
    lines.push(`${indent}${token.value} \u2192 ${token.description}`);
  }

  if (groups.length > 0) {
    lines.push("");
    lines.push(`\u{1F3AF} ${s.captureGroups}`);
    for (const group of groups) {
      lines.push(`   ${s.groupLabel(group.index, group.pattern)}`);
      lines.push(`      ${group.description}`);
    }
  }

  if (flags) {
    lines.push("");
    lines.push(`\u{1F6A9} ${s.flags}`);
    if (flags.includes("g")) lines.push(`   ${s.flagG}`);
    if (flags.includes("i")) lines.push(`   ${s.flagI}`);
    if (flags.includes("m")) lines.push(`   ${s.flagM}`);
    if (flags.includes("s")) lines.push(`   ${s.flagS}`);
    if (flags.includes("u")) lines.push(`   ${s.flagU}`);
    if (flags.includes("y")) lines.push(`   ${s.flagY}`);
  }

  return lines.join("\n");
}

// --- Generate Regex from Description ---
export function generateRegex(description: string, locale: RegexLocale = "en"): string {
  const desc = description.toLowerCase();
  const patterns = getCommonPatterns(locale);
  const s = getStrings(locale);
  const kw = s.keywords;

  // Check for common pattern keywords
  if (kw.email.some((k) => desc.includes(k))) {
    return patterns.find((p) => p.id === "email")!.pattern;
  }
  if (kw.url.some((k) => desc.includes(k))) {
    return patterns.find((p) => p.id === "url")!.pattern;
  }
  if (kw.phone.some((k) => desc.includes(k))) {
    if (kw.phoneSpanish.some((k) => desc.includes(k))) {
      return patterns.find((p) => p.id === "phone-es")!.pattern;
    }
    return "^\\+?[\\d\\s\\-\\(\\)]+$";
  }
  if (kw.date.some((k) => desc.includes(k))) {
    if (kw.dateIso.some((k) => desc.includes(k))) {
      return patterns.find((p) => p.id === "date-iso")!.pattern;
    }
    if (kw.dateDDMM.some((k) => desc.includes(k))) {
      return "^\\d{2}/\\d{2}/\\d{4}$";
    }
    return patterns.find((p) => p.id === "date-iso")!.pattern;
  }
  if (kw.ip.some((k) => desc.includes(k))) {
    return patterns.find((p) => p.id === "ipv4")!.pattern;
  }
  if (kw.password.some((k) => desc.includes(k))) {
    return patterns.find((p) => p.id === "password")!.pattern;
  }
  if (kw.dni.some((k) => desc.includes(k))) {
    return patterns.find((p) => p.id === "dni-es")!.pattern;
  }
  if (kw.color.some((k) => desc.includes(k))) {
    return patterns.find((p) => p.id === "hex-color")!.pattern;
  }

  // Parse digit patterns (both EN and ES keywords accepted regardless of locale)
  const digitMatchEn = desc.match(kw.digits);
  const digitMatchEs = desc.match(kw.digitsEs);
  const digitMatch = digitMatchEn ?? digitMatchEs;
  if (digitMatch && digitMatch[1]) {
    const count = digitMatch[1];
    const startMatchEn = desc.match(kw.startingWith);
    const startMatchEs = desc.match(kw.startingWithEs);
    const startMatch = startMatchEn ?? startMatchEs;
    if (startMatch && startMatch[1]) {
      const starts = startMatch[1].replace(/\s/g, "").split(",").join("");
      return `^[${starts}]\\d{${parseInt(count) - 1}}$`;
    }
    return `^\\d{${count}}$`;
  }

  // Parse letter patterns
  if (kw.letters.some((k) => desc.includes(k))) {
    if (kw.uppercase.some((k) => desc.includes(k))) {
      return "^[A-Z]+$";
    }
    if (kw.lowercase.some((k) => desc.includes(k))) {
      return "^[a-z]+$";
    }
    return "^[a-zA-Z]+$";
  }

  // Alphanumeric
  if (kw.alphanumeric.some((k) => desc.includes(k))) {
    return "^[a-zA-Z0-9]+$";
  }

  // Default: return a basic pattern hint
  return "^.*$";
}

const GROUP_COLORS = [
  "text-blue-600 dark:text-blue-400",
  "text-emerald-600 dark:text-emerald-400",
  "text-purple-600 dark:text-purple-400",
  "text-amber-600 dark:text-amber-400",
  "text-rose-600 dark:text-rose-400",
  "text-indigo-600 dark:text-indigo-400",
];

// --- Test Regex ---
export function testRegex(patternInput: string, input: string, locale: RegexLocale = "en"): TestResult {
  const s = getStrings(locale);
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
      const groupColors: Record<string, string> = {};

      // Named groups
      if (match.groups) {
        Object.assign(groups, match.groups);
      }

      // Numbered groups
      for (let i = 1; i < match.length; i++) {
        const groupValue = match[i];
        if (groupValue !== undefined) {
          groups[`$${i}`] = groupValue;
          groupColors[`$${i}`] = GROUP_COLORS[(i - 1) % GROUP_COLORS.length]!;
        }
      }

      allMatches.push({
        match: match[0] ?? "",
        index: match.index,
        groups,
        groupColors,
      });

      // Prevent infinite loops with zero-length matches (Unicode-safe)
      if ((match[0] ?? "").length === 0) {
        const cp = input.codePointAt(regex.lastIndex);
        regex.lastIndex += cp !== undefined && cp > 0xFFFF ? 2 : 1;
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
      error: e instanceof Error ? e.message : s.invalidRegex,
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
