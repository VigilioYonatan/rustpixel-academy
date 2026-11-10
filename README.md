# 🦀 RustPixel Academy v0.6.0 — Senior Evidence Workbench

**Estado: entrega parcial; no aprobada para producción.** Conserva todas las funciones de v0.5.0.

## Cambios v0.6

- Nuevo registro de evidencias reproducibles para los 18 desafíos, con fuente declarada, tipo, entorno, comando y salida. Los datos son aportados por el usuario y **no** verifican ni ejecutan Rust.
- Respaldo Senior ampliado para las evidencias, con importaciones validadas y reemplazo del estado local. Se mantiene compatibilidad con respaldos v1 sin el campo opcional de evidencia.
- Corregido el límite incorrecto de seis incidentes al importar: ahora se admiten los 18.
- Nuevo indicador de preparación para revisión externa sin premiar notas autodeclaradas; cuenta las evidencias de tests, riesgos y arquitectura como documentación, no como aprobación.
- Pruebas de dominio adicionales para los 18 registros, estados inválidos, revisión, reportes y roundtrip de backup.
- Documentación de seguridad y alcance en `docs/senior/EVIDENCE_LEDGER.md`.
- Laboratorios S09/S12/S14 ampliados: replay idempotente con respuesta original y concurrencia, autorización de escritura, y percentiles con memoria acotada. Pruebas Rust incluidas pero no ejecutadas.

**Limitaciones:** no hay `package-lock.json`; el entorno actual no pudo instalar dependencias npm ni ejecutar Cargo. El build Preact y los 21 laboratorios Cargo no están verificados. Las lecciones completas, los 14 minijuegos y las traducciones educativas siguen incompletos.

---

# 🦀 RustPixel Academy v0.5.0 — Senior Mode: 18 incidentes y guías de laboratorio

**Estado de entrega: PARCIAL, NO APROBADO para producción**. Este repositorio conserva la SPA Preact, los 18 desafíos Senior, 18 crates, Code Review/Architecture Canvas y el progreso local de v0.4.0.

### Ampliación v0.5

- Los **18 módulos Senior** ahora incluyen un simulador de incidente propio de **tres etapas**, no solamente seis. Las 12 situaciones añadidas cubren ownership, crates, APIs, FFI, performance, consistencia, backpressure, fuzzing, despliegues, migraciones, code review y system design.
- El motor declara un caso mitigado únicamente cuando hay **al menos dos decisiones correctas y la remediación central correcta**. Se prueban rutas correctas, incorrectas, estados inválidos y revisión de importaciones.
- Se añadió `incidentReport()` para exportar el historial y su análisis como **reporte de simulación**, con aviso explícito de que no se ejecutó `cargo test`.
- Se incorporaron **18 guías de ingeniería diferentes**, con baseline, cambios, pruebas adversas, evidencias y comandos Cargo, conectadas a cada pantalla Senior desde `src/content/senior/field-guides.json`.
- **Demo autónoma nueva**: abre `senior-incident-arena.html` sin npm para recorrer 18 casos, guardar decisiones y exportar Markdown. Es independiente de Preact y no contiene todos los workspaces; para eso usa la SPA.
- Pruebas disponibles: `npm run senior:check` y `npm run senior:demo-check`. Ambos funcionan con Node y TypeScript global si está instalado; no prueban compilación Rust ni build Preact completo.

### Bloqueos reales que siguen abiertos

No hay `package-lock.json` reproducible ni se pudo completar la instalación npm en este entorno. No hay Rust/Cargo para compilar los 21 laboratorios, y el navegador Chromium no pudo completar una ejecución visual headless; por tanto **ni build Preact ni tests Cargo ni accesibilidad visual están aprobados**. Los 18 crates son ejercicios focalizados, no 18 servicios de producción; los 216 guiones del curso no son lecciones extensas completas, y los seis idiomas no tienen toda la traducción educativa.

Consulta `docs/senior/AUDIT_V05.md` para evidencia y límites específicos.

---

# 🦀 RustPixel Academy v0.4.0 — Senior Workspaces y seis incidentes

Academia de Rust pixel art: Preact + TypeScript + Vite, 54 módulos estructurados (12/12/12/18), 8 rutas del ecosistema, 14 modalidades de juego catalogadas, 6 idiomas en UI, progreso local y 21 laboratorios Cargo en el repositorio (18 Senior y 3 de niveles previos).

