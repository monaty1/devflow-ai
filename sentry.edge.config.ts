import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env["NEXT_PUBLIC_SENTRY_DSN"] ?? "",

  release: `devflow-ai@${process.env["NEXT_PUBLIC_APP_VERSION"] ?? "0.1.0"}`,
  environment: process.env["NEXT_PUBLIC_SENTRY_ENVIRONMENT"] ?? process.env.NODE_ENV,

  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  enabled: !!process.env["NEXT_PUBLIC_SENTRY_DSN"],
});
