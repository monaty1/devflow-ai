# Changelog

All notable changes to DevFlow AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.4.0] - 2026-02-19

### Full i18n, Dynamic Card Borders, Landing Polish & AI Setup Guide

#### i18n Completion (~232 new keys)
- **Tool long descriptions** — all 15 `tool.<slug>.longDescription` keys added in both `en.json` and `es.json`
- **Tool features** — all ~100 `tool.<slug>.feature.N` keys translated per locale
- **Translated pages** — `docs/page.tsx`, `tool-card.tsx`, `[toolId]/page.tsx` now use `t()` for name, description, longDescription, features, category, and aria-labels
- **Translated search** — tools page and docs page search now queries translated text, not raw English from config
- **`tools.users`** — "{count} users" / "{count} usuarios" replaces hardcoded "users"
- **Hardcoded aria-labels fixed** — tool detail "Add/Remove from favorites" now uses `t()`
- **~30 `guide.ai.*` keys** — full Spanish translations for the API Key guide wizard

#### Dynamic Colored Card Borders
- **`getToolGlowClass()` utility** — `lib/utils.ts` maps tool gradient colors to decorative border + glow classes (14 colors)
- **Tool cards** — each card now has a subtle colored border + shadow matching its gradient header
- **Docs article cards** — same glow ring applied to documentation page tool cards
- **WCAG compliant** — decorative borders at 25% opacity, intensify to 40% on hover

#### Landing Page Polish
- **Stats section** — padding reduced from `py-16` to `py-10`
- **Hero CTA gap** — reduced from `pt-4` to `pt-2` for tighter visual flow

#### Sidebar API Key Guide
- **3-step wizard modal** — new `components/shared/api-key-guide.tsx` (~230 lines)
- **Step 1** — choose provider (Pollinations, Gemini, Groq, OpenRouter) with pricing badges
- **Step 2** — numbered instructions + direct link to provider dashboard (skipped for Pollinations)
- **Step 3** — paste API key with show/hide toggle, or Pollinations confirmation
- **"Setup AI" button** — added to sidebar between nav and footer with accent styling
- **Zustand integration** — saves BYOK key + provider via `useAISettingsStore`
- **Fully internationalized** — all text uses `t()` with keys in both locales

## [3.3.0] - 2026-02-19

### 2026 Trends: Security, Performance & Testing

#### Phase 1: CI/CD Permissions & SHA Pinning
- **Least-privilege permissions** — top-level `permissions: {}` with per-job scoping in `ci.yml`
- **SHA-pinned actions** — all GitHub Actions pinned to commit SHAs with version comments in `ci.yml` and `codeql.yml`
- **Audit level raised** — `npm audit --audit-level=high` (was `critical`) matching local `audit:security` script

#### Phase 2: ESLint Security & Supply Chain
- **eslint-plugin-security** — catches `eval()`, non-literal `require()`, `child_process`, trojan source (unicode bidi), `Buffer()` constructor
- **Lockfile integrity** — `lockfile-lint` validates `package-lock.json` only references `https://registry.npmjs.org`
- **SBOM generation** — CycloneDX SBOM generated and uploaded as artifact on every build (90-day retention)

#### Phase 3: Advanced SAST & Runner Hardening
- **Semgrep SAST workflow** — new `.github/workflows/semgrep.yml` with `p/javascript`, `p/typescript`, `p/react`, `p/nextjs`, `p/owasp-top-ten` rulesets; SARIF output to GitHub Security tab
- **StepSecurity harden-runner** — all CI jobs start with `step-security/harden-runner` in audit mode (monitors network egress, file integrity, processes)
- **Enhanced Permissions-Policy** — added `payment=(), usb=(), bluetooth=(), midi=(), magnetometer=(), gyroscope=(), accelerometer=()` restrictions

#### Phase 4: React Compiler & View Transitions
- **React Compiler** — `babel-plugin-react-compiler` enabled via `reactCompiler: true` in `next.config.ts`; automatic memoization at build time
- **View Transitions API** — `viewTransition: true` in experimental config; native CSS transitions between routes (Chrome/Edge 126+)
- **Speculation Rules** — prefetch all `/tools/*` links, prerender top 3 tools (JSON Formatter, Regex Tester, UUID Generator) for instant navigation

#### Phase 5: Performance CI Workflows
- **Lighthouse CI** — new `.github/workflows/lighthouse.yml` audits landing page, tools list, and JSON Formatter on every PR
- **Performance budgets** — `lighthouse-budget.json` with LCP <2.5s, FCP <1.8s, TTI <3.5s, JS <300KB, total <500KB
- **Coverage PR comments** — `vitest-coverage-report-action` posts coverage delta on pull requests

