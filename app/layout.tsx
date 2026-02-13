import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { ErrorBoundary } from "@/components/shared";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const SITE_URL = "https://devflowai.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DevFlowAI - Free & Open Source Developer Utilities",
    template: "%s | DevFlowAI",
  },
  description:
    "Free, open-source developer toolkit for AI development. Analyze prompts, review code, calculate API costs, visualize tokens, and manage context windows. Built by developers, for developers.",
  keywords: [
    "AI",
    "Developer Tools",
    "Open Source",
    "Prompt Engineering",
    "Code Review",
    "API Cost Calculator",
    "Token Visualizer",
    "Context Manager",
    "TypeScript",
    "React",
    "Next.js",
    "LLM",
    "ChatGPT",
    "Claude",
    "Free Tools",
  ],
  authors: [{ name: "DevFlowAI Community" }],
  creator: "DevFlowAI",
  publisher: "DevFlowAI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "DevFlowAI",
    title: "DevFlowAI - Free & Open Source Developer Utilities",
    description:
      "Free, open-source developer toolkit for AI development. Analyze prompts, review code, calculate API costs, and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevFlowAI - Free & Open Source Developer Utilities",
    description:
      "Free, open-source developer toolkit for AI development. Built by developers, for developers.",
    creator: "@devflowai",
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "Developer Tools",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "DevFlowAI",
  url: SITE_URL,
  description:
    "Free & open-source developer toolkit for AI development. Analyze prompts, review code, calculate API costs, and more.",
  creator: {
    "@type": "Organization",
    name: "DevFlowAI Community",
  },
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "DevFlowAI",
  url: SITE_URL,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="philosophy" content="Para vosotros, developers" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>
          <ErrorBoundary>{children}</ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
