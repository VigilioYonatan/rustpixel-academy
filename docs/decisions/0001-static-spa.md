# ADR 0001: academia estática sin compilador Rust propio

**Estado:** aceptado para MVP.

## Contexto
GitHub Pages publica contenido estático; compilar código Rust arbitrario requiere un compilador y sandbox adecuados. Las herramientas WASM precompiladas no equivalen a rustc general.

## Decisión
Ejercicios declarativos, enlaces a Rust Playground y proyectos Cargo descargables. No afirmar compilación local hasta pruebas específicas de seguridad/compatibilidad. `localStorage` sirve para progreso sin credenciales.

## Consecuencias
No todos los ejercicios pueden validarse automáticamente. Los casos que dependen de Cargo se ejecutan localmente; el feedback de simuladores es pedagógico, no evidencia de producción.
