---
theme: default
title: "DevFlow AI — TFM"
info: |
  Trabajo Final de Master: Desarrollo con IA (BIG School)
  Alberto Guinda Sevilla — Febrero 2026
class: text-center
drawings:
  persist: false
transition: slide-left
mdc: true
---

# DevFlow AI

### 15 herramientas para developers

**Trabajo Final de Master** — Desarrollo con IA (BIG School)

Alberto Guinda Sevilla &middot; Febrero 2026

<div class="abs-br m-6 flex gap-2">
  <a href="https://github.com/albertoguinda/devflow-ai" target="_blank" class="text-xl slidev-icon-btn opacity-50 !border-none !hover:text-white">
    <carbon-logo-github />
  </a>
  <a href="https://devflowai.vercel.app" target="_blank" class="text-xl slidev-icon-btn opacity-50 !border-none !hover:text-white">
    <carbon-launch />
  </a>
</div>

---
transition: fade-out
---

# El Problema

Los developers usan **10+ herramientas fragmentadas** para tareas cotidianas

<div class="grid grid-cols-2 gap-8 mt-8">
<div>

### Desarrollo con IA
- Prompts sin evaluar calidad
- Costes de API opacos
- Tokenizacion invisible
- Context windows mal gestionados

</div>
<div>

### Tareas diarias
- Formatear JSON, Base64, UUID...
- Ordenar clases Tailwind
- Construir expresiones cron
- Generar commits convencionales

</div>
</div>

<div class="mt-8 p-4 bg-red-500/10 rounded-lg text-center">
  <strong>Resultado:</strong> Friccion, costes ocultos, perdida de productividad
</div>

---

# La Solucion

<div class="text-center text-2xl font-bold mt-4 mb-8">
  Una plataforma unificada, gratuita y open-source
</div>

<div class="grid grid-cols-3 gap-6">

<div class="p-4 bg-blue-500/10 rounded-lg text-center">
  <div class="text-3xl mb-2">🔒</div>
  <strong>Local-first</strong><br/>
  Todo en el navegador. Sin login. Sin API keys.
</div>

<div class="p-4 bg-green-500/10 rounded-lg text-center">
  <div class="text-3xl mb-2">🤖</div>
  <strong>IA opcional</strong><br/>
  4 proveedores con fallback. Pollinations siempre gratis.
</div>

<div class="p-4 bg-purple-500/10 rounded-lg text-center">
  <div class="text-3xl mb-2">🛡️</div>
  <strong>Enterprise-grade</strong><br/>
  CSP, HSTS, SAST, CodeQL, rate limiting, Sentry.
</div>

</div>

<div class="mt-8 text-center text-lg">
  <strong>15 herramientas</strong> &middot; <strong>1416 tests</strong> &middot; <strong>Lighthouse 100/100/100/100</strong>
</div>

---

# Las 15 Herramientas

<div class="grid grid-cols-3 gap-3 text-sm">

<div class="p-2 bg-blue-500/10 rounded">**JSON Formatter** — Format, diff, TS interfaces</div>
<div class="p-2 bg-emerald-500/10 rounded">**Variable Name Wizard** — 8 convenciones</div>
<div class="p-2 bg-cyan-500/10 rounded">**Regex Humanizer** — Explicacion + tester</div>
<div class="p-2 bg-green-500/10 rounded">**Code Review** — Smells, complejidad, seguridad</div>
<div class="p-2 bg-amber-500/10 rounded">**Cost Calculator** — 10+ modelos, Claude 4.x</div>
<div class="p-2 bg-indigo-500/10 rounded">**Base64** — URL-safe, data URL, Unicode</div>
<div class="p-2 bg-teal-500/10 rounded">**UUID Generator** — v1, v4, v7, bulk 1000</div>
<div class="p-2 bg-lime-500/10 rounded">**DTO-Matic** — JSON → TS + Zod</div>
<div class="p-2 bg-orange-500/10 rounded">**Git Commit** — Convencional + emojis</div>
<div class="p-2 bg-violet-500/10 rounded">**Cron Builder** — Visual + calendario</div>
<div class="p-2 bg-sky-500/10 rounded">**Tailwind Sorter** — Ordena + diff</div>
<div class="p-2 bg-blue-500/10 rounded">**Prompt Analyzer** — Score + inyeccion</div>
<div class="p-2 bg-purple-500/10 rounded">**Token Visualizer** — BPE + costes</div>
<div class="p-2 bg-rose-500/10 rounded">**Context Manager** — Chunks + export</div>
<div class="p-2 bg-slate-500/10 rounded">**HTTP Status** — 61 codigos + guias</div>

</div>

<div class="mt-4 text-center text-sm opacity-70">
  Cada herramienta sigue el patron 5-capas: types → lib/application → hooks → page → tests
</div>

---

# Arquitectura: Clean Architecture

<div class="grid grid-cols-2 gap-8">
<div>

### Patron 5-capas por herramienta

```
types/<tool>.ts          → Interfaces
lib/application/<tool>.ts → Logica pura
hooks/use-<tool>.ts      → Estado + localStorage
app/.../page.tsx         → UI
tests/.../<tool>.test.ts → Tests
```

