import { generateToolMetadata } from "@/lib/metadata";

export const metadata = generateToolMetadata("dto-matic");

export default function DtoMaticLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
