# Changelog

All notable changes to DevFlow AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-02-13

### Performance
- **Modern JS target** — Added `browserslist` targeting last 2 versions of Chrome, Firefox, Safari, Edge. Eliminates legacy polyfills and reduces bundle size for Lighthouse 100/100

### Security
- **Prototype pollution fix** — `json-formatter.ts` `sortObjectKeys()` now filters `__proto__`, `constructor`, `prototype` keys to prevent prototype pollution attacks
- **Mock secret cleanup** — Renamed fake credentials in `code-review.test.ts` to `MOCK_SECRET_KEY` pattern with `pragma: allowlist secret` comments to silence Aikido/Snyk alerts

### Accessibility
- **Nested interactive fix** — Removed `<Button>` wrapping `<NextLink>` in navbar (both desktop and mobile). Replaced with styled `<NextLink>` to comply with HTML spec (no `<button>` inside `<a>`)
- **Skip-link contrast** — Changed skip-link background from `var(--color-primary)` to `#1e293b` (slate-800) with `#f8fafc` text for WCAG AAA contrast (15.4:1)
- **SVG country flags** — Replaced Unicode flag emoji (broken on Windows as "ES"/"GB" text) with inline SVG flags for Spain and UK
- **Navbar centering** — Navigation links now use `flex-1 justify-center` for true horizontal centering

### Changed
- **CODE_OF_CONDUCT.md** — Added full Spanish translation (bilingual EN/ES)
- **README.md** — Updated with latest changes

## [2.0.0] - 2026-02-12

### Added
- **100/80/0 Strategic Coverage Architecture** — Tiered coverage enforcement via Vitest:
  - **CORE (100%):** `lib/application/*.ts` — per-file enforcement (80% stmts/lines/funcs, 70% branches minimum floor)
  - **IMPORTANT (80%):** `components/shared/*.tsx`, `hooks/use-toast.ts` — included in coverage scope
  - **INFRASTRUCTURE (0%):** `types/`, `config/`, `lib/stores/`, barrel `index.ts` — excluded, TypeScript enforces correctness
- **Coverage gap tests** — New unit tests targeting uncovered branches in prompt-analyzer, regex-humanizer, dto-matic, code-review, cron-builder, variable-name-wizard, base64
- **Security audit job** in CI pipeline — `npm audit --audit-level=high` runs in parallel with quality checks
- **Coverage artifact upload** — CI publishes HTML coverage report as GitHub Actions artifact (14-day retention)
- **`npm run audit:security`** script in package.json

### Security
- **CSP hardened** — Added `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`, `object-src 'none'`, `upgrade-insecure-requests` directives
- **Input validation audit** — Confirmed: no API routes (100% client-side), no raw input handling, JSON-LD uses static `JSON.stringify`, Zod available for form validation

### Changed
- **CI pipeline restructured** — 3 jobs: quality (lint + typecheck + coverage), security (audit), build. Coverage enforcement gates the build — if thresholds fail, build is blocked
- **Vitest config** — Added `perFile: true` enforcement, `json-summary` reporter, expanded coverage `include` to IMPORTANT tier, explicit INFRASTRUCTURE `exclude`

## [1.5.0] - 2026-02-11

### Added
- **/docs page** — Comprehensive documentation page listing all 15 tools with longDescription, features list, tags, and category badges. Includes full-text search (name, description, tags) and category filters. Each tool card has gradient header with icon, direct link to launch the tool, and two-column features grid.
- **Sidebar "Docs" entry** — New `BookOpen` icon navigation item in dashboard sidebar between Tools and Favorites
- **Dynamic OG image** — Generated at edge runtime via Next.js `ImageResponse` (1200x630). Dark gradient background with DevFlow AI logo, title "The developer toolkit for AI development", "Free & Open Source" + "15 Tools" badges, and "Para vosotros, developers" tagline. Twitter image reuses the same component.

