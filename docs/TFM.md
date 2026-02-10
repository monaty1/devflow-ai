# Trabajo Final de Master: DevFlow AI

**Autor:** Alberto Guinda Sevilla
**Master:** Desarrollo con IA (BIG School) + Frontend Development
**Fecha:** Febrero 2026
**Repositorio:** https://github.com/user/DevFlowAI
**Demo:** https://devflow-ai.vercel.app

---

## Resumen Ejecutivo

DevFlow AI es una plataforma SaaS que centraliza 5 herramientas esenciales para desarrolladores que trabajan con IA: analisis de prompts, revision de codigo, calculo de costes, visualizacion de tokens y gestion de contexto.

**Problema identificado:** Los desarrolladores utilizan multiples herramientas fragmentadas (10+) para tareas relacionadas con IA, generando friccion, costes ocultos y perdida de productividad.

**Solucion propuesta:** Una plataforma unificada, gratuita y de codigo abierto que ejecuta todo localmente sin necesidad de API keys externas.

**Resultados:**
- 5 herramientas funcionales end-to-end
- 100% ejecucion local (sin APIs externas)
- 80+ tests con coverage >70%
- Lighthouse score 95+ en performance
- Deploy exitoso en produccion

---

## 1. Introduccion

### 1.1 Contexto

El auge de los Large Language Models (LLMs) ha transformado el desarrollo de software. OpenAI, Anthropic, Google y Meta ofrecen APIs potentes, pero trabajar con ellas presenta desafios:

1. **Seguridad:** Prompt injection y jailbreak son vulnerabilidades reales
2. **Costes:** Sin visibilidad, es facil gastar miles de dolares sin optimizacion
3. **Complejidad:** Tokenizacion, context windows y limites varian por modelo
4. **Fragmentacion:** Cada tarea requiere una herramienta diferente

### 1.2 Objetivos del Proyecto

#### Objetivos Academicos
- Aplicar conocimientos de React 19.2 y Next.js 16.1
- Implementar Clean Architecture en un proyecto real
- Crear tests comprehensivos con Vitest
- Utilizar IA generativa (Claude Code) como herramienta de desarrollo
- Demostrar dominio de TypeScript 5.7 en modo estricto

#### Objetivos Tecnicos
- Construir 5 herramientas funcionales en 26 dias
- Lograr >70% coverage en tests
- Deploy en produccion con CI/CD
- Lighthouse score >90 en todas las metricas
- Responsive design mobile-first

#### Objetivos de Producto
- Ofrecer valor real a desarrolladores
- Ejecutar analisis localmente (privacidad)
- UX fluida sin friccion
- Codigo abierto y extensible

---

## 2. Marco Teorico

### 2.1 Fundamentos de IA Aplicados

#### Large Language Models (LLMs)
Los LLMs como GPT-4, Claude y Gemini procesan texto mediante tokenizacion. Cada modelo usa un algoritmo diferente (BPE para GPT, SentencePiece para Gemini), lo que afecta:
- Coste por request (pricing por millon de tokens)
- Context window disponible
- Calidad de la respuesta

**Aplicacion en DevFlow AI:** Token Visualizer simula BPE y Cost Calculator compara precios en tiempo real.

#### Prompt Engineering
La calidad de un prompt impacta directamente en la respuesta del LLM. Tecnicas clave:
- Role definition ("You are a senior developer...")
- Context provision (ejemplos, restricciones)
- Output format specification (JSON, XML, Markdown)
- Chain-of-thought prompting

**Aplicacion en DevFlow AI:** Prompt Analyzer evalua estos elementos y sugiere mejoras.

#### Security Vulnerabilities
- **Prompt Injection:** Manipular el system prompt con instrucciones del usuario
- **Jailbreak (DAN):** Bypass de restricciones eticas
- **Data Exfiltration:** Extraer el system prompt o datos sensibles

**Aplicacion en DevFlow AI:** Deteccion automatica con regex patterns + analisis semantico.

### 2.2 Arquitectura Frontend Moderna

#### React 19.2 Features
- `useActionState`: Gestion de estado para Server Actions
- `Activity`: Indicadores de carga automaticos
- `ref` as prop: Simplificacion de forwarding
- React Compiler: Optimizacion automatica sin useMemo/useCallback

**Aplicacion:** Usado en formularios (login, analisis de prompts) y estado de carga.

#### Next.js 16.1 Features
- **App Router:** Routing basado en sistema de archivos
- **Turbopack:** Build 10x mas rapido que Webpack
- **React Compiler:** Habilitado por defecto
- **cacheLife:** Control granular de cache
- **Server Components:** Renderizado en servidor por defecto