**Flujo:** Presentation → Application → Domain

**0 violaciones de capas** en las 15 herramientas

</div>
<div>

### AI Backend (opcional)

```
hooks/use-ai-<feature>.ts → SWRMutation
app/api/ai/<endpoint>/    → Route Handler
```

**Provider chain:**
1. BYOK (tu API key)
2. Gemini 2.0 Flash
3. Groq
4. OpenRouter
5. Pollinations (gratis)

Rate limiter: 10 RPM / 50 RPM BYOK

</div>
</div>

---

# Stack Tecnologico

<div class="grid grid-cols-2 gap-6">
<div>

| Capa | Tecnologia |
|------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 (Compiler) |
| Lenguaje | TypeScript 5 (max strict) |
| Estilos | Tailwind CSS v4 |
| Componentes | HeroUI v3 beta |
| Animaciones | GSAP + Framer Motion |

</div>
<div>

| Capa | Tecnologia |
|------|------------|
| Testing | Vitest + Playwright |
| a11y | axe-core WCAG AAA |
| CI/CD | GitHub Actions (10 jobs) |
| Error tracking | Sentry |
| Hosting | Vercel Edge |
| State | Zustand + Context |

</div>
</div>

<div class="mt-6 text-center">
  <strong>18 deps produccion</strong> &middot; TypeScript maximum strict (15+ flags) &middot; Zero <code>any</code>
</div>

---

# Server Components & Performance

<div class="grid grid-cols-2 gap-8">
<div>

### Homepage (Server Component)

```
page.tsx (async RSC)
├── Hero         → Server (0 JS)
├── Stats        → Server + GSAP island
│   └── GitHub   → Server fetch (ISR 1h)
├── Features     → Client (GSAP stagger)
├── Why DevFlow  → Server (0 JS)
└── Footer       → Server (0 JS)
```

**Resultado:** Hero y Footer = 0 bytes JS

</div>
<div>

### Lighthouse Desktop

| Metrica | Score |
|---------|-------|
| Performance | **100** |
| Accessibility | **100** |
| Best Practices | **100** |
| SEO | **100** |

<div class="mt-4 text-sm">
React Compiler + View Transitions API + ISR + optimizePackageImports
</div>

</div>
</div>

---

# Testing: Estrategia 100/80/0

<div class="grid grid-cols-2 gap-8">
<div>

### Piramide estrategica

| Tier | Target | Path |
|------|--------|------|
| **CORE** | 80-100% | `lib/application/*.ts` |
| **IMPORTANT** | 80% | `components/shared/` |
| **INFRA** | 0% | `types/`, `config/` |

**Per-file enforcement:** cada archivo CORE debe cumplir individualmente

**CI bloquea merge** si cualquier archivo baja del umbral

</div>
<div>

### Metricas actuales

```
Tests:    1416 passing (45 files)
E2E:      20 Playwright specs
a11y:     19 paginas (axe-core WCAG AA)
Duration: ~50s
```

**Top herramientas:**
- UUID Generator: 89 tests
- Regex Humanizer: 83 tests
- Cron Builder: 75 tests
- Variable Name Wizard: 74 tests
- Git Commit Generator: 71 tests

</div>
</div>

---

# Seguridad

<div class="grid grid-cols-2 gap-6">
<div>

### HTTP Headers

- **CSP** estricto (sin `unsafe-eval`)
- **HSTS** 2 anos + preload
- **X-Frame-Options** DENY
- **Permissions-Policy** restrictivo
- **Prototype pollution** protegido

### Application

- Rate limiting IP-based
- Zod validation en endpoints
- Anti-injection en system prompts
- Zero `eval()` / `innerHTML`

</div>
<div>

### CI/CD Security (10 jobs)

- **npm audit** `--audit-level=high`
- **lockfile-lint** validacion registro
- **CycloneDX SBOM** en cada build
- **CodeQL** SAST JS/TS
- **Semgrep** OWASP Top 10
- **eslint-plugin-security**
- **StepSecurity harden-runner**
- **SHA-pinned** todas las Actions
- **Dependency review** en PRs
- **Renovate** auto-updates

</div>
</div>

---

# Internacionalizacion

<div class="grid grid-cols-2 gap-8">
<div>

### Sistema custom (sin i18next)

- **~1595 claves** por idioma (EN/ES)
- Hook `useTranslation()` con interpolacion
- Cambio instantaneo via Zustand
- Paridad perfecta verificada

### Cobertura

- 15 tool pages completamente traducidas
- Landing page, settings, docs, history
- ARIA labels, placeholders, toasts
- Error messages, empty states

</div>
<div>

### Ejemplo

```typescript
// locales/en.json
{ "costCalc.cachedPrices": "Using cached prices" }

// locales/es.json
{ "costCalc.cachedPrices": "Usando precios en cache" }

// En el componente
const { t } = useTranslation();
<Chip>{t("costCalc.cachedPrices")}</Chip>
```

0 strings hardcodeadas en produccion

</div>
</div>

---

# Features Clave

