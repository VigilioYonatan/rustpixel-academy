import { rust } from '@codemirror/lang-rust';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { tags } from '@lezer/highlight';
import { signal } from '@preact/signals';
import { basicSetup, EditorView } from 'codemirror';
import {
  Award,
  BookOpen,
  Boxes,
  Check,
  ChevronLeft,
  ChevronRight,
  Code,
  Cpu,
  Crown,
  Download,
  ExternalLink,
  Flame,
  Gamepad2,
  Home as HomeIcon,
  Layers,
  Moon,
  Play,
  RotateCcw,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Sun,
  Terminal,
  Trophy,
  Upload,
} from 'lucide-preact';
import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import modulesRaw from '../content/course.json';
import paths from '../content/ecosystem/paths.json';
import questions from '../content/games/questions.json';
import { grade } from '../features/exercises/engine';
import { playgroundUrl } from '../features/rust-runtime/playground';
import {
  SeniorChallenge,
  SeniorDashboard,
} from '../features/senior/pages/SeniorExperience';
import { locales, ui } from '../i18n/translations';
import type { Locale, Preferences, Progress } from '../shared/storage/progress';
import {
  defaultPreferences,
  defaultProgress,
  finishModule,
  keys,
  safeRead,
  safeWrite,
  validateImport,
} from '../shared/storage/progress';
import { href, parseRoute } from './router';

const mods = modulesRaw;
const preferences = signal<Preferences>(
  typeof localStorage !== 'undefined'
    ? safeRead(keys.preferences, defaultPreferences)
    : defaultPreferences,
);
const progress = signal<Progress>(
  typeof localStorage !== 'undefined'
    ? safeRead(keys.progress, defaultProgress)
    : defaultProgress,
);

const image = (name: string) =>
  `${import.meta.env.BASE_URL}assets/ferris/${name}.png`;
const total = (level?: string) =>
  level ? mods.filter((m) => m.level === level).length : mods.length;

function updatePrefs(change: Partial<Preferences>) {
  preferences.value = { ...preferences.value, ...change };
  safeWrite(keys.preferences, preferences.value);
}

function updateProgress(change: Progress) {
  progress.value = change;
  safeWrite(keys.progress, change);
}

function LinkButton({
  to,
  children,
  kind = 'btn-outline',
}: {
  to: string;
  children: ComponentChildren;
  kind?: string;
}) {
  return (
    <a class={`btn ${kind}`} href={to}>
      {children}
    </a>
  );
}

function Panel({
  title,
  children,
  className = '',
}: {
  title: string;
  children: ComponentChildren;
  className?: string;
}) {
  return (
    <section class={`card ${className}`}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function Bar({ value, max }: { value: number; max: number }) {
  return (
    <div
      class="progress-bar"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      style={{ marginTop: 8 }}
    >
      <i
        style={{
          width: `${Math.min(100, Math.round((value / Math.max(max, 1)) * 100))}%`,
        }}
      />
    </div>
  );
}

const rustForgeHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: '#f2be58', fontWeight: 'bold' },
  { tag: tags.definition(tags.variableName), color: '#6fc7bd' },
  { tag: tags.function(tags.variableName), color: '#6fc7bd' },
  { tag: tags.variableName, color: '#e2e8f0' },
  { tag: tags.macroName, color: '#e76f36', fontWeight: 'bold' },
  { tag: tags.typeName, color: '#68c48c', fontWeight: 'bold' },
  { tag: tags.string, color: '#f87171' },
  { tag: tags.number, color: '#a78bfa' },
  { tag: tags.bool, color: '#f2be58' },
  { tag: tags.comment, color: '#64748b', fontStyle: 'italic' },
  { tag: tags.operator, color: '#e76f36' },
  { tag: tags.punctuation, color: '#94a3b8' },
  { tag: tags.special(tags.string), color: '#fca5a5' },
]);

const rustForgeTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#0b1423',
      color: '#e2e8f0',
      fontFamily:
        "ui-monospace, 'Cascadia Code', 'Fira Code', Consolas, monospace",
      fontSize: '13.5px',
      height: '100%',
    },
    '.cm-scroller': {
      fontFamily: 'inherit',
      lineHeight: '1.6',
    },
    '.cm-content': {
      caretColor: '#e76f36',
      padding: '10px 0',
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: '#e76f36',
      borderLeftWidth: '2px',
    },
    '&.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: 'rgba(231, 111, 54, 0.28) !important',
    },
    '.cm-gutters': {
      backgroundColor: '#080d17',
      color: '#64748b',
      border: 'none',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      paddingRight: '6px',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'rgba(231, 111, 54, 0.18)',
      color: '#f2be58',
      fontWeight: 'bold',
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
    },
    '.cm-line': {
      paddingLeft: '10px',
      paddingRight: '10px',
    },
  },
  { dark: true },
);

