# DevFlow AI - Architecture

## Overview

DevFlow AI is a 15-tool developer toolkit built with **Next.js 16**, **React 19**, **TypeScript 5 (strict)**, **Tailwind CSS v4**, and **HeroUI v3 beta**. Every tool works locally in the browser without any server dependencies. AI features are optional enhancements powered by server-side Route Handlers.

## Layered Architecture

```
                    +-----------------------------+
                    |     Presentation Layer       |
                    |  app/(dashboard)/tools/...   |
                    +--------+--------------------+
                             |
                    +--------v--------------------+
                    |      Adapter Layer           |
                    |  hooks/use-<tool>.ts          |
                    |  hooks/use-ai-<tool>.ts       |
                    +--------+--------------------+
                             |
              +--------------+--------------+
              |                             |
    +---------v----------+     +------------v-----------+
    | Application Layer  |     |    API Layer (Server)   |
    | lib/application/   |     |  app/api/ai/*/route.ts  |
    +--------------------+     +------------+-----------+
                                            |
                               +------------v-----------+
                               | Infrastructure Layer    |
                               | infrastructure/         |
                               | (providers, rate limiter)|
                               +-------------------------+
              |
    +---------v----------+
    |   Domain Layer     |
    |   types/<tool>.ts  |
    +--------------------+
```

**Dependency rule:** Each layer can only depend on the layer below it. Never upward.

## 5-Layer Pattern (per tool)

Every tool follows this exact structure:

| # | File | Responsibility |
|---|------|----------------|
| 1 | `types/<tool>.ts` | Interfaces, types, constants. No logic. |
| 2 | `lib/application/<tool>.ts` | Pure business logic. No React, no side effects. |
| 3 | `hooks/use-<tool>.ts` | React hook with state, localStorage persistence. |
| 4 | `app/(dashboard)/tools/<slug>/page.tsx` | UI page component. Only rendering. |
| 5 | `tests/unit/application/<tool>.test.ts` | Unit tests for the pure logic layer. |

## AI Layer (Optional, per tool)

Tools that benefit from AI get an additional server-side layer:

```
lib/api/schemas/<tool>.schema.ts    -> Zod request validation
lib/api/prompts/index.ts            -> System prompts (server-only)
app/api/ai/<tool>/route.ts          -> Route Handler (POST)
hooks/use-ai-<tool>.ts              -> Client hook (useSWRMutation)
```

### Hybrid AI Pattern

When a user triggers an action:

1. **Local analysis runs first** (instant, pure logic from `lib/application/`)
2. **AI request fires in parallel** (1-3s, via server-side Route Handler)
3. **Local results display immediately**
4. **AI results appear alongside** when they arrive (distinct violet-themed section)
5. **If AI fails**, a toast notification shows and local results remain

This ensures the tool is always responsive and functional, even without AI.

### AI Provider Architecture

```
                  +------------------+
                  |  Route Handler   |
                  | app/api/ai/...   |
                  +--------+---------+
                           |
                  +--------v---------+
                  | AIProviderFactory |
                  +--------+---------+
                           |
           +---------------+---------------+
           |                               |
  +--------v---------+          +----------v--------+
  |  GeminiClient    |          |    GroqClient      |
  | (primary, free)  |          |   (fallback)       |
  +------------------+          +-------------------+
```

- **AIProviderPort** interface decouples all logic from specific SDKs
- **Gemini 2.0 Flash** (free tier: 15 RPM, 1.5M tokens/day)
- **Groq Llama 3.1 70B** (fallback via raw fetch)
- **BYOK** (Bring Your Own Key): Users can provide their own API key, stored in memory only (Zustand, no persist)

### Rate Limiting

IP-based, in-memory rate limiter with two buckets:

| Tier | RPM | Daily Tokens |
|------|-----|--------------|
| Free | 10  | 500,000      |
| BYOK | 50  | 2,500,000    |

Lazy garbage collection cleans stale entries on each check.

## Security Model

| Threat | Mitigation |
|--------|------------|
| API key exposure | Server-only env vars (no `NEXT_PUBLIC_` prefix) |
| BYOK key theft | In-memory Zustand store (no persist), HTTPS headers |
| Prompt injection | System prompts server-side only, anti-injection instructions |
| Abuse / scraping | IP-based rate limiting |
| Large payloads | Zod max-length validation on all inputs |
| XSS via AI response | JSON-parsed responses, no `dangerouslySetInnerHTML` |
| CSP bypass | All `/api/ai/*` go through `'self'` |

## State Management

- **Zustand** for global stores (locale, AI settings)
- **React Context** for favorites
- **Per-tool hooks** use `useState` + `localStorage` (prefixed `devflow-*`)
- **AI settings store** is in-memory only (no persist) for BYOK security

## Key Shared Infrastructure

| Component | Location | Purpose |
|-----------|----------|---------|
| Provider chain | `app/providers.tsx` | Theme + HeroUI + Favorites + Toast + SWR |
| Tool registry | `config/tools-data.ts` | All 15 tools metadata |
| i18n | `hooks/use-translation.ts` | Flat JSON dictionaries in `locales/` |
| Smart navigation | `hooks/use-smart-navigation.ts` | Cross-tool data passing via localStorage |
| DataTable | `components/ui/data-table.tsx` | `@heroui/table` + `@heroui/pagination` |
| cn() | `lib/utils.ts` | clsx + tailwind-merge |

## Testing Strategy: 100/80/0

| Tier | Target | Coverage |
|------|--------|----------|
| CORE | `lib/application/*.ts` | 80-100% per-file |
| IMPORTANT | `components/shared/*.tsx` | 80% |
| INFRA | `types/`, `config/`, stores | 0% (TypeScript enforces) |

Vitest with `perFile: true` — each file must individually meet thresholds.
