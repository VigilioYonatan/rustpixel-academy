# Contrato de evidencia, seguridad y salida — RustPixel Senior Mode v0.4

## Qué significa cada etiqueta

- **Fixture:** código, logs, métricas o datos de ejercicio estáticos; no se ejecutaron.
- **Simulador:** el motor TypeScript calcula consecuencias conforme a reglas declaradas; no reproduce el runtime de Tokio, rustc o una DB real.
- **Decisión guiada:** una de tres alternativas pedagógicas; no demuestra automáticamente comprensión ni implementación.
- **Autoevaluación:** puntuación introducida por el estudiante; no es una acreditación ni una calificación con tests.
- **Revisión de código:** comentarios por línea guardados localmente, sin enlace a un PR y sin análisis estático real.
- **Architecture Canvas:** nodos y relaciones definidos por el estudiante; su chequeo solo valida estructura de documento, no topología desplegada.
- **ADR:** documento de decisiones propuesto, exportado como Markdown; no es un aprobado arquitectónico.
- **Cargo verificado:** requiere captura reproducible de comando, hash de fuente, versión de toolchain, exit code, entorno y logs; **no existe aún un verificador de ejecución confiable dentro de la web estática**.

## Flujo de entrega Senior

1. Abrir S01–S18; leer contexto, restricciones y artefactos técnicos.
2. Escoger decisión guiada y redactar diagnóstico, trade-offs y pruebas adversarias.
3. Si aplica, agregar comentarios sobre líneas concretas o diseñar componentes y exportar ADR.
4. Si aplica, recorrer incidente de 3 decisiones, ver feedback y registrar consecuencia.
5. Completar checklist de evidencias describiendo qué se **propone ejecutar**, sin inventar resultados.
6. Entregar el análisis. Cambia a estado `submitted` y ya no se puede editar sin nueva revisión.
7. Consultar referencia y registrar autoevaluación separada; el resultado es **autodeclarado**.
8. Crear nueva revisión, conservando historial de intentos.
9. Exportar respaldo JSON completo (intentos, comentarios, arquitecturas e incidentes); importación validada con restauración anterior ante fallo de escritura cuando sea posible.
10. Descargar un laboratorio Cargo, ejecutar controles reales en un entorno Rust y guardar resultados **fuera de este motor educativo**; nunca convertir una marca de interfaz en prueba ejecutada.

## Reglas de seguridad

- Sin cuentas, API key, tokens o ejecución arbitraria de comandos en el navegador.
- Persistencia local por origen; la exportación JSON puede contener análisis del usuario: no compartir datos privados accidentalmente.
- Datos de importación validados; límites: máximo 18 retos, 80 comentarios por reto, 32 nodos y 96 conexiones por canvas, seis incidentes y archivo de respaldo de 4 MB.
- No interpretar Markdown importado como HTML; los comentarios se renderizan como texto Preact.
- Los protocolos y nombres de nodo son descripciones: no se usan para navegar ni construir URLs de red.
- Un fallo de almacenamiento se anuncia; no prometer persistencia sin observarla.

## Pruebas que deben pasar antes de una publicación final

| Control | Objetivo | Estado en este entorno |
|---|---|---|
| `npm run senior:check` | 18 intentos, 6 incidentes, revisiones, canvas, import/export | PASS en Node.js |
| `npm run content:check` | 54 módulos, 18 desafíos, 8 rutas y 14 juegos | PASS estructural |
| `npm run senior:labs-check` | 18 Cargo.toml, fuentes y entry points | PASS estructural |
| `npm run vigilio:check` | Fuentes normativas enlazadas | PASS estructural |
| `npm run security:scan` | Heurística de secretos, no reemplaza SAST | PASS limitada |
| `npm ci && npm run build && npm test` | Build real y pruebas web | BLOQUEADO (lockfile/dependencias no resueltas) |
| `cargo fmt`, `cargo check`, `cargo clippy`, `cargo test` | Todos los crates | BLOQUEADO (sin toolchain Rust) |
| Playwright móvil/tablet/desktop/teclado | Navegación y accesibilidad | BLOQUEADO (Chromium no disponible) |
| Auditoría de dependencias/SCA y pin SHA | Seguridad supply-chain | PENDIENTE |

## Vigilio Docs aplicadas

- `.agents/skills/vigilio/.vigilio-docs/stacks/rust/core/ownership-borrowing-lifetimes.md`: ownership y contratos explícitos.
- `.agents/skills/vigilio/.vigilio-docs/stacks/rust/core/async-concurrency-cancellation.md`: task ownership, cancelación y backpressure.
- `.agents/skills/vigilio/.vigilio-docs/stacks/rust/testing/rust-testing-and-quality-gates.md`: comandos reales y pruebas adversarias, PASS solo con evidencia.
- `.agents/skills/vigilio/.vigilio-docs/standards/experience/README.md`: foco, teclado, responsive, distinción diseño vs interfaz probada.
