## [0.6.0] — 2026-11-10

- Senior Evidence Workbench: procedencia, revisionado, validación de datos y exportación Markdown.
- Respaldo Senior ahora cubre evidencia y los 18 incidentes; compatibilidad con respaldos anteriores.
- Indicadores pedagógicos de preparación para revisión externa y pruebas de dominio ampliadas.
- Corrección en S09: repetición idempotente devuelve respuesta original; nuevos casos de concurrencia y overflow.
- S12: autorización al escribir, entradas inválidas y tests negativos. S14: percentiles y ventana de latencia acotada.
- Estado de producción continúa bloqueado: dependencias npm, Cargo, pruebas E2E y contenido integral.

## 0.5.0 — 18 incidentes con remediación crítica y guías técnicas

- 12 incidentes adicionales, uno por módulo Senior, para un total de 18, cada uno con tres etapas, decisiones y feedback.
- Endurecimiento de la condición de cierre: la remediación central incorrecta impide un resultado satisfactorio.
- Reporte Markdown del motor de incidentes y botón de exportación dentro de Preact.
- 18 guías de ingeniería del laboratorio conectadas al challenge; baseline, pruebas adversas y evidencia requerida.
- Demo autónoma `senior-incident-arena.html`, con almacenamiento local y reporte; test con DOM simulado `senior:demo-check`.
- No se han verificado cargo test, build de Vite ni E2E en navegador.

# Changelog

## 0.4.0 — Senior Workspaces, ADR y backup completo

- Code Review por línea con severidad, comentarios, eliminación y exportación local JSON.
- Architecture Canvas con nodos, contratos/edges, comprobación de estructura y exportación ADR Markdown.
- Incidentes S04, S06 y S09 añadidos a S07, S12 y S14: seis incidentes multietapa.
- Respaldo integral validado de intentos, reviews, arquitecturas e incidentes, con limpieza de datos anteriores y rollback best-effort.
- Tests de dominio ampliados para las 18 rutas de trabajo, seis incidentes y respaldo.
- Responsive, foco y estados de error ampliados en la SPA.
- Criterios de aceptación de los 18 laboratorios y contrato de evidencia, alineados con Vigilio.
- Release sigue bloqueada por Cargo, npm lockfile/build y E2E no ejecutados.


## 0.3.0 — Senior Mode: incidentes y cobertura de laboratorios

- 15 mini-laboratorios Rust nuevos, sumados a S01/S07/S14 existentes: 18 carpetas Senior con Cargo.toml, fuente, README y tests.
- Simulación multi-paso integrada para S07/S12/S14; estados, mitigación/fallo, feedback y persistencia local.
- Demo HTML autónoma `incident-demo.html` enlazada desde `senior-demo.html`.
- Tests de dominio para caminos correctos e incorrectos y esquema inválido.
- Referencias directas de skills Vigilio empaquetadas; gate automático de enlaces.
- Workflows CI actualizados para incorporar los laboratorios y gates de Senior.
- Auditoría actualizada; los laboratorios no han pasado Cargo en este entorno.

## 0.2.0

- Primera versión de 18 desafíos guiados, decisiones, revisión por rúbricas y flujo Preact Senior.
