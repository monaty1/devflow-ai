# Changelog

All notable changes to DevFlow AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.8.0] - 2026-02-21

### Cleanup & Security (Fase B5)

- **Dead code removal**: Removed unused `GiscusComments` and `ShareButtons` components + `@giscus/react` dependency (~30KB bundle reduction)
- **Security**: Fixed 1 moderate `ajv` vulnerability (ReDoS) — 0 vulnerabilities remaining
- **ESLint**: Suppressed 22 false-positive `security/detect-object-injection` warnings in test files
- **Performance**: Added `js-tiktoken` to `optimizePackageImports` (22MB dependency now tree-shaken)
- Cleaned up orphaned i18n keys (`share.shareOnX`, `share.shareOnLinkedIn`)

### Testing (Fase B6) — 36 new tests

- **`infrastructure/config/env.ts`** — 14 tests: Zod validation, caching, coercion, fallback defaults, `isAIConfigured()`
- **`components/shared/error-boundary.tsx`** — 8 tests: error catch, Sentry reporting, recovery, custom fallback, a11y
- **`components/shared/api-key-guide.tsx`** — 9 tests: multi-step wizard, BYOK activation, provider selection, navigation
- **Coverage hardening** — 5 tests: `dto-matic` generic number branch, `variable-name-wizard` audit branches (short names, loading prefix, numbers, Hungarian notation)

**Test total: 1419 tests passing (45 files), 20 E2E specs**

## [4.7.0] - 2026-02-21

### Technical Improvements (Fase B)

Performance optimizations, AI infrastructure test coverage, and component test expansion. 57 new tests (1326 to 1383), 4 prod files improved, 9 new test files.

#### B1: Performance & Bundle

- **Dynamic import InstallPrompt** (`app/providers.tsx`) — Lazy-load PWA install banner with `next/dynamic` + `ssr: false` to reduce first paint JS
- **Dynamic import ApiKeyGuide** (`app/(dashboard)/layout.tsx`) — Lazy-load 324-line modal component on demand instead of upfront
- **Fix raw `<button>` in install-prompt** (`components/shared/install-prompt.tsx`) — Replace raw `<button>` dismiss with HeroUI `Button isIconOnly variant="ghost"` for consistency

#### B2: AI Infrastructure Tests (32 new tests)

- **AI Provider Factory** (`tests/unit/infrastructure/ai-provider-factory.test.ts`) — 10 tests: BYOK priority, env var chain, Pollinations fallback, BYOK overrides env
- **OpenRouter Client** (`tests/unit/infrastructure/openrouter-client.test.ts`) — 4 tests: success response, error handling, default options, availability
- **Pollinations Client** (`tests/unit/infrastructure/pollinations-client.test.ts`) — 4 tests: no-key constructor, success response, error handling, availability
- **Pricing Service** (`tests/unit/infrastructure/pricing-service.test.ts`) — 9 tests: fetch+parse, filtering, categorization, popularity, display names, error re-throw
- **AI Status Route** (`tests/unit/api/ai-status.test.ts`) — 5 tests: provider detection per env var, premiumConfigured flag, Pollinations fallback

#### B3: Component Tests (25 new tests)

- **ThemeToggle** (`tests/component/theme-toggle.test.tsx`) — 8 tests: compact/full variants, light→dark→system cycling, aria-labels per theme
- **LocaleToggle** (`tests/component/locale-toggle.test.tsx`) — 6 tests: icon/full variants, locale switching, flag SVG rendering
- **InstallPrompt** (`tests/component/install-prompt.test.tsx`) — 6 tests: dismissed state, beforeinstallprompt event, dismiss localStorage, SW registration
- **ToolSuggestions** (`tests/component/tool-suggestions.test.tsx`) — 5 tests: empty state, recommendation rendering, navigation, shared data localStorage

#### B4: Documentation

- Updated test counts across README.md, TFM.md, DEPLOYMENT.md (1257→1383, 29→42 files, 18→20 E2E)
- Updated i18n key counts (~1539→~1543)
- Bumped version to 4.7.0

## [4.6.0] - 2026-02-21

### Exhaustive Audit & Quality Hardening (Phases 1-5)

Comprehensive 5-phase audit covering security, bug fixes, accessibility, testing, and refactoring. 69 new tests (1257 to 1326), 31 findings resolved across ~35 files.

#### Phase 1: Security & API Robustness (v4.4.1)

