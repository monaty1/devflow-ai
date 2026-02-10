import { generateToolMetadata } from "@/lib/metadata";

export const metadata = generateToolMetadata("git-commit-generator");

export default function GitCommitGeneratorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
