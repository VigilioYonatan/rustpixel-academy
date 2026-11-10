import { Download, ListChecks, Plus, Trash2 } from 'lucide-preact';
import { useEffect, useState } from 'preact/hooks';
import { downloadText } from '../../../shared/lib/download-text';
import type { EvidenceEntry, EvidenceLedger } from '../engine/evidence';
import {
  addEvidence,
  emptyEvidence,
  evidenceKey,
  evidenceMarkdown,
  evidenceReadiness,
  parseEvidence,
  removeEvidence,
} from '../engine/evidence';

function read(id: string): EvidenceLedger {
  try {
    return parseEvidence(
      JSON.parse(localStorage.getItem(evidenceKey(id)) ?? 'null'),
      id,
    );
  } catch {
    return emptyEvidence(id);
  }
}

export function EvidenceWorkspace({
  challengeId,
  revision,
}: {
  challengeId: string;
  revision: number;
}) {
  const [ledger, setLedger] = useState<EvidenceLedger>(() => read(challengeId));
  const [kind, setKind] = useState<EvidenceEntry['kind']>('test');
  const [source, setSource] =
    useState<EvidenceEntry['source']>('local-command');
  const [command, setCommand] = useState('cargo test --locked');
  const [environment, setEnvironment] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setLedger(read(challengeId));
    setError('');
  }, [challengeId]);

  const status = evidenceReadiness(ledger, revision);

  function persist(next: EvidenceLedger) {
    try {
      localStorage.setItem(evidenceKey(challengeId), JSON.stringify(next));
      setLedger(next);
      setError('');
    } catch {
      setError(
        'El navegador no pudo guardar las evidencias; exporta el contenido antes de cerrar.',
      );
    }
  }

  function add() {
    try {
      persist(
        addEvidence(ledger, {
          revision,
          kind,
          source,
          command,
          environment,
          output,
        }),
      );
      setOutput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Evidencia inválida');
    }
  }

  return (
    <section class="card senior-workspace">
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ListChecks size={18} /> Bitácora de evidencias reproducibles
      </h3>
      <p class="notice">
        Estos datos los aporta el estudiante: NO demuestran que RustPixel haya
        ejecutado Cargo ni acreditan competencias. Elimina secretos, tokens y
        datos personales antes de pegar logs o exportar; una revisión externa
        debe reproducir las pruebas.
      </p>
      <div class="senior-form-row">
        <label>
          Tipo
          <select
            class="input"
            value={kind}
            onChange={(e) =>
              setKind(e.currentTarget.value as EvidenceEntry['kind'])
            }
          >
            {(
              [
                'test',
                'security',
                'benchmark',
                'architecture',
                'incident',
                'review',
              ] as const
            ).map((x) => (
              <option value={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Procedencia declarada
          <select
            class="input"
            value={source}
            onChange={(e) =>
              setSource(e.currentTarget.value as EvidenceEntry['source'])
            }
          >
            <option value="local-command">Comando local</option>
            <option value="ci-export">Exportación CI</option>
            <option value="peer-review">Revisión externa</option>
            <option value="self-report">Declaración propia</option>
          </select>
        </label>
      </div>
      <label>
        Comando utilizado (si procede)
        <input
          class="input"
          maxLength={512}
          value={command}
          onInput={(e) => setCommand(e.currentTarget.value)}
        />
      </label>
      <label>
        Entorno: toolchain, SO y dependencias
        <input
          class="input"
          maxLength={500}
          value={environment}
          onInput={(e) => setEnvironment(e.currentTarget.value)}
          placeholder="rustc 1.xx; Linux; Cargo.lock commit abc123"
        />
      </label>
      <label>
        Salida y observaciones reales
        <textarea
          class="input senior-textarea"
          maxLength={12000}
          value={output}
          onInput={(e) => setOutput(e.currentTarget.value)}
          placeholder="Pega la salida real, describe entradas, errores y fecha. No inventes logs."
        />
      </label>
      <button type="button" class="btn btn-gold" onClick={add}>
        <Plus size={14} /> Registrar evidencia en revisión {revision}
      </button>
      {error && (
        <p role="alert" class="feedback no">
          {error}
        </p>
      )}
      <p class="small">
        Revisión actual: {status.count} registros · Tests declarados:{' '}
        {status.hasTest ? 'sí' : 'no'} · Riesgos: {status.hasRisk ? 'sí' : 'no'}{' '}
        · Diseño: {status.hasDesign ? 'sí' : 'no'} · Verificados por la
        plataforma: 0.
      </p>
      <p class="small">
        {status.readyForExternalReview
          ? 'Incluye evidencias de los tres grupos para solicitar revisión externa.'
          : 'Para preparar una revisión externa incluye tests, seguridad/incidentes y arquitectura/review.'}
      </p>
      {ledger.items
        .slice()
        .reverse()
        .map((item) => (
          <details key={item.id}>
            <summary>
              {item.kind} · rev. {item.revision} · {item.source} · NO VERIFICADO
            </summary>
            <p>
              <strong>Entorno:</strong> {item.environment}
            </p>
            <p>
              <code>{item.command}</code>
            </p>
            <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
              {item.output}
            </pre>
            <button
              type="button"
              class="btn"
              onClick={() => persist(removeEvidence(ledger, item.id))}
            >
              <Trash2 size={13} /> Eliminar
            </button>
          </details>
        ))}
      <button
        type="button"
        class="btn"
        onClick={() =>
          downloadText(`${challengeId}-evidencias.md`, evidenceMarkdown(ledger))
        }
      >
        <Download size={14} /> Exportar informe Markdown
      </button>
    </section>
  );
}
