import type { ChallengeBrief, DecisionCase } from '../model/senior.types';

const cases: Record<string, DecisionCase> = {
  S01: {
    question:
      'El perfil revela 25 000 clones de String por segundo; ¿qué haces primero?',
    options: [
      'Reemplazar todos con referencias sin revisar lifetimes',
      'Perfilar la ruta y cambiar a &str donde el ownership permita vistas',
      'Usar unsafe para evitar copias',
    ],
    recommended: 'b',
    reason:
      'Una vista prestada es correcta cuando la vida útil está garantizada; medir y comprobar la API evita introducir referencias colgantes.',
    timeline: [
      'Perfil inicial: alto volumen de asignaciones',
      'Se localiza un clon en el parser',
      'Se añade test de equivalencia y benchmark de regresión',
    ],
  },
  S02: {
    question:
      'Un workspace presenta dependencias circulares; ¿qué estrategia eliges?',
    options: [
      'Extraer puertos mínimos en el crate propietario del contrato',
      'Convertir cada struct en un crate',
      'Resolver ciclos con rutas relativas',
    ],
    recommended: 'a',
    reason:
      'Los contratos se colocan según ownership, evitando crates artificiales y ciclos.',
    timeline: [
      'Grafo inicial con ciclos',
      'Identificación de dependencias de dominio',
      'Contrato de entrada acotado + cargo metadata',
    ],
  },
  S03: {
    question:
      'Una librería expone panic! al recibir entrada inválida; ¿cómo evolucionas la API?',
    options: [
      'Conservar panic y documentarlo como éxito',
      'Cambiar toda la API sin versión ni compatibilidad',
      'Devolver un Result tipado y probar la compatibilidad observable',
    ],
    recommended: 'c',
    reason:
      'Result permite errores recuperables; la migración exige pruebas y documentación de contratos.',
    timeline: [
      'Reporte de panic inesperado',
      'Diseño de error público',
      'Test de compatibilidad con consumidores',
    ],
  },
  S04: {
    question:
      'Un bloque unsafe convierte punteros en referencias; ¿qué exige una revisión?',
    options: [
      'Comprobar validez, aliasing, alineación y lifetimes documentados',
      'Aprobar porque compiló',
      'Desactivar Miri',
    ],
    recommended: 'a',
    reason:
      'Unsafe exige invariantes explícitas; compilar no demuestra soundness.',
    timeline: [
      'Inspección de invariantes',
      'Contraejemplo de aliasing',
      'Diseño de API segura y pruebas',
    ],
  },
  S05: {
    question:
      'Una API C devuelve un puntero y una función de liberación; ¿cómo lo encapsulas?',
    options: [
      'Almacenar como referencia estática',
      'Definir RAII con Drop y contrato de ownership C documentado',
      'Llamar free de Rust sin verificar el asignador',
    ],
    recommended: 'b',
    reason:
      'La frontera FFI debe respetar quién asigna y quién libera; Drop puede modelar ownership si el contrato lo permite.',
    timeline: [
      'Lectura del header C',
      'Identificación de allocator/deallocator',
      'Prueba de ida y vuelta en la frontera',
    ],
  },
  S06: {
    question:
      'Un servicio presenta deadlocks intermitentes; ¿cuál es el primer cambio responsable?',
    options: [
      'Añadir Mutex en todas partes',
      'Pasar todo a unsafe',
      'Reproducir el orden de locks, medir contención y definir jerarquía',
    ],
    recommended: 'c',
    reason:
      'El orden de adquisición y el alcance de locks deben verificarse con pruebas de concurrencia.',
    timeline: [
      'Alerta: requests bloqueadas',
      'Captura de orden de locks',
      'Reproducción y prueba de estrés',
    ],
  },
  S07: {
    question: 'Tokio deja tasks vivas tras cerrar el servicio; ¿qué haces?',
    options: [
      'Rastrear JoinHandles, propagar cancelación y esperar shutdown con timeout',
      'Lanzar tasks con spawn y olvidarlas',
      'Abortar todas las tasks sin revisar persistencia',
    ],
    recommended: 'a',
    reason:
      'La cancelación cooperativa y join de tareas son parte de la propiedad del ciclo de vida; abortar sin analizar efectos puede perder datos.',
    timeline: [
      'Shutdown solicitado',
      'Tasks activas sin owner',
      'Cancelación coordinada, join y test de cierre',
    ],
  },
  S08: {
    question:
      'La latencia p99 empeora tras una optimización no medida; ¿cómo actúas?',
    options: [
      'Cambiar el allocator sin medición',
      'Repetir benchmarks bajo carga comparable y perfilar el cuello de botella',
      'Eliminar tests lentos',
    ],
    recommended: 'b',
    reason:
      'La optimización se basa en medidas reproducibles y regresiones documentadas.',
    timeline: [
      'p99 empeora',
      'Benchmark con carga controlada',
      'Perfil CPU/allocs antes y después',
    ],
  },
  S09: {
    question:
      'Un consumidor recibe el mismo evento dos veces; ¿qué contrato ayuda?',
    options: [
      'Suponer exactly-once en toda la red',
      'Deshabilitar reintentos',
      'Definir clave idempotente, deduplicación y política de reintentos',
    ],
    recommended: 'c',
    reason:
      'La entrega duplicada debe contemplarse y el efecto de negocio debe ser idempotente cuando corresponda.',
    timeline: [
      'Duplicado detectado',
      'Correlación por idempotency key',
      'Test de replay',
    ],
  },
  S10: {
    question:
      'Dos peticiones compran el último artículo a la vez; ¿qué priorizas?',
    options: [
      'Transacción y control de concurrencia con invariante de stock',
      'Cachear el stock sin transacciones',
      'Añadir sleep entre peticiones',
    ],
    recommended: 'a',
    reason:
      'La consistencia requiere una operación atómica y test de carrera sobre el invariante de dominio.',
    timeline: [
      'Inventario negativo',
      'Análisis de aislamiento',
      'Test de compradores concurrentes',
    ],
  },
  S11: {
    question:
      'Una cola ilimitada agota memoria durante un pico; ¿qué implementas?',
    options: [
      'Aumentar RAM indefinidamente',
      'Límites de cola, backpressure y políticas de rechazo/reintento',
      'Crear más tasks sin límite',
    ],
    recommended: 'b',
    reason:
      'El sistema necesita límites explícitos, señales al productor y observabilidad.',
    timeline: [
      'Cola crece',
      'Se identifica falta de límites',
      'Se ejercita saturación y rechazo controlado',
    ],
  },
  S12: {
    question:
      'Un endpoint permite consultar datos de otra cuenta; ¿qué corriges?',
    options: [
      'Ocultar el botón del frontend',
      'Cambiar a GET',
      'Verificar autorización por recurso en servidor y probar casos negativos',
    ],
    recommended: 'c',
    reason:
      'El control de autorización debe verificarse para el recurso, independientemente de la UI.',
    timeline: [
      'Acceso cruzado reportado',
      'Análisis IDOR',
      'Test de usuario no autorizado',
    ],
  },
  S13: {
    question:
      'Un parser pasa ejemplos conocidos pero falla con entradas aleatorias; ¿qué haces?',
    options: [
      'Crear propiedades, corpus de regresión y fuzzing reproducible',
      'Deshabilitar tests aleatorios',
      'Probar solo happy path',
    ],
    recommended: 'a',
    reason:
      'Las propiedades y el corpus mínimo amplían los casos que las pruebas de ejemplo no cubren.',
    timeline: [
      'Fallo con entrada inesperada',
      'Reducción de caso mínimo',
      'Propiedad incorporada a CI cuando sea viable',
    ],
  },
  S14: {
    question: 'Aumenta p99 y el pool de conexiones se satura; ¿primera acción?',
    options: [
      'Reiniciar sin conservar evidencia',
      'Correlacionar métricas, trazas y logs antes de mitigar',
      'Deshabilitar alertas',
    ],
    recommended: 'b',
    reason:
      'El diagnóstico necesita correlación, impacto y mitigación medible sin ocultar señales.',
    timeline: [
      '14:02 WARN p99 1800ms',
      '14:03 ERROR pool timeout',
      '14:04 INFO correlación por trace_id',
      '14:05 Mitigación supervisada',
    ],
  },
  S15: {
    question:
      'Un cambio de esquema podría bloquear una release; ¿cómo despliegas?',
    options: [
      'Migración irreversible en producción sin ensayo',
      'Eliminar backup',
      'Migración compatible y reversible con gates y rollback ensayado',
    ],
    recommended: 'c',
    reason:
      'Expand/contract y rollback probado reducen riesgo en cambios de contrato persistente.',
    timeline: [
      'Plan de despliegue',
      'Prueba de rollback',
      'Gate de migración y monitoreo',
    ],
  },
  S16: {
    question:
      'Debes modernizar un servicio sin romper consumidores; ¿qué propones?',
    options: [
      'Crear tests de contrato, migrar por incrementos y medir regresiones',
      'Reescribir todo sin pruebas',
      'Cambiar formato de respuesta sin aviso',
    ],
    recommended: 'a',
    reason: 'Las migraciones graduales protegen el comportamiento observable.',
    timeline: [
      'Inventario de contratos',
      'Tests golden',
      'Migración progresiva y rollback',
    ],
  },
  S17: {
    question:
      'Un PR introduce complejidad no justificada; ¿qué hace el reviewer?',
    options: [
      'Rechazar sin explicación',
      'Explicar riesgos, pedir evidencia y proponer alternativa mínima',
      'Aprobar por seniority del autor',
    ],
    recommended: 'b',
    reason:
      'El feedback profesional exige criterios concretos, pruebas y trade-offs.',
    timeline: [
      'Diff identificado',
      'Comentario accionable',
      'ADR solo si decisión difícil de revertir',
    ],
  },
  S18: {
    question: 'Diseñas una plataforma multi-servicio; ¿cómo comienzas?',
    options: [
      'Elegir Kubernetes y Kafka automáticamente',
      'Dividir en 20 microservicios desde el principio',
      'Fijar SLO, carga, consistencia, riesgos y arquitectura mínima viable',
    ],
    recommended: 'c',
    reason:
      'Los requisitos medibles y restricciones son la base del diseño; infraestructura no equivale a arquitectura.',
    timeline: [
      'Requisitos y restricciones',
      'Modelo de capacidad',
      'ADR + pruebas de resiliencia',
    ],
  },
};
export function getScenario(challenge: ChallengeBrief): DecisionCase {
  const value = cases[challenge.moduleId];
  if (!value) throw Error('Escenario Senior desconocido');
  return value;
}
export function scenarioCount() {
  return Object.keys(cases).length;
}
