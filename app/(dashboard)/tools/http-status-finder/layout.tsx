import { generateToolMetadata } from "@/lib/metadata";

export const metadata = generateToolMetadata("http-status-finder");

export default function HttpStatusFinderLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
