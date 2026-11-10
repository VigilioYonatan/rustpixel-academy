---
name: rust-senior-mode
version: 0.5.0
description: 18 desafíos Senior con intentos, artefactos, code review, diseño de sistemas, incidentes, rúbricas y verificación de evidencia sin simular Rust.
---

# Rust Senior Mode — flujo profesional verificable

## Alcance y propiedad

- La feature Preact `src/features/senior/` es la dueña de UI, intentos, escenarios, simuladores, workspaces y persistencia.
- `src/content/senior/` contiene los casos de estudio; `rust-labs/senior/` tiene los paquetes Cargo independientes.
- No duplicar en TSX las lecciones, ni mezclar motores con componentes visuales.
- Conservar claves de datos versionadas: `rustpixel:senior:v2`, `rustpixel:review:v1:*`, `rustpixel:architecture:v1:*`, `rustpixel:incident:v1:*`.

## Obligaciones de dominio

1. Mantener IDs S01–S18 y un desafío principal por módulo.
2. Exigir contexto, decisión y evidencias previstas antes de entregar un intento; guardar revisiones antiguas, no borrar evaluaciones sin confirmación.
3. Separar la rúbrica autodeclarada de las verificaciones Cargo externas; no otorgar certificación por un click.
4. Code Review: comentarios asociados a líneas de fixtures, severidad, acción concreta, validación de inputs, exportación y persistencia local.
5. Architecture Canvas: nodos, relaciones, contexto, alternativas, consecuencias, rollback y verificación; exportación ADR; validar la estructura sin afirmar que el sistema funciona.
6. Incident Simulator: 18 escenarios de tres etapas con estado validado y persistencia; la remediación central correcta y al menos dos decisiones alineadas son necesarias para cerrar como mitigado; exportar informes didácticos sin fingir evidencia Cargo.
7. Backups: validar importación, tamaños, IDs, límites, fallos de storage y rollback best-effort; informar cuando localStorage no pueda persistir.
8. Código Rust real: casos de error y tests adversarios; seguridad de ownership, lifetimes, cancelación, backpressure, idempotencia, FFI y unsafe; no afirmar soundness por compilar.

## Normas Vigilio aplicables

- `../vigilio/.vigilio-docs/stacks/rust/core/ownership-borrowing-lifetimes.md`
- `../vigilio/.vigilio-docs/stacks/rust/core/async-concurrency-cancellation.md`
- `../vigilio/.vigilio-docs/stacks/rust/testing/rust-testing-and-quality-gates.md`
- `../vigilio/.vigilio-docs/standards/experience/README.md`
- `../vigilio/web-mfe-build-feature/SKILL.md`
- `../vigilio/rust-native-testing/SKILL.md`

## Gate operativo

- `npm run senior:check` — pruebas de dominio de intentos, 18 desafíos, incidentes, review, canvas, backup.
- `npm run senior:demo-check` — test de la demo autónoma: 18 casos, 54 decisiones, fallos, reinicio y limpieza.
- `npm run content:check` — esquema de curso y desafíos; NO calidad editorial.
- `npm run senior:labs-check` — presencia estructural, NO compilación.
- `npm run typecheck && npm test && npm run build` — requiere dependencias npm y lockfile.
- En cada crate Cargo: `cargo fmt --all -- --check`, `cargo check --all-targets`, `cargo clippy --all-targets -- -D warnings`, `cargo test`; `--locked` cuando exista Cargo.lock.
- Playwright y teclado/lector de pantalla en navegador disponible; si no hay navegador, BLOCKED.
- Registrar evidencia real en `SENIOR_AUDIT.md` y `docs/senior/EVIDENCE-AND-RELEASE-GATES.md`; jamás llamar PASS a un test no corrido.

## Límites del producto

GitHub Pages es hosting estático, no compila Cargo arbitrario dentro del navegador. Rust Playground externo es un servicio de terceros; los fixtures y los simuladores no equivalen a pruebas del compilador. No afirmar 18 proyectos completos de producción ni seis traducciones editoriales íntegras hasta disponer de pruebas.
