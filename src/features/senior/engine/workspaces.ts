/** Explicitly local educational artifacts; never represent third-party attestations or Cargo runs. */
export type ReviewSeverity = 'blocker' | 'major' | 'minor' | 'question';
export interface ReviewComment {
  id: string;
  line: number;
  severity: ReviewSeverity;
  message: string;
  createdAt: string;
}
export interface ReviewWorkspace {
  version: 1;
  challengeId: string;
  comments: ReviewComment[];
}
export interface ArchitectureNode {
  id: string;
  name: string;
  kind:
    | 'client'
    | 'service'
    | 'queue'
    | 'database'
    | 'cache'
    | 'worker'
    | 'gateway';
}
export interface ArchitectureEdge {
  from: string;
  to: string;
  protocol: string;
}
export interface ArchitectureWorkspace {
  version: 1;
  challengeId: string;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  context: string;
  decision: string;
  alternatives: string;
  consequences: string;
  verification: string;
}
const asRecord = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object' && !Array.isArray(x);
const idPattern = /^S(?:0[1-9]|1[0-8])-C01$/;
const nodePattern = /^[a-z][a-z0-9_-]{0,31}$/;
const kinds = [
  'client',
  'service',
  'queue',
  'database',
  'cache',
  'worker',
  'gateway',
] as const;
const severities = ['blocker', 'major', 'minor', 'question'] as const;
function reasonable(s: unknown, limit: number): s is string {
  return typeof s === 'string' && s.length <= limit;
}
export function emptyReview(challengeId: string): ReviewWorkspace {
  if (!idPattern.test(challengeId)) throw Error('Desafío inválido');
  return { version: 1, challengeId, comments: [] };
}
export function parseReview(x: unknown, id: string): ReviewWorkspace {
  const empty = emptyReview(id);
  if (
    !asRecord(x) ||
    x.version !== 1 ||
    x.challengeId !== id ||
    !Array.isArray(x.comments) ||
    x.comments.length > 80
  )
    return empty;
  const comments: ReviewComment[] = [];
  const seen = new Set<string>();
  for (const c of x.comments) {
    if (
      !asRecord(c) ||
      !reasonable(c.id, 64) ||
      !/^r-[a-z0-9-]+$/.test(c.id) ||
      seen.has(c.id) ||
      !Number.isInteger(c.line) ||
      Number(c.line) < 1 ||
      Number(c.line) > 10000 ||
      !severities.includes(c.severity as ReviewSeverity) ||
      !reasonable(c.message, 1200) ||
      c.message.trim().length < 8 ||
      !reasonable(c.createdAt, 40) ||
      Number.isNaN(Date.parse(c.createdAt))
    )
      return empty;
    seen.add(c.id);
    comments.push(c as unknown as ReviewComment);
  }
  return { ...empty, comments };
}
export function addReviewComment(
  x: ReviewWorkspace,
  line: number,
  severity: ReviewSeverity,
  message: string,
): ReviewWorkspace {
  if (
    !Number.isInteger(line) ||
    line < 1 ||
    line > 10000 ||
    !severities.includes(severity) ||
    message.trim().length < 8 ||
    message.length > 1200 ||
    x.comments.length >= 80
  )
    throw Error('Comentario inválido, demasiado corto o límite alcanzado');
  const n =
    x.comments.reduce(
      (a, c) => Math.max(a, Number(c.id.split('-').pop()) || 0),
      0,
    ) + 1;
  return {
    ...x,
    comments: [
      ...x.comments,
      {
        id: `r-${n}`,
        line,
        severity,
        message: message.trim(),
        createdAt: new Date().toISOString(),
      },
    ],
  };
}
export function removeReviewComment(
  x: ReviewWorkspace,
  commentId: string,
): ReviewWorkspace {
  return { ...x, comments: x.comments.filter((c) => c.id !== commentId) };
}
export function emptyArchitecture(challengeId: string): ArchitectureWorkspace {
  if (!idPattern.test(challengeId)) throw Error('Desafío inválido');
  return {
    version: 1,
    challengeId,
    nodes: [],
    edges: [],
    context: '',
    decision: '',
    alternatives: '',
    consequences: '',
    verification: '',
  };
}
export function parseArchitecture(
  x: unknown,
  id: string,
): ArchitectureWorkspace {
  const blank = emptyArchitecture(id);
  if (
    !asRecord(x) ||
    x.version !== 1 ||
    x.challengeId !== id ||
    !Array.isArray(x.nodes) ||
    !Array.isArray(x.edges) ||
    x.nodes.length > 32 ||
    x.edges.length > 96
  )
    return blank;
  if (
    ![
      'context',
      'decision',
      'alternatives',
      'consequences',
      'verification',
    ].every((k) => reasonable(x[k], 5000))
  )
    return blank;
  const nodes: ArchitectureNode[] = [];
  const ids = new Set<string>();
  for (const n of x.nodes) {
    if (
      !asRecord(n) ||
      typeof n.id !== 'string' ||
      !nodePattern.test(n.id) ||
      ids.has(n.id) ||
      !reasonable(n.name, 80) ||
      n.name.trim().length === 0 ||
      !kinds.includes(n.kind as ArchitectureNode['kind'])
    )
      return blank;
    ids.add(n.id);
    nodes.push(n as unknown as ArchitectureNode);
  }
  const edges: ArchitectureEdge[] = [];
  const pairs = new Set<string>();
  for (const e of x.edges) {
    if (
      !asRecord(e) ||
      typeof e.from !== 'string' ||
      typeof e.to !== 'string' ||
      e.from === e.to ||
      !ids.has(e.from) ||
      !ids.has(e.to) ||
      !reasonable(e.protocol, 80) ||
      e.protocol.trim().length === 0
    )
      return blank;
    const key = `${e.from}->${e.to}`;
    if (pairs.has(key)) return blank;
    pairs.add(key);
    edges.push(e as unknown as ArchitectureEdge);
  }
  return {
    ...blank,
    nodes,
    edges,
    context: x.context as string,
    decision: x.decision as string,
    alternatives: x.alternatives as string,
    consequences: x.consequences as string,
    verification: x.verification as string,
  };
}
export function addArchitectureNode(
  x: ArchitectureWorkspace,
  node: ArchitectureNode,
): ArchitectureWorkspace {
  if (
    x.nodes.length >= 32 ||
    !nodePattern.test(node.id) ||
    x.nodes.some((n) => n.id === node.id) ||
    !node.name.trim() ||
    node.name.length > 80 ||
    !kinds.includes(node.kind)
  )
    throw Error('Nodo inválido o repetido');
  return { ...x, nodes: [...x.nodes, node] };
}
export function removeArchitectureNode(
  x: ArchitectureWorkspace,
  id: string,
): ArchitectureWorkspace {
  return {
    ...x,
    nodes: x.nodes.filter((n) => n.id !== id),
    edges: x.edges.filter((e) => e.from !== id && e.to !== id),
  };
}
export function addArchitectureEdge(
  x: ArchitectureWorkspace,
  edge: ArchitectureEdge,
): ArchitectureWorkspace {
  if (
    x.edges.length >= 96 ||
    edge.from === edge.to ||
    !x.nodes.some((n) => n.id === edge.from) ||
    !x.nodes.some((n) => n.id === edge.to) ||
    x.edges.some((e) => e.from === edge.from && e.to === edge.to) ||
    !edge.protocol.trim() ||
    edge.protocol.length > 80
  )
    throw Error('Conexión inválida o duplicada');
  return { ...x, edges: [...x.edges, edge] };
}
export function assessArchitecture(x: ArchitectureWorkspace): string[] {
  const issues: string[] = [];
  if (x.nodes.length < 2) issues.push('Define al menos dos componentes');
  if (!x.edges.length) issues.push('Documenta al menos una conexión');
  if (x.context.trim().length < 40)
    issues.push('Describe restricciones y contexto (mínimo 40 caracteres)');
  if (x.decision.trim().length < 40)
    issues.push('Justifica la decisión (mínimo 40 caracteres)');
  if (x.alternatives.trim().length < 25)
    issues.push('Compara al menos una alternativa (mínimo 25 caracteres)');
  if (x.consequences.trim().length < 25)
    issues.push('Explica consecuencias y riesgos (mínimo 25 caracteres)');
  if (x.verification.trim().length < 25)
    issues.push('Propón una validación reproducible (mínimo 25 caracteres)');
  return issues;
}
export function architectureADR(x: ArchitectureWorkspace): string {
  const safe = (s: string) => s.split('\r').join('').split('\0').join('');
  return `# ADR — ${x.challengeId}\n\nEstado: Propuesto por estudiante (NO VERIFICADO)\n\n## Contexto\n${safe(x.context)}\n\n## Decisión\n${safe(x.decision)}\n\n## Alternativas\n${safe(x.alternatives)}\n\n## Consecuencias y riesgos\n${safe(x.consequences)}\n\n## Verificación planeada\n${safe(x.verification)}\n\n## Componentes\n${x.nodes.map((n) => `- ${n.id} (${n.kind}): ${safe(n.name)}`).join('\n')}\n\n## Relaciones\n${x.edges.map((e) => `- ${e.from} -> ${e.to} (${safe(e.protocol)})`).join('\n')}\n`;
}
