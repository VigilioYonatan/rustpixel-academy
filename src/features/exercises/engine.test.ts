import { expect, it } from 'vitest';
import { describeMove, grade } from './engine';

it('grade checks exact option', () => {
  const q = {
    id: 'q',
    kind: 'quiz',
    question: '?',
    options: ['a', 'b'],
    answer: 1,
    explanation: 'b',
  };
  expect(grade(q, 1).correct).toBe(true);
  expect(grade(q, 0).correct).toBe(false);
});
it('movement explanation reflects original owner', () =>
  expect(describeMove('a', 'b')).toContain('a transfiere'));