function CodeEditor({
  moduleId,
  initial,
}: {
  moduleId: string;
  initial: string;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const saved = progress.value.drafts[moduleId] ?? initial;

  useEffect(() => {
    if (!mount.current) return;
    const editor = new EditorView({
      state: EditorState.create({
        doc: saved,
        extensions: [
          basicSetup,
          rust(),
          rustForgeTheme,
          syntaxHighlighting(rustForgeHighlight),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) {
              const code = u.state.doc.toString().slice(0, 20000);
              updateProgress({
                ...progress.value,
                drafts: { ...progress.value.drafts, [moduleId]: code },
              });
            }
          }),
        ],
      }),
      parent: mount.current,
    });
    view.current = editor;
    return () => {
      editor.destroy();
      view.current = null;
    };
  }, [moduleId]);

  return (
    <div class="editor-card">
      <div class="panel-title">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Code size={16} /> main.rs
        </span>
        <span class="tag info">Rust 2024</span>
      </div>
      <div class="codebox">
        <div class="editor-host" ref={mount} />
      </div>
      <div class="editor-actions">
        <button
          type="button"
          class="btn btn-primary"
          onClick={() =>
            window.open(
              playgroundUrl(view.current?.state.doc.toString() ?? saved),
              '_blank',
              'noopener,noreferrer',
            )
          }
        >
          <Play size={14} fill="currentColor" /> Rust Playground
          <ExternalLink size={14} />
        </button>
        <button
          type="button"
          class="btn btn-outline"
          onClick={() => {
            view.current?.dispatch({
              changes: {
                from: 0,
                to: view.current.state.doc.length,
                insert: initial,
              },
            });
          }}
        >
          <RotateCcw size={14} /> Restaurar
        </button>
      </div>
      <p class="small-disclaimer">
        La compilación real se realiza en Rust Playground externo; esta página
        no ejecuta rustc ni simula una compilación satisfactoria.
      </p>
    </div>
  );
}