> **Estado real: entrega parcial y verificable por componentes.** 54 temarios y 216 guiones breves estructurados, no 216 lecciones completas; 2 actividades interactivas iniciales (Quiz Battle y Ownership Puzzle), no 14 mecánicas finalizadas. Senior Mode ahora dispone de 18 experiencias interactivas con decisiones contextualizadas, artefactos de revisión, borradores, entregas, autoevaluación por rúbrica y revisiones; los laboratorios de producción verificables y la evaluación automática de Rust siguen pendientes. No se incluye compilador Rust en el navegador. Hay 21 laboratorios Cargo en el repositorio (18 Senior y 3 de niveles previos). S07 usa Tokio real desde esta versión, pendiente de compilar con toolchain Rust; no es todavía un servicio de producción. El texto de lecciones aún está en español: seis idiomas son para navegación/UI.

## Senior Mode v0.4: funciones nuevas en la SPA Preact

- **Code Review por línea** en S03/S04/S07/S12/S17: seleccionar línea, severidad, describir riesgo y corrección, guardar y exportar JSON; el artefacto fuente es un fixture educativo.
- **Architecture Canvas y ADR** en S02/S09/S11/S15/S18: definir componentes y relaciones, documentar contexto, decisiones, alternativas, consecuencias, pruebas; validar la forma y exportar Markdown. No representa despliegue real.
- **Seis incidentes ramificados** en S04 (unsafe), S06 (deadlocks), S07 (Tokio), S09 (idempotencia), S12 (IDOR) y S14 (observabilidad), con estados, decisiones, feedback y guardado local.
- **Respaldo integral Senior**: exportar/importar intentos, revisiones, ADR y simulaciones en JSON validado. Respalda antes de importar porque la operación reemplaza datos locales Senior.
- **Pruebas de dominio adicionales**: `npm run senior:check` comprueba los 18 desafíos, seis incidentes, los dos workspaces y la validez del respaldo.
- **Guías normativas y pruebas**: `docs/senior/EVIDENCE-AND-RELEASE-GATES.md` y `docs/senior/18-LAB-ACCEPTANCE-PLANS.md`.

**Importante:** Estas funciones nuevas solo están conectadas a la SPA Preact. `demo.html`, `senior-demo.html` e `incident-demo.html` son vistas autónomas de versiones anteriores y NO incluyen el nuevo Code Review/Canvas, ni son la build de la SPA. El catálogo sigue en desarrollo y el estado final no es aprobado para producción.

## Abrir sin instalar dependencias

Abre `demo.html` directamente desde tu explorador de archivos. Esta **demo autónoma HTML/JS** ofrece navegación, dashboard, Senior Mode, 54 módulos, Quiz Battle, Ownership Puzzle, tema, progreso y exportación/importación, pero **no utiliza Preact ni un compilador Rust**. Es una previsualización práctica autónoma separada de la app Preact.

## Demo Senior independiente (sin npm)

Abre `senior-demo.html` desde la carpeta del proyecto: 18 desafíos con escenarios, decisiones técnicas, notas, evidencia, autoevaluación y guardado local; se basa en los mismos escenarios del motor Preact, pero es una **demo HTML separada**, no una compilación de la SPA. La interfaz usa assets locales de `public/assets/`. La demo original incluye enlace a esta vista.

## Desarrollo Preact (requiere conexión para dependencias)

```bash
npm install
npm run content:check
npm run senior:check
npm run typecheck
npm test
npm run build
npm run dev
```

Abrir `http://localhost:5173`. Se usan paquetes npm declarados en package.json; **no se incluye node_modules ni lockfile validado**. Los workflows iniciales usan npm install. Para una release estricta, generar y versionar `package-lock.json`, cambiar CI a `npm ci` y fijar las Actions por SHA.

## Laboratorios Rust reales

Instala Rust mediante https://rustup.rs/ y ejecuta `cargo test` desde cualquiera de las carpetas en `rust-labs/`. Hay un laboratorio por cada uno de los 18 módulos Senior, con alcance de ejercicios autocontenidos (no servicios de producción completos). La app abre Rust Playground externo para compilar fragmentos de código, sujeto a sus políticas; no compila Rust arbitrario en GitHub Pages.

