import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer Tools",
  description:
    "Browse all free developer tools: JSON formatter, Base64 encoder, UUID generator, regex tester, git commit generator, and more.",
  alternates: {
    canonical: "https://devflowai.dev/tools",
  },
};

export default function ToolsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