#### Phase 6: E2E Testing with Playwright
- **Playwright E2E** — `@playwright/test` with 5 tests across 3 spec files (navigation, JSON formatter, settings)
- **Playwright config** — `playwright.config.ts` with Chromium, trace-on-retry, screenshot-on-failure
- **CI integration** — E2E job runs after build, uploads report on failure (7-day retention)
- **npm scripts** — `test:e2e` and `test:e2e:ui` added to `package.json`

#### Phase 7: WCAG 2.2 AA Compliance
- **Focus Not Obscured (2.4.11)** — `scroll-pt-4` on main content area prevents sticky sidebar from covering focused elements
- **Consistent Help (3.2.6)** — `HelpLink` component rendered on every tool page via `ToolHeader`
- **i18n error boundary** — dashboard `error.tsx` fully internationalized with `useTranslation()`
- **8 new i18n keys** — `common.help`, `common.helpDocs`, `error.dashboardTitle`, `error.dashboardDesc`, `error.errorId` in both locales

#### Phase 8: Renovate Config & Documentation
- **Renovate** — `renovate.json` with auto-merge patches, HeroUI grouping, action digest pinning, vulnerability alerts
- **CHANGELOG** — updated with all 8 phases
- **README** — updated with new CI workflows, security features, and E2E testing

## [3.2.0] - 2026-02-19

### UX & Polish Iteration

#### Added
- **Sticky desktop sidebar** — sidebar now stays fixed while content scrolls (`sticky top-0 h-screen overflow-y-auto`)
- **Locale toggle in dashboard sidebar** — language can be switched from inside any tool page, no need for marketing navbar
- **Shared `LocaleToggle` component** — extracted from navbar into `components/shared/locale-toggle.tsx` with `icon` and `full` variants
- **AI Configuration card on Settings page** — enable/disable AI toggle, provider selector (Gemini/Groq), API key input with show/hide, clear key button, "memory only" security note
- **MagicInput detection badge** — shows "Detected: JSON" / "Detected: Cron" etc. when input type is identified
- **Radar chart axis labels** — 7 dimension labels (Role, Task, Context, Steps, Format, Constraints, Clarify) displayed around the Prompt Analyzer radar
- **About page i18n** — 21 new keys replacing all hardcoded English strings
- **~38 new i18n keys** across both `en.json` and `es.json` (sidebar, settings.ai, about, magic.detected, home.statsLabel)

#### Fixed
- **MagicInput critical data flow bug** — was writing to `localStorage("magic-input")` but tools read from `devflow-shared-data`; now uses `useSmartNavigation().navigateTo()` for correct data passing
- **Settings Clear Data** — was hardcoded to only 3 keys; now cleans ALL `devflow-*` localStorage keys
- **MagicInput dead SQL detection** — removed `sql` case from `DetectedType` (no SQL tool exists)

#### Changed
- **Landing page simplified** — removed redundant "Why DevFlow" 3-card section and bottom CTA gradient box; single CTA button in hero
- **AI system prompts enhanced** — all 4 prompts rewritten with chain-of-thought instructions, output format examples with sample values, query complexity classification, and stronger injection defenses
- **ToolSuggestions visibility** — added subtle background frame (`bg-primary/5 border border-primary/10 rounded-lg`)
- **Security card hidden when empty** — Prompt Analyzer no longer shows "Security Analysis" card when `securityFlags.length === 0`
- **Cost Calculator cleanup** — removed dead "View Stats" dropdown item that had no `onPress` handler
- **Translated sr-only text** — landing page "Project Stats" heading now uses `t("home.statsLabel")`
- **Translated 5 hardcoded aria-labels** — sidebar close/open buttons, nav, sidebar landmark labels

## [3.1.0] - 2026-02-19

### Phase E: Tool-by-Tool Iteration (15 tools)