function Home() {
  const done = progress.value.completed.length;
  const last =
    mods.find((m) => m.id === progress.value.currentModule) ?? mods[0];
  const locale = preferences.value.locale;
  const t = ui[locale];

  return (
    <>
      <section class="hero">
        <div class="hero-copy">
          <div class="hero-eyebrow">
            <span class="dot" />
            La Forja de Rust · Pixel Art Academy
          </div>
          <h1>
            Rust<span>Pixel</span>
            <br />
            Academy
          </h1>
          <div class="hero-title">Aprende Rust jugando y programando.</div>
          <p class="hero-desc">
            {t.welcome}. De tus primeros pasos con ownership y tipos hasta
            arquitectura de sistemas distribuidos y Senior Mode. Ejercicios
            interactivos, estética pixel y sin cuentas.
          </p>
          <div class="hero-ctas">
            <LinkButton to={href('learn')} kind="btn-primary">
              <Play size={16} fill="currentColor" /> {t.start}
            </LinkButton>
            <LinkButton to={href('module', last.id)} kind="btn-outline">
              {t.continue} {last.id} <ChevronRight size={16} />
            </LinkButton>
          </div>
          <div class="hero-metrics">
            <span>
              <b>54</b> Módulos
            </span>
            <span>
              <b>18</b> Senior
            </span>
            <span>
              <b>8</b> Rutas
            </span>
            <span>
              <b>6</b> Idiomas
            </span>
            <span>
              <b>0</b> Backend
            </span>
          </div>
        </div>
        <div class="hero-art">
          <div class="hero-orbit" />
          <img
            class="hero-ferris ferris-art"
            src={image('explorer')}
            alt="Ferris el cangrejo explorador"
          />
          <div class="code-float" aria-hidden="true">
            <div class="window-dots">
              <span class="window-dot" />
              <span class="window-dot" />
              <span class="window-dot" />
            </div>
            <code>
              fn main() &#123;
              <br />
              &nbsp;&nbsp;println!("¡Hola, Rustacean!");
              <br />
              &#125;
            </code>
          </div>
        </div>
      </section>

      <div class="section-heading">
        <div>
          <span class="eyebrow">Rutas de aprendizaje</span>
          <h2>Tu aventura en Rust</h2>
        </div>
        <span class="tag">54 módulos + 8 rutas</span>
      </div>

      <div class="track-grid">
        {[
          {
            level: 'basic',
            name: 'Rust Básico',
            desc: 'Sintaxis, tipos primitivos, ownership, enums y Ferris Tasks.',
            icon: Sparkles,
          },
          {
            level: 'intermediate',
            name: 'Rust Intermedio',
            desc: 'Traits, lifetimes, smart pointers, Serde, I/O y testing.',
            icon: Boxes,
          },
          {
            level: 'advanced',
            name: 'Rust Avanzado',
            desc: 'Concurrencia, Tokio, Axum, WebAssembly y Unsafe.',
            icon: Cpu,
          },
          {
            level: 'senior',
            name: 'Senior Mode',
            desc: '18 desafíos, incidentes multietapa y 90 gates de aceptación.',
            icon: Crown,
          },
        ].map((tr) => {
          const IconComp = tr.icon;
          const completedCount = mods.filter(
            (m) =>
              m.level === tr.level && progress.value.completed.includes(m.id),
          ).length;
          const maxCount = total(tr.level);
          return (
            <a
              key={tr.level}
              class="track-card"
              href={tr.level === 'senior' ? href('senior') : href('learn')}
            >
              <div class="track-top">
                <div class="track-icon">
                  <IconComp size={24} />
                </div>
                <span class="track-count">{maxCount} MÓDULOS</span>
              </div>
              <h3>{tr.name}</h3>
              <p>{tr.desc}</p>
              <div class="track-bottom">
                <Bar value={completedCount} max={maxCount} />
                <span class="small muted">
                  {completedCount}/{maxCount}
                </span>
              </div>
            </a>
          );
        })}
      </div>

      <div class="section-heading" style={{ marginTop: 44 }}>
        <div>
          <span class="eyebrow">Laboratorios interactivos</span>
          <h2>Destacados</h2>
        </div>
      </div>

      <div class="grid3">
        <Panel title="Ownership Puzzle">
          <p>
            Aprende las transferencias de propiedad y préstamos con el simulador
            semántico de pasos en memoria.
          </p>
          <div style={{ marginTop: 16 }}>
            <LinkButton to={href('games')}>
              <Gamepad2 size={16} /> Explorar juegos
            </LinkButton>
          </div>
        </Panel>
        <Panel title="The Master Forge">
          <p>
            18 escenarios de producción: code review, arquitectura con ADRs,
            incidentes y evidencias reales.
          </p>
          <div style={{ marginTop: 16 }}>
            <LinkButton to={href('senior')} kind="btn-gold">
              <Crown size={16} /> Entrar a Senior Mode
            </LinkButton>
          </div>
        </Panel>
        <Panel title="Tu progreso local">
          <div class="stat">{done} / 54</div>
          <p>Módulos completados y guardados en tu navegador.</p>
          <Bar value={done} max={54} />
          <div style={{ marginTop: 16 }}>
            <LinkButton to={href('progress')}>
              <Trophy size={16} /> Ver mis logros
            </LinkButton>
          </div>
        </Panel>
      </div>
    </>
  );
}

