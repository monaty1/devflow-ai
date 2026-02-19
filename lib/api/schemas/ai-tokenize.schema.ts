import { z } from "zod";

export const aiTokenizeSchema = z.object({
  text: z
    .string()
    .min(1, "Text is required")
    .max(100_000, "Text must be under 100,000 characters"),
  model: z.enum(["gpt-4o", "gpt-4", "gpt-3.5-turbo", "cl100k_base", "o200k_base"]),
});

export type AITokenizeInput = z.infer<typeof aiTokenizeSchema>;