#### Added
- **ToolSuggestions integration** — Context-aware cross-tool recommendation banners integrated into all 15 tool pages
- **JSON Formatter** — Line-by-line diff view between two JSON documents, path copy-on-click in tree view, line numbers in formatted output
- **Prompt Analyzer** — Heptagonal radar chart visualization for 7-dimension anatomy scoring, history comparison
- **Code Review** — Severity filter chips (critical/warning/info) to focus on specific issue types
- **Cost Calculator** — Currency selector (USD/EUR/GBP) with live conversion, CSV export of comparison table
- **Token Visualizer** — Context window budget bar with 4K/8K/128K presets and color-coded utilization (green/amber/red)
- **Context Manager** — Model preset selector (11 models from GPT-4o to Gemini 2M tokens), color-coded utilization progress bar
- **DTO-Matic** — "Download All Files" button to export all generated code files as a single text file
- **Regex Humanizer** — 6 preset patterns (email, URL, IP, date, phone, hex color) with one-click load, live match highlighting
- **Variable Name Wizard** — Batch rename: paste multiple names, select target convention, convert all at once with copy-all
- **Cron Builder** — Mini calendar visualization showing execution dates for the current month with highlighted active days
- **Git Commit Generator** — Batch generation: paste multiple descriptions, generate all conventional commit messages at once
- **Tailwind Sorter** — Before/after diff tab showing removed classes (red strikethrough), kept classes (green), and reordered output
- **UUID Generator** — Collision checker: paste UUIDs to detect duplicates with line numbers and statistics (total/unique/duplicates)
- **Base64** — File upload button using FileReader API (readAsDataURL for encode, readAsText for decode)
- **HTTP Status Finder** — i18n for decision pipeline (5 questions translated to Spanish)
- **~55 new i18n keys** across all 15 tools in both `en.json` and `es.json`

#### Changed
- **i18n sweep** — ~230 hardcoded English strings replaced with `t()` calls across 12 tool pages (base64, code-review, context-manager, cron-builder, dto-matic, git-commit-generator, http-status-finder, regex-humanizer, tailwind-sorter, token-visualizer, uuid-generator, variable-name-wizard)
- **Accessibility sweep (WCAG AAA)** — 8 tool pages improved:
  - `cost-calculator`: aria-label on all 6 range/number inputs
  - `code-review`: aria-label on DropdownTrigger, `role="img"` on SVG score chart
  - `prompt-analyzer`: aria-label on delete + export buttons
  - `context-manager`: `role="button"` + `tabIndex` + keyboard nav on window selector, fixed hardcoded "Cancel"
  - `dto-matic`: keyboard nav on file selector, `role="radiogroup"` on mode chips + language buttons
  - `token-visualizer`: `role="radiogroup"` on provider buttons, keyboard support on leaderboard Cards
  - `variable-name-wizard`: `role="radiogroup"` on language selector
  - `git-commit-generator`: `type="button"` + `aria-hidden` on "Add point"
- **942 tests passing** (up from 906) — 31 new coverage tests for cost-calculator, cron-builder, uuid-generator + 5 from tool iterations

## [3.0.0] - 2026-02-19

### Added
- **Pollinations + OpenRouter free AI providers** — AI is now always available without configuration. Provider priority: BYOK → Gemini → Groq → OpenRouter → Pollinations (free, no API key needed)
- **Tool Recommendation Engine** — Context-aware cross-tool suggestions with 10 data type detectors, 15 tool rules, deduplication, and smart data passing (22 tests)
- **CodeQL SAST CI workflow** — JavaScript/TypeScript security analysis on push, PRs, and weekly schedule
- **Dependency review action** — Blocks PRs that introduce moderate+ vulnerability dependencies
- **Health check endpoint** — `GET /api/health` returns `{ status, version, timestamp }` for post-deploy verification
- **Sentry setup guide** — `docs/SENTRY.md` with full setup, Vercel deployment, and architecture reference

### Changed
- **HeroUI v3 form migration** — 27 raw HTML form elements replaced with HeroUI v3 components (TextArea, Select, NumberField, Slider, SearchField, Switch) across 14 tool pages
- **i18n completion** — 343 missing Spanish translations added (1083 → 1132 keys in both locales), zero English text in Spanish UI
- **Micro-copy polish** — 49 new i18n keys for error boundaries, DataTable, favorites, magic input, cron builder, 404 page, tool card
- **WCAG AAA compliance** — `role="alert" aria-live="assertive"` on error boundaries, 44px touch targets on all `isIconOnly` buttons, `aria-hidden` on decorative icons, `role="group"` on cron presets
- **Performance** — Dynamic import for Recharts (code-split), AVIF/WebP image formats, CSP updated for AI provider domains, `optimizePackageImports` for recharts
- **Sentry configs** — Added `release` and `environment` tags to all 3 configs (client, server, edge)
- **CI hardened** — npm audit tightened to `--audit-level=moderate`, added dependency review for PRs
- **906 tests passing** (up from 884) — 22 new recommendation engine tests

