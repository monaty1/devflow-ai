# Guia de Slides TFM — DevFlow AI

## Archivo de presentacion

La presentacion Slidev esta en `slides/presentation.md` (14 slides, ~15-20 min).

---

## Setup Slidev

### Opcion A: Instalacion global (recomendada)

```bash
# 1. Instalar Slidev globalmente
npm install -g @slidev/cli

# 2. Ejecutar la presentacion desde la raiz del proyecto
slidev slides/presentation.md

# 3. Abre http://localhost:3030
```

### Opcion B: Sin instalacion (npx)

```bash
npx @slidev/cli slides/presentation.md
```

> Necesitas Node.js 18+ instalado.

---

## Controles durante la presentacion

| Tecla | Accion |
|-------|--------|
| `→` / `Space` | Siguiente slide |
| `←` | Slide anterior |
| `o` | Vista general (overview) |
| `d` | Toggle dark/light mode |
| `f` | Pantalla completa |
| Numero + `Enter` | Ir a slide N |

---

## Exportar a PDF

Necesitas Playwright instalado para el export:

```bash
# Instalar Playwright si no lo tienes
npx playwright install chromium

# Export basico a PDF
slidev export slides/presentation.md --format pdf --output docs/TFM-Slides.pdf

# Si el timeout falla con slides pesadas
slidev export slides/presentation.md --format pdf --output docs/TFM-Slides.pdf --timeout 60000

# Export a PPTX (editable en PowerPoint/Google Slides)
slidev export slides/presentation.md --format pptx --output docs/TFM-Slides.pptx
```

Despues del export, commitea el PDF:

```bash
git add docs/TFM-Slides.pdf
git commit -m "docs: update TFM presentation slides PDF"
git push
```

---

## Capturas de pantalla (opcionales)

Para mejorar las slides con imagenes reales, crea la carpeta `docs/screenshots/` y toma estas capturas:

### Obligatorias

| # | Captura | Instrucciones |
|---|---------|---------------|
| 1 | `lighthouse-100.png` | Chrome incognito → DevTools → Lighthouse → Desktop → Analizar devflowai.vercel.app |
| 2 | `demo-prompt-analyzer.png` | Analizar prompt con inyeccion → capturar score bajo + "Injection Detected" |
| 3 | `demo-cost-calculator.png` | 10K input / 2K output / 100 req/day → capturar tabla comparativa |
| 4 | `demo-code-review.png` | Pegar codigo con `eval()` + innerHTML → capturar issues criticos |
| 5 | `tools-grid.png` | /tools → capturar grid de las 15 herramientas |

### Recomendadas

| # | Captura | Instrucciones |
|---|---------|---------------|
| 6 | `homepage-hero.png` | Landing page en dark mode |
| 7 | `ci-cd-passing.png` | GitHub Actions → ultimo workflow verde |
| 8 | `app-spanish.png` | Cualquier herramienta en espanol |

Para insertar una imagen en una slide, usa el layout `image-right`:

```yaml
---
layout: image-right
image: /screenshots/demo-prompt-analyzer.png
---
```

---

## Estructura de la presentacion (14 slides)

| # | Slide | Tiempo estimado |
|---|-------|-----------------|
| 1 | Portada | 30s |
| 2 | El Problema | 1.5min |
| 3 | La Solucion | 1min |
| 4 | Las 15 Herramientas | 1min |
| 5 | Arquitectura Clean | 2min |
| 6 | Stack Tecnologico | 1min |
| 7 | Server Components & Performance | 1.5min |
| 8 | Testing 100/80/0 | 1.5min |
| 9 | Seguridad | 1.5min |
| 10 | Internacionalizacion | 1min |
| 11 | Features Clave | 1.5min |
| 12 | Resultados | 1min |
| 13 | Conclusiones | 1.5min |
| 14 | Demo + Q&A | resto |

**Total: ~16 min** presentacion + demo en vivo + preguntas

---

## Tips para la presentacion

1. **Demo en vivo**: Abre https://devflowai.vercel.app antes de empezar. Muestra Prompt Analyzer con un prompt malicioso, Cost Calculator y Code Review
2. **Dark mode**: La presentacion queda mejor en dark mode (`d` para toggle)
3. **Tablet/portatil**: Slidev funciona en cualquier navegador moderno
4. **Backup**: Ten el PDF exportado listo por si falla la conexion
5. **Overview**: Usa `o` para mostrar todas las slides al tribunal si piden saltar a un tema
