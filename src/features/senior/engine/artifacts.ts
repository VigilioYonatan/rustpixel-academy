/** Static, illustrative fixtures. Never report these as executed Rust or measured metrics. */
export interface SeniorArtifact {
  label: string;
  language: 'rust' | 'diff' | 'log' | 'text';
  body: string;
  reviewPrompt: string;
}
const fixtures: Record<string, SeniorArtifact> = {
  S01: {
    label: 'src/parser.rs · clonación innecesaria',
    language: 'rust',
    body: `pub fn prefixes(paths: &[String]) -> Vec<String> {\n    paths.iter()\n        .map(|p| p.split('/').next().unwrap_or("").to_owned())\n        .collect()\n}`,
    reviewPrompt:
      '¿Puede devolverse una vista prestada? ¿Qué lifetime asociarías al slice de entrada?',
  },
  S02: {
    label: 'Grafo de crates · dependencias',
    language: 'text',
    body: `api -> domain -> persistence\npersistence -> api\nworker -> domain`,
    reviewPrompt:
      'Señala el ciclo y propone dónde deben vivir los puertos con una justificación de ownership.',
  },
  S03: {
    label: 'src/lib.rs · errores públicos',
    language: 'rust',
    body: `pub fn read_config(path: &str) -> String {\n    std::fs::read_to_string(path).unwrap()\n}`,
    reviewPrompt:
      'Define Result, tipo de error y pruebas de compatibilidad del contrato público.',
  },
  S04: {
    label: 'src/buffer.rs · unsafe',
    language: 'rust',
    body: `pub unsafe fn view<'a>(ptr: *const u8, len: usize) -> &'a [u8] {\n    std::slice::from_raw_parts(ptr, len)\n}`,
    reviewPrompt:
      '¿Por qué la firma no demuestra validez, alineación ni lifetime? ¿Qué precondiciones exige?',
  },
  S05: {
    label: 'ffi/bridge.rs · frontera C',
    language: 'rust',
    body: `unsafe extern "C" {\n    fn open_resource() -> *mut core::ffi::c_void;\n    fn close_resource(ptr: *mut core::ffi::c_void);\n}`,
    reviewPrompt:
      'Diseña un wrapper con Drop y explica las garantías del puntero y la thread safety.',
  },
  S06: {
    label: 'src/locks.rs · lock order',
    language: 'text',
    body: `Task A: lock(orders) -> lock(stock)\nTask B: lock(stock) -> lock(orders)`,
    reviewPrompt:
      'Explica el deadlock potencial y cómo definir una política de adquisición.',
  },
  S07: {
    label: 'src/server.rs · task sin propietario',
    language: 'rust',
    body: `async fn handle(job: Job) {\n    tokio::spawn(async move { process(job).await });\n    // The caller never joins or cancels the spawned task.\n}`,
    reviewPrompt:
      'Propón un ownership explícito del JoinHandle, cancelación y cierre ordenado.',
  },
  S08: {
    label: 'bench.txt · cifras de escenario ficticio',
    language: 'text',
    body: `before: p99 25ms | allocs 45/op\nafter : p99 37ms | allocs 51/op\nCarga: NO CONTROLADA`,
    reviewPrompt: '¿Qué mediciones faltan antes de atribuir causalidad?',
  },
  S09: {
    label: 'events.log · duplicación',
    language: 'log',
    body: `EVENT id=evt-31 payment=pay-8 amount=100\nEVENT id=evt-31 payment=pay-8 amount=100`,
    reviewPrompt: 'Describe una operación idempotente y un test de replay.',
  },
  S10: {
    label: 'stock.sql · carrera',
    language: 'text',
    body: `TX1: SELECT stock=1\nTX2: SELECT stock=1\nTX1: UPDATE stock=0\nTX2: UPDATE stock=0\nAmbos pedidos confirmados`,
    reviewPrompt:
      'Define una transacción que impida confirmar dos ventas con una unidad de stock.',
  },
  S11: {
    label: 'queue.config · saturación',
    language: 'text',
    body: `queue_capacity = unlimited\nproducer_rate = 5000/s\nconsumer_rate = 300/s`,
    reviewPrompt:
      'Propón límites y una política medible de rechazo, espera o persistencia.',
  },
  S12: {
    label: 'src/handlers.rs · acceso cruzado',
    language: 'rust',
    body: `async fn invoice(id: u64) -> Invoice {\n    repository.find_by_id(id).await.unwrap()\n}`,
    reviewPrompt:
      '¿Dónde se verifica el ownership del recurso por usuario? Diseña un test negativo.',
  },
  S13: {
    label: 'tests/parser.rs · caso insuficiente',
    language: 'rust',
    body: `#[test]\nfn happy_path() {\n    assert_eq!(parse("a,b"), vec!["a", "b"]);\n}`,
    reviewPrompt:
      'Propón propiedades y entradas adversariales para fuzzing, sin asumir que una prueba equivale a cobertura total.',
  },
  S14: {
    label: 'incident.log · líneas simuladas',
    language: 'log',
    body: `14:02 WARN latency_p99_ms=1800\n14:03 ERROR db_pool_timeout total=140\n14:04 WARN inflight=1240\n14:05 INFO mitigation=pending`,
    reviewPrompt:
      'Correlaciona saturación, pool, latencia, impacto y plan de mitigación.',
  },
  S15: {
    label: 'migration.sql · cambio incompatible',
    language: 'text',
    body: `ALTER TABLE orders DROP COLUMN status;\n-- Previous production version still reads status`,
    reviewPrompt:
      'Propón despliegue expand/contract, rollback y criterio de éxito.',
  },
  S16: {
    label: 'compatibility.diff · API cambiante',
    language: 'diff',
    body: `- GET /v1/order/:id -> {"id":1,"status":"paid"}\n+ GET /v1/order/:id -> {"id":1,"state":2}`,
    reviewPrompt: 'Justifica tests de contrato y una migración sin rotura.',
  },
  S17: {
    label: 'review.diff · PR con complejidad',
    language: 'diff',
    body: `- if failed { return Err(Error::Busy); }\n+ match retry(9999, || request()) {\n+     Ok(x) => Ok(x),\n+     Err(_) => panic!("failed")\n+ }`,
    reviewPrompt:
      'Escribe un comentario de revisión accionable sobre retries sin límite, panic y backpressure.',
  },
  S18: {
    label: 'architecture.txt · propuesta inicial',
    language: 'text',
    body: `mobile -> gateway -> 12 services -> queue -> database\nSLO: unknown | consistency: unknown\npeak QPS: unknown | recovery: unknown`,
    reviewPrompt:
      'Completa restricciones antes de seleccionar servicios, colas y persistencia.',
  },
};
export function getSeniorArtifact(
  moduleId: string,
): SeniorArtifact | undefined {
  return fixtures[moduleId];
}
export function artifactCount() {
  return Object.keys(fixtures).length;
}
