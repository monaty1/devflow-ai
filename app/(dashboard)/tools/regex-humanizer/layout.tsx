import { generateToolMetadata } from "@/lib/metadata";

export const metadata = generateToolMetadata("regex-humanizer");

export default function RegexHumanizerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
