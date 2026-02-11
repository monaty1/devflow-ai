# Changelog

All notable changes to DevFlow AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.1.0]: https://github.com/albertoguinda/devflow-ai/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/albertoguinda/devflow-ai/releases/tag/v1.0.0
