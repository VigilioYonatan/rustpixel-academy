import { ADDITIONAL_INCIDENTS } from './incident-extensions';
/** Deterministic educational incident engine. No real services are contacted. */
export type IncidentId =
  | 'S01'
  | 'S02'
  | 'S03'
  | 'S04'
  | 'S05'
  | 'S06'
  | 'S07'
  | 'S08'
  | 'S09'
  | 'S10'
  | 'S11'
  | 'S12'
  | 'S13'
  | 'S14'
  | 'S15'
  | 'S16'
  | 'S17'
  | 'S18';
export type IncidentState =
  | 'investigating'
  | 'mitigating'
  | 'resolved'
  | 'failed';
export interface IncidentStep {
  title: string;
  event: string;
  options: readonly [string, string, string];
  correct: 0 | 1 | 2;
  feedback: readonly [string, string, string];
}
export interface IncidentDefinition {
  id: IncidentId;
  title: string;
  signals: readonly string[];
  steps: readonly IncidentStep[];
}
export interface IncidentRun {
  id: IncidentId;
  step: number;
  choices: number[];
  status: IncidentState;
}
export const INCIDENTS: Record<IncidentId, IncidentDefinition> = {
  ...ADDITIONAL_INCIDENTS,
  S04: {
    id: 'S04',
    title: 'Auditoría de memoria unsafe',
    signals: [
      'unsafe_blocks=4',
      'miri_report=undefined_behavior',
      'pointer_lifetime=unknown',
    ],
    steps: [
      {
        title: 'Triage',
        event:
          'Una función devuelve un slice sin asociar la vida útil de los bytes a un dueño válido.',
        options: [
          'Añadir comentarios sin cambiar contratos',
          'Delimitar precondiciones y reproducir con Miri en entorno controlado',
          'Desactivar las comprobaciones de memoria',
        ],
        correct: 1,
        feedback: [
          'Los comentarios no demuestran soundness',
          'Identifica invariantes y establece una reproducción revisable',
          'Elimina evidencia de una vulnerabilidad',
        ],
      },
      {
        title: 'Remediación',
        event: 'La API permite crear referencias a memoria ya liberada.',
        options: [
          'Reformular la interfaz con ownership o lifetime unido al buffer',
          'Introducir transmute para silenciar rustc',
          'Convertir los errores en panic',
        ],
        correct: 0,
        feedback: [
          'La seguridad se expresa mediante el contrato público',
          'Transmute no prueba validez',
          'Un panic no repara UB',
        ],
      },
      {
        title: 'Regresión',
        event: 'La firma propuesta evita el caso original.',
        options: [
          'Declarar éxito solo con cargo check',
          'No probar entradas límite',
          'Añadir pruebas adversarias, Miri y documentar invariantes',
        ],
        correct: 2,
        feedback: [
          'El typecheck no detecta todo UB',
          'Omite casos de borde',
          'Refuerza las garantías y limita alcance unsafe',
        ],
      },
    ],
  },
  S06: {
    id: 'S06',
    title: 'Deadlock intermitente en worker pool',
    signals: [
      'workers_blocked=12',
      'lock_orders_wait=11',
      'lock_inventory_wait=10',
    ],
    steps: [
      {
        title: 'Triage',
        event: 'Las tareas bloqueadas adquieren locks en orden inverso.',
        options: [
          'Duplicar workers',
          'Recopilar el orden de adquisición y reproducir en test controlado',
          'Aumentar tiempo de espera indefinidamente',
        ],
        correct: 1,
        feedback: [
          'Aumenta la contención',
          'Permite localizar una inversión de locks',
          'Oculta un bloqueo circular',
        ],
      },
      {
        title: 'Corrección',
        event: 'Dos rutas de código acceden a orders e inventory.',
        options: [
          'Definir un orden global de adquisición y reducir el alcance de locks',
          'Introducir un tercer mutex global sin análisis',
          'Usar sleeps aleatorios',
        ],
        correct: 0,
        feedback: [
          'Establece un invariante demostrable',
          'Puede introducir más contención',
          'No evita el ciclo de espera',
        ],
      },
      {
        title: 'Verificación',
        event: 'La presión se reduce tras corregir el orden.',
        options: [
          'Cerrar el incidente con una sola ejecución',
          'Desactivar tests de carrera',
          'Probar interleavings, contención y tiempos límite',
        ],
        correct: 2,
        feedback: [
          'No demuestra ausencia de regresión',
          'Reduce cobertura crítica',
          'Verifica el contrato de concurrencia',
        ],
      },
    ],
  },
  S09: {
    id: 'S09',
    title: 'Evento duplicado en sistema distribuido',
    signals: ['event_id=evt-31', 'retries=4', 'side_effects=2'],
    steps: [
      {
        title: 'Diagnóstico',
        event:
          'El consumidor procesa dos veces una misma confirmación de pago.',
        options: [
          'Eliminar reintentos por completo',
          'Rastrear event_id, confirmación y transacción alrededor del efecto',
          'Confiar en orden de llegada',
        ],
        correct: 1,
        feedback: [
          'Pierde resiliencia ante fallos',
          'Encuentra las condiciones exactas del duplicado',
          'La entrega puede repetirse',
        ],
      },
      {
        title: 'Mitigación',
        event: 'El broker puede entregar al menos una vez.',
        options: [
          'Aplicar deduplicación transaccional por clave de idempotencia',
          'Suponer exactly once extremo a extremo',
          'Usar un contador en memoria sin persistencia',
        ],
        correct: 0,
        feedback: [
          'Evita efectos duplicados incluso con reintentos',
          'La garantía es demasiado amplia',
          'Se pierde al reiniciar o escalar',
        ],
      },
      {
        title: 'Validación',
        event: 'La implementación incorpora un registro de eventos procesados.',
        options: [
          'Probar solo una primera entrega',
          'Aumentar el timeout del broker',
          'Probar replay, concurrencia y crash antes/después del commit',
        ],
        correct: 2,
        feedback: [
          'No cubre duplicación',
          'No repara consistencia',
          'Comprueba el límite transaccional',
        ],
      },
    ],
  },
  S07: {
    id: 'S07',
    title: 'Tasks huérfanas tras apagar Tokio',
    signals: [
      'shutdown_started=true',
      'active_tasks=234',
      'queue_depth=800/800',
    ],
    steps: [
      {
        title: 'Triage',
        event:
          'El proceso recibe SIGTERM, pero las tasks mantienen conexiones activas.',
        options: [
          'Abortar todas sin esperar',
          'Registrar task owners y rastrear JoinHandles',
          'Crear tasks nuevas para drenar',
        ],
        correct: 1,
        feedback: [
          'No garantiza flush ni integridad',
          'Identifica propietarios y permite coordinar el cierre',
          'Aumenta la saturación',
        ],
      },
      {
        title: 'Mitigación',
        event:
          'Las tareas están esperando en una cola que sigue aceptando trabajos.',
        options: [
          'Cerrar admisión, cancelar y drenar con deadline',
          'Aumentar cola a un millón',
          'Ignorar los errores de JoinHandle',
        ],
        correct: 0,
        feedback: [
          'Define una frontera de cierre verificable',
          'Oculta el fallo y aumenta memoria',
          'Pierde evidencia de fallos',
        ],
      },
      {
        title: 'Verificación',
        event: 'El servicio termina, pero hay riesgo de trabajo perdido.',
        options: [
          'Declarar éxito por ver 0 tasks',
          'Deshabilitar tests lentos',
          'Probar shutdown, cola llena y trabajos en vuelo',
        ],
        correct: 2,
        feedback: [
          'La cuenta de tasks no demuestra integridad',
          'Reduce la cobertura crítica',
          'Cubre condiciones límite y regresión',
        ],
      },
    ],
  },
  S12: {
    id: 'S12',
    title: 'Acceso cruzado entre cuentas',
    signals: [
      'GET /orders/842 -> 200',
      'principal=account-7',
      'resource.owner=account-8',
    ],
    steps: [
      {
        title: 'Confirmación',
        event:
          'Un usuario puede consultar pedidos de otra cuenta cambiando el ID.',
        options: [
          'Ocultar la URL en el frontend',
          'Reproducir con dos identidades y preservar evidencia sin datos reales',
          'Desactivar logs de acceso',
        ],
        correct: 1,
        feedback: [
          'No crea autorización',
          'Reproducción controlada demuestra el alcance',
          'Oculta señales de auditoría',
        ],
      },
      {
        title: 'Contención',
        event: 'La autorización solo valida que el token sea válido.',
        options: [
          'Verificar ownership/autorización por recurso en servidor',
          'Cambiar GET por POST',
          'Incrementar la longitud de los IDs',
        ],
        correct: 0,
        feedback: [
          'Protege el recurso independientemente de la interfaz',
          'El método no soluciona IDOR',
          'Un ID difícil de adivinar no sustituye permisos',
        ],
      },
      {
        title: 'Regresión',
        event: 'El parche se prepara para producción.',
        options: [
          'Probar solo el dueño legítimo',
          'Obviar cachés',
          'Probar dueño, no dueño, ausente y caché particionada',
        ],
        correct: 2,
        feedback: [
          'No cubre abuso cruzado',
          'Una caché incorrecta aún filtra datos',
          'Incluye casos adversos y acceso indirecto',
        ],
      },
    ],
  },
  S14: {
    id: 'S14',
    title: 'p99 y pool SQL saturados',
    signals: ['p99=1800ms', 'db_pool_waiters=320', '5xx=3.7%'],
    steps: [
      {
        title: 'Diagnóstico',
        event: 'Picos de latencia coinciden con esperas de conexión en SQL.',
        options: [
          'Duplicar pool sin medir',
          'Correlacionar traces, pool y saturación por request',
          'Borrar la alerta',
        ],
        correct: 1,
        feedback: [
          'Puede empeorar la presión en DB',
          'Identifica el cuello de botella con evidencia',
          'No resuelve el problema',
        ],
      },
      {
        title: 'Mitigación',
        event:
          'Consultas lentas saturan el pool; aumenta el número de solicitudes.',
        options: [
          'Limitar concurrencia, ajustar timeout y mitigar consulta costosa',
          'Abrir conexiones sin límite',
          'Reintentar sin jitter ni límite',
        ],
        correct: 0,
        feedback: [
          'Aísla carga y limita amplificación del incidente',
          'Agota recursos',
          'Multiplica carga en el fallo',
        ],
      },
      {
        title: 'Confirmación',
        event: 'La latencia comienza a descender.',
        options: [
          'Cerrar sin medir',
          'Apagar telemetría',
          'Revisar p95/p99, errores, saturación y rollback',
        ],
        correct: 2,
        feedback: [
          'Falta evidencia de recuperación',
          'Pierde observabilidad',
          'Verifica comportamiento y alternativa de reversión',
        ],
      },
    ],
  },
};
export function newIncident(id: IncidentId): IncidentRun {
  return { id, step: 0, choices: [], status: 'investigating' };
}
export function advanceIncident(run: IncidentRun, choice: number): IncidentRun {
  const definition = INCIDENTS[run.id];
  if (run.status === 'resolved' || run.status === 'failed')
    throw Error('Incidente cerrado');
  if (!Number.isInteger(choice) || choice < 0 || choice > 2)
    throw Error('Decisión inválida');
  if (
    run.step < 0 ||
    run.step >= definition.steps.length ||
    run.choices.length !== run.step
  )
    throw Error('Estado de incidente inválido');
  const choices = [...run.choices, choice];
  const step = run.step + 1;
  const hits = choices.reduce(
    (n, c, i) => n + (c === definition.steps[i].correct ? 1 : 0),
    0,
  );
  return {
    id: run.id,
    step,
    choices,
    status:
      step === definition.steps.length
        ? hits >= 2 && choices[1] === definition.steps[1].correct
          ? 'resolved'
          : 'failed'
        : 'mitigating',
  };
}
export function incidentScore(run: IncidentRun): number | null {
  const def = INCIDENTS[run.id];
  if (
    !['resolved', 'failed'].includes(run.status) ||
    run.choices.length !== def.steps.length
  )
    return null;
  return run.choices.reduce(
    (n, c, i) => n + (c === def.steps[i].correct ? 1 : 0),
    0,
  );
}
export function parseIncidentRun(v: unknown, id: IncidentId): IncidentRun {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return newIncident(id);
  const x = v as Partial<IncidentRun>;
  const def = INCIDENTS[id];
  if (
    x.id !== id ||
    !Number.isInteger(x.step) ||
    typeof x.step !== 'number' ||
    x.step < 0 ||
    x.step > def.steps.length ||
    !Array.isArray(x.choices) ||
    x.choices.length !== x.step ||
    x.choices.some((c) => !Number.isInteger(c) || c < 0 || c > 2)
  )
    return newIncident(id);
  const hits = x.choices.reduce(
    (n, c, i) => n + (c === def.steps[i].correct ? 1 : 0),
    0,
  );
  const expected =
    x.step === def.steps.length
      ? hits >= 2 && x.choices[1] === def.steps[1].correct
        ? 'resolved'
        : 'failed'
      : x.step === 0
        ? 'investigating'
        : 'mitigating';
  if (x.status !== expected) return newIncident(id);
  return { id, step: x.step, choices: [...x.choices], status: x.status };
}