### Improved
- **Metadata cleanup** — Removed hardcoded `/og-image.png` references from `openGraph.images` and `twitter.images`; Next.js file convention handles image generation automatically

### Internationalized
- **8 new locale keys** for docs page (`docs.title`, `docs.subtitle`, `docs.search`, `docs.showing`, `docs.openTool`, `docs.noResults`, `docs.noResultsHint`) + `sidebar.docs` in both EN and ES

## [1.4.0] - 2026-02-11

### Added
- **Breadcrumb navigation** on all 15 tool pages — `ToolHeader` component extended with `breadcrumb` prop rendering `Tools > Current Page` with link back to tool listing
- **35 component tests** with `@testing-library/react` and `userEvent` — StatusBadge (11 tests), CopyButton (8 tests), ToolHeader (8 tests), Toast system (8 tests). Total tests: 578

### Replaced
- **All UI emojis replaced with lucide-react icons** across 8 pages — context-manager (FileText, BookOpen), code-review (Search), token-visualizer (Sparkles), regex-humanizer (CheckCircle2, XCircle), history (Inbox), settings (Sun, Moon, Monitor), landing page (Zap, Monitor, LockOpen, Star)

### Internationalized
- **~20 remaining hardcoded strings** — placeholders, aria-labels, filter labels, error messages, and format buttons now use `t()` calls
- New locale keys added to both `en.json` and `es.json` (history, gitCommit, dtoMatic, jsonFmt, uuid, ctxMgr)

### Security
- **CSP hardened** — Removed `unsafe-eval` from `script-src`, added `connect-src 'self'` and `frame-src https://giscus.app`

### Improved
- **Clipboard API fallback** — `CopyButton` falls back to `document.execCommand("copy")` when `navigator.clipboard` is unavailable
- **Toast stacking limit** — Maximum 5 simultaneous toasts, oldest are discarded automatically

## [1.3.0] - 2026-02-11

### Added
- **Full i18n coverage for all 15 tool pages** — Every hardcoded user-facing string replaced with `useTranslation()` hook calls
- **~290 locale keys** added to both `en.json` and `es.json` covering all tool pages
- **Common i18n namespace** — Shared keys (`common.reset`, `common.copy`, `common.history`, etc.) reused across tools to avoid duplication

### Changed
- Translatable arrays (`MODE_OPTIONS`, `TABS`, `OUTPUT_FORMATS`, `columns`) moved inside component bodies to access `t()` function
- Cost calculator `columns` wrapped in `useMemo` for render performance
- `useCallback`/`useMemo` dependency arrays updated to include `t` where needed

### Pages internationalized
- token-visualizer, code-review, prompt-analyzer, json-formatter, tailwind-sorter, context-manager, variable-name-wizard, regex-humanizer, cost-calculator
- (Previously completed: base64, dto-matic, http-status-finder, cron-builder, git-commit-generator, uuid-generator)

## [1.2.0] - 2026-02-11

### Refactored
- **useToolHistory<T> generic hook** — Replaced ~440 lines of duplicated localStorage history logic across 11 hooks
- **CopyButton shared component** — Self-contained clipboard button with auto-reset, replaced ~400 lines across 11 pages and 9 hooks
- **ToolHeader shared component** — Unified two header patterns (icon+gradient and simple) across 16 tool pages
- **StatusBadge consolidation** — Added purple variant, replaced ~15 inline badge spans across 5 pages
- **Centralized ICON_MAP** — Single source of truth in `config/tool-icon-map.ts`, removed 3 duplicated maps
- **Shared ThemeToggle** — Unified compact/full variants in `components/shared/theme-toggle.tsx`

## [1.1.0] - 2026-02-11