## GitHub Pages

`vite.config.ts` usa `base: '/rustpixel-academy/'` cuando `GITHUB_PAGES=true`; adapta esta ruta si el repositorio tiene otro nombre. Publicar mediante `.github/workflows/deploy.yml`, configurar Pages → GitHub Actions. Los encabezados HTTP no se pueden controlar como en un servidor propio.

## Estructura y auditoría

- `src/app/`: app shell, rutas, vistas principales.
- `src/features/`: lógica de ejercicios, runtime y Senior.
- `src/content/`: curso, ecosistema y juegos.
- `src/i18n/`: traducciones UI de seis idiomas.
- `public/assets/`: sprites originales y fondos pixel art locales.
- `rust-labs/`: paquetes Rust sin dependencias externas.
- `.agents/skills/`: skills elegidas de Vigilio y políticas RustPixel.
- `.github/workflows/`: CI frontend, labs, seguridad y deploy.
- `docs/`: arquitectura, diseño, edición, decisiones y DevSecOps.
- `AUDIT_REPORT.md`: evidencia, hallazgos y límites de validación.

El proyecto no está afiliado oficialmente con Rust Foundation. El código generado en este repositorio se distribuye bajo MIT; revisar la política de marcas de Rust antes de utilizar logotipos en marketing.

## Histórico: Senior Mode v0.2 — documentación y límites

- `src/features/senior/pages/SeniorExperience.tsx`: dashboard y editor de entregas de los 18 casos.
- `src/features/senior/engine/attempts.ts`: máquina de estados de intentos, almacenamiento validado, rúbricas y revisiones.
- `src/features/senior/engine/scenarios.ts`: 18 decisiones técnicas y líneas de tiempo.
- `src/features/senior/engine/artifacts.ts`: 18 fixtures reales como contenido didáctico, **no ejecutados**.
- `docs/senior/modules/`: 18 fichas con evidencias, criterios de aceptación y referencias.
- `npm run senior:check`: compila estrictamente los módulos de dominio y prueba los 18 casos (Node + TypeScript).
- Las rutas `#/senior` y `#/challenge/S07-C01` permiten recorrer la implementación Preact cuando npm esté instalado.
- Los intentos Senior se guardan en `rustpixel:senior:v2`, separado del progreso general; pueden exportarse/importarse desde el dashboard Senior. La rúbrica es **autoevaluación**, no certificación ni tests Cargo.

**Pendientes de release:** la app Preact completa sigue sin un build verificado en este entorno, no hay cargo instalado para comprobar S07 y existen 18 laboratorios Senior, pero su compilación y calidad aún no se han validado con toolchain Rust. Los 18 módulos tienen experiencias guiadas, **no** 18 proyectos Rust implementados.

Auditoría específica: `SENIOR_AUDIT.md`. Cada escenario tiene guía en `docs/senior/modules/` y mapeo de skills en `docs/senior/VIGILIO_ALIGNMENT.md`.

## Histórico: Senior Mode v0.3 — incidentes interactivos y 18 laboratorios

- `src/features/senior/engine/incident.ts`: simulador determinista de tres etapas para S07/S12/S14; escenarios en `src/content/senior/incidents.json`.
- `src/features/senior/pages/SeniorExperience.tsx`: incidente integrado en desafíos S07, S12 y S14 con guardado local y etiquetas explícitas de simulación.
- `incident-demo.html`: versión autónoma del simulador sin npm, con validación de la forma del progreso guardado.
- `rust-labs/senior/`: 18 crates distintos, cada uno incluye objetivo, una implementación focalizada y tests de comportamiento; **no equivalen a 18 capstones de producción**.
- `npm run senior:labs-check`: comprueba estructura y presencia de tests, **NO compila Rust**.
- `npm run vigilio:check`: valida que las referencias canónicas directas de las skills Vigilio empaquetadas estén presentes.
- `npm run senior:check`: ahora valida también rutas válidas/inválidas y cierres de los tres simuladores de incidentes.

**Limitaciones de release:** `cargo`, `rustfmt` y `clippy` deben ejecutarse en una máquina con toolchain, igual que el build/E2E de Preact con dependencias npm; el proyecto no posee lockfile reproducible todavía. No presentar los laboratorios como compilados o la autoevaluación como certificada.