- **IP extraction hardening** (`lib/api/middleware.ts`) — Prioritize `x-real-ip` (proxy-set, not spoofable) before `x-forwarded-for`; take LAST IP from forwarded chain to prevent client-side spoofing
- **AI JSON parser try-catch** (`app/api/ai/{review,refine,suggest}/route.ts`) — Each `parse*Response` now catches `SyntaxError` and throws descriptive `"AI returned malformed JSON: ..."` with first 200 chars of raw response
- **Tokenize rate limiting** (`app/api/ai/tokenize/route.ts`) — Added missing `limiter.recordRequest(ip)` call after successful tokenization (consistent with review/suggest/refine)
- **Client fetcher hardening** (`lib/api/fetcher.ts`) — `response.json()` wrapped in try-catch to handle non-JSON error responses (e.g. 502 HTML from reverse proxy)
- **19 new tests**: middleware IP extraction (8), AI JSON parsing (6), fetcher error handling (5)

#### Phase 2: Tool Logic Bugs (v4.5.0)

- **Accurate token estimation** (`lib/application/context-manager.ts`) — Replaced naive `Math.ceil(text.length / 4)` with `js-tiktoken` cl100k_base encoder (lazy-loaded with fallback)
- **UUID v1 bitwise fix** (`lib/application/uuid-generator.ts`) — Added `Math.floor()` to prevent float truncation in clock sequence generation
- **Base64 error reporting** (`lib/application/base64.ts`, `types/base64.ts`) — `getByteView` now returns `error?: string` field instead of silently returning empty array; eliminated triple `Array.from` (reuse single `byteArray`)
- **JSON fixJson escaped quotes** (`lib/application/json-formatter.ts`) — Quote replacement regex now handles escaped single quotes: `/'((?:[^'\\]|\\.)*)'/g`
- **Cost calculator div-by-zero** (`lib/application/cost-calculator.ts`) — `valueScore` returns `undefined` when `totalCost <= 0` instead of dividing by epsilon
- **Unicode-safe regex advancement** (`lib/application/regex-humanizer.ts`) — Zero-length match advancement uses `codePointAt()` to correctly handle surrogate pairs (emoji, CJK)
- **19 new tests**: tiktoken estimation (5), UUID variant/version bits (4), base64 error field (3), escaped quotes (3), div-by-zero (2), Unicode safety (2)

#### Phase 3: Components & Accessibility (v4.5.1)

- **Command palette group-hover fix** (`components/shared/command-palette.tsx`) — Added `group` class to tool buttons so `group-hover:opacity-100` on ArrowRight icon works correctly
- **Tool header aria-hidden** (`components/shared/tool-header.tsx`) — Added `aria-hidden="true"` to decorative icon for screen readers
- **Copy-button coverage** (`vitest.config.ts`) — Added `copy-button.tsx` to coverage scope; now 100% stmts/funcs/lines
- **matchMedia mock** (`tests/setup.ts`) — Configurable dark mode via `__PREFER_DARK_MODE__` global for theme tests
- **18 new tests**: command-palette component tests (12), tool-header aria-hidden (1), copy-button (timeout revert, clipboard fallback, rapid clicks, disabled state — 5)

#### Phase 4: Testing Hardening (v4.5.2)

- **JSON formatter E2E selectors** (`tests/e2e/json-formatter.spec.ts`) — Replaced fragile `locator("textarea").first()` with ARIA `getByRole("textbox")`
- **Command palette E2E** (`tests/e2e/command-palette.spec.ts`) — 6 tests: Cmd+K opens, filter, arrow navigation, Enter navigates, Escape closes
- **Settings export E2E** (`tests/e2e/settings-export.spec.ts`) — 4 tests: export produces JSON, import restores, invalid import error
- **Toast FIFO test** (`tests/component/toast.test.tsx`) — Verifies oldest toast removed when MAX_TOASTS exceeded
- **Centralized next/navigation mock** (`tests/setup.ts`) — Global mock for `useRouter`, `usePathname`, `useSearchParams`

#### Phase 5: Refactoring & Quality (v4.6.0)

- **Cron builder modularization** — Moved `lib/application/cron-builder.ts` (832 lines) to `lib/application/cron-builder/index.ts` directory module (backward-compatible barrel)
- **Shared naming utils** (`lib/application/shared/naming-utils.ts`) — Extracted `toCamelCase`, `toPascalCase`, `toSnakeCase`, `toKebabCase` from dto-matic; dto-matic now imports from shared
- **Centralized tool constants** (`config/tool-constants.ts`) — `REGEX_TESTER.MAX_MATCHES/TIMEOUT_MS`, `CONTEXT_MANAGER.DEFAULT_MAX_TOKENS`
- **AI status premiumConfigured** (`app/api/ai/status/route.ts`, `types/ai.ts`) — New `premiumConfigured: boolean` field indicating if a paid AI provider is configured
- **16 new tests**: naming-utils comprehensive coverage (16)