### Added
- **Internationalization (i18n)** — Full EN/ES support with Zustand locale store and `useTranslation` hook
- **Flag emoji language selector** in navbar (replaces plain text toggle)
- **Console Easter egg** — "PARA VOSOTROS, DEVELOPERS" styled message on F12
- **Hidden meta tag** — `<meta name="philosophy" content="Para vosotros, developers" />`
- **Custom 404 page** — Branded "Te has salido del mapa" with dev community message
- **GitHub issue templates** — Bug report, feature request, new tool proposal (YML forms)
- **Pull request template** — Quality checklist for contributors
- **CODE_OF_CONDUCT.md** — Contributor Covenant
- **Loading skeletons** — Dashboard and tool page loading states
- **Error boundaries** — Graceful error handling with recovery actions
- **Shared components** — ToastContainer, GiscusComments, StatusBadge, ShareButtons

### Changed
- **Navbar redesigned** — GitHub moved to icon on right side, fixed-width dashboard button, flag emojis for locale
- **Sidebar simplified** — Removed redundant Panel link, `/dashboard` redirects to `/tools`
- **Tool cards** — Heart button correctly toggles favorites (z-index fix), removed fake ratings and Free badge
- **Landing page** — Streamlined CTAs, both point to `/tools`, new footer with author credit and LinkedIn
- **Sentence case** — All UI strings normalized across both locales
- **Cursor pointer** — Global CSS rule for all interactive elements

### Fixed
- All ESLint errors resolved (7 errors → 0) — migrated `setMounted` pattern to `useSyncExternalStore`
- All TypeScript strict errors in tests (non-null index access)
- Navbar button width no longer shifts on language change

### Improved
- **WCAG AAA accessibility** — ARIA labels, keyboard navigation, 7:1 contrast ratios, skip navigation, focus rings, reduced motion, screen reader support
- **CI pipeline** — Merged 4 redundant jobs into 2, added concurrency groups, single `npm ci` per job
- **543 unit tests** passing (up from 80+)

## [1.0.0] - 2026-02-03

### Added
- **Prompt Analyzer** — Score prompt quality, detect injection attacks
- **Code Review Assistant** — Automated security and quality checks
- **API Cost Calculator** — Multi-provider cost comparison (OpenAI, Anthropic, Google, Meta)
- **Token Visualizer** — Real-time tokenization with color-coded segments
- **Context Manager** — Organize and export LLM context windows (XML/JSON/Markdown)
- **JSON Formatter** — Validate, format, sort keys, extract paths
- **Base64 Encoder/Decoder** — Encode and decode with line break options
- **UUID Generator** — Generate v4 UUIDs with bulk and custom options
- **Regex Humanizer** — Convert regex to human-readable explanations
- **HTTP Status Finder** — Search and browse HTTP status codes
- **Git Commit Generator** — Generate conventional commit messages from diffs
- **DTO-Matic** — Generate TypeScript DTOs from JSON
- **Variable Name Wizard** — Convert variable names between naming conventions
- **Cron Builder** — Build and preview cron expressions visually
- **Tailwind Sorter** — Sort Tailwind CSS classes by category
- **Favorites System** — Save and manage favorite tools
- **History Page** — Track all analysis history with search and filters
- **Settings Page** — Theme, language, notification preferences
- **GSAP Animations** — Smooth scroll animations, counters, stagger effects
- **Fully Responsive** — Mobile-first design across all pages

### Tech Stack
- Next.js 16 (App Router, Turbopack)
- React 19 (Server Components, ref as prop)
- TypeScript 5.7 (maximum strict mode)
- Tailwind CSS v4 (CSS-first config)
- HeroUI v3 beta
- GSAP and Framer Motion (animations)
- Vitest (testing)
- Zustand (state management)

---

[2.1.0]: https://github.com/albertoguinda/devflow-ai/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/albertoguinda/devflow-ai/compare/v1.5.0...v2.0.0
[1.5.0]: https://github.com/albertoguinda/devflow-ai/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/albertoguinda/devflow-ai/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/albertoguinda/devflow-ai/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/albertoguinda/devflow-ai/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/albertoguinda/devflow-ai/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/albertoguinda/devflow-ai/releases/tag/v1.0.0
