import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Boxes,
  Bug,
  Check,
  CheckSquare,
  ClipboardCheck,
  Clock,
  Compass,
  Crown,
  Download,
  Edit3,
  FileCode,
  FileText,
  Flame,
  GitCompare,
  Lightbulb,
  ListChecks,
  Play,
  RotateCcw,
  Search,
  Shield,
  Square,
  Trophy,
  Upload,
  Zap,
} from 'lucide-preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { href } from '../../../app/router';
import course from '../../../content/course.json';
import challenges from '../../../content/senior/challenges.json';
import fieldGuides from '../../../content/senior/field-guides.json';
import { calculateAcceptanceSummary } from '../engine/acceptance';
import { getSeniorArtifact } from '../engine/artifacts';
import {
  attemptedCount,
  decisionResult,
  EMPTY_SENIOR,
  newAttempt,
  nextRevision,
  readSeniorRecord,
  scoreAttempt,
  selfReview,
  submitAttempt,
  updateAttempt,
  writeSeniorRecord,
} from '../engine/attempts';
import {
  createSeniorBackup,
  parseSeniorBackup,
  restoreSeniorBackup,
} from '../engine/backup';
import type { IncidentId, IncidentRun } from '../engine/incident';
import {
  advanceIncident,
  INCIDENTS,
  incidentReport,
  incidentScore,
  newIncident,
  parseIncidentRun,
} from '../engine/incident';
import { calculateSeniorReadiness } from '../engine/readiness';
import { getScenario } from '../engine/scenarios';
import type {
  ChallengeBrief,
  Criterion,
  SeniorAttempt,
  SeniorRecord,
} from '../model/senior.types';
import { CRITERIA } from '../model/senior.types';
import { AcceptanceOverviewModal, AcceptancePanel } from './AcceptancePanel';
import { EvidenceWorkspace } from './EvidenceWorkspace';
import {
  ArchitectureWorkspaceView,
  CodeReviewWorkspace,
} from './SeniorWorkspaces';

const cases = challenges as ChallengeBrief[];
const seniors = course.filter((m) => m.level === 'senior');

// Referencias de refactorización idiomática Senior para el visor de diferencias (Diff Viewer)
const SENIOR_DIFFS: Record<
  string,
  {
    title: string;
    explanation: string;
    lines: Array<{ type: 'ctx' | 'del' | 'add'; text: string }>;
  }
> = {
  S01: {
    title: 'S01 · Refactorización Zero-Allocation (Copy vs Clone)',
    explanation:
      'Elimina clonaciones en Heap sustituyendo String por slices de cadena prestadas (&str) con lifetime elision explícito, reduciendo las asignaciones a cero.',
    lines: [
      {
        type: 'del',
        text: '- pub fn prefixes(paths: &[String]) -> Vec<String> {',
      },
      { type: 'del', text: '-     paths.iter()' },
      {
        type: 'del',
        text: '-         .map(|p| p.split(\'/\').next().unwrap_or("").to_owned())',
      },
      { type: 'del', text: '-         .collect()' },
      { type: 'del', text: '- }' },
      {
        type: 'add',
        text: "+ // Zero-allocation: Retorna iterador perezoso con lifetime 'a atado a la entrada",
      },
      {
        type: 'add',
        text: "+ pub fn prefixes<'a>(paths: &'a [String]) -> impl Iterator<Item = &'a str> {",
      },
      { type: 'add', text: '+     paths.iter()' },
      {
        type: 'add',
        text: '+         .map(|p| p.split(\'/\').next().unwrap_or(""))',
      },
      { type: 'add', text: '+ }' },
    ],
  },
  S03: {
    title: 'S03 · Manejo de Errores Tipados sin Pánicos (Result & thiserror)',
    explanation:
      'Sustituye .unwrap() que abortaría el hilo por un error tipado y estructurado con thiserror, preservando la trazabilidad del fallo.',
    lines: [
      { type: 'del', text: '- pub fn read_config(path: &str) -> String {' },
      { type: 'del', text: '-     std::fs::read_to_string(path).unwrap()' },
      { type: 'del', text: '- }' },
      { type: 'add', text: '+ use thiserror::Error;' },
      { type: 'add', text: '+' },
      { type: 'add', text: '+ #[derive(Error, Debug)]' },
      { type: 'add', text: '+ pub enum ConfigError {' },
      {
        type: 'add',
        text: '+     #[error("Error de E/S leyendo configuración en \'{path}\': {source}")]',
      },
      {
        type: 'add',
        text: '+     Io { path: String, #[source] source: std::io::Error },',
      },
      { type: 'add', text: '+ }' },
      { type: 'add', text: '+' },
      {
        type: 'add',
        text: '+ pub fn read_config(path: &str) -> Result<String, ConfigError> {',
      },
      { type: 'add', text: '+     std::fs::read_to_string(path)' },
      {
        type: 'add',
        text: '+         .map_err(|e| ConfigError::Io { path: path.to_owned(), source: e })',
      },
      { type: 'add', text: '+ }' },
    ],
  },
  S04: {
    title: 'S04 · Frontera Unsafe con Invariantes de Seguridad y RAII',
    explanation:
      'Encapsula punteros raw en un tipo seguro verificando nulidad y asociando formalmente la duración de vida al origen de memoria.',
    lines: [
      {
        type: 'del',
        text: "- pub unsafe fn view<'a>(ptr: *const u8, len: usize) -> &'a [u8] {",
      },
      { type: 'del', text: '-     std::slice::from_raw_parts(ptr, len)' },
      { type: 'del', text: '- }' },
      { type: 'add', text: "+ pub struct SafeBuffer<'a> { slice: &'a [u8] }" },
      { type: 'add', text: '+' },
      { type: 'add', text: "+ impl<'a> SafeBuffer<'a> {" },
      { type: 'add', text: '+     /// # Safety' },
      {
        type: 'add',
        text: "+     /// `ptr` debe ser no nulo y apuntar a `len` bytes inicializados durante 'a.",
      },
      {
        type: 'add',
        text: '+     pub unsafe fn from_raw_parts(ptr: *const u8, len: usize) -> Result<Self, BufferError> {',
      },
      {
        type: 'add',
        text: '+         if ptr.is_null() { return Err(BufferError::NullPointer); }',
      },
      {
        type: 'add',
        text: '+         let slice = unsafe { std::slice::from_raw_parts(ptr, len) };',
      },
      { type: 'add', text: '+         Ok(Self { slice })' },
      { type: 'add', text: '+     }' },
      { type: 'add', text: '+ }' },
    ],
  },
  S07: {
    title: 'S07 · Cierre Limpio de Tokio Tasks con CancellationToken',
    explanation:
      'Reemplaza tasks huérfanas por seguimiento estructurado mediante TaskTracker y CancellationToken para un shutdown elegante sin fugas.',
    lines: [
      { type: 'del', text: '- async fn handle(job: Job) {' },
      {
        type: 'del',
        text: '-     tokio::spawn(async move { process(job).await });',
      },
      { type: 'del', text: '- }' },
      { type: 'add', text: '+ use tokio_util::sync::CancellationToken;' },
      { type: 'add', text: '+ use tokio_util::task::TaskTracker;' },
      { type: 'add', text: '+' },
      { type: 'add', text: '+ pub struct ManagedWorker {' },
      { type: 'add', text: '+     tracker: TaskTracker,' },
      { type: 'add', text: '+     token: CancellationToken,' },
      { type: 'add', text: '+ }' },
      { type: 'add', text: '+ impl ManagedWorker {' },
      { type: 'add', text: '+     pub fn spawn(&self, job: Job) {' },
      { type: 'add', text: '+         let cancel = self.token.clone();' },
      { type: 'add', text: '+         self.tracker.spawn(async move {' },
      {
        type: 'add',
        text: '+             tokio::select! { _ = cancel.cancelled() => {}, res = process(job) => res }',
      },
      { type: 'add', text: '+         });' },
      { type: 'add', text: '+     }' },
      { type: 'add', text: '+ }' },
    ],
  },
};