#### Stats
- **1326 unit tests passing** (was 1257, +69 new)
- **33 test files** (was 29)
- **All coverage thresholds met** (per-file 80/70/80/80)
- **0 lint errors**, **0 type errors**, production build verified

## [4.4.0] - 2026-02-21

### Feature Enhancements (Fase 4)

PWA support, completing the final phase of the master plan.

#### 4.2 — Progressive Web App (PWA)
- **Web App Manifest** (`app/manifest.ts`): Next.js metadata API with name, icons, standalone display, indigo theme
- **Service Worker** (`public/sw.js`): Vanilla JS (~55 lines, 0 dependencies)
  - Cache strategy: App shell cache-first, API routes network-first, static stale-while-revalidate
  - Auto-cleanup of old caches on activation
- **Install Prompt** (`components/shared/install-prompt.tsx`): "Add to Home Screen" banner
  - Listens for `beforeinstallprompt` event
  - HeroUI Button actions (Install / Not now)
  - Dismiss persisted via localStorage (`devflow-pwa-dismissed`)
  - SSR-safe with `typeof window` guard
- **PWA Icons**: 192x192 and 512x512 PNG icons in `public/icons/`
- **CSP**: Added `worker-src 'self'` for service worker registration
- **i18n**: 4 new keys per locale (`pwa.installTitle`, `pwa.installDescription`, `pwa.install`, `pwa.notNow`)

#### Already Completed (Previous Sessions)
- 4.1 Command Palette (`Cmd+K`): Already existed (command-palette.tsx, use-command-palette.ts, commands.ts)
- 4.3 Export/Import Settings: Already existed (settings-export.ts, use-settings-export.ts, + 14 tests)

#### Stats
- **0 new dependencies** (vanilla service worker, no Serwist/workbox)
- **~1543 i18n keys** per locale (was ~1539)
- **5 new files**: manifest.ts, sw.js, install-prompt.tsx, icon-192x192.png, icon-512x512.png

## [4.3.0] - 2026-02-21

### CI/CD & Documentation (Fase 3)

Release automation, accessibility CI gate, and deployment documentation.

#### 3.3 — Accessibility CI Job (axe-core)
- New `a11y` job in `.github/workflows/ci.yml` runs after `build`
- Installs Playwright + `@axe-core/playwright`, executes `tests/e2e/accessibility.spec.ts`
- Audits 19 pages against WCAG AAA tags — CI fails on critical/serious violations
- SHA-pinned actions + StepSecurity harden-runner (consistent with all other jobs)

#### 3.5 — Deployment Guide
- Created `docs/DEPLOYMENT.md` with complete Vercel deployment instructions
- Environment variables reference: required (AI providers) vs optional (rate limits, Sentry)
- BYOK mechanism documentation (headers, rate limit multipliers)
- Security headers table, rate limiter config, health check endpoint
- CI/CD pipeline overview (10 jobs) with trigger descriptions
- Troubleshooting section for common deployment issues

#### 3.6 — Documentation Updates
- README: Added `a11y` and `release` jobs to CI pipeline sections (EN + ES)
- README: Added DEPLOYMENT.md reference in architecture sections (EN + ES)
- README (ES): Fixed E2E count from "5 tests" to "18 specs"

#### Already Completed (Previous Sessions)
- 3.1 Release workflow: `.github/workflows/release.yml` (SHA-pinned, harden-runner, SBOM)
- 3.2 Bundle size tracking: Already in `ci.yml` build job (du + artifact upload)
- 3.4 SECURITY.md: Already rewritten with real architecture, CI controls, and scope

#### Stats
- **10 CI jobs** total: quality, security, dep-review, build, e2e, a11y, codeql, semgrep, lighthouse, release
- **1 new doc**: `docs/DEPLOYMENT.md` (~130 lines)
- **1 CI job added**: `a11y` (~25 lines)

## [4.2.0] - 2026-02-21

### Testing Expansion (Fase 2)

Comprehensive E2E test coverage expansion from 3 to 18 specs, plus WCAG AA accessibility audit.

