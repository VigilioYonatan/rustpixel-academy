import type {
  AcceptanceGate,
  AcceptanceGateId,
  AcceptanceSummary,
  GateStatus,
  ModuleAcceptance,
  SeniorAttempt,
  SeniorRecord,
} from '../model/senior.types';
import { evidenceKey, parseEvidence } from './evidence';

interface GateDef {
  id: AcceptanceGateId;
  label: string;
  requirement: string;
  commandSnippet: string;
}

const COMMON_GATES: Record<AcceptanceGateId, { label: string }> = {
  correctness: { label: 'Correctitud y pruebas adversarias' },
  security: { label: 'Seguridad, invariantes y clippy' },
  architecture: { label: 'Arquitectura, contratos y ADR' },
  operations: { label: 'Operaciones, rollback y observabilidad' },
  performance: { label: 'Rendimiento medido y presupuestos' },
};

export const MODULE_ACCEPTANCE_DEFS: Record<string, GateDef[]> = {
  S01: [
    {
      id: 'correctness',
      label: COMMON_GATES.correctness.label,
      requirement:
        'cargo test para s01-idiomatic-ownership con entradas vacías, espacios y UTF-8 multi-byte.',
      commandSnippet: 'cargo test -p s01-idiomatic-ownership --locked',
    },
    {
      id: 'security',
      label: COMMON_GATES.security.label,
      requirement:
        'Validación de límites de slice y ausencia de referencias colgantes sin unsafe.',
      commandSnippet:
        'cargo clippy -p s01-idiomatic-ownership --all-targets -- -D warnings',
    },
    {
      id: 'architecture',
      label: COMMON_GATES.architecture.label,
      requirement:
        'Firma pública de borrowing limpio (&str / Cow) desacoplada de la asignación del caller.',
      commandSnippet: 'cargo check -p s01-idiomatic-ownership --all-targets',
    },
    {
      id: 'operations',
      label: COMMON_GATES.operations.label,
      requirement:
        'Monitoreo de tasa de asignaciones en heap durante el procesamiento de rutas.',
      commandSnippet: 'cargo test -p s01-idiomatic-ownership -- --nocapture',
    },
    {
      id: 'performance',
      label: COMMON_GATES.performance.label,
      requirement:
        'Demostración de cero clones superfluos en el hot path del parser.',
      commandSnippet: 'cargo bench -p s01-idiomatic-ownership',
    },
  ],
  S02: [
    {
      id: 'correctness',
      label: COMMON_GATES.correctness.label,
      requirement:
        'cargo metadata y test de integración verificando separación acíclica de crates.',
      commandSnippet: 'cargo metadata --format-version 1',
    },
    {
      id: 'security',
      label: COMMON_GATES.security.label,
      requirement:
        'Encapsulación de tipos internos de almacenamiento fuera de la API pública del dominio.',
      commandSnippet:
        'cargo clippy -p s02-crate-architecture --all-targets -- -D warnings',
    },
    {
      id: 'architecture',
      label: COMMON_GATES.architecture.label,
      requirement:
        'ADR justificando puertos y adaptadores sin fragmentación innecesaria de crates.',
      commandSnippet: 'cargo check -p s02-crate-architecture --all-targets',
    },
    {
      id: 'operations',
      label: COMMON_GATES.operations.label,
      requirement:
        'Pipeline de build modular sin dependencias circulares en CI.',
      commandSnippet: 'cargo check --workspace --all-targets',
    },
    {
      id: 'performance',
      label: COMMON_GATES.performance.label,
      requirement:
        'Tiempos de compilación incremental optimizados aislando crates de dominio.',
      commandSnippet: 'cargo build -p s02-crate-architecture --timings',
    },
  ],
  S03: [
    {
      id: 'correctness',
      label: COMMON_GATES.correctness.label,
      requirement:
        'Tests de compatibilidad de API con variantes exhaustivas de Result y ApiError.',
      commandSnippet: 'cargo test -p s03-api-contracts --locked',
    },
    {
      id: 'security',
      label: COMMON_GATES.security.label,
      requirement:
        'Sustitución de panic! por errores tipados recuperables ante entradas malformadas.',
      commandSnippet:
        'cargo clippy -p s03-api-contracts --all-targets -- -D warnings',
    },
    {
      id: 'architecture',
      label: COMMON_GATES.architecture.label,
      requirement:
        'Traits y contratos públicos estables sin filtrar structs privados de implementación.',
      commandSnippet: 'cargo check -p s03-api-contracts --all-targets',
    },
    {
      id: 'operations',
      label: COMMON_GATES.operations.label,
      requirement:
        'Compatibilidad de contratos con clientes anteriores y estrategia de versionado semántico.',
      commandSnippet: 'cargo check -p s03-api-contracts',
    },
    {
      id: 'performance',
      label: COMMON_GATES.performance.label,
      requirement:
        'Cero asignaciones dinámicas en la propagación de Result con tipos de error compactos.',
      commandSnippet: 'cargo test -p s03-api-contracts --release',
    },
  ],
  S04: [
    {
      id: 'correctness',
      label: COMMON_GATES.correctness.label,
      requirement:
        'Verificación de invariantes de aliasing, bounds y alineación con Miri.',
      commandSnippet: 'cargo miri test -p s04-unsafe-invariants',
    },
    {
      id: 'security',
      label: COMMON_GATES.security.label,
      requirement:
        'Safety contract explícito y justificado en cada bloque unsafe del código.',
      commandSnippet:
        'cargo clippy -p s04-unsafe-invariants --all-targets -- -D warnings',
    },
    {
      id: 'architecture',
      label: COMMON_GATES.architecture.label,
      requirement:
        'Encapsulación de raw pointers detrás de un wrapper seguro con garantías estáticas.',
      commandSnippet: 'cargo check -p s04-unsafe-invariants --all-targets',
    },
    {
      id: 'operations',
      label: COMMON_GATES.operations.label,
      requirement:
        'Suite de pruebas adversarias con casos límite de desbordamiento de punteros.',
      commandSnippet: 'cargo test -p s04-unsafe-invariants',
    },
    {
      id: 'performance',
      label: COMMON_GATES.performance.label,
      requirement:
        'Eliminación de comprobaciones de límites redundantes sustentada por invariantes de tipo.',
      commandSnippet: 'cargo test -p s04-unsafe-invariants --release',
    },
  ],
  S05: [
    {
      id: 'correctness',
      label: COMMON_GATES.correctness.label,
      requirement:
        'Tests de frontera C/Rust con ida y vuelta de datos y manejo de punteros nulos.',
      commandSnippet: 'cargo test -p s05-ffi-ownership --locked',
    },
    {
      id: 'security',
      label: COMMON_GATES.security.label,
      requirement:
        'Wrapper RAII con Drop que invoca al deallocator nativo correcto de C sin double free.',
      commandSnippet:
        'cargo clippy -p s05-ffi-ownership --all-targets -- -D warnings',
    },
    {
      id: 'architecture',
      label: COMMON_GATES.architecture.label,
      requirement:
        'Contrato formal de ownership y transferencias de memoria en la frontera ABI.',
      commandSnippet: 'cargo check -p s05-ffi-ownership --all-targets',
    },
    {
      id: 'operations',
      label: COMMON_GATES.operations.label,
      requirement:
        'Detección de fugas de memoria con AddressSanitizer / Valgrind en frontera FFI.',
      commandSnippet: 'cargo test -p s05-ffi-ownership',
    },
    {
      id: 'performance',
      label: COMMON_GATES.performance.label,
      requirement:
        'Cero copias intermedias en el paso de buffers a través de la frontera nativa.',
      commandSnippet: 'cargo test -p s05-ffi-ownership --release',
    },
  ],
  S06: [
    {
      id: 'correctness',
      label: COMMON_GATES.correctness.label,
      requirement:
        'Tests de estrés con múltiples hilos y verificación de ausencia de deadlocks.',
      commandSnippet: 'cargo test -p s06-lock-order --locked',
    },
    {
      id: 'security',
      label: COMMON_GATES.security.label,
      requirement:
        'Orden total estricto de adquisición de Mutex/RwLock documentado y verificado.',
      commandSnippet:
        'cargo clippy -p s06-lock-order --all-targets -- -D warnings',
    },
    {
      id: 'architecture',
      label: COMMON_GATES.architecture.label,
      requirement:
        'Reducción de la duración de secciones críticas sin retener locks sobre I/O o red.',
      commandSnippet: 'cargo check -p s06-lock-order --all-targets',
    },
    {
      id: 'operations',
      label: COMMON_GATES.operations.label,
      requirement:
        'Telemetría de tiempo de retención de locks y detección de contención en producción.',
      commandSnippet: 'cargo test -p s06-lock-order -- --nocapture',
    },
    {
      id: 'performance',
      label: COMMON_GATES.performance.label,
      requirement:
        'Minimización de contención entre hilos bajo contienda de transacciones concurrentes.',
      commandSnippet: 'cargo test -p s06-lock-order --release',
    },
  ],
  S07: [
    {
      id: 'correctness',
      label: COMMON_GATES.correctness.label,
      requirement:
        'Shutdown acotado con JoinHandle consumido, timeout y drenaje de cola de tareas Tokio.',
      commandSnippet: 'cargo test -p s07-tokio-cancellation --locked',
    },
    {
      id: 'security',
      label: COMMON_GATES.security.label,
      requirement:
        'Prevención de tareas asíncronas huérfanas reteniendo recursos tras señal de parada.',
      commandSnippet:
        'cargo clippy -p s07-tokio-cancellation --all-targets -- -D warnings',
    },
    {
      id: 'architecture',
      label: COMMON_GATES.architecture.label,
      requirement:
        'Task ownership cooperativo con CancellationToken y JoinSet estructurado.',
      commandSnippet: 'cargo check -p s07-tokio-cancellation --all-targets',
    },
    {
      id: 'operations',
      label: COMMON_GATES.operations.label,
      requirement:
        'Manejo limpio de SIGTERM con flush de trabajos antes del deadline de salida.',
      commandSnippet: 'cargo test -p s07-tokio-cancellation',
    },
    {
      id: 'performance',
      label: COMMON_GATES.performance.label,
      requirement:
        'Presupuesto de tiempo de cierre acotado (< 5s) con límites de concurrencia.',
      commandSnippet: 'cargo test -p s07-tokio-cancellation --release',
    },
  ],
  S08: [
    {
      id: 'correctness',
      label: COMMON_GATES.correctness.label,
      requirement:
        'Criterion benchmarks con dataset idéntico y control estricto de varianza.',
      commandSnippet: 'cargo bench -p s08-benchmark-baseline',
    },
    {
      id: 'security',
      label: COMMON_GATES.security.label,
      requirement:
        'Detección y mitigación de cuellos de botella de complejidad algorítmica cuadrática.',
      commandSnippet:
        'cargo clippy -p s08-benchmark-baseline --all-targets -- -D warnings',
    },
    {
      id: 'architecture',
      label: COMMON_GATES.architecture.label,
      requirement:
        'Hipótesis de optimización documentada antes de modificar el código productivo.',
      commandSnippet: 'cargo check -p s08-benchmark-baseline --all-targets',
    },
    {
      id: 'operations',
      label: COMMON_GATES.operations.label,
      requirement:
        'Comparación de percentiles p50/p95/p99 en telemetría de producción bajo carga.',
      commandSnippet: 'cargo test -p s08-benchmark-baseline',
    },
    {
      id: 'performance',
      label: COMMON_GATES.performance.label,
      requirement:
        'Demostración reproducible de reducción de p99 y asignaciones de memoria.',
      commandSnippet: 'cargo test -p s08-benchmark-baseline --release',
    },
  ],
  S09: [
    {
      id: 'correctness',
      label: COMMON_GATES.correctness.label,
      requirement:
        'Replay de eventos devuelve la respuesta original sin duplicar efectos de negocio.',
      commandSnippet: 'cargo test -p s09-idempotency --locked',
    },
    {
      id: 'security',
      label: COMMON_GATES.security.label,
      requirement:
        'Rechazo de eventos con la misma clave pero contenido diferente (ApplyError::Conflict).',
      commandSnippet:
        'cargo clippy -p s09-idempotency --all-targets -- -D warnings',
    },
    {
      id: 'architecture',
      label: COMMON_GATES.architecture.label,
      requirement:
        'Deduplicación transaccional con persistencia acotada y expiración TTL.',
      commandSnippet: 'cargo check -p s09-idempotency --all-targets',
    },
    {
      id: 'operations',
      label: COMMON_GATES.operations.label,
      requirement:
        'Recuperación de consistencia tras caída del worker antes o después del commit.',
      commandSnippet: 'cargo test -p s09-idempotency -- --nocapture',
    },
    {
      id: 'performance',
      label: COMMON_GATES.performance.label,
      requirement:
        'Búsqueda rápida de clave de idempotencia en memoria/índice sin degradar latencia.',
      commandSnippet: 'cargo test -p s09-idempotency --release',
    },
  ],
  S10: [
    {
      id: 'correctness',
      label: COMMON_GATES.correctness.label,
      requirement:
        'Test concurrente con 12 compradores compitiendo por la última unidad sin stock negativo.',
      commandSnippet: 'cargo test -p s10-inventory-consistency --locked',
    },
    {
      id: 'security',
      label: COMMON_GATES.security.label,
      requirement:
        'Aislamiento transaccional y prevención de carreras de lost updates en inventario.',
      commandSnippet:
        'cargo clippy -p s10-inventory-consistency --all-targets -- -D warnings',
    },
    {
      id: 'architecture',
      label: COMMON_GATES.architecture.label,
      requirement:
        'Modelo de dominio con invariantes atómicos (Mutex/transacción condicional).',
      commandSnippet: 'cargo check -p s10-inventory-consistency --all-targets',
    },
    {
      id: 'operations',
      label: COMMON_GATES.operations.label,
      requirement:
        'Monitoreo de rechazos por stock insuficiente y alarmas de sobreventa.',
      commandSnippet: 'cargo test -p s10-inventory-consistency',
    },
    {
      id: 'performance',
      label: COMMON_GATES.performance.label,
      requirement:
        'Contención acotada de actualización de stock bajo ráfagas de compra concurrentes.',
      commandSnippet: 'cargo test -p s10-inventory-consistency --release',
    },
  ],
  S11: [
    {
      id: 'correctness',
      label: COMMON_GATES.correctness.label,
      requirement:
        'Rechazo inmediato (PushError::Full) al saturar la capacidad acotada y drenaje ordenado.',
      commandSnippet: 'cargo test -p s11-backpressure --locked',
    },
    {
      id: 'security',
      label: COMMON_GATES.security.label,
      requirement:
        'Prevención de agotamiento de memoria (OOM) bloqueando colas no acotadas.',
      commandSnippet:
        'cargo clippy -p s11-backpressure --all-targets -- -D warnings',
    },
    {
      id: 'architecture',
      label: COMMON_GATES.architecture.label,
      requirement:
        'Señales explícitas de backpressure al productor y soporte de cierre y rechazo.',
      commandSnippet: 'cargo check -p s11-backpressure --all-targets',
    },
    {
      id: 'operations',
      label: COMMON_GATES.operations.label,
      requirement:
        'Métricas de backlog, ratio productor/consumidor y alarmas de saturación de cola.',
      commandSnippet: 'cargo test -p s11-backpressure -- --nocapture',
    },
    {
      id: 'performance',
      label: COMMON_GATES.performance.label,
      requirement:
        'Pre-reserva de memoria acotada evitando reallocations continuos en ráfagas.',
      commandSnippet: 'cargo test -p s11-backpressure --release',
    },
  ],
  S12: [
    {
      id: 'correctness',
      label: COMMON_GATES.correctness.label,
      requirement:
        'Tests negativos de acceso cruzado denegando lectura y escritura a cuentas no dueñas.',
      commandSnippet: 'cargo test -p s12-resource-authorization --locked',
    },
    {
      id: 'security',
      label: COMMON_GATES.security.label,
      requirement:
        'Autorización por recurso en el servidor, no dependiente del frontend ni de IDs opacos.',
      commandSnippet:
        'cargo clippy -p s12-resource-authorization --all-targets -- -D warnings',
    },
    {
      id: 'architecture',
      label: COMMON_GATES.architecture.label,
      requirement:
        'Tenant isolation y modelo de contexto de autorización desacoplado de la capa HTTP.',
      commandSnippet: 'cargo check -p s12-resource-authorization --all-targets',
    },
    {
      id: 'operations',
      label: COMMON_GATES.operations.label,
      requirement:
        'Auditoría de eventos 403 Forbidden para detección de escaneo o abuso IDOR.',
      commandSnippet: 'cargo test -p s12-resource-authorization',
    },
    {
      id: 'performance',
      label: COMMON_GATES.performance.label,
      requirement:
        'Caché particionada por tenant sin fuga de datos entre distintas organizaciones.',
      commandSnippet: 'cargo test -p s12-resource-authorization --release',
    },
  ],
  S13: [
    {
      id: 'correctness',
      label: COMMON_GATES.correctness.label,
      requirement:
        'Tests de propiedades con cientos de semillas deterministas y entradas malformadas.',
      commandSnippet: 'cargo test -p s13-property-testing --locked',
    },
    {
      id: 'security',
      label: COMMON_GATES.security.label,
      requirement:
        'Validación de longitud par y dígitos hex sin pánico ante entradas truncadas.',
      commandSnippet:
        'cargo clippy -p s13-property-testing --all-targets -- -D warnings',
    },
    {
      id: 'architecture',
      label: COMMON_GATES.architecture.label,
      requirement:
        'Generadores de propiedades y corpus de regresión integrados en suite de pruebas.',
      commandSnippet: 'cargo check -p s13-property-testing --all-targets',
    },
    {
      id: 'operations',
      label: COMMON_GATES.operations.label,
      requirement:
        'Fuzzing continuo en CI con detección automática de entradas causantes de crash.',
      commandSnippet: 'cargo test -p s13-property-testing',
    },
    {
      id: 'performance',
      label: COMMON_GATES.performance.label,
      requirement:
        'Decodificación por chunks de tamaño constante sin asignaciones intermedias innecesarias.',
      commandSnippet: 'cargo test -p s13-property-testing --release',
    },
  ],
  S14: [
    {
      id: 'correctness',
      label: COMMON_GATES.correctness.label,
      requirement:
        'Cálculo determinista de percentiles p50/p99 y error rate con ventana acotada.',
      commandSnippet: 'cargo test -p s14-observability --locked',
    },
    {
      id: 'security',
      label: COMMON_GATES.security.label,
      requirement:
        'Enmascaramiento de credenciales y PII en eventos de log y trazas de error.',
      commandSnippet:
        'cargo clippy -p s14-observability --all-targets -- -D warnings',
    },
    {
      id: 'architecture',
      label: COMMON_GATES.architecture.label,
      requirement:
        'Correlación de métricas de latencia con saturación de pool SQL por trace_id.',
      commandSnippet: 'cargo check -p s14-observability --all-targets',
    },
    {
      id: 'operations',
      label: COMMON_GATES.operations.label,
      requirement:
        'Plan de mitigación y rollback automatizado guiado por degradación de SLI de latencia.',
      commandSnippet: 'cargo test -p s14-observability',
    },
    {
      id: 'performance',
      label: COMMON_GATES.performance.label,
      requirement:
        'Recolección de telemetría con ventana deslizante de impacto acotado en CPU y heap.',
      commandSnippet: 'cargo test -p s14-observability --release',
    },
  ],
  S15: [
    {
      id: 'correctness',
      label: COMMON_GATES.correctness.label,
      requirement:
        'Migración expand/contract con coexistencia de clientes antiguos y nuevos.',
      commandSnippet: 'cargo test -p s15-expand-contract --locked',
    },
    {
      id: 'security',
      label: COMMON_GATES.security.label,
      requirement:
        'Validación de esquema sin pérdida de datos en campos obligatorios durante la transición.',
      commandSnippet:
        'cargo clippy -p s15-expand-contract --all-targets -- -D warnings',
    },
    {
      id: 'architecture',
      label: COMMON_GATES.architecture.label,
      requirement:
        'Desacoplamiento de despliegue de software y cambios de base de datos en release gates.',
      commandSnippet: 'cargo check -p s15-expand-contract --all-targets',
    },
    {
      id: 'operations',
      label: COMMON_GATES.operations.label,
      requirement:
        'Procedimiento de rollback ensayado y validado antes de cada release productiva.',
      commandSnippet: 'cargo test -p s15-expand-contract',
    },
    {
      id: 'performance',
      label: COMMON_GATES.performance.label,
      requirement:
        'Migraciones online sin bloqueo exclusivo de tablas críticas en producción.',
      commandSnippet: 'cargo test -p s15-expand-contract --release',
    },
  ],
  S16: [
    {
      id: 'correctness',
      label: COMMON_GATES.correctness.label,
      requirement:
        'Golden tests de caracterización garantizando el comportamiento observable del monolito.',
      commandSnippet: 'cargo test -p s16-contract-migration --locked',
    },
    {
      id: 'security',
      label: COMMON_GATES.security.label,
      requirement:
        'Delimitación de fronteras de seguridad al desacoplar módulos con permisos diferentes.',
      commandSnippet:
        'cargo clippy -p s16-contract-migration --all-targets -- -D warnings',
    },
    {
      id: 'architecture',
      label: COMMON_GATES.architecture.label,
      requirement:
        'Extracción progresiva de bounded context sin big-bang rewrite.',
      commandSnippet: 'cargo check -p s16-contract-migration --all-targets',
    },
    {
      id: 'operations',
      label: COMMON_GATES.operations.label,
      requirement:
        'Métrica de tráfico migrado y canary releases progresivas con opción de desvío.',
      commandSnippet: 'cargo test -p s16-contract-migration',
    },
    {
      id: 'performance',
      label: COMMON_GATES.performance.label,
      requirement:
        'Latencia de interoperabilidad entre el módulo extraído y el núcleo legacy.',
      commandSnippet: 'cargo test -p s16-contract-migration --release',
    },
  ],
  S17: [
    {
      id: 'correctness',
      label: COMMON_GATES.correctness.label,
      requirement:
        'Aprobación de release condicionada a pruebas automatizadas completas en verde.',
      commandSnippet: 'cargo test -p s17-code-review-gates --locked',
    },
    {
      id: 'security',
      label: COMMON_GATES.security.label,
      requirement:
        'Revisión de seguridad y análisis estático con clippy sin advertencias permitido.',
      commandSnippet:
        'cargo clippy -p s17-code-review-gates --all-targets -- -D warnings',
    },
    {
      id: 'architecture',
      label: COMMON_GATES.architecture.label,
      requirement:
        'Evaluación de trade-offs técnicos, alternativas consideradas y riesgos en ADR.',
      commandSnippet: 'cargo check -p s17-code-review-gates --all-targets',
    },
    {
      id: 'operations',
      label: COMMON_GATES.operations.label,
      requirement:
        'Documentación de plan de rollback, señales de salud y mitigación de saturación.',
      commandSnippet: 'cargo test -p s17-code-review-gates',
    },
    {
      id: 'performance',
      label: COMMON_GATES.performance.label,
      requirement:
        'Evidencia de benchmark reproducible obligatoria para código sensible a latencia.',
      commandSnippet: 'cargo test -p s17-code-review-gates --release',
    },
  ],
  S18: [
    {
      id: 'correctness',
      label: COMMON_GATES.correctness.label,
      requirement:
        'Verificación de aritmética sin overflow en modelos de concurrencia y memoria.',
      commandSnippet: 'cargo test -p s18-system-design --locked',
    },
    {
      id: 'security',
      label: COMMON_GATES.security.label,
      requirement:
        'Protección contra agotamiento de recursos mediante cuotas y límites máximos estrictos.',
      commandSnippet:
        'cargo clippy -p s18-system-design --all-targets -- -D warnings',
    },
    {
      id: 'architecture',
      label: COMMON_GATES.architecture.label,
      requirement:
        'Documento de arquitectura (ADR) con topología mínima, contratos y trade-offs.',
      commandSnippet: 'cargo check -p s18-system-design --all-targets',
    },
    {
      id: 'operations',
      label: COMMON_GATES.operations.label,
      requirement:
        'Definición de SLOs observables, presupuestos de error y monitoreo de saturación.',
      commandSnippet: 'cargo test -p s18-system-design',
    },
    {
      id: 'performance',
      label: COMMON_GATES.performance.label,
      requirement:
        'Modelo de capacidad determinista basado en la Ley de Little y picos de tráfico.',
      commandSnippet: 'cargo test -p s18-system-design --release',
    },
  ],
};

