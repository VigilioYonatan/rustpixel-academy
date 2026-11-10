import { Boxes, Download, Search } from 'lucide-preact';
import { useEffect, useState } from 'preact/hooks';
import { getSeniorArtifact } from '../engine/artifacts';
import type {
  ArchitectureNode,
  ArchitectureWorkspace,
  ReviewSeverity,
  ReviewWorkspace,
} from '../engine/workspaces';
import {
  addArchitectureEdge,
  addArchitectureNode,
  addReviewComment,
  architectureADR,
  assessArchitecture,
  emptyArchitecture,
  emptyReview,
  parseArchitecture,
  parseReview,
  removeArchitectureNode,
  removeReviewComment,
} from '../engine/workspaces';

function read<T>(key: string, parse: (value: unknown) => T, blank: () => T): T {
  try {
    return parse(JSON.parse(localStorage.getItem(key) ?? 'null'));
  } catch {
    return blank();
  }
}
function useWorkspace<T>(
  key: string,
  parse: (v: unknown) => T,
  blank: () => T,
) {
  const [value, setValue] = useState<T>(() => read(key, parse, blank));
  const [saved, setSaved] = useState(true);
  useEffect(() => {
    setValue(read(key, parse, blank));
    setSaved(true);
  }, [key]);
  function change(next: T) {
    setValue(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }
  return { value, change, saved };
}
function download(name: string, body: string, type: string) {
  const blob = new Blob([body], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function CodeReviewWorkspace({
  challengeId,
  moduleId,
}: {
  challengeId: string;
  moduleId: string;
}) {
  const key = `rustpixel:review:v1:${challengeId}`;
  const { value, change, saved } = useWorkspace<ReviewWorkspace>(
    key,
    (v) => parseReview(v, challengeId),
    () => emptyReview(challengeId),
  );
  const artifact = getSeniorArtifact(moduleId);
  const lines = (artifact?.body ?? '').split('\n');
  const [line, setLine] = useState(1);
  const [severity, setSeverity] = useState<ReviewSeverity>('major');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    setLine(1);
    setMessage('');
    setError('');
  }, [challengeId]);
  function add() {
    try {
      if (line > lines.length)
        throw Error('La línea no existe en el artefacto');
      change(addReviewComment(value, line, severity, message));
      setMessage('');
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de revisión');
    }
  }
  return (
    <section class="card senior-workspace">
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Search size={18} /> Revisión técnica con comentarios por línea
      </h3>
      <p class="small">
        Comentarios locales sobre un fixture de aprendizaje, no revisión de un
        pull request real. Añade riesgos y correcciones accionables.
      </p>
      <div class="review-lines">
        {lines.map((text, i) => (
          <button
            type="button"
            class={line === i + 1 ? 'review-line selected' : 'review-line'}
            onClick={() => setLine(i + 1)}
            aria-label={`Seleccionar línea ${i + 1}`}
          >
            <span class="line-number">{i + 1}</span>
            <code>{text || ' '}</code>
            <span class="line-count">
              {value.comments.filter((c) => c.line === i + 1).length || ''}
            </span>
          </button>
        ))}
      </div>
      <div class="senior-form-row">
        <label>
          Línea{' '}
          <input
            class="input"
            type="number"
            min="1"
            max={lines.length}
            value={line}
            onInput={(e) => setLine(Number(e.currentTarget.value))}
          />
        </label>
        <label>
          Severidad{' '}
          <select
            class="input"
            value={severity}
            onChange={(e) =>
              setSeverity(e.currentTarget.value as ReviewSeverity)
            }
          >
            <option value="blocker">Bloqueante</option>
            <option value="major">Mayor</option>
            <option value="minor">Menor</option>
            <option value="question">Pregunta</option>
          </select>
        </label>
      </div>
      <label>
        Hallazgo, impacto y cambio recomendado
        <textarea
          class="input senior-textarea"
          maxLength={1200}
          value={message}
          onInput={(e) => setMessage(e.currentTarget.value)}
          placeholder="Explica el riesgo y una corrección verificable…"
        />
      </label>
      <button type="button" class="btn" onClick={add}>
        Agregar comentario
      </button>
      {error && <p role="alert">{error}</p>}
      {!saved && (
        <p role="alert">El comentario no se guardó en este navegador.</p>
      )}
      <h4>Hallazgos ({value.comments.length})</h4>
      {value.comments.map((c) => (
        <div class="review-comment">
          <strong>
            L{c.line} · {c.severity}
          </strong>
          <p>{c.message}</p>
          <button
            type="button"
            class="btn"
            onClick={() => change(removeReviewComment(value, c.id))}
          >
            Eliminar
          </button>
        </div>
      ))}
      <button
        type="button"
        class="btn"
        onClick={() =>
          download(
            `${challengeId}-review.json`,
            JSON.stringify(value, null, 2),
            'application/json',
          )
        }
      >
        <Download size={14} /> Exportar revisión JSON
      </button>
    </section>
  );
}
export function ArchitectureWorkspaceView({
  challengeId,
}: {
  challengeId: string;
}) {
  const key = `rustpixel:architecture:v1:${challengeId}`;
  const { value, change, saved } = useWorkspace<ArchitectureWorkspace>(
    key,
    (v) => parseArchitecture(v, challengeId),
    () => emptyArchitecture(challengeId),
  );
  const [name, setName] = useState('');
  const [kind, setKind] = useState<ArchitectureNode['kind']>('service');
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [protocol, setProtocol] = useState('HTTP');
  const [error, setError] = useState('');
  const issues = assessArchitecture(value);
  function addNode() {
    try {
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 32);
      change(addArchitectureNode(value, { id: slug, name: name.trim(), kind }));
      setName('');
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error en nodo');
    }
  }
  function addEdge() {
    try {
      change(
        addArchitectureEdge(value, { from: source, to: target, protocol }),
      );
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error en conexión');
    }
  }
  function field(
    field:
      | 'context'
      | 'decision'
      | 'alternatives'
      | 'consequences'
      | 'verification',
    label: string,
  ) {
    return (
      <label>
        {label}
        <textarea
          class="input senior-textarea"
          maxLength={5000}
          value={value[field]}
          onInput={(e) => change({ ...value, [field]: e.currentTarget.value })}
        />
      </label>
    );
  }
  return (
    <section class="card senior-workspace">
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Boxes size={18} /> Architecture Canvas y ADR
      </h3>
      <p class="small">
        Diseño local declarativo; sus relaciones son decisiones del estudiante,
        no una topología desplegada ni una prueba automática.
      </p>
      <div class="senior-form-row">
        <label>
          Nombre del componente
          <input
            class="input"
            maxLength={80}
            value={name}
            onInput={(e) => setName(e.currentTarget.value)}
            placeholder="api-gateway"
          />
        </label>
        <label>
          Tipo
          <select
            class="input"
            value={kind}
            onChange={(e) =>
              setKind(e.currentTarget.value as ArchitectureNode['kind'])
            }
          >
            {(
              [
                'client',
                'gateway',
                'service',
                'worker',
                'queue',
                'database',
                'cache',
              ] as const
            ).map((x) => (
              <option value={x}>{x}</option>
            ))}
          </select>
        </label>
        <button type="button" class="btn" onClick={addNode}>
          Añadir nodo
        </button>
      </div>
      <div class="architecture-nodes">
        {value.nodes.map((n) => (
          <div class="architecture-node">
            <strong>{n.name}</strong>
            <span>{n.kind}</span>
            <button
              type="button"
              onClick={() => change(removeArchitectureNode(value, n.id))}
              aria-label={`Eliminar ${n.name}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div class="senior-form-row">
        <label>
          Origen
          <select
            class="input"
            value={source}
            onChange={(e) => setSource(e.currentTarget.value)}
          >
            <option value="">Seleccionar</option>
            {value.nodes.map((n) => (
              <option value={n.id}>{n.name}</option>
            ))}
          </select>
        </label>
        <label>
          Destino
          <select
            class="input"
            value={target}
            onChange={(e) => setTarget(e.currentTarget.value)}
          >
            <option value="">Seleccionar</option>
            {value.nodes.map((n) => (
              <option value={n.id}>{n.name}</option>
            ))}
          </select>
        </label>
        <label>
          Contrato o protocolo
          <input
            class="input"
            maxLength={80}
            value={protocol}
            onInput={(e) => setProtocol(e.currentTarget.value)}
          />
        </label>
        <button type="button" class="btn" onClick={addEdge}>
          Conectar
        </button>
      </div>
      <ul>
        {value.edges.map((e) => (
          <li>
            {e.from} → {e.to} ({e.protocol}){' '}
            <button
              type="button"
              class="btn"
              onClick={() =>
                change({ ...value, edges: value.edges.filter((x) => x !== e) })
              }
            >
              Quitar
            </button>
          </li>
        ))}
      </ul>
      {field('context', 'Contexto, requisitos y restricciones')}
      {field('decision', 'Decisión arquitectónica')}
      {field('alternatives', 'Alternativas consideradas')}
      {field('consequences', 'Consecuencias, riesgos y rollback')}
      {field('verification', 'Plan de pruebas y señales observables')}
      <h4>Chequeo de integridad del ADR</h4>
      {issues.length ? (
        <ul>
          {issues.map((i) => (
            <li>{i}</li>
          ))}
        </ul>
      ) : (
        <p class="feedback ok">
          Estructura documental válida; arquitectura NO VERIFICADA en
          producción.
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      {!saved && <p role="alert">No se pudo guardar el canvas.</p>}
      <button
        type="button"
        class="btn btn-gold"
        onClick={() =>
          download(
            `${challengeId}-ADR.md`,
            architectureADR(value),
            'text/markdown',
          )
        }
      >
        <Download size={14} /> Exportar ADR Markdown
      </button>
    </section>
  );
}
