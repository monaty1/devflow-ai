import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your DevFlowAI dashboard. Access all developer tools, view recent activity, and manage your favorites.",
  alternates: {
    canonical: "https://devflowai.dev/dashboard",
  },
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
