import { describe, expect, it } from 'vitest';
import { defaultProgress, finishModule, validateImport } from './progress';

describe('progress', () => {
  it('does not double count XP', () => {
    const p = finishModule(defaultProgress, 'B01', 30);
    expect(finishModule(p, 'B01', 30).xp).toBe(30);
    expect(p.completed).toEqual(['B01']);
  });
  it('rejects malformed import', () => {
    expect(() =>
      validateImport({
        completed: ['../secret'],
        xp: 30,
        currentModule: 'B01',
        answers: {},
        drafts: {},
      }),
    ).toThrow();
  });
  it('accepts valid export', () => {
    expect(validateImport({ ...defaultProgress }).completed).toEqual([]);
  });
});
