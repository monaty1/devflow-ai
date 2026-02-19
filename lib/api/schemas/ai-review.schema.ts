import { z } from "zod";

export const aiReviewSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(50_000, "Code must be under 50,000 characters"),
  language: z.enum([
    "typescript",
    "javascript",
    "python",
    "go",
    "rust",
    "java",
    "php",
    "csharp",
  ]),
});

export type AIReviewInput = z.infer<typeof aiReviewSchema>;
