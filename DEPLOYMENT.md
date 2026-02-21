# Deployment Guide

## Vercel (Recommended)

DevFlow AI is optimized for Vercel deployment.

### Setup

1. Import the repository at [vercel.com/new](https://vercel.com/new)
2. Framework preset: **Next.js** (auto-detected)
3. Build command: `npm run build`
4. Output directory: `.next` (default)
5. Node.js version: **20.x**

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_APP_URL` | Yes | — | Production URL (e.g., `https://devflowai.vercel.app`) |
| `NEXT_PUBLIC_SENTRY_DSN` | No | — | Sentry DSN for error tracking |
| `GEMINI_API_KEY` | No | — | Google Gemini 2.0 Flash API key |
| `GROQ_API_KEY` | No | — | Groq API key |
| `OPENROUTER_API_KEY` | No | — | OpenRouter API key |
| `RATE_LIMIT_RPM` | No | `10` | Requests per minute (free tier) |
| `RATE_LIMIT_DAILY_TOKENS` | No | `500000` | Daily token budget |

**AI is optional.** If no provider keys are set, AI features gracefully degrade — Pollinations (free, no key) is always available as fallback. All 15 developer tools work fully offline without any API keys.

### Build Settings

```
Framework: Next.js
Build Command: npm run build
Install Command: npm ci
Output Directory: .next
```

### Production Features

- **React Compiler** enabled (`reactCompiler: true`)
- **View Transitions API** enabled (`experimental.viewTransition: true`)
- **Console stripping** — all `console.*` calls removed in production
- **Image optimization** — AVIF + WebP formats
- **CSP headers** — enforced in production only (skipped in dev for Turbopack)
- **Sentry** — sourcemaps uploaded then deleted; only active with DSN

## Self-Hosting

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

**Note**: Add `output: "standalone"` to `next.config.ts` for Docker deployments.

### Environment

Set environment variables via `.env.local` (never commit this file):

```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
GEMINI_API_KEY=your-key-here        # Optional
GROQ_API_KEY=your-key-here          # Optional
OPENROUTER_API_KEY=your-key-here    # Optional
RATE_LIMIT_RPM=10                   # Optional, default 10
RATE_LIMIT_DAILY_TOKENS=500000      # Optional, default 500000
```

### Rate Limiter

The rate limiter is **in-memory** and **IP-based**. It resets when the server restarts.

- Free users: 10 RPM, 500K daily tokens
- BYOK users: 50 RPM, 2.5M daily tokens (5x multiplier)
- Configure via `RATE_LIMIT_RPM` and `RATE_LIMIT_DAILY_TOKENS` env vars

For multi-instance deployments, consider adding Redis-backed rate limiting.
