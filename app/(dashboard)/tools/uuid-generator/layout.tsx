import { generateToolMetadata } from "@/lib/metadata";

export const metadata = generateToolMetadata("uuid-generator");

export default function UuidGeneratorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
