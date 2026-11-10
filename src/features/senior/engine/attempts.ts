import type {
  ChallengeBrief,
  Criterion,
  Decision,
  SeniorAttempt,
  SeniorRecord,
} from '../model/senior.types';
import { CRITERIA } from '../model/senior.types';
export const SENIOR_KEY = 'rustpixel:senior:v2';
export const EMPTY_SENIOR: SeniorRecord = {
  version: 2,
  attempts: {},
  history: {},
};
const isObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
const isDate = (v: unknown) =>
  typeof v === 'string' && v.length <= 40 && !Number.isNaN(Date.parse(v));
function validAttempt(v: unknown, challengeId: string): v is SeniorAttempt {
  if (
    !isObject(v) ||
    v.challengeId !== challengeId ||
    v.id !== challengeId ||
    !['draft', 'submitted', 'self-reviewed'].includes(String(v.status))
  )
    return false;
  if (
    !Number.isInteger(v.revision) ||
    Number(v.revision) < 1 ||
    Number(v.revision) > 999
  )
    return false;
  if (!['a', 'b', 'c', undefined].includes(v.decision as string | undefined))
    return false;
  if (
    typeof v.notes !== 'string' ||
    v.notes.length > 12000 ||
    typeof v.code !== 'string' ||
    v.code.length > 30000 ||
    typeof v.evidenceNotes !== 'string' ||
    v.evidenceNotes.length > 8000
  )
    return false;
  if (
    !Array.isArray(v.checks) ||
    v.checks.length > 20 ||
    v.checks.some((c) => typeof c !== 'boolean')
  )
    return false;
  const scores = v.scores;
  if (
    !isObject(scores) ||
    CRITERIA.some(
      (c) =>
        !Number.isInteger(scores[c.id]) ||
        Number(scores[c.id]) < 0 ||
        Number(scores[c.id]) > 4,
    )
  )
    return false;
  return (
    isDate(v.updatedAt) &&
    (v.submittedAt === undefined || isDate(v.submittedAt)) &&
    (v.reviewedAt === undefined || isDate(v.reviewedAt))
  );
}
export function parseSeniorRecord(v: unknown): SeniorRecord {
  if (
    !isObject(v) ||
    v.version !== 2 ||
    !isObject(v.attempts) ||
    Object.keys(v.attempts).length > 100
  )
    return EMPTY_SENIOR;
  const attempts: Record<string, SeniorAttempt> = {};
  for (const [id, attempt] of Object.entries(v.attempts)) {
    if (/^S(?:0[1-9]|1[0-8])-C01$/.test(id) && validAttempt(attempt, id))
      attempts[id] = attempt;
  }
  const history: Record<string, SeniorAttempt[]> = {};
  if (isObject(v.history)) {
    for (const [id, list] of Object.entries(v.history)) {
      if (
        /^S(?:0[1-9]|1[0-8])-C01$/.test(id) &&
        Array.isArray(list) &&
        list.length <= 20
      ) {
        history[id] = list.filter((item) => validAttempt(item, id));
      }
    }
  }
  return { version: 2, attempts, history };
}
export function readSeniorRecord(): SeniorRecord {
  try {
    return parseSeniorRecord(
      JSON.parse(localStorage.getItem(SENIOR_KEY) ?? 'null'),
    );
  } catch {
    return EMPTY_SENIOR;
  }
}
export function writeSeniorRecord(v: SeniorRecord): boolean {
  try {
    localStorage.setItem(SENIOR_KEY, JSON.stringify(v));
    return true;
  } catch {
    return false;
  }
}
const now = () => new Date().toISOString();
export function newAttempt(challenge: ChallengeBrief): SeniorAttempt {
  return {
    id: challenge.id,
    challengeId: challenge.id,
    status: 'draft',
    revision: 1,
    notes: '',
    code: '',
    evidenceNotes: '',
    checks: challenge.evidence.map(() => false),
    scores: {
      correctness: 0,
      reliability: 0,
      architecture: 0,
      performance: 0,
      reasoning: 0,
    },
    updatedAt: now(),
  };
}
export function updateAttempt(
  a: SeniorAttempt,
  fields: Partial<
    Pick<
      SeniorAttempt,
      'decision' | 'notes' | 'code' | 'evidenceNotes' | 'checks'
    >
  >,
): SeniorAttempt {
  if (a.status !== 'draft')
    throw Error('El intento está cerrado; crea una nueva revisión');
  if (
    (fields.notes !== undefined && fields.notes.length > 12000) ||
    (fields.code !== undefined && fields.code.length > 30000) ||
    (fields.evidenceNotes !== undefined &&
      fields.evidenceNotes.length > 8000) ||
    (fields.checks !== undefined &&
      (fields.checks.length > 20 ||
        fields.checks.some((c) => typeof c !== 'boolean')))
  )
    throw Error('Datos del intento exceden el tamaño permitido');
  return { ...a, ...fields, updatedAt: now() };
}
export function submitAttempt(a: SeniorAttempt): SeniorAttempt {
  if (a.status !== 'draft') throw Error('El intento ya se entregó');
  if (a.notes.trim().length < 50)
    throw Error(
      'Explica el diagnóstico y las decisiones con al menos 50 caracteres',
    );
  if (a.evidenceNotes.trim().length < 25)
    throw Error(
      'Describe cómo comprobarías la solución con al menos 25 caracteres',
    );
  if (!a.decision) throw Error('Selecciona una decisión técnica');
  return { ...a, status: 'submitted', submittedAt: now(), updatedAt: now() };
}
export function selfReview(
  a: SeniorAttempt,
  scores: Record<Criterion, number>,
): SeniorAttempt {
  if (a.status !== 'submitted' && a.status !== 'self-reviewed')
    throw Error('Entrega antes de autoevaluar');
  if (
    CRITERIA.some(
      (c) =>
        !Number.isInteger(scores[c.id]) || scores[c.id] < 0 || scores[c.id] > 4,
    )
  )
    throw Error('Cada criterio requiere una puntuación de 0 a 4');
  return {
    ...a,
    status: 'self-reviewed',
    scores: { ...scores },
    reviewedAt: now(),
    updatedAt: now(),
  };
}
export function scoreAttempt(a: SeniorAttempt): number | null {
  if (a.status !== 'self-reviewed') return null;
  return CRITERIA.reduce((acc, c) => acc + (c.weight * a.scores[c.id]) / 4, 0);
}
export function nextRevision(a: SeniorAttempt): SeniorAttempt {
  if (a.status === 'draft' || a.revision >= 999)
    throw Error('No puede iniciarse otra revisión');
  return {
    ...a,
    status: 'draft',
    revision: a.revision + 1,
    submittedAt: undefined,
    reviewedAt: undefined,
    updatedAt: now(),
    scores: {
      correctness: 0,
      reliability: 0,
      architecture: 0,
      performance: 0,
      reasoning: 0,
    },
  };
}
export function decisionResult(
  decision: Decision | undefined,
  recommended: Decision,
): 'unanswered' | 'supported' | 'needs-review' {
  return decision === undefined
    ? 'unanswered'
    : decision === recommended
      ? 'supported'
      : 'needs-review';
}
export function attemptedCount(v: SeniorRecord): number {
  return Object.values(v.attempts).filter((a) => a.status !== 'draft').length;
}
