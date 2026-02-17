import type { PromptIssue, SecurityFlag } from "@/types/prompt-analyzer";

export function generateSuggestions(
  issues: PromptIssue[],
  securityFlags: SecurityFlag[],
): string[] {
  const suggestions: string[] = [];
  const issueTypes = new Set(issues.map((i) => i.type));

  if (issueTypes.has("vague_instruction")) {
    suggestions.push(
      "Add more specific details about what you want to accomplish",
    );
  }
  if (issueTypes.has("missing_context")) {
    suggestions.push(
      "Provide background information or context for better results",
    );
  }
  if (issueTypes.has("no_output_format")) {
    suggestions.push(
      'Specify the desired output format (e.g., "Respond in JSON format")',
    );
  }
  if (issueTypes.has("missing_role")) {
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
  if (issueTypes.has("no_constraints")) {
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

  // Security-related suggestions
  if (securityFlags.length > 0) {
    suggestions.push(
      "Review and remove any content that could be interpreted as prompt injection",
    );
  }

  // General suggestions if score is low
  if (suggestions.length === 0) {
    suggestions.push("Your prompt looks good! Consider adding examples for even better results.");
  }

  return suggestions;
}
