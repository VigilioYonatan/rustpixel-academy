import type { SeniorRecord } from '../model/senior.types';
import { evidenceReadiness, parseEvidence } from './evidence';
import type { IncidentId } from './incident';
import { parseIncidentRun } from './incident';

/** A transparent personal learning summary, not skill accreditation. */
export interface SeniorReadiness {
  submitted: number;
  selfReviewed: number;
  incidentsResolved: number;
  evidencePrepared: number;
  externallyVerified: 0;
  incompleteIds: string[];
}
export function calculateSeniorReadiness(
  record: SeniorRecord,
  storage: Pick<Storage, 'getItem'>,
): SeniorReadiness {
  let submitted = 0,
    selfReviewed = 0,
    incidentsResolved = 0,
    evidencePrepared = 0;
  const incompleteIds: string[] = [];
  for (let n = 1; n <= 18; n++) {
    const id = `S${String(n).padStart(2, '0')}` as IncidentId;
    const attempt = record.attempts[`${id}-C01`];
    if (attempt && attempt.status !== 'draft') submitted++;
    if (attempt?.status === 'self-reviewed') selfReviewed++;
    try {
      const raw = storage.getItem(`rustpixel:incident:v1:${id}`);
      if (
        raw !== null &&
        parseIncidentRun(JSON.parse(raw), id).status === 'resolved'
      )
        incidentsResolved++;
    } catch {
      /* malformed saved incident counts as absent */
    }
    try {
      const raw = storage.getItem(`rustpixel:evidence:v1:${id}-C01`);
      if (
        raw !== null &&
        attempt &&
        evidenceReadiness(
          parseEvidence(JSON.parse(raw), `${id}-C01`),
          attempt.revision,
        ).readyForExternalReview
      )
        evidencePrepared++;
    } catch {
      /* malformed evidence counts as absent */
    }
    if (!attempt || attempt.status === 'draft') incompleteIds.push(id);
  }
  return {
    submitted,
    selfReviewed,
    incidentsResolved,
    evidencePrepared,
    externallyVerified: 0,
    incompleteIds,
  };
}
