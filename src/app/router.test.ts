import { expect, it } from 'vitest';
import { parseRoute } from './router';

it('supports GH Pages hash navigation', () => {
  expect(parseRoute('#/module/S07')).toEqual({ name: 'module', id: 'S07' });
  expect(parseRoute('#/')).toEqual({ name: 'home' });
});
