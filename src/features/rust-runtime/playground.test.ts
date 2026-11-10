import { expect, it } from 'vitest';
import { isLocalExecutable, playgroundUrl } from './playground';

it('encodes Rust without script injection', () => {
  const url = new URL(playgroundUrl('println!("<script>");'));
  expect(url.hostname).toBe('play.rust-lang.org');
  expect(url.searchParams.get('code')).toContain('<script>');
});
it('does not pretend local rust compilation', () =>
  expect(isLocalExecutable('fn main() {}')).toBe(false));