#### 2.1 — 15 New E2E Specs (Playwright)
- **uuid-generator**: Generate UUID v4 + bulk generation (5 UUIDs)
- **base64**: Encode "Hello World" → `SGVsbG8gV29ybGQ=` + decode roundtrip
- **regex-humanizer**: Explain `\d{3}-\d{4}` → mentions "digit"
- **variable-name-wizard**: "hello world" → camelCase, snake_case conversions
- **cron-builder**: Default `* * * * *` visible + human-readable description
- **git-commit**: Type/scope form visible + character counter
- **prompt-analyzer**: Paste prompt → score `/10` appears
- **code-review**: Paste code with `eval()` → issues detected
- **cost-calculator**: Pricing table + model names (GPT/Claude/Gemini)
- **token-visualizer**: Type text → token count appears
- **context-manager**: Create project → appears in sidebar
- **http-status**: Status codes 200/404 visible + detail on click
- **dto-matic**: JSON → TypeScript interface generation
- **tailwind-sorter**: Classes → sorted output

#### 2.2 — Accessibility Testing (axe-core)
- **19 pages audited**: All 15 tools + settings + docs + history + tools index
- **WCAG 2.1 AAA** tags: `wcag2a`, `wcag2aa`, `wcag2aaa`, `wcag21a`, `wcag21aa`, `wcag21aaa`, `wcag22aa`
- Filters for critical/serious violations only (no false positives from HeroUI beta)

#### Stats
- **18 E2E specs** (was 3), **~36 test cases**
- **1257 unit tests** (unchanged, already at target)
- Token visualizer: 37 tests, Cost calculator: 46 tests (both already exceeded plan targets)
- Integration tests: hook-error-propagation + cross-module already existed

## [4.1.0] - 2026-02-21

### HeroUI Component Consistency (Fase 1)

Final pass replacing all remaining raw HTML interactive elements with HeroUI v3 components.

#### Converted
- **settings/page.tsx**: Raw `<button>` clearResult → HeroUI `Button`
- **data-table.tsx**: Raw `<input>` search → HeroUI `SearchField` (with SearchIcon + ClearButton)
- **command-palette.tsx**: Raw `<input>` search → HeroUI `SearchField`
- **Documentation**: TFM.md, README.md, ARCHITECTURE.md fully updated with current stats (1257 tests, ~1539 i18n keys, 8 CI jobs, 4 AI providers, 120+ commits)

