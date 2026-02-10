import { generateToolMetadata } from "@/lib/metadata";

export const metadata = generateToolMetadata("token-visualizer");

export default function TokenVisualizerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
