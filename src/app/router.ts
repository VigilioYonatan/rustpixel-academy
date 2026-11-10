export type Route = {
  name:
    | 'home'
    | 'learn'
    | 'module'
    | 'senior'
    | 'challenge'
    | 'ecosystem'
    | 'games'
    | 'progress'
    | 'settings';
  id?: string;
};
export function parseRoute(hash: string): Route {
  const p = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (p[0] === 'challenge' && p[1] && /^S(?:0[1-9]|1[0-8])-C01$/.test(p[1]))
    return { name: 'challenge', id: p[1] };
  if (p[0] === 'module' && p[1] && /^[BIAS]\d{2}$/.test(p[1]))
    return { name: 'module', id: p[1] };
  if (
    ['learn', 'senior', 'ecosystem', 'games', 'progress', 'settings'].includes(
      p[0],
    )
  )
    return { name: p[0] as Route['name'] };
  return { name: 'home' };
}
export function href(page: string, id?: string) {
  return `#/${page}${id ? `/${id}` : ''}`;
}