#### Justified Exceptions (documented)
- 2 `<button role="option">` in command palette — ARIA listbox pattern (HeroUI Button doesn't accept `role`)
- 2 `<input type="file" className="hidden">` — hidden file triggers (no HeroUI alternative)
- 3 `<select>` — HeroUI Dropdown breaks in compact spaces (table cells, stat bars)
- 1 `<textarea>` in MagicInput — HeroUI TextArea focus ring issue in rounded Card

#### Stats
- **0 `<button>` in `app/`**, **0 `<input>` in `components/`** (all converted)
- **0 `console.error/warn/log`** in hooks (all cleaned up)
- **1257 unit tests passing**, **0 type errors**, **0 lint errors**

## [4.0.1] - 2026-02-21

### Context Manager UX Overhaul & UI Polish

Comprehensive iteration on Context Manager until it provides real value, plus MagicInput and cross-tool UI fixes.

#### Context Manager — Full Rewrite
- **Multi-file drag-and-drop**: Global drop zone with overlay, auto-creates window when dropping files with no window selected
- **File browser button**: Native file input with multi-select support (.ts, .tsx, .py, .json, .md and 20+ extensions)
- **Direct file add**: Files from drag/drop/browse added directly — no modal step required
- **Auto-incremental names**: Default window names "My Project", "My Project 2", "My Project 3"...
- **Compact stats bar**: Replaced 4 separate dashboard cards with a single row (model, utilization %, cost, export)
- **Wider document table**: Grid changed from 3/5 to 9/12 columns for the table area, eliminating horizontal scroll
- **Delete confirmation modal**: HeroUI `AlertDialog` with blur backdrop for both document and project deletion
- **Translated priority labels**: High/Medium/Low rendered in user's locale
- **Native select for model & priority**: Replaced HeroUI Dropdown (broke inside tables/compact spaces) with native `<select>`
- **Empty state redesign**: 3-step guide (Create → Add Files → Export) with action buttons

#### MagicInput Fix
- **Focus ring fix**: Replaced HeroUI `TextArea` with native `<textarea>` to eliminate square focus ring inside rounded Card

#### Cross-tool Polish
- **max-w-7xl standardization**: All 15 tool pages now use consistent 1280px max width
- **React Compiler compliance**: Moved `pendingFilesRef.current` access from render to `useEffect`

#### i18n
- **23 new keys** in both `en.json` and `es.json` (~1539 keys per locale, up from ~1507)

#### Stats
- **1257 unit tests passing** (unchanged)
- **0 type errors**, **0 lint errors**, production build verified

## [4.0.0] - 2026-02-21

### Feature Enhancements — "Wow Factor" Release

Major feature additions: Command Palette, Export/Import Settings, and comprehensive testing. Zero new dependencies.

#### 4.1 — Command Palette (Cmd+K)
- **Global keyboard shortcut**: `Cmd+K` / `Ctrl+K` opens from anywhere
- **20 commands**: 15 tools + 5 actions (toggle theme, toggle locale, settings, docs, history)
- **Instant search**: filters by translated name, description, and ID
- **Keyboard navigation**: arrow keys, Enter to execute, Escape to close
- **Zero dependencies**: built with HeroUI `Modal` + custom search + keyboard handlers
- **Files**: `config/commands.ts`, `hooks/use-command-palette.ts`, `components/shared/command-palette.tsx`
- **i18n**: 16 new keys in both locales

#### 4.2 — Export/Import Settings
- **Export**: downloads all `devflow-*` localStorage keys as timestamped JSON
- **Import**: validates file format (appName, version, devflow-prefix filter), writes to localStorage
- **Security**: rejects non-devflow keys, validates string types only
- **14 unit tests**: roundtrip, validation edge cases, filename format
- **Files**: `types/settings-export.ts`, `lib/application/settings-export.ts`, `hooks/use-settings-export.ts`
- **UI**: new card in Settings page with Export/Import buttons

#### Stats
- **1257 unit tests passing** (up from 1243, +14 new)
- **29 test files** (up from 28)
- **~20 new i18n keys** per locale
- **0 new dependencies**

## [3.9.0] - 2026-02-21

### CI/CD & Documentation

Release automation, bundle tracking, accessibility CI, and comprehensive documentation.

#### 3.1 — Release Workflow
- **`.github/workflows/release.yml`** — automated GitHub Release on tag push (`v*`) or manual dispatch
- Uses `softprops/action-gh-release` (SHA-pinned) with auto-generated release notes
- Builds, generates CycloneDX SBOM, and attaches it to the release
- StepSecurity harden-runner on all steps

#### 3.2 — Bundle Size Tracking
- Added bundle size recording step to CI `build` job
- Records total `.next/` size and top 20 JS chunks
- Uploads as artifact for PR comparison

#### 3.3 — Accessibility CI
- New `a11y` job in CI pipeline (runs after build)
- Executes `tests/e2e/accessibility.spec.ts` with axe-core against all 19 pages
- WCAG 2.0 AA compliance enforced on every push/PR

#### 3.4 — SECURITY.md Rewrite
- Replaced GitHub template with real security policy
- Documents: supported versions (3.x), local-first architecture, CSP, rate limiter, CI security jobs
- Vulnerability reporting via GitHub Security Advisories
- Clear in-scope/out-of-scope definitions

#### 3.5 — DEPLOYMENT.md
- Vercel setup guide with env vars table (required vs optional)
- Docker self-hosting instructions with multi-stage Dockerfile
- Rate limiter configuration documentation

#### Stats
- **7 CI jobs** → **8 CI jobs** (added `a11y`)
- **3 new files**: `release.yml`, `SECURITY.md` (rewrite), `DEPLOYMENT.md`

## [3.8.0] - 2026-02-21

### Testing Expansion

Comprehensive testing coverage expansion: 15 E2E specs (from 3), axe-core accessibility testing, and strengthened unit tests.

#### 2.1 — 14 New E2E Specs (14 files)
- **prompt-analyzer** — Analyzes prompt, verifies score appears
- **code-review** — Reviews code with issues, verifies findings
- **cost-calculator** — Verifies model cost data renders
- **uuid-generator** — Generates UUID, verifies format
- **base64** — Encodes text, verifies base64 output
- **regex-humanizer** — Explains regex pattern
- **variable-name-wizard** — Generates naming suggestions
- **dto-matic** — Generates code from JSON
- **cron-builder** — Verifies cron description
- **git-commit** — Generates conventional commit message
- **http-status** — Searches and finds status codes
- **tailwind-sorter** — Sorts Tailwind classes
- **token-visualizer** — Visualizes tokens from text
- **context-manager** — Verifies model presets

#### 2.2 — Accessibility Testing with axe-core (1 file)
- **accessibility.spec.ts** — WCAG 2.0 AA audit across all 19 pages (15 tools + tools index + settings + docs + history)
- Uses `@axe-core/playwright` with `color-contrast` rule disabled for HeroUI beta upstream issues

#### 2.3 — Unit Test Strengthening (+53 tests)
- **token-visualizer.test.ts** — 21 new tests (16 → 37): providers, unicode, waste detection, sub-word splitting, contractions, efficiency scoring
- **cost-calculator.test.ts** — 24 new tests (22 → 46): value score, custom models, currency formatting boundaries, edge cases
- **hook-error-propagation.test.ts** — 8 new integration tests: verifies error state propagation in use-variable-name-wizard, use-regex-humanizer, use-dto-matic

#### Stats
- **1243 unit tests passing** (up from 1190, +53 new)
- **18 E2E spec files** (3 original + 14 new + 1 accessibility)
- **1 new dev dependency**: `@axe-core/playwright`

## [3.7.0] - 2026-02-21

### HeroUI Component Consistency

Eliminated ALL raw HTML `<button>` and `<input>` elements from production code. Every interactive element now uses HeroUI v3 components for consistent accessibility, keyboard navigation, and touch targets (44px WCAG 2.2 AA).

#### 1.1 — Tool Pages: Raw Buttons → HeroUI Button (12 files)
- **tools/page.tsx** — Search `<input>` → HeroUI `SearchField`; 6 category filter `<button>` → `Button`
- **uuid-generator** — 5 version selection buttons → `Button` with `role="radiogroup"`
- **variable-name-wizard** — 10 language + batch target buttons → `Button`
- **code-review** — Severity filter buttons → `Button` with variant toggle
- **prompt-analyzer** — History toggle + compare clear buttons → `Button`
- **dto-matic** — File list selection buttons → `Button`
- **context-manager** — Model preset dropdown trigger → `Button`
- **git-commit-generator** — Add point button → `Button`
- **cron-builder** — 4 infrastructure format buttons → `Button` with `role="radiogroup"`
- **http-status-finder** — Category filters + decision wizard + status code cards → `Button`
- **regex-humanizer** — 8 preset buttons + 6 cheat sheet buttons → `Button`
- **json-formatter** — Path copy button → `Button`

#### 1.2 — Layout, Shared, Pages: Raw Buttons → HeroUI Button (12 files)
- **layout.tsx** — 3 sidebar buttons (AI setup, close, mobile toggle) → `Button`
- **theme-toggle.tsx** — Toggle button → `Button isIconOnly`
- **locale-toggle.tsx** — 2 locale buttons → `Button`
- **share-buttons.tsx** — Copy link button → `Button isIconOnly`
- **toast-container.tsx** — Dismiss button → `Button isIconOnly`
- **navbar.tsx** — Mobile menu toggle → `Button isIconOnly`
- **settings/page.tsx** — Theme toggles → `Button`; notification/AI toggles → `Switch`; API key → `TextField`
- **history/page.tsx** — Search → `SearchField`; filter buttons → `Button`
- **docs/page.tsx** — Search → `SearchField`; category buttons → `Button`
- **error.tsx** + **dashboard/error.tsx** — Try Again → `Button variant="danger"`
- **api-key-guide.tsx** — Provider selection → `Button`; API key input → `InputGroup`; show/hide → `Button isIconOnly`

#### 1.3 — Raw Inputs → HeroUI Components (1 file)
- **cost-calculator** — 3 range `<input>` → HeroUI `Slider` (compound pattern with Label/Track/Fill/Thumb) + 3 number `<input>` → `NumberField`

#### 1.4 — Console.error → Error State (3 hooks)
- **use-variable-name-wizard.ts** — Added `error` state, replaced 2 `console.error` with `setError`
- **use-regex-humanizer.ts** — Added `error` state, replaced 3 `console.error` with `setError`
- **use-dto-matic.ts** — Replaced 1 `console.error` with `setError` (already had error state)

#### i18n
- **3 new keys** added to both `en.json` and `es.json`: `tools.filterByCategory`, `httpStatus.filterByCategory`, `cron.infraFormat`

#### Stats
- **0 raw `<button>` or `<input>`** in production code (only `data-table.tsx` v2 wrapper remains)
- **~30 files modified** across app, components, and hooks
- **1190 tests passing**, **0 type errors**, **0 lint errors**

## [3.6.0] - 2026-02-20

### Quality Sprint: Full i18n, Coverage Boost, Performance & Dependency Updates

#### Phase 1: Bug Fixes (3 fixes)
- **DataTable duplicate keys** — replaced array-index IDs with content-based keys in 4 tool pages (json-formatter, cron-builder, code-review, tailwind-sorter), eliminating React key warnings during sort/filter
- **DataTable a11y** — added `aria-label` to search input for screen reader compatibility
- **Hook exhaustive-deps** — fixed missing `t` dependency in `use-dto-matic.ts` callbacks (`generate`, `formatInput`); removed unused `_error` variable in `use-cost-calculator.ts`

#### Phase 2: Full i18n (33 new keys, 18 files updated)
- **33 new i18n keys** added to both `en.json` and `es.json` (1443 → 1476 keys)
- **29 hardcoded aria-labels** replaced with `t()` calls across 18 component/page files — Tabs, Dropdowns, buttons, navigation, breadcrumbs, share buttons, toast dismiss, skeleton loading
- **6 hardcoded placeholders** replaced with `t()` calls — context-manager filenames, regex examples, DTO root name, UUID hex prefix
- Components updated: share-buttons, toast-container, skeletons (converted to client component), navbar, tool-header, about page, + 11 tool pages

#### Phase 3: Coverage Boost (+123 tests)
- **tailwind-sorter.ts** — 16 new tests (37 → 53), branch coverage 77.64% → **88.23%** (conflict detection, semantic audit, breakpoint analysis, sortWithinGroups)
- **tool-recommendations.ts** — 79 new tests (22 → 101), statements 83% → **98.52%** (all 10 detectors, all 14 rules, edge cases)
- **uuid-generator.ts** — 28 new tests (64 → 92), functions 85% → **100%** (checkCollisions, parseUuid entropy, collision stats)

#### Phase 4: Performance
- **React.memo** — wrapped `ToolCard` component to prevent unnecessary re-renders when parent (tool grid) updates

#### Phase 5: Dependencies
- **npm update** — updated all packages within semver ranges (Tailwind v4.2, framer-motion 12.34, HeroUI table 2.2.31, ESLint 9.39.3, jsdom 28.1, tailwind-merge 3.5, types updates)

#### Stats
- **1190 tests passing** (up from 1067, +123 new tests)
- **1476 i18n keys** per locale (up from 1443)
- **0 type errors**, **0 lint errors**, production build verified

## [3.5.1] - 2026-02-20

### DataTable v3 Migration, Coverage & i18n Fixes

#### DataTable — HeroUI v3 Migration
- **Dropdown popover fix** — migrated from v2-style API (`DropdownTrigger`, `DropdownMenu`, `DropdownItem`) to v3 compound pattern (`Dropdown.Popover`, `Dropdown.Menu`, `Dropdown.Item` with `ItemIndicator` + `Label`). Menus now render in proper floating popovers instead of inline
- **Pagination horizontal fix** — added `@source "../node_modules/@heroui/theme/dist"` so Tailwind v4 scans HeroUI v2 utility classes (`flex-nowrap`, `h-fit`, `max-w-fit`, etc.). Fixed CSS child combinator to prevent `data-slot="wrapper"` matching both table wrapper and pagination `<ul>`
- **Duplicate key fix** — removed `Date.now()` suffix from `calculateCost()` IDs; `model.id` is already unique (LiteLLM JSON keys). Eliminates React "two children with same key" warnings
- **Button nesting fix** — replaced `Dropdown.Trigger > Button` (button-in-button) with Button as direct child of Dropdown, fixing hydration warnings

#### Coverage — regex-humanizer.ts (CI blocker)
- **42 new tests** (92 → 134 total) covering `performSafetyAnalysis`, `explainCharClass`, `explainGroup`, `explainQuantifier`, `findMatchingBracket`, `extractGroups`, `buildExplanation`, `detectCommonPattern`
- Function coverage: 67.46% → 94%+, unblocking CI

#### i18n
- **5 Spanish translations** — "open source" → "codigo abierto" in `dashboard.allFree`, `home.openSource`, `home.powerfulToolsDesc`, `home.ctaTitle`, `home.footerFreeOS`

#### Housekeeping
- **.gitignore** — added `playwright-report/`, `test-results/`, reference screenshots, `audit_report.md`
- **1067 tests passing** (up from 1025, +42 new tests)

## [3.5.0] - 2026-02-20

### Full Project Audit: 8 Bug Fixes, DataTable Upgrade, i18n for 6 Libs, 1025 Tests

#### Phase 1: P0 Critical Bugs (8 fixes)
- **Cron Builder** — fixed locale check using string matching; now uses `!explanation` (null when invalid)
- **Git Commit Generator** — fixed variable shadowing (`t` clashed with translation hook)
- **DTO-Matic** — error state was never displayed; added error banner + replaced 5 hardcoded Spanish strings with `t()` keys
- **HTTP Status Finder** — removed CORS-blocked "Test Live" fetch; replaced with simulated local response
- **Base64** — JSON preview crashed on invalid JSON; wrapped `JSON.parse` in try/catch
- **Tailwind Sorter** — dead audit check: condition checked single class instead of full class set
- **Cron Builder AWS** — invalid JSON template with inline `# Note:` comment inside JSON string
- **Tailwind Sorter** — Ctrl+Enter was no-op; wired to `sort()`, renamed `setActiveTab` → `setActiveView`

#### Phase 2: DataTable Visual Upgrade (12 tools affected)
- **Polished classNames** — styled header row (`bg-default-100`), hover transitions, lighter dividers
- **Search bar** — `bg-default-100`, `sm:max-w-[300px]`
- **Rows per page** — styled selector with `bg-default-100 rounded-lg`
- **Pagination** — added `showControls`, `variant="outline"` buttons

#### Phase 3: Pattern Consistency (12 files)
- **useCallback wrappers** — added to 3 hooks (tailwind-sorter, variable-name-wizard, token-visualizer) + 2 renderCell callbacks
- **5-layer extractions** — `checkCollisions()` → `lib/application/uuid-generator.ts`, `generateBatch()` → `useGitCommitGenerator` hook
- **DOM leak fix** — Base64 file input cleanup (`fileInput.onchange = null`)
- **Hardcoded strings** — 6 aria-labels + toasts → `t()` keys
- **Import consistency** — moved Card/Button imports to `@/components/ui`
- **prompt-analyzer** — wrapped `ISSUE_LABELS` in `useMemo([t])`

#### Phase 4: i18n Systematic Fix (~300+ strings across 6 libs)
- **Cron Builder** — `CRON_STRINGS` en/es (~200 strings: presets, field labels, month/day names, validation errors, explanation templates, relative time). All functions accept `locale` param. 111 tests.
- **Git Commit Generator** — `COMMIT_STRINGS` en/es (type descriptions + 7 validation messages). `getCommitTypes(locale)` + `validateCommitMessage` locale-aware. 79 tests.
- **HTTP Status Finder** — 63 status codes × 3 fields × 2 languages + 5 category descriptions. Bilingual search (both locales). `statusCodesCache` for performance. 64 tests.
- **Regex Humanizer** — ~120 strings: token explanations, character classes, groups, quantifiers, flags, 8 common patterns. English + Spanish keyword detection for `generateRegex`. 92 tests.
- **Variable Name Wizard** — `WIZARD_STRINGS` en/es for `generateReasoning` + `performAudit` (12 strings). LocalStorage persistence added.
- **Cost Calculator** — `formatCost` accepts locale, uses `es-ES`/`en-US` for `toLocaleString`

#### Phase 5: Per-Tool UX Improvements
- **Context Manager** — native `<select>` replaced with HeroUI Dropdown component
- **JSON Formatter** — removed `| string` type widening for exhaustiveness checking
- **Variable Name Wizard** — added localStorage persistence for config (read/write)
- **Regex Humanizer** — fixed `DANGEROUS_PATTERNS[2]` false positives (`|\+` matched any `+`)

#### Testing
- **1025 tests passing** (up from 942, +83 new tests)
- **37 files modified**, +2307/-852 lines

## [3.4.1] - 2026-02-19

### UX Polish: Cost Calculator Detail Modal, Navbar Redesign & i18n Fixes

#### Cost Calculator
- **Blur detail modal** — Eye button opens model detail with blur backdrop showing pricing per 1M tokens, context window, max output, benchmark score, per-request cost, monthly estimate
- **Copy config action** — Copy icon exports model config as JSON
- **Translated column headers** — all table columns now use `t()` keys

#### Navbar Redesign (WCAG AAA)
- **Descriptive icons** — Wrench for Tools, BookOpen for Docs in nav links
- **Skip-to-content link** — hidden link for screen readers, visible on focus
- **Focus indicators** — `focus-visible:outline-2 outline-offset-2` on all interactive elements
- **44px touch targets** — mobile menu button meets WCAG 2.2 AA minimum
- **CTA button** — includes Wrench icon for visual consistency

#### i18n Fixes
- **Landing page** — refactored to client component (`HomeContent`) so locale changes apply instantly
- **Theme toggle** — translated aria-labels ("Light mode" / "Modo claro", etc.)
- **Copy button** — translated default "Copy to clipboard" aria-label
- **Navbar** — translated toggle menu aria-label
- **History page** — tool names keyed by slug, displayed via `t()` instead of hardcoded English
- **~55 new i18n keys** across both locale files

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