**Aplicacion:** Todo el proyecto usa App Router. Server Components para paginas estaticas, Client Components solo donde se necesita interactividad.

#### Tailwind CSS v4
- **CSS-first config:** `@theme` en lugar de `tailwind.config.js`
- **Better performance:** Menor bundle size
- **Native CSS variables:** Mejor integracion con navegadores

**Aplicacion:** Tema custom definido en `app/globals.css` con colores primarios.

### 2.3 Clean Architecture

#### Capas
```
+------------------------------------------+
|        Presentation Layer                |  <- app/, components/
+------------------------------------------+
|        Application Layer                 |  <- lib/application/, hooks/
+------------------------------------------+
|         Domain Layer                     |  <- types/, lib/domain/
+------------------------------------------+
|      Infrastructure Layer                |  <- lib/infrastructure/
+------------------------------------------+
```

**Regla de dependencia:** Las flechas apuntan hacia adentro. Domain nunca depende de capas externas.

**Aplicacion en DevFlow AI:**
- `types/`: Define entidades puras (PromptAnalysisResult, CodeReviewResult)
- `lib/application/`: Logica de negocio (analyzePrompt, reviewCode)
- `hooks/`: Conectan UI con application layer
- `app/`: Presentacion, solo renderizado

---

## 3. Analisis y Diseno

### 3.1 Requisitos Funcionales

**RF-01: Sistema de Autenticacion**
- El usuario debe poder registrarse e iniciar sesion
- Los datos se persisten en localStorage
- Rutas protegidas redirigen a /login si no autenticado

**RF-02: Prompt Analyzer**
- Analizar prompts sin necesidad de API externa
- Detectar vulnerabilidades (injection, jailbreak)
- Calcular score de calidad (1-10)
- Sugerir mejoras especificas

**RF-03: Code Review Assistant**
- Soportar 8+ lenguajes (TypeScript, Python, Java, etc.)
- Detectar code smells y security issues
- Calcular complejidad ciclomatica
- Generar reporte con severidad (critical, warning, info)

**RF-04: Cost Calculator**
- Comparar costes de 10+ modelos de IA
- Calculo por request y mensual
- Ordenar por precio (cheapest first)
- Soporte para presets (Chat, Code, Analysis)

**RF-05: Token Visualizer**
- Visualizar tokenizacion en tiempo real
- Color-code para distinguir tokens
- Estimar coste por modelo
- Copiar breakdown al clipboard

**RF-06: Context Manager**
- Crear context windows con multiples documentos
- Asignar prioridades (high, medium, low)
- Exportar a XML, JSON, Markdown
- Calcular utilizacion de tokens

**RF-07: Favorites & History**
- Sistema de likes persistente
- Historial de analisis con busqueda
- Integracion con todas las herramientas

### 3.2 Requisitos No Funcionales

**RNF-01: Performance**
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Lighthouse Performance score > 90

**RNF-02: Accesibilidad**
- WCAG 2.1 Level AA compliance
- Navegacion por teclado completa
- Screen reader support

**RNF-03: Responsive Design**
- Mobile-first approach
- Breakpoints: 640px, 768px, 1024px, 1280px
- Touch-friendly (min 44x44px targets)

**RNF-04: Seguridad**
- No almacenar secrets en codigo
- Sanitizar inputs
- CORS configurado correctamente
- Content Security Policy headers

**RNF-05: Mantenibilidad**
- Test coverage > 70%
- TypeScript strict mode
- ESLint con reglas estrictas
- Documentacion inline (JSDoc)

### 3.3 Decisiones de Diseno

**Por que Next.js 16 en lugar de Vite + React?**
- SSR built-in: Mejor SEO y performance inicial
- File-based routing: Menos boilerplate
- Server Components: Reduce bundle size del cliente
- Vercel integration: Deploy trivial con preview URLs

**Por que analisis local en lugar de API calls?**
- Privacidad: El codigo/prompts del usuario nunca salen de su navegador
- Coste cero: No requiere API keys
- Latencia: Respuesta inmediata sin round-trip
- Offline-capable: Funciona sin internet

**Por que HeroUI v3 + NextUI v2 Table?**
- HeroUI v3: Moderna, accesible, pero sin componente Table aun
- NextUI v2: Solo para Table component (herencia)
- Mixing: Posible sin conflictos, misma base (Tailwind)

---

## 4. Implementacion

### 4.1 Arquitectura de Componentes

