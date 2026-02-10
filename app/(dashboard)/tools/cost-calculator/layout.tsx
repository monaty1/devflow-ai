import { generateToolMetadata } from "@/lib/metadata";

export const metadata = generateToolMetadata("cost-calculator");

export default function CostCalculatorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
