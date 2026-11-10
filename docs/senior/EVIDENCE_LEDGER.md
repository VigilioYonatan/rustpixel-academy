# Bitácora de evidencias Senior — v0.6.0

## Objetivo

Registrar pruebas aportadas por el estudiante sin otorgar falsamente una verificación independiente. El motor está en `src/features/senior/engine/evidence.ts` y la interfaz en `pages/EvidenceWorkspace.tsx`.

## Contrato de negocio

- Cada uno de los 18 desafíos puede registrar hasta 50 evidencias por revisión.
- Campos obligatorios: tipo, procedencia declarada, versión de revisión, entorno, salida (mínimo 20 caracteres); comando opcional para revisiones manuales.
- Los tipos incluyen test, seguridad, benchmark, arquitectura, incidente y code review.
- Los datos se almacenan bajo `rustpixel:evidence:v1:SNN-C01` y se incluyen en el respaldo Senior.
- La importación de respaldos v1 sin el campo opcional `evidence` sigue siendo compatible; si la evidencia está presente y es corrupta, la importación falla antes de escribir.
- La importación reemplaza completamente las evidencias anteriores, con recuperación best-effort si falla el almacenamiento.
- `evidenceReadiness` verifica únicamente la presencia de tres categorías declaradas (tests, riesgo y diseño), **no** el resultado de `cargo test` ni la autenticidad de los logs.
- Ninguna evidencia obtiene estado VERIFIED por sí misma. Una reproducción externa deberá validar el commit y la toolchain utilizada.

## Seguridad y privacidad

No pegar tokens, llaves, contraseñas, información de clientes ni datos personales. Los logs se guardan localmente sin cifrar y se incluyen en la exportación del respaldo. El navegador puede borrar el almacenamiento local; exportar no implica sincronización en la nube.

## Pruebas

`npm run senior:check`: compila el dominio TypeScript en modo estricto y prueba registro de evidencias en 18 desafíos, invalidación, límites, aislamiento de revisiones, redacción de reporte, roundtrip de respaldo y el respaldo de los 18 incidentes.

## Limitaciones de alcance

RustPixel no incorpora un compilador Rust privado ni una identidad verificable de revisores. Las evidencias deben reproducirse externamente mediante Cargo y registrarse como pruebas externas. El build completo Preact, visual E2E y los 18 Cargo labs permanecen pendientes de un entorno que permita instalar dependencias y toolchain.
