export type Decision = 'a' | 'b' | 'c';
export type Status = 'draft' | 'submitted' | 'self-reviewed';
export type Criterion =
  | 'correctness'
  | 'reliability'
  | 'architecture'
  | 'performance'
  | 'reasoning';

export const CRITERIA: ReadonlyArray<{
  id: Criterion;
  label: string;
  weight: number;
}> = [
  { id: 'correctness', label: 'Correctitud y pruebas', weight: 30 },
  { id: 'reliability', label: 'Fiabilidad y seguridad', weight: 25 },
  { id: 'architecture', label: 'Arquitectura y mantenibilidad', weight: 20 },
  { id: 'performance', label: 'Rendimiento medido', weight: 15 },
  { id: 'reasoning', label: 'Justificación y trade-offs', weight: 10 },
];

export interface ChallengeBrief {
  id: string;
  moduleId: string;
  title: string;
  scenario: string;
  mission: string;
  constraints: string[];
  evidence: string[];
  hints: string[];
}

export interface DecisionCase {
  question: string;
  options: [string, string, string];
  recommended: Decision;
  reason: string;
  timeline: string[];
}

export interface SeniorAttempt {
  id: string;
  challengeId: string;
  status: Status;
  revision: number;
  decision?: Decision;
  notes: string;
  code: string;
  evidenceNotes: string;
  checks: boolean[];
  scores: Record<Criterion, number>;
  submittedAt?: string;
  reviewedAt?: string;
  updatedAt: string;
}

export interface SeniorRecord {
  version: 2;
  attempts: Record<string, SeniorAttempt>;
  history: Record<string, SeniorAttempt[]>;
}

export type AcceptanceGateId =
  | 'correctness'
  | 'security'
  | 'architecture'
  | 'operations'
  | 'performance';
export type GateStatus = 'missing' | 'declared' | 'externally-required';

export interface AcceptanceGate {
  id: AcceptanceGateId;
  label: string;
  requirement: string;
  commandSnippet: string;
  status: GateStatus;
}

export interface ModuleAcceptance {
  moduleId: string;
  challengeId: string;
  gates: AcceptanceGate[];
  declaredCount: number;
  missingCount: number;
  externallyRequiredCount: number;
  externallyVerified: 0;
}

export interface AcceptanceSummary {
  totalGates: 90;
  totalDeclared: number;
  totalMissing: number;
  totalExternallyRequired: number;
  externallyVerified: 0;
  modules: Record<string, ModuleAcceptance>;
}
