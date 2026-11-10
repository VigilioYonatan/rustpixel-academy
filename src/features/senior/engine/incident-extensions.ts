import type { IncidentDefinition } from './incident';
/** Escenarios educativos deterministas; no realizan llamadas reales a infraestructura. */
export type AdditionalIncidentId =
  | 'S01'
  | 'S02'
  | 'S03'
  | 'S05'
  | 'S08'
  | 'S10'
  | 'S11'
  | 'S13'
  | 'S15'
  | 'S16'
  | 'S17'
  | 'S18';
export const ADDITIONAL_INCIDENTS: Record<
  AdditionalIncidentId,
  IncidentDefinition
> = {
  S01: {
    id: 'S01',
    title: 'Clones excesivos en parser Rust',
    signals: [
      'allocations_per_sec=25000',
      'clone_hotspot=parser::normalize',
      'p99_ms=41',
    ],
    steps: [
      {
        title: 'Diagnóstico',
        event:
          'Un parser crea String nuevos incluso cuando solo necesita leer un campo.',
        options: [
          'Cambiar todo a &str sin revisar propietarios',
          'Capturar perfil de asignaciones y localizar la copia dominante',
          'Aplicar transmute para evitar el allocator',
        ],
        correct: 1,
        feedback: [
          'Riesgo en diagnóstico: Cambiar todo a &str sin revisar propietarios. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Elección de referencia: Capturar perfil de asignaciones y localizar la copia dominante. Explicita el invariante y verifica su efecto con el caso adverso.',
          'Riesgo en diagnóstico: Aplicar transmute para evitar el allocator. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
        ],
      },
      {
        title: 'Remediación',
        event:
          'La función devuelve datos derivados de un buffer cuyo ciclo de vida es conocido.',
        options: [
          'Usar préstamos acotados o Cow cuando justifique el contrato',
          'Convertir el input a static',
          'Eliminar el test que falla por lifetime',
        ],
        correct: 0,
        feedback: [
          'Elección de referencia: Usar préstamos acotados o Cow cuando justifique el contrato. Explicita el invariante y verifica su efecto con el caso adverso.',
          'Riesgo en remediación: Convertir el input a static. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Riesgo en remediación: Eliminar el test que falla por lifetime. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
        ],
      },
      {
        title: 'Demostración',
        event:
          'El cambio parece disminuir las asignaciones en el caso habitual.',
        options: [
          'Afirmar mejora por intuición',
          'Desactivar medición de heap',
          'Comparar benchmark reproducible y pruebas de ownership',
        ],
        correct: 2,
        feedback: [
          'Riesgo en demostración: Afirmar mejora por intuición. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Riesgo en demostración: Desactivar medición de heap. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Elección de referencia: Comparar benchmark reproducible y pruebas de ownership. Explicita el invariante y verifica su efecto con el caso adverso.',
        ],
      },
    ],
  },
  S02: {
    id: 'S02',
    title: 'Dependencias cíclicas entre crates',
    signals: [
      'cargo_metadata=cycle_detected',
      'crate_count=14',
      'changeset_modules=9',
    ],
    steps: [
      {
        title: 'Triage',
        event:
          'Tres crates se importan mutuamente por tipos públicos y servicios.',
        options: [
          'Aumentar el número de crates',
          'Mapear dependencias y dueño del contrato con cargo metadata',
          'Usar imports dinámicos',
        ],
        correct: 1,
        feedback: [
          'Riesgo en triage: Aumentar el número de crates. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Elección de referencia: Mapear dependencias y dueño del contrato con cargo metadata. Explicita el invariante y verifica su efecto con el caso adverso.',
          'Riesgo en triage: Usar imports dinámicos. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
        ],
      },
      {
        title: 'Diseño',
        event:
          'La dependencia de infraestructura conoce accidentalmente tipos internos del dominio.',
        options: [
          'Mover interfaces mínimas al dueño del contrato y romper ciclo',
          'Duplicar cada definición pública',
          'Introducir dependencia desde domain hacia adapters',
        ],
        correct: 0,
        feedback: [
          'Elección de referencia: Mover interfaces mínimas al dueño del contrato y romper ciclo. Explicita el invariante y verifica su efecto con el caso adverso.',
          'Riesgo en diseño: Duplicar cada definición pública. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Riesgo en diseño: Introducir dependencia desde domain hacia adapters. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
        ],
      },
      {
        title: 'Control',
        event: 'El grafo parece acíclico tras la reorganización.',
        options: [
          'No revisar tests de consumidores',
          'Eliminar pruebas de integración',
          'Revalidar APIs públicas, tests y grafo completo',
        ],
        correct: 2,
        feedback: [
          'Riesgo en control: No revisar tests de consumidores. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Riesgo en control: Eliminar pruebas de integración. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Elección de referencia: Revalidar APIs públicas, tests y grafo completo. Explicita el invariante y verifica su efecto con el caso adverso.',
        ],
      },
    ],
  },
  S03: {
    id: 'S03',
    title: 'Pánico de API ante entradas inválidas',
    signals: ['panic_count=18', 'endpoint=/v1/parse', 'consumer_versions=3'],
    steps: [
      {
        title: 'Triage',
        event:
          'Una entrada malformada provoca panic! en código de librería reutilizada.',
        options: [
          'Ignorar porque compila',
          'Reproducir entrada, identificar contrato y consumidores',
          'Capturar panic y devolver siempre éxito',
        ],
        correct: 1,
        feedback: [
          'Riesgo en triage: Ignorar porque compila. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Elección de referencia: Reproducir entrada, identificar contrato y consumidores. Explicita el invariante y verifica su efecto con el caso adverso.',
          'Riesgo en triage: Capturar panic y devolver siempre éxito. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
        ],
      },
      {
        title: 'Contrato',
        event:
          'El error debe propagarse y preservarse la compatibilidad observable.',
        options: [
          'Definir Result con errores tipados y estrategia de migración',
          'Eliminar comprobaciones de entrada',
          'Romper API pública sin aviso',
        ],
        correct: 0,
        feedback: [
          'Elección de referencia: Definir Result con errores tipados y estrategia de migración. Explicita el invariante y verifica su efecto con el caso adverso.',
          'Riesgo en contrato: Eliminar comprobaciones de entrada. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Riesgo en contrato: Romper API pública sin aviso. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
        ],
      },
      {
        title: 'Regresión',
        event: 'Un consumidor antiguo depende del comportamiento documentado.',
        options: [
          'Probar solo el camino feliz',
          'Rechazar cualquier versión anterior',
          'Añadir pruebas de contrato y migración verificable',
        ],
        correct: 2,
        feedback: [
          'Riesgo en regresión: Probar solo el camino feliz. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Riesgo en regresión: Rechazar cualquier versión anterior. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Elección de referencia: Añadir pruebas de contrato y migración verificable. Explicita el invariante y verifica su efecto con el caso adverso.',
        ],
      },
    ],
  },
  S05: {
    id: 'S05',
    title: 'Puntero FFI liberado con allocator incorrecto',
    signals: [
      'ffi_boundary=libc',
      'reported_double_free=1',
      'ownership=undocumented',
    ],
    steps: [
      {
        title: 'Diagnóstico',
        event:
          'Una librería C devuelve punteros que Rust libera usando el allocator incorrecto.',
        options: [
          'Cambiar a un puntero null',
          'Verificar ABI, asignador y función oficial de liberación',
          'Convertir el puntero a &static',
        ],
        correct: 1,
        feedback: [
          'Riesgo en diagnóstico: Cambiar a un puntero null. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Elección de referencia: Verificar ABI, asignador y función oficial de liberación. Explicita el invariante y verifica su efecto con el caso adverso.',
          'Riesgo en diagnóstico: Convertir el puntero a &static. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
        ],
      },
      {
        title: 'Encapsulación',
        event:
          'El recurso puede cerrarse explícitamente por la librería de origen.',
        options: [
          'Crear wrapper RAII con Drop llamando al destructor correcto',
          'Invocar Box::from_raw sin comprobar el contrato',
          'Ignorar el ciclo de vida al cancelar',
        ],
        correct: 0,
        feedback: [
          'Elección de referencia: Crear wrapper RAII con Drop llamando al destructor correcto. Explicita el invariante y verifica su efecto con el caso adverso.',
          'Riesgo en encapsulación: Invocar Box::from_raw sin comprobar el contrato. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Riesgo en encapsulación: Ignorar el ciclo de vida al cancelar. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
        ],
      },
      {
        title: 'Verificación',
        event: 'El wrapper ahora se usa desde llamadas con errores.',
        options: [
          'Medir únicamente el happy path',
          'Suprimir errores de linking',
          'Probar error/Drop, frontera ABI y memory checker disponible',
        ],
        correct: 2,
        feedback: [
          'Riesgo en verificación: Medir únicamente el happy path. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Riesgo en verificación: Suprimir errores de linking. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Elección de referencia: Probar error/Drop, frontera ABI y memory checker disponible. Explicita el invariante y verifica su efecto con el caso adverso.',
        ],
      },
    ],
  },
  S08: {
    id: 'S08',
    title: 'Regresión de p99 después de optimizar',
    signals: ['p99_before=25ms', 'p99_after=37ms', 'load_profile=uncontrolled'],
    steps: [
      {
        title: 'Triage',
        event: 'Una optimización reduce microbenchmarks pero empeora p99.',
        options: [
          'Declarar éxito por promedio',
          'Capturar carga comparable, CPU y asignaciones por operación',
          'Cambiar de allocator sin perfil',
        ],
        correct: 1,
        feedback: [
          'Riesgo en triage: Declarar éxito por promedio. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Elección de referencia: Capturar carga comparable, CPU y asignaciones por operación. Explicita el invariante y verifica su efecto con el caso adverso.',
          'Riesgo en triage: Cambiar de allocator sin perfil. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
        ],
      },
      {
        title: 'Investigación',
        event: 'Se descubre contención en una estructura compartida.',
        options: [
          'Eliminar la contención con cambio mínimo y benchmark repetible',
          'Reducir el timeout artificialmente',
          'Ocultar p99 del tablero',
        ],
        correct: 0,
        feedback: [
          'Elección de referencia: Eliminar la contención con cambio mínimo y benchmark repetible. Explicita el invariante y verifica su efecto con el caso adverso.',
          'Riesgo en investigación: Reducir el timeout artificialmente. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Riesgo en investigación: Ocultar p99 del tablero. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
        ],
      },
      {
        title: 'Release',
        event: 'Los cambios muestran mejora con dos ejecuciones.',
        options: [
          'Aprobar con una única medición',
          'Suprimir resultados negativos',
          'Repetir ensayos, documentar variabilidad y rollback',
        ],
        correct: 2,
        feedback: [
          'Riesgo en release: Aprobar con una única medición. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Riesgo en release: Suprimir resultados negativos. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Elección de referencia: Repetir ensayos, documentar variabilidad y rollback. Explicita el invariante y verifica su efecto con el caso adverso.',
        ],
      },
    ],
  },
  S10: {
    id: 'S10',
    title: 'Inventario vendido dos veces',
    signals: ['inventory=1', 'purchase_requests=2', 'confirmed_orders=2'],
    steps: [
      {
        title: 'Triage',
        event:
          'Dos peticiones concurrentes venden la última unidad de inventario.',
        options: [
          'Añadir sleep entre requests',
          'Reproducir la carrera y revisar aislamiento de transacciones',
          'Cachear stock y confiar en el caché',
        ],
        correct: 1,
        feedback: [
          'Riesgo en triage: Añadir sleep entre requests. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Elección de referencia: Reproducir la carrera y revisar aislamiento de transacciones. Explicita el invariante y verifica su efecto con el caso adverso.',
          'Riesgo en triage: Cachear stock y confiar en el caché. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
        ],
      },
      {
        title: 'Corrección',
        event: 'La lectura y escritura de inventario no son atómicas.',
        options: [
          'Aplicar actualización condicional o locking transaccional con invariante',
          'Leer stock fuera de transacción',
          'Desactivar retries para todos',
        ],
        correct: 0,
        feedback: [
          'Elección de referencia: Aplicar actualización condicional o locking transaccional con invariante. Explicita el invariante y verifica su efecto con el caso adverso.',
          'Riesgo en corrección: Leer stock fuera de transacción. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Riesgo en corrección: Desactivar retries para todos. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
        ],
      },
      {
        title: 'Prueba',
        event: 'La corrección se aplica a un único SKU.',
        options: [
          'Suponer que todos los SKU quedan protegidos',
          'Validar sólo sin concurrencia',
          'Ejecutar transacciones concurrentes, rollback y casos límite',
        ],
        correct: 2,
        feedback: [
          'Riesgo en prueba: Suponer que todos los SKU quedan protegidos. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Riesgo en prueba: Validar sólo sin concurrencia. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Elección de referencia: Ejecutar transacciones concurrentes, rollback y casos límite. Explicita el invariante y verifica su efecto con el caso adverso.',
        ],
      },
    ],
  },
  S11: {
    id: 'S11',
    title: 'Cola sin límites causa agotamiento de memoria',
    signals: ['queued=980000', 'producer_rps=9000', 'consumer_rps=700'],
    steps: [
      {
        title: 'Diagnóstico',
        event: 'La memoria crece mientras productores superan consumidores.',
        options: [
          'Añadir memoria sin límites',
          'Medir backlog, tasas y retención por tarea',
          'Aumentar spawn sin control',
        ],
        correct: 1,
        feedback: [
          'Riesgo en diagnóstico: Añadir memoria sin límites. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Elección de referencia: Medir backlog, tasas y retención por tarea. Explicita el invariante y verifica su efecto con el caso adverso.',
          'Riesgo en diagnóstico: Aumentar spawn sin control. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
        ],
      },
      {
        title: 'Control de carga',
        event: 'El sistema acepta trabajo sin mecanismo de presión.',
        options: [
          'Introducir cola acotada, política de admisión y señales de rechazo',
          'Cambiar a una cola ilimitada distinta',
          'Dormir todos los workers para reducir CPU',
        ],
        correct: 0,
        feedback: [
          'Elección de referencia: Introducir cola acotada, política de admisión y señales de rechazo. Explicita el invariante y verifica su efecto con el caso adverso.',
          'Riesgo en control de carga: Cambiar a una cola ilimitada distinta. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Riesgo en control de carga: Dormir todos los workers para reducir CPU. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
        ],
      },
      {
        title: 'Recuperación',
        event: 'La cola vuelve a un tamaño razonable.',
        options: [
          'Cerrar incidente al ver menos RAM',
          'Desactivar alarma de saturación',
          'Probar picos, cancelación y caída aguas abajo',
        ],
        correct: 2,
        feedback: [
          'Riesgo en recuperación: Cerrar incidente al ver menos RAM. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Riesgo en recuperación: Desactivar alarma de saturación. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Elección de referencia: Probar picos, cancelación y caída aguas abajo. Explicita el invariante y verifica su efecto con el caso adverso.',
        ],
      },
    ],
  },
  S13: {
    id: 'S13',
    title: 'Parser falla con entradas fuzz',
    signals: ['crash_input=0x00ff', 'regressions=3', 'fuzz_cases=10000'],
    steps: [
      {
        title: 'Reproducción',
        event: 'Fuzzing encuentra panic! con bytes malformados.',
        options: [
          'Suprimir input del corpus',
          'Minimizar caso y reproducir con semillas fijas',
          'Desactivar sanitizer',
        ],
        correct: 1,
        feedback: [
          'Riesgo en reproducción: Suprimir input del corpus. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Elección de referencia: Minimizar caso y reproducir con semillas fijas. Explicita el invariante y verifica su efecto con el caso adverso.',
          'Riesgo en reproducción: Desactivar sanitizer. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
        ],
      },
      {
        title: 'Endurecimiento',
        event: 'El parser toma slices usando offsets calculados.',
        options: [
          'Comprobar límites y diseñar propiedad sin panics',
          'Capturar cualquier error sin inspección',
          'Usar unchecked para acelerar',
        ],
        correct: 0,
        feedback: [
          'Elección de referencia: Comprobar límites y diseñar propiedad sin panics. Explicita el invariante y verifica su efecto con el caso adverso.',
          'Riesgo en endurecimiento: Capturar cualquier error sin inspección. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Riesgo en endurecimiento: Usar unchecked para acelerar. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
        ],
      },
      {
        title: 'Prueba',
        event: 'La corrección pasa el caso reportado.',
        options: [
          'Borrar corpus de regresión',
          'Probar únicamente texto ASCII válido',
          'Incorporar corpus, propiedades y fuzzing periódico',
        ],
        correct: 2,
        feedback: [
          'Riesgo en prueba: Borrar corpus de regresión. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Riesgo en prueba: Probar únicamente texto ASCII válido. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Elección de referencia: Incorporar corpus, propiedades y fuzzing periódico. Explicita el invariante y verifica su efecto con el caso adverso.',
        ],
      },
    ],
  },
  S15: {
    id: 'S15',
    title: 'Despliegue rompe versión anterior',
    signals: ['db_schema=v3', 'service_old=v2', 'rollback_window=30m'],
    steps: [
      {
        title: 'Triage',
        event:
          'La nueva migración elimina una columna todavía usada por instancias antiguas.',
        options: [
          'Forzar actualización sin plan',
          'Identificar contrato de lectura y orden de despliegue',
          'Desactivar todos los health checks',
        ],
        correct: 1,
        feedback: [
          'Riesgo en triage: Forzar actualización sin plan. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Elección de referencia: Identificar contrato de lectura y orden de despliegue. Explicita el invariante y verifica su efecto con el caso adverso.',
          'Riesgo en triage: Desactivar todos los health checks. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
        ],
      },
      {
        title: 'Entrega',
        event: 'La aplicación nueva requiere un campo adicional.',
        options: [
          'Diseñar expand/contract compatible y plan de rollback',
          'Eliminar la columna inmediatamente',
          'Crear migración irreversible directa',
        ],
        correct: 0,
        feedback: [
          'Elección de referencia: Diseñar expand/contract compatible y plan de rollback. Explicita el invariante y verifica su efecto con el caso adverso.',
          'Riesgo en entrega: Eliminar la columna inmediatamente. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Riesgo en entrega: Crear migración irreversible directa. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
        ],
      },
      {
        title: 'Comprobación',
        event:
          'El canary nuevo funciona, pero parte del tráfico usa instancias antiguas.',
        options: [
          'Actualizar cien por ciento sin medir',
          'Ignorar logs de las instancias antiguas',
          'Ejecutar compatibilidad, canary, rollback y métricas de error',
        ],
        correct: 2,
        feedback: [
          'Riesgo en comprobación: Actualizar cien por ciento sin medir. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Riesgo en comprobación: Ignorar logs de las instancias antiguas. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Elección de referencia: Ejecutar compatibilidad, canary, rollback y métricas de error. Explicita el invariante y verifica su efecto con el caso adverso.',
        ],
      },
    ],
  },
  S16: {
    id: 'S16',
    title: 'Migración de API rompe consumidores',
    signals: ['consumer_legacy=7', 'response_field=status', 'new_field=state'],
    steps: [
      {
        title: 'Diagnóstico',
        event:
          'Clientes activos siguen deserializando status pero el nuevo código emite state.',
        options: [
          'Culpar a clientes',
          'Inventariar contrato y reproducir clientes antiguos',
          'Devolver {} en lugar de respuesta',
        ],
        correct: 1,
        feedback: [
          'Riesgo en diagnóstico: Culpar a clientes. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Elección de referencia: Inventariar contrato y reproducir clientes antiguos. Explicita el invariante y verifica su efecto con el caso adverso.',
          'Riesgo en diagnóstico: Devolver {} en lugar de respuesta. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
        ],
      },
      {
        title: 'Evolución',
        event: 'El nuevo formato tiene beneficios pero exige migración.',
        options: [
          'Mantener compatibilidad temporal y versionar cambio',
          'Borrar los consumidores antiguos',
          'Renombrar sin periodo de transición',
        ],
        correct: 0,
        feedback: [
          'Elección de referencia: Mantener compatibilidad temporal y versionar cambio. Explicita el invariante y verifica su efecto con el caso adverso.',
          'Riesgo en evolución: Borrar los consumidores antiguos. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Riesgo en evolución: Renombrar sin periodo de transición. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
        ],
      },
      {
        title: 'Validación',
        event: 'Los dos contratos conviven durante un periodo definido.',
        options: [
          'Dejar modo dual sin observabilidad',
          'No comunicar deprecación',
          'Aplicar contract tests, métricas de uso y plan de retirada',
        ],
        correct: 2,
        feedback: [
          'Riesgo en validación: Dejar modo dual sin observabilidad. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Riesgo en validación: No comunicar deprecación. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Elección de referencia: Aplicar contract tests, métricas de uso y plan de retirada. Explicita el invariante y verifica su efecto con el caso adverso.',
        ],
      },
    ],
  },
  S17: {
    id: 'S17',
    title: 'Revisión de cambios con reintentos peligrosos',
    signals: ['pull_request=418', 'retry_count=9999', 'panic_on_failure=true'],
    steps: [
      {
        title: 'Hallazgo',
        event:
          'Un PR introduce retries ilimitados y panic ante servicio externo caído.',
        options: [
          'Aprobar porque tests verdes',
          'Describir impacto y reproducir saturación con fixture',
          'Añadir un tercer bucle de retry',
        ],
        correct: 1,
        feedback: [
          'Riesgo en hallazgo: Aprobar porque tests verdes. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Elección de referencia: Describir impacto y reproducir saturación con fixture. Explicita el invariante y verifica su efecto con el caso adverso.',
          'Riesgo en hallazgo: Añadir un tercer bucle de retry. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
        ],
      },
      {
        title: 'Revisión',
        event: 'El autor propone reintentar cualquier error.',
        options: [
          'Solicitar clasificación de errores, límites, jitter y señales',
          'Rechazar sin explicación',
          'Subir timeout infinito',
        ],
        correct: 0,
        feedback: [
          'Elección de referencia: Solicitar clasificación de errores, límites, jitter y señales. Explicita el invariante y verifica su efecto con el caso adverso.',
          'Riesgo en revisión: Rechazar sin explicación. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Riesgo en revisión: Subir timeout infinito. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
        ],
      },
      {
        title: 'Evidencia',
        event:
          'El cambio reduce fallos transitorios pero aún necesita pruebas de picos.',
        options: [
          'Cerrar PR sin pruebas',
          'Borrar benchmarking',
          'Solicitar test de saturación, backpressure y rollback',
        ],
        correct: 2,
        feedback: [
          'Riesgo en evidencia: Cerrar PR sin pruebas. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Riesgo en evidencia: Borrar benchmarking. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Elección de referencia: Solicitar test de saturación, backpressure y rollback. Explicita el invariante y verifica su efecto con el caso adverso.',
        ],
      },
    ],
  },
  S18: {
    id: 'S18',
    title: 'Diseño sin SLO ni capacidad',
    signals: [
      'requirements=unbounded',
      'peak_qps=unknown',
      'recovery_target=unknown',
    ],
    steps: [
      {
        title: 'Requisitos',
        event:
          'Se propone dividir en doce microservicios sin estimaciones de carga.',
        options: [
          'Seleccionar Kafka inmediatamente',
          'Recabar carga, latencias, SLO, consistencia y presupuesto',
          'Añadir microservicios hasta evitar problemas',
        ],
        correct: 1,
        feedback: [
          'Riesgo en requisitos: Seleccionar Kafka inmediatamente. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Elección de referencia: Recabar carga, latencias, SLO, consistencia y presupuesto. Explicita el invariante y verifica su efecto con el caso adverso.',
          'Riesgo en requisitos: Añadir microservicios hasta evitar problemas. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
        ],
      },
      {
        title: 'Topología',
        event:
          'El caso solo necesita un proceso y una cola persistente para empezar.',
        options: [
          'Proponer arquitectura mínima con límites claros y evolución incremental',
          'Introducir orquestación global de entrada',
          'Evitar todos los tests de fallo',
        ],
        correct: 0,
        feedback: [
          'Elección de referencia: Proponer arquitectura mínima con límites claros y evolución incremental. Explicita el invariante y verifica su efecto con el caso adverso.',
          'Riesgo en topología: Introducir orquestación global de entrada. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Riesgo en topología: Evitar todos los tests de fallo. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
        ],
      },
      {
        title: 'Defensa',
        event: 'Se documenta la topología mínima.',
        options: [
          'Marcar completado sin mediciones',
          'Usar ADR sin alternativas',
          'Defender ADR, capacidad, fallos, costos y migración',
        ],
        correct: 2,
        feedback: [
          'Riesgo en defensa: Marcar completado sin mediciones. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Riesgo en defensa: Usar ADR sin alternativas. No garantiza la corrección del escenario; examina el contrato y su evidencia.',
          'Elección de referencia: Defender ADR, capacidad, fallos, costos y migración. Explicita el invariante y verifica su efecto con el caso adverso.',
        ],
      },
    ],
  },
};
