> **ACTUALIZACIÓN v0.7.0 (2026-11-10):** para la matriz y pruebas más recientes, consultar [`docs/senior/AUDIT_V07.md`](docs/senior/AUDIT_V07.md). Incluye 90 criterios de aceptación Senior (5 por módulo S01–S18), panel en resultados, runner unificado `npm run senior:cargo`, ampliación de laboratorios S01/S11/S18 y resolución de errores de compilación y clippy. La release sigue PARCIAL / NO APROBADA para producción.

---

# Addendum de auditoría v0.4.0 (2026-11-09)

**Estado actualizado: NO APROBADO PARA PRODUCCIÓN / ENTREGA PARCIAL.** Este documento conserva la auditoría histórica anterior; para la v0.4 utilizar `SENIOR_AUDIT.md`, `MANIFEST.md` y `docs/senior/EVIDENCE-AND-RELEASE-GATES.md` como evidencia actual. La v0.4 añade Code Review, Architecture Canvas/ADR, seis incidentes y backup integral; las pruebas de dominio TypeScript pasan, pero build Preact, Cargo, Playwright y supply-chain reproducible siguen bloqueados. Las cifras históricas de archivos o simuladores debajo corresponden a la v0.3 y no deben interpretarse como actuales.

---

> **Histórico de v0.1/v0.2:** este informe no cubre los cambios v0.3. Consultar `SENIOR_AUDIT.md` para el estado más reciente.

# AUDITORÍA FINAL — RUSTPIXEL ACADEMY

**ESTADO: ENTREGA PARCIAL / NO VERIFICABLE**. No aprobado como producto completo: existen requisitos altos aún incompletos y compilaciones no verificadas.

**Requisitos identificados:** 28. **Verificados:** 10. **Incompletos:** 8. **No verificables:** 9. **No aplica:** 1. **Empaquetado verificado:** 2.

## Matriz requisito ↔ implementación ↔ prueba

| ID | Requisito | Prioridad | Archivos | Estado | Evidencia / límite |
|---|---|---|---|---|---|
| R-001 | SPA Preact + TypeScript + Vite | ALTO | `src/app/App.tsx; package.json; vite.config.ts` | NO VERIFICABLE | Dependencias no instalables en el entorno; typecheck/build no ejecutados |
| R-002 | Demo HTML navegable sin npm | ALTO | `demo.html` | NO VERIFICABLE | Sintaxis JavaScript correcta; render navegador bloqueado por política de entorno |
| R-003 | 54 módulos 12/12/12/18 | ALTO | `src/content/course.json` | VERIFICADO | npm run content:check: PASS |
| R-004 | Lecciones completas 4-8 por módulo | ALTO | `src/content/course.json` | INCOMPLETO | 216 esquemas breves; falta redacción editorial y pruebas educativas |
| R-005 | Senior Mode 18 módulos | ALTO | `src/app/App.tsx; src/content/course.json` | VERIFICADO | Manifest de 18 y vista implementada; no E2E |
| R-006 | Desafíos Senior integrados y medidos | ALTO | `src/features/senior/engine.ts` | INCOMPLETO | 18 escenarios guiados + rúbrica; faltan evaluadores y datos reproducibles de producción |
| R-007 | 8 rutas Ecosystem Academy | ALTO | `src/content/ecosystem/paths.json` | VERIFICADO | 8 rutas estructuradas; contenido extendido incompleto |
| R-008 | 8 cursos de ecosistema completos | ALTO | `src/content/ecosystem/paths.json` | INCOMPLETO | Solo 5 títulos por ruta |
| R-009 | 14 mecánicas implementadas | ALTO | `src/content/games/catalog.json; src/app/App.tsx` | INCOMPLETO | 14 catalogadas; 2 prototipos funcionales |
| R-010 | Quiz Battle y Ownership Puzzle | MEDIO | `src/app/App.tsx; demo.html` | NO VERIFICABLE | Implementación inspeccionada; Playwright bloqueado por administrador |
| R-011 | Editor Rust con CodeMirror 6 | ALTO | `src/app/App.tsx; package.json` | NO VERIFICABLE | Conectado en código, instalación y build no disponibles |
| R-012 | Compilación Rust general en navegador | ALTO | `src/features/rust-runtime/playground.ts` | NO APLICA | No se promete; Rust Playground externo documentado |
| R-013 | WASM ejecutable en el navegador | ALTO | `public/wasm/` | INCOMPLETO | No hay runtime WASM validado ni demos ejecutables |
| R-014 | Laboratorios Cargo para todos los módulos | ALTO | `rust-labs/` | INCOMPLETO | 6 laboratorios iniciales, no 54 + especializaciones |
| R-015 | 6 laboratorios Cargo iniciales | ALTO | `rust-labs/` | NO VERIFICABLE | Archivos fuente inspeccionados; rustc/cargo no disponible |
| R-016 | 6 idiomas de interfaz | MEDIO | `src/i18n/translations.ts; demo.html` | VERIFICADO | 6 diccionarios presentes; lingüística no revisada |
| R-017 | Contenido educativo traducido íntegramente | ALTO | `src/content/course.json` | INCOMPLETO | Los guiones siguen en español |
| R-018 | Light/dark, sprites y fondos pixel | ALTO | `src/design-system/; public/assets/` | VERIFICADO | 6 sprites+2 fondos PNG examinados por PIL; CSS temas presente |
| R-019 | Responsive y WCAG 2.2 AA comprobado | ALTO | `src/styles/global.css` | NO VERIFICABLE | Breakpoints presentes; navegador y auditoría manual no ejecutados |
| R-020 | Progreso local con export/import | ALTO | `src/shared/storage/progress.ts; demo.html` | NO VERIFICABLE | Lógica inspeccionada; falta prueba runtime navegador |
| R-021 | DevSecOps workflows y CI | ALTO | `.github/workflows/` | NO VERIFICABLE | 4 workflows presentes; CI real no corrido; lockfile no incluido |
| R-022 | Software supply chain hardened | ALTO | `.github/dependabot.yml; SECURITY.md` | INCOMPLETO | Falta lockfile y pin de Actions por SHA; CodeQL no corrido |
| R-023 | Skills Vigilio y RustPixel | MEDIO | `.agents/skills/` | VERIFICADO | 17 skills originales + 11 especializadas + auditoría |
| R-024 | Fuentes y assets locales | MEDIO | `public/assets/; docs/design/` | VERIFICADO | Assets PNG locales e ilustraciones de referencia; sin fuentes de terceros |
| R-025 | Publicación GitHub Pages verificada | ALTO | `.github/workflows/deploy.yml` | NO VERIFICABLE | Workflow presente; publicación requiere repo/config y ejecución |
| R-026 | ZIP íntegro y extraíble | ALTO | `ZIP` | VERIFICADO | CRC, inventario, extracción y controles desde copia extraída PASS |
| R-027 | Auditoría zero omissions | ALTO | `AUDIT_REPORT.md; MANIFEST.md; CHECKSUMS.sha256` | VERIFICADO | Matriz, manifiesto, checksums e inventario presentes; estado parcial declarado |
| R-028 | Ausencia de secretos en proyecto | ALTO | `scripts/security-scan.mjs` | VERIFICADO | Heuristic local scan PASS; no reemplaza Gitleaks |

