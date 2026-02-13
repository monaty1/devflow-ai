import { Navbar } from "@/components/layout/navbar";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">{children}</main>
    </>
  );
}
