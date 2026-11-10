# Pendientes reales de RustPixel Senior Mode v0.4.0

**No aprobado para una release de producción:** la nueva cobertura de dominio no equivale a compilación Rust ni a validación de UI E2E.

## P1 — Bloqueantes

1. Resolver dependencias npm y generar `package-lock.json` real, versionado y revisado. Ejecutar `npm ci`, `npm run typecheck`, `npm test`, `npm run build` y Playwright en entornos limpios.
2. Instalar Rust y ejecutar `cargo fmt --all -- --check`, `cargo check --all-targets`, `cargo clippy --all-targets -- -D warnings` y `cargo test` para 21 crates, documentando fallos y correcciones. Añadir Cargo.lock cuando aplique a las dependencias y ejecutar `--locked`.
3. Probar responsive, teclado, lector de pantalla y accesibilidad WCAG en navegador real; verificar guardado, exportación, restauración y fallo de cuota localStorage.
4. Convertir los 18 laboratorios Senior focalizados en proyectos y ejercicios profesionales verificables, con soluciones separadas, tests negativos, fixtures, casos adversarios y mediciones reproducibles.
5. Implementar un canal verificable para compilar y probar código del alumno bajo una toolchain Rust (externa o local), sin fingir `cargo test` en GitHub Pages. Definir confianza/proveniencia de evidencias antes de conceder competencias.

## P2 — Calidad y profundidad

6. Code Review workspace: integrar comentarios sobre diffs de varios archivos, discusión por revisión y documentación de recomendaciones ligadas a pruebas; la versión actual comenta líneas de un fixture.
7. Architecture Canvas: incorporar drag-and-drop accesible, contratos entre componentes y persistencia de relaciones en un modelo gráfico más rico. El canvas actual es declarativo (nodos/edges) y exporta ADR.
8. Añadir incidentes adicionales a los seis actuales para cubrir módulos Senior S01–S18, con escenarios más profundos y datos causales más variados.
9. Revisar y ampliar toda la didáctica de los 54 módulos y 216 guiones, incluyendo seis idiomas a nivel de lección y rúbrica, 12 juegos todavía no implementados y las ocho especializaciones.
10. Pruebas de supply chain: SCA, fijación SHA de GitHub Actions, lockfiles, revisión de dependencias, SAST y evidencias de release.
11. Benchmarks reales S08/S14 con baseline controlada, hipótesis y resultados reproducibles.

## Qué sí se verifica ahora

- Motor de dominio en Node/TypeScript estricto: 18 desafíos, seis incidentes, validación de Code Review, arquitectura/ADR, exportación/importación de backup; ejecutar `npm run senior:check`.
- Estructura de 18 crates Senior: `npm run senior:labs-check` — NO compila Rust.
- Catálogo: `npm run content:check` — valida forma y conteos, no calidad editorial.

Todos los resultados de la UI Preact y los crates que no se ejecutaron son `BLOCKED` o `NOT_RUN`, nunca `PASS`.
