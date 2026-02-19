# Sentry Setup Guide

DevFlow AI ships with optional [Sentry](https://sentry.io) integration for error monitoring, performance tracing, and session replay. The app works perfectly without it — Sentry only activates when a DSN is configured.

## Quick Start

### 1. Create a Sentry project

1. Go to [sentry.io](https://sentry.io) and sign up (free tier works).
2. Create a new project: **Platform → Next.js**.
3. Copy the **DSN** from the project settings (looks like `https://xxx@xxx.ingest.sentry.io/xxx`).

### 2. Set environment variables

Add to `.env.local` (local) or your hosting provider (Vercel, etc.):

```env
# Required — enables Sentry
NEXT_PUBLIC_SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/your-project-id

# Required for source map uploads during build
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=your-org
SENTRY_PROJECT=devflow-ai

# Optional — tag releases and environments
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
NEXT_PUBLIC_APP_VERSION=0.1.0
```

### 3. Get an auth token

1. Go to [sentry.io/settings/auth-tokens](https://sentry.io/settings/auth-tokens/).
2. Create a token with `project:releases` and `org:read` scopes.
3. Set it as `SENTRY_AUTH_TOKEN`.

### 4. Verify

Start the app and trigger an error (e.g., navigate to a broken page). Check your Sentry dashboard — the error should appear within seconds.

## Architecture

| File | Purpose |
|------|---------|
| `sentry.client.config.ts` | Browser SDK — errors, performance, session replay |
| `sentry.server.config.ts` | Node.js runtime — API route & SSR errors |
| `sentry.edge.config.ts` | Edge runtime — middleware errors |
| `instrumentation.ts` | Next.js hook that loads server/edge configs |
| `next.config.ts` | Wraps config with `withSentryConfig` for source maps |
| `components/shared/error-boundary.tsx` | React error boundary with `Sentry.captureException` |
| `app/error.tsx` | Root error page with `Sentry.captureException` |

## Configuration Details

- **Performance**: 10% sample rate in production, 100% in development
- **Session Replay**: 10% of sessions, 100% on error (client only)
- **Filtered errors**: `ResizeObserver loop`, `Non-Error promise rejection`
- **Release tracking**: Tagged as `devflow-ai@{version}` with environment label
- **Disabled by default**: SDK is a no-op when `NEXT_PUBLIC_SENTRY_DSN` is empty

## Vercel Deployment

In Vercel dashboard → Project Settings → Environment Variables, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Your DSN | Production, Preview |
| `SENTRY_AUTH_TOKEN` | Your auth token | Production, Preview |
| `SENTRY_ORG` | Your org slug | Production, Preview |
| `SENTRY_PROJECT` | `devflow-ai` | Production, Preview |
| `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | `production` | Production |
| `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | `preview` | Preview |

Source maps are uploaded automatically during `next build` when `SENTRY_AUTH_TOKEN` is set.
