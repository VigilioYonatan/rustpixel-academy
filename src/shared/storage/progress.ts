export type Theme = 'dark' | 'light';
export type Locale = 'es' | 'en' | 'ja' | 'zh-Hans' | 'pt-BR' | 'fr';
export interface Preferences {
  theme: Theme;
  locale: Locale;
  motion: boolean;
  sound: boolean;
  seniorEnabled: boolean;
}
export interface Progress {
  completed: string[];
  answers: Record<string, number>;
  drafts: Record<string, string>;
  xp: number;
  currentModule: string;
  achievements: string[];
}
export const defaultPreferences: Preferences = {
  theme: 'dark',
  locale: 'es',
  motion: true,
  sound: false,
  seniorEnabled: true,
};
export const defaultProgress: Progress = {
  completed: [],
  answers: {},
  drafts: {},
  xp: 0,
  currentModule: 'B01',
  achievements: [],
};
export const keys = {
  preferences: 'rustpixel:preferences:v1',
  progress: 'rustpixel:progress:v1',
};
export function safeRead<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    if (!value) return fallback;
    const parsed: unknown = JSON.parse(value);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed))
      return fallback;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}
export function safeWrite(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export function validateImport(raw: unknown): Progress {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw))
    throw Error('Formato inválido');
  const o = raw as Record<string, unknown>;
  if (
    !Array.isArray(o.completed) ||
    o.completed.some((x) => typeof x !== 'string' || !/^[BIAS]\d{2}$/.test(x))
  )
    throw Error('IDs de progreso inválidos');
  if (
    typeof o.xp !== 'number' ||
    !Number.isFinite(o.xp) ||
    o.xp < 0 ||
    o.xp > 1_000_000
  )
    throw Error('XP inválidos');
  if (
    typeof o.currentModule !== 'string' ||
    !/^[BIAS]\d{2}$/.test(o.currentModule)
  )
    throw Error('Módulo inválido');
  if (!o.answers || typeof o.answers !== 'object' || Array.isArray(o.answers))
    throw Error('Respuestas inválidas');
  if (!o.drafts || typeof o.drafts !== 'object' || Array.isArray(o.drafts))
    throw Error('Borradores inválidos');
  const drafts = o.drafts as Record<string, unknown>;
  if (
    Object.keys(drafts).length > 100 ||
    Object.values(drafts).some((v) => typeof v !== 'string' || v.length > 20000)
  )
    throw Error('Demasiados borradores');
  return {
    completed: [...new Set(o.completed)] as string[],
    xp: o.xp,
    currentModule: o.currentModule,
    answers: o.answers as Record<string, number>,
    drafts: drafts as Record<string, string>,
    achievements: Array.isArray(o.achievements)
      ? o.achievements
          .filter((x): x is string => typeof x === 'string')
          .slice(0, 100)
      : [],
  };
}
export function finishModule(
  p: Progress,
  id: string,
  reward: number,
): Progress {
  if (p.completed.includes(id)) return p;
  return {
    ...p,
    completed: [...p.completed, id],
    xp: p.xp + reward,
    currentModule: id,
    achievements:
      p.completed.length === 0
        ? ['Primer módulo', ...p.achievements]
        : p.achievements,
  };
}
