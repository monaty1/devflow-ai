# Presentacion TFM — DevFlow AI

## Formatos disponibles

| Formato | Archivo | Uso |
|---------|---------|-----|
| **PDF** (recomendado) | [docs/TFM-Slides.pdf](./TFM-Slides.pdf) | Abrir directamente, imprimir, enviar por email |
| **PPTX** | [docs/TFM-Slides.pptx](./TFM-Slides.pptx) | Editar en PowerPoint/Google Slides |
| **Slidev** (interactivo) | [slides/presentation.md](../slides/presentation.md) | Presentar con animaciones y transiciones |

> Si el PDF o PPTX no se visualizan correctamente, la fuente de verdad es `slides/presentation.md`. Ejecuta el comando de abajo para regenerarlos.

---

## Ejecutar la presentacion interactiva (Slidev)

```bash
# Opcion A: sin instalar nada
npx @slidev/cli slides/presentation.md

# Opcion B: instalacion global
npm install -g @slidev/cli
slidev slides/presentation.md
```

Abre http://localhost:3030

---

## Controles de presentacion

| Tecla | Accion |
|-------|--------|
| `→` / `Space` | Siguiente slide |
| `←` | Slide anterior |
| `o` | Vista general (overview) |
| `d` | Toggle dark/light mode |
| `f` | Pantalla completa |
| Numero + `Enter` | Ir a slide N |

---

## Regenerar los exports

### PDF

Con el servidor Slidev corriendo (`npx @slidev/cli slides/presentation.md`):

**Opcion 1 — Navegador:** Abre http://localhost:3030/export y haz click en "Export as Vector File"

**Opcion 2 — Script automatico:**

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3030/export', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.pdf({ path: 'docs/TFM-Slides.pdf', format: 'A4', landscape: true, printBackground: true });
  await browser.close();
  console.log('PDF exportado en docs/TFM-Slides.pdf');
})();
"
```

### PPTX

Abre http://localhost:3030/export y selecciona la opcion PPTX/images.

---

## Estructura (14 slides, ~15-20 min)

| # | Slide | Tiempo |
|---|-------|--------|
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

---

## Tips para la presentacion

1. **Demo en vivo**: Abre https://devflowai.vercel.app antes de empezar. Muestra Prompt Analyzer con un prompt malicioso, Cost Calculator y Code Review
2. **Dark mode**: Pulsa `d` para toggle — queda mejor en proyector oscuro
3. **Backup**: Si falla la conexion, usa el PDF exportado
4. **Overview**: Pulsa `o` para mostrar todas las slides al tribunal si piden saltar a un tema
