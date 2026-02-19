// Git Commit Message Generator Application Logic

import type {
  CommitType,
  CommitConfig,
  CommitResult,
  CommitTypeInfo,
  CommitValidation,
  ParsedCommit,
  DiffAnalysis,
} from "@/types/git-commit-generator";

export const COMMIT_TYPES: CommitTypeInfo[] = [
  { type: "feat", label: "Feature", description: "Nueva funcionalidad", emoji: "✨" },
  { type: "fix", label: "Fix", description: "Corrección de bug", emoji: "🐛" },
  { type: "docs", label: "Docs", description: "Documentación", emoji: "📝" },
  { type: "style", label: "Style", description: "Formato, sin cambios de lógica", emoji: "💎" },
  { type: "refactor", label: "Refactor", description: "Refactorización de código", emoji: "♻️" },
  { type: "perf", label: "Perf", description: "Mejora de rendimiento", emoji: "⚡" },
  { type: "test", label: "Test", description: "Tests nuevos o corregidos", emoji: "🧪" },
  { type: "chore", label: "Chore", description: "Tareas de mantenimiento", emoji: "🔧" },
  { type: "ci", label: "CI", description: "Cambios en CI/CD", emoji: "👷" },
  { type: "build", label: "Build", description: "Sistema de build o deps", emoji: "📦" },
  { type: "revert", label: "Revert", description: "Revertir commit anterior", emoji: "⏪" },
];

const VALID_TYPES = new Set<string>(COMMIT_TYPES.map((ct) => ct.type));

// ... (existing constants)

export const EXAMPLE_COMMITS: Record<CommitType, string> = {
  feat: "feat(auth): add OAuth2 login with Google provider",
  fix: "fix(api): resolve null pointer in user endpoint",
  docs: "docs(readme): update installation instructions",
  style: "style(components): format with prettier",
  refactor: "refactor(hooks): extract shared state logic",
  perf: "perf(queries): add database index for user lookup",
  test: "test(auth): add unit tests for login flow",
  chore: "chore(deps): update dependencies to latest",
  ci: "ci(github): add Node 20 to test matrix",
  build: "build(webpack): optimize bundle splitting",
  revert: "revert: undo feat(auth) commit abc1234",
};

const SCOPE_KEYWORDS: Record<string, string[]> = {
  auth: ["login", "logout", "password", "token", "session", "oauth", "jwt", "credential", "signup", "register"],
  api: ["endpoint", "route", "request", "response", "fetch", "axios", "rest", "graphql", "http"],
  ui: ["button", "modal", "form", "input", "layout", "component", "style", "theme", "dark mode", "responsive"],
  db: ["database", "query", "migration", "schema", "table", "index", "sql", "mongo", "prisma", "orm"],
  config: ["environment", "env", "config", "setting", "flag", "option", "preference"],
  deps: ["dependency", "package", "update", "upgrade", "install", "npm", "yarn", "pnpm"],
  test: ["test", "spec", "mock", "stub", "coverage", "vitest", "jest", "cypress", "e2e"],
  ci: ["pipeline", "workflow", "action", "deploy", "docker", "container", "build"],
  docs: ["readme", "documentation", "guide", "tutorial", "changelog", "comment", "jsdoc"],
  perf: ["performance", "speed", "cache", "optimize", "lazy", "bundle", "memory"],
};

export function analyzeDiff(diff: string): DiffAnalysis {
  const filesChanged = new Set<string>();
  let isBreaking = false;
  let hasTests = false;
  let hasDocs = false;
  let hasDeps = false;

  const lines = diff.split("\n");
  for (const line of lines) {
    if (line.startsWith("diff --git")) {
      const match = line.match(/b\/(.*)$/);
      if (match && match[1]) filesChanged.add(match[1]);
    }
    if (line.includes("BREAKING CHANGE") || line.includes("DEPRECATED")) {
      isBreaking = true;
    }
  }

  const files = Array.from(filesChanged);
  
  // Basic heuristic for type
  let suggestedType: CommitType = "feat";
  if (files.some(f => f.includes("test") || f.includes(".spec.") || f.includes(".test."))) hasTests = true;
  if (files.some(f => f.endsWith(".md") || f.includes("docs/"))) hasDocs = true;
  if (files.some(f => f.includes("package.json") || f.includes("go.mod") || f.includes("Cargo.toml"))) hasDeps = true;

  if (hasTests && !files.some(f => !f.includes("test"))) suggestedType = "test";
  else if (hasDocs && !files.some(f => !f.endsWith(".md"))) suggestedType = "docs";
  else if (hasDeps) suggestedType = "chore";
  else if (files.some(f => f.includes("fix") || f.includes("bug"))) suggestedType = "fix";

  // Heuristic for scope
  let suggestedScope = "";
  const firstFile = files[0];
  if (firstFile) {
    const parts = firstFile.split("/");
    if (parts.length > 1) suggestedScope = parts[0]!; // Use top-level dir as scope
  }

  return {
    suggestedType,
    suggestedScope,
    isBreaking,
    filesChanged: files
  };
}

