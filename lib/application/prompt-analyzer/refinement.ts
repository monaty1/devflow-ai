import type { PromptIssue } from "@/types/prompt-analyzer";

export function refinePrompt(prompt: string, issues: PromptIssue[]): string {
  const issueTypes = new Set(issues.map((i) => i.type));
  const lowerPrompt = prompt.toLowerCase();
  
  // 1. Identify Role
  let role = "an expert assistant";
  if (/\b(code|react|nextjs|typescript|javascript|python|rust|golang|java|c\+\+|coding|program)\b/i.test(lowerPrompt)) {
    role = "a Senior Software Engineer and Architect";
  } else if (/\b(write|article|blog|essay|copy|content|story)\b/i.test(lowerPrompt)) {
    role = "a Professional Content Writer and Editor";
  } else if (/\b(market|sell|business|strategy|startup|product)\b/i.test(lowerPrompt)) {
    role = "a Strategic Business Consultant";
  } else if (/\b(design|ui|ux|layout|css|tailwind|style|figma)\b/i.test(lowerPrompt)) {
    role = "a Senior UI/UX Designer";
  }

  // 2. Build Structural Components (XML Style like Anthropic)
  let refined = `<role>
Act as ${role}. Your goal is to provide a high-quality, professional, and accurate response.
</role>

<context>
${issueTypes.has("missing_context") ? "[Provide detailed background or context here to improve results]" : "The user is seeking assistance with the following request."}
</context>

<task>
${prompt}
</task>

<guidelines>
${issueTypes.has("no_chain_of_thought") ? "- Reason through the task step-by-step to ensure logical consistency.\n" : ""}${issueTypes.has("no_constraints") ? "- Avoid filler text and maintain a professional, direct tone.\n" : ""}${issueTypes.has("no_success_criteria") ? "- Ensure the final output is comprehensive and directly addresses the core objective.\n" : ""}${issueTypes.has("missing_examples") ? "- If possible, provide illustrative examples to clarify your response.\n" : ""}- Follow all instructions strictly and maintain the specified persona throughout.
</guidelines>`;

  // 3. Output Format
  if (issueTypes.has("no_output_format")) {
    refined += `\n\n<output_format>
Please provide the response in a structured and well-formatted manner using Markdown. Use clear headings, lists, or tables where appropriate to maximize readability.
</output_format>`;
  }

  // 4. Parameter Hints
  let params = "";
  if (/\b(code|math|calculate|logic|reason|algorithm)\b/i.test(lowerPrompt)) {
    params = "\n\n<!-- Recommended Parameters: Temperature: 0.0, Top-P: 1.0 -->";
  } else if (/\b(creative|story|poem|brainstorm|idea)\b/i.test(lowerPrompt)) {
    params = "\n\n<!-- Recommended Parameters: Temperature: 0.8, Top-P: 0.9 -->";
  }

  return `${refined}${params}`.trim();
}
