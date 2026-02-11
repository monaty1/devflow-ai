<div align="center">

# Contributing to DevFlow AI

**[English](#-english)** &middot; **[Castellano](#-castellano)**

</div>

---

<a name="-english"></a>

## 🇬🇧 English

First off, thank you for considering contributing to DevFlow AI! 🚀

This project is built by developers, for developers (_"Para vosotros, developers"_). We believe in tools that respect privacy, run locally, and don't depend on heavy external libraries.

### 🌟 Core Philosophy

Before writing code, please understand the core principles of this project:

1.  **Zero External Dependencies (if possible):** We prefer native Web APIs (Regex, Intl, JSON, etc.) over installing heavy npm packages. If it can be done with vanilla JS/TS, do it that way.
2.  **Local & Offline:** All tools must work 100% offline. No API calls to external servers for data processing.
3.  **Clean Architecture:** We strictly separate **Business Logic** from **UI components**.
4.  **Accessibility (a11y):** We aim for WCAG AAA. Everything must be navigable via keyboard.

### 🏗 Project Architecture

To keep the project maintainable, we follow a specific folder structure. Please do not mix these layers.

| Path                     | Layer            | Responsibility                                                                         |
| ------------------------ | ---------------- | -------------------------------------------------------------------------------------- |
| `lib/application/`       | **Application**  | Pure business logic. **No React code here.** Pure TypeScript functions.                |
| `domain/`                | **Domain**       | Entities, Value Objects, and core Types.                                               |
| `hooks/`                 | **Adapter**      | React Hooks that connect the UI to the Application layer. State management lives here. |
| `app/(dashboard)/tools/` | **Presentation** | UI Pages. Only rendering logic.                                                        |
| `components/ui/`         | **Shared UI**    | Reusable atoms (Buttons, Cards, Inputs).                                               |
| `locales/`               | **i18n**         | All text strings must be here (en.json, es.json).                                      |

### 👩‍💻 How to Add a New Tool

Want to add a new tool? Follow this **6-Step Workflow** to ensure it matches the project quality:

1.  **Define the Interface (`types/`):**
    Create `types/my-new-tool.ts` defining inputs and outputs.

2.  **Write the Logic (`lib/application/`):**
    Write the pure function that performs the task. **Do not import React here.**

    ```ts
    // lib/application/my-new-tool.ts
    export function formatSomething(input: string): string { ... }
    ```

3.  **Write the Tests (`tests/unit/application/`):**
    Mandatory. We use Vitest. Your logic must be tested before creating the UI.

    ```bash
    npm run test
    ```

4.  **Create the Hook (`hooks/`):**
    Create `hooks/use-my-new-tool.ts` to manage state, errors, and localStorage.

5.  **Create the UI (`app/(dashboard)/tools/`):**
    Create the page using the existing components (`ToolCard`, `Button`, etc.).

6.  **Register the Tool (`config/tools-data.ts`):**
    Add your new tool to the configuration so it appears in the sidebar and search.

### 🧪 Testing & Quality

- **Tests:** Run `npm run test` to ensure you haven't broken anything.
- **Linting:** Run `npm run lint` to fix style issues.
- **Commits:** Please use **Conventional Commits** (feat, fix, docs, style, refactor).

### 🌍 Internationalization (i18n)

- **Do not hardcode text** in your components.
- Add keys to `locales/en.json` and `locales/es.json`.
- Use the `useTranslation` hook to display text.

---

<a name="-castellano"></a>

## 🇪🇸 Castellano

¡Gracias por querer contribuir a DevFlow AI! 🚀

Este proyecto está hecho por desarrolladores, para desarrolladores (_"Para vosotros, developers"_). Creemos en herramientas que respetan la privacidad, funcionan en local y no dependen de librerías pesadas.

### 🌟 Filosofía del Proyecto

Antes de escribir código, por favor entiende los principios básicos:

1.  **Cero Dependencias Externas (si es posible):** Preferimos APIs nativas (Regex, Intl, JSON) antes que instalar paquetes npm pesados. Si se puede hacer con JS/TS vanilla, hazlo así.
2.  **Local y Offline:** Todo debe funcionar 100% offline. Nada de llamadas a APIs externas para procesar datos.
3.  **Clean Architecture:** Separamos estrictamente la **Lógica de Negocio** de la **Interfaz de Usuario (UI)**.
4.  **Accesibilidad (a11y):** Buscamos WCAG AAA. Todo debe ser navegable con teclado.

### 🏗 Arquitectura

Para mantener el proyecto escalable, seguimos una estructura de carpetas estricta.

| Ruta                     | Capa             | Responsabilidad                                                                   |
| ------------------------ | ---------------- | --------------------------------------------------------------------------------- |
| `lib/application/`       | **Aplicación**   | Lógica de negocio pura. **Nada de React aquí.** Solo funciones TypeScript.        |
| `domain/`                | **Dominio**      | Entidades, Value Objects y Tipos core.                                            |
| `hooks/`                 | **Adaptador**    | Hooks de React que conectan la UI con la capa de Aplicación. Aquí vive el estado. |
| `app/(dashboard)/tools/` | **Presentación** | Páginas UI. Solo lógica de renderizado.                                           |
| `components/ui/`         | **Shared UI**    | Componentes reutilizables (Botones, Cards, Inputs).                               |
| `locales/`               | **i18n**         | Todos los textos deben estar aquí (en.json, es.json).                             |

### 👩‍💻 Cómo Añadir una Nueva Herramienta

¿Quieres crear una tool? Sigue este **Flujo de 6 Pasos** para mantener la calidad:

1.  **Define la Interfaz (`types/`):**
    Crea `types/mi-nueva-tool.ts` definiendo qué entra y qué sale.

2.  **Escribe la Lógica (`lib/application/`):**
    Crea la función pura que hace el trabajo. **No importes React aquí.**

    ```ts
    // lib/application/mi-nueva-tool.ts
    export function formatearAlgo(input: string): string { ... }
    ```

3.  **Escribe los Tests (`tests/unit/application/`):**
    Obligatorio. Usamos Vitest. Tu lógica debe estar testada antes de tocar la UI.

    ```bash
    npm run test
    ```

4.  **Crea el Hook (`hooks/`):**
    Crea `hooks/use-mi-nueva-tool.ts` para gestionar el estado, errores y localStorage.

5.  **Crea la UI (`app/(dashboard)/tools/`):**
    Crea la página usando los componentes existentes (`ToolCard`, `Button`, etc.).

6.  **Registra la Tool (`config/tools-data.ts`):**
    Añade tu herramienta a la configuración para que salga en la sidebar y el buscador.

### 🧪 Testing y Calidad

- **Tests:** Ejecuta `npm run test` para asegurar que no has roto nada.
- **Linting:** Ejecuta `npm run lint` para arreglar estilos.
- **Commits:** Por favor usa **Conventional Commits** (feat, fix, docs, style, refactor).

### 🌍 Internacionalización (i18n)

- **No escribas texto "a fuego" (hardcode)** en los componentes.
- Añade las claves en `locales/en.json` y `locales/es.json`.
- Usa el hook `useTranslation` para mostrar los textos.

---

<div align="center">

**[Volver arriba / Back to top](#)**

</div>
