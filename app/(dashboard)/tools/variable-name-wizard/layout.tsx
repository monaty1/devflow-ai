import { generateToolMetadata } from "@/lib/metadata";

export const metadata = generateToolMetadata("variable-name-wizard");

export default function VariableNameWizardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
