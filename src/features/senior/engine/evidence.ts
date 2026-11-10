/** Offline evidence ledger. An attached command log is USER-SUPPLIED, never an executed test. */
export type EvidenceSource =
  | 'self-report'
  | 'local-command'
  | 'ci-export'
  | 'peer-review';
export type EvidenceStatus = 'claimed' | 'rejected' | 'needs-reproduction';
export interface EvidenceEntry {
  id: string;
  challengeId: string;
  revision: number;
  source: EvidenceSource;
  kind:
    | 'test'
    | 'security'
    | 'benchmark'
    | 'architecture'
    | 'incident'
    | 'review';
  command: string;
  environment: string;
  output: string;
  recordedAt: string;
  status: EvidenceStatus;
}
export interface EvidenceLedger {
  version: 1;
  challengeId: string;
  items: EvidenceEntry[];
}
export const evidenceKey = (id: string) => `rustpixel:evidence:v1:${id}`;
const challengeIdOk = (x: string) => /^S(?:0[1-9]|1[0-8])-C01$/.test(x);
const sources: EvidenceSource[] = [
  'self-report',
  'local-command',
  'ci-export',
  'peer-review',
];
const kinds: EvidenceEntry['kind'][] = [
  'test',
  'security',
  'benchmark',
  'architecture',
  'incident',
  'review',
];
const statuses: EvidenceStatus[] = [
  'claimed',
  'rejected',
  'needs-reproduction',
];
const object = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object' && !Array.isArray(x);
export function emptyEvidence(challengeId: string): EvidenceLedger {
  if (!challengeIdOk(challengeId))
    throw Error('Identificador de desafío inválido');
  return { version: 1, challengeId, items: [] };
}
function validEntry(x: unknown, id: string): x is EvidenceEntry {
  if (!object(x)) return false;
  return (
    x.challengeId === id &&
    typeof x.id === 'string' &&
    /^[a-zA-Z0-9_-]{8,80}$/.test(x.id) &&
    Number.isInteger(x.revision) &&
    Number(x.revision) >= 1 &&
    Number(x.revision) <= 999 &&
    sources.includes(x.source as EvidenceSource) &&
    kinds.includes(x.kind as EvidenceEntry['kind']) &&
    statuses.includes(x.status as EvidenceStatus) &&
    typeof x.command === 'string' &&
    x.command.length <= 512 &&
    typeof x.environment === 'string' &&
    x.environment.length >= 8 &&
    x.environment.length <= 500 &&
    typeof x.output === 'string' &&
    x.output.length >= 20 &&
    x.output.length <= 12000 &&
    typeof x.recordedAt === 'string' &&
    x.recordedAt.length <= 40 &&
    !Number.isNaN(Date.parse(x.recordedAt))
  );
}
export function parseEvidence(raw: unknown, id: string): EvidenceLedger {
  const empty = emptyEvidence(id);
  if (
    !object(raw) ||
    raw.version !== 1 ||
    raw.challengeId !== id ||
    !Array.isArray(raw.items) ||
    raw.items.length > 50
  )
    return empty;
  if (raw.items.some((x: unknown) => !validEntry(x, id))) return empty;
  const ids = raw.items.map((x: EvidenceEntry) => x.id);
  if (new Set(ids).size !== ids.length) return empty;
  return {
    version: 1,
    challengeId: id,
    items: raw.items.map((x: EvidenceEntry) => ({ ...x })),
  };
}
export function addEvidence(
  ledger: EvidenceLedger,
  data: Omit<EvidenceEntry, 'id' | 'challengeId' | 'recordedAt' | 'status'>,
): EvidenceLedger {
  const previous = parseEvidence(ledger, ledger.challengeId);
  if (previous.items.length !== ledger.items.length)
    throw Error('Registro de evidencias inválido');
  if (previous.items.length >= 50)
    throw Error('Máximo de 50 evidencias por desafío');
  const id = `e${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
  const item: EvidenceEntry = {
    ...data,
    id,
    challengeId: ledger.challengeId,
    recordedAt: new Date().toISOString(),
    status: 'needs-reproduction',
  };
  if (!validEntry(item, ledger.challengeId))
    throw Error(
      'Evidencia inválida: describe entorno y salida real (mínimo 20 caracteres)',
    );
  return { ...previous, items: [...previous.items, item] };
}
export function removeEvidence(
  ledger: EvidenceLedger,
  id: string,
): EvidenceLedger {
  return { ...ledger, items: ledger.items.filter((e) => e.id !== id) };
}
/** Reports reproducibility readiness only. It NEVER upgrades user-provided output to verified. */
export function evidenceReadiness(ledger: EvidenceLedger, revision: number) {
  const items = ledger.items.filter((e) => e.revision === revision);
  const hasTest = items.some(
    (e) => e.kind === 'test' && e.command.trim().length > 0,
  );
  const hasRisk = items.some(
    (e) => e.kind === 'security' || e.kind === 'incident',
  );
  const hasDesign = items.some(
    (e) => e.kind === 'architecture' || e.kind === 'review',
  );
  return {
    count: items.length,
    hasTest,
    hasRisk,
    hasDesign,
    verified: 0 as const,
    readyForExternalReview: hasTest && hasRisk && hasDesign,
  };
}
export function evidenceMarkdown(ledger: EvidenceLedger): string {
  const lines = [
    `# Evidencias aportadas: ${ledger.challengeId}`,
    '',
    '**Estado: NO VERIFICADO**. Los registros son declaraciones del usuario; RustPixel no ha ejecutado Cargo ni validado su procedencia.',
    '',
  ];
  for (const x of ledger.items) {
    lines.push(
      `## ${x.kind} · revisión ${x.revision}`,
      `Fuente declarada: ${x.source}`,
      `Entorno: ${x.environment}`,
      `Fecha declarada: ${x.recordedAt}`,
      `Comando: ${x.command || '(sin comando)'}`,
      '',
      '```text',
      x.output.replace(/```/g, '` ` `'),
      '```',
      '',
    );
  }
  return `${lines.join('\n')}\n`;
}
