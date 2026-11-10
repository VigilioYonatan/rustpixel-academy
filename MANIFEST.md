# RustPixel Academy — Entrega v0.7.0

## Archivos principales

- `README.md`: puesta en marcha, capacidades y limitaciones comprobadas.
- `src/features/senior/engine/`: desafíos, incidentes, workspaces, evidencias, readiness y 90 acceptance gates.
- `src/features/senior/pages/`: integración Preact, SeniorExperience, SeniorWorkspaces, EvidenceWorkspace y AcceptancePanel.
- `src/content/senior/`: casos, guías, timeline y fixtures.
- `rust-labs/senior/`: 18 proyectos Cargo con formato `cargo fmt` verificado y 20/21 `cargo check`/`clippy` PASS.
- `docs/senior/EVIDENCE_LEDGER.md`: contrato de trazabilidad y privacidad de logs.
- `docs/senior/AUDIT_V07.md`: auditoría zero omissions v0.7.0, matriz de 90 gates, comprobaciones y bloqueos.
- `scripts/verify-senior.cjs`: compilación estricta del dominio y validación de 8 grupos de tests.
- `scripts/senior-cargo-runner.mjs`: runner unificado para auditoría Cargo local (`npm run senior:cargo`).
- `.github/workflows/`: DevSecOps, tests y publicación, no ejecutados en GitHub en esta sesión.
- `public/assets/`: assets locales pixelados y mascota.
- `demo.html`, `senior-demo.html`, `senior-incident-arena.html`: demos autónomas HTML para navegación local.

## Límites

El ZIP contiene código fuente y recursos; no incluye node_modules, dist, binarios Cargo ni compilador Rust. Sin lockfile npm, la reproducibilidad total permanece bloqueada. No está aprobado para producción.
