# Trabajo Final de Master: DevFlow AI

**Autor:** Alberto Guinda Sevilla
**Master:** Desarrollo con IA (BIG School)
**Fecha:** Febrero 2026
**Repositorio:** https://github.com/albertoguinda/devflow-ai
**Demo:** https://devflowai.vercel.app

---

## Resumen Ejecutivo

DevFlow AI es una plataforma open-source que centraliza **15 herramientas** esenciales para desarrolladores que trabajan con IA y desarrollo web moderno. Desde analisis de prompts y revision de codigo hasta generacion de UUIDs y construccion visual de expresiones cron.

**Problema identificado:** Los desarrolladores utilizan multiples herramientas fragmentadas (10+) para tareas cotidianas, generando friccion, costes ocultos y perdida de productividad.

**Solucion propuesta:** Una plataforma unificada, gratuita y de codigo abierto que ejecuta todo localmente en el navegador, sin necesidad de login, API keys ni backend.

**Resultados:**

- 15 herramientas funcionales end-to-end
- 100% ejecucion local + IA opcional con 4 proveedores (Gemini, Groq, OpenRouter, Pollinations)
- **1383 tests** con coverage estrategico 100/80/0 per-file (42 archivos de test)
- 20 E2E specs con Playwright (15 tools + settings + navigation + accessibility WCAG AAA)
- Lighthouse score **100/100/100/100** en Desktop
- Homepage optimizada con Server Components (RSC) para rendimiento movil
- Internacionalizacion completa (English/Castellano, **~1543 claves** por idioma)
- **8 CI jobs**: quality, security, dependency-review, build, e2e, CodeQL SAST, Semgrep SAST, Lighthouse
- Command Palette (`Cmd+K`) para acceso rapido a cualquier herramienta
- Export/Import de configuracion
- Deploy en produccion con CI/CD y error tracking (Sentry)

---

## 1. Introduccion

### 1.1 Contexto

El auge de los Large Language Models (LLMs) ha transformado el desarrollo de software. OpenAI, Anthropic, Google y Meta ofrecen APIs potentes, pero trabajar con ellas presenta desafios:

1. **Seguridad:** Prompt injection y jailbreak son vulnerabilidades reales
2. **Costes:** Sin visibilidad, es facil gastar miles de dolares sin optimizacion
3. **Complejidad:** Tokenizacion, context windows y limites varian por modelo
4. **Fragmentacion:** Cada tarea cotidiana requiere una herramienta diferente

Ademas, los desarrolladores frontend enfrentan tareas repetitivas diarias: formatear JSON, generar UUIDs, construir expresiones cron, ordenar clases Tailwind, convertir a Base64... DevFlow AI unifica ambos mundos.

### 1.2 Objetivos del Proyecto

#### Objetivos Academicos

- Aplicar React 19 y Next.js 16 con App Router y Server Components
- Implementar Clean Architecture en un proyecto real de 15 herramientas
- Crear una suite de tests comprehensiva (1383 tests) con Vitest + Playwright E2E
- Utilizar IA generativa (Claude Code) como herramienta de desarrollo
- Demostrar dominio de TypeScript 5 en modo maximo estricto

#### Objetivos Tecnicos

- Construir 15 herramientas funcionales con patron arquitectonico consistente
- Lograr coverage estrategico 100/80/0 con enforcement per-file
- Deploy en produccion con CI/CD completo (10 jobs: quality, security, dep-review, build, e2e, a11y, release, CodeQL, Semgrep, Lighthouse)
- Lighthouse score 100 en todas las metricas (Desktop)
- Internacionalizacion completa (EN/ES, ~1543 claves por idioma)
- Seguridad enterprise: CSP, HSTS, prototype pollution, SAST (CodeQL + Semgrep), harden-runner, eslint-plugin-security

#### Objetivos de Producto

- Ofrecer valor real a desarrolladores en su dia a dia
- Ejecutar todo localmente (privacidad + coste cero)
- UX fluida con dark/light mode, responsive design, accesibilidad WCAG AAA
- Codigo abierto y extensible

---

## 2. Marco Teorico

### 2.1 Fundamentos de IA Aplicados

#### Large Language Models (LLMs)

Los LLMs como GPT-4, Claude y Gemini procesan texto mediante tokenizacion. Cada modelo usa un algoritmo diferente (BPE para GPT, SentencePiece para Gemini), lo que afecta:

- Coste por request (pricing por millon de tokens)
- Context window disponible
- Calidad de la respuesta

