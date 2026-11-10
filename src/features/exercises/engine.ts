export interface Question {
  id: string;
  kind: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}
export function grade(
  q: Question,
  answer: number,
): { correct: boolean; feedback: string } {
  return { correct: q.answer === answer, feedback: q.explanation };
}
export function describeMove(owner: string, to: string): string {
  return `${owner} transfiere la propiedad a ${to}; usar ${owner} después produce un error de compilación si el valor no implementa Copy.`;
}