function Learn() {
  const [filter, setFilter] = useState('basic');
  const [search, setSearch] = useState('');
  const filtered = mods.filter(
    (m) =>
      m.level === filter &&
      `${m.id} ${m.title} ${m.topics.join(' ')}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  return (
    <>
      <nav class="breadcrumbs" aria-label="Ruta de navegación">
        <a href="#/">Inicio</a>
        <span>/</span>
        <b>Aprende Rust</b>
      </nav>

      <div class="section-heading">
        <div>
          <span class="eyebrow">Catálogo curricular</span>
          <h2>Aprende Rust</h2>
        </div>
        <span class="tag">36 módulos base + 18 Senior</span>
      </div>
      <p class="small">
        Los 54 módulos y 216 lecciones tienen objetivos editoriales y código
        inicial. No ejecutan compilación en web; las pruebas se realizan en Rust
        Playground o Cargo local.
      </p>

      <div class="tool-subnav" style={{ margin: '20px 0 12px' }}>
        {[
          ['basic', 'Básico (B01–B12)'],
          ['intermediate', 'Intermedio (I01–I12)'],
          ['advanced', 'Avanzado (A01–A12)'],
          ['senior', 'Senior (S01–S18)'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={filter === id}
            class={`btn ${filter === id ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ margin: '16px 0 24px' }}>
        <label class="sr-only" for="search">
          Buscar módulo
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="search"
            class="input"
            type="search"
            placeholder="Buscar módulo, concepto clave o identificador (ej: B05, Lifetimes)..."
            value={search}
            onInput={(e) => setSearch(e.currentTarget.value)}
          />
        </div>
      </div>

      <div class="grid3">
        {filtered.map((m) => {
          const isDone = progress.value.completed.includes(m.id);
          return (
            <a
              key={m.id}
              class="card clickable"
              href={href('module', m.id)}
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <span class="tag">{m.id}</span>
                {isDone ? (
                  <span
                    class="tag"
                    style={{
                      color: 'var(--green)',
                      borderColor: 'var(--green)',
                    }}
                  >
                    <Check size={12} /> Completado
                  </span>
                ) : (
                  <span class="tag">{m.lessons.length} lecciones</span>
                )}
              </div>
              <h3 style={{ marginTop: 4 }}>{m.title}</h3>
              <p style={{ fontSize: 13, flex: 1 }}>
                {m.topics.slice(0, 3).join(' · ')}
              </p>
              <Bar value={isDone ? 1 : 0} max={1} />
            </a>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <p style={{ marginTop: 24 }}>No se encontraron módulos coincidentes.</p>
      )}
    </>
  );
}

function Module({ id }: { id: string }) {
  const m = mods.find((x) => x.id === id);
  const [lessonIndex, setLessonIndex] = useState(0);
  useEffect(() => setLessonIndex(0), [id]);

  if (!m) return <p>Módulo no disponible</p>;
  const lesson = m.lessons[lessonIndex];
  const done = progress.value.completed.includes(id);
  const mark = () => updateProgress(finishModule(progress.value, id, m.xp));

  const levelName =
    m.level === 'basic'
      ? 'Básico'
      : m.level === 'intermediate'
        ? 'Intermedio'
        : m.level === 'advanced'
          ? 'Avanzado'
          : 'Senior';

  return (
    <>
      <nav class="breadcrumbs" aria-label="Ruta de navegación">
        <a href="#/">Inicio</a>
        <span>/</span>
        <a href={href('learn')}>Aprende Rust</a>
        <span>/</span>
        <a href={href('learn')}>{levelName}</a>
        <span>/</span>
        <b>
          {m.id} · {m.title}
        </b>
      </nav>

      <div class="lesson-layout">
        <div class="lesson-main">
          <div class="lesson-intro">
            <div>
              <span class="eyebrow">
                {m.id} · Lección {lessonIndex + 1} de {m.lessons.length}
              </span>
              <h2>{lesson.title}</h2>
              <p>{lesson.explanation}</p>
              <p class="prompt">
                <strong>Práctica sugerida:</strong> {lesson.practice}
              </p>
            </div>
            <img
              class="lesson-intro-art ferris-art"
              src={image('explorer')}
              alt="Ferris leyendo código"
            />
          </div>

          <CodeEditor moduleId={id} initial={m.code} />
        </div>

        <aside class="lesson-side">
          <Panel title="Lecciones del módulo">
            <ul class="clean-list">
              {m.lessons.map((l, i) => (
                <li
                  key={l.title}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <button
                    type="button"
                    class={`btn btn-sm ${i === lessonIndex ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setLessonIndex(i)}
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                  >
                    <span>{String(i + 1).padStart(2, '0')}.</span> {l.title}
                  </button>
                </li>
              ))}
            </ul>
            <div
              class="actions"
              style={{ marginTop: 16, display: 'flex', gap: 8 }}
            >
              <button
                type="button"
                class="btn btn-outline btn-sm"
                disabled={lessonIndex === 0}
                onClick={() => setLessonIndex(Math.max(0, lessonIndex - 1))}
              >
                <ChevronLeft size={14} /> Anterior
              </button>
              <button
                type="button"
                class="btn btn-outline btn-sm"
                disabled={lessonIndex === m.lessons.length - 1}
                onClick={() =>
                  setLessonIndex(
                    Math.min(m.lessons.length - 1, lessonIndex + 1),
                  )
                }
              >
                Siguiente <ChevronRight size={14} />
              </button>
            </div>
          </Panel>

          <div class="card" style={{ textAlign: 'center' }}>
            <img
              src={image('senior')}
              alt="Ferris Senior con corona"
              style={{
                width: 90,
                height: 90,
                margin: '0 auto 12px',
                objectFit: 'contain',
              }}
            />
            <h3>Desafío final</h3>
            <p style={{ fontSize: 13, marginBottom: 16 }}>{m.finalChallenge}</p>
            <button
              type="button"
              class={`btn ${done ? 'btn-outline' : 'btn-gold'}`}
              disabled={done}
              onClick={mark}
              style={{ width: '100%' }}
            >
              {done ? (
                <>
                  <Check size={16} /> Módulo estudiado
                </>
              ) : (
                <>
                  <Award size={16} /> Marcar estudiado · +{m.xp} XP
                </>
              )}
            </button>
            <p class="small muted" style={{ marginTop: 10 }}>
              Registra autoevaluación local; la validación técnica real exige
              ejecutar cargo test localmente.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

function Ecosystem() {
  return (
    <>
      <nav class="breadcrumbs" aria-label="Ruta de navegación">
        <a href="#/">Inicio</a>
        <span>/</span>
        <b>Rust Ecosystem Academy</b>
      </nav>

      <div class="section-heading">
        <div>
          <span class="eyebrow">Especialización tecnológica</span>
          <h2>Rust Ecosystem Academy</h2>
        </div>
        <span class="tag">8 rutas de especialización</span>
      </div>
      <p class="small">
        Rutas técnicas independientes con cinco unidades de estudio cada una.
        Los proyectos de backend o WebAssembly se ejecutan en tu entorno de
        desarrollo local.
      </p>

      <div class="grid2" style={{ marginTop: 24 }}>
        {paths.map((p) => (
          <Panel key={p.id} title={`${p.id} · ${p.name}`}>
            <p>{p.description}</p>
            <ol style={{ paddingLeft: 20, margin: '12px 0' }}>
              {p.units.map((u) => (
                <li key={u} style={{ margin: '4px 0', fontSize: 13 }}>
                  {u}
                </li>
              ))}
            </ol>
            <span class="tag">
              Temario publicado · laboratorios en desarrollo
            </span>
          </Panel>
        ))}
      </div>
    </>
  );
}

function Games() {
  const [activeGame, setActiveGame] = useState('quiz');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(-1);
  const [result, setResult] = useState<null | boolean>(null);
  const q = questions[index];

  return (
    <>
      <nav class="breadcrumbs" aria-label="Ruta de navegación">
        <a href="#/">Inicio</a>
        <span>/</span>
        <b>Minijuegos & Retos</b>
      </nav>

      <div class="section-heading">
        <div>
          <span class="eyebrow">Play & Learn</span>
          <h2>Minijuegos</h2>
        </div>
        <span class="tag">14 modalidades catalogadas</span>
      </div>
      <p class="small">
        Juegos y visualizaciones para interiorizar el borrow checker,
        concurrencia y ownership sin complicaciones.
      </p>

      <div class="games-grid" style={{ marginTop: 20 }}>
        {[
          { id: 'quiz', name: 'Quiz Battle', icon: Gamepad2, badge: '5 MIN' },
          {
            id: 'ownership',
            name: 'Ownership Puzzle',
            icon: Layers,
            badge: 'VISUAL',
          },
          {
            id: 'borrow',
            name: 'Borrow Checker',
            icon: ShieldCheck,
            badge: 'GUIADO',
          },
          {
            id: 'concurrency',
            name: 'Concurrency Race',
            icon: Flame,
            badge: '5 MIN',
          },
          {
            id: 'debug',
            name: 'Bug Hunter',
            icon: Terminal,
            badge: 'LAB',
          },
        ].map((gm) => {
          const GmIcon = gm.icon;
          return (
            <button
              key={gm.id}
              type="button"
              class={`game-tile ${activeGame === gm.id ? 'chosen' : ''}`}
              onClick={() => setActiveGame(gm.id)}
            >
              <span>
                <GmIcon size={24} />
              </span>
              <b>{gm.name}</b>
              <small>{gm.badge}</small>
            </button>
          );
        })}
      </div>

      <div class="game-arena">
        {activeGame === 'quiz' && (
          <Panel title={`Pregunta ${index + 1} de ${questions.length}`}>
            <p style={{ fontSize: 17, fontWeight: 700, margin: '8px 0 16px' }}>
              {q.question}
            </p>
            <div class="choices">
              {q.options.map((o, i) => (
                <button
                  key={o}
                  type="button"
                  class="choice"
                  aria-pressed={selected === i}
                  onClick={() => {
                    setSelected(i);
                    setResult(null);
                  }}
                >
                  <span
                    style={{
                      marginRight: 10,
                      fontWeight: 800,
                      color: 'var(--forge)',
                    }}
                  >
                    {String.fromCharCode(65 + i)}.
                  </span>{' '}
                  {o}
                </button>
              ))}
            </div>
            <div
              class="actions"
              style={{ marginTop: 20, display: 'flex', gap: 10 }}
            >
              <button
                type="button"
                class="btn btn-primary"
                disabled={selected < 0}
                onClick={() => {
                  const r = grade(q, selected);
                  setResult(r.correct);
                  if (r.correct) {
                    updateProgress({
                      ...progress.value,
                      answers: {
                        ...progress.value.answers,
                        [q.id]: selected,
                      },
                    });
                  }
                }}
              >
                <Check size={16} /> Comprobar solución
              </button>
              <button
                type="button"
                class="btn btn-outline"
                onClick={() => {
                  setIndex((index + 1) % questions.length);
                  setSelected(-1);
                  setResult(null);
                }}
              >
                Siguiente pregunta <ChevronRight size={16} />
              </button>
            </div>
            {result !== null && (
              <div class={`feedback ${result ? 'ok' : 'no'}`} role="status">
                <strong>
                  {result ? '✓ ¡Correcto!' : '✗ Respuesta incorrecta'}
                </strong>
                <p style={{ margin: '6px 0 0' }}>{q.explanation}</p>
              </div>
            )}
          </Panel>
        )}

        {activeGame === 'ownership' && <OwnershipPuzzle />}

        {activeGame !== 'quiz' && activeGame !== 'ownership' && (
          <Panel title="Desafío interactivo en catálogo">
            <p>
              Este minijuego está identificado en el catálogo de 14 modalidades
              educativas. Actualmente puedes practicar con{' '}
              <strong>Quiz Battle</strong> y <strong>Ownership Puzzle</strong>{' '}
              mientras se completan las siguientes experiencias interactivas.
            </p>
            <button
              type="button"
              class="btn btn-primary"
              onClick={() => setActiveGame('quiz')}
              style={{ marginTop: 12 }}
            >
              Volver a Quiz Battle
            </button>
          </Panel>
        )}
      </div>
    </>
  );
}

function OwnershipPuzzle() {
  const [step, setStep] = useState(0);
  const steps = [
    {
      text: 'let a = String::from("Ferris");',
      owner: 'a',
      desc: 'El valor String en Heap es propiedad de la variable "a" en el Stack.',
    },
    {
      text: 'let b = a;',
      owner: 'b',
      desc: 'La propiedad se transfiere (move) de "a" hacia "b". El búfer en Heap no se duplica.',
    },
    {
      text: 'println!("{b}");',
      owner: 'b',
      desc: '"b" posee el dato y puede utilizarlo; "a" ha quedado invalidada por el borrow checker.',
    },
  ];

  return (
    <Panel title="Ownership Puzzle — Transferencias de Propiedad">
      <div class="codebox">
        <pre>
          {steps
            .slice(0, step + 1)
            .map((s) => s.text)
            .join('\n')}
        </pre>
      </div>
      <div style={{ display: 'flex', gap: 10, margin: '14px 0' }}>
        <span class="tag">Stack: variable {steps[step].owner}</span>
        <span class="tag info">Heap: "Ferris"</span>
      </div>
      <p>{steps[step].desc}</p>
      <div class="actions" style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button
          type="button"
          class="btn btn-outline"
          onClick={() => setStep((step + 2) % 3)}
        >
          <ChevronLeft size={16} /> Retroceder
        </button>
        <button
          type="button"
          class="btn btn-primary"
          onClick={() => setStep((step + 1) % 3)}
        >
          Siguiente evento <ChevronRight size={16} />
        </button>
      </div>
      <p class="small muted" style={{ marginTop: 12 }}>
        Visualización semántica didáctica; la verificación estricta de lifetimes
        y préstamos corresponde al compilador rustc.
      </p>
    </Panel>
  );
}

function ProgressPage() {
  const p = progress.value;
  const [msg, setMsg] = useState('');
  const input = useRef<HTMLInputElement>(null);

  function exportData() {
    const blob = new Blob([JSON.stringify(p, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rustpixel-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importFile(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    try {
      if (f.size > 200000) throw Error('Archivo demasiado grande (máx 200KB)');
      const raw = JSON.parse(await f.text()) as unknown;
      updateProgress(validateImport(raw));
      setMsg('Progreso importado y validado correctamente.');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Archivo no válido');
    }
  }

  return (
    <>
      <nav class="breadcrumbs" aria-label="Ruta de navegación">
        <a href="#/">Inicio</a>
        <span>/</span>
        <b>Mi progreso</b>
      </nav>

      <div class="section-heading">
        <div>
          <span class="eyebrow">Registro de avance local</span>
          <h2>Mi progreso</h2>
        </div>
      </div>

      <div class="grid3">
        <Panel title="Módulos completados">
          <div class="stat">{p.completed.length} / 54</div>
          <Bar value={p.completed.length} max={54} />
          <p class="small muted" style={{ marginTop: 8 }}>
            Autoevaluaciones registradas en este navegador.
          </p>
        </Panel>
        <Panel title="Experiencia acumulada">
          <div class="stat">{p.xp} XP</div>
          <p class="small muted">
            Puntos otorgados al completar lecciones y módulos.
          </p>
        </Panel>
        <Panel title="Insignias">
          <div class="stat">{p.achievements.length}</div>
          <p class="small muted">
            {p.achievements.join(' · ') ||
              'Completa tu primer módulo para desbloquear insignias.'}
          </p>
        </Panel>
      </div>

      <div style={{ marginTop: 32 }}>
        <Panel title="Respaldo de progreso y portabilidad">
          <p>
            RustPixel funciona 100% en el cliente y no almacena credenciales ni
            datos en servidores remotos. Exporta tu progreso en JSON para
            transferirlo a otro navegador o dispositivo.
          </p>
          <div
            class="actions"
            style={{ display: 'flex', gap: 10, marginTop: 16 }}
          >
            <button type="button" class="btn btn-primary" onClick={exportData}>
              <Download size={16} /> Exportar JSON
            </button>
            <button
              type="button"
              class="btn btn-outline"
              onClick={() => input.current?.click()}
            >
              <Upload size={16} /> Importar JSON
            </button>
            <input
              ref={input}
              type="file"
              accept="application/json,.json"
              style={{ display: 'none' }}
              onChange={importFile}
            />
          </div>
          {msg && (
            <p role="status" style={{ marginTop: 12, fontWeight: 700 }}>
              {msg}
            </p>
          )}
        </Panel>
      </div>
    </>
  );
}

function Settings() {
  const p = preferences.value;

  return (
    <>
      <nav class="breadcrumbs" aria-label="Ruta de navegación">
        <a href="#/">Inicio</a>
        <span>/</span>
        <b>Ajustes</b>
      </nav>

      <div class="section-heading">
        <div>
          <span class="eyebrow">Configuración</span>
          <h2>Preferencias</h2>
        </div>
      </div>

      <Panel title="Personalización de la interfaz">
        <div class="toggleline">
          <label for="locale-select">Idioma de la interfaz</label>
          <select
            id="locale-select"
            class="input"
            style={{ width: 220 }}
            value={p.locale}
            onChange={(e) =>
              updatePrefs({
                locale: e.currentTarget.value as Preferences['locale'],
              })
            }
          >
            {locales.map((l) => (
              <option key={l.id} value={l.id}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>

        <div class="toggleline">
          <span>Tema de color</span>
          <div class="actions" style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              class={`btn ${p.theme === 'light' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => updatePrefs({ theme: 'light' })}
            >
              <Sun size={16} /> Claro
            </button>
            <button
              type="button"
              class={`btn ${p.theme === 'dark' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => updatePrefs({ theme: 'dark' })}
            >
              <Moon size={16} /> Oscuro
            </button>
          </div>
        </div>

        <div class="toggleline">
          <span>Senior Mode en la navegación</span>
          <div class="actions">
            <button
              type="button"
              class={`senior-toggle ${p.seniorEnabled ? 'on' : ''}`}
              aria-pressed={p.seniorEnabled}
              onClick={() => updatePrefs({ seniorEnabled: !p.seniorEnabled })}
            >
              <Crown size={16} />
              <span>{p.seniorEnabled ? 'Activado' : 'Desactivado'}</span>
              <span class="toggle-knob" />
            </button>
          </div>
        </div>

        <div class="toggleline">
          <label for="motion-check">Animaciones y transiciones</label>
          <input
            id="motion-check"
            type="checkbox"
            checked={p.motion}
            onChange={(e) => updatePrefs({ motion: e.currentTarget.checked })}
          />
        </div>
      </Panel>
    </>
  );
}

export function App() {
  const [hash, setHash] = useState(() => location.hash || '#/');

  useEffect(() => {
    const handler = () => {
      setHash(location.hash || '#/');
      window.scrollTo(0, 0);
    };
    addEventListener('hashchange', handler);
    return () => removeEventListener('hashchange', handler);
  }, []);

  const route = parseRoute(hash);
  const pref = preferences.value;

  useEffect(() => {
    document.documentElement.dataset.theme = pref.theme;
    document.documentElement.dataset.senior = String(pref.seniorEnabled);
    document.documentElement.dataset.reducedMotion = String(!pref.motion);
    document.documentElement.lang = pref.locale;
  }, [pref]);

  const t = ui[pref.locale];

  const nav = [
    { id: 'home', label: t.home, icon: HomeIcon },
    { id: 'learn', label: t.learn, icon: BookOpen },
    { id: 'games', label: t.games, icon: Gamepad2 },
    { id: 'ecosystem', label: t.ecosystem, icon: Layers },
    { id: 'senior', label: t.senior, icon: Crown },
    { id: 'progress', label: t.progress, icon: Trophy },
  ];

  return (
    <div class="app-shell">
      <a class="sr-only" href="#main">
        Saltar al contenido
      </a>

      <header class="site-header">
        <a class="brand" href="#/" aria-label="RustPixel Academy">
          <img src={image('explorer')} alt="" width="36" height="36" />
          <span>
            Rust<span class="brand-forge">Pixel</span>
            <small>ACADEMY</small>
          </span>
        </a>

        <nav class="primary-nav" aria-label="Navegación principal">
          {nav
            .filter((item) => item.id !== 'senior' || pref.seniorEnabled)
            .map((item) => {
              const IconItem = item.icon;
              const isActive =
                route.name === item.id ||
                (item.id === 'learn' && route.name === 'module') ||
                (item.id === 'senior' && route.name === 'challenge');
              return (
                <a
                  key={item.id}
                  aria-current={isActive ? 'page' : undefined}
                  class={isActive ? 'active' : ''}
                  href={href(item.id)}
                >
                  <IconItem size={18} />
                  <span>{item.label}</span>
                </a>
              );
            })}
        </nav>

        <div class="header-actions">
          <label class="lang-wrap">
            <span class="visually-hidden">Idioma</span>
            <select
              aria-label="Idioma"
              value={pref.locale}
              onChange={(e) =>
                updatePrefs({
                  locale: (e.currentTarget as HTMLSelectElement)
                    .value as Locale,
                })
              }
            >
              {locales.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            class="circle-action"
            title={pref.theme === 'dark' ? t.light : t.dark}
            aria-label={pref.theme === 'dark' ? t.light : t.dark}
            onClick={() =>
              updatePrefs({
                theme: pref.theme === 'dark' ? 'light' : 'dark',
              })
            }
          >
            {pref.theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          <button
            type="button"
            class={`senior-toggle ${pref.seniorEnabled ? 'on' : ''}`}
            aria-pressed={pref.seniorEnabled}
            onClick={() => updatePrefs({ seniorEnabled: !pref.seniorEnabled })}
          >
            <Crown size={16} />
            <span>Senior</span>
            <span class="toggle-knob" />
          </button>

          <a
            class="circle-action"
            href="#/settings"
            title={t.settings}
            aria-label={t.settings}
          >
            <SettingsIcon size={18} />
          </a>
        </div>
      </header>

      <main id="main" class="main-content" tabIndex={-1}>
        {route.name === 'home' && <Home />}
        {route.name === 'learn' && <Learn />}
        {route.name === 'module' && <Module id={route.id ?? 'B01'} />}
        {route.name === 'senior' && <SeniorDashboard />}
        {route.name === 'challenge' && (
          <SeniorChallenge id={route.id ?? 'S01-C01'} />
        )}
        {route.name === 'ecosystem' && <Ecosystem />}
        {route.name === 'games' && <Games />}
        {route.name === 'progress' && <ProgressPage />}
        {route.name === 'settings' && <Settings />}
      </main>

      <footer class="site-footer">
        <div class="footer-inner">
          <span style={{ fontWeight: 800 }}>RustPixel Academy</span>
          <span>
            Proyecto educativo independiente y de código abierto · Compilación y
            tests reales en Rust Playground y toolchains Cargo externas · Ferris
            es una mascota comunitaria no oficial.
          </span>
          <div class="footer-links">
            <a
              href="https://www.rust-lang.org/policies/media-guide"
              target="_blank"
              rel="noopener noreferrer"
            >
              Guía de marca Rust ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