**Aplicacion en DevFlow AI:** Token Visualizer simula BPE y Cost Calculator compara precios de 10+ modelos en tiempo real.

#### Prompt Engineering

La calidad de un prompt impacta directamente en la respuesta del LLM. Tecnicas clave:

- Role definition ("You are a senior developer...")
- Context provision (ejemplos, restricciones)
- Output format specification (JSON, XML, Markdown)
- Chain-of-thought prompting

**Aplicacion en DevFlow AI:** Prompt Analyzer evalua estos elementos, detecta vulnerabilidades y sugiere mejoras con scoring 1-10.

#### Security Vulnerabilities

- **Prompt Injection:** Manipular el system prompt con instrucciones del usuario
- **Jailbreak (DAN):** Bypass de restricciones eticas
- **Data Exfiltration:** Extraer el system prompt o datos sensibles

**Aplicacion en DevFlow AI:** Deteccion automatica con regex patterns + analisis semantico en Prompt Analyzer.

### 2.2 Arquitectura Frontend Moderna

#### React 19

- `ref` as prop: Simplificacion de forwarding
- React Compiler: Optimizacion automatica sin useMemo/useCallback manuales
- Mejoras en Suspense y streaming SSR

**Aplicacion:** Hooks personalizados para cada herramienta, Context para favoritos, Zustand para estado global.

#### Next.js 16

- **App Router:** Routing basado en sistema de archivos con Server Components
- **Turbopack:** Build 10x mas rapido que Webpack
- **React Server Components (RSC):** Renderizado en servidor por defecto, cero JS para componentes estaticos
- **ISR (Incremental Static Regeneration):** Paginas estaticas con revalidacion periodica

**Aplicacion:** Homepage como Server Component async con ISR. Client Components solo donde hay interactividad (GSAP, formularios). Fetch de GitHub API en el servidor.

#### Tailwind CSS v4

- **CSS-first config:** `@theme inline` en lugar de `tailwind.config.js`
- **Variables CSS nativas:** Mejor integracion con el navegador
- **Menor bundle size:** Purga mas agresiva

**Aplicacion:** Tema custom definido en `app/globals.css` con tokens de diseno, dark mode via CSS custom properties.

### 2.3 Clean Architecture

#### Capas

```
+------------------------------------------+
|        Presentation Layer                |  <- app/, components/
+------------------------------------------+
|        Application Layer                 |  <- hooks/, lib/application/
+------------------------------------------+
|         Domain Layer                     |  <- types/
+------------------------------------------+
|      Infrastructure Layer                |  <- config/, lib/stores/
+------------------------------------------+
```

**Regla de dependencia:** Las flechas apuntan hacia adentro. Domain nunca depende de capas externas.

**Aplicacion en DevFlow AI:**

- `types/`: Define entidades puras (interfaces TypeScript)
- `lib/application/`: Logica de negocio pura (sin React, sin browser APIs)
- `hooks/`: Conectan UI con application layer (estado, localStorage, orquestacion)
- `app/`: Presentacion, solo renderizado

---

## 3. Analisis y Diseno

### 3.1 Requisitos Funcionales

**RF-01 a RF-15: Las 15 Herramientas**

| #   | Herramienta                | Descripcion                                                                    | Complejidad |
| --- | -------------------------- | ------------------------------------------------------------------------------ | ----------- |
| 1   | **JSON Formatter**         | Formatear, minificar, validar JSON. Extraer paths, diff, generar TS interfaces | Alta        |
| 2   | **Variable Name Wizard**   | Generar nombres y convertir entre 8 convenciones (camel, snake, kebab...)      | Media       |
| 3   | **Regex Humanizer**        | Explicar regex en lenguaje natural, generar patrones, tester en tiempo real    | Alta        |
| 4   | **Code Review Assistant**  | Analisis de calidad: code smells, complejidad ciclomatica, refactoring         | Alta        |
| 5   | **API Cost Calculator**    | Comparar costes de 10+ modelos de IA con proyecciones mensuales                | Media       |
| 6   | **Base64 Encoder/Decoder** | Encode/decode con soporte URL-safe, data URLs y Unicode                        | Media       |
| 7   | **UUID Generator**         | Generar UUID v1, v4, v7. Validacion, parsing y bulk generation hasta 1000      | Media       |
| 8   | **DTO-Matic**              | Convertir JSON a interfaces TypeScript, entities, mappers y schemas Zod        | Alta        |
| 9   | **Git Commit Generator**   | Commits convencionales con tipos, scopes, emojis y validacion                  | Media       |
| 10  | **Cron Builder**           | Constructor visual de expresiones cron con preview de ejecuciones              | Alta        |
| 11  | **Tailwind Sorter**        | Ordenar clases por categoria, eliminar duplicados, ordenar variantes           | Media       |
| 12  | **Prompt Analyzer**        | Evaluar calidad de prompts, detectar inyecciones, sugerir mejoras              | Alta        |
| 13  | **Token Visualizer**       | Visualizar tokenizacion en tiempo real con estimacion de costes por token      | Media       |
| 14  | **Context Manager**        | Organizar context windows con chunking, prioridades y export XML/JSON/MD       | Alta        |
| 15  | **HTTP Status Finder**     | Referencia completa de 55+ codigos HTTP con ejemplos y guias de uso            | Baja        |

