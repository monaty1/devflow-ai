# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DevFlow AI is a collection of browser-based developer utility tools built with Next.js 16 (App Router), React 19, TypeScript (maximum strict mode), Tailwind CSS v4, and HeroUI v3 beta. All tool logic executes locally in the browser — no external API calls at runtime.

## Commands

```bash
npm run dev           # Dev server (Turbopack)
npm run build         # Production build
npm run lint          # ESLint
npm run lint:fix      # ESLint auto-fix
npm run type-check    # tsc --noEmit
npm test              # Vitest watch mode
npm run test:run      # Vitest single run
npm run test:coverage # Vitest with v8 coverage (80% threshold)
```

Run a single test file:
```bash
npx vitest run tests/unit/application/prompt-analyzer.test.ts
```

Run tests matching a name pattern:
```bash
npx vitest run -t "pattern"
```

## Architecture

Clean Architecture with three layers. Dependencies flow inward: Presentation → Application → Domain.

| Layer | Location | Contents |
|---|---|---|
| Presentation | `app/`, `components/`, `hooks/` | Pages, UI components, React hooks |
| Application | `lib/application/` | Pure business logic functions (no React imports) |
| Domain | `types/` | TypeScript interfaces and type definitions |
| Infrastructure | `config/` | Tool registry, configuration |

### Route Groups

- `(marketing)/` — Public pages (landing, about, docs). Layout has Navbar only.
- `(dashboard)/` — Public dashboard with sidebar. All tool pages live here. No auth required.

### Provider Nesting (app/layout.tsx → providers.tsx)

`FavoritesProvider > ToastProvider > ErrorBoundary`

### Design Principles

- **No auth/login** — Everything is public, no user accounts.
- **No backend** — 100% client-side, localStorage for persistence.
- **No mandatory AI** — All tools work locally without API keys.

## Adding a New Tool

Every tool follows a 5-file pattern plus a registry entry:

1. **`types/<tool>.ts`** — Interfaces, types, default configs. No logic.
2. **`lib/application/<tool>.ts`** — Pure functions with business logic. No React imports. Use `crypto.randomUUID()` for IDs, `new Date().toISOString()` for timestamps.
3. **`hooks/use-<tool>.ts`** — `"use client"` hook wrapping the application logic. Manages state, memoization, localStorage history. Export from `hooks/index.ts` barrel.
4. **`app/(dashboard)/tools/<tool-slug>/page.tsx`** — `"use client"` page using HeroUI components and lucide-react icons.
5. **`tests/unit/application/<tool>.test.ts`** — Unit tests for the pure application logic only.
6. **`config/tools-data.ts`** — Add entry to `TOOLS_DATA` array with id, name, slug, description, icon, category, features, tags, etc.

Tool categories: `"analysis" | "review" | "calculation" | "visualization" | "management" | "generation" | "formatting"`

### Hook Convention

All tool hooks use `"use client"` and manage localStorage-backed history:
```typescript
const STORAGE_KEY = "devflow-<tool>-history";
const MAX_HISTORY = 50;
```

## Key Technical Decisions

- **TypeScript maximum strict**: every strict flag enabled including `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`. Never use `any`.
- **Tailwind CSS v4**: CSS-first config via `@theme inline` in `globals.css` — there is no `tailwind.config.js`.
- **HeroUI v3 beta** (`@heroui/react`): compound component pattern (e.g., `Card.Header`, `Card.Content`). Use these for UI, not custom primitives.
- **Icons**: `lucide-react` exclusively.
- **Utility**: `cn()` from `lib/utils.ts` (clsx + tailwind-merge) for conditional class merging.
- **Fonts**: Geist Sans + Geist Mono via `next/font/google`.
- **Path aliases**: `@/*` maps to project root (e.g., `@/lib/application/base64`, `@/types/tools`).

## Git Conventions

Conventional Commits: `type(scope): subject` — imperative mood, lowercase, under 50 chars.

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`, `revert`

## CI Pipeline

GitHub Actions (`.github/workflows/ci.yml`): lint → typecheck → test → build (all must pass). Node 20, npm ci. Requires `NEXT_PUBLIC_APP_URL` env var for build.

## Guidelines

The `guidelines/` directory contains detailed standards for architecture, code, TypeScript, testing, git, security, performance, Tailwind, Next.js 16, and React 19. Consult these when making architectural decisions.
