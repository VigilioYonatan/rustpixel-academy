# Auditoría Senior v0.6.0 — Zero Omissions

**Estado: ENTREGA PARCIAL / NO APROBADO para producción.** Fecha: 2026-11-10.

## Fuente normativa

Se consultaron las guías Vigilio `stacks/rust/core/async-concurrency-cancellation.md`, `stacks/rust/core/memory-unsafe-and-ffi.md` y `stacks/rust/testing/rust-testing-and-quality-gates.md` del ZIP adjunto. Ninguna prueba Cargo se marca aprobada sin ejecución real.

## Matriz de requisitos (alcance de esta iteración y continuidad anterior)

| ID | Requisito | Prioridad | Implementación | Prueba | Estado |
|---|---|---|---|---|---|
| S-01 | 18 desafíos Senior con transiciones | Alta | `src/features/senior/engine/attempts.ts` | `npm run senior:check` | VERIFICADO dominio |
| S-02 | 18 simuladores de tres etapas | Alta | `engine/incident*.ts` | `npm run senior:check` | VERIFICADO dominio |
| S-03 | 18 laboratorios Cargo presentes | Alta | `rust-labs/senior/` | `npm run senior:labs-check` | VERIFICADO estructura; NO VERIFICABLE compilación |
| S-04 | Revisión por línea y canvas ADR | Alta | `engine/workspaces.ts` | `npm run senior:check` | VERIFICADO dominio |
| S-05 | Evidencia con procedencia y revisión | Alta | `engine/evidence.ts` | `npm run senior:check` | VERIFICADO dominio |
| S-06 | Bitácora integrada en UI Senior | Alta | `pages/EvidenceWorkspace.tsx` | Transpilación TSX | NO VERIFICABLE E2E |
| S-07 | Importación/exportación de evidencias | Alta | `engine/backup.ts` | `npm run senior:check` | VERIFICADO dominio |
| S-08 | Compatibilidad con respaldo anterior | Alta | `engine/backup.ts` | `npm run senior:check` | VERIFICADO dominio |
| S-09 | Respaldo de 18 incidentes | Alta | `engine/backup.ts` | `npm run senior:check` | VERIFICADO dominio |
| S-10 | Sin competencias ficticiamente certificadas | Bloqueante | `engine/readiness.ts` | `npm run senior:check` | VERIFICADO dominio |
| S-11 | CI de pruebas Cargo | Alta | `.github/workflows/rust-labs-ci.yml` | Revisión estática | NO VERIFICABLE GitHub runner |
| S-12 | Build Preact instalable | Bloqueante | `package.json`, Vite | `npm run build` no ejecutable sin deps | INCOMPLETO (sin lockfile) |
| S-13 | Laboratorios Cargo realmente compilados | Bloqueante | `rust-labs/` | `cargo test` no disponible | NO VERIFICABLE |
| S-14 | Pruebas de interfaz navegador | Alta | `tests/e2e/` | Chromium headless no completó | NO VERIFICABLE |
| S-15 | 216 lecciones largas redactadas | Alta | `src/content/` | Inspección editorial | INCOMPLETO |
| S-16 | 14 juegos funcionales | Alta | `src/features/games/` | Inspección | INCOMPLETO |
| S-17 | Seis idiomas para todo el contenido | Alta | `src/i18n/` | Inspección | INCOMPLETO |
| S-18 | Compilación arbitraria Rust en web | Alta | Rust Playground externo y WASM precargado | No existe compilador local | INCOMPLETO por diseño técnico |
| S-19 | Diseño responsivo y pixel art | Media | CSS y assets existentes | Sintaxis y assets; no E2E | NO VERIFICABLE visual |
| S-20 | Paquete ZIP válido | Bloqueante | ZIP de distribución | CRC, extracción y hashes | VERIFICADO en la última extracción |
| S-21 | Replay idempotente devuelve respuesta original | Alta | `rust-labs/senior/s09-idempotency/src/lib.rs` | Cargo test no disponible; pruebas incluidas | NO VERIFICABLE compilación |
| S-22 | Escrituras autorizadas y aislamiento por dueño | Alta | `rust-labs/senior/s12-resource-authorization/src/lib.rs` | Cargo test no disponible; pruebas incluidas | NO VERIFICABLE compilación |
| S-23 | Ventana acotada de latencia y percentiles | Alta | `rust-labs/senior/s14-observability/src/lib.rs` | Cargo test no disponible; pruebas incluidas | NO VERIFICABLE compilación |

## Resultado de las pruebas disponibles

- `npm run senior:check`: **PASS** (dominio estricto TypeScript; siete grupos de aserciones, incluidos 18 registros de evidencia).
- `npm run content:check`: **PASS** (54 módulos, 216 unidades estructuradas, 8 rutas, 14 juegos catalogados, 18 escenarios).
- `npm run senior:labs-check`: **PASS estructural**, NO sustituye a compilar con Cargo.
- `npm run vigilio:check`: **PASS** (109 referencias locales en esta copia).
- `npm run security:scan`: **PASS heurístico**. No garantiza ausencia de secretos.
- `npm run senior:demo-check`: **PASS** (demo autónoma v0.5, no prueba EvidenceWorkspace de Preact).
- Transpilación sintáctica de TSX: **PASS**; no constituye un build ni chequeo de tipos de Preact.
- `npm install --package-lock-only`: **BLOQUEADO** por falta de resolución de red en tiempo disponible.
- `cargo test` y `cargo clippy`: **NOT_RUN**, toolchain Rust no instalada.
- Chromium headless: **BLOQUEADO**, ejecución excedió el límite de control.

## Hallazgos conocidos

**P1:** los laboratorios S09, S12 y S14 fueron ampliados sin toolchain Rust para revalidar su compilación. No hay lockfile npm reproducible; no se puede certificar build Preact ni Cargo, y las lecciones/games/traducciones de academia completa siguen sin terminar. **P2:** falta una identidad autenticada para revisor externo y una integración de resultados Cargo firmados. No sustituir por `verified=true` local.

## Seguridad de la bitácora

Los logs de herramientas pueden contener datos sensibles. La UI advierte evitar tokens y PII; no se envían al servidor, pero permanecen sin cifrar en localStorage y en copias exportadas. Las entradas importadas se validan antes de escribir y el importador hace rollback best effort si el navegador falla.

## Criterio de salida

No aprobar la entrega final hasta completar dependencias, build, Cargo, E2E, contenido integral, idiomas y verificación de producción. El dominio adicional sí se comprobó con aserciones reproducibles y se reauditará dentro del ZIP extraído.
