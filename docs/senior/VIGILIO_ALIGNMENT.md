# Senior Mode — alineación con Vigilio Docs

Referencia: ZIP aportados por el usuario `vigilio-docs(7).zip` y `skills(8).zip`, sin modificar el contenido original.

| Referencia | Aplicación concreta | Evidencia actual |
|---|---|---|
| `stacks/rust/core/ownership-borrowing-lifetimes.md` | S01, S03, S04: contratos de préstamos, lifetimes e invariantes | `engine/scenarios.ts`, `engine/artifacts.ts`, `docs/senior/modules/s01.md` |
| `stacks/rust/core/async-concurrency-cancellation.md` | S06, S07, S11: ownership de tareas, cancelación, join y límites | `rust-labs/senior/s07-tokio-cancellation/` |
| `stacks/rust/testing/rust-testing-and-quality-gates.md` | Cargo fmt/check/clippy/test, tests negativos por riesgo | `rust-labs/`, `.github/workflows/rust-labs-ci.yml`, fichas de módulos |
| `rust-native-build-feature` | Separar las demos del navegador de laboratorios Rust nativos | `src/features/senior/` vs `rust-labs/` |
| `rust-native-testing` | Declarar un resultado no comprobado si no hubo Cargo | `SENIOR_AUDIT.md` |
| `web-mfe-build-feature` | Feature encapsulada con páginas, motores y modelos | `src/features/senior/{pages,engine,model}` |
| `vigilio-auto-senior` | Revisión de requisitos, pruebas, riesgos y faltantes | `SENIOR_AUDIT.md` |

Principios: no afirmar que una respuesta textual ejecuta Rust; no equiparar autocalificación con tests; mantener contratos explícitos; evitar crates y abstracciones gratuitas; comprobar los flujos críticos.

## Deuda conocida

- No hay compilación real del frontend en esta ejecución por dependencias npm no instaladas.
- Rust/Cargo no están disponibles para validar S07 ni los otros laboratorios.
- Falta completar laboratorios ejecutables (crate y tests) para 15 de 18 módulos Senior.
- Falta validar usabilidad responsive y teclado con un navegador de pruebas.
- Los datos de incidentes son fixtures declarados y no telemetría real.