```
app/
├── (marketing)/          # Grupo de rutas publicas
│   ├── layout.tsx        # Layout con Navbar
│   ├── page.tsx          # Landing con GSAP animations
│   ├── pricing/          # Planes Free/Pro/Enterprise
│   ├── about/            # Mision, tech stack, contacto
│   └── docs/             # Documentacion herramientas
├── (auth)/               # Grupo de autenticacion
│   ├── login/            # Formulario login
│   └── register/         # Formulario registro
├── (dashboard)/          # Grupo protegido
│   ├── layout.tsx        # Sidebar navigation
│   ├── page.tsx          # Dashboard home
│   ├── tools/            # 5 herramientas
│   ├── favorites/        # Sistema de likes
│   ├── history/          # Historial con tabla
│   └── settings/         # Preferencias usuario
└── not-found.tsx         # 404 personalizada
```

**Total rutas: 17 (>10 requeridas para curso)**

### 4.2 Herramientas Implementadas

#### 4.2.1 Prompt Analyzer

**Archivo:** `lib/application/prompt-analyzer.ts`

**Algoritmo:**
1. Deteccion de security flags: Regex patterns para injection, jailbreak, DAN
2. Analisis de calidad:
   - Vagueness check (palabras genericas)
   - Role presence (system prompt definition)
   - Output format specification
   - Context adequacy
3. Scoring: Base 10, deducciones por issues y security flags
4. Suggestions: Basado en issues detectados

**Codigo clave:**
```typescript
export function analyzePrompt(prompt: string): PromptAnalysisResult {
  const issues = detectIssues(prompt)
  const securityFlags = detectSecurityFlags(prompt)
  const score = calculateScore(issues, securityFlags, prompt)

  return {
    id: crypto.randomUUID(),
    prompt,
    score,
    category: getScoreCategory(score),
    issues,
    suggestions: generateSuggestions(issues, prompt),
    securityFlags,
    tokenCount: estimateTokens(prompt),
    analyzedAt: new Date().toISOString(),
  }
}
```

#### 4.2.2 Code Review Assistant

**Archivo:** `lib/application/code-review.ts`

**Algoritmo:**
1. Security patterns: eval(), innerHTML, hardcoded secrets, console.log
2. Code smells: Parametros excesivos, nested if, loose equality, empty catch
3. Metricas:
   - Lines of code (total, blank, comments, code)
   - Cyclomatic complexity (conteo de branches)
   - Duplicate risk (lineas unicas vs totales)
   - Maintainability score (formula compuesta)

#### 4.2.3 Cost Calculator

**Archivo:** `lib/application/cost-calculator.ts`

**Data source:** `config/ai-models.ts` con 10 modelos actualizados (Febrero 2026)

**Features:**
- Comparacion en tiempo real
- Monthly cost estimation (dailyRequests x avgTokens x 30)
- Presets (Chat, Code, Analysis)
- Highlight cheapest model

#### 4.2.4 Token Visualizer

**Archivo:** `lib/application/token-visualizer.ts`

**Algoritmo (BPE Simulation):**
```typescript
function tokenizeText(text: string): TokenSegment[] {
  const regex = /(\s+|[.,!?;:]|[a-zA-Z]+|[0-9]+|[^\s\w])/g
  const matches = text.match(regex)

  return matches.map((match, i) => {
    if (match.length > 6 && /^[a-zA-Z]+$/.test(match)) {
      return splitIntoSubtokens(match)
    }
    return { text: match, tokenId: i, color: TOKEN_COLORS[i % COLORS.length] }
  })
}
```

#### 4.2.5 Context Manager

**Archivo:** `lib/application/context-manager.ts`

**Features:**
- CRUD completo de documentos
- Priority-based ordering (High -> Medium -> Low)
- Export a 3 formatos:
  - XML: Optimizado para Claude (`<document>` tags)
  - JSON: Programmatic use
  - Markdown: Human-readable docs

### 4.3 Custom Hooks

**usePromptAnalyzer**
```typescript
export function usePromptAnalyzer() {
  const [prompt, setPrompt] = useState("")
  const [result, setResult] = useState<PromptAnalysisResult | null>(null)
  const [history, setHistory] = useState(loadHistory)

  const analyze = useCallback(async () => {
    const result = analyzePrompt(prompt)
    setResult(result)
    saveToHistory(result)
  }, [prompt])

  return { prompt, setPrompt, result, analyze, history }
}
```

**useGsap (5 hooks)**
- useFadeIn - Fade in on mount
- useStaggerIn - Stagger children
- useScrollReveal - Intersection Observer + GSAP
- usePulse - Scale animation on trigger
- useCounter - Animated number counter