**RF-16: Sistema de Favoritos**

- Persistencia en localStorage via React Context + useReducer

**RF-17: Historial por Herramienta**

- Hook generico `useToolHistory<T>` con max 50 items por herramienta

**RF-18: Internacionalizacion**

- ~1543 claves traducidas en English y Castellano
- Cambio de idioma en tiempo real sin recarga

### 3.2 Requisitos No Funcionales

**RNF-01: Performance**

- Lighthouse Performance Desktop: 100
- Server Components para renderizado instantaneo del HTML
- ISR para datos dinamicos (GitHub stars) con revalidacion cada hora

**RNF-02: Accesibilidad**

- WCAG 2.1 Level AAA como objetivo
- Navegacion por teclado completa
- Screen reader support con ARIA labels
- Skip links implementados

**RNF-03: Responsive Design**

- Mobile-first approach con Tailwind CSS v4
- Breakpoints: 640px, 768px, 1024px, 1280px
- Touch-friendly (min 44x44px targets)

**RNF-04: Seguridad**

- Content Security Policy estricta (sin `unsafe-eval`)
- HSTS con max-age 2 anos y preload
- Prototype pollution protection en procesamiento JSON
- npm audit en CI + GitHub Dependabot
- Cero secretos en codigo fuente

**RNF-05: Mantenibilidad**

- Coverage estrategico 100/80/0 con enforcement per-file
- TypeScript maximum strict mode (15+ flags estrictos)
- ESLint 9 flat config
- Limites de codigo: funciones max 20 lineas, archivos max 200 lineas

### 3.3 Decisiones de Diseno

**Por que Next.js 16 en lugar de Vite + React?**

- Server Components: Reduce JS enviado al cliente, mejora LCP
- ISR: Paginas estaticas con revalidacion sin rebuild completo
- File-based routing: Menos boilerplate
- Vercel integration: Deploy trivial con preview URLs

**Por que analisis local en lugar de API calls?**

- Privacidad: El codigo/prompts del usuario nunca salen de su navegador
- Coste cero: No requiere API keys
- Latencia: Respuesta inmediata sin round-trip
- Offline-capable: Funciona sin internet

**Por que HeroUI v3?**

- Built on React Aria: Accesibilidad de primera clase
- Compound patterns: API limpia y componible
- Tailwind CSS v4 compatible: Mismo sistema de estilos

**Por que el patron 5-capas por herramienta?**

- Consistencia: Las 15 herramientas siguen el mismo patron
- Testabilidad: La logica pura se testa sin React
- Mantenibilidad: Cada capa tiene una responsabilidad clara
- Escalabilidad: Anadir herramienta 16 sigue el mismo flujo

---

## 4. Implementacion

### 4.1 Patron Arquitectonico: 5 Capas por Herramienta

Cada una de las 15 herramientas sigue este patron estricto:

```
types/<tool>.ts                     → Interfaces y tipos puros
lib/application/<tool>.ts           → Logica de negocio (sin React, sin browser APIs)
hooks/use-<tool>.ts                 → Hook React (estado, localStorage, orquestacion)
app/(dashboard)/tools/<slug>/page   → Pagina UI ("use client")
tests/unit/application/<tool>.test  → Tests unitarios de la logica pura
```

**Flujo de dependencias:** `Presentation → Application → Domain`

Las 15 herramientas verificadas con 0 violaciones de capas:

