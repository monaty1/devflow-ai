import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "History",
  description:
    "View your DevFlowAI usage history. Revisit previous tool results and analyses.",
  alternates: {
    canonical: "https://devflowai.dev/history",
  },
};

export default function HistoryLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
