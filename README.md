# 🦀 RustPixel Academy

[![GitHub Pages Deployment](https://img.shields.io/badge/GitHub%20Pages-Sitio%20en%20Vivo-22c55e?style=for-the-badge&logo=github&logoColor=white)](https://vigilioyonatan.github.io/rustpixel-academy/)
[![CI / Quality Gates](https://img.shields.io/badge/CI%20Pipeline-Pasando-teal?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/VigilioYonatan/rustpixel-academy/actions)
[![Zero-Backend Architecture](https://img.shields.io/badge/Arquitectura-Static%20SPA%20%7C%20Local--First-e76f36?style=for-the-badge&logo=rust&logoColor=white)](https://vigilioyonatan.github.io/rustpixel-academy/)
[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-f2be58?style=for-the-badge)](LICENSE)

> **Plataforma interactiva para dominar Rust.** Pasa de conocer la sintaxis básica a tomar decisiones reales de arquitectura, resolver incidentes de producción bajo presión y auditar calidad con criterios de nivel Senior.

👉 **Pruébalo en vivo en tu navegador (sin registro ni descargas):**  
🌐 **[https://vigilioyonatan.github.io/rustpixel-academy/](https://vigilioyonatan.github.io/rustpixel-academy/)**

---

## 🎬 Video Demostración — Senior Mode en Acción

Mira cómo funciona la navegación fluida, el editor de código Rust Forge, el visor de diferencias (diff) y la simulación de incidentes en tiempo real:

<div align="center">
  <video src="https://github.com/VigilioYonatan/rustpixel-academy/raw/main/screenshots/videos/rustpixel-academy-showcase.webm" controls="controls" width="100%" poster="screenshots/showcase/06_senior_challenge_s01.png">
    Tu navegador no soporta la reproducción de video HTML5. Puedes descargar o ver el video en el enlace de abajo.
  </video>
  <p>
    📹 <em>¿No se reproduce directamente?</em> 
    <a href="https://github.com/VigilioYonatan/rustpixel-academy/raw/main/screenshots/videos/rustpixel-academy-showcase.webm"><strong>Haz clic aquí para abrir o descargar el video en alta definición (.webm)</strong></a>
  </p>
</div>

[![Ver Video Demostración de Senior Mode](screenshots/showcase/06_senior_challenge_s01.png)](https://github.com/VigilioYonatan/rustpixel-academy/raw/main/screenshots/videos/rustpixel-academy-showcase.webm)

---

## 💡 ¿Qué Problema Resuelve Esta Aplicación?

La gran mayoría de tutoriales y cursos de Rust se quedan en la superficie: te enseñan la sintaxis (`fn main`, variables, structs básicos y enums), pero cuando llegas a un entorno de trabajo real te estrellas contra los problemas difíciles:

- **¿Cómo evitar miles de clonaciones innecesarias en memoria (Heap) sin enredarte con lifetimes?**
- **¿Cómo diagnosticar y mitigar un deadlock en Tokio bajo saturación de tráfico?**
- **¿Cómo diseñar crates desacoplados sin dependencias circulares?**
- **¿Cómo auditar código inseguro (`unsafe`) o vulnerabilidades de autorización (IDOR)?**

**RustPixel Academy resuelve esa brecha:** te lleva desde los conceptos iniciales de *Ownership* y *Borrow Checker* hasta enfrentarte a **18 incidentes de producción reales** con las herramientas y criterios que utiliza un **Ingeniero Senior**.

---

## 🔥 ¿Qué es el Senior Mode y qué incluye?

El **Modo Senior** es el corazón avanzado de la plataforma. No es un examen de opción múltiple común; es un simulador de toma de decisiones de ingeniería:

1. **18 Desafíos Profesionales (S01–S18):** Escenarios reales inspirados en problemas de producción: contención de bloqueos, fugas de memoria, optimización con slices prestados (`&str`), APIs resilientes y contratos de datos.
2. **Incident Arena con Telemetría en Vivo:** Simulador de caídas en producción con gráfico *sparkline* en tiempo real, latencias P99 y degradación de SLAs. Debes elegir la estrategia de mitigación correcta (rollback, escalado, aislamiento o drenado con timeout) antes de que el servicio colapse.
3. **Visor de Diferencias (Senior Diff Viewer):** Compara visualmente el código original defectuoso frente a la refactorización Senior sugerida con resaltado de líneas añadidas y eliminadas.
4. **Workspaces de Code Review y Arquitectura ADR:** Herramientas para dejar notas de revisión línea por línea en código fuente o diseñar diagramas de componentes con decisiones de arquitectura justificadas.
5. **Matriz de 90 Gates de Aceptación:** Auditoría interactiva con 5 criterios de producción por cada módulo para autorizar un release técnico.
6. **Radar Pentagonal de Competencias:** Gráfico SVG interactivo que evalúa tu perfil en las 5 dimensiones clave: **Corrección, Seguridad, Arquitectura, Operaciones y Rendimiento**.

---

## 📚 ¿Qué más encuentras en este Repositorio?

Además del Modo Senior, la academia ofrece una experiencia formativa completa:

- **54 Módulos Curriculares:** Organizados en niveles Básico (B01–B12), Intermedio (I01–I12), Avanzado (A01–A12) y Senior (S01–S18).
- **Editor Rust Forge (CodeMirror 6):** Editor integrado con tema oscuro personalizado de alto contraste, coloreado de sintaxis calibrado para Rust y botón directo para probar tus soluciones en el compilador oficial de Rust Playground.
- **Minijuegos de Lógica y Memoria:** Actividades interactivas como el *Ownership Puzzle* para dominar visualmente cómo se mueven los datos entre Stack y Heap.
- **8 Rutas del Ecosistema Rust:** Guías especializadas para Backend Web, Tokio Asíncrono, CLIs, Sistemas Embebidos, Criptografía y Motores de Juegos.
- **Internacionalización en 6 Idiomas:** Toda la interfaz disponible en Español, Inglés, Francés, Alemán, Portugués e Italiano.
- **100% Local-First y Privado:** Todo tu progreso, notas y respuestas se guardan en tu propio navegador (`localStorage`). No necesitas crear cuenta, no hay cookies de rastreo y no dependes de ningún servidor externo.

---

## 🖼️ Galería Visual

| Editor Rust Forge (CodeMirror 6) | Dashboard Senior & Radar Pentagonal |
| :---: | :---: |
| ![Editor Rust Forge](screenshots/showcase/04_editor_lesson_b01.png) | ![Senior Dashboard](screenshots/showcase/05_senior_dashboard.png) |

| Incident Arena & Telemetría en Tiempo Real | Matriz de los 90 Criterios de Producción |
| :---: | :---: |
| ![Incident Arena](screenshots/showcase/07_incident_arena_standalone.png) | ![90 Gates Matrix](screenshots/showcase/08_acceptance_90_gates_matrix.png) |

| Modo Oscuro | Modo Claro |
| :---: | :---: |
| ![Modo Oscuro](screenshots/showcase/01_home_dark_hero.png) | ![Modo Claro](screenshots/showcase/02_home_light_hero.png) |

---

## ⚡ ¿Cómo ejecutarlo en tu computadora? (< 3 minutos)

Solo necesitas tener instalado **Node.js** (versión 20 o superior).

```bash
# 1. Clonar el repositorio
git clone https://github.com/VigilioYonatan/rustpixel-academy.git
cd rustpixel-academy

# 2. Instalar dependencias
npm ci

# 3. Iniciar el servidor local de desarrollo
npm run dev
```

Abre tu navegador en `http://localhost:5174/` y listo.

---

## 🛠️ Stack Tecnológico (Resumido)

- **Frontend:** Preact 10 + `@preact/signals` (ultraligero, rápido y sin complejidad innecesaria).
- **Editor:** CodeMirror 6 con tema personalizado *Rust Forge*.
- **Iconos:** `lucide-preact` (iconografía vectorial SVG accesible, sin emojis como botones).
- **Persistencia:** LocalStorage estructurado y versionado (cero servidores de backend requeridos).
- **Herramientas de Calidad:** Vite, Biome, Vitest y Playwright.

---

## 🧪 Pruebas y Validación Rápida

Si deseas comprobar la salud del proyecto:

```bash
npm test        # Ejecuta la suite de pruebas unitarias con Vitest (100% PASS)
npm run lint    # Audita formato y calidad de código con Biome
npm run build   # Compila la versión estática de producción
```

---

## 👥 Autoría y Licencia

- **Creador:** **Yonatan Vigilio**
- **Licencia:** Distribuido bajo la licencia [MIT](LICENSE). Código libre para aprender, enseñar y construir.
- **Aviso:** Rust es una marca registrada de la Rust Foundation. Este es un proyecto educativo independiente de código abierto.
