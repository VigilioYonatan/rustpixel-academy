import { Check, Copy, Download, Filter, X } from 'lucide-preact';
import { useState } from 'preact/hooks';
import { getModuleAcceptance } from '../engine/acceptance';
import type {
  AcceptanceGate,
  ModuleAcceptance,
  SeniorAttempt,
} from '../model/senior.types';

interface AcceptancePanelProps {
  moduleId: string;
  attempt?: SeniorAttempt;
}

export function AcceptancePanel({ moduleId, attempt }: AcceptancePanelProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const acceptance: ModuleAcceptance = getModuleAcceptance(
    moduleId,
    localStorage,
    attempt,
  );

  function copySnippet(cmd: string, id: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cmd).then(() => {
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
      });
    }
  }

  return (
    <section
      class="card senior-workspace acceptance-panel"
      aria-labelledby="acceptance-heading"
    >
      <div class="sectionhead" style={{ marginTop: 0 }}>
        <div>
          <span class="eyebrow">QUALITY & RELEASE GATES · 5 CRITERIOS</span>
          <h3 id="acceptance-heading">Criterios de aceptación: {moduleId}</h3>
        </div>
        <span class="tag">
          {acceptance.declaredCount}/5 declarados · 0/{acceptance.gates.length}{' '}
          verificados externamente
        </span>
      </div>

      <p class="notice">
        <strong>Cobertura documental de release:</strong> Estos cinco gates
        evalúan la solidez técnica del módulo según los estándares de ingeniería
        Vigilio. Marcar una evidencia como declarada documenta el análisis del
        estudiante; la verificación real exige ejecutar Cargo y Clippy en una
        toolchain local o CI externa.
      </p>

      <ul class="gates-grid" aria-label="Lista de criterios de aceptación">
        {acceptance.gates.map((gate: AcceptanceGate) => (
          <li key={gate.id} class={`gate-card ${gate.status}`}>
            <div class="gate-header">
              <span class="gate-id">{gate.id.toUpperCase()}</span>
              <span class={`gate-badge ${gate.status}`}>
                {gate.status === 'declared' ? (
                  <>
                    <Check
                      size={12}
                      style={{ display: 'inline', marginRight: 4 }}
                    />
                    Declarado
                  </>
                ) : (
                  'Pendiente'
                )}
              </span>
            </div>
            <h4>{gate.label}</h4>
            <p class="gate-req">{gate.requirement}</p>
            <div class="gate-cmd-row">
              <code>{gate.commandSnippet}</code>
              <button
                type="button"
                class="btn btn-sm"
                onClick={() => copySnippet(gate.commandSnippet, gate.id)}
                aria-label={`Copiar comando para ${gate.id}`}
              >
                {copied === gate.id ? (
                  <>
                    <Check size={13} /> Copiado
                  </>
                ) : (
                  <>
                    <Copy size={13} /> Copiar
                  </>
                )}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div class="acceptance-footer" style={{ marginTop: 16 }}>
        <p class="small">
          Total de 90 gates en Senior Mode (5 por módulo S01–S18). Verificación
          de la plataforma: 0 (diseño deliberado de integridad; nunca se
          confunden simulaciones con ejecución de compilador).
        </p>
      </div>
    </section>
  );
}

export function AcceptanceOverviewModal({
  summary,
  onClose,
}: {
  summary: ReturnType<
    typeof import('../engine/acceptance').calculateAcceptanceSummary
  >;
  onClose: () => void;
}) {
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'declared' | 'missing'
  >('all');

  const filteredModules = Object.entries(summary.modules).filter(([, mod]) => {
    if (filterStatus === 'declared') return mod.declaredCount > 0;
    if (filterStatus === 'missing') return mod.declaredCount === 0;
    return true;
  });

  function downloadAcceptanceReport() {
    let md = '# RustPixel Academy — Informe de Auditoría 90 Gates Senior\n\n';
    md += `**Fecha:** ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
    md += `**Cobertura Global:** ${summary.totalDeclared}/90 declarados con evidencia · ${summary.totalMissing}/90 pendientes\n`;
    md += `**Verificación externa:** ${summary.externallyVerified}/90 verificados por rustc (Requiere compilador Rust local)\n\n`;
    md += '## Matriz de Cobertura de Calidad por Módulo (S01–S18)\n\n';
    md +=
      '| Módulo | Dimensión | Criterio | Estado | Comando de Validación |\n';
    md += '| :--- | :--- | :--- | :---: | :--- |\n';
    for (const [modId, mod] of Object.entries(summary.modules)) {
      for (const g of mod.gates) {
        md += `| ${modId} | ${g.id} | ${g.label} | ${g.status === 'declared' ? 'DECLARADO' : 'PENDIENTE'} | \`${g.commandSnippet}\` |\n`;
      }
    }
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rustpixel-90-gates-acceptance-report.md';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div class="modal-card">
        <div class="sectionhead">
          <h3 id="modal-title">
            Matriz de los 90 Criterios de Aceptación Senior
          </h3>
          <button
            type="button"
            class="circle-action"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        <p class="notice">
          Estado global: {summary.totalDeclared}/90 gates declarados con
          evidencia · {summary.totalMissing}/90 pendientes ·{' '}
          {summary.externallyVerified}/90 verificados por rustc en web.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            margin: '14px 0',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Filter size={14} /> Filtro:
          </span>
          <button
            type="button"
            class={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterStatus('all')}
          >
            Todos ({Object.keys(summary.modules).length})
          </button>
          <button
            type="button"
            class={`btn btn-sm ${filterStatus === 'declared' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterStatus('declared')}
          >
            Con evidencia (
            {
              Object.values(summary.modules).filter((m) => m.declaredCount > 0)
                .length
            }
            )
          </button>
          <button
            type="button"
            class={`btn btn-sm ${filterStatus === 'missing' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterStatus('missing')}
          >
            Pendientes (
            {
              Object.values(summary.modules).filter(
                (m) => m.declaredCount === 0,
              ).length
            }
            )
          </button>
        </div>

        <div class="matrix-table-wrap">
          <table class="matrix-table">
            <thead>
              <tr>
                <th>Módulo</th>
                <th>Correctitud</th>
                <th>Seguridad</th>
                <th>Arquitectura</th>
                <th>Operaciones</th>
                <th>Performance</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredModules.map(([modId, mod]) => (
                <tr key={modId}>
                  <td>
                    <strong>{modId}</strong>
                  </td>
                  {mod.gates.map((g) => (
                    <td key={g.id} class={`td-gate ${g.status}`}>
                      {g.status === 'declared' ? (
                        <span style={{ color: 'var(--teal)', fontWeight: 800 }}>
                          <Check size={14} style={{ display: 'inline' }} />
                        </span>
                      ) : (
                        <span style={{ opacity: 0.35 }}>○</span>
                      )}
                    </td>
                  ))}
                  <td>
                    <span class="tag">{mod.declaredCount}/5</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          class="actions"
          style={{
            marginTop: 16,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            class="btn btn-outline"
            onClick={downloadAcceptanceReport}
          >
            <Download size={15} /> Exportar Informe de Auditoría (.md)
          </button>
          <button type="button" class="btn btn-primary" onClick={onClose}>
            Cerrar matriz
          </button>
        </div>
      </div>
    </div>
  );
}
