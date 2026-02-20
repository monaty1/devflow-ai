<div align="center">

# DevFlow AI

### 15 developer tools &middot; AI-enhanced &middot; Local-first &middot; Open Source

### 15 herramientas para developers &middot; IA integrada &middot; Local-first &middot; Open Source

[![Build](https://img.shields.io/github/actions/workflow/status/albertoguinda/devflow-ai/ci.yml?branch=main&style=flat-square&logo=github&label=CI)](https://github.com/albertoguinda/devflow-ai/actions)
[![Tests](https://img.shields.io/badge/tests-942_passing-brightgreen?style=flat-square&logo=vitest&logoColor=white)](https://github.com/albertoguinda/devflow-ai)
[![Coverage](https://img.shields.io/badge/coverage-strategic_(100%2F80%2F0)-blue?style=flat-square&logo=vitest&logoColor=white)](https://github.com/albertoguinda/devflow-ai)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-100%2F100%2F100%2F100-brightgreen?style=flat-square&logo=lighthouse&logoColor=white)](https://github.com/albertoguinda/devflow-ai)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

**[English](#what-is-this)** &middot; **[Castellano](#para-que-sirve)** &middot; **[TFM Documento](./docs/TFM.md)** &middot; **[TFM Slides (PDF)](./docs/TFM-Slides.pdf)**

</div>

---

<!-- ==================== ENGLISH ==================== -->

## What Is This

15 tools that save you time every day as a developer.

**No login. No API keys required. Everything works locally. AI features are optional and free.**

---

## Tools

|       | Tool                       | Description                                                                              |
| ----- | -------------------------- | ---------------------------------------------------------------------------------------- |
| `{ }` | **JSON Formatter**         | Format, minify, validate JSON. Extract paths, diff documents, generate TS interfaces.    |
| `Aa`  | **Variable Name Wizard**   | Generate variable names and convert between 8 conventions (camel, snake, kebab...).      |
| `#`   | **Regex Humanizer**        | Explain regex in plain language. Generate patterns from descriptions. Real-time tester.  |
| `< >` | **Code Review Assistant**  | Code quality analysis: code smells, cyclomatic complexity, refactoring suggestions.      |
| `$`   | **API Cost Calculator**    | Compare costs across OpenAI, Anthropic, Google and other providers. Monthly projections. |
| `01`  | **Base64 Encoder/Decoder** | Encode/decode with URL-safe, data URL and Unicode support.                               |
| `id`  | **UUID Generator**         | Generate UUID v1, v4, v7. Validation, parsing and bulk generation up to 1000.            |
| `->`  | **DTO-Matic**              | Convert JSON to TypeScript interfaces, entities and mappers. Zod schemas included.       |
| `>>`  | **Git Commit Generator**   | Conventional commits with types, scopes, emojis and real-time validation.                |
| `*`   | **Cron Builder**           | Visual cron expression builder with execution preview.                                   |
| `~`   | **Tailwind Sorter**        | Sort Tailwind classes by category, remove duplicates, order variants.                    |
| `?`   | **Prompt Analyzer**        | Evaluate prompt quality, detect injections and suggest improvements.                     |
| `Tk`  | **Token Visualizer**       | Real-time tokenization visualization with per-token cost estimation.                     |
| `[ ]` | **Context Manager**        | Organize LLM context windows with chunking and prioritization.                           |
| `200` | **HTTP Status Finder**     | Complete reference of 61 HTTP status codes with examples and usage guides.              |

---

## Features

- **No signup** &mdash; no login, no user accounts, no barriers
- **Local-first** &mdash; every tool works 100% without AI
- **AI-enhanced** &mdash; 4 providers: Gemini, Groq, OpenRouter, Pollinations (always free, no key needed)
- **BYOK** &mdash; bring your own API key for higher limits (configurable in Settings)
- **AI Setup Guide** &mdash; 3-step wizard in the sidebar to configure AI providers
- **Smart suggestions** &mdash; context-aware cross-tool recommendations
- **MagicInput** &mdash; paste anything, auto-detect type, route to the right tool
- **Local history** &mdash; localStorage persistence
- **Copy to clipboard** &mdash; 1-click from any tool
- **Dark / Light mode** &mdash; auto-detection + manual toggle
- **Bilingual** &mdash; English / Spanish, switchable from sidebar
- **Strategic test coverage** &mdash; 100/80/0 architecture with per-file enforcement
- **TypeScript strict** &mdash; all strict flags enabled, zero `any`
- **Clean Architecture** &mdash; Domain, Application, Presentation layers
- **WCAG AAA accessibility** &mdash; keyboard nav, ARIA labels, skip links

---

## Tech Stack

| Layer      | Technology                                                      |
| ---------- | --------------------------------------------------------------- |
| Framework  | [Next.js 16](https://nextjs.org) (App Router + Turbopack)       |
| UI Library | [React 19](https://react.dev)                                   |
| Language   | [TypeScript 5](https://www.typescriptlang.org) (maximum strict) |
| Styling    | [Tailwind CSS 4](https://tailwindcss.com) (CSS-first config)    |
| Components | [HeroUI v3 beta](https://heroui.com) (compound pattern)         |
| Icons      | [Lucide React](https://lucide.dev)                              |
| Animations | [GSAP](https://gsap.com) + [Framer Motion](https://motion.dev)  |
| Testing    | [Vitest](https://vitest.dev) + Testing Library                  |
| Linting    | ESLint 9 (flat config)                                          |

---

## Architecture

```
├── app/                    # Pages & layouts (App Router)
│   ├── (marketing)/        # Landing, about
│   ├── (dashboard)/        # Dashboard + 15 tool pages + docs
│   └── api/ai/             # Server-side AI Route Handlers
├── components/             # UI components
├── hooks/                  # Custom React hooks ("use client")
├── lib/
│   ├── application/        # Pure business logic (no React)
│   └── api/                # Middleware, schemas, prompts (server)
├── infrastructure/         # AI providers, rate limiter, env config
├── types/                  # TypeScript interfaces
└── config/                 # Tool registry & configuration
```

> See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the full AI layer, security model, and data flow diagrams.
> See [`docs/API.md`](./docs/API.md) for the Route Handler API reference.

**Dependency flow:** `Presentation -> Application -> Domain`

Each tool follows a 5-file pattern:

```
types/<tool>.ts             → Interfaces & types
lib/application/<tool>.ts   → Pure logic (no React)
hooks/use-<tool>.ts         → Hook with state & localStorage
app/.../tools/<slug>/page   → UI page
tests/.../<tool>.test.ts    → Unit tests
```

```mermaid
---
config:
  theme: neo-dark
---
flowchart LR
    classDef ui fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#0f172a
    classDef hook fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#0f172a
    classDef lib fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#0f172a
    classDef storage fill:#f3e8ff,stroke:#9333ea,stroke-width:2px,color:#0f172a
    classDef types fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#0f172a
    User((User))
    subgraph Presentation ["Presentation Layer"]
        direction TB
        UI_Input[User Input]:::ui
        UI_Button[Action Button]:::ui
        UI_Render[Render Output]:::ui
    end

    subgraph AppLayer ["Application Layer"]
        direction TB
        Hook_State["React State\n+ useMemo"]:::hook
        Hook_Controller[Action Controller]:::hook
        Hook_Config[Config Manager]:::hook
        Hook_History[History Manager]:::hook
    end

    subgraph DomainLayer ["Domain/Logic Layer"]
        direction TB
        Logic_Validate[Validate Function]:::lib
        Logic_Process[Process/Transform]:::lib
        Logic_Stats[Calculate Stats]:::lib
    end

    subgraph Infra ["Infrastructure"]
        LocalStorage[("Browser LocalStorage")]:::storage
        Types[("TypeScript Types\nDomain contracts")]:::types
    end
    User -->|Type/Paste| UI_Input
    User -->|Click Process| UI_Button
    UI_Render -->|Display| User

    UI_Input -->|onChange| Hook_State
    UI_Button -->|Call| Hook_Controller
    UI_Button -->|Update| Hook_Config

    Hook_State -->|Reactive| Logic_Validate
    Logic_Validate -->|Return Status| Hook_State
    Hook_State -->|Show Error/Valid| UI_Render

    Hook_Controller -->|Invoke| Logic_Process
    Hook_Config -->|Pass Config| Logic_Process
    Logic_Process -->|Return Result| Hook_Controller
    Hook_Controller -->|Update Result State| UI_Render

    Logic_Process -->|Call| Logic_Stats
    Logic_Stats -->|Return Data| Logic_Process

    Logic_Validate -.->|Enforce| Types
    Logic_Process -.->|Enforce| Types

    Hook_Controller -->|Save| Hook_History
    Hook_History -->|Persist| LocalStorage
    LocalStorage -.->|Load on Init| Hook_History
    linkStyle default stroke:#64748b,stroke-width:1.5px
```

---

## Quick Start

```bash
git clone https://github.com/albertoguinda/devflow-ai.git
cd devflow-ai
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Scripts

| Command                 | Description                            |
| ----------------------- | -------------------------------------- |
| `npm run dev`           | Dev server (Turbopack)                 |
| `npm run build`         | Production build                       |
| `npm run lint`          | ESLint                                 |
| `npm run type-check`    | TypeScript `tsc --noEmit`              |
| `npm run test`          | Vitest watch mode                      |
| `npm run test:run`      | Single test run                        |
| `npm run test:coverage` | Coverage with per-file thresholds      |
| `npm run test:e2e`      | Playwright E2E tests                   |
| `npm run test:e2e:ui`   | Playwright UI mode                     |
| `npm run audit:security`| npm audit (high+)                      |
| `npm run analyze`       | Bundle analysis (webpack)              |

---

## Testing Strategy: 100/80/0

We follow a **Strategic Coverage** architecture. Not all code needs the same level of testing:

| Tier               | Path                         | Target  | Rationale                                              |
| ------------------ | ---------------------------- | ------- | ------------------------------------------------------ |
| **CORE (100%)**    | `lib/application/*.ts`       | 80-100% | Pure business logic, data transformation, security     |
| **IMPORTANT (80%)**| `components/shared/*.tsx`     | 80%     | User-facing UI components with interactive behavior    |
| **INFRA (0%)**     | `types/`, `config/`, stores  | 0%      | TypeScript compiler enforces correctness               |

**Per-file enforcement** is enabled: each CORE file must individually meet thresholds. The CI pipeline fails if any file drops below its floor.

```bash
npm run test:run                                             # All unit tests (942+)
npx vitest run tests/unit/application/json-formatter.test.ts # Single file
npx vitest run -t "should format"                            # By pattern
npm run test:coverage                                        # Coverage report
npm run test:e2e                                             # Playwright E2E (5 tests)
```

---

## Security

### HTTP Headers

All responses include strict security headers via `next.config.ts`:

| Header                       | Value                                    |
| ---------------------------- | ---------------------------------------- |
| `Content-Security-Policy`    | Strict CSP with `frame-ancestors 'none'`, `object-src 'none'`, `upgrade-insecure-requests` |
| `Strict-Transport-Security`  | `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options`     | `nosniff`                                |
| `X-Frame-Options`            | `DENY`                                   |
| `Permissions-Policy`         | camera, mic, geolocation, payment, usb, bluetooth, midi, magnetometer, gyroscope, accelerometer disabled |
| `Referrer-Policy`            | `strict-origin-when-cross-origin`        |

### Design Principles

- **Local-first** &mdash; all tools work without server or AI
- **API keys server-only** &mdash; no `NEXT_PUBLIC_` prefix, keys never reach the browser
- **BYOK in-memory only** &mdash; user API keys stored in Zustand (no persist), lost on tab close
- **Anti-injection** &mdash; system prompts include explicit anti-injection directives
- **Rate limiting** &mdash; IP-based, in-memory (10 RPM free / 50 RPM BYOK)
- **Input validation** &mdash; Zod schemas with max-length on all AI endpoints
- **No user data** &mdash; localStorage only, no external transmission
- **CSP enforced** &mdash; blocks XSS, clickjacking, and data injection
- **Prototype pollution protection** &mdash; dangerous keys (`__proto__`, `constructor`, `prototype`) filtered
- **Dependency audit** &mdash; `npm audit --audit-level=high` runs in CI on every push
- **Supply chain** &mdash; lockfile-lint validates registry sources, CycloneDX SBOM generated on every build
- **SAST** &mdash; Semgrep (OWASP Top 10 + React/Next.js rules) + CodeQL JS/TS on every push and PR
- **SHA-pinned actions** &mdash; all GitHub Actions pinned to full commit SHAs
- **Runner hardening** &mdash; StepSecurity harden-runner monitors all CI jobs
- **eslint-plugin-security** &mdash; catches eval(), non-literal require(), trojan source attacks

---

## Observability (Sentry)

Sentry is **optional** — the app runs perfectly without it. To enable error tracking and performance monitoring:

1. Create a free project at [sentry.io](https://sentry.io)
2. Copy your DSN from **Project Settings → Client Keys**
3. Add it to `.env.local`:

```env
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@oXXXXX.ingest.sentry.io/XXXXXX
```

4. Restart the dev server — Sentry activates automatically

**What you get:**
- React error boundary captures (with component stack trace)
- Client-side performance traces (10% sample in production)
- Session Replay on error (100% capture)
- Edge function tracing

> The `instrumentation.ts` file at the root handles server/edge initialization per [Next.js docs](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation).

---

## CI/CD Pipeline

GitHub Actions runs on every push to `main` and all pull requests:

```
quality:    ESLint (+ security plugin) → TypeScript → Tests + Coverage → PR coverage comments
security:   npm audit --audit-level=high + lockfile-lint (parallel)
dep-review: dependency-review-action on PRs (moderate+ blocked)
build:      next build → SBOM generation (CycloneDX, 90-day retention)
e2e:        Playwright E2E tests (5 tests, Chromium, after build)
codeql:     CodeQL JS/TS SAST (push + PRs + weekly)
semgrep:    Semgrep SAST — OWASP Top 10, React, Next.js, TypeScript rules (SARIF → Security tab)
lighthouse: Lighthouse CI performance audit on PRs (LCP <2.5s, FCP <1.8s, JS <300KB)
```

All jobs run with least-privilege permissions and StepSecurity harden-runner.
Coverage reports and Playwright reports are uploaded as artifacts.

> See [`docs/SENTRY.md`](./docs/SENTRY.md) for the full Sentry setup guide.

---

<!-- ==================== CASTELLANO ==================== -->

<div align="center">

## Para Que Sirve

</div>

15 herramientas que te ahorran tiempo en tu dia a dia como developer.

**Sin login. Sin API keys obligatorias. Todo funciona en local. La IA es opcional y gratuita.**

---

## Herramientas

|       | Herramienta                | Descripcion                                                                                    |
| ----- | -------------------------- | ---------------------------------------------------------------------------------------------- |
| `{ }` | **JSON Formatter**         | Formatea, minifica, valida JSON. Extrae paths, compara documentos, genera interfaces TS.       |
| `Aa`  | **Variable Name Wizard**   | Genera nombres de variables y convierte entre 8 convenciones (camel, snake, kebab...).         |
| `#`   | **Regex Humanizer**        | Explica regex en lenguaje natural. Genera patrones desde descripciones. Tester en tiempo real. |
| `< >` | **Code Review Assistant**  | Analiza calidad de codigo: code smells, complejidad ciclomatica, sugerencias de refactor.      |
| `$`   | **API Cost Calculator**    | Compara costes entre OpenAI, Anthropic, Google y otros providers. Proyecciones mensuales.      |
| `01`  | **Base64 Encoder/Decoder** | Encode/decode con soporte URL-safe, data URLs y Unicode.                                       |
| `id`  | **UUID Generator**         | Genera UUID v1, v4, v7. Validacion, parsing y bulk generation hasta 1000.                      |
| `->`  | **DTO-Matic**              | Convierte JSON a interfaces TypeScript, entities y mappers. Schemas Zod incluidos.             |
| `>>`  | **Git Commit Generator**   | Commits convencionales con tipos, scopes, emojis y validacion en tiempo real.                  |
| `*`   | **Cron Builder**           | Constructor visual de expresiones cron con previsualizacion de ejecuciones.                    |
| `~`   | **Tailwind Sorter**        | Ordena clases Tailwind por categoria, elimina duplicados, ordena variantes.                    |
| `?`   | **Prompt Analyzer**        | Evalua calidad de prompts, detecta inyecciones y sugiere mejoras.                              |
| `Tk`  | **Token Visualizer**       | Visualiza tokenizacion en tiempo real con estimacion de costes por token.                      |
| `[ ]` | **Context Manager**        | Organiza ventanas de contexto para LLMs con chunking y priorizacion.                           |
| `200` | **HTTP Status Finder**     | Referencia completa de 61 codigos HTTP con ejemplos y guias de uso.                           |

---

## Caracteristicas

- **Sin registro** &mdash; ni login, ni cuentas de usuario, sin barreras
- **Local-first** &mdash; todas las herramientas funcionan al 100% sin IA
- **IA integrada** &mdash; 4 proveedores: Gemini, Groq, OpenRouter, Pollinations (siempre gratis, sin API key)
- **BYOK** &mdash; trae tu propia API key para limites superiores (configurable en Ajustes)
- **Guia de configuracion IA** &mdash; wizard de 3 pasos en la barra lateral para configurar proveedores de IA
- **Sugerencias inteligentes** &mdash; recomendaciones de herramientas segun el contexto
- **MagicInput** &mdash; pega cualquier cosa, deteccion automatica, redirige a la herramienta correcta
- **Historial local** &mdash; persistencia con localStorage
- **Copy to clipboard** &mdash; en 1 click desde cualquier herramienta
- **Dark / Light mode** &mdash; deteccion automatica + toggle manual
- **Bilingue** &mdash; Ingles / Espanol, cambiable desde la barra lateral
- **Cobertura estrategica** &mdash; arquitectura 100/80/0 con enforcement per-file
- **TypeScript strict** &mdash; todos los flags estrictos activados, cero `any`
- **Clean Architecture** &mdash; separacion en capas Domain, Application, Presentation
- **Accesibilidad WCAG AAA** &mdash; navegacion por teclado, ARIA labels, skip links

---

## Stack Tecnologico

| Capa       | Tecnologia                                                      |
| ---------- | --------------------------------------------------------------- |
| Framework  | [Next.js 16](https://nextjs.org) (App Router + Turbopack)       |
| UI         | [React 19](https://react.dev)                                   |
| Lenguaje   | [TypeScript 5](https://www.typescriptlang.org) (maximo estricto)|
| Estilos    | [Tailwind CSS 4](https://tailwindcss.com) (config CSS-first)    |
| Componentes| [HeroUI v3 beta](https://heroui.com) (patron compuesto)         |
| Iconos     | [Lucide React](https://lucide.dev)                              |
| Animaciones| [GSAP](https://gsap.com) + [Framer Motion](https://motion.dev)  |
| Testing    | [Vitest](https://vitest.dev) + Testing Library                  |
| Linting    | ESLint 9 (flat config)                                          |

---

## Arquitectura

```
├── app/                    # Paginas y layouts (App Router)
│   ├── (marketing)/        # Landing, about
│   ├── (dashboard)/        # Dashboard + 15 tool pages + docs
│   └── api/ai/             # Route Handlers IA server-side
├── components/             # Componentes UI
├── hooks/                  # Custom React hooks ("use client")
├── lib/
│   ├── application/        # Logica de negocio pura (sin React)
│   └── api/                # Middleware, schemas, prompts (server)
├── infrastructure/         # Proveedores IA, rate limiter, config
├── types/                  # Interfaces TypeScript
└── config/                 # Registro de tools y configuracion
```

> Ver [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) para la capa IA, modelo de seguridad y diagramas.
> Ver [`docs/API.md`](./docs/API.md) para la referencia de los Route Handlers.

**Flujo de dependencias:** `Presentacion -> Aplicacion -> Dominio`

Cada tool sigue un patron de 5 archivos:

```
types/<tool>.ts             → Interfaces y tipos
lib/application/<tool>.ts   → Logica pura (sin React)
hooks/use-<tool>.ts         → Hook con estado y localStorage
app/.../tools/<slug>/page   → Pagina UI
tests/.../<tool>.test.ts    → Tests unitarios
```

```mermaid
---
config:
  theme: neo-dark
---
flowchart LR
    classDef ui fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#0f172a
    classDef hook fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#0f172a
    classDef lib fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#0f172a
    classDef storage fill:#f3e8ff,stroke:#9333ea,stroke-width:2px,color:#0f172a
    classDef types fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#0f172a
    User((User))
    subgraph Presentation ["Presentation Layer"]
        direction TB
        UI_Input[User Input]:::ui
        UI_Button[Action Button]:::ui
        UI_Render[Render Output]:::ui
    end

    subgraph AppLayer ["Application Layer"]
        direction TB
        Hook_State["React State\n+ useMemo"]:::hook
        Hook_Controller[Action Controller]:::hook
        Hook_Config[Config Manager]:::hook
        Hook_History[History Manager]:::hook
    end

    subgraph DomainLayer ["Domain/Logic Layer"]
        direction TB
        Logic_Validate[Validate Function]:::lib
        Logic_Process[Process/Transform]:::lib
        Logic_Stats[Calculate Stats]:::lib
    end

    subgraph Infra ["Infrastructure"]
        LocalStorage[("Browser LocalStorage")]:::storage
        Types[("TypeScript Types\nDomain contracts")]:::types
    end
    User -->|Type/Paste| UI_Input
    User -->|Click Process| UI_Button
    UI_Render -->|Display| User

    UI_Input -->|onChange| Hook_State
    UI_Button -->|Call| Hook_Controller
    UI_Button -->|Update| Hook_Config

    Hook_State -->|Reactive| Logic_Validate
    Logic_Validate -->|Return Status| Hook_State
    Hook_State -->|Show Error/Valid| UI_Render

    Hook_Controller -->|Invoke| Logic_Process
    Hook_Config -->|Pass Config| Logic_Process
    Logic_Process -->|Return Result| Hook_Controller
    Hook_Controller -->|Update Result State| UI_Render

    Logic_Process -->|Call| Logic_Stats
    Logic_Stats -->|Return Data| Logic_Process

    Logic_Validate -.->|Enforce| Types
    Logic_Process -.->|Enforce| Types

    Hook_Controller -->|Save| Hook_History
    Hook_History -->|Persist| LocalStorage
    LocalStorage -.->|Load on Init| Hook_History
    linkStyle default stroke:#64748b,stroke-width:1.5px
```

---

## Estrategia de Testing: 100/80/0

| Tier               | Ruta                          | Objetivo | Justificacion                                            |
| ------------------ | ----------------------------- | -------- | -------------------------------------------------------- |
| **CORE (100%)**    | `lib/application/*.ts`        | 80-100%  | Logica de negocio pura, transformacion de datos          |
| **IMPORTANT (80%)**| `components/shared/*.tsx`      | 80%      | Componentes UI interactivos                              |
| **INFRA (0%)**     | `types/`, `config/`, stores   | 0%       | TypeScript garantiza correctitud                         |

---

## Seguridad

### Cabeceras HTTP

Todas las respuestas incluyen cabeceras de seguridad estrictas via `next.config.ts`:

| Cabecera                     | Valor                                    |
| ---------------------------- | ---------------------------------------- |
| `Content-Security-Policy`    | CSP estricto con `frame-ancestors 'none'`, `object-src 'none'`, `upgrade-insecure-requests` |
| `Strict-Transport-Security`  | `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options`     | `nosniff`                                |
| `X-Frame-Options`            | `DENY`                                   |
| `Permissions-Policy`         | camara, micro, geolocalizacion, pago, usb, bluetooth, midi, magnetometro, giroscopio, acelerometro deshabilitados |
| `Referrer-Policy`            | `strict-origin-when-cross-origin`        |

### Principios de Diseno

- **Sin backend** &mdash; cero superficie de ataque del lado servidor
- **Sin API routes** &mdash; todo el procesamiento en el navegador
- **Sin datos de usuario** &mdash; solo localStorage, sin transmision externa
- **CSP reforzado** &mdash; bloquea XSS, clickjacking e inyeccion de datos
- **Proteccion contra prototype pollution** &mdash; claves peligrosas (`__proto__`, `constructor`, `prototype`) filtradas
- **Auditoria de dependencias** &mdash; `npm audit --audit-level=high` se ejecuta en CI en cada push
- **Cadena de suministro** &mdash; lockfile-lint valida fuentes del registro, SBOM CycloneDX generado en cada build
- **SAST** &mdash; Semgrep (OWASP Top 10 + reglas React/Next.js) + CodeQL JS/TS en cada push y PR
- **Acciones con SHA fijo** &mdash; todas las GitHub Actions fijadas a SHAs completos
- **Endurecimiento del runner** &mdash; StepSecurity harden-runner monitorea todos los jobs CI
- **eslint-plugin-security** &mdash; detecta eval(), require() no literal, ataques trojan source

---

## Observabilidad (Sentry)

Sentry es **opcional** — la app funciona perfectamente sin el. Para activar el seguimiento de errores:

1. Crea un proyecto gratuito en [sentry.io](https://sentry.io)
2. Copia tu DSN desde **Project Settings → Client Keys**
3. Añadelo en `.env.local`:

```env
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@oXXXXX.ingest.sentry.io/XXXXXX
```

4. Reinicia el servidor de desarrollo — Sentry se activa automaticamente

**Que obtienes:**
- Capturas del error boundary de React (con stack trace del componente)
- Trazas de rendimiento del lado cliente (10% en produccion)
- Session Replay en errores (100% de captura)
- Trazado de Edge functions

---

## Pipeline CI/CD

GitHub Actions se ejecuta en cada push a `main` y todas las pull requests:

```
quality:    ESLint (+ plugin seguridad) → TypeScript → Tests + Coverage → comentarios de cobertura en PR
security:   npm audit --audit-level=high + lockfile-lint (en paralelo)
dep-review: dependency-review-action en PRs (moderate+ bloqueado)
build:      next build → generacion SBOM (CycloneDX, retencion 90 dias)
e2e:        Tests E2E Playwright (5 tests, Chromium, despues de build)
codeql:     CodeQL JS/TS SAST (push + PRs + semanal)
semgrep:    Semgrep SAST — OWASP Top 10, React, Next.js, TypeScript (SARIF → pestana Security)
lighthouse: Lighthouse CI auditoria de rendimiento en PRs (LCP <2.5s, FCP <1.8s, JS <300KB)
```

Todos los jobs se ejecutan con permisos minimos y StepSecurity harden-runner.
Los reportes de cobertura y Playwright se suben como artifacts.

> Ver [`docs/SENTRY.md`](./docs/SENTRY.md) para la guia completa de configuracion de Sentry.

---

## Instalacion Local

```bash
git clone https://github.com/albertoguinda/devflow-ai.git
cd devflow-ai
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## TFM &mdash; Trabajo Final de Master

Este proyecto es el TFM del **Master Desarrollo con IA** (BIG School).

| Documento | Enlace |
| --------- | ------ |
| Memoria completa (Markdown) | [docs/TFM.md](./docs/TFM.md) |
| Enunciado / Assignment PDF | [docs/Documentacion-TFM.pdf](./docs/Documentacion-TFM.pdf) |
| Slides presentacion | [docs/TFM-Slides.pdf](./docs/TFM-Slides.pdf) |
| Demo en produccion | https://devflowai.vercel.app |
| Repositorio | https://github.com/albertoguinda/devflow-ai |

---

## Licencia / License

MIT License &mdash; [Alberto Guinda](https://github.com/albertoguinda)

---

<div align="center">

Made by / Hecho por [Alberto Guinda](https://github.com/albertoguinda)

[![GitHub](https://img.shields.io/badge/GitHub-albertoguinda-181717?style=flat-square&logo=github)](https://github.com/albertoguinda)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Alberto_Guinda-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/albertoguindasevilla)

If you find it useful, give it a star / Si te resulta util, dale una estrella

</div>
