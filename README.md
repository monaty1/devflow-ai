<div align="center">

# DevFlow AI

### 15 developer tools &middot; 0 external deps &middot; 100% local &middot; Open Source

### 15 herramientas para developers &middot; 0 deps externas &middot; 100% local &middot; Open Source

[![Build](https://img.shields.io/github/actions/workflow/status/albertoguinda/devflow-ai/ci.yml?branch=main&style=flat-square&logo=github&label=CI)](https://github.com/albertoguinda/devflow-ai/actions)
[![Tests](https://img.shields.io/badge/tests-543%20passed-brightgreen?style=flat-square&logo=vitest&logoColor=white)](https://github.com/albertoguinda/devflow-ai)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

**[English](#-what-is-this)** &middot; **[Castellano](#-para-que-sirve)**

</div>

---

<!-- ==================== ENGLISH ==================== -->

## What Is This

15 tools that save you time every day as a developer.

**No login. No API keys. No backend. Everything runs in your browser.**

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
| `200` | **HTTP Status Finder**     | Complete reference of 55+ HTTP status codes with examples and usage guides.              |

---

## Features

- **No signup** &mdash; no login, no user accounts
- **No external APIs** &mdash; everything processed in the browser
- **Local history** &mdash; localStorage persistence
- **Copy to clipboard** &mdash; 1-click from any tool
- **Dark / Light mode** &mdash; auto-detection + manual toggle
- **543 unit tests** &mdash; 80%+ coverage with Vitest
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
│   ├── (marketing)/        # Landing, about, docs
│   └── (dashboard)/        # Dashboard + 15 tool pages
├── components/             # UI components
├── hooks/                  # Custom React hooks ("use client")
├── lib/
│   └── application/        # Pure business logic (no React)
├── types/                  # TypeScript interfaces
└── config/                 # Tool registry & configuration
```

**Dependency flow:** `Presentation -> Application -> Domain`

Each tool follows a 5-file pattern:

```
types/<tool>.ts             → Interfaces & types
lib/application/<tool>.ts   → Pure logic (no React)
hooks/use-<tool>.ts         → Hook with state & localStorage
app/.../tools/<slug>/page   → UI page
tests/.../<tool>.test.ts    → Unit tests
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

| Command                 | Description                 |
| ----------------------- | --------------------------- |
| `npm run dev`           | Dev server (Turbopack)      |
| `npm run build`         | Production build            |
| `npm run lint`          | ESLint                      |
| `npm run type-check`    | TypeScript `tsc --noEmit`   |
| `npm run test`          | Vitest watch mode           |
| `npm run test:run`      | Single test run             |
| `npm run test:coverage` | Coverage with 80% threshold |

---

## Testing

```bash
npm run test:run                                             # All tests
npx vitest run tests/unit/application/json-formatter.test.ts # Single file
npx vitest run -t "should format"                            # By pattern
npm run test:coverage                                        # Coverage report
```

```
 Test Files   16 passed (16)
      Tests   543 passed (543)
   Duration   7.24s
```

---

## Security Headers

- `Content-Security-Policy` &mdash; default-src 'self'
- `Strict-Transport-Security` &mdash; HSTS with preload
- `X-Content-Type-Options` &mdash; nosniff
- `X-Frame-Options` &mdash; DENY
- `Permissions-Policy` &mdash; camera, mic, geolocation disabled
- `Referrer-Policy` &mdash; strict-origin-when-cross-origin

---

<!-- ==================== CASTELLANO ==================== -->

<div align="center">

## Para Que Sirve

</div>

15 herramientas que te ahorran tiempo en tu dia a dia como developer.

**Sin login. Sin API keys. Sin backend. Todo se ejecuta en tu navegador.**

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
| `200` | **HTTP Status Finder**     | Referencia completa de 55+ codigos HTTP con ejemplos y guias de uso.                           |

---

## Caracteristicas

- **Sin registro** &mdash; ni login, ni cuentas de usuario
- **Sin APIs externas** &mdash; todo se procesa en el navegador
- **Historial local** &mdash; persistencia con localStorage
- **Copy to clipboard** &mdash; en 1 click desde cualquier herramienta
- **Dark / Light mode** &mdash; deteccion automatica + toggle manual
- **543 tests unitarios** &mdash; cobertura > 80% con Vitest
- **TypeScript strict** &mdash; todos los flags estrictos activados, cero `any`
- **Clean Architecture** &mdash; separacion en capas Domain, Application, Presentation
- **Accesibilidad WCAG AAA** &mdash; navegacion por teclado, ARIA labels, skip links

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

## Licencia / License

MIT License &mdash; [Alberto Guinda](https://github.com/albertoguinda)

---

<div align="center">

Made by / Hecho por [Alberto Guinda](https://github.com/albertoguinda)

[![GitHub](https://img.shields.io/badge/GitHub-albertoguinda-181717?style=flat-square&logo=github)](https://github.com/albertoguinda)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Alberto_Guinda-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/albertoguindasevilla)

If you find it useful, give it a star / Si te resulta util, dale una estrella

</div>
