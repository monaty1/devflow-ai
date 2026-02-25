import type {
  ToolRecommendation,
  ToolContext,
  DetectedDataType,
} from "@/types/tool-recommendations";

/**
 * Detect data types present in a text string.
 */
export function detectDataTypes(text: string): DetectedDataType[] {
  if (!text.trim()) return [];
  const types: DetectedDataType[] = [];

  // JSON detection
  const trimmed = text.trim();
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      JSON.parse(trimmed);
      types.push("json");
    } catch {
      // not valid JSON
    }
  }

  // Code detection (common patterns)
  if (
    /\b(function|const|let|var|import|export|class|interface|type)\b/.test(text)
  ) {
    types.push("code");
  }

  // Prompt detection (natural language with instructions)
  if (
    text.length > 50 &&
    /\b(write|create|generate|explain|describe|analyze|help|please|can you)\b/i.test(
      text
    )
  ) {
    types.push("prompt");
  }

  // Base64 detection
  if (
    text.length > 20 &&
    /^[A-Za-z0-9+/=\s]+$/.test(trimmed) &&
    trimmed.replace(/\s/g, "").length % 4 === 0
  ) {
    types.push("base64");
  }

  // Cron expression
  if (/^[\d*,/-]+ [\d*,/-]+ [\d*,/-]+ [\d*,/-]+ [\d*,/-]+$/.test(trimmed)) {
    types.push("cron");
  }

  // UUID
  if (
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(text)
  ) {
    types.push("uuid");
  }

  // Regex
  if (/^\/.*\/[gimsuy]*$/.test(trimmed)) {
    types.push("regex");
  }

  // CSS/Tailwind classes
  if (/\b(bg-|text-|flex|grid|p-|m-|rounded|shadow|border)\b/.test(text)) {
    types.push("css-classes");
  }

  // Commit message pattern
  // eslint-disable-next-line security/detect-unsafe-regex -- static conventional commit detection
  if (/^(feat|fix|docs|style|refactor|test|chore|ci|perf)(\(.+\))?:/.test(trimmed)) {
    types.push("commit-message");
  }

  return types;
}

/**
 * Generate tool recommendations based on the current tool context.
 * Returns up to 3 most relevant recommendations.
 */
