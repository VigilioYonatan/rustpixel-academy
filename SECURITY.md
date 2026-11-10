# Política de seguridad — RustPixel

La plataforma no debe almacenar credenciales ni secretos. Los datos de aprendizaje se conservan en `localStorage` del usuario; pueden borrarse al limpiar el navegador. La importación JSON está limitada y validada antes de persistirse.

## Reportar un problema
Usar **GitHub Private Vulnerability Reporting** cuando el repositorio esté publicado, o contactar privadamente al mantenedor indicado en el repositorio. No publicar exploits con datos personales en issues abiertos.

## Modelo de amenazas
- XSS: no insertar contenido del usuario como HTML sin sanitizar; los ejemplos de código se muestran como texto del editor.
- Cadena de suministro: verificar npm y crates; confirmar actualizaciones de Actions; pinning SHA antes de producción estricta.
- Persistencia local: evitar credenciales; importación con límite de tamaño, claves validadas y sin ejecución.
- Runtime: NO compilar código arbitrario dentro del browser ni ejecutarlo en nuestros servidores; enlaces al servicio Playground externo.
- GitHub Pages: no permite configurar todos los encabezados de seguridad por aplicación; no afirmar CSP/COOP/COEP completos mediante HTML solamente.
- No analítica ni perfiles remotos. No hay autenticación ni backend propio.

## Controles pendientes
No hay lockfile npm verificado ni análisis CodeQL ejecutado en este entorno; los workflows deben comprobarse en GitHub antes de considerar la release verificada.