function useSenior() {
  const [store, setStore] = useState<SeniorRecord>(() =>
    typeof localStorage === 'undefined' ? EMPTY_SENIOR : readSeniorRecord(),
  );
  const [persisted, setPersisted] = useState(true);

  function replace(next: SeniorRecord) {
    setStore(next);
    setPersisted(writeSeniorRecord(next));
  }

  function save(a: SeniorAttempt) {
    const old = store.attempts[a.challengeId];
    const isRevision =
      old &&
      old.status !== 'draft' &&
      a.status === 'draft' &&
      a.revision === old.revision + 1;
    const history = isRevision
      ? {
          ...store.history,
          [a.challengeId]: [...(store.history[a.challengeId] ?? []), old].slice(
            -20,
          ),
        }
      : store.history;
    const newStore: SeniorRecord = {
      version: 2,
      attempts: { ...store.attempts, [a.challengeId]: a },
      history,
    };
    setStore(newStore);
    setPersisted(writeSeniorRecord(newStore));
  }

  return { store, save, replace, persisted };
}

/** Componente de Radar de Competencias Senior (5 dimensiones Vigilio) */
function SeniorCompetenciesRadar({
  summary,
}: {
  summary: ReturnType<typeof calculateAcceptanceSummary>;
}) {
  const dimensions = [
    {
      id: 'correctness',
      label: 'Correctitud',
      mods: ['S01', 'S04', 'S05', 'S10'],
    },
    { id: 'security', label: 'Seguridad', mods: ['S03', 'S05', 'S12', 'S16'] },
    {
      id: 'architecture',
      label: 'Arquitectura',
      mods: ['S02', 'S09', 'S11', 'S18'],
    },
    {
      id: 'operations',
      label: 'Operaciones',
      mods: ['S07', 'S14', 'S15', 'S17'],
    },
    {
      id: 'performance',
      label: 'Performance',
      mods: ['S01', 'S06', 'S08', 'S13'],
    },
  ];

  const scores = dimensions.map((d) => {
    let count = 0;
    for (const modId of d.mods) {
      count += summary.modules[modId]?.declaredCount ?? 0;
    }
    const max = d.mods.length * 5;
    return { ...d, count, max, pct: Math.round((count / max) * 100) };
  });

  // Cálculo de polígono SVG
  const cx = 120;
  const cy = 120;
  const maxR = 85;
  const points = scores.map((s, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const r = Math.max(16, (s.pct / 100) * maxR);
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      labelX: cx + (maxR + 22) * Math.cos(angle),
      labelY: cy + (maxR + 18) * Math.sin(angle),
      s,
    };
  });

  const polyPoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <section class="card senior-workspace" style={{ marginTop: 24 }}>
      <div class="sectionhead" style={{ marginTop: 0 }}>
        <div>
          <span
            class="eyebrow"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Activity size={14} /> EVALUACIÓN HOLÍSTICA DE CALIDAD
          </span>
          <h3>Matriz de Competencias Senior · 5 Dimensiones Vigilio</h3>
        </div>
        <span class="tag">90 Criterios distribuidos</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 300px) 1fr',
          gap: 24,
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <svg
            width="260"
            height="260"
            viewBox="0 0 240 240"
            aria-label="Gráfico de radar de competencias Senior"
          >
            {/* Círculos concéntricos de referencia */}
            {[0.25, 0.5, 0.75, 1.0].map((scale) => {
              const r = maxR * scale;
              const ringPoints = [0, 1, 2, 3, 4]
                .map((i) => {
                  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
                  return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
                })
                .join(' ');
              return (
                <polygon
                  key={scale}
                  points={ringPoints}
                  fill="none"
                  stroke="var(--border)"
                  stroke-dasharray={scale === 1 ? 'none' : '3,3'}
                  stroke-width="1"
                />
              );
            })}

            {/* Ejes radiales */}
            {[0, 1, 2, 3, 4].map((i) => {
              const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={cx + maxR * Math.cos(angle)}
                  y2={cy + maxR * Math.sin(angle)}
                  stroke="var(--border)"
                  stroke-width="1"
                />
              );
            })}

            {/* Polígono de competencias activas */}
            <polygon
              points={polyPoints}
              fill="rgba(242, 190, 88, 0.25)"
              stroke="var(--senior)"
              stroke-width="2.5"
            />

            {/* Puntos y etiquetas */}
            {points.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4.5"
                  fill="var(--senior)"
                  stroke="#131c2e"
                  stroke-width="1.5"
                />
                <text
                  x={p.labelX}
                  y={p.labelY}
                  text-anchor="middle"
                  font-size="10.5"
                  font-weight="700"
                  fill="var(--text)"
                >
                  {p.s.label} ({p.s.pct}%)
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {scores.map((sc) => (
            <div
              key={sc.id}
              style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                <span>{sc.label}</span>
                <span class="muted">
                  {sc.count} / {sc.max} gates declarados ({sc.pct}%)
                </span>
              </div>
              <div
                style={{
                  background: 'var(--raised)',
                  height: 8,
                  borderRadius: 99,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    background: sc.pct > 50 ? 'var(--teal)' : 'var(--forge)',
                    height: '100%',
                    width: `${sc.pct}%`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          ))}
          <p class="small muted" style={{ marginTop: 8 }}>
            Los porcentajes reflejan evidencia técnica registrada en el
            navegador. La certificación de ingeniería requiere ejecución de
            `cargo test` y revisión de pares externa.
          </p>
        </div>
      </div>
    </section>
  );
}

export function SeniorDashboard() {
  const { store, replace, persisted } = useSenior();
  const readiness = calculateSeniorReadiness(store, localStorage);
  const acceptanceSummary = calculateAcceptanceSummary(localStorage, store);
  const input = useRef<HTMLInputElement>(null);
  const [importNotice, setImportNotice] = useState('');
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'reviewed' | 'submitted' | 'draft' | 'pending'
  >('all');
  const [search, setSearch] = useState('');

  function exportSenior() {
    const blob = new Blob(
      [JSON.stringify(createSeniorBackup(localStorage), null, 2)],
      {
        type: 'application/json',
      },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'rustpixel-senior-backup.json';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importSenior(ev: Event) {
    const file = (ev.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      if (file.size > 4000000)
        throw Error('Archivo demasiado grande (máximo 4 MB)');
      const raw = JSON.parse(await file.text()) as unknown;
      const parsed = parseSeniorBackup(raw);
      if (
        !confirm(
          '¿Importar intentos, revisiones, arquitectura e incidentes del respaldo?',
        )
      )
        return;
      restoreSeniorBackup(localStorage, parsed);
      replace(parsed.senior);
      setImportNotice(
        'Respaldo Senior importado. Las áreas de trabajo estarán disponibles al abrir cada desafío.',
      );
    } catch (err) {
      setImportNotice(
        err instanceof Error ? err.message : 'Error de importación',
      );
    } finally {
      if (input.current) input.current.value = '';
    }
  }

  const filteredSeniors = seniors.filter((m) => {
    const c = cases.find((x) => x.moduleId === m.id);
    const a = c ? store.attempts[c.id] : undefined;
    if (filterStatus === 'reviewed' && a?.status !== 'self-reviewed')
      return false;
    if (filterStatus === 'submitted' && a?.status !== 'submitted') return false;
    if (filterStatus === 'draft' && a?.status !== 'draft') return false;
    if (filterStatus === 'pending' && a) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        m.id.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        (c?.mission ?? '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <>
      <section class="senior-banner">
        <div>
          <span
            class="eyebrow"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Crown size={14} /> THE MASTER FORGE · SENIOR MODE
          </span>
          <h1>Rust Senior Mode · The Master Forge</h1>
          <p>
            18 módulos con decisiones justificadas, debugging, FFI, Tokio,
            seguridad, rendimiento y diseño de sistemas distribuidos.
          </p>
          <div
            class="actions"
            style={{
              marginTop: 16,
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <a class="btn btn-gold" href={href('challenge', 'S01-C01')}>
              <Play size={15} style={{ marginRight: 6 }} /> Primer desafío: S01
            </a>
            <button
              type="button"
              class="btn"
              onClick={() => setShowMatrixModal(true)}
              aria-haspopup="dialog"
            >
              <ClipboardCheck size={16} style={{ marginRight: 6 }} /> 90 Gates
              de Aceptación ({acceptanceSummary.totalDeclared}/90)
            </button>
          </div>
        </div>
        <img
          src={`${import.meta.env.BASE_URL}assets/ferris/senior.png`}
          alt="Ferris Senior, cangrejo naranja con corona"
        />
      </section>

      <div class="senior-stats">
        <div>
          <strong>18</strong>
          <span>Escenarios profesionales</span>
        </div>
        <div>
          <strong>{attemptedCount(store)}</strong>
          <span>Entregas locales</span>
        </div>
        <div>
          <strong>{acceptanceSummary.totalDeclared}/90</strong>
          <span>Gates documentados</span>
        </div>
        <div>
          <strong>0</strong>
          <span>Tests Cargo verificados en la web</span>
        </div>
      </div>

      {/* Radar de Competencias Vigilio */}
      <SeniorCompetenciesRadar summary={acceptanceSummary} />

      <p class="notice" style={{ marginTop: 24 }}>
        <strong>Indicadores de aprendizaje locales:</strong>{' '}
        {readiness.incidentsResolved}/18 incidentes mitigados en simulación;{' '}
        {readiness.evidencePrepared}/18 bitácoras con los tres tipos de
        evidencia declarada; {acceptanceSummary.totalDeclared}/90 criterios de
        aceptación cubiertos; {readiness.externallyVerified} competencias
        certificadas por rustc. Cero false claims de producción.
      </p>

      <div
        class="actions"
        style={{ margin: '16px 0', display: 'flex', gap: 10, flexWrap: 'wrap' }}
      >
        <button type="button" class="btn btn-outline" onClick={exportSenior}>
          <Download size={15} style={{ marginRight: 6 }} /> Exportar respaldo
          Senior completo
        </button>
        <button
          type="button"
          class="btn btn-outline"
          onClick={() => input.current?.click()}
        >
          <Upload size={15} style={{ marginRight: 6 }} /> Importar respaldo
          Senior completo
        </button>
        <input
          ref={input}
          type="file"
          accept="application/json,.json"
          class="sr-only"
          onChange={importSenior}
        />
      </div>

      {importNotice && (
        <p role="status" class="feedback ok">
          {importNotice}
        </p>
      )}
      {!persisted && (
        <p role="alert" class="feedback no">
          No se pudo guardar el progreso Senior.
        </p>
      )}

      <div class="sectionhead" style={{ marginTop: 32 }}>
        <div>
          <span class="eyebrow">PLAN DE ESTUDIOS SENIOR</span>
          <h2>Ruta Senior · 18 módulos</h2>
        </div>
        <span class="tag">90 Criterios de Aceptación</span>
      </div>

      {/* Filtros de la lista de desafíos */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          margin: '16px 0 20px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            ['all', `Todos (${seniors.length})`],
            ['reviewed', 'Autoevaluados'],
            ['submitted', 'Entregados'],
            ['draft', 'Borrador'],
            ['pending', 'Sin iniciar'],
          ].map(([st, label]) => (
            <button
              key={st}
              type="button"
              class={`btn btn-sm ${filterStatus === st ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterStatus(st as typeof filterStatus)}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', minWidth: 240 }}>
          <input
            type="search"
            class="input"
            style={{ width: '100%' }}
            placeholder="Buscar por ID, título o misión..."
            value={search}
            onInput={(e) => setSearch(e.currentTarget.value)}
          />
        </div>
      </div>

      <div class="senior-grid">
        {filteredSeniors.map((m) => {
          const c = cases.find((x) => x.moduleId === m.id);
          const a = c ? store.attempts[c.id] : undefined;
          const acc = acceptanceSummary.modules[m.id];
          return (
            <a class="senior-tile" href={href('challenge', c?.id)} key={m.id}>
              <div
                class="row"
                style={{ justifyContent: 'space-between', marginBottom: 4 }}
              >
                <span class="tag">{m.id}</span>
                <span class="small">{acc?.declaredCount ?? 0}/5 gates</span>
              </div>
              <h3>{m.title}</h3>
              <p>{c?.mission}</p>
              <span class="senior-status">
                {a?.status === 'self-reviewed' ? (
                  <>
                    <Check
                      size={13}
                      style={{ display: 'inline', marginRight: 4 }}
                    />
                    Autoevaluado
                  </>
                ) : a?.status === 'submitted' ? (
                  <>
                    <Clock
                      size={13}
                      style={{ display: 'inline', marginRight: 4 }}
                    />
                    Entregado
                  </>
                ) : a ? (
                  <>
                    <Edit3
                      size={13}
                      style={{ display: 'inline', marginRight: 4 }}
                    />
                    Borrador
                  </>
                ) : (
                  <>
                    <Square
                      size={13}
                      style={{
                        display: 'inline',
                        marginRight: 4,
                        opacity: 0.4,
                      }}
                    />
                    No iniciado
                  </>
                )}{' '}
                <ArrowRight
                  size={13}
                  style={{ display: 'inline', marginLeft: 4 }}
                />
              </span>
            </a>
          );
        })}
      </div>

      <div class="sectionhead" style={{ marginTop: 40 }}>
        <div>
          <span class="eyebrow">DOMINIOS TÉCNICOS</span>
          <h2>Áreas profesionales</h2>
        </div>
      </div>
      <div class="grid3">
        {[
          {
            name: 'Debugging y memoria',
            icon: Bug,
            ids: ['S01', 'S04', 'S05'],
          },
          {
            name: 'Concurrencia y Tokio',
            icon: Zap,
            ids: ['S06', 'S07', 'S11'],
          },
          {
            name: 'Performance y observabilidad',
            icon: BarChart3,
            ids: ['S08', 'S14', 'S13'],
          },
          {
            name: 'Seguridad y resiliencia',
            icon: Shield,
            ids: ['S12', 'S09', 'S10'],
          },
          { name: 'Arquitectura', icon: Boxes, ids: ['S02', 'S03', 'S18'] },
          {
            name: 'Operaciones y liderazgo',
            icon: Trophy,
            ids: ['S15', 'S16', 'S17'],
          },
        ].map((x) => {
          const AreaIcon = x.icon;
          return (
            <section class="card" key={x.name}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AreaIcon size={18} style={{ color: 'var(--senior)' }} />{' '}
                {x.name}
              </h3>
              <div
                class="actions"
                style={{ display: 'flex', gap: 8, marginTop: 12 }}
              >
                {x.ids.map((id) => (
                  <a
                    class="btn btn-outline btn-sm"
                    href={href('challenge', `${id}-C01`)}
                    key={id}
                  >
                    {id}
                  </a>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {showMatrixModal && (
        <AcceptanceOverviewModal
          summary={acceptanceSummary}
          onClose={() => setShowMatrixModal(false)}
        />
      )}
    </>
  );
}

export function SeniorChallenge({ id }: { id: string }) {
  const challenge = cases.find((c) => c.id === id);
  const { store, save, persisted } = useSenior();
  const [error, setError] = useState('');
  const [hint, setHint] = useState(0);
  const [tab, setTab] = useState<'scenario' | 'review' | 'results'>('scenario');
  const [toolSubTab, setToolSubTab] = useState<'context' | 'code' | 'incident'>(
    'context',
  );
  const [diffMode, setDiffMode] = useState(false);

  useEffect(() => {
    setError('');
    setHint(0);
    setTab('scenario');
    setToolSubTab('context');
    setDiffMode(false);
  }, [id]);

  if (!challenge) {
    return (
      <div class="card">
        <h2>Desafío no encontrado</h2>
        <a href={href('senior')}>Volver a Senior Mode</a>
      </div>
    );
  }

  const attempt = store.attempts[id] ?? newAttempt(challenge);
  const scenario = getScenario(challenge);
  const artifact = getSeniorArtifact(challenge.moduleId);
  const result = decisionResult(attempt.decision, scenario.recommended);
  const score = scoreAttempt(attempt);
  const editable = attempt.status === 'draft';
  const diffInfo = SENIOR_DIFFS[challenge.moduleId];

  function patch(
    fields: Partial<
      Pick<
        SeniorAttempt,
        'decision' | 'notes' | 'code' | 'evidenceNotes' | 'checks'
      >
    >,
  ) {
    try {
      save(updateAttempt(attempt, fields));
      setError('');
    } catch (e) {
      setError(String(e));
    }
  }

  function submit() {
    try {
      save(submitAttempt(attempt));
      setTab('review');
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al entregar');
    }
  }

  function review(scores: Record<Criterion, number>) {
    try {
      save(selfReview(attempt, scores));
      setTab('results');
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al evaluar');
    }
  }

  const module = seniors.find((m) => m.id === challenge.moduleId);
  const hasCodeWorkspace = ['S03', 'S04', 'S07', 'S12', 'S17'].includes(
    challenge.moduleId,
  );
  const hasArcWorkspace = ['S02', 'S09', 'S11', 'S15', 'S18'].includes(
    challenge.moduleId,
  );

  return (
    <>
      <div class="sectionhead">
        <a
          href={href('senior')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={16} /> Volver a ruta Senior
        </a>
        <span class="tag">
          {challenge.id} · Revisión {attempt.revision}
        </span>
      </div>

      <div class="senior-challenge-head">
        <div>
          <span class="eyebrow">
            RUST SENIOR CHALLENGE · {challenge.moduleId}
          </span>
          <h1>
            {challenge.moduleId} · {challenge.title}
          </h1>
          <p>
            {module?.title} · {challenge.mission}
          </p>
        </div>
        <img
          src={`${import.meta.env.BASE_URL}assets/ferris/engineer.png`}
          alt="Ferris ingeniero"
        />
      </div>

      <div
        class="senior-steps"
        role="tablist"
        aria-label="Etapas del desafío Senior"
      >
        <button
          type="button"
          role="tab"
          id="tab-btn-scenario"
          aria-controls="panel-scenario"
          aria-selected={tab === 'scenario'}
          class={tab === 'scenario' ? 'active' : ''}
          onClick={() => setTab('scenario')}
        >
          1. Analizar y resolver
        </button>
        <button
          type="button"
          role="tab"
          id="tab-btn-review"
          aria-controls="panel-review"
          aria-selected={tab === 'review'}
          class={tab === 'review' ? 'active' : ''}
          onClick={() => setTab('review')}
        >
          2. Rúbrica
        </button>
        <button
          type="button"
          role="tab"
          id="tab-btn-results"
          aria-controls="panel-results"
          aria-selected={tab === 'results'}
          class={tab === 'results' ? 'active' : ''}
          onClick={() => setTab('results')}
        >
          3. Resultados & Gates
        </button>
      </div>

      {tab === 'scenario' && (
        <div
          class="senior-columns"
          id="panel-scenario"
          role="tabpanel"
          aria-labelledby="tab-btn-scenario"
        >
          <div>
            <div
              class="tool-subnav"
              role="tablist"
              aria-label="Herramientas del escenario"
            >
              <button
                type="button"
                role="tab"
                aria-selected={toolSubTab === 'context'}
                class={`btn btn-sm ${toolSubTab === 'context' ? 'btn-primary' : ''}`}
                onClick={() => setToolSubTab('context')}
              >
                <FileText size={15} style={{ marginRight: 6 }} /> Contexto &
                Guía
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={toolSubTab === 'code'}
                class={`btn btn-sm ${toolSubTab === 'code' ? 'btn-primary' : ''}`}
                onClick={() => setToolSubTab('code')}
              >
                <Search size={15} style={{ marginRight: 6 }} /> Artefacto &
                Revisión
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={toolSubTab === 'incident'}
                class={`btn btn-sm ${toolSubTab === 'incident' ? 'btn-primary' : ''}`}
                onClick={() => setToolSubTab('incident')}
              >
                <Flame size={15} style={{ marginRight: 6 }} /> Incidente Arena
              </button>
            </div>

            {toolSubTab === 'context' && (
              <>
                <section class="card" style={{ marginTop: 12 }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={18} /> Contexto profesional
                  </h3>
                  <p>{challenge.scenario}</p>
                  <h4>Restricciones técnicas</h4>
                  <ul>
                    {challenge.constraints.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>

                  <h4>Decisión de ingeniería</h4>
                  <p>{scenario.question}</p>
                  <fieldset class="senior-choices" disabled={!editable}>
                    <legend class="sr-only">Selecciona una decisión</legend>
                    {scenario.options.map((v, i) => {
                      const value = (['a', 'b', 'c'] as const)[i];
                      return (
                        <label class="choice" key={value}>
                          <input
                            type="radio"
                            name={`choice-${id}`}
                            checked={attempt.decision === value}
                            onChange={() => patch({ decision: value })}
                          />{' '}
                          {v}
                        </label>
                      );
                    })}
                  </fieldset>

                  <button
                    type="button"
                    class="btn btn-outline"
                    disabled={hint >= challenge.hints.length}
                    onClick={() =>
                      setHint(Math.min(hint + 1, challenge.hints.length))
                    }
                  >
                    <Lightbulb size={15} style={{ marginRight: 6 }} /> Mostrar
                    pista ({hint}/{challenge.hints.length})
                  </button>
                  {challenge.hints.slice(0, hint).map((x, i) => (
                    <p class="prompt" key={i}>
                      Pista {i + 1}: {x}
                    </p>
                  ))}
                </section>

                <section class="card" style={{ marginTop: 16 }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Compass size={18} /> Guía de ingeniería del laboratorio
                  </h3>
                  {fieldGuides
                    .filter((g) => g.id === challenge.moduleId)
                    .map((g) => (
                      <div class="senior-field-guide" key={g.id}>
                        <h4>{g.title}</h4>
                        <ol>
                          <li>
                            <strong>Baseline:</strong> {g.baseline}
                          </li>
                          <li>
                            <strong>Cambio:</strong> {g.implementation}
                          </li>
                          <li>
                            <strong>Casos adversos:</strong> {g.adversarial}
                          </li>
                          <li>
                            <strong>Evidencia de salida:</strong>{' '}
                            {g.verification}
                          </li>
                        </ol>
                        <p class="small">
                          Comandos en el proyecto Cargo local (no ejecutados
                          desde la web): <code>{g.command}</code>
                        </p>
                      </div>
                    ))}
                </section>

                <section class="card" style={{ marginTop: 16 }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={18} /> Línea de tiempo del escenario
                  </h3>
                  <ol class="incident-line">
                    {scenario.timeline.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ol>
                  <p class="small">
                    Evento didáctico simulado: no representa telemetría en vivo.
                  </p>
                </section>
              </>
            )}

            {toolSubTab === 'code' && (
              <>
                <section class="card" style={{ marginTop: 12 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    <h3
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        margin: 0,
                      }}
                    >
                      <FileCode size={18} /> Artefacto para inspección técnica
                    </h3>
                    {diffInfo && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          class={`btn btn-sm ${!diffMode ? 'btn-primary' : 'btn-outline'}`}
                          onClick={() => setDiffMode(false)}
                        >
                          Artefacto Base
                        </button>
                        <button
                          type="button"
                          class={`btn btn-sm ${diffMode ? 'btn-primary' : 'btn-outline'}`}
                          onClick={() => setDiffMode(true)}
                        >
                          <GitCompare size={14} style={{ marginRight: 4 }} />{' '}
                          Comparativa Senior Diff
                        </button>
                      </div>
                    )}
                  </div>

                  {!diffMode ? (
                    <>
                      <p class="small" style={{ marginTop: 8 }}>
                        {artifact?.label} · Fixture didáctico no ejecutado
                      </p>
                      <pre class="senior-artifact">
                        <code>{artifact?.body}</code>
                      </pre>
                      <p>{artifact?.reviewPrompt}</p>
                    </>
                  ) : (
                    diffInfo && (
                      <div style={{ marginTop: 12 }}>
                        <p class="small">
                          <strong>{diffInfo.title}</strong> —{' '}
                          {diffInfo.explanation}
                        </p>
                        <div
                          style={{
                            background: 'var(--code)',
                            border: '1px solid var(--border)',
                            borderRadius: 10,
                            padding: '12px 14px',
                            fontFamily: 'var(--font-code)',
                            fontSize: 13,
                            overflowX: 'auto',
                          }}
                        >
                          {diffInfo.lines.map((l, idx) => (
                            <div
                              key={idx}
                              style={{
                                color:
                                  l.type === 'del'
                                    ? '#f87171'
                                    : l.type === 'add'
                                      ? '#4ade80'
                                      : 'var(--text)',
                                background:
                                  l.type === 'del'
                                    ? 'rgba(248, 113, 113, 0.12)'
                                    : l.type === 'add'
                                      ? 'rgba(74, 222, 128, 0.12)'
                                      : 'transparent',
                                padding: '2px 6px',
                                borderRadius: 4,
                                margin: '2px 0',
                                whiteSpace: 'pre',
                              }}
                            >
                              {l.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </section>

                {hasCodeWorkspace && (
                  <CodeReviewWorkspace
                    challengeId={id}
                    moduleId={challenge.moduleId}
                  />
                )}
                {hasArcWorkspace && (
                  <ArchitectureWorkspaceView challengeId={id} />
                )}
              </>
            )}

            {toolSubTab === 'incident' && (
              <div style={{ marginTop: 12 }}>
                <IncidentSimulator id={challenge.moduleId as IncidentId} />
              </div>
            )}
          </div>

          <div>
            <section class="card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Edit3 size={18} /> Solución y justificación
              </h3>

              <div class="field-header-row">
                <label for="senior-notes">
                  Diagnóstico, trade-offs, cambios y casos adversarios
                </label>
                <span
                  class={`char-pill ${
                    attempt.notes.trim().length >= 50 ? 'valid' : 'pending'
                  }`}
                  aria-live="polite"
                >
                  {attempt.notes.trim().length}/50 mín{' '}
                  {attempt.notes.trim().length >= 50 ? '✓' : ''}
                </span>
              </div>
              <textarea
                id="senior-notes"
                class="input senior-textarea"
                maxLength={12000}
                disabled={!editable}
                value={attempt.notes}
                onInput={(e) => patch({ notes: e.currentTarget.value })}
                placeholder="Identifica la causa raíz, describe la alternativa elegida, explica trade-offs y define un caso adversario verificable…"
              />

              <label for="senior-code">
                Propuesta técnica opcional (Rust, diff, ADR o pseudocódigo)
              </label>
              <textarea
                id="senior-code"
                class="input senior-code"
                maxLength={30000}
                disabled={!editable}
                spellcheck={false}
                value={attempt.code}
                onInput={(e) => patch({ code: e.currentTarget.value })}
                placeholder="// Tu implementación, diff o modelo de solución aquí"
              />

              <h4 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckSquare size={16} /> Criterios de evidencia requeridos
              </h4>
              {challenge.evidence.map((e, i) => (
                <label class="senior-check" key={i}>
                  <input
                    type="checkbox"
                    checked={attempt.checks[i] ?? false}
                    disabled={!editable}
                    onChange={(ev) =>
                      patch({
                        checks: attempt.checks.map((x, j) =>
                          j === i ? ev.currentTarget.checked : x,
                        ),
                      })
                    }
                  />
                  <span>{e}</span>
                </label>
              ))}

              <div class="field-header-row" style={{ marginTop: 12 }}>
                <label for="senior-evidence">
                  ¿Qué comandos y resultados comprobarían la solución?
                </label>
                <span
                  class={`char-pill ${
                    attempt.evidenceNotes.trim().length >= 25
                      ? 'valid'
                      : 'pending'
                  }`}
                  aria-live="polite"
                >
                  {attempt.evidenceNotes.trim().length}/25 mín{' '}
                  {attempt.evidenceNotes.trim().length >= 25 ? '✓' : ''}
                </span>
              </div>
              <textarea
                id="senior-evidence"
                class="input senior-textarea"
                maxLength={8000}
                disabled={!editable}
                value={attempt.evidenceNotes}
                onInput={(e) => patch({ evidenceNotes: e.currentTarget.value })}
                placeholder="Indica cargo test, clippy, pruebas de integración, benchmarks o procedimientos y salidas esperadas. No inventes ejecuciones."
              />

              <div class="actions" style={{ marginTop: 16 }}>
                {editable ? (
                  <button type="button" class="btn btn-gold" onClick={submit}>
                    Entregar análisis{' '}
                    <ArrowRight size={15} style={{ marginLeft: 6 }} />
                  </button>
                ) : (
                  <span class="tag">Entrega cerrada · {attempt.status}</span>
                )}
              </div>
              <p class="small" style={{ marginTop: 10 }}>
                Las casillas y textos son declaraciones de estudio: no
                constituyen certificación por rustc.
              </p>
            </section>
          </div>
        </div>
      )}

      {tab === 'review' && (
        <div
          class="senior-columns"
          id="panel-review"
          role="tabpanel"
          aria-labelledby="tab-btn-review"
        >
          <section class="card">
            <h3>Evaluación guiada</h3>
            {attempt.status === 'draft' ? (
              <p>
                Primero entrega tu análisis. La evaluación se habilita después
                de cumplir los campos mínimos.
              </p>
            ) : (
              <>
                <h4>Decisión técnica</h4>
                <p
                  class={result === 'supported' ? 'feedback ok' : 'feedback no'}
                >
                  {result === 'supported' ? (
                    <>
                      <Check
                        size={14}
                        style={{ display: 'inline', marginRight: 4 }}
                      />
                      La alternativa elegida coincide con la solución de
                      referencia.
                    </>
                  ) : (
                    <>
                      <AlertCircle
                        size={14}
                        style={{ display: 'inline', marginRight: 4 }}
                      />
                      La decisión requiere revisión adicional.
                    </>
                  )}
                </p>
                <p>{scenario.reason}</p>
                <p class="small">
                  Esto valida solo una decisión contextual, no el código escrito
                  ni las evidencias.
                </p>
                <h4>Revisa estas evidencias</h4>
                <ul>
                  {challenge.evidence.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </>
            )}
          </section>
          <ReviewForm attempt={attempt} onSave={review} />
        </div>
      )}

      {tab === 'results' && (
        <div
          id="panel-results"
          role="tabpanel"
          aria-labelledby="tab-btn-results"
        >
          <AcceptancePanel moduleId={challenge.moduleId} attempt={attempt} />

          <EvidenceWorkspace challengeId={id} revision={attempt.revision} />

          <div class="senior-columns" style={{ marginTop: 16 }}>
            <section class="card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={18} /> Informe del desafío
              </h3>
              <p>
                <strong>Revisiones anteriores conservadas:</strong>{' '}
                {store.history[id]?.length ?? 0}
              </p>
              <p>
                <strong>Estado:</strong>{' '}
                {attempt.status === 'draft'
                  ? 'Borrador'
                  : attempt.status === 'submitted'
                    ? 'Entregado pendiente de autoevaluación'
                    : 'Autoevaluación registrada'}
              </p>
              <p>
                <strong>Decisión guiada:</strong>{' '}
                {result === 'supported'
                  ? 'Coincide con referencia'
                  : result === 'needs-review'
                    ? 'Necesita reconsideración'
                    : 'No respondida'}
              </p>
              <p>
                <strong>Puntuación autodeclarada:</strong>{' '}
                {score === null ? 'No disponible' : `${score.toFixed(1)} / 100`}
              </p>
              <p class="notice">
                No es una nota validada por Cargo, un examinador ni una
                certificación. El código, incidentes y benchmarks requieren
                validación externa en un entorno Rust real.
              </p>
              <h4>Feedback técnico de referencia</h4>
              <p>{scenario.reason}</p>
              <button
                type="button"
                class="btn btn-outline"
                disabled={editable}
                onClick={() => {
                  save(nextRevision(attempt));
                  setTab('scenario');
                }}
              >
                <RotateCcw size={15} style={{ marginRight: 6 }} /> Crear
                siguiente revisión
              </button>
            </section>

            <section class="card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ListChecks size={18} /> Evidencias del intento
              </h3>
              <p>{attempt.evidenceNotes || 'Sin evidencias registradas'}</p>
              <h4>Lista de verificación</h4>
              {challenge.evidence.map((e, i) => (
                <p
                  key={i}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  {attempt.checks[i] ? (
                    <CheckSquare size={16} style={{ color: 'var(--teal)' }} />
                  ) : (
                    <Square size={16} style={{ opacity: 0.4 }} />
                  )}
                  <span>{e}</span>
                </p>
              ))}
              <div class="actions" style={{ marginTop: 20 }}>
                <a class="btn btn-primary" href={href('senior')}>
                  Volver al dashboard{' '}
                  <ArrowRight size={15} style={{ marginLeft: 6 }} />
                </a>
              </div>
            </section>
          </div>
        </div>
      )}

      {!persisted && (
        <p role="alert" class="feedback no">
          El navegador no pudo guardar el intento. Exporta tu texto antes de
          cerrar la página.
        </p>
      )}
      {error && (
        <p role="alert" class="feedback no">
          {error}
        </p>
      )}
    </>
  );
}

function ReviewForm({
  attempt,
  onSave,
}: {
  attempt: SeniorAttempt;
  onSave: (scores: Record<Criterion, number>) => void;
}) {
  const [scores, setScores] = useState<Record<Criterion, number>>({
    ...attempt.scores,
  });

  useEffect(() => {
    setScores({ ...attempt.scores });
  }, [attempt.id, attempt.status, attempt.revision]);

  return (
    <section class="card">
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Compass size={18} /> Rúbrica de autoevaluación
      </h3>
      <p class="small">
        0 = sin evidencia, 1 = insuficiente, 2 = parcial, 3 = sólido, 4 =
        excelente y reproducible. Marca solo lo que puedas justificar.
      </p>
      {CRITERIA.map((c) => (
        <div class="senior-criterion" key={c.id}>
          <label for={`score-${c.id}`}>
            {c.label} · {c.weight}%
          </label>
          <select
            class="input"
            id={`score-${c.id}`}
            value={scores[c.id]}
            disabled={attempt.status === 'draft'}
            onChange={(e) =>
              setScores({ ...scores, [c.id]: Number(e.currentTarget.value) })
            }
          >
            {[0, 1, 2, 3, 4].map((n) => (
              <option value={n} key={n}>
                {n} / 4
              </option>
            ))}
          </select>
        </div>
      ))}
      <button
        type="button"
        class="btn btn-gold"
        disabled={attempt.status === 'draft'}
        onClick={() => onSave(scores)}
        style={{ marginTop: 12 }}
      >
        Registrar autoevaluación
      </button>
      <p class="small" style={{ marginTop: 8 }}>
        No otorga XP de competencias ni afirma haber corrido tests.
      </p>
    </section>
  );
}

/** Local-only branching incident con telemetría interactiva SVG en tiempo real. */
function IncidentSimulator({ id }: { id: IncidentId }) {
  const key = `rustpixel:incident:v1:${id}`;
  const [run, setRun] = useState<IncidentRun>(() => {
    try {
      return parseIncidentRun(
        JSON.parse(localStorage.getItem(key) ?? 'null'),
        id,
      );
    } catch {
      return newIncident(id);
    }
  });
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    try {
      setRun(
        parseIncidentRun(JSON.parse(localStorage.getItem(key) ?? 'null'), id),
      );
      setStorageError(false);
    } catch {
      setRun(newIncident(id));
    }
  }, [id]);

  const def = INCIDENTS[id];
  const step = def.steps[run.step];
  const score = incidentScore(run);

  function save(next: IncidentRun) {
    setRun(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }

  // Cálculo de telemetría dinámica según etapa y elecciones
  const stepIdx = Math.min(run.choices.length, 3);
  const currentLatency =
    stepIdx === 0
      ? 42.0
      : stepIdx === 1
        ? run.choices[0] === def.steps[0]?.correct
          ? 18.5
          : 54.0
        : stepIdx === 2
          ? run.choices[1] === def.steps[1]?.correct
            ? 5.8
            : 48.0
          : run.status === 'resolved'
            ? 1.9
            : 28.0;

  const currentAllocs =
    stepIdx === 0
      ? '28,500 /s'
      : stepIdx === 1
        ? '15,200 /s'
        : stepIdx === 2
          ? '3,100 /s'
          : '420 /s';

  return (
    <section class="card incident-simulator" style={{ marginTop: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <h3
          style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}
        >
          <Flame size={18} style={{ color: 'var(--forge)' }} /> Simulador
          interactivo: {def.title}
        </h3>
        <span class="tag">Simulación didáctica local</span>
      </div>

      <p class="small" style={{ marginTop: 8 }}>
        Fixture educativo de ingeniería en producción: no contacta servidores ni
        ejecuta compiladores en vivo.
      </p>

      {/* Panel de Telemetría Dinámica en Tiempo Real */}
      <div
        style={{
          background: 'var(--raised)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 16,
          margin: '14px 0',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 16,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <div>
              <span class="muted small" style={{ display: 'block' }}>
                Latencia P99
              </span>
              <strong
                style={{
                  fontSize: 18,
                  color: currentLatency > 25 ? 'var(--forge)' : 'var(--teal)',
                }}
              >
                {currentLatency.toFixed(1)} ms
              </strong>
            </div>
            <div>
              <span class="muted small" style={{ display: 'block' }}>
                Asignaciones Heap
              </span>
              <strong style={{ fontSize: 18 }}>{currentAllocs}</strong>
            </div>
            <div>
              <span class="muted small" style={{ display: 'block' }}>
                SLA Objetivo
              </span>
              <strong style={{ fontSize: 14, color: 'var(--teal)' }}>
                &lt; 15.0 ms
              </strong>
            </div>
          </div>
          <div>
            <span
              class="tag"
              style={{
                background:
                  run.status === 'resolved'
                    ? 'rgba(104, 196, 140, 0.15)'
                    : 'rgba(231, 111, 54, 0.15)',
                color:
                  run.status === 'resolved' ? 'var(--teal)' : 'var(--forge)',
                fontWeight: 800,
              }}
            >
              {run.status === 'resolved' ? 'MITIGADO' : 'INVESTIGANDO'}
            </span>
          </div>
        </div>

        {/* Sparkline SVG de Latencia de Incidente */}
        <div style={{ marginTop: 12 }}>
          <svg
            width="100%"
            height="45"
            viewBox="0 0 300 45"
            preserveAspectRatio="none"
            style={{ display: 'block' }}
            role="img"
          >
            <title>Curva de latencia P99 de telemetría</title>
            {/* Línea de SLA objetivo */}
            <line
              x1="0"
              y1="28"
              x2="300"
              y2="28"
              stroke="var(--border)"
              stroke-dasharray="3,3"
              stroke-width="1"
            />
            <text
              x="290"
              y="24"
              text-anchor="end"
              font-size="8.5"
              fill="var(--muted)"
            >
              SLA 15ms
            </text>

            {/* Curva de latencia según avance */}
            {(() => {
              const pts = [
                { x: 20, y: 8 },
                {
                  x: 100,
                  y: run.choices[0] === def.steps[0]?.correct ? 22 : 6,
                },
                {
                  x: 200,
                  y: run.choices[1] === def.steps[1]?.correct ? 34 : 10,
                },
                { x: 280, y: run.status === 'resolved' ? 38 : 18 },
              ];
              const activePts = pts.slice(0, Math.min(stepIdx + 1, 4));
              const linePath = activePts
                .map((p, idx) => `${idx === 0 ? 'M' : 'L'}${p.x},${p.y}`)
                .join(' ');
              return (
                <>
                  <path
                    d={linePath}
                    fill="none"
                    stroke={
                      currentLatency > 25 ? 'var(--forge)' : 'var(--teal)'
                    }
                    stroke-width="2.5"
                  />
                  {activePts.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r="3.5"
                      fill={
                        currentLatency > 25 ? 'var(--forge)' : 'var(--teal)'
                      }
                    />
                  ))}
                </>
              );
            })()}
          </svg>
        </div>
      </div>

      <div class="incident-signals" style={{ marginBottom: 12 }}>
        {def.signals.map((signal) => (
          <code key={signal}>{signal}</code>
        ))}
      </div>

      <p>
        <strong>
          Etapa {Math.min(run.step + 1, def.steps.length)} de {def.steps.length}
        </strong>
      </p>

      {step ? (
        <>
          <h4>{step.title}</h4>
          <p>{step.event}</p>
          <div class="incident-actions">
            {step.options.map((option, i) => (
              <button
                type="button"
                class="btn btn-outline"
                key={i}
                onClick={() => save(advanceIncident(run, i))}
              >
                {String.fromCharCode(65 + i)}. {option}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p class={run.status === 'resolved' ? 'feedback ok' : 'feedback no'}>
          Simulación{' '}
          {run.status === 'resolved' ? 'mitigada' : 'con decisiones de riesgo'}{' '}
          · {score} de {def.steps.length} decisiones alineadas con la
          referencia.
        </p>
      )}

      {run.choices.map((choice, index) => (
        <details key={index} style={{ marginTop: 8 }}>
          <summary>
            Decisión {index + 1}: {def.steps[index].options[choice]}
          </summary>
          <p style={{ marginTop: 6 }}>
            {def.steps[index].feedback[choice]}{' '}
            {choice === def.steps[index].correct ? (
              <strong style={{ color: 'var(--teal)' }}>
                ✓ Decisión de referencia
              </strong>
            ) : (
              <strong style={{ color: 'var(--forge)' }}>
                △ Revisar alternativa
              </strong>
            )}
          </p>
        </details>
      ))}

      {storageError && <p role="alert">No se pudo persistir este incidente.</p>}

      <div
        class="actions"
        style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}
      >
        <button
          type="button"
          class="btn btn-outline"
          onClick={() =>
            downloadText(`${id}-incident-report.md`, incidentReport(run))
          }
          disabled={run.choices.length === 0}
        >
          <Download size={14} style={{ marginRight: 6 }} /> Exportar reporte de
          decisiones
        </button>
        <button
          type="button"
          class="btn btn-outline"
          onClick={() => save(newIncident(id))}
        >
          <RotateCcw size={14} style={{ marginRight: 6 }} /> Reiniciar incidente
        </button>
      </div>
    </section>
  );
}

function downloadText(filename: string, contents: string) {
  const url = URL.createObjectURL(
    new Blob([contents], { type: 'text/markdown;charset=utf-8' }),
  );
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
