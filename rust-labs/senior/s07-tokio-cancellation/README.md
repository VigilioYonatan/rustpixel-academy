# S07 — Tokio: cancelación, backpressure y task ownership

**Laboratorio con Tokio real**, no con hilos estándar. Este ejemplo enseña un contrato de cierre cooperativo usando `watch`, cola acotada `mpsc`, `JoinHandle` y `timeout`.

```bash
cargo fmt --all -- --check
cargo check --all-targets
cargo clippy --all-targets -- -D warnings
cargo test
```

## Qué comprobar

- `Worker::start` crea una tarea con propietario explícito.
- `send` respeta la capacidad de cola (backpressure, no crecimiento ilimitado).
- `shutdown` solicita cancelación, espera el `JoinHandle` y usa `abort` solo si vence el deadline.
- Las pruebas permiten carreras legítimas entre trabajo pendiente y shutdown: **no** aseguran que la cancelación procese la cola completa.

## Extensión Senior

1. Define semántica de drenar trabajos vs cancelar inmediatamente; prueba ambas con barreras deterministas.
2. Documenta cómo garantizar persistencia de jobs aceptados antes del cierre.
3. Añade instrumentación de duración de shutdown, cola y tareas activas.
4. Integra un canal de acknowledgements y tests de saturación.

**Estado de verificación:** código incluido, pero esta entrega no afirma compilación exitosa sin ejecutar Cargo sobre el paquete final.