## [2.6.0] - 2026-02-19

### Added
- **Prompt Analyzer anatomy-based scoring** — Complete overhaul based on "Anatomia del Prompt Perfecto" (7 dimensions: Role, Task, Context, Steps, Format, Constraints, Clarification). Each dimension scored 0-100 with evidence extraction, weighted average drives the final score. Vague prompts like "hazme una web" now correctly score 1-3/10
- **Prompt Anatomy UI visualization** — New card in Prompt Analyzer showing all 7 dimensions with progress bars, status indicators (Detected/Partial/Missing), evidence text, and tips for improvement
- **HTTP Status Finder expanded to 61 codes** — Nearly doubled from 32 to 61 status codes covering RFC 9110, RFC 6585, RFC 7725 and more. Added 202, 203, 206-208, 226, 300, 303, 402, 406-408, 411-416, 418, 421-426, 428, 431, 451, 501, 506
- **Cron Builder timezone support** — Added `calculateNextExecutions(expr, count, timezone)` with 14 common timezones (UTC, US Eastern/Central/Mountain/Pacific, European capitals, Asia/Pacific). Next executions shown in selected timezone with `Intl.DateTimeFormat`
- **Context Manager model presets** — 12 model presets with token limits: GPT-4o (128K), o1 (200K), Claude Opus/Sonnet 4 (200K), Gemini 2.0 Flash (1M), Gemini 1.5 Pro (2M), Llama 3.1 70B, DeepSeek V3, Mistral Large, plus Custom

### Fixed
- **Tailwind Sorter false-positive conflicts** — `px-4` and `py-4` (and all axis-specific utilities like `mx/my`, `pt/pb`, `border-t/b`, `rounded-tl/br`) are no longer flagged as conflicts. Added `AXIS_PREFIXES` set with 30+ axis-specific prefixes for accurate grouping
- **Prompt Analyzer hardcoded strings** — Replaced 2 remaining hardcoded English strings ("Check Tokens", "Estimate Cost") with i18n `t()` calls
- **Prompt Analyzer export report** — Now includes anatomy score and dimension breakdown in markdown export

### Changed
- **Prompt scoring algorithm** — Replaced issue-penalty scoring with anatomy-weighted scoring. Score = weighted average of 7 dimension scores (0-100) mapped to 1-10, minus security deductions
- **884 tests passing** (up from 877) — 7 new anatomy tests, 7 new Tailwind conflict tests

## [2.5.2] - 2026-02-18

### Fixed
- **CSP blob Worker crash** — 6 tools silently broken in production (infinite loading, no error). Blob Workers blocked by `script-src 'self' 'unsafe-inline'` CSP. Rewrote all 6 hooks to call `lib/application/*.ts` functions directly: code-review, tailwind-sorter, regex-humanizer, variable-name-wizard, prompt-analyzer, token-visualizer
- **CSP connect-src for cost calculator** — Added `https://raw.githubusercontent.com` to CSP `connect-src` directive so live pricing data from LiteLLM can load

### Removed
- **6 worker-source.ts files** — Deleted ~1,400 lines of duplicated logic (string-serialized copies of lib functions for blob Workers)
- **`hooks/use-worker.ts`** — Unused generic blob Worker hook (dead code)

## [2.5.1] - 2026-02-18

### Fixed
- **HeroUI v3 Tabs compound API migration** — Migrated all 9 tool pages from deprecated flat `<Tab key>` pattern to v3 compound `<Tabs.Tab id>` + `<Tabs.ListContainer>` + `<Tabs.List>` + `<Tabs.Panel>` pattern. Fixes `next build` prerender crash: `"<Tab> cannot be rendered outside a collection"`
- **Pages fixed:** base64, cron-builder, dto-matic, git-commit-generator, json-formatter, regex-humanizer, tailwind-sorter, uuid-generator, variable-name-wizard

## [2.5.0] - 2026-02-18

### Internationalized
- **71 hardcoded strings replaced with `t()` calls** across 4 tool pages: cost-calculator (9), tailwind-sorter (18), git-commit-generator (22), json-formatter (22)
- **~100 new locale keys** added to `en.json` for cost-calc, tailwind, git-commit, and json-formatter tools

