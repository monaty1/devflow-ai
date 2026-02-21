# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 3.x     | Yes       |
| < 3.0   | No        |

## Architecture & Security Model

DevFlow AI is a **local-first** developer toolkit. Key security properties:

- **No database** — all user data (tool history, preferences, favorites) is stored in the browser via `localStorage` with `devflow-*` prefix keys
- **No authentication** — the app has no user accounts, sessions, or cookies
- **API keys in-memory only** — BYOK (Bring Your Own Key) API keys are sent per-request via `X-DevFlow-API-Key` header and never persisted server-side
- **Server-side env vars** — provider keys (`GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`) are validated with Zod and cached in-memory; never exposed to the client

## Security Controls

### Application
- **Content Security Policy (CSP)** — enforced in production via `next.config.ts` security headers; allows AI provider API domains only
- **Rate limiting** — in-memory, IP-based rate limiter (10 RPM free, 50 RPM BYOK); configurable via `RATE_LIMIT_RPM` and `RATE_LIMIT_DAILY_TOKENS` env vars
- **Input validation** — Zod schemas validate all API route inputs; `eslint-plugin-security` flags risky patterns
- **No `eval()` or `dangerouslySetInnerHTML`** — static analysis enforced

### CI/CD
- **CodeQL SAST** — `.github/workflows/codeql.yml` (JavaScript/TypeScript, `security-extended` query suite, weekly + push/PR)
- **Semgrep SAST** — `.github/workflows/semgrep.yml` (OWASP Top 10, React, Next.js rulesets, uploads SARIF to GitHub Security tab)
- **npm audit** — `npm audit --audit-level=high` on every push
- **Lockfile integrity** — `lockfile-lint` validates HTTPS-only registry and npm host
- **Dependency review** — `actions/dependency-review-action` blocks PRs introducing moderate+ severity vulnerabilities
- **SBOM generation** — CycloneDX SBOM generated on every build and attached to releases
- **SHA-pinned actions** — all GitHub Actions use full commit SHA, not tags
- **StepSecurity harden-runner** — applied to every CI job

### Dependencies
- **Renovate** — automated dependency updates (`renovate.json`)
- **`eslint-plugin-security`** — configured in ESLint flat config

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Email**: Open a private security advisory via GitHub's [Security Advisories](https://github.com/albertoguinda/devflow-ai/security/advisories) tab
2. **Do NOT** open a public issue for security vulnerabilities
3. Include: affected version, reproduction steps, and potential impact
4. You can expect an initial response within 48 hours
5. We will coordinate disclosure timing with you

## Scope

The following are **in scope** for security reports:
- XSS, CSRF, or injection vulnerabilities in the web application
- API route bypasses or rate limiter circumvention
- CSP bypasses
- Dependency vulnerabilities with a clear exploit path

The following are **out of scope**:
- Issues requiring physical access to the user's machine
- Browser localStorage data (by design, local-first)
- Rate limiting exhaustion via distributed IPs (by design, in-memory)
- Vulnerabilities in third-party AI provider APIs
