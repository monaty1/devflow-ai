import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env["NEXT_PUBLIC_SENTRY_DSN"] ?? "",

  // Tag releases and environments for filtering in Sentry dashboard
  release: `devflow-ai@${process.env["NEXT_PUBLIC_APP_VERSION"] ?? "0.1.0"}`,
  environment: process.env["NEXT_PUBLIC_SENTRY_ENVIRONMENT"] ?? process.env.NODE_ENV,

  // Performance Monitoring — sample 10% of transactions in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Session Replay — capture 10% of sessions, 100% on error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Only initialize if DSN is configured
  enabled: !!process.env["NEXT_PUBLIC_SENTRY_DSN"],

  // Filter out noisy errors
  ignoreErrors: [
    "ResizeObserver loop",
    "Non-Error promise rejection",
  ],
});
