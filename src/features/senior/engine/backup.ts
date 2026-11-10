import type { SeniorRecord } from '../model/senior.types';
import { EMPTY_SENIOR, parseSeniorRecord, SENIOR_KEY } from './attempts';
import type { EvidenceLedger } from './evidence';
import { evidenceKey, parseEvidence } from './evidence';
import type { IncidentId, IncidentRun } from './incident';
import { parseIncidentRun } from './incident';
import type { ArchitectureWorkspace, ReviewWorkspace } from './workspaces';
import { parseArchitecture, parseReview } from './workspaces';
export interface SeniorBackup {
  format: 'rustpixel-senior-backup';
  version: 1;
  exportedAt: string;
  senior: SeniorRecord;
  reviews: Record<string, ReviewWorkspace>;
  architectures: Record<string, ArchitectureWorkspace>;
  incidents: Partial<Record<IncidentId, IncidentRun>>;
  evidence?: Record<string, EvidenceLedger>;
}
const validChallenge = (id: string) => /^S(?:0[1-9]|1[0-8])-C01$/.test(id);
const isRecord = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object' && !Array.isArray(x);
const incidentIds = [
  'S01',
  'S02',
  'S03',
  'S04',
  'S05',
  'S06',
  'S07',
  'S08',
  'S09',
  'S10',
  'S11',
  'S12',
  'S13',
  'S14',
  'S15',
  'S16',
  'S17',
  'S18',
] as const;
const parseMaybe = (raw: string | null): unknown => {
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
export function createSeniorBackup(
  storage: Pick<Storage, 'getItem'>,
): SeniorBackup {
  const reviews: Record<string, ReviewWorkspace> = {};
  const architectures: Record<string, ArchitectureWorkspace> = {};
  const evidence: Record<string, EvidenceLedger> = {};
  for (let i = 1; i <= 18; i++) {
    const id = `S${String(i).padStart(2, '0')}-C01`;
    const review = storage.getItem(`rustpixel:review:v1:${id}`);
    const architecture = storage.getItem(`rustpixel:architecture:v1:${id}`);
    if (review !== null) reviews[id] = parseReview(parseMaybe(review), id);
    if (architecture !== null)
      architectures[id] = parseArchitecture(parseMaybe(architecture), id);
    const evidenceRaw = storage.getItem(evidenceKey(id));
    if (evidenceRaw !== null)
      evidence[id] = parseEvidence(parseMaybe(evidenceRaw), id);
  }
  const incidents: Partial<Record<IncidentId, IncidentRun>> = {};
  for (const id of incidentIds) {
    const raw = storage.getItem(`rustpixel:incident:v1:${id}`);
    if (raw !== null) incidents[id] = parseIncidentRun(parseMaybe(raw), id);
  }
  return {
    format: 'rustpixel-senior-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    senior: parseSeniorRecord(parseMaybe(storage.getItem(SENIOR_KEY))),
    reviews,
    architectures,
    incidents,
    evidence,
  };
}
export function parseSeniorBackup(raw: unknown): SeniorBackup {
  if (
    !isRecord(raw) ||
    raw.format !== 'rustpixel-senior-backup' ||
    raw.version !== 1 ||
    typeof raw.exportedAt !== 'string' ||
    Number.isNaN(Date.parse(raw.exportedAt)) ||
    !isRecord(raw.senior) ||
    !isRecord(raw.reviews) ||
    !isRecord(raw.architectures) ||
    !isRecord(raw.incidents)
  )
    throw Error('Respaldo Senior incompatible');
  if (
    Object.keys(raw.reviews).length > 18 ||
    Object.keys(raw.architectures).length > 18 ||
    Object.keys(raw.incidents).length > 18
  )
    throw Error('Respaldo excede el máximo de elementos');
  const senior = parseSeniorRecord(raw.senior);
  if (
    raw.senior.version !== 2 ||
    !isRecord(raw.senior.attempts) ||
    Object.keys(raw.senior.attempts).length !==
      Object.keys(senior.attempts).length
  )
    throw Error('Intentos Senior corruptos');
  const reviews: Record<string, ReviewWorkspace> = {};
  for (const [id, x] of Object.entries(raw.reviews)) {
    if (!validChallenge(id)) throw Error('ID de revisión inválido');
    const parsed = parseReview(x, id);
    if (JSON.stringify(parsed) !== JSON.stringify(x))
      throw Error('Revisión de código corrupta');
    reviews[id] = parsed;
  }
  const architectures: Record<string, ArchitectureWorkspace> = {};
  for (const [id, x] of Object.entries(raw.architectures)) {
    if (!validChallenge(id)) throw Error('ID de arquitectura inválido');
    const parsed = parseArchitecture(x, id);
    if (JSON.stringify(parsed) !== JSON.stringify(x))
      throw Error('Canvas de arquitectura corrupto');
    architectures[id] = parsed;
  }
  const evidence: Record<string, EvidenceLedger> = {};
  if (raw.evidence !== undefined) {
    if (!isRecord(raw.evidence) || Object.keys(raw.evidence).length > 18)
      throw Error('Bitácora de evidencias inválida');
    for (const [id, x] of Object.entries(raw.evidence)) {
      if (!validChallenge(id))
        throw Error('Identificador de evidencia inválido');
      const parsed = parseEvidence(x, id);
      if (JSON.stringify(parsed) !== JSON.stringify(x))
        throw Error('Evidencia corrupta');
      evidence[id] = parsed;
    }
  }
  const incidents: Partial<Record<IncidentId, IncidentRun>> = {};
  for (const [id, x] of Object.entries(raw.incidents)) {
    if (!incidentIds.includes(id as IncidentId))
      throw Error('ID de incidente inválido');
    const parsed = parseIncidentRun(x, id as IncidentId);
    if (JSON.stringify(parsed) !== JSON.stringify(x))
      throw Error('Incidente corrupto');
    incidents[id as IncidentId] = parsed;
  }
  return {
    format: 'rustpixel-senior-backup',
    version: 1,
    exportedAt: raw.exportedAt,
    senior,
    reviews,
    architectures,
    incidents,
    evidence,
  };
}
/** Best-effort rollback: localStorage is not transactional. Never claim restoration success on thrown writes. */
export function restoreSeniorBackup(
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>,
  backup: SeniorBackup,
): void {
  const parsed = parseSeniorBackup(backup);
  const entries: Record<string, string | null> = {
    [SENIOR_KEY]: JSON.stringify(parsed.senior),
  };
  for (let i = 1; i <= 18; i++) {
    const id = `S${String(i).padStart(2, '0')}-C01`;
    entries[`rustpixel:review:v1:${id}`] = null;
    entries[`rustpixel:architecture:v1:${id}`] = null;
    entries[evidenceKey(id)] = null;
  }
  for (const id of incidentIds) entries[`rustpixel:incident:v1:${id}`] = null;
  for (const [id, v] of Object.entries(parsed.reviews))
    entries[`rustpixel:review:v1:${id}`] = JSON.stringify(v);
  for (const [id, v] of Object.entries(parsed.architectures))
    entries[`rustpixel:architecture:v1:${id}`] = JSON.stringify(v);
  for (const [id, v] of Object.entries(parsed.evidence ?? {}))
    entries[evidenceKey(id)] = JSON.stringify(v);
  for (const [id, v] of Object.entries(parsed.incidents))
    entries[`rustpixel:incident:v1:${id}`] = JSON.stringify(v);
  const original = new Map<string, string | null>();
  const changed: string[] = [];
  try {
    for (const [key, value] of Object.entries(entries)) {
      original.set(key, storage.getItem(key));
      if (value === null) storage.removeItem(key);
      else storage.setItem(key, value);
      changed.push(key);
    }
  } catch (err) {
    for (const key of changed.reverse()) {
      const old = original.get(key);
      try {
        if (old === null || old === undefined) storage.removeItem(key);
        else storage.setItem(key, old);
      } catch {
        throw Error(
          'Importación falló y no fue posible restaurar todo el almacenamiento; recupera tu respaldo anterior',
        );
      }
    }
    throw err;
  }
}
export function blankSeniorBackup(): SeniorBackup {
  return {
    format: 'rustpixel-senior-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    senior: EMPTY_SENIOR,
    reviews: {},
    architectures: {},
    incidents: {},
    evidence: {},
  };
}
