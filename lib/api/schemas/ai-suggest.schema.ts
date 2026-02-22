import { z } from "zod";

export const aiSuggestSchema = z.object({
  context: z
    .string()
    .min(1, "Context is required")
    .max(5_000, "Context must be under 5,000 characters"),
  type: z
    .enum([
      "variable",
      "function",
      "class",
      "constant",
      "interface",
      "type",
      "enum",
      "component",
      "hook",
      "file",
      "css-class",
    ])
    .optional(),
  language: z
    .enum([
      "typescript",
      "javascript",
      "python",
      "go",
      "rust",
      "java",
      "php",
      "csharp",
    ])
    .optional(),
  mode: z.enum(["variable-name", "regex-generate", "commit-message", "cron-generate", "json-explain", "base64-explain", "dto-optimize", "http-explain", "tailwind-optimize", "cost-advise"]),
});

export type AISuggestInput = z.infer<typeof aiSuggestSchema>;
