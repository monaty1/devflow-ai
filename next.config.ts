import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), midi=(), magnetometer=(), gyroscope=(), accelerometer=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "worker-src 'self'",
      "connect-src 'self' https://api.github.com https://*.ingest.sentry.io https://raw.githubusercontent.com https://generativelanguage.googleapis.com https://api.groq.com https://openrouter.ai https://text.pollinations.ai",
      "frame-src https://giscus.app",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; ") + ";",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  reactCompiler: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    viewTransition: true,
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@heroui/react",
      "@heroui/styles",
      "gsap",
      "zod",
      "react-hook-form",
      "recharts",
    ],
  } as NextConfig["experimental"] & { viewTransition: boolean },
  async headers() {
    // CSP blocks Turbopack dev scripts — only apply in production
    const headers = process.env.NODE_ENV === "production"
      ? securityHeaders
      : securityHeaders.filter((h) => h.key !== "Content-Security-Policy");

    return [
      {
        source: "/(.*)",
        headers,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Suppress source map upload logs in CI
  silent: true,

  // Upload source maps for better stack traces
  widenClientFileUpload: true,

  // Hide source maps from the client
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Opt out of Sentry telemetry
  telemetry: false,
});
