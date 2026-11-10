# Migración compatible de contratos — s15-expand-contract

**Meta:** Acepta versiones anteriores manteniendo un modelo interno tipado.

## Procedimiento

1. Leer `src/lib.rs` y explicar los invariantes y los casos adversos.
2. Ejecutar `cargo fmt --all -- --check`, `cargo check --all-targets`, `cargo clippy --all-targets -- -D warnings`, `cargo test`.
3. Introducir un defecto intencionado y comprobar que falla una prueba. Restaurar el código.
4. Explicar qué aspectos del sistema de producción real **no** cubre este laboratorio autocontenido.

**Estado:** ejercicio de código real; compilación local y CI aún no constatadas en este entorno.
