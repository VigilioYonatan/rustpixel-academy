> **ACTUALIZACIÓN v0.7.0 (2026-11-10):** para la matriz y pruebas más recientes, consultar [`docs/senior/AUDIT_V07.md`](docs/senior/AUDIT_V07.md). Este documento conserva el historial de auditorías anteriores; no interpretar sus cifras antiguas como estado actual. La release sigue PARCIAL / NO APROBADA para producción.

---

# Actualización v0.5.0

La nueva auditoría específica y su matriz completa están en [`docs/senior/AUDIT_V05.md`](docs/senior/AUDIT_V05.md). **18 incidentes** tienen interacción y pruebas de dominio; permanecen bloqueados Cargo, build Preact, E2E y calidad editorial integral. **No aprobado para producción.**

---

# Auditoría Senior Mode — RustPixel Academy v0.4.0

**ESTADO DE LA RELEASE: NO APROBADO / ENTREGA PARCIAL FUNCIONAL EN DOMINIO.**

Se conserva la arquitectura original, 18 desafíos, 18 crates Senior, seis idiomas UI y recursos locales. Se incorporan workspaces reales de Code Review y Architecture Canvas y se amplían los incidentes, sin fingir compilación Rust ni acreditación profesional.

## Trazabilidad de requisitos y evidencia

| ID | Requisito | Archivos | Validación observada | Estado |
|---|---|---|---|---|
| S-01 | 18 desafíos | `src/content/senior/challenges.json`, `engine/scenarios.ts` | `npm run senior:check` PASS | VERIFICADO dominio |
| S-02 | Intentos y revisiones | `engine/attempts.ts` | tests negativos/transiciones PASS | VERIFICADO dominio |
| S-03 | Rúbrica transparente | `model/senior.types.ts`, `engine/attempts.ts` | ponderación/autoevaluación PASS | VERIFICADO dominio, no acreditación |
| S-04 | Code Review por línea | `engine/workspaces.ts`, `pages/SeniorWorkspaces.tsx` | 18 tests de entradas y estructura PASS; TSX parse PASS | VERIFICADO dominio / UI NO VERIFICABLE |
| S-05 | Architecture Canvas y ADR | `engine/workspaces.ts`, `pages/SeniorWorkspaces.tsx` | grafo, duplicados, export ADR PASS | VERIFICADO dominio / UI NO VERIFICABLE |
| S-06 | Seis incidentes | `engine/incident.ts`, `pages/SeniorExperience.tsx` | seis escenarios, ramas correctas/fallidas PASS | VERIFICADO dominio / UI NO VERIFICABLE |
| S-07 | Persistencia y backup integral | `engine/backup.ts`, `engine/attempts.ts` | export/parse/import, rechazo corruptos y cleanup PASS | VERIFICADO dominio / storage en navegador NO VERIFICABLE |
| S-08 | 18 crates Senior | `rust-labs/senior/*` | `senior:labs-check` PASS estructural | VERIFICADO estructura; Cargo NO VERIFICABLE |
| S-09 | Guías y normativa Vigilio | `.agents/skills/vigilio/`, `docs/senior/` | `vigilio:check` PASS (109 enlaces) | VERIFICADO enlaces |
| S-10 | 54 módulos y 216 unidades | `src/content/course.json` | `content:check` PASS conteos | VERIFICADO forma, contenido editorial INCOMPLETO |
| S-11 | Typecheck/build Preact | `src/`, `package.json` | `npm run typecheck` FAIL TS2688, faltan dependencias npm | BLOQUEADO |
| S-12 | Cargo real + Clippy | `rust-labs/` | no está instalada la toolchain | NO VERIFICABLE |
| S-13 | UX móvil/tablet/desktop | `src/styles/global.css` | CSS responsive y parse TSX; sin Chromium | NO VERIFICABLE E2E |
| S-14 | Supply chain reproducible | workflows / manifests | falta lockfile npm, Actions por tags | INCOMPLETO P1/P2 |
| S-15 | Evaluación Rust real del alumno | `rust-runtime`/`senior` | ausencia de compilador propio confiable | INCOMPLETO P1 |
| S-16 | 18 casos profesionales de producción integrales | `rust-labs/senior/` | mini-laboratorios focalizados, no capstones | INCOMPLETO P1 |
| S-17 | Contenido Senior en seis idiomas | `src/i18n/`, `src/content/` | UI traducida parcialmente; editoriales no | INCOMPLETO P2 |
| S-18 | Seguridad heurística | `scripts/security-scan.mjs` | `npm run security:scan` PASS | VERIFICADO heurística; no SAST/SCA |

## Implementación nueva

- `engine/workspaces.ts`: contrato y validación rigurosa de comentarios por línea, límites, severidad, nodos, aristas y ADR; evita duplicados y relaciones colgantes.
- `pages/SeniorWorkspaces.tsx`: interfaz accesible por teclado para revisión de líneas y modelado de componentes, estados persistidos y avisos de error; Code Review visible en S03/S04/S07/S12/S17, arquitectura en S02/S09/S11/S15/S18.
- `engine/incident.ts`: S04 unsafe, S06 deadlocks y S09 idempotencia añadidos a S07 Tokio, S12 IDOR y S14 observabilidad.
- `engine/backup.ts`: respaldo conjunto versionado de intentos/reviews/canvas/incidentes, saneamiento de importación, limpieza del estado anterior y rollback best-effort si falla almacenamiento.
- `scripts/test-senior-domain.cjs`: pruebas para 18 desafíos, seis incidentes, review/canvas y backup.
- `src/styles/global.css`: layouts adaptativos y foco para workspaces.
- `docs/senior/18-LAB-ACCEPTANCE-PLANS.md`, `EVIDENCE-AND-RELEASE-GATES.md`: criterios por módulo y proveniencia.

## Pruebas ejecutadas realmente en esta iteración

- `npm run senior:check`: **PASS** (cuatro grupos: 18 desafíos, seis incidentes, 18 workspaces de cada tipo, backup).
- `npm run senior:labs-check`: **PASS estructural** (18 crates; **NO** ejecución Cargo).
- `npm run content:check`: **PASS estructural** (54, 216, 18, 8, 14).
- `npm run vigilio:check`: **PASS** (109 referencias normativas).
- `npm run security:scan`: **PASS heurístico**.
- `tsc --strict --noEmit` de módulos de dominio independientes: **PASS**.
- Parse TSX por `typescript.transpileModule`: **PASS sintaxis** (NO es typecheck del producto).
- `npm run typecheck`: **FAIL** TS2688 `vite/client` no resuelto porque no están instaladas las dependencias.
- `npm run release:preflight`: **BLOCKED** por lockfile, dependencias, Cargo y Chromium.
- Cargo fmt/check/clippy/test: **NOT_RUN / BLOCKED**.
- E2E responsive y accesibilidad: **NOT_RUN / BLOCKED**.

## Riesgos P1 pendientes

1. Falta de resolución de dependencias y lockfile/npm ci; build frontend no verificado.
2. Cargo no disponible: no se garantiza que los 18 crates compilen o que tests nativos pasen.
3. No hay ejecución confiable del código Rust del alumno ni validación de competencias mediante artefactos firmados.
4. Los mini-laboratorios no equivalen a 18 proyectos productivos integrales.
5. No hay QA de navegador real para importación, navegación, responsive y WCAG.

**La puntuación local sigue siendo AUTOEVALUACIÓN; el Code Review y el Canvas son productos de aprendizaje, no servicios de producción.** La integridad del ZIP se audita por separado después de empaquetar.
