<div align="center">

# DevFlow AI

### Suite de 15 herramientas para developers

**0 dependencias externas &middot; 100% local &middot; Open Source**

[![Build](https://img.shields.io/github/actions/workflow/status/albertoguinda/devflow-ai/ci.yml?branch=main&style=flat-square&logo=github&label=CI)](https://github.com/albertoguinda/devflow-ai/actions)
[![Tests](https://img.shields.io/badge/tests-543%20passed-brightgreen?style=flat-square&logo=vitest&logoColor=white)](https://github.com/albertoguinda/devflow-ai)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## Para Que Sirve

15 herramientas que te ahorran tiempo en tu dia a dia como developer.

**Sin login. Sin API keys. Sin backend. Todo se ejecuta en tu navegador.**

---

## Herramientas

| | Herramienta | Descripcion |
|---|---|---|
| `{ }` | **JSON Formatter** | Formatea, minifica, valida JSON. Extrae paths, compara documentos, genera interfaces TS. |
| `Aa` | **Variable Name Wizard** | Genera nombres de variables y convierte entre 8 convenciones (camel, snake, kebab...). |
| `#` | **Regex Humanizer** | Explica regex en lenguaje natural. Genera patrones desde descripciones. Tester en tiempo real. |
| `< >` | **Code Review Assistant** | Analiza calidad de codigo: code smells, complejidad ciclomatica, sugerencias de refactor. |
| `$` | **API Cost Calculator** | Compara costes entre OpenAI, Anthropic, Google y otros providers. Proyecciones mensuales. |
| `01` | **Base64 Encoder/Decoder** | Encode/decode con soporte URL-safe, data URLs y Unicode. |
| `id` | **UUID Generator** | Genera UUID v1, v4, v7. Validacion, parsing y bulk generation hasta 1000. |
| `->` | **DTO-Matic** | Convierte JSON a interfaces TypeScript, entities y mappers. Schemas Zod incluidos. |
| `>>` | **Git Commit Generator** | Commits convencionales con tipos, scopes, emojis y validacion en tiempo real. |
| `*` | **Cron Builder** | Constructor visual de expresiones cron con previsualizacion de ejecuciones. |
| `~` | **Tailwind Sorter** | Ordena clases Tailwind por categoria, elimina duplicados, ordena variantes. |
| `?` | **Prompt Analyzer** | Evalua calidad de prompts, detecta inyecciones y sugiere mejoras. |
| `Tk` | **Token Visualizer** | Visualiza tokenizacion en tiempo real con estimacion de costes por token. |
| `[ ]` | **Context Manager** | Organiza ventanas de contexto para LLMs con chunking y priorizacion. |
| `200` | **HTTP Status Finder** | Referencia completa de 55+ codigos HTTP con ejemplos y guias de uso. |

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

## Stack Tecnologico

| Capa | Tecnologia |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router + Turbopack) |
| UI Library | [React 19](https://react.dev) |
| Language | [TypeScript 5](https://www.typescriptlang.org) (maximum strict) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) (CSS-first config) |
| Components | [HeroUI v3 beta](https://heroui.com) (compound pattern) |
| Icons | [Lucide React](https://lucide.dev) |
| Animations | [GSAP](https://gsap.com) + [Framer Motion](https://motion.dev) |
| Testing | [Vitest](https://vitest.dev) + Testing Library |
| Linting | ESLint 9 (flat config) |

---

## Arquitectura

```
src/
├── app/                    # Pages & layouts (App Router)
│   ├── (marketing)/        # Landing, about, docs
│   └── (dashboard)/        # Dashboard + 15 tool pages
├── components/             # UI components
├── hooks/                  # Custom React hooks (use client)
├── lib/
│   └── application/        # Pure business logic (no React)
├── types/                  # TypeScript interfaces
└── config/                 # Tool registry & configuration
```

**Flujo de dependencias:** `Presentation -> Application -> Domain`

Cada herramienta sigue un patron de 5 archivos:

```
types/<tool>.ts             → Interfaces y tipos
lib/application/<tool>.ts   → Logica pura (sin React)
hooks/use-<tool>.ts         → Hook con estado y localStorage
app/.../tools/<slug>/page   → Pagina con UI
tests/.../<tool>.test.ts    → Tests unitarios
```

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

## Scripts

| Comando | Descripcion |
|---|---|
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run build` | Build de produccion |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript `tsc --noEmit` |
| `npm run test` | Vitest en modo watch |
| `npm run test:run` | Ejecucion unica de tests |
| `npm run test:coverage` | Cobertura con threshold 80% |

---

## Testing

```bash
# Todos los tests
npm run test:run

# Un archivo especifico
npx vitest run tests/unit/application/json-formatter.test.ts

# Por patron
npx vitest run -t "should format"

# Con cobertura
npm run test:coverage
```

```
 Test Files   16 passed (16)
      Tests   543 passed (543)
   Duration   7.24s
```

---

## Seguridad

Headers configurados en produccion:

- `Content-Security-Policy` &mdash; default-src 'self'
- `Strict-Transport-Security` &mdash; HSTS con preload
- `X-Content-Type-Options` &mdash; nosniff
- `X-Frame-Options` &mdash; DENY
- `Permissions-Policy` &mdash; camera, mic, geo deshabilitados
- `Referrer-Policy` &mdash; strict-origin-when-cross-origin

---

## Licencia

Distribuido bajo la licencia MIT. Ver [LICENSE](LICENSE) para mas informacion.

---

<div align="center">

Hecho por [Alberto Guinda](https://github.com/albertoguinda)

[![GitHub](https://img.shields.io/badge/GitHub-albertoguinda-181717?style=flat-square&logo=github)](https://github.com/albertoguinda)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Alberto_Guinda-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/albertoguinda)

Si te resulta util, dale una estrella en GitHub.

</div>