/** Exportación de evidencia didáctica; no constituye resultado de cargo test ni certificación. */
export function incidentReport(run: IncidentRun): string {
  const definition = INCIDENTS[run.id];
  const lines = [
    `# ${definition.id} — ${definition.title}`,
    '',
    'Tipo de evidencia: SIMULACIÓN EDUCATIVA. No ejecuta servicios ni código Rust.',
    `Estado: ${run.status}`,
    `Etapas completadas: ${run.step}/${definition.steps.length}`,
    `Aciertos de referencia: ${incidentScore(run) ?? 'todavía no evaluable'}`,
    '',
    '## Indicadores del escenario',
    ...definition.signals.map((s) => `- ${s}`),
    '',
    '## Decisiones y consecuencias',
  ];
  for (let i = 0; i < run.choices.length; i++) {
    const step = definition.steps[i];
    const answer = run.choices[i];
    lines.push(
      `### ${i + 1}. ${step.title}`,
      `Situación: ${step.event}`,
      `Decisión: ${step.options[answer]}`,
      `Análisis: ${step.feedback[answer]}`,
      `Comparación: ${answer === step.correct ? 'alineada con referencia' : 'requiere revisión'}`,
      '',
    );
  }
  lines.push(
    '## Validación externa requerida',
    '- Reproducir el comportamiento en el proyecto Cargo correspondiente',
    '- Adjuntar salida real de tests, toolchain y fecha',
    '- Revisar escenarios adversos, invariantes y rollback',
  );
  return `${lines.join('\n')}\n`;
}