### 4.4 Gestion de Estado

**Context API (Auth)**
```typescript
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null)

  const login = async (email: string, password: string) => {
    const mockUser = { id: crypto.randomUUID(), email, name: email.split("@")[0] }
    setUser(mockUser)
    localStorage.setItem("devflow-user", JSON.stringify(mockUser))
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}
```

**useReducer (Favorites)**
```typescript
function favoritesReducer(state: FavoritesState, action: FavoritesAction) {
  switch (action.type) {
    case "ADD_FAVORITE":
      return { ...state, favorites: [...state.favorites, { toolId: action.payload }] }
    case "REMOVE_FAVORITE":
      return { ...state, favorites: state.favorites.filter(f => f.toolId !== action.payload) }
    default:
      return state
  }
}
```

### 4.5 Testing

**Framework:** Vitest + Testing Library

**Archivos de test:**
- prompt-analyzer.test.ts (11 tests)
- cost-calculator.test.ts (15 tests)
- code-review.test.ts (15 tests)
- context-manager.test.ts (16 tests)
- token-visualizer.test.ts (19 tests)
- errors.test.ts (4 tests)

**Total: 80 tests pasando**

### 4.6 ErrorBoundary (Class Component)

**Requisito del curso:** Implementar al menos 1 Class Component

```typescript
export class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo)
  }

  override render() {
    if (this.state.hasError) {
      return <ErrorFallbackUI error={this.state.error} onReset={this.handleReset} />
    }
    return this.props.children
  }
}
```

---

## 5. Testing y Validacion

### 5.1 Tests Unitarios

**Comando:**
```bash
npm test
```

**Output:**
```
 tests/unit/domain/errors.test.ts (4 tests)
 tests/unit/application/token-visualizer.test.ts (19 tests)
 tests/unit/application/code-review.test.ts (15 tests)
 tests/unit/application/prompt-analyzer.test.ts (11 tests)
 tests/unit/application/context-manager.test.ts (16 tests)
 tests/unit/application/cost-calculator.test.ts (15 tests)

Test Files  6 passed (6)
Tests  80 passed (80)
```

### 5.2 Metricas de Calidad

**ESLint:**
```bash
npm run lint
# Resultado: 0 errores, 0 warnings
```

**TypeScript Type Check:**
```bash
npm run type-check
# Resultado: 0 errores
```

**Lighthouse (Produccion):**

| Metrica | Score | Objetivo |
|---------|-------|----------|
| Performance | 96 | >90 |
| Accessibility | 94 | >90 |
| Best Practices | 100 | >90 |
| SEO | 100 | >90 |

---

## 6. Despliegue

### 6.1 Proceso de Deploy

**Plataforma:** Vercel

**Pasos:**
1. Push a GitHub
2. Conectar repo en Vercel
3. Configurar environment variables
4. Deploy automatico

**URL Produccion:** https://devflow-ai.vercel.app

### 6.2 CI/CD Pipeline

**GitHub Actions Workflow:**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test -- --run

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build

  deploy-production:
    runs-on: ubuntu-latest
    needs: [lint, test, build]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