<div class="grid grid-cols-2 gap-6">
<div>

### Command Palette (`Cmd+K`)
- Busqueda fuzzy de 15 tools + 5 acciones
- Navegacion por teclado completa
- Zero dependencias extra

### Smart Suggestions
- 10 detectores de tipo de dato
- 15 reglas de recomendacion
- Data passing entre herramientas

### PWA
- Manifest + Service Worker
- Instalable como app standalone
- Offline-capable

</div>
<div>

### Export/Import Settings
- Backup de todas las preferencias
- Validacion Zod al importar
- Filtro `devflow-*` keys

### MagicInput
- Deteccion automatica de tipo
- Redirige a la herramienta correcta
- JSON, Cron, Regex, Base64...

### History + Favorites
- `useToolHistory<T>` generico
- Max 50 items por herramienta
- Timestamps relativos (EN/ES)

</div>
</div>

---

# Resultados

<div class="grid grid-cols-3 gap-6 mt-4">

<div class="p-4 bg-blue-500/10 rounded-lg text-center">
  <div class="text-4xl font-bold text-blue-400">15</div>
  <div>Herramientas</div>
</div>

<div class="p-4 bg-green-500/10 rounded-lg text-center">
  <div class="text-4xl font-bold text-green-400">1416</div>
  <div>Tests passing</div>
</div>

<div class="p-4 bg-purple-500/10 rounded-lg text-center">
  <div class="text-4xl font-bold text-purple-400">35</div>
  <div>Rutas</div>
</div>

<div class="p-4 bg-amber-500/10 rounded-lg text-center">
  <div class="text-4xl font-bold text-amber-400">~1595</div>
  <div>Claves i18n (x2)</div>
</div>

<div class="p-4 bg-cyan-500/10 rounded-lg text-center">
  <div class="text-4xl font-bold text-cyan-400">10</div>
  <div>Jobs CI/CD</div>
</div>

<div class="p-4 bg-rose-500/10 rounded-lg text-center">
  <div class="text-4xl font-bold text-rose-400">100</div>
  <div>Lighthouse (x4)</div>
</div>

</div>

<div class="mt-6 text-center text-lg">
  <strong>4 proveedores IA</strong> &middot; <strong>WCAG AAA</strong> &middot; <strong>PWA instalable</strong> &middot; <strong>Zero any</strong>
</div>

---

# Conclusiones

<div class="grid grid-cols-2 gap-8 mt-4">
<div>

### Logros principales

1. **Producto funcional** — 15 tools en produccion
2. **Clean Architecture** — 5-capas sin excepciones
3. **Performance maxima** — Lighthouse 100x4
4. **Testing robusto** — 1416 + 20 E2E + a11y
5. **Seguridad enterprise** — SAST, CSP, rate limiting
6. **UX avanzada** — PWA, Cmd+K, MagicInput
7. **IA opcional** — 4 proveedores, BYOK, fallback
8. **i18n completo** — ~1595 claves EN/ES

</div>
<div>

### Aprendizajes clave

- **RSC** reduce drasticamente el JS al cliente
- **Clean Architecture** vale la pena para testing
- **TypeScript strict** previene categorias de bugs
- **100/80/0** es mas sostenible que 100% global
- **Claude Code** como pair programmer acelera significativamente
- **Local-first** es ventaja competitiva real

### Trabajo futuro

- Cloud sync (Supabase)
- Team collaboration
- Browser extension
- Mobile app (React Native)

</div>
</div>

---
layout: center
class: text-center
---

# Demo en vivo

<div class="text-2xl mt-4 mb-8">
  <a href="https://devflowai.vercel.app" target="_blank" class="text-blue-400">
    devflowai.vercel.app
  </a>
</div>

<div class="grid grid-cols-3 gap-4 text-sm max-w-xl mx-auto">
  <div class="p-2 bg-blue-500/10 rounded">Prompt Analyzer</div>
  <div class="p-2 bg-green-500/10 rounded">Code Review</div>
  <div class="p-2 bg-amber-500/10 rounded">Cost Calculator</div>
  <div class="p-2 bg-purple-500/10 rounded">Token Visualizer</div>
  <div class="p-2 bg-cyan-500/10 rounded">JSON Formatter</div>
  <div class="p-2 bg-rose-500/10 rounded">Context Manager</div>
</div>

<div class="mt-8 text-sm opacity-50">
  Repo: github.com/albertoguinda/devflow-ai
</div>

---
layout: center
class: text-center
---

# Preguntas

<div class="mt-8 text-lg">

| Recurso | Enlace |
|---------|--------|
| Demo | [devflowai.vercel.app](https://devflowai.vercel.app) |
| Repositorio | [github.com/albertoguinda/devflow-ai](https://github.com/albertoguinda/devflow-ai) |
| TFM Documento | [docs/TFM.md](https://github.com/albertoguinda/devflow-ai/blob/main/docs/TFM.md) |

</div>

<div class="mt-12 text-sm opacity-50">
  Alberto Guinda Sevilla &middot; Master Desarrollo con IA &middot; BIG School &middot; Febrero 2026
</div>
