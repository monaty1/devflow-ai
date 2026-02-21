# Deployment Guide

DevFlow AI is designed to deploy on **Vercel** with zero configuration for the frontend. AI features require environment variables.

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/albertoguinda/devflow-ai)

## Vercel Setup

### Build Settings

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm ci` |
| Node.js Version | 20.x |

### Environment Variables

#### Required for AI Features

Without these, the 15 browser tools work fully — only AI-powered features (code review, suggestions, refinement, tokenization) are disabled.

| Variable | Provider | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Google | Gemini 2.0 Flash (primary, fastest) |
| `GROQ_API_KEY` | Groq | Llama 3.3 70B (fallback 1) |
| `OPENROUTER_API_KEY` | OpenRouter | Multi-model router (fallback 2) |

**Provider chain priority**: Gemini → Groq → OpenRouter → Pollinations (free, no key needed). At least one key is recommended; Pollinations is always available as a free fallback.

#### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `RATE_LIMIT_RPM` | `10` | Requests per minute (free users). BYOK users get 5x. |
| `RATE_LIMIT_DAILY_TOKENS` | `500000` | Daily token budget (free users). BYOK users get 5x. |
| `NEXT_PUBLIC_SENTRY_DSN` | — | Sentry DSN for error tracking. Omit to disable. |
| `SENTRY_AUTH_TOKEN` | — | Sentry auth token for source map uploads during build. |
| `NEXT_PUBLIC_APP_URL` | — | Public URL (used in meta tags / OpenGraph). |

All server-side variables are validated at startup via Zod (`infrastructure/config/env.ts`). Invalid values fall back to defaults — the app never crashes on misconfiguration.

### BYOK (Bring Your Own Key)

Users can bring their own API keys without server configuration. Keys are sent per-request via headers:

- `X-DevFlow-API-Key`: The user's API key
- `X-DevFlow-Provider`: Provider name (`gemini`, `groq`, `openrouter`)

BYOK users automatically receive 5x rate limits (50 RPM, 2.5M daily tokens).

## Security Headers

Production builds enforce security headers via `next.config.ts`:

| Header | Value |
|--------|-------|
| Content-Security-Policy | Restrictive CSP allowing only AI provider domains |
| Strict-Transport-Security | HSTS with 2-year max-age, preload |
| X-Content-Type-Options | nosniff |
| X-Frame-Options | DENY |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | Denies camera, mic, geo, payment, USB, bluetooth |

CSP `connect-src` whitelist: `generativelanguage.googleapis.com`, `api.groq.com`, `openrouter.ai`, `text.pollinations.ai`, `*.ingest.sentry.io`, `api.github.com`, `raw.githubusercontent.com`.

> **Note**: CSP is skipped in development (`NODE_ENV !== 'production'`) for Turbopack compatibility.

## Rate Limiter

The in-memory, IP-based rate limiter (`infrastructure/services/rate-limiter.ts`) tracks:

- **RPM** (requests per minute): 10 free / 50 BYOK
- **Daily tokens**: 500K free / 2.5M BYOK

Limits reset automatically. The limiter is a singleton — resets on Vercel cold starts (by design: stateless, no Redis needed).

To customize limits, set `RATE_LIMIT_RPM` and `RATE_LIMIT_DAILY_TOKENS` env vars.

## Health Check

`GET /api/health` returns:

```json
{
  "status": "healthy",
  "timestamp": "2026-02-21T...",
  "ai": { "configured": true, "providers": ["gemini", "groq", "openrouter", "pollinations"] },
  "version": "4.8.0"
}
```

Use this for uptime monitoring (e.g., UptimeRobot, Vercel Cron).

## CI/CD Pipeline

The GitHub Actions pipeline runs automatically:

| Job | Trigger | Description |
|-----|---------|-------------|
| quality | push/PR | Lint + typecheck + coverage |
| security | push/PR | npm audit + lockfile-lint |
| dependency-review | PR only | Block moderate+ vulnerabilities |
| build | after quality+security | Production build + SBOM |
| e2e | after build | Playwright tests (20 specs) |
| a11y | after build | axe-core WCAG AAA audit |
| codeql | push/PR + weekly | CodeQL SAST (security-extended) |
| semgrep | push/PR | Semgrep OWASP Top 10 |
| lighthouse | PR only | Lighthouse CI performance audit |

Release workflow (`.github/workflows/release.yml`): Push a `v*` tag or trigger manually to create a GitHub Release with auto-generated notes and SBOM attachment.

## Troubleshooting

**AI features not working?**
- Check `/api/health` response — `ai.configured` should be `true`
- Verify at least one provider key is set in Vercel env vars
- Pollinations (free fallback) requires no key — if even that fails, check CSP or network

**Build failing on Vercel?**
- Ensure Node.js 20.x is selected in Project Settings
- Check that `npm ci` succeeds (lockfile must be in sync with package.json)

**Sentry not reporting?**
- Set both `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_AUTH_TOKEN`
- Source maps are deleted after upload (`deleteSourcemapsAfterUpload: true`)
