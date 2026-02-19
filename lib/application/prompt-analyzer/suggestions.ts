import type { PromptDimension, PromptIssue, SecurityFlag } from "@/types/prompt-analyzer";

const ANATOMY_SUGGESTIONS: Record<string, string> = {
  role: 'Define a professional role: e.g., "Act as a senior backend developer specialized in REST APIs"',
  task: 'Be specific about your objective: e.g., "Create a REST API endpoint that validates user input and returns a structured JSON response"',
  context: 'Provide background context: technology stack, project type, environment, and target audience',
  steps: 'Break down the task into steps: e.g., "First, analyze the requirements. Then, implement the solution. Finally, write tests."',
  format: 'Specify the expected output format: e.g., "Return as JSON", "Format as a markdown table", "Provide as a code block"',
  constraints: 'Add constraints and restrictions: e.g., "Avoid deprecated APIs", "Maximum 200 lines", "Follow SOLID principles"',
  clarification: 'Add a clarification clause: e.g., "If anything is unclear, ask before proceeding"',
};

const WEAK_THRESHOLD = 30;

export function generateSuggestions(
  dimensions: PromptDimension[],
  issues: PromptIssue[],
  securityFlags: SecurityFlag[],
): string[] {
  const suggestions: string[] = [];

  // 1. Anatomy-based suggestions (primary)
  for (const dim of dimensions) {
    if (dim.score < WEAK_THRESHOLD) {
      const tip = ANATOMY_SUGGESTIONS[dim.id];
      if (tip) {
        suggestions.push(tip);
      }
    }
  }

  // 2. Quality issue suggestions (secondary)
  const issueTypes = new Set(issues.map((i) => i.type));

  if (issueTypes.has("vague_instruction")) {
    suggestions.push(
      "Add more specific details about what you want to accomplish",
    );
  }
  if (issueTypes.has("missing_context") && !suggestions.some(s => s.includes("context"))) {
    suggestions.push(
      "Provide background information or context for better results",
    );
  }
  if (issueTypes.has("no_output_format") && !suggestions.some(s => s.includes("output format"))) {
    suggestions.push(
      'Specify the desired output format (e.g., "Respond in JSON format")',
    );
  }
  if (issueTypes.has("missing_role") && !suggestions.some(s => s.includes("role"))) {
    suggestions.push(
      'Define a role for the AI (e.g., "Act as a senior developer...")',
    );
  }
  if (issueTypes.has("too_long")) {
    suggestions.push(
      "Consider breaking this into multiple smaller, focused prompts",
    );
  }
  if (issueTypes.has("redundant")) {
    suggestions.push("Remove repetitive content to make the prompt more concise");
  }
  if (issueTypes.has("vague_terms")) {
    suggestions.push(
      'Replace vague terms like "something" or "stuff" with specific nouns',
    );
  }
  if (issueTypes.has("no_constraints") && !suggestions.some(s => s.includes("constraints"))) {
    suggestions.push(
      'Add constraints to narrow the output (e.g., "Avoid using deprecated APIs")',
    );
  }
  if (issueTypes.has("no_success_criteria")) {
    suggestions.push(
      'Define success criteria (e.g., "The result should handle edge cases")',
    );
  }
  if (issueTypes.has("no_audience")) {
    suggestions.push(
      'Specify the target audience (e.g., "for beginner developers")',
    );
  }
  if (issueTypes.has("missing_examples")) {
    suggestions.push(
      'Add examples of the expected input and output (Few-Shot prompting)',
    );
  }
  if (issueTypes.has("no_chain_of_thought")) {
    suggestions.push(
      'Include instructions for the AI to "think step-by-step" or "reason through the task"',
    );
  }
  if (issueTypes.has("missing_delimiters")) {
    suggestions.push(
      'Use clear delimiters like ### or XML tags (e.g., <context>) to separate different parts of the prompt',
    );
  }
  if (issueTypes.has("poor_structure")) {
    suggestions.push(
      'Improve prompt structure using paragraphs, headers, and bullet points',
    );
  }
  if (issueTypes.has("virtualization_risk")) {
    suggestions.push(
      'Add strict constraints (e.g., "Stay in character only") when using virtualization or simulation',
    );
  }
  if (issueTypes.has("payload_splitting_risk")) {
    suggestions.push(
      'Check for suspicious spacing or encoding that might be misinterpreted as an injection attempt',
    );
  }

  // 3. Security-related suggestions
  if (securityFlags.length > 0) {
    suggestions.push(
      "Review and remove any content that could be interpreted as prompt injection",
    );
  }

  // 4. Positive feedback if nothing wrong
  if (suggestions.length === 0) {
    suggestions.push("Your prompt looks good! Consider adding examples for even better results.");
  }

  return suggestions;
}
