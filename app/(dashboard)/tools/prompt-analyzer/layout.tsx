import { generateToolMetadata } from "@/lib/metadata";

export const metadata = generateToolMetadata("prompt-analyzer");

export default function PromptAnalyzerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
