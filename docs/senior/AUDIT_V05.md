# RustPixel Academy — Auditoría Senior v0.5.0

**Decisión:** ENTREGA PARCIAL / NO APROBADA como producto completo o release de producción.

**Fecha:** 2026-11-09 (sesión de entrega). **Base:** v0.4.0, editada conservando sus archivos. **Normas consultadas:** `.agents/skills/vigilio/vigilio-auto-senior/SKILL.md`, `rust-native-testing/SKILL.md`, `rust-workspace-architecture/SKILL.md`, `web-mfe-build-feature/SKILL.md`, `ux-accessibility/SKILL.md` y referencias locales aplicables; skill `rust-senior-mode/SKILL.md` actualizada.

## Cambios funcionales realmente implementados

1. **18 incidentes** disponibles desde la SPA (antes seis): 12 casos nuevos únicos en `src/features/senior/engine/incident-extensions.ts` y seis conservados en `incident.ts`, cada uno con tres decisiones, indicadores, consecuencias y resultados.
2. **Cierre seguro de incidente**: exige acertar dos decisiones y la *remediación central* de la etapa 2; un diagnóstico acertado no compensa una remediación peligrosa. `parseIncidentRun` revalida estados persistidos bajo esta regla; estados antiguos incompatibles se reinician de forma segura.
3. **Reporte Markdown** del incidente desde `incidentReport()`, disponible también en la pantalla Preact; contiene avisos de simulación y pruebas externas pendientes, no inventa comandos ejecutados.
4. **Guías de ingeniería de S01–S18** en `src/content/senior/field-guides.json`, con baseline, cambio, caso adverso, evidencia y comandos orientativos Cargo; aparecen junto al artefacto del reto Preact.
5. **Demo HTML autónoma** `senior-incident-arena.html` con navegación accesible por teclado, selección de 18 casos, guardado local, reset, exportación y CSS responsive. No es el build Preact ni sustituye a Playwright.
6. **Tests** adicionales de correctitud/incorrectitud de incidentes y pruebas de la demo con DOM simulado, incluidas 54 elecciones de referencia, ruta fallida y borrado.

## Matriz de cobertura (estado en este entorno)

| ID | Requisito | Ruta principal | Método | Estado |
|---|---|---|---|---|
| S-01 | 18 desafíos y revisiones | `engine/attempts.ts` | `senior:check` | VERIFICADO dominio |
| S-02 | 18 incidentes distintos | `engine/incident*.ts` | `senior:check` | VERIFICADO dominio |
| S-03 | Remediación central y errores | `engine/incident.ts` | rutas positivas/negativas | VERIFICADO dominio |
| S-04 | Reporte simulación | `engine/incident.ts` | `incidentReport` en tests | VERIFICADO dominio |
| S-05 | 18 guías técnicas específicas | `field-guides.json` | validación de 18 IDs y campos | VERIFICADO estructura, contenido requiere revisión editorial |
| S-06 | Code Review y ADR | `engine/workspaces.ts` | `senior:check` | VERIFICADO dominio; UI NO VERIFICABLE |
| S-07 | Backup de intentos y 18 incidentes | `engine/backup.ts` | `senior:check` | VERIFICADO dominio; UI NO VERIFICABLE |
| S-08 | Demo autónoma 18 casos | `senior-incident-arena.html` | Node VM/DOM simulado y `node --check` | VERIFICADO lógica; UI visual NO VERIFICABLE |
| S-09 | 18 crates Senior | `rust-labs/senior/` | `senior:labs-check` | VERIFICADO estructura, no compilación |
| S-10 | Normas Vigilio locales | `.agents/skills/vigilio/` | `vigilio:check` | VERIFICADO enlaces |
| S-11 | Contenido completo 216 lecciones | `src/content/course.json` | conteos y revisión | INCOMPLETO: guiones preliminares |
| S-12 | 14 minijuegos funcionales | `src/features/games/` | revisión | INCOMPLETO: prototipos iniciales |
| S-13 | 18 labs de producción integrales | `rust-labs/senior/` | revisión de código y tests | INCOMPLETO: ejercicios focalizados |
| S-14 | Compilación Rust de soluciones de alumno | `features/rust-runtime/` | revisión de integración | INCOMPLETO: no hay compilador local seguro |
| S-15 | Traducción educativa completa seis idiomas | `src/i18n/` | revisión | INCOMPLETO: traducciones UI parciales |
| S-16 | Instalación/npm ci/build Preact | `package.json`/CI | `npm run typecheck` | NO VERIFICABLE: faltan dependencias/lockfile; TS2688 |
| S-17 | cargo fmt/check/clippy/test 21 crates | `rust-labs/`/CI | preflight | NO VERIFICABLE: sin cargo/rustc |
| S-18 | E2E WCAG/responsive real | `tests/`/Playwright | Chromium headless intento sin completar | NO VERIFICABLE |
| S-19 | Release reproducible DevSecOps | `.github/workflows/` | `release:preflight` | INCOMPLETO: lockfile ausente y gates bloqueados |
| S-20 | Integridad del ZIP final | `CHECKSUMS.sha256` y ZIP | CRC, extracción, hashes y pruebas extraído | Comprobar en empaquetado final |

## Comandos observados

- `npm run senior:check` → PASS: 18 desafíos; 18 incidentes con ramas negativas; 18 revisiones y canvas; backup.
- `npm run senior:demo-check` → PASS: VM/DOM simulado de demo HTML, 18 casos, 54 decisiones, fallo de remediación, reset y borrado.
- `npm run content:check` → PASS **estructural**: 54 módulos, 216 guiones, ocho rutas, 14 juegos catalogados.
- `npm run senior:labs-check` → PASS **estructural**: 18 crates con fuente/test; no ejecución Cargo.
- `npm run vigilio:check` → PASS: 109 referencias normativas locales.
- `npm run security:scan` → PASS heurístico; no es SAST/SCA completo.
- `node --check` sobre el JS inline de la nueva demo → PASS.
- `typescript.transpileModule` del TSX Senior → sin errores de sintaxis; **no equivale a typecheck Preact**.
- `npm run typecheck` → FAIL TS2688 por falta de dependencias `vite/client`.
- `npm run release:preflight` → BLOCKED: lockfile npm, node_modules, cargo y Playwright.
- Chromium CLI headless → TIMEOUT; no declarar screenshot/UI PASS.
- `cargo`/`rustc` → NO DISPONIBLES, no se ejecutaron pruebas nativas.

## Riesgos que impiden release final

**P1:** ausencia de validación Rust ejecutada, build Preact reproducible, E2E de UI y evaluación real del código del alumno. El progreso Senior es local y sus rúbricas se autodeclaran; los reportes de incidentes reflejan decisiones simuladas, no métricas de producción ni cumplimiento de SLO. **P2:** contenido extenso, juegos, seis idiomas y seguridad de supply chain más avanzada pendientes.

## Uso

1. Abrir `senior-incident-arena.html` desde el ZIP extraído para los **18 incidentes** sin npm.
2. Ejecutar `npm run senior:check && npm run senior:demo-check && npm run content:check` en la raíz con Node y `tsc` disponibles.
3. Para workspaces de Code Review y Architecture Canvas utilizar Preact (`npm install`, `npm run dev`) en un equipo con red, tras generar lockfile; **no se ha verificado en este entorno**.
4. Instalar Rust estable y ejecutar Cargo individualmente en cada `rust-labs/senior/sXX-*` para verificar tests reales, investigando cualquier fallo antes de publicar.
