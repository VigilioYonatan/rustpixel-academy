---
name: auditoria-total-zero-omissions
version: 1.0.0
description: Auditoría de inventario, trazabilidad, inspección, pruebas, revalidación y empaquetado ZIP con decisión de release basada en evidencia.
---

# Auditoría Total / Zero Omissions — Release Gate

## Misión

No aprobar un proyecto porque existan directorios, archivos o pruebas escritas. Verificar funcionalidad, código, relaciones, datos, UI, recursos, instalación, seguridad, artefactos y paquete ZIP final. No sustituir comprobación por un resumen, ni reducir alcance silenciosamente. Los estados admitidos son **NO INICIADO, EN REVISIÓN, INCOMPLETO, FALLA, CORREGIDO/SIN REVALIDAR, VERIFICADO, NO VERIFICABLE y NO APLICA**.

## Procedimiento obligatorio

1. **Inventariar:** raíz, código, Cargo, package manager, lockfiles, assets, documentación, workflows, datos y versiones; registrar cachés/secretos excluidos.
2. **Matriz de requisitos:** ID, prioridad P0/P1/P2/P3, rutas de implementación, prueba, estado y evidencia. No contar tests solo por tener nombre.
3. **Inspeccionar semántica:** entradas, salidas, estados, errores, null, límites, tipos, seguridad, dependencias, consumers, navegación, localStorage, imports, traducciones y accesibilidad.
4. **Detectar incompletitudes:** TODOs reales, placeholders, handlers sin acción, datos ficticios no señalados, imports y assets rotos, flujos no alcanzables, README inexacto, tests vacíos.
5. **Probar:** análisis de tipos, lint, tests unit/integración/E2E, Cargo, build, controles DevSecOps, seguridad de supply chain y navegador si disponibles; registrar el comando y el código de salida.
6. **Corregir y reauditar:** cualquier cambio invalida el test relacionado. Conservar el trabajo existente, sin borrar para «pasar» controles.
7. **Empaquetar:** excluir secretos, caches, node_modules y artefactos regenerables cuando no sean imprescindibles; conservar fuentes, manifests, assets, licencias e instrucciones correctas.
8. **Validar ZIP extraído:** existencia, CRC, ruta sin traversal, ausencia de nombres duplicados, inventario, SHA256, extracción limpia y repetir checks pertinentes desde la copia.
9. **Release gate:** G1 requisitos, G2 integridad, G3 coherencia, G4 ejecución, G5 correcciones, G6 ZIP, G7 honestidad. P0/P1 o requisitos obligatorios incompletos implican NO APROBADO, aunque el ZIP abra.

## Evidencia y lenguaje

- **PASS/VERIFICADO:** solo con salida de control efectivamente ejecutado.
- **FAIL:** verificación ejecutada con fallo.
- **BLOCKED/NO VERIFICABLE:** faltan herramientas, acceso, servicios o dispositivos.
- **NOT_RUN:** prueba no ejecutada por otra causa declarada.
- **INCOMPLETO:** existe una diferencia objetiva entre requisito y producto.
- Distinguir «validación estructural de Cargo.toml» de «cargo test», «parse TSX» de «typecheck/build», «simulación» de «servicio», «autoevaluación» de «certificación».
- No inventar métricas, CVEs, cumplimiento WCAG, hashes, aprobaciones ni artefactos.

## Reporte de salida obligatorio

Estado APROBADO/NO APROBADO/PARCIAL, matriz y prioridades, inventario, métodos y resultados reales, P0/P1, correcciones y revalidación, exclusiones, ZIP/CRC/SHA/extracción/smoke, limitaciones y pasos reproducibles. Mantener `AUDIT_REPORT.md`, `SENIOR_AUDIT.md`, `MANIFEST.md` y `CHECKSUMS.sha256` actualizados.

**Criterio supremo:** cero omisiones **conocidas** en requisitos obligatorios, integridad del artefacto, validación con evidencia y transparencia sobre lo que no se pudo comprobar.
