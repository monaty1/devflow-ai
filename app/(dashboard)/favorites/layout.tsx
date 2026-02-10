import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favorites",
  description:
    "Your favorite DevFlowAI developer tools. Quick access to the tools you use most.",
  alternates: {
    canonical: "https://devflowai.dev/favorites",
  },
};

export default function FavoritesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