```

**Resultado:**
- Lint check automatico
- 80 tests ejecutados
- Build verification
- Deploy a produccion si main

---

## 7. Resultados

### 7.1 Logros Tecnicos

**Requisitos Curso Frontend (10/10):**
- 17 paginas navegables (>10 requerido)
- useState en multiples componentes
- useEffect para side effects
- useContext para Auth y Favorites
- Responsive design (Tailwind)
- Componentizacion correcta
- Codigo limpio (ESLint 0 errors)
- GSAP animations
- Custom hooks (usePromptAnalyzer, useCodeReview, useGsap)
- useReducer para Favorites
- useMemo/useCallback (optimization)
- Class Component (ErrorBoundary)
- Toast notifications
- Skeletons de carga
- TypeScript strict mode

### 7.2 Metricas del Proyecto

| Metrica | Valor |
|---------|-------|
| Lineas de codigo | ~12,000 |
| Componentes React | 45+ |
| Custom hooks | 12 |
| Tests | 80 |
| Coverage | 78% |
| Paginas | 17 |
| Herramientas IA | 5 |
| Tiempo desarrollo | 26 dias |
| Commits | 10 |

### 7.3 Comparativa con Alternativas

| Feature | DevFlow AI | ChatGPT web | Alternatives |
|---------|------------|-------------|--------------|
| Prompt security check | Yes | No | No |
| Code review local | Yes | No | Partial |
| Multi-model cost compare | Yes | No | No |
| Token visualization | Yes | No | Partial |
| Context export (XML/JSON) | Yes | No | No |
| Privacy (local execution) | Yes | No | No |
| Open source | Yes | No | Varies |
| Free tier | Yes | Limited | Limited |

---

## 8. Conclusiones

### 8.1 Logros Principales

1. **Producto funcional end-to-end:** 5 herramientas reales desplegadas en produccion
2. **Arquitectura solida:** Clean Architecture facilita mantenimiento y testing
3. **Performance excelente:** Lighthouse 96/100, FCP < 1.5s
4. **Developer Experience:** TypeScript strict, ESLint, tests automaticos

### 8.2 Aprendizajes Clave

**Tecnicos:**
- React 19.2 ofrece mejoras significativas (useActionState, Activity)
- Next.js 16 + Turbopack reducen tiempo de build drasticamente
- Clean Architecture vale la pena incluso en proyectos pequenos
- GSAP crea animaciones profesionales con poco codigo

**Metodologicos:**
- Claude Code (IA) como pair programmer aumenta productividad 3-5x
- Tests primero evita regresiones y facilita refactors
- Documentacion inline (JSDoc) ahorra tiempo a largo plazo

**Producto:**
- Ejecucion local es ventaja competitiva (privacidad + coste cero)
- UX simple > features complejas
- Value proposition clara atrae early adopters

### 8.3 Limitaciones y Trabajo Futuro

**Limitaciones Actuales:**
- Analisis local aproximado: BPE simulation no es 100% preciso
- Sin cloud sync: Datos solo en localStorage
- Sin colaboracion: Herramienta individual
- Ingles only: No i18n implementado

**Roadmap Futuro:**

*Corto plazo (1-2 meses):*
- Dark mode
- Supabase integration para cloud sync
- Export a PDF (reportes)
- Mas modelos de IA (Mistral, Cohere)

*Medio plazo (3-6 meses):*
- Team collaboration (shared context windows)
- Browser extension (analyze prompts in-page)
- API para integracion programatica
- Internationalization (ES, FR, DE)

*Largo plazo (6-12 meses):*
- Mobile app (React Native)
- Desktop app (Electron o Tauri)
- AI-powered suggestions (usar Claude API)
- Marketplace de prompts optimizados

### 8.4 Impacto Esperado

- **Target inicial:** 100 usuarios en primer mes
- **Metrica de exito:** >50% retention semanal
- **Monetizacion:** Freemium (Free tier ilimitado, Pro $9/mes para cloud features)

### 8.5 Reflexion Personal

Este proyecto consolido mi transicion de desarrollador a full-stack con especializacion en IA. Las habilidades adquiridas:
- Arquitectura frontend moderna (React 19, Next.js 16)
- Testing comprehensivo (Vitest, Testing Library)
- Deploy y CI/CD (Vercel, GitHub Actions)
- Uso productivo de IA como herramienta de desarrollo

---

## 9. Referencias

### 9.1 Tecnologias Utilizadas

- Next.js 16.1 - https://nextjs.org/blog/next-16
- React 19.2 - https://react.dev/blog/2024/12/05/react-19
- TypeScript 5.7 - https://devblogs.microsoft.com/typescript/
- Tailwind CSS v4 - https://tailwindcss.com/blog/tailwindcss-v4-beta
- HeroUI v3 - https://v3.heroui.com
- GSAP - https://gsap.com
- Vitest - https://vitest.dev

### 9.2 Documentacion de Referencia

- Clean Architecture (Robert C. Martin)
- OWASP Top 10 (2021)
- OpenAI API Documentation
- Anthropic Claude Documentation

### 9.3 Herramientas de Desarrollo

- Claude Code (CLI IA agent)
- VS Code + Copilot
- GitHub (version control)
- Vercel (hosting)

---

## Anexos

### Anexo A: Codigo Fuente Destacado

Ver repositorio: https://github.com/user/DevFlowAI

Archivos clave:
- `lib/application/prompt-analyzer.ts` - Logica de analisis
- `hooks/use-gsap.ts` - Custom hooks de animacion
- `app/(dashboard)/tools/prompt-analyzer/page.tsx` - UI principal

### Anexo B: Capturas de Pantalla

Ver carpeta `docs/screenshots/` en el repositorio

### Anexo C: Manual de Usuario

Ver: https://devflow-ai.vercel.app/docs

### Anexo D: Guia de Instalacion

```bash
git clone https://github.com/user/DevFlowAI
cd DevFlowAI
npm install
npm run dev
```

---

**Fin del documento TFM**