## Validaciones locales (evidencia observada)

| Control | Resultado |
|---|---|
| `npm run content:check` | PASS: 54 modules, 216 lessons, 8 routes, 14 games |
| `npm run security:scan` | PASS: heurística, no SAST exhaustivo |
| `node --check (script demo.html)` | PASS: sintaxis JS |
| `Playwright Chromium, file://` | BLOCKED: ERR_BLOCKED_BY_ADMINISTRATOR |
| `Playwright Chromium, localhost HTTP` | BLOCKED: ERR_BLOCKED_BY_ADMINISTRATOR |
| `cargo test / cargo fmt / cargo clippy` | NOT_RUN: cargo no instalado |
| `npm run typecheck / build / test` | NOT_RUN: no hay dependencias npm; instalación de red sin respuesta |
| `GitHub Actions workflows` | NOT_RUN: GitHub CI no ejecutado |

## Integridad de imágenes

- Archivos de imagen abiertos y validados con PIL: **10**.
- Resultado: 10 / 10 válidos.

## Hallazgos altos pendientes (P1)

- Lecciones: 216 guiones iniciales, sin contenido editorial profundo ni pruebas por lección.
- Senior: 18 casos guiados con restricciones/evidencias, pero faltan implementaciones y evaluadores de producción.
- Solo dos actividades interactivas iniciales frente a 14 tipos solicitados.
- Solo seis laboratorios Rust iniciales; faltan los demás.
- Traducción educativa a seis idiomas incompleta; solo diccionarios UI.
- Runtime Rust general embebido en web no disponible; solo enlace externo.
- No se incluyen dependencias instaladas ni lockfile validado; el build Preact no está verificado.
- El deploy a GitHub Pages aún no está validado.
- Las GitHub Actions usan tags de versión y no commits SHA fijados.

## Correcciones realizadas

- Corregido el worker RustFlow para liberar el mutex inmediatamente después de recibir un trabajo, antes de calcular y enviar resultados. Falta revalidación con Cargo.
- El editor y las simulaciones declaran explícitamente que Rust se compila fuera de la web.
- README y documentos distinguen índice editorial de cursos completos; no se presentan los 54 como terminados.

## Exclusiones y por qué

- `node_modules`, `dist`, cachés y `target`: no existen en el entorno; son artefactos que deben reconstruirse.
- El ZIP Vigilio original completo no se reproduce; se copiaron los SKILL.md seleccionados, y el usuario conserva sus ZIP originales.
- No se incluyen fuentes de letra binarias; se usan fuentes del sistema, respetando licencias y compatibilidad.

## Uso

1. Abrir `demo.html` desde un navegador que permita archivos locales; los sprites son recursos relativos.
2. Para el proyecto Preact: instalar dependencias con `npm install`, luego `npm run dev`, `npm run typecheck`, `npm test`, `npm run build`.
3. Para laboratorios Rust: instalar toolchain Rust 2024 y ejecutar `cargo test` en cada crate.
4. Leer `docs/content/CONTENT-STATUS.md` y completar los puntos P1 antes de publicar como versión final.

## ZIP

- ZIP: `RustPixel-Academy-DevSecOps-v0.1.0.zip`.
- Comprobaciones previstas y ejecutadas al cerrar la entrega: integridad CRC, listado, extracción, presencia de manifiesto y scripts críticos, validación estructural desde la copia extraída.
- Estado empaquetado: **verificado en contenedor**, no equivalente a build o despliegue de la aplicación.
- `CHECKSUMS.sha256` registra hashes SHA-256 de todos los archivos internos excepto el propio checksums. No reemplaza firma o verificación de procedencia.
