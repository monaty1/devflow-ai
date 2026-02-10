import { generateToolMetadata } from "@/lib/metadata";

export const metadata = generateToolMetadata("code-review");

export default function CodeReviewLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
