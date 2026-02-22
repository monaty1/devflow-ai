# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Dev server with Turbopack (localhost:3000)
npm run build            # Production build
npm run start            # Production server (after build)
npm run lint             # ESLint (flat config, eslint.config.mjs)
npm run lint:fix         # ESLint with auto-fix
npm run type-check       # TypeScript strict check (tsc --noEmit)
npm run test             # Vitest watch mode
npm run test:run         # Single test run (all tests)
npm run test:coverage    # Coverage with per-file thresholds enforced
npm run test:e2e         # Playwright E2E tests (builds first)
npm run test:e2e:ui      # Playwright with interactive UI
npm run audit:security   # npm audit --audit-level=high
npm run analyze          # Bundle analysis (ANALYZE=true next build)

# Run a single test file:
npx vitest run tests/unit/application/json-formatter.test.ts

# Run tests matching a pattern:
npx vitest run -t "should format"

# Run a single E2E test:
npx playwright test tests/e2e/navigation.spec.ts
```

## Architecture

15-tool developer toolkit with local-first browser tools and optional server-side AI. All tool state persists via localStorage with `devflow-*` prefix keys.

### 5-Layer Pattern (every tool follows this)

```
types/<tool>.ts                              → Interfaces & domain types
lib/application/<tool>.ts (or <tool>/index.ts) → Pure logic (no React, no side effects)
hooks/use-<tool>.ts                          → "use client" hook with state + localStorage
app/(dashboard)/tools/<slug>/page.tsx        → UI page component
tests/unit/application/<tool>.test.ts        → Unit tests for pure logic
```

Dependency flow: **Page → Hook → lib/application → types** (never backwards).

### AI Backend (Optional Layer)

Tools that use AI add two extra layers:

```
hooks/use-ai-<feature>.ts                    → AI hook (useSWRMutation)
app/api/ai/<endpoint>/route.ts               → Route Handler (server-side)
```

6 Route Handlers: `/api/ai/{review,suggest,refine,tokenize,status}` + `/api/health`

**Provider chain** (`infrastructure/external/ai-provider-factory.ts`): BYOK key → Gemini 2.0 Flash → Groq → OpenRouter → Pollinations (free fallback, no key needed). BYOK via `X-DevFlow-API-Key` + `X-DevFlow-Provider` headers.

**Rate limiter** (`infrastructure/services/rate-limiter.ts`): In-memory, IP-based singleton. Defaults: 10 RPM / 500K daily tokens. BYOK users get 5x limits. Configurable via `RATE_LIMIT_RPM` and `RATE_LIMIT_DAILY_TOKENS` env vars.

**Server env** (`infrastructure/config/env.ts`): Zod-validated, cached. `isAIConfigured()` checks provider availability.

### Clean Architecture Layers

Beyond the 5-layer tool pattern, the AI backend follows Clean Architecture:

```
domain/                              → Entities, value objects, repositories, services, errors
application/ports/ai-provider.port.ts → AIProviderPort interface
infrastructure/external/             → AI provider clients (gemini, groq, openrouter, pollinations)
infrastructure/services/             → Rate limiter, pricing service
infrastructure/config/env.ts         → Zod-validated server env
```

### Route Groups

- `app/(marketing)/` — Landing page, about
- `app/(dashboard)/` — Sidebar layout + 15 tool pages + docs, favorites, history, settings
- `app/(dashboard)/tools/[toolId]/page.tsx` — Dynamic tool detail page (reads from `config/tools-data.ts`)
- `app/(dashboard)/tools/<slug>/page.tsx` — Individual tool implementations

### Key Shared Infrastructure

- **Provider chain** (`app/providers.tsx`): ThemeProvider → HeroUIProvider → SWRConfig → FavoritesProvider → ToastProvider (+ HtmlLangSync, CommandPalette, InstallPrompt)
- **Tool registry** (`config/tools-data.ts`): All 15 tools defined with metadata, icons, categories
- **AI model pricing** (`config/ai-models.ts`): Static pricing for 8 models across 5 providers; live prices fetched via `infrastructure/services/pricing-service.ts` from LiteLLM GitHub JSON
- **Icon map** (`config/tool-icon-map.ts`): Maps tool icon strings to Lucide components
- **i18n** (`hooks/use-translation.ts`): Flat JSON dictionaries in `locales/en.json` and `locales/es.json`. Uses zustand store (`lib/stores/locale-store.ts`) for locale. Keys are flat strings like `"tools.free"`.
- **Smart navigation** (`hooks/use-smart-navigation.ts`): Cross-tool data passing via localStorage key `devflow-shared-data`
- **DataTable** (`components/ui/data-table.tsx`): Custom wrapper around `@heroui/table` v2 + `@heroui/pagination` v2 (intentionally kept on v2, separate from v3 migration)
- **cn()** (`lib/utils.ts`): clsx + tailwind-merge utility

### API Utilities

- **Middleware** (`lib/api/middleware.ts`): `getClientIP`, `extractBYOK`, `withRateLimit`, `validateBody`, `successResponse`, `errorResponse`
- **Schemas** (`lib/api/schemas/`): Zod validation schemas for AI route handlers
- **Fetcher** (`lib/api/fetcher.ts`): SWR-compatible fetch wrapper

### State Management

- Zustand stores: `lib/stores/locale-store.ts` (i18n) + `lib/stores/ai-settings-store.ts` (BYOK key/provider, AI enabled state)
- React Context for favorites (`lib/context/favorites-context.tsx`)
- SWR (`useSWRMutation`) for AI hook data fetching
- Per-tool hooks use `useState` + localStorage directly (no global store)

## Testing Strategy: 100/80/0

| Tier | Path | Target |
|------|------|--------|
| CORE | `lib/application/*.ts` | 80-100% per-file |
| IMPORTANT | `components/shared/*.tsx` (select files) | 80% |
| INFRA | `types/`, `config/`, stores | 0% (TypeScript enforces) |

- Vitest with `perFile: true` — each file must individually meet thresholds
- Test setup: `tests/setup.ts` (mocks `window.matchMedia` + `next/navigation`, adds jest-dom matchers, cleanup in `afterEach`)
- CI fails if any CORE file drops below 80% statements/lines/functions or 70% branches

Test directory structure:

```
tests/unit/application/     → 19 test files (one per lib/application module + shared/naming-utils, prototype-pollution)
tests/unit/infrastructure/  → 8 test files (AI providers, rate limiter, pricing, env)
tests/unit/api/             → 5 test files (route handler logic)
tests/component/            → 11 files (copy-button, status-badge, toast, tool-header, command-palette, theme-toggle, locale-toggle, install-prompt, tool-suggestions, error-boundary, api-key-guide)
tests/integration/          → Cross-tool pipeline integration tests
tests/e2e/                  → 20 Playwright specs: 15 tools + navigation + settings + accessibility + command-palette + settings-export
```

Playwright config: Chromium only, `tests/e2e/` dir, auto builds + starts server, 180s timeout, 2 retries on CI.

## TypeScript

Maximum strict mode — every strict flag enabled plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`. Zero `any` policy. Use bracket notation for index signatures.

Path aliases: `@/*` maps to project root (e.g., `@/lib/application/json-formatter`, `@/components/shared/copy-button`). Also `@/domain/*`, `@/application/*`, and `@/infrastructure/*` for Clean Architecture layers.

## UI Conventions

- **HeroUI v3 beta** (`@heroui/react@^3.0.0-beta.5`) with compound component pattern. **Exception:** DataTable uses `@heroui/table@^2.2.30` + `@heroui/pagination@^2.2.26` (v2 wrapper, intentionally stays on v2).
- **Tailwind CSS v4** (CSS-first config, no `tailwind.config.js`)
- **Lucide React** for all icons
- **Animations**: GSAP (scroll/complex) + Framer Motion (layout/transitions)
- **Forms**: react-hook-form + @hookform/resolvers + zod for validation
- **Tokenization**: js-tiktoken for client-side token counting
- Dark/light mode via `next-themes` with `attribute="class"`

## next.config.ts

- `reactCompiler: true` — stable React Compiler
- `experimental.viewTransition: true` — View Transitions API
- `experimental.optimizePackageImports` for lucide-react, framer-motion, @heroui/react, @heroui/styles, gsap, zod, react-hook-form, recharts, js-tiktoken
- Security headers on all routes; **CSP skipped in dev** (`NODE_ENV === 'production'` only) for Turbopack compatibility
- `compiler.removeConsole` strips all `console.*` in production
- `images.formats: ["image/avif", "image/webp"]`
- Sentry wrapping with `withSentryConfig` (silent, deletes sourcemaps after upload)

## Sentry (Optional)

Only active when `NEXT_PUBLIC_SENTRY_DSN` env var is set. Config files: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`. Server/edge init via `instrumentation.ts` at project root.

## CI Pipeline

`.github/workflows/ci.yml` — 6 jobs on push to `main`/`develop` and all PRs (Node 20):
- **quality** — lint → typecheck → tests+coverage → PR coverage comment
- **security** — `npm audit --audit-level=high` + `lockfile-lint`
- **dependency-review** — PR-only, `fail-on-severity: moderate`
- **build** — production build + CycloneDX SBOM generation
- **a11y** — axe-core WCAG AA accessibility audit on all pages
- **e2e** — Playwright tests (after build succeeds, Chromium)

3 additional workflow files:
- `.github/workflows/codeql.yml` — CodeQL SAST (JS/TS, `security-extended`, weekly + push/PR)
- `.github/workflows/semgrep.yml` — Semgrep SAST (OWASP Top 10, React, Next.js rulesets, uploads SARIF)
- `.github/workflows/lighthouse.yml` — Lighthouse CI on PRs (audits `/`, `/tools`, `/tools/json-formatter`)

All actions SHA-pinned, StepSecurity `harden-runner` on all jobs. `eslint-plugin-security` configured in flat config. Renovate configured for automated dependency updates (`renovate.json`).

<!-- HEROUI-REACT-AGENTS-MD-START -->
[HeroUI React v3 Docs Index]|root: ./.heroui-docs/react|STOP. What you remember about HeroUI React v3 is WRONG for this project. Always search docs and read before any task.|If docs missing, run this command first: heroui agents-md --react --output CLAUDE.md|.:{components\(buttons)\button-group.mdx,components\(buttons)\button.mdx,components\(buttons)\close-button.mdx,components\(collections)\dropdown.mdx,components\(collections)\list-box.mdx,components\(collections)\tag-group.mdx,components\(colors)\color-area.mdx,components\(colors)\color-field.mdx,components\(colors)\color-picker.mdx,components\(colors)\color-slider.mdx,components\(colors)\color-swatch-picker.mdx,components\(colors)\color-swatch.mdx,components\(controls)\slider.mdx,components\(controls)\switch.mdx,components\(data-display)\chip.mdx,components\(feedback)\alert.mdx,components\(feedback)\skeleton.mdx,components\(feedback)\spinner.mdx,components\(forms)\checkbox-group.mdx,components\(forms)\checkbox.mdx,components\(forms)\date-field.mdx,components\(forms)\description.mdx,components\(forms)\error-message.mdx,components\(forms)\field-error.mdx,components\(forms)\fieldset.mdx,components\(forms)\form.mdx,components\(forms)\input-group.mdx,components\(forms)\input-otp.mdx,components\(forms)\input.mdx,components\(forms)\label.mdx,components\(forms)\number-field.mdx,components\(forms)\radio-group.mdx,components\(forms)\search-field.mdx,components\(forms)\text-area.mdx,components\(forms)\text-field.mdx,components\(forms)\time-field.mdx,components\(layout)\card.mdx,components\(layout)\separator.mdx,components\(layout)\surface.mdx,components\(media)\avatar.mdx,components\(navigation)\accordion.mdx,components\(navigation)\breadcrumbs.mdx,components\(navigation)\disclosure-group.mdx,components\(navigation)\disclosure.mdx,components\(navigation)\link.mdx,components\(navigation)\tabs.mdx,components\(overlays)\alert-dialog.mdx,components\(overlays)\modal.mdx,components\(overlays)\popover.mdx,components\(overlays)\toast.mdx,components\(overlays)\tooltip.mdx,components\(pickers)\autocomplete.mdx,components\(pickers)\combo-box.mdx,components\(pickers)\select.mdx,components\(typography)\kbd.mdx,components\(utilities)\scroll-shadow.mdx,components\index.mdx,getting-started\(handbook)\animation.mdx,getting-started\(handbook)\colors.mdx,getting-started\(handbook)\composition.mdx,getting-started\(handbook)\styling.mdx,getting-started\(handbook)\theming.mdx,getting-started\(overview)\design-principles.mdx,getting-started\(overview)\quick-start.mdx,getting-started\(ui-for-agents)\agent-skills.mdx,getting-started\(ui-for-agents)\agents-md.mdx,getting-started\(ui-for-agents)\llms-txt.mdx,getting-started\(ui-for-agents)\mcp-server.mdx,getting-started\index.mdx,releases\index.mdx,releases\v3-0-0-alpha-32.mdx,releases\v3-0-0-alpha-33.mdx,releases\v3-0-0-alpha-34.mdx,releases\v3-0-0-alpha-35.mdx,releases\v3-0-0-beta-1.mdx,releases\v3-0-0-beta-2.mdx,releases\v3-0-0-beta-3.mdx,releases\v3-0-0-beta-4.mdx,releases\v3-0-0-beta-6.mdx}|demos/.:{accordion\basic.tsx,accordion\custom-indicator.tsx,accordion\custom-styles.tsx,accordion\disabled.tsx,accordion\faq.tsx,accordion\multiple.tsx,accordion\surface.tsx,accordion\without-separator.tsx,alert-dialog\backdrop-variants.tsx,alert-dialog\close-methods.tsx,alert-dialog\controlled.tsx,alert-dialog\custom-animations.tsx,alert-dialog\custom-backdrop.tsx,alert-dialog\custom-icon.tsx,alert-dialog\custom-portal.tsx,alert-dialog\custom-trigger.tsx,alert-dialog\default.tsx,alert-dialog\dismiss-behavior.tsx,alert-dialog\placements.tsx,alert-dialog\sizes.tsx,alert-dialog\statuses.tsx,alert-dialog\with-close-button.tsx,alert\basic.tsx,autocomplete\allows-empty-collection.tsx,autocomplete\asynchronous-filtering.tsx,autocomplete\controlled-open-state.tsx,autocomplete\controlled.tsx,autocomplete\custom-indicator.tsx,autocomplete\default.tsx,autocomplete\disabled.tsx,autocomplete\email-recipients.tsx,autocomplete\full-width.tsx,autocomplete\location-search.tsx,autocomplete\multiple-select.tsx,autocomplete\required.tsx,autocomplete\single-select.tsx,autocomplete\tag-group-selection.tsx,autocomplete\user-selection-multiple.tsx,autocomplete\user-selection.tsx,autocomplete\variants.tsx,autocomplete\with-description.tsx,autocomplete\with-disabled-options.tsx,autocomplete\with-sections.tsx,avatar\basic.tsx,avatar\colors.tsx,avatar\custom-styles.tsx,avatar\fallback.tsx,avatar\group.tsx,avatar\sizes.tsx,avatar\variants.tsx,breadcrumbs\basic.tsx,breadcrumbs\custom-separator.tsx,breadcrumbs\disabled.tsx,breadcrumbs\level-2.tsx,breadcrumbs\level-3.tsx,button-group\basic.tsx,button-group\disabled.tsx,button-group\full-width.tsx,button-group\sizes.tsx,button-group\variants.tsx,button-group\with-icons.tsx,button-group\without-separator.tsx,button\basic.tsx,button\custom-variants.tsx,button\disabled.tsx,button\full-width.tsx,button\icon-only.tsx,button\loading-state.tsx,button\loading.tsx,button\outline-variant.tsx,button\ripple-effect.tsx,button\sizes.tsx,button\social.tsx,button\variants.tsx,button\with-icons.tsx,card\default.tsx,card\horizontal.tsx,card\variants.tsx,card\with-avatar.tsx,card\with-form.tsx,card\with-images.tsx,checkbox-group\basic.tsx,checkbox-group\controlled.tsx,checkbox-group\disabled.tsx,checkbox-group\features-and-addons.tsx,checkbox-group\indeterminate.tsx,checkbox-group\on-surface.tsx,checkbox-group\validation.tsx,checkbox-group\with-custom-indicator.tsx,checkbox\basic.tsx,checkbox\controlled.tsx,checkbox\custom-indicator.tsx,checkbox\custom-styles.tsx,checkbox\default-selected.tsx,checkbox\disabled.tsx,checkbox\form.tsx,checkbox\full-rounded.tsx,checkbox\indeterminate.tsx,checkbox\invalid.tsx,checkbox\render-props.tsx,checkbox\variants.tsx,checkbox\with-description.tsx,checkbox\with-label.tsx,chip\basic.tsx,chip\statuses.tsx,chip\variants.tsx,chip\with-icon.tsx,close-button\default.tsx,close-button\interactive.tsx,close-button\variants.tsx,close-button\with-custom-icon.tsx,color-area\basic.tsx,color-area\controlled.tsx,color-area\disabled.tsx,color-area\space-and-channels.tsx,color-area\with-dots.tsx,color-field\basic.tsx,color-field\channel-editing.tsx,color-field\controlled.tsx,color-field\disabled.tsx,color-field\form-example.tsx,color-field\full-width.tsx,color-field\invalid.tsx,color-field\on-surface.tsx,color-field\required.tsx,color-field\variants.tsx,color-field\with-description.tsx,color-picker\basic.tsx,color-picker\controlled.tsx,color-picker\with-fields.tsx,color-picker\with-sliders.tsx,color-picker\with-swatches.tsx,color-slider\alpha-channel.tsx,color-slider\basic.tsx,color-slider\channels.tsx,color-slider\controlled.tsx,color-slider\disabled.tsx,color-slider\rgb-channels.tsx,color-slider\vertical.tsx,color-swatch-picker\basic.tsx,color-swatch-picker\controlled.tsx,color-swatch-picker\custom-indicator.tsx,color-swatch-picker\default-value.tsx,color-swatch-picker\disabled.tsx,color-swatch-picker\sizes.tsx,color-swatch-picker\stack-layout.tsx,color-swatch-picker\variants.tsx,color-swatch\accessibility.tsx,color-swatch\basic.tsx,color-swatch\custom-styles.tsx,color-swatch\shapes.tsx,color-swatch\sizes.tsx,color-swatch\transparency.tsx,combo-box\allows-custom-value.tsx,combo-box\asynchronous-loading.tsx,combo-box\controlled-input-value.tsx,combo-box\controlled.tsx,combo-box\custom-filtering.tsx,combo-box\custom-indicator.tsx,combo-box\custom-value.tsx,combo-box\default-selected-key.tsx,combo-box\default.tsx,combo-box\disabled.tsx,combo-box\full-width.tsx,combo-box\menu-trigger.tsx,combo-box\on-surface.tsx,combo-box\required.tsx,combo-box\with-description.tsx,combo-box\with-disabled-options.tsx,combo-box\with-sections.tsx,date-field\basic.tsx,date-field\controlled.tsx,date-field\disabled.tsx,date-field\form-example.tsx,date-field\full-width.tsx,date-field\granularity.tsx,date-field\invalid.tsx,date-field\on-surface.tsx,date-field\required.tsx,date-field\variants.tsx,date-field\with-description.tsx,date-field\with-prefix-and-suffix.tsx,date-field\with-prefix-icon.tsx,date-field\with-suffix-icon.tsx,date-field\with-validation.tsx,description\basic.tsx,disclosure-group\basic.tsx,disclosure-group\controlled.tsx,disclosure\basic.tsx,dropdown\controlled-open-state.tsx,dropdown\controlled.tsx,dropdown\custom-trigger.tsx,dropdown\default.tsx,dropdown\long-press-trigger.tsx,dropdown\single-with-custom-indicator.tsx,dropdown\with-custom-submenu-indicator.tsx,dropdown\with-descriptions.tsx,dropdown\with-disabled-items.tsx,dropdown\with-icons.tsx,dropdown\with-keyboard-shortcuts.tsx,dropdown\with-multiple-selection.tsx,dropdown\with-section-level-selection.tsx,dropdown\with-sections.tsx,dropdown\with-single-selection.tsx,dropdown\with-submenus.tsx,error-message\basic.tsx,error-message\with-tag-group.tsx,field-error\basic.tsx,fieldset\basic.tsx,fieldset\on-surface.tsx,form\basic.tsx,input-group\default.tsx,input-group\disabled.tsx,input-group\full-width.tsx,input-group\invalid.tsx,input-group\on-surface.tsx,input-group\password-with-toggle.tsx,input-group\required.tsx,input-group\variants.tsx,input-group\with-badge-suffix.tsx,input-group\with-copy-suffix.tsx,input-group\with-icon-prefix-and-copy-suffix.tsx,input-group\with-icon-prefix-and-text-suffix.tsx,input-group\with-keyboard-shortcut.tsx,input-group\with-loading-suffix.tsx,input-group\with-prefix-and-suffix.tsx,input-group\with-prefix-icon.tsx,input-group\with-suffix-icon.tsx,input-group\with-text-prefix.tsx,input-group\with-text-suffix.tsx,input-group\with-textarea.tsx,input-otp\basic.tsx,input-otp\controlled.tsx,input-otp\disabled.tsx,input-otp\form-example.tsx,input-otp\four-digits.tsx,input-otp\on-complete.tsx,input-otp\on-surface.tsx,input-otp\variants.tsx,input-otp\with-pattern.tsx,input-otp\with-validation.tsx,input\basic.tsx,input\controlled.tsx,input\full-width.tsx,input\on-surface.tsx,input\types.tsx,input\variants.tsx,kbd\basic.tsx,kbd\inline.tsx,kbd\instructional.tsx,kbd\navigation.tsx,kbd\special.tsx,kbd\variants.tsx,label\basic.tsx,link\basic.tsx,link\custom-icon.tsx,link\icon-placement.tsx,link\underline-and-offset.tsx,link\underline-offset.tsx,link\underline-variants.tsx,list-box\controlled.tsx,list-box\custom-check-icon.tsx,list-box\default.tsx,list-box\multi-select.tsx,list-box\with-disabled-items.tsx,list-box\with-sections.tsx,modal\backdrop-variants.tsx,modal\close-methods.tsx,modal\controlled.tsx,modal\custom-animations.tsx,modal\custom-backdrop.tsx,modal\custom-portal.tsx,modal\custom-trigger.tsx,modal\default.tsx,modal\dismiss-behavior.tsx,modal\placements.tsx,modal\scroll-comparison.tsx,modal\sizes.tsx,modal\with-form.tsx,number-field\basic.tsx,number-field\controlled.tsx,number-field\custom-icons.tsx,number-field\disabled.tsx,number-field\form-example.tsx,number-field\full-width.tsx,number-field\on-surface.tsx,number-field\required.tsx,number-field\validation.tsx,number-field\variants.tsx,number-field\with-chevrons.tsx,number-field\with-description.tsx,number-field\with-format-options.tsx,number-field\with-step.tsx,number-field\with-validation.tsx,popover\basic.tsx,popover\interactive.tsx,popover\placement.tsx,popover\with-arrow.tsx,radio-group\basic.tsx,radio-group\controlled.tsx,radio-group\custom-indicator.tsx,radio-group\delivery-and-payment.tsx,radio-group\disabled.tsx,radio-group\horizontal.tsx,radio-group\on-surface.tsx,radio-group\uncontrolled.tsx,radio-group\validation.tsx,radio-group\variants.tsx,scroll-shadow\custom-size.tsx,scroll-shadow\default.tsx,scroll-shadow\hide-scroll-bar.tsx,scroll-shadow\orientation.tsx,scroll-shadow\visibility-change.tsx,scroll-shadow\with-card.tsx,search-field\basic.tsx,search-field\controlled.tsx,search-field\custom-icons.tsx,search-field\disabled.tsx,search-field\form-example.tsx,search-field\full-width.tsx,search-field\on-surface.tsx,search-field\required.tsx,search-field\validation.tsx,search-field\variants.tsx,search-field\with-description.tsx,search-field\with-keyboard-shortcut.tsx,search-field\with-validation.tsx,select\asynchronous-loading.tsx,select\controlled-multiple.tsx,select\controlled-open-state.tsx,select\controlled.tsx,select\custom-indicator.tsx,select\custom-value-multiple.tsx,select\custom-value.tsx,select\default.tsx,select\disabled.tsx,select\full-width.tsx,select\multiple-select.tsx,select\on-surface.tsx,select\required.tsx,select\variants.tsx,select\with-description.tsx,select\with-disabled-options.tsx,select\with-sections.tsx,separator\basic.tsx,separator\manual-variant-override.tsx,separator\variants.tsx,separator\vertical.tsx,separator\with-content.tsx,separator\with-surface.tsx,skeleton\animation-types.tsx,skeleton\basic.tsx,skeleton\card.tsx,skeleton\grid.tsx,skeleton\list.tsx,skeleton\single-shimmer.tsx,skeleton\text-content.tsx,skeleton\user-profile.tsx,slider\default.tsx,slider\disabled.tsx,slider\range.tsx,slider\vertical.tsx,spinner\basic.tsx,spinner\colors.tsx,spinner\sizes.tsx,surface\variants.tsx,switch\basic.tsx,switch\controlled.tsx,switch\custom-styles.tsx,switch\default-selected.tsx,switch\disabled.tsx,switch\form.tsx,switch\group-horizontal.tsx,switch\group.tsx,switch\label-position.tsx,switch\render-props.tsx,switch\sizes.tsx,switch\with-description.tsx,switch\with-icons.tsx,switch\without-label.tsx,tabs\basic.tsx,tabs\custom-styles.tsx,tabs\disabled.tsx,tabs\secondary-vertical.tsx,tabs\secondary.tsx,tabs\vertical.tsx,tabs\without-separator.tsx,tag-group\basic.tsx,tag-group\controlled.tsx,tag-group\disabled.tsx,tag-group\selection-modes.tsx,tag-group\sizes.tsx,tag-group\variants.tsx,tag-group\with-error-message.tsx,tag-group\with-list-data.tsx,tag-group\with-prefix.tsx,tag-group\with-remove-button.tsx,text-field\basic.tsx,text-field\controlled.tsx,text-field\disabled.tsx,text-field\full-width.tsx,text-field\input-types.tsx,text-field\on-surface.tsx,text-field\required.tsx,text-field\textarea.tsx,text-field\validation.tsx,text-field\with-description.tsx,text-field\with-error.tsx,textarea\basic.tsx,textarea\controlled.tsx,textarea\full-width.tsx,textarea\on-surface.tsx,textarea\rows.tsx,textarea\variants.tsx,time-field\basic.tsx,time-field\controlled.tsx,time-field\disabled.tsx,time-field\form-example.tsx,time-field\full-width.tsx,time-field\invalid.tsx,time-field\on-surface.tsx,time-field\required.tsx,time-field\with-description.tsx,time-field\with-prefix-and-suffix.tsx,time-field\with-prefix-icon.tsx,time-field\with-suffix-icon.tsx,time-field\with-validation.tsx,toast\callbacks.tsx,toast\custom-indicator.tsx,toast\custom-queue.tsx,toast\custom-toast.tsx,toast\default.tsx,toast\placements.tsx,toast\promise.tsx,toast\simple.tsx,toast\variants.tsx,tooltip\basic.tsx,tooltip\custom-trigger.tsx,tooltip\placement.tsx,tooltip\with-arrow.tsx}
<!-- HEROUI-REACT-AGENTS-MD-END -->