### Fixed
- **HeroUI v3 Checkbox API** — Replaced deprecated `onValueChange` with `onChange`, removed unsupported `size` and `color` props (tailwind-sorter, git-commit-generator)
- **React Compiler compliance** — Fixed `useCallback` missing `t` dependency in cost-calculator `renderCell`
- **React refs rule** — Moved `optionsRef.current` assignment into `useEffect` in `useWorker` hook to comply with `react-hooks/refs`
- **Unused variables** — Removed destructured `onSuccess`/`onError` in `useWorker` that were only accessed via ref
- **CI pipeline restored** — All 3 jobs (quality, security, build) now pass: 0 lint errors, 0 TS errors, 831 tests green

### Changed
- **TFM slides** — Updated stats and content in `docs/slides.md`

## [2.4.0] - 2026-02-18

### Added
- **`CodeReviewSkeleton` component** — Dedicated loading skeleton for Code Review results panel (score ring, metrics grid, issues table)
- **TFM documentation** — Added `docs/Documentacion-TFM.pdf` (assignment specification) and finalized `docs/TFM.md` (full project documentation)

### Improved
- **Smart navigation covers all 15 tools** — `useSmartNavigation` `ToolRoute` type now includes all 15 tool routes (was only 6). Cross-tool "Send to..." flows work across the entire platform
- **Regex Humanizer upgraded** — Full visual overhaul: syntax-highlighted token breakdown, named-group support, interactive match highlighting, and improved pattern generation UX
- **Context Manager upgraded** — Redesigned three-panel layout with drag-to-reorder chunks, priority badges, token budget bar, and improved XML/JSON/MD export
- **Code Review upgraded** — Enhanced results panel with donut score ring, severity breakdown chips, and per-issue expand/collapse detail
- **Cost Calculator upgraded** — Sticky comparison table header, live currency toggle (USD/EUR), and improved model filter chips
- **Cron Builder upgraded** — Human-readable schedule description updates in real-time as fields change; next-run list shows relative time ("in 3 hours")
- **DTO-Matic upgraded** — Added optional Zod schema preview tab alongside TypeScript interfaces; improved nested-object flattening
- **Prompt Analyzer upgraded** — Score breakdown now shows per-dimension bars (Clarity, Role, Format, Security, Context)
- **Tailwind Sorter upgraded** — Variant grouping toggle; shows diff view (before/after) side by side
- **Token Visualizer upgraded** — Color-coded token legend; per-segment cost tooltip on hover

### Fixed
- **TFM.md master title** — Removed duplicate "Frontend Development" from master name field

## [2.3.0] - 2026-02-13

### Performance
- **Ultra-modern browserslist** — Targets Chrome/Firefox/Edge 100+, Safari/iOS 15.4+. Eliminates `Array.prototype.at`, `flatMap`, and other polyfills (~14KB saved), achieving Lighthouse 100/100
- **Font optimization hardened** — Explicit `preload: true` and `adjustFontFallback: true` on Geist Sans and Geist Mono for fastest possible LCP

## [2.2.0] - 2026-02-13

### Accessibility
- **WCAG AAA contrast** — Primary color upgraded to `#1e40af` (Blue 800, 8.73:1 on white) in light mode and `#93c5fd` (Blue 300, 9.8:1 on dark bg) in dark mode. All text-on-primary elements now meet WCAG AAA 7:1 minimum
- **US flag locale icon** — Replaced UK Union Jack with US Stars and Stripes for English locale toggle

### Performance
- **Mobile LCP optimization** — Removed GSAP fade-in animation from hero section (above-the-fold). Content renders instantly instead of starting at opacity:0, eliminating the 600ms LCP delay on mobile
- **Hero CTA uses design system** — Replaced hardcoded `bg-blue-600` with `bg-primary` token for consistent theming

### Changed
- **TFM preparation** — Added `ENTREGA_TFM.md` to `.gitignore`

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

[2.5.1]: https://github.com/albertoguinda/devflow-ai/compare/v2.5.0...v2.5.1
[2.5.0]: https://github.com/albertoguinda/devflow-ai/compare/v2.4.0...v2.5.0
[2.4.0]: https://github.com/albertoguinda/devflow-ai/compare/v2.3.0...v2.4.0
[2.3.0]: https://github.com/albertoguinda/devflow-ai/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/albertoguinda/devflow-ai/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/albertoguinda/devflow-ai/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/albertoguinda/devflow-ai/compare/v1.5.0...v2.0.0
[1.5.0]: https://github.com/albertoguinda/devflow-ai/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/albertoguinda/devflow-ai/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/albertoguinda/devflow-ai/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/albertoguinda/devflow-ai/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/albertoguinda/devflow-ai/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/albertoguinda/devflow-ai/releases/tag/v1.0.0
