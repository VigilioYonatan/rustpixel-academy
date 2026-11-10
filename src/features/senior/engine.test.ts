import { expect, it } from 'vitest';
import { rubricTotal } from './engine';

it('senior criteria add to 100', () => expect(rubricTotal()).toBe(100));