export function getRecommendations(context: ToolContext): ToolRecommendation[] {
  const recommendations: ToolRecommendation[] = [];
  const { toolId, input, output, detectedTypes } = context;

  // Rule: JSON formatter → Generate TS types
  if (
    toolId === "json-formatter" &&
    detectedTypes.includes("json")
  ) {
    recommendations.push({
      toolSlug: "dto-matic",
      toolName: "DTO-Matic",
      reason: "Generate TypeScript types from this JSON",
      dataToPass: output || input,
    });
    recommendations.push({
      toolSlug: "token-visualizer",
      toolName: "Token Visualizer",
      reason: "Count tokens for this JSON payload",
      dataToPass: output || input,
    });
  }

  // Rule: DTO-Matic → Format JSON, Review code
  if (toolId === "dto-matic" && output) {
    recommendations.push({
      toolSlug: "json-formatter",
      toolName: "JSON Formatter",
      reason: "Format the source JSON",
      dataToPass: input,
    });
    recommendations.push({
      toolSlug: "code-review",
      toolName: "Code Review",
      reason: "Review the generated code",
      dataToPass: output,
    });
  }

  // Rule: Prompt Analyzer → Token visualizer, Cost calculator
  if (toolId === "prompt-analyzer" && input) {
    recommendations.push({
      toolSlug: "token-visualizer",
      toolName: "Token Visualizer",
      reason: "See token breakdown of your prompt",
      dataToPass: input,
    });
    recommendations.push({
      toolSlug: "cost-calculator",
      toolName: "Cost Calculator",
      reason: "Estimate API cost for this prompt",
    });
  }

  // Rule: Code Review → Git Commit Generator, Variable Name Wizard
  if (toolId === "code-review" && detectedTypes.includes("code")) {
    recommendations.push({
      toolSlug: "git-commit-generator",
      toolName: "Git Commit Generator",
      reason: "Write a commit message for this reviewed code",
    });
    recommendations.push({
      toolSlug: "variable-name-wizard",
      toolName: "Variable Name Wizard",
      reason: "Improve variable names in your code",
    });
  }

  // Rule: Base64 → JSON formatter (if decoded looks like JSON)
  if (toolId === "base64" && output) {
    const outputTypes = detectDataTypes(output);
    if (outputTypes.includes("json")) {
      recommendations.push({
        toolSlug: "json-formatter",
        toolName: "JSON Formatter",
        reason: "Format the decoded JSON",
        dataToPass: output,
      });
    }
  }

  // Rule: Regex Humanizer → Prompt Analyzer, Variable Name Wizard
  if (toolId === "regex-humanizer" && input) {
    recommendations.push({
      toolSlug: "prompt-analyzer",
      toolName: "Prompt Analyzer",
      reason: "Use this regex pattern in a prompt",
      dataToPass: input,
    });
    recommendations.push({
      toolSlug: "variable-name-wizard",
      toolName: "Variable Name Wizard",
      reason: "Name a variable for this regex pattern",
      dataToPass: input,
    });
  }

  // Rule: Git Commit Generator → Code Review
  if (toolId === "git-commit-generator") {
    recommendations.push({
      toolSlug: "code-review",
      toolName: "Code Review",
      reason: "Review the code before committing",
    });
  }

  // Rule: Tailwind Sorter → Code Review
  if (toolId === "tailwind-sorter" && output) {
    recommendations.push({
      toolSlug: "code-review",
      toolName: "Code Review",
      reason: "Review components using these classes",
    });
  }

  // Rule: Token Visualizer → Cost Calculator
  if (toolId === "token-visualizer" && input) {
    recommendations.push({
      toolSlug: "cost-calculator",
      toolName: "Cost Calculator",
      reason: "Estimate the cost of this token count",
    });
    recommendations.push({
      toolSlug: "prompt-analyzer",
      toolName: "Prompt Analyzer",
      reason: "Analyze prompt quality and structure",
      dataToPass: input,
    });
  }

  // Rule: Context Manager → Token Visualizer
  if (toolId === "context-manager") {
    recommendations.push({
      toolSlug: "token-visualizer",
      toolName: "Token Visualizer",
      reason: "Visualize tokens for your context window",
    });
    recommendations.push({
      toolSlug: "cost-calculator",
      toolName: "Cost Calculator",
      reason: "Estimate API costs for this context",
    });
  }

  // Rule: UUID → Variable Name Wizard
  if (toolId === "uuid-generator") {
    recommendations.push({
      toolSlug: "variable-name-wizard",
      toolName: "Variable Name Wizard",
      reason: "Name a variable for this identifier",
    });
  }

  // Rule: Cron Builder → Git Commit Generator
  if (toolId === "cron-builder") {
    recommendations.push({
      toolSlug: "git-commit-generator",
      toolName: "Git Commit Generator",
      reason: "Commit your cron job configuration",
    });
  }

  // Rule: HTTP Status Finder → Code Review
  if (toolId === "http-status-finder") {
    recommendations.push({
      toolSlug: "code-review",
      toolName: "Code Review",
      reason: "Review API error handling code",
    });
  }

  // Rule: Cost Calculator → Context Manager
  if (toolId === "cost-calculator") {
    recommendations.push({
      toolSlug: "context-manager",
      toolName: "Context Manager",
      reason: "Optimize your context window budget",
    });
  }

  // Deduplicate by toolSlug and exclude current tool
  const seen = new Set<string>();
  return recommendations
    .filter((r) => {
      if (r.toolSlug === toolId || seen.has(r.toolSlug)) return false;
      seen.add(r.toolSlug);
      return true;
    })
    .slice(0, 3);
}
