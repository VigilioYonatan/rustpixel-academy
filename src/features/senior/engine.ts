export type Rubric = { name: string; weight: number };
export const rubric: Rubric[] = [
  { name: 'Correctitud y pruebas', weight: 30 },
  { name: 'Fiabilidad y seguridad', weight: 25 },
  { name: 'Arquitectura y mantenibilidad', weight: 20 },
  { name: 'Rendimiento medido', weight: 15 },
  { name: 'Explicación y trade-offs', weight: 10 },
];
export const seniorAreas = [
  {
    icon: '🐞',
    name: 'Production Debugging',
    description: 'Analiza fallos de propiedad, bloqueo y concurrencia',
  },
  {
    icon: '🧩',
    name: 'Code Review Senior',
    description: 'Revisa cambios y explica decisiones',
  },
  {
    icon: '🚨',
    name: 'Incident Simulator',
    description: 'Investiga logs, métricas y escenarios declarados',
  },
  {
    icon: '⚡',
    name: 'Performance Labs',
    description: 'Mide, compara y documenta el rendimiento',
  },
  {
    icon: '🧱',
    name: 'System Design',
    description: 'Arquitectura de sistemas y trade-offs',
  },
  {
    icon: '🛡️',
    name: 'Security & Unsafe',
    description: 'Valida invariantes y fronteras FFI',
  },
];
export function rubricTotal(parts: Rubric[] = rubric) {
  return parts.reduce((a, b) => a + b.weight, 0);
}
