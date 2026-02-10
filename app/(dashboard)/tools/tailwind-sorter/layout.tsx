import { generateToolMetadata } from "@/lib/metadata";

export const metadata = generateToolMetadata("tailwind-sorter");

export default function TailwindSorterLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
