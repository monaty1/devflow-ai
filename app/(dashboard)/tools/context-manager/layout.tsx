import { generateToolMetadata } from "@/lib/metadata";

export const metadata = generateToolMetadata("context-manager");

export default function ContextManagerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