| #   | Tool                 | types/ | lib/app/ | hooks/ | page | tests/ |
| --- | -------------------- | ------ | -------- | ------ | ---- | ------ |
| 1   | JSON Formatter       | ✓      | ✓        | ✓      | ✓    | ✓      |
| 2   | Variable Name Wizard | ✓      | ✓        | ✓      | ✓    | ✓      |
| 3   | Regex Humanizer      | ✓      | ✓        | ✓      | ✓    | ✓      |
| 4   | Code Review          | ✓      | ✓        | ✓      | ✓    | ✓      |
| 5   | Cost Calculator      | ✓      | ✓        | ✓      | ✓    | ✓      |
| 6   | Base64               | ✓      | ✓        | ✓      | ✓    | ✓      |
| 7   | UUID Generator       | ✓      | ✓        | ✓      | ✓    | ✓      |
| 8   | DTO-Matic            | ✓      | ✓        | ✓      | ✓    | ✓      |
| 9   | Git Commit Generator | ✓      | ✓        | ✓      | ✓    | ✓      |
| 10  | Cron Builder         | ✓      | ✓        | ✓      | ✓    | ✓      |
| 11  | Tailwind Sorter      | ✓      | ✓        | ✓      | ✓    | ✓      |
| 12  | Prompt Analyzer      | ✓      | ✓        | ✓      | ✓    | ✓      |
| 13  | Token Visualizer     | ✓      | ✓        | ✓      | ✓    | ✓      |
| 14  | Context Manager      | ✓      | ✓        | ✓      | ✓    | ✓      |
| 15  | HTTP Status Finder   | ✓      | ✓        | ✓      | ✓    | ✓      |

### 4.2 Herramientas Destacadas

#### 4.2.1 Prompt Analyzer

**Archivo:** `lib/application/prompt-analyzer.ts`

**Algoritmo:**

1. Deteccion de security flags: regex patterns para injection, jailbreak, DAN
2. Analisis de calidad: vagueness, role presence, output format, context adequacy
3. Scoring: Base 10 con deducciones por issues y security flags
4. Sugerencias: Generadas segun issues detectados

#### 4.2.2 Code Review Assistant

**Archivo:** `lib/application/code-review.ts`

**Deteccion de vulnerabilidades:**

- `eval()` (severity: critical)
- `innerHTML` / XSS (severity: critical)
- Credenciales hardcodeadas (severity: critical)
- `console.log` en produccion (severity: warning)
- Loose equality `==` (severity: info)
- Empty catch blocks (severity: critical)

**Metricas calculadas:**

- Lines of code (total, blank, comments, code)
- Cyclomatic complexity (conteo de branches)
- Duplicate risk (lineas unicas vs totales)
- Maintainability score (formula compuesta)

#### 4.2.3 JSON Formatter

**Archivo:** `lib/application/json-formatter.ts`

**Features implementadas:**

- Formatear con indentacion configurable
- Minificar eliminando whitespace
- Validar con mensajes de error detallados
- Extraer JSON paths
- Generar interfaces TypeScript automaticamente
- Comparar dos documentos JSON
- Calcular estadisticas (keys, depth, types)
- **Prototype pollution protection:** filtra `__proto__`, `constructor`, `prototype`

#### 4.2.4 Cron Builder

**Archivo:** `lib/application/cron-builder.ts`

**Features:**

- Constructor visual de expresiones cron
- Traduccion a lenguaje natural (Castellano)
- Calculo de proximas N ejecuciones con fechas reales
- Validacion de rangos por campo (minuto, hora, dia, mes, dia de semana)
- Soporte para steps, ranges y lists

### 4.3 Server Components y Optimizacion

La homepage (`app/(marketing)/page.tsx`) fue refactorizada de un monolito `"use client"` a una arquitectura de **Server Component con Client Islands**:

```
page.tsx (Server Component - async)
  ├── Hero Section           → Server (0 JS al cliente)
  ├── Stats Section          → Server + GsapReveal island
  │   └── GitHubStarsServer  → Server fetch con ISR 1h
  ├── Features Grid          → Client island (GSAP stagger)
  ├── Why DevFlow            → Server (0 JS al cliente)
  ├── CTA Section            → Server + GsapReveal island
  └── Footer                 → Server (0 JS al cliente)
```

**Impacto medido:**

- GitHub stars: de fetch client-side a server fetch con revalidacion 1h
- Hero y Footer: 0 bytes de JS enviados al navegador
- LCP (mobile): reduccion significativa al renderizar HTML en el servidor

### 4.4 Gestion de Estado

**Zustand (Locale):**

- Store minimalista para idioma (en/es)
- Persistido en localStorage key `devflow-locale`

**React Context + useReducer (Favoritos):**

- Patron funcional con dispatch de acciones
- Persistido en localStorage key `devflow-favorites`