export function getModuleAcceptance(
  moduleId: string,
  storage: Pick<Storage, 'getItem'>,
  attempt?: SeniorAttempt,
): ModuleAcceptance {
  const challengeId = `${moduleId}-C01`;
  const defs = MODULE_ACCEPTANCE_DEFS[moduleId] ?? [];

  let evidenceKinds: string[] = [];
  try {
    const raw = storage.getItem(evidenceKey(challengeId));
    if (raw !== null) {
      const parsed = parseEvidence(JSON.parse(raw), challengeId);
      evidenceKinds = parsed.items.map((i) => i.kind);
    }
  } catch {
    /* empty */
  }

  const gates: AcceptanceGate[] = defs.map((def) => {
    let status: GateStatus = 'missing';

    let hasIncidentResolved = false;
    try {
      const incRaw = storage.getItem(`rustpixel:incident:v1:${moduleId}`);
      if (incRaw !== null) {
        const inc = JSON.parse(incRaw);
        if (inc && inc.status === 'resolved') hasIncidentResolved = true;
      }
    } catch {
      /* empty */
    }

    let hasWorkspaceSaved = false;
    try {
      if (
        storage.getItem(`rustpixel:review:v1:${challengeId}`) !== null ||
        storage.getItem(`rustpixel:architecture:v1:${challengeId}`) !== null
      ) {
        hasWorkspaceSaved = true;
      }
    } catch {
      /* empty */
    }

    const hasAttemptEvidence =
      attempt &&
      attempt.status !== 'draft' &&
      attempt.evidenceNotes.trim().length >= 25;

    const hasSpecificEvidence =
      (def.id === 'correctness' &&
        (evidenceKinds.includes('test') ||
          (hasAttemptEvidence && attempt.checks[0]))) ||
      (def.id === 'security' &&
        (evidenceKinds.includes('security') ||
          evidenceKinds.includes('incident'))) ||
      (def.id === 'architecture' &&
        (evidenceKinds.includes('architecture') ||
          evidenceKinds.includes('review') ||
          hasWorkspaceSaved)) ||
      (def.id === 'operations' &&
        (evidenceKinds.includes('incident') || hasIncidentResolved)) ||
      (def.id === 'performance' &&
        (evidenceKinds.includes('benchmark') ||
          (hasAttemptEvidence && attempt.checks.some(Boolean))));

    if (hasSpecificEvidence) {
      status = 'declared';
    }

    return {
      id: def.id,
      label: def.label,
      requirement: def.requirement,
      commandSnippet: def.commandSnippet,
      status,
    };
  });

  const declaredCount = gates.filter((g) => g.status === 'declared').length;
  const missingCount = gates.filter((g) => g.status === 'missing').length;

  return {
    moduleId,
    challengeId,
    gates,
    declaredCount,
    missingCount,
    externallyRequiredCount: gates.length,
    externallyVerified: 0,
  };
}

export function calculateAcceptanceSummary(
  storage: Pick<Storage, 'getItem'>,
  record: SeniorRecord,
): AcceptanceSummary {
  const modules: Record<string, ModuleAcceptance> = {};
  let totalDeclared = 0;
  let totalMissing = 0;

  for (let i = 1; i <= 18; i++) {
    const moduleId = `S${String(i).padStart(2, '0')}`;
    const challengeId = `${moduleId}-C01`;
    const attempt = record.attempts[challengeId];
    const modAcc = getModuleAcceptance(moduleId, storage, attempt);
    modules[moduleId] = modAcc;
    totalDeclared += modAcc.declaredCount;
    totalMissing += modAcc.missingCount;
  }

  return {
    totalGates: 90,
    totalDeclared,
    totalMissing,
    totalExternallyRequired: 90,
    externallyVerified: 0,
    modules,
  };
}
