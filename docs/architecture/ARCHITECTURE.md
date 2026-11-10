# Arquitectura

SPA Preact + Vite + TypeScript estricto, con hash router y datos de curso declarativos en JSON. El contenido se lee localmente; no hay cuentas, backend ni base de datos remota. `src/features` contiene lógica de dominio y los componentes principales viven en `src/app` durante este primer incremento; cuando existan dos consumidores se promoverán a diseño compartido según Vigilio. El contenido evita la necesidad de un TSX por lección.

## Decisiones
- `src/content/course.json` almacena los 54 módulos y 216 esquemas de lecciones. **No están redactadas 216 lecciones completas**: los objetos son objetivos editoriales preliminares y el frontend los etiqueta.
- 8 rutas del ecosistema y 14 juegos: el catálogo está íntegro, pero solo Quiz Battle y Ownership Puzzle tienen primera implementación interactiva; el resto señala editorial/guided.
- Runtime: Rust Playground abre un sitio externo; no se simula compilación local. Ejemplos WASM todavía no integrados.
- `rust-labs` contiene ejemplos reales con Cargo, seleccionados para prueba CI. No existe un laboratorio ejecutable por cada módulo.
- JSON en `localStorage` sin cuentas; respaldo descargable y validación al importar.
- GH Pages: ruta por hash; la base Vite depende del nombre del repositorio, debe configurarse antes del deploy.

## Reglas de evolución
1. Una feature es propietaria de sus reglas; no importes internals de otras features sin contrato público.
2. Integrar un ejecutor solo detrás de un adapter, con declaración de capacidades reales.
3. Los simuladores se etiquetan y no pueden producir métricas falsas etiquetadas como producción.
4. Los tests Rust reales no se confunden con la autoevaluación de una lección.
5. Los textos localizados mantienen IDs comunes.