/**
 * Generates a conventional commit message from config
 */
export function generateCommitMessage(config: CommitConfig): CommitResult {
  const parts: string[] = [];

  // Header: type(scope): description
  let header = "";
  
  if (config.useEmojis) {
    const typeInfo = getCommitTypeInfo(config.type);
    header += `${typeInfo.emoji} `;
  }

  header += config.type;

  if (config.scope.trim()) {
    header += `(${config.scope.trim()})`;
  }
  if (config.breakingChange.trim()) {
    header += "!";
  }
  header += `: ${config.description.trim()}`;
  parts.push(header);

  // Body
  if (config.body.trim()) {
    parts.push("");
    parts.push(config.body.trim());
  }

  // Footer
  const footerLines: string[] = [];
  if (config.breakingChange.trim()) {
    footerLines.push(`BREAKING CHANGE: ${config.breakingChange.trim()}`);
  }
  if (config.issueRef.trim()) {
    // Normalize issue references
    const refs = config.issueRef
      .split(/[,\s]+/)
      .filter(Boolean)
      .map((ref) => {
        const trimmed = ref.trim();
        if (/^\d+$/.test(trimmed)) {
          return `#${trimmed}`;
        }
        return trimmed;
      });
    if (refs.length > 0) {
      footerLines.push(`Refs: ${refs.join(", ")}`);
    }
  }

  if (footerLines.length > 0) {
    parts.push("");
    parts.push(...footerLines);
  }

  const message = parts.join("\n");

  return {
    id: crypto.randomUUID(),
    message,
    type: config.type,
    scope: config.scope.trim(),
    description: config.description.trim(),
    body: config.body.trim(),
    breakingChange: config.breakingChange.trim(),
    issueRef: config.issueRef.trim(),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validates a conventional commit message string
 */
export function validateCommitMessage(message: string, config?: CommitConfig): CommitValidation {
  const errors: string[] = [];

  if (!message.trim()) {
    return { isValid: false, errors: ["El mensaje está vacío"] };
  }

  const lines = message.split("\n");
  const header = lines[0] ?? "";

  // Check header format: type(scope)?: description
  const headerRegex = /^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\(.+\))?!?:\s.+$/;
  if (!headerRegex.test(header)) {
    errors.push("El encabezado no sigue el formato: type(scope): description");
  }

  // Check mandatory issue if config allows
  if (config?.requireIssue && !config.issueRef.trim()) {
    errors.push("Team Rule: Issue Reference (#123) is mandatory.");
  }

  // Check header length
  if (header.length > 72) {
    errors.push(`El encabezado tiene ${header.length} caracteres (máximo 72)`);
  }

  // Check for empty description
  const descMatch = header.match(/:\s*(.*)$/);
  if (descMatch && !descMatch[1]?.trim()) {
    errors.push("La descripción está vacía");
  }

  // Check second line is blank (if there are more lines)
  if (lines.length > 1 && lines[1]?.trim() !== "") {
    errors.push("La segunda línea debe estar vacía (separador entre encabezado y cuerpo)");
  }

  // Check description doesn't start with uppercase
  if (descMatch && descMatch[1]) {
    const desc = descMatch[1].trim();
    if (desc.length > 0 && desc[0] === desc[0]?.toUpperCase() && desc[0] !== desc[0]?.toLowerCase()) {
      errors.push("La descripción no debe empezar con mayúscula");
    }
  }

  // Check description doesn't end with period
  if (descMatch && descMatch[1]?.trim().endsWith(".")) {
    errors.push("La descripción no debe terminar con punto");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Parses a conventional commit message string
 */
export function parseCommitMessage(message: string): ParsedCommit | null {
  if (!message.trim()) {
    return null;
  }

  const lines = message.split("\n");
  const header = lines[0] ?? "";

  // Parse header
  const headerRegex = /^(\w+)(?:\(([^)]*)\))?(!)?\s*:\s*(.*)$/;
  const match = headerRegex.exec(header);

  if (!match) {
    return null;
  }

  const rawType = match[1] ?? "";
  const type = VALID_TYPES.has(rawType) ? (rawType as CommitType) : null;
  const scope = match[2] ?? "";
  const isBreakingMark = match[3] === "!";
  const description = match[4]?.trim() ?? "";

  // Parse body (skip blank line after header)
  let bodyStartIndex = 1;
  if (lines.length > 1 && lines[1]?.trim() === "") {
    bodyStartIndex = 2;
  }

  // Separate body from footer
  const bodyLines: string[] = [];
  const footerLines: string[] = [];
  let inFooter = false;

  for (let i = bodyStartIndex; i < lines.length; i++) {
    const line = lines[i] ?? "";

    if (!inFooter && (line.startsWith("BREAKING CHANGE:") || line.startsWith("Refs:") || /^[\w-]+:\s/.test(line) || /^[\w-]+\s#/.test(line))) {
      inFooter = true;
    }

    if (inFooter) {
      footerLines.push(line);
    } else {
      bodyLines.push(line);
    }
  }

  const body = bodyLines.join("\n").trim();

  // Extract breaking change
  let breakingChange = "";
  if (isBreakingMark) {
    const bcLine = footerLines.find((l) => l.startsWith("BREAKING CHANGE:"));
    breakingChange = bcLine ? bcLine.replace("BREAKING CHANGE:", "").trim() : "Yes";
  } else {
    const bcLine = footerLines.find((l) => l.startsWith("BREAKING CHANGE:"));
    if (bcLine) {
      breakingChange = bcLine.replace("BREAKING CHANGE:", "").trim();
    }
  }

  // Extract issue references
  const issueRefs: string[] = [];
  const refsLine = footerLines.find((l) => l.startsWith("Refs:"));
  if (refsLine) {
    const refs = refsLine.replace("Refs:", "").trim().split(/[,\s]+/).filter(Boolean);
    issueRefs.push(...refs);
  }
  // Also find inline #refs
  const inlineRefs = message.match(/#\d+/g);
  if (inlineRefs) {
    for (const ref of inlineRefs) {
      if (!issueRefs.includes(ref)) {
        issueRefs.push(ref);
      }
    }
  }

  return {
    type,
    scope,
    description,
    body,
    breakingChange,
    issueRefs,
    isBreaking: isBreakingMark || breakingChange.length > 0,
  };
}

/**
 * Gets info about a commit type
 */
export function getCommitTypeInfo(type: CommitType): CommitTypeInfo {
  const found = COMMIT_TYPES.find((ct) => ct.type === type);
  return found ?? { type, label: type, description: type, emoji: "📝" };
}

/**
 * Suggests scopes based on description keywords
 */
export function suggestScope(description: string): string[] {
  if (!description.trim()) return [];

  const lower = description.toLowerCase();
  const matches: { scope: string; count: number }[] = [];

  for (const [scope, keywords] of Object.entries(SCOPE_KEYWORDS)) {
    let count = 0;
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        count++;
      }
    }
    if (count > 0) {
      matches.push({ scope, count });
    }
  }

  return matches
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((m) => m.scope);
}

/**
 * Generates a CHANGELOG from a list of commit results
 */
export function generateChangelog(commits: CommitResult[]): string {
  if (commits.length === 0) return "";

  const sections: Record<string, string[]> = {
    feat: [],
    fix: [],
    perf: [],
    refactor: [],
    docs: [],
    chore: [],
  };

  commits.forEach((c) => {
    const type = c.type;
    const info = getCommitTypeInfo(type);
    const line = `- ${info.emoji} **${c.scope || "general"}**: ${c.description} ${c.issueRef ? `(${c.issueRef})` : ""}`;
    
    const existing = sections[type];
    if (existing) {
      existing.push(line);
    } else {
      if (!sections["other"]) sections["other"] = [];
      sections["other"]!.push(line);
    }
  });

  let changelog = `# CHANGELOG - ${new Date().toLocaleDateString()}\n\n`;

  const labels: Record<string, string> = {
    feat: "Features",
    fix: "Bug Fixes",
    perf: "Performance",
    refactor: "Refactors",
    docs: "Documentation",
    chore: "Maintenance",
    other: "Other Changes",
  };

  Object.entries(sections).forEach(([type, items]) => {
    if (items.length > 0) {
      changelog += `## ${labels[type] ?? type}\n${items.join("\n")}\n\n`;
    }
  });

  return changelog.trim();
}

/**
 * Generates a copyable `git commit -m "..."` shell command
 */
export function generateGitCommand(commit: CommitResult): string {
  const info = getCommitTypeInfo(commit.type);
  const scope = commit.scope ? `(${commit.scope})` : "";
  const hasBreaking = commit.breakingChange.length > 0;
  const breaking = hasBreaking ? "!" : "";
  const subject = `${info.emoji} ${commit.type}${scope}${breaking}: ${commit.description}`;

  const parts = [subject];
  if (commit.body) parts.push("", commit.body);
  if (hasBreaking) {
    parts.push("", `BREAKING CHANGE: ${commit.breakingChange}`);
  }
  if (commit.issueRef) parts.push("", commit.issueRef);

  const message = parts.join("\n");
  // Escape single quotes for shell safety
  const escaped = message.replace(/'/g, "'\\''");
  return `git commit -m '${escaped}'`;
}