**useToolHistory<T> (Historial por herramienta):**

- Hook generico reutilizado en las 15 herramientas
- Max 50 items por herramienta
- Persistencia automatica en localStorage

### 4.5 Internacionalizacion (i18n)

**Sistema custom ligero** (sin dependencia de i18next):

- ~1543 claves de traduccion en `locales/en.json` y `locales/es.json`
- Hook `useTranslation()` con interpolacion `{key}`
- Funcion server-side `t()` para Server Components
- Cambio de idioma instantaneo via Zustand

### 4.6 Seguridad

**HTTP Security Headers (via next.config.ts):**

| Header                    | Valor                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------- |
| Content-Security-Policy   | `default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, sin `unsafe-eval` |
| Strict-Transport-Security | `max-age=63072000; includeSubDomains; preload` (2 anos)                                |
| X-Frame-Options           | DENY                                                                                   |
| X-Content-Type-Options    | nosniff                                                                                |
| Permissions-Policy        | camera, microphone, geolocation disabled                                               |
| Referrer-Policy           | strict-origin-when-cross-origin                                                        |

**Application Security:**

- Prototype pollution protection en JSON processing
- ReDoS protection en Regex Humanizer (timeout 2s + limite 500 matches)
- Zero `eval()`, zero `Function()`, zero `innerHTML` en el codigo fuente
- TypeScript strict mode previene categorias enteras de bugs
- npm audit en CI (bloquea merges en vulnerabilidades high/critical)
- GitHub Dependabot para monitoring de supply chain

---

## 5. Testing y Validacion

### 5.1 Estrategia: 100/80/0

Modelo de coverage estrategico con enforcement per-file:

| Tier                | Ruta                          | Objetivo         | Justificacion                             |
| ------------------- | ----------------------------- | ---------------- | ----------------------------------------- |
| **CORE (100%)**     | `lib/application/*.ts`        | 80-100% per file | Logica de negocio pura, maxima criticidad |
| **IMPORTANT (80%)** | `components/shared/*.tsx`     | 80%              | Componentes UI interactivos               |
| **INFRA (0%)**      | `types/`, `config/`, `hooks/` | Excluido         | TypeScript compiler garantiza correctitud |

**Enforcement:** Vitest con `perFile: true` — cada archivo individual debe cumplir los umbrales. No se permite que un archivo con alta cobertura compense uno con baja.

### 5.2 Resultados de Tests

```
Test Files  42 passed (42)
Tests       1383 passed (1383)
Duration    ~50s
```

**Distribucion por herramienta:**

| Test File            | Tests | Calidad   |
| -------------------- | ----- | --------- |
| uuid-generator       | 89    | Excelente |
| regex-humanizer      | 83    | Excelente |
| cron-builder         | 75    | Excelente |
| variable-name-wizard | 74    | Excelente |
| git-commit-generator | 71    | Excelente |
| base64               | 66    | Excelente |
| json-formatter       | 61    | Excelente |
| dto-matic            | 62    | Excelente |
| code-review          | 55    | Excelente |
| tailwind-sorter      | 53    | Muy bueno |
| http-status-finder   | 51    | Muy bueno |
| prompt-analyzer      | 43    | Muy bueno |
| cost-calculator      | 45    | Muy bueno |
| token-visualizer     | 40    | Muy bueno |
| context-manager      | 39    | Muy bueno |
| tool-recommendations | 22    | Bueno     |
| smart-navigation     | 18    | Bueno     |
| + 5 component tests  | 55    | Bueno     |
| + 4 integration tests| 38    | Bueno     |
| + 1 domain test      | 4     | Basico    |
| **E2E (Playwright)** | 20 specs | 15 tools + navigation + settings + accessibility (axe-core WCAG AA) |

### 5.3 Tipos de Tests Implementados

**Tests de logica pura (no mocks):**

- Verificacion de outputs exactos: `expect(result).toBe('{"name":"John"}')`
- Precision matematica: `expect(cost).toBeCloseTo(0.0025, 6)`
- Roundtrip testing: encode → decode → verifica original
- Edge cases: inputs vacios, Unicode, valores limite, estructuras anidadas

**Tests de seguridad:**

- Deteccion de `eval()` con severity critical
- Deteccion de XSS via innerHTML
- Deteccion de credenciales hardcodeadas
- Prevencion de loops infinitos con zero-length matches

**Tests de branches:**

- 50+ tests explicitamente disenados para cubrir ramas no cubiertas
- Secciones "uncovered branches" en multiples archivos de test

**Tests de componentes:**

- CopyButton: verificacion de cambio de icono y ARIA labels
- StatusBadge: verificacion de clases CSS por variante
- ToolHeader: verificacion de navegacion y slots
- ToastContainer: verificacion de limite maximo y dismiss

### 5.4 Metricas de Calidad

```
ESLint:        0 errores, 0 warnings
TypeScript:    0 errores (strict mode maximo)
npm audit:     0 vulnerabilidades
Build:         OK (28 paginas generadas)
```

---

## 6. Stack Tecnologico

| Capa           | Tecnologia            | Version      | Justificacion                              |
| -------------- | --------------------- | ------------ | ------------------------------------------ |
| Framework      | Next.js               | 16.1.6       | App Router + Server Components + Turbopack |
| UI Library     | React                 | 19.2.3       | Hooks, Context, Compiler                   |
| Language       | TypeScript            | 5.x          | Maximum strict mode (15+ flags)            |
| Styling        | Tailwind CSS          | 4.x          | CSS-first config, design tokens            |
| Components     | HeroUI                | v3 beta      | Compound patterns, React Aria              |
| Icons          | Lucide React          | 0.563        | 500+ iconos, tree-shakeable                |
| Animations     | GSAP + Framer Motion  | 3.14 + 12.30 | Professional-grade                         |
| State          | Zustand               | 5.0          | Lightweight, localStorage persist          |
| Forms          | React Hook Form + Zod | 7.71 + 4.3   | Performant validation                      |
| Testing        | Vitest                | 4.0          | Fast, compatible con Testing Library       |
| Linting        | ESLint                | 9.x          | Flat config                                |
| Error Tracking | Sentry                | 10.38        | Client + Server + Edge                     |
| CI/CD          | GitHub Actions        | -            | 10 jobs (quality, security, dep-review, build, e2e, a11y, release, CodeQL, Semgrep, Lighthouse) |
| Hosting        | Vercel                | -            | Edge Network, ISR, preview URLs            |

**Total dependencias produccion:** 18 (minimalista)
**Total dependencias desarrollo:** 15

---

## 7. Despliegue

### 7.1 CI/CD Pipeline

GitHub Actions ejecuta **10 jobs** en cada push a `main`/`develop` y todas las PRs:

```
┌─── PUSH / PR ────────────────────────────────────────────────────────┐
│                                                                        │
│  Job 1: QUALITY (paralelo)                                            │
│  ├─ npm run lint              (ESLint 9 + eslint-plugin-security)     │
│  ├─ npm run type-check        (tsc --noEmit strict)                   │
│  ├─ npm run test:coverage     (1383 tests + umbrales per-file)        │
│  └─ PR coverage comments      (artifacts 14 dias)                     │
│                                                                        │
│  Job 2: SECURITY (paralelo)                                           │
│  ├─ npm audit --audit-level=high                                      │
│  └─ lockfile-lint (validacion de registro npm)                        │
│                                                                        │
│  Job 3: DEPENDENCY-REVIEW (solo PRs)                                  │
│  └─ dependency-review-action (fail-on-severity: moderate)             │
│                                                                        │
│  Job 4: BUILD (depende de Quality + Security)                         │
│  ├─ npm run build             (Next.js produccion)                    │
│  ├─ Bundle size tracking      (du + artifact upload)                  │
│  └─ CycloneDX SBOM           (retencion 90 dias)                     │
│                                                                        │
│  Job 5: E2E (depende de Build)                                        │
│  └─ Playwright tests          (20 specs, Chromium, retry=2)           │
│                                                                        │
│  Job 6: A11Y (depende de Build)                                       │
│  └─ axe-core WCAG AAA         (19 paginas, critical/serious = 0)     │
│                                                                        │
│  Job 7: CODEQL (paralelo)                                             │
│  └─ CodeQL JS/TS SAST         (security-extended, semanal + push/PR)  │
│                                                                        │
│  Job 8: SEMGREP (paralelo)                                            │
│  └─ Semgrep SAST              (OWASP Top 10, React, Next.js → SARIF) │
│                                                                        │
│  Job 9: LIGHTHOUSE (solo PRs)                                         │
│  └─ Lighthouse CI             (LCP <2.5s, FCP <1.8s, JS <300KB)      │
│                                                                        │
│  Job 10: RELEASE (tag push o manual dispatch)                         │
│  └─ GitHub Release            (notas auto-generadas + SBOM adjunto)   │
│                                                                        │
│  + Renovate (actualizacion automatica de dependencias)                │
│  + StepSecurity harden-runner en todos los jobs                       │
│  + Todas las GitHub Actions con SHA fijo (SHA-pinned)                 │
└──────────────────────────────────────────────────────────────────────┘
```

**Concurrency control:** Runs cancelados automaticamente si se pushea al mismo branch.

### 7.2 Produccion

- **URL:** https://devflowai.vercel.app
- **CDN:** Vercel Edge Network (global)
- **ISR:** Homepage revalida cada hora (GitHub stars)
- **Error tracking:** Sentry con 10% sampling, 100% en errores
- **Source maps:** Subidos a Sentry y eliminados del deploy publico

---

## 8. Resultados

### 8.1 Metricas del Proyecto

| Metrica                    | Valor              |
| -------------------------- | ------------------ |
| Herramientas               | 15                 |
| Tests unitarios            | 1383               |
| Tests E2E (Playwright)     | 20 specs           |
| Archivos de test           | 42 unit + 20 E2E   |
| Archivos fuente (.ts/.tsx) | 150+               |
| Componentes React          | 25+                |
| Custom hooks               | 22+                |
| Paginas (routes)           | 24                 |
| Claves i18n                | ~1543 (x2 idiomas) |
| Jobs CI/CD                 | 10                 |
| Commits                    | 120+               |
| Proveedores IA             | 4 (Gemini, Groq, OpenRouter, Pollinations) |
| Dependencias produccion    | 18                 |

### 8.2 Lighthouse Scores (Desktop)

| Metrica        | Score   |
| -------------- | ------- |
| Performance    | **100** |
| Accessibility  | **100** |
| Best Practices | **100** |
| SEO            | **100** |

### 8.3 Requisitos del Curso Frontend Cumplidos

- 24 paginas navegables (>10 requerido) ✓
- useState en multiples componentes ✓
- useEffect para side effects ✓
- useContext para Favoritos ✓
- useReducer para Favoritos ✓
- useMemo/useCallback para optimizacion ✓
- Custom hooks (22+ hooks) ✓
- Class Component (ErrorBoundary) ✓
- Responsive design (Tailwind CSS v4) ✓
- GSAP animations (5 hooks de animacion) ✓
- Toast notifications ✓
- Skeletons de carga ✓
- TypeScript strict mode ✓
- Dark/Light mode con deteccion automatica ✓
- i18n completo (EN/ES, ~1543 claves por idioma) ✓
- Tests unitarios (1383 passing, 42 archivos) ✓
- Tests E2E con Playwright (20 specs, 15 tools + a11y) ✓
- CI/CD pipeline (10 jobs) ✓
- SAST (CodeQL + Semgrep) ✓
- Command Palette (`Cmd+K`) ✓
- Export/Import de configuracion ✓
- Deploy en produccion ✓

### 8.4 Comparativa con Alternativas

| Feature                      | DevFlow AI | ChatGPT web | Alternatives |
| ---------------------------- | ---------- | ----------- | ------------ |
| Herramientas                 | 15         | 0           | 1-3          |
| Prompt security check        | Si         | No          | No           |
| Code review local            | Si         | No          | Parcial      |
| Multi-model cost compare     | Si         | No          | No           |
| Token visualization          | Si         | No          | Parcial      |
| Context export (XML/JSON/MD) | Si         | No          | No           |
| Ejecucion local (privacidad) | Si         | No          | No           |
| Open source                  | Si         | No          | Variable     |
| Gratuito                     | Si         | Limitado    | Limitado     |
| i18n                         | EN/ES      | Multi       | Ingles       |

---

## 9. Conclusiones

### 9.1 Logros Principales

1. **Producto funcional end-to-end:** 15 herramientas reales desplegadas en produccion con 24 rutas navegables
2. **Arquitectura ejemplar:** Clean Architecture con patron 5-capas replicado sin excepciones en las 15 herramientas
3. **Performance maxima:** Lighthouse 100/100/100/100, Server Components, ISR
4. **Testing robusto:** 1383 tests unitarios + 20 E2E specs + accessibility audit (axe-core WCAG AAA), coverage per-file
5. **Seguridad enterprise:** CSP sin unsafe-eval, HSTS, CodeQL + Semgrep SAST, SHA-pinned actions, harden-runner
6. **Developer Experience:** TypeScript strict, ESLint + security plugin, CI/CD con 10 quality gates
7. **UX avanzada:** PWA instalable, Command Palette (Cmd+K), MagicInput, Export/Import, dark/light mode, WCAG AAA
8. **IA opcional:** 4 proveedores con fallback automatico, BYOK, rate limiting IP-based

### 9.2 Aprendizajes Clave

**Tecnicos:**

- React Server Components reducen drasticamente el JS enviado al cliente
- Next.js 16 ISR permite paginas estaticas con datos dinamicos sin rebuilds
- Clean Architecture vale la pena: facilita testing, mantenimiento y escalabilidad
- TypeScript maximum strict mode previene categorias enteras de bugs en compile-time
- La estrategia de testing 100/80/0 es mas sostenible que buscar 100% global

**Metodologicos:**

- Claude Code como pair programmer aumenta productividad significativamente
- El patron 5-capas por herramienta permite escalar sin perder consistencia
- Coverage per-file evita la trampa de promediar archivos bien testeados con otros sin tests

**Producto:**

- Ejecucion local es ventaja competitiva real (privacidad + coste cero)
- 15 herramientas > 5 herramientas: la breadth del toolkit es el value proposition
- i18n desde el principio es mas facil que anadirlo despues

### 9.3 Limitaciones y Trabajo Futuro

**Limitaciones Actuales:**

- Tokenizacion BPE simulada (no 100% precisa vs tiktoken)
- Sin cloud sync: datos solo en localStorage del navegador
- Sin colaboracion: herramienta individual
- Server Component i18n defaults a English (swap en hydratacion para otros idiomas)

**Roadmap Futuro:**

_Completado (ya implementado):_

- ~~E2E tests con Playwright~~ → 20 specs (15 tools + navigation + settings + accessibility)
- ~~axe-core WCAG AAA audit~~ → 19 paginas auditadas (15 tools + settings + docs + history + tools index)
- ~~Export/Import de configuracion~~ → JSON roundtrip con validacion Zod
- ~~Command Palette~~ → `Cmd+K` con busqueda fuzzy de 15 tools + acciones

_Corto plazo (1-2 meses):_

- ~~PWA con service worker para uso offline completo~~ → Implementado: manifest.ts, sw.js, install prompt
- Export a PDF de reportes de analisis

_Medio plazo (3-6 meses):_

- Supabase integration para cloud sync
- Team collaboration (context windows compartidos)
- Browser extension (analizar prompts in-page)
- Mas idiomas (FR, DE, PT)

_Largo plazo (6-12 meses):_

- Mobile app (React Native reutilizando lib/application/)
- API publica para integracion programatica
- AI-powered suggestions con Claude API

---

## 10. Referencias

### 10.1 Tecnologias

- Next.js 16 - https://nextjs.org
- React 19 - https://react.dev
- TypeScript 5 - https://www.typescriptlang.org
- Tailwind CSS v4 - https://tailwindcss.com
- HeroUI v3 - https://v3.heroui.com
- GSAP - https://gsap.com
- Vitest - https://vitest.dev
- Zustand - https://zustand.docs.pmnd.rs
- Zod - https://zod.dev

### 10.2 Documentacion de Referencia

- Clean Architecture (Robert C. Martin, 2017)
- OWASP Top 10 (2021) - https://owasp.org/Top10/
- WCAG 2.1 - https://www.w3.org/WAI/WCAG21/quickref/
- Conventional Commits - https://www.conventionalcommits.org

### 10.3 Herramientas de Desarrollo

- Claude Code (Anthropic) - AI pair programmer
- GitHub Actions - CI/CD
- Vercel - Hosting y deployment
- Sentry - Error tracking

---

## Anexos

### Anexo A: Presentacion (Slides)

[docs/TFM-Slides.pdf](./TFM-Slides.pdf)

### Anexo B: Repositorio

https://github.com/albertoguinda/devflow-ai

Archivos clave:

- `lib/application/*.ts` - Logica pura de las 15 herramientas
- `hooks/use-*.ts` - 20 custom hooks
- `app/(dashboard)/tools/*/page.tsx` - UI de cada herramienta
- `tests/unit/application/*.test.ts` - Suite de 1383 tests (42 archivos)
- `tests/e2e/*.spec.ts` - 20 Playwright E2E specs (15 tools + accessibility WCAG AAA + navigation + settings + command-palette + settings-export)

### Anexo C: Demo en Produccion

https://devflowai.vercel.app

### Anexo D: Guia de Instalacion

```bash
git clone https://github.com/albertoguinda/devflow-ai.git
cd devflow-ai
npm install
npm run dev
```

Abrir http://localhost:3000

---

**Fin del documento TFM**
