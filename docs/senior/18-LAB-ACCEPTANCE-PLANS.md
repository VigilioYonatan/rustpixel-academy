# 18 laboratorios Senior — criterios específicos de aceptación

La prueba estructural que comprueba la presencia de 18 crates **no** acredita compilación, soundness, rendimiento ni preparación para producción. Estos casos se diseñaron para que un ingeniero pueda ejecutar controles y ampliar su cobertura antes de dar por aprobado cada módulo.

| Módulo / laboratorio | Defecto o riesgo que se debe demostrar | Test adversario requerido para aprobación |
|---|---|---|
| S01 `s01-idiomatic-ownership` | Copias de cadenas y vistas prestadas | Casos vacíos y UTF-8; medir asignaciones antes/después bajo misma carga |
| S02 `s02-crate-architecture` | Frontera de dominio mezclada con adaptadores | Asegurar que los contratos no dependen de infraestructura; probar una implementación alternativa |
| S03 `s03-api-contracts` | Errores públicos demasiado opacos | Casos de entrada inválida y compatibilidad de contratos; no generar panic inesperado |
| S04 `s04-unsafe-invariants` | UB y precondiciones de punteros | Bordes, overflow y revisión manual de invariantes; Miri cuando sea compatible |
| S05 `s05-ffi-ownership` | Doble liberación, null y propiedad de punteros FFI | Ciclos válidos de asignar/liberar, null, ABI compatible y ausencia de double free |
| S06 `s06-lock-order` | Bloqueo circular / orden de adquisición | Interleavings de transferencias, overflow y balance; probar estrés con contención |
| S07 `s07-tokio-cancellation` | Tareas huérfanas, colas sin límite | Shutdown con trabajos pendientes, deadline, doble cierre y JoinHandle consumido |
| S08 `s08-benchmark-baseline` | Comparación sin baseline ni carga equivalente | Dataset fijo y comparación de velocidad/asignaciones; no aprobar con tiempos ficticios |
| S09 `s09-idempotency` | Replay duplica efectos o marca evento antes del commit | Misma clave repetida, overflow, concurrencia y fallo de persistencia entre operaciones |
| S10 `s10-inventory-consistency` | Dos compradores reclaman última unidad | Contención concurrente, stock cero, restock y no-negatividad |
| S11 `s11-backpressure` | Cola infinita y OOM | Capacidad cero, saturación, cierre, productor rechazado y consumidor bloqueado |
| S12 `s12-resource-authorization` | IDOR / acceso entre cuentas | Dueño, no dueño, recurso ausente y caché particionada por tenant |
| S13 `s13-property-testing` | Parser solo probado en happy path | Roundtrip, entradas malformadas, límites de longitud y fuzzing seguro |
| S14 `s14-observability` | Métrica aislada sin contexto causal | Ventanas vacías, error-rate, correlación de p99/DB y plan de rollback |
| S15 `s15-expand-contract` | Migración no compatible hacia atrás | Clientes antiguos/nuevos coexistiendo y rollback antes de eliminar campos |
| S16 `s16-contract-migration` | Cambio de contrato rompe clientes | Golden tests, errores de parser y compatibilidad de versiones |
| S17 `s17-code-review-gates` | Release aprobada por evidencias incompletas | Gates individuales en fallo, todos aprobados y resultados no ejecutados |
| S18 `s18-system-design` | Capacidad elegida sin premisas ni SLO | División/overflow, carga pico, presupuesto de memoria, dependencia y coste |

## Procedimiento reproducible (a ejecutar por cada crate)

```bash
cargo --version
cargo fmt --all -- --check
cargo check --all-targets
cargo clippy --all-targets -- -D warnings
cargo test
```

**Bloqueo actual:** no hay Cargo ni rustc instalados aquí; estas instrucciones no se han ejecutado. Falta además ampliar los mini-laboratorios para incorporar fixtures de producción, tests de integración y benchmarks medidos. La matriz indica el criterio que falta, no certifica que ya esté cubierto.
