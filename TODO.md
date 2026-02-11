# Plan de mejoras — DevFlow AI

## Fases completadas

### Fase 1 — Infraestructura critica ✅
- Error boundaries, loading states, ESLint config, CI pipeline, provider nesting, Zustand stores

### Fase 2 — WCAG AAA & Accesibilidad ✅
- ARIA labels, keyboard navigation, focus rings, color contrast 7:1, screen reader support, skip nav, semantic HTML, reduced motion

### Fase 2.5 — CI & UX fixes ✅
- Fixed all ESLint errors (setMounted pattern → useSyncExternalStore, `<a>` → `<Link>`)
- Fixed all TypeScript errors in tests (strict index access)
- Optimized CI pipeline (merged 4 jobs → 2, added concurrency)
- Excluded coverage/ from ESLint
- Heart button now toggles favorite (z-index fix)
- Removed fake ratings/votes and redundant "Free" badge from tool cards
- GitHub icon moved to navbar right side (next to theme/locale toggles)
- Fixed navbar button width on language switch (fixed 140px)
- Language selector uses flag emojis instead of text labels
- Sidebar: removed Panel, redirects /dashboard → /tools
- Landing page: reduced redundant buttons, both CTAs go to /tools
- Footer: Alberto Guinda + LinkedIn + "Star on GitHub"
- Sentence case across all locale strings (en + es)
- Global cursor-pointer for all interactive elements
- Console Easter egg: "PARA VOSOTROS, DEVELOPERS"
- Hidden meta tag: `<meta name="philosophy" content="Para vosotros, developers" />`
- Custom 404 page with branding
- GitHub issue templates (bug, feature, tool proposal)
- PR template with quality checklist
- CODE_OF_CONDUCT.md

---

## Pendiente

### Fase 3 — SEO & Metadata
- Crear layout.tsx server components para cada tool (15 archivos) que exportan metadata usando datos de config/tools-data.ts

### Fase 4 — Code quality & DRY
- Extraer useToolHistory<T> hook generico
- Crear CopyButton shared component
- Crear ToolHeader shared component
- Extraer ThemeToggle shared component
- Usar StatusBadge existente (reemplazar badges inline)
- Centralizar ICON_MAP

### Fase 5 — i18n & Consistencia
- Mover strings hardcoded a locales (15 tool pages)
- Estandarizar empty states (icons, no emojis)
- Estandarizar tabs/modes a un solo patron
- Fix mezcla espanol/ingles

### Fase 6 — Performance, testing & arquitectura
- ESLint custom rules
- Toast stacking limit (max 5)
- localStorage error handling robusto
- Clipboard API fallback
- Component tests con @testing-library/react
- CSP con nonces
- Limpiar directorios vacios domain/
- Breadcrumbs en tool pages

### Extras — Branding & comunidad
- GitHub repo description + topics (requiere gh CLI o manual)
- OG image con lema "Para vosotros, developers"
- /docs page con descripcion exhaustiva de cada herramienta
