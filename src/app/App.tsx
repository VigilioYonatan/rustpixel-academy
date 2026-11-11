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
  Bug,
  Check,
  CheckCircle2,
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
  XCircle,
  Zap,
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
              src={image('student')}
              alt="Ferris estudiante leyendo y analizando el código"
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
          {
            id: 'quiz',
            name: 'Quiz Battle',
            icon: Gamepad2,
            badge: '20 RETOS',
          },
          {
            id: 'ownership',
            name: 'Ownership Puzzle',
            icon: Layers,
            badge: '5 FASES',
          },
          {
            id: 'borrow',
            name: 'Borrow Checker',
            icon: ShieldCheck,
            badge: '6 CASOS',
          },
          {
            id: 'concurrency',
            name: 'Concurrency Race',
            icon: Flame,
            badge: '5 SIMS',
          },
          {
            id: 'debug',
            name: 'Bug Hunter',
            icon: Terminal,
            badge: '6 LABS',
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
          <Panel
            title={`Quiz Battle — Pregunta ${index + 1} de ${questions.length}`}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <span class="tag">
                Reto {index + 1} / {questions.length}
              </span>
              <span class="char-pill valid">+15 XP al acertar</span>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 16,
                alignItems: 'center',
                margin: '8px 0 16px',
              }}
            >
              <p style={{ fontSize: 17, fontWeight: 700, margin: 0, flex: 1 }}>
                {q.question}
              </p>
              <img
                src={image('idea')}
                alt="Ferris con bombilla de idea"
                class="ferris-art"
                style={{ width: 72, height: 72, flexShrink: 0 }}
              />
            </div>
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
                      xp: progress.value.xp + 15,
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
        {activeGame === 'borrow' && <BorrowCheckerGame />}
        {activeGame === 'concurrency' && <ConcurrencyRaceGame />}
        {activeGame === 'debug' && <BugHunterGame />}
      </div>
    </>
  );
}

const OWNERSHIP_STAGES = [
  {
    stage: 1,
    title: 'Fase 1: Movimiento de Memoria en Heap (Move)',
    code: `let a = String::from("Ferris");\nlet b = a;\nprintln!("{b}");`,
    stack: [
      { var: 'a', status: 'invalid (moved)', val: '— (movida hacia b)' },
      { var: 'b', status: 'valid (owner)', val: 'ptr -> Heap[0x7f..]' },
    ],
    heap: [{ id: '0x7f..', data: '"Ferris"', owner: 'b' }],
    desc: 'Al asignar let b = a, Rust transfiere la propiedad del búfer en Heap. La variable "a" queda invalidada y el compilador prohíbe su lectura.',
  },
  {
    stage: 2,
    title: 'Fase 2: Duplicación en Stack (Copy Trait)',
    code: `let x: i32 = 42;\nlet y = x;\nprintln!("{x} y {y}");`,
    stack: [
      { var: 'x', status: 'valid', val: '42 (i32 en stack)' },
      { var: 'y', status: 'valid', val: '42 (copia en stack)' },
    ],
    heap: [],
    desc: 'Los tipos primitivos como i32 implementan el trait Copy. La asignación duplica el valor en Stack con un memcpy trivial; ambas variables son 100% válidas.',
  },
  {
    stage: 3,
    title: 'Fase 3: Préstamos Inmutables Concurrentes (&T)',
    code: `let s = String::from("Rust");\nlet r1 = &s;\nlet r2 = &s;\nprintln!("{r1} y {r2}");`,
    stack: [
      { var: 's', status: 'valid (owner)', val: 'ptr -> Heap[0x8a..]' },
      { var: 'r1', status: 'ref shared', val: '&s (préstamo lectura)' },
      { var: 'r2', status: 'ref shared', val: '&s (préstamo lectura)' },
    ],
    heap: [{ id: '0x8a..', data: '"Rust"', owner: 's' }],
    desc: 'Se pueden crear múltiples referencias inmutables (&T) simultáneas. El aliasing es seguro porque ningún lector puede modificar el contenido mientras existan préstamos.',
  },
  {
    stage: 4,
    title: 'Fase 4: Préstamo Mutable Exclusivo (&mut T)',
    code: `let mut s = String::from("Forge");\nlet m = &mut s;\nm.push_str("!");`,
    stack: [
      { var: 's', status: 'borrowed (locked)', val: 'ptr -> Heap[0x9b..]' },
      { var: 'm', status: 'ref exclusive', val: '&mut s (exclusivo)' },
    ],
    heap: [{ id: '0x9b..', data: '"Forge!"', owner: 's (mutado vía m)' }],
    desc: 'Un préstamo mutable (&mut T) otorga acceso exclusivo. Mientras "m" esté activo, la variable base "s" no puede leerse ni prestarse a nadie más, previniendo data races.',
  },
  {
    stage: 5,
    title: 'Fase 5: Slices como Vistas no Propietarias (&str)',
    code: `let s = String::from("PixelArt");\nlet slice = &s[0..5];\nprintln!("{slice}"); // "Pixel"`,
    stack: [
      { var: 's', status: 'valid (owner)', val: 'len: 8, cap: 8, ptr -> Heap' },
      { var: 'slice', status: 'fat pointer', val: 'ptr -> Heap+0, len: 5' },
    ],
    heap: [{ id: '0xab..', data: '"PixelArt"', owner: 's' }],
    desc: 'Un slice &str es un fat pointer (puntero + longitud) que apunta a una porción de bytes preexistentes. Permite inspeccionar texto con costo cero de asignación.',
  },
];

function OwnershipPuzzle() {
  const [cur, setCur] = useState(0);
  const st = OWNERSHIP_STAGES[cur];

  return (
    <Panel title={`Ownership Puzzle — ${st.title}`}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <span class="tag">
          Fase {cur + 1} de {OWNERSHIP_STAGES.length}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {OWNERSHIP_STAGES.map((_, i) => (
            <button
              key={i}
              type="button"
              class={`btn btn-sm ${i === cur ? 'btn-primary' : 'btn-outline'}`}
              style={{ minWidth: 32, padding: '4px 8px' }}
              onClick={() => setCur(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div class="codebox" style={{ margin: '10px 0' }}>
        <pre>{st.code}</pre>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 12,
          margin: '14px 0',
        }}
      >
        <div
          class="card"
          style={{
            background: 'rgba(8, 13, 23, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <h4
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              margin: '0 0 10px',
              fontSize: 13,
              color: 'var(--teal)',
            }}
          >
            <Cpu size={15} /> Estado en Stack
          </h4>
          <ul class="clean-list" style={{ fontSize: 12.5 }}>
            {st.stack.map((v) => (
              <li
                key={v.var}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '4px 0',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                }}
              >
                <strong>{v.var}:</strong>
                <span class={v.status.includes('invalid') ? 'muted' : 'tag'}>
                  {v.val}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div
          class="card"
          style={{
            background: 'rgba(8, 13, 23, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <h4
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              margin: '0 0 10px',
              fontSize: 13,
              color: 'var(--forge)',
            }}
          >
            <Layers size={15} /> Asignaciones en Heap
          </h4>
          {st.heap.length === 0 ? (
            <p class="small muted">
              Sin asignaciones en Heap (100% memoria en Stack).
            </p>
          ) : (
            <ul class="clean-list" style={{ fontSize: 12.5 }}>
              {st.heap.map((h) => (
                <li
                  key={h.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '4px 0',
                  }}
                >
                  <span>
                    {h.id} {h.data}
                  </span>
                  <span class="tag info">dueño: {h.owner}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p style={{ fontSize: 14, margin: '12px 0' }}>{st.desc}</p>

      <div class="actions" style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button
          type="button"
          class="btn btn-outline"
          disabled={cur === 0}
          onClick={() => setCur(cur - 1)}
        >
          <ChevronLeft size={16} /> Fase anterior
        </button>
        <button
          type="button"
          class="btn btn-primary"
          disabled={cur === OWNERSHIP_STAGES.length - 1}
          onClick={() => {
            setCur(cur + 1);
            updateProgress({ ...progress.value, xp: progress.value.xp + 10 });
          }}
        >
          Siguiente fase <ChevronRight size={16} />
        </button>
      </div>
    </Panel>
  );
}

const BORROW_CASES = [
  {
    id: 'BC01',
    title: 'Caso 1: Doble préstamo mutable en el mismo ámbito',
    code: `fn main() {\n    let mut data = vec![1, 2, 3];\n    let r1 = &mut data;\n    let r2 = &mut data; // ¿Compila?\n    r1.push(4);\n    r2.push(5);\n}`,
    compiles: false,
    diagCode: 'E0499',
    diagMessage:
      'error[E0499]: cannot borrow `data` as mutable more than once at a time',
    explanation:
      'Rust prohíbe tener dos referencias mutables (&mut) activas simultáneamente sobre el mismo dato para eliminar condiciones de carrera en compilación.',
  },
  {
    id: 'BC02',
    title: 'Caso 2: Préstamo mutable con lectura inmutable activa',
    code: `fn main() {\n    let mut s = String::from("Rust");\n    let r1 = &s;\n    let r2 = &s;\n    let r3 = &mut s;\n    println!("{r1}, {r2}, {r3}");\n}`,
    compiles: false,
    diagCode: 'E0502',
    diagMessage:
      'error[E0502]: cannot borrow `s` as mutable because it is also borrowed as immutable',
    explanation:
      'No puedes solicitar un préstamo mutable mientras existan referencias inmutables activas: los lectores confían en que el valor no cambiará bajo sus pies.',
  },
  {
    id: 'BC03',
    title: 'Caso 3: Referencia colgante a memoria local (Dangling Reference)',
    code: `fn create_ref() -> &String {\n    let s = String::from("Ferris");\n    &s // Intento de devolver referencia a variable local\n}\nfn main() {\n    let r = create_ref();\n    println!("{r}");\n}`,
    compiles: false,
    diagCode: 'E0106',
    diagMessage:
      'error[E0106]: missing lifetime specifier / returns reference to data owned by the current function',
    explanation:
      '`s` se destruye inmediatamente al retornar de `create_ref()`. Retornar una referencia a memoria liberada causaría Use-After-Free; el compilador lo rechaza.',
  },
  {
    id: 'BC04',
    title: 'Caso 4: Non-Lexical Lifetimes (NLL)',
    code: `fn main() {\n    let mut s = String::from("Pixel");\n    let r = &s;\n    println!("{r}"); // Último uso del préstamo inmutable 'r'\n    let m = &mut s;   // NLL detecta que 'r' ya no se usa\n    m.push_str(" Forge");\n    println!("{m}");\n}`,
    compiles: true,
    diagCode: 'OK',
    diagMessage: 'Compilado con éxito (Rust Non-Lexical Lifetimes)',
    explanation:
      'Con Non-Lexical Lifetimes (NLL), la vida útil de una referencia concluye en su último punto de uso real, permitiendo mutar el valor después sin esperar al final del bloque.',
  },
  {
    id: 'BC05',
    title: 'Caso 5: Préstamos disjuntos en campos de Struct',
    code: `struct Player { name: String, score: u32 }\nfn main() {\n    let mut p = Player { name: String::from("Ferris"), score: 10 };\n    let n = &mut p.name;\n    let s = &mut p.score;\n    n.push_str(" Senior");\n    *s += 50;\n}`,
    compiles: true,
    diagCode: 'OK',
    diagMessage: 'Compilado con éxito (Disjoint field borrowing)',
    explanation:
      'El Borrow Checker entiende la separación de campos independientes: permite préstamos mutables paralelos a diferentes campos del mismo struct sin conflicto.',
  },
  {
    id: 'BC06',
    title: 'Caso 6: Uso tras transferencia (Use after move)',
    code: `fn main() {\n    let a = String::from("Core");\n    let b = a;\n    println!("{b}");\n    println!("{a}"); // Intento de lectura tras move\n}`,
    compiles: false,
    diagCode: 'E0382',
    diagMessage: 'error[E0382]: borrow of moved value: `a`',
    explanation:
      'String no implementa Copy. Al asignar `let b = a`, la propiedad se transfiere a `b`, dejando a `a` en estado no inicializado.',
  },
];

function BorrowCheckerGame() {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<'compiles' | 'rejects' | null>(null);
  const [result, setResult] = useState<boolean | null>(null);

  const c = BORROW_CASES[index];

  function evaluate(userChoice: 'compiles' | 'rejects') {
    setChoice(userChoice);
    const correct = (userChoice === 'compiles') === c.compiles;
    setResult(correct);
    if (correct) {
      updateProgress({ ...progress.value, xp: progress.value.xp + 15 });
    }
  }

  return (
    <Panel title={`Borrow Checker Challenge — ${c.title}`}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <span class="tag">
          Reto {index + 1} de {BORROW_CASES.length}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span class="char-pill valid">+15 XP al acertar</span>
          <img
            src={image('engineer')}
            alt="Ferris comprobando el borrow checker"
            class="ferris-art"
            style={{ width: 44, height: 44 }}
          />
        </div>
      </div>

      <div class="codebox" style={{ margin: '10px 0' }}>
        <pre>{c.code}</pre>
      </div>

      <p style={{ fontWeight: 700, margin: '14px 0 10px' }}>
        ¿Aprobará el Borrow Checker de rustc este código?
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          class={`btn ${choice === 'compiles' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => evaluate('compiles')}
        >
          <CheckCircle2 size={16} /> ✓ Compila sin errores
        </button>
        <button
          type="button"
          class={`btn ${choice === 'rejects' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => evaluate('rejects')}
        >
          <XCircle size={16} /> ✗ Rechazado por el compilador
        </button>
      </div>

      {result !== null && (
        <div
          class={`feedback ${result ? 'ok' : 'no'}`}
          style={{ marginTop: 16 }}
        >
          <strong>
            {result ? '✓ ¡Diagnóstico correcto!' : '✗ Diagnóstico incorrecto'}
          </strong>
          <div
            style={{
              fontFamily: 'var(--font-code)',
              fontSize: 12,
              margin: '8px 0',
              padding: '6px 10px',
              background: 'rgba(0,0,0,0.25)',
              borderRadius: 6,
            }}
          >
            {c.diagMessage}
          </div>
          <p style={{ margin: '6px 0 0' }}>{c.explanation}</p>
        </div>
      )}

      <div class="actions" style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button
          type="button"
          class="btn btn-outline"
          disabled={index === 0}
          onClick={() => {
            setIndex(index - 1);
            setChoice(null);
            setResult(null);
          }}
        >
          <ChevronLeft size={16} /> Anterior
        </button>
        <button
          type="button"
          class="btn btn-primary"
          onClick={() => {
            setIndex((index + 1) % BORROW_CASES.length);
            setChoice(null);
            setResult(null);
          }}
        >
          Siguiente caso <ChevronRight size={16} />
        </button>
      </div>
    </Panel>
  );
}

const BUG_CASES = [
  {
    id: 'BH01',
    title: 'Bug 1: Inmutabilidad por omisión',
    code: `fn main() {\n    let counter = 10;\n    counter += 1; // Error en compilación\n    println!("{counter}");\n}`,
    fixes: [
      { text: 'Declarar `let mut counter = 10;` en la línea 2', correct: true },
      { text: 'Usar `counter.clone()` en la línea 3', correct: false },
      { text: 'Envolver la suma en un bloque `unsafe { }`', correct: false },
    ],
    explanation:
      'En Rust todas las variables son inmutables por defecto. Para reasignar o modificar su valor, debes marcarlas explícitamente con `let mut`.',
  },
  {
    id: 'BH02',
    title: 'Bug 2: Inserción en colección inmutable',
    code: `fn main() {\n    let list = vec![1, 2, 3];\n    list.push(4); // Error: cannot borrow as mutable\n    println!("{:?}", list);\n}`,
    fixes: [
      { text: 'Declarar `let mut list = vec![1, 2, 3];`', correct: true },
      { text: 'Usar `list.insert_copy(4)`', correct: false },
      { text: 'Reemplazar por `let list = &list;`', correct: false },
    ],
    explanation:
      'El método `.push(&mut self)` requiere un préstamo mutable exclusivo sobre el vector. Si el vector no es mutable, rustc rechaza la llamada.',
  },
  {
    id: 'BH03',
    title: 'Bug 3: Shadowing inadvertido dentro de un bucle',
    code: `fn main() {\n    let mut total = 0;\n    for x in 1..=3 {\n        let total = total + x; // Shadowing: variable local efímera\n    }\n    println!("Total: {total}"); // Imprime 0 en lugar de 6\n}`,
    fixes: [
      {
        text: 'Reemplazar `let total = total + x;` por la acumulación `total += x;`',
        correct: true,
      },
      {
        text: 'Usar `let mut total = total + x;` dentro del bucle',
        correct: false,
      },
      {
        text: 'Añadir `total.sync()` al final de cada iteración',
        correct: false,
      },
    ],
    explanation:
      'Al declarar `let total = ...` dentro del cuerpo del bucle, se crea una nueva variable que oculta la externa y se destruye al cerrar la llave, dejando el total original en cero.',
  },
  {
    id: 'BH04',
    title: 'Bug 4: Coincidencia de patrones incompleta en Option',
    code: `fn print_bonus(tier: Option<u32>) {\n    match tier {\n        Some(val) => println!("Bonus: {val}"),\n        // ¡Falta la rama para None!\n    }\n}`,
    fixes: [
      {
        text: 'Añadir la rama `None => println!("Sin bonus"),` al match',
        correct: true,
      },
      {
        text: 'Quitar el match y llamar a `tier.unwrap()` directamente',
        correct: false,
      },
      {
        text: 'Colocar `#[allow(incomplete)]` antes de la función',
        correct: false,
      },
    ],
    explanation:
      'Las ramas de un `match` en Rust deben ser 100% exhaustivas para garantizar que no existan estados no controlados en tiempo de ejecución.',
  },
  {
    id: 'BH05',
    title: 'Bug 5: Result ignorado silenciosamente',
    code: `use std::fs::File;\nfn write_audit() {\n    File::create("audit.log"); // Advertencia: unused Result that must be used\n}`,
    fixes: [
      {
        text: 'Propagar o verificar el error: `File::create("audit.log")?;` devolviendo Result',
        correct: true,
      },
      {
        text: 'Usar `drop(File::create("audit.log"))` para silenciar',
        correct: false,
      },
      { text: 'Castear la llamada a `()` con `as ()`', correct: false },
    ],
    explanation:
      'Los tipos marcados con `#[must_use]` (como `Result`) exigen inspección explícita para evitar fallos de E/S o red desatendidos.',
  },
  {
    id: 'BH06',
    title: 'Bug 6: Retorno de referencia a memoria efímera',
    code: `fn get_default_message() -> &str {\n    let msg = String::from("OK");\n    msg.as_str() // ¡Error: retorno de referencia a valor local!\n}`,
    fixes: [
      {
        text: 'Retornar `String` por valor (con ownership) en lugar de un slice `&str`',
        correct: true,
      },
      {
        text: "Castear `msg.as_str()` a `&'static str` con unsafe",
        correct: false,
      },
      {
        text: 'Asignar `msg` a una constante global dentro de la función',
        correct: false,
      },
    ],
    explanation:
      'El String local se desasigna al retornar de la función. Para devolver texto dinámico generado localmente, se debe transferir la propiedad del `String`.',
  },
];

function BugHunterGame() {
  const [index, setIndex] = useState(0);
  const [selectedFix, setSelectedFix] = useState<number>(-1);
  const [result, setResult] = useState<boolean | null>(null);

  const b = BUG_CASES[index];

  function checkFix() {
    if (selectedFix < 0) return;
    const isCorrect = b.fixes[selectedFix].correct;
    setResult(isCorrect);
    if (isCorrect) {
      updateProgress({ ...progress.value, xp: progress.value.xp + 15 });
    }
  }

  return (
    <Panel title={`Bug Hunter — ${b.title}`}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <span class="tag">
          Laboratorio {index + 1} de {BUG_CASES.length}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span class="char-pill valid">+15 XP al cazar el bug</span>
          <img
            src={image('debugger')}
            alt="Ferris cazando bugs"
            class="ferris-art"
            style={{ width: 44, height: 44 }}
          />
        </div>
      </div>

      <div class="codebox" style={{ margin: '10px 0' }}>
        <pre>{b.code}</pre>
      </div>

      <p style={{ fontWeight: 700, margin: '14px 0 10px' }}>
        ¿Cuál es la refactorización idiomática para subsanar este fallo?
      </p>

      <div class="choices">
        {b.fixes.map((f, i) => (
          <button
            key={f.text}
            type="button"
            class="choice"
            aria-pressed={selectedFix === i}
            onClick={() => {
              setSelectedFix(i);
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
            {f.text}
          </button>
        ))}
      </div>

      <div class="actions" style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button
          type="button"
          class="btn btn-primary"
          disabled={selectedFix < 0}
          onClick={checkFix}
        >
          <Bug size={16} /> Comprobar corrección
        </button>
        <button
          type="button"
          class="btn btn-outline"
          onClick={() => {
            setIndex((index + 1) % BUG_CASES.length);
            setSelectedFix(-1);
            setResult(null);
          }}
        >
          Siguiente bug <ChevronRight size={16} />
        </button>
      </div>

      {result !== null && (
        <div
          class={`feedback ${result ? 'ok' : 'no'}`}
          style={{ marginTop: 16 }}
        >
          <strong>
            {result ? '✓ ¡Bug subsanado con éxito!' : '✗ Corrección no válida'}
          </strong>
          <p style={{ margin: '6px 0 0' }}>{b.explanation}</p>
        </div>
      )}
    </Panel>
  );
}

const CONCURRENCY_CASES = [
  {
    id: 'CR01',
    title: 'Escenario 1: Deadlock por inversión de bloqueos (Lock Inversion)',
    code: `// Hilo 1: lock(A) -> lock(B)\nlet _a = lock_a.lock().unwrap();\nlet _b = lock_b.lock().unwrap();\n\n// Hilo 2: lock(B) -> lock(A) ¡Inverso!\nlet _b = lock_b.lock().unwrap();\nlet _a = lock_a.lock().unwrap();`,
    problem:
      'Si ambos hilos se ejecutan simultáneamente, Hilo 1 retiene A esperando B, e Hilo 2 retiene B esperando A.',
    options: [
      {
        text: 'Establecer un orden canónico estricto de adquisición (ambos hilos adquieren A antes de B)',
        correct: true,
      },
      {
        text: 'Aumentar la prioridad del Hilo 2 en el planificador del sistema operativo',
        correct: false,
      },
      {
        text: 'Envolver ambos mutexes en bloques unsafe para omitir las esperas',
        correct: false,
      },
    ],
    explanation:
      'La jerarquía estricta de bloqueos elimina el ciclo de espera circular (condición de Coffman), haciendo imposible el interbloqueo.',
  },
  {
    id: 'CR02',
    title: 'Escenario 2: Mutación concurrente de memoria compartida',
    code: `let mut counter = 0;\nfor _ in 0..10 {\n    std::thread::spawn(move || {\n        counter += 1; // Error: use of moved value / data race\n    });\n}`,
    problem:
      'Múltiples hilos intentan escribir en la misma dirección de memoria sin sincronización atómica.',
    options: [
      {
        text: 'Usar `Arc<AtomicUsize>` con `fetch_add(1, Ordering::Relaxed)`',
        correct: true,
      },
      {
        text: 'Declarar `static mut counter: usize = 0;` sin sincronización',
        correct: false,
      },
      {
        text: 'Usar `Rc<RefCell<usize>>` entre los diferentes hilos',
        correct: false,
      },
    ],
    explanation:
      '`AtomicUsize` provee operaciones atómicas directas a nivel de hardware, y `Arc` permite compartir la propiedad del contador entre los hilos.',
  },
  {
    id: 'CR03',
    title: 'Escenario 3: Canal MPSC sin backpressure (Desbordamiento de RAM)',
    code: `let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel();\n// El productor ingresa 50.000 mensajes/segundo\n// El consumidor solo puede procesar 500 mensajes/segundo`,
    problem:
      'La cola en memoria crece sin límite hasta que el sistema operativo mata el proceso por Out-of-Memory (OOM).',
    options: [
      {
        text: 'Usar canal acotado `mpsc::channel(1024)` y `tx.send().await` para pausar al productor',
        correct: true,
      },
      {
        text: 'Configurar 64 GB de swap en el servidor para acumular más mensajes',
        correct: false,
      },
      {
        text: 'Eliminar el canal y procesar todo de forma síncrona en el hilo principal',
        correct: false,
      },
    ],
    explanation:
      'Los canales acotados con `.send().await` suspenden la tarea productora cuando el buffer se satura, aplicando backpressure natural.',
  },
  {
    id: 'CR04',
    title: 'Escenario 4: Mutex síncrono retenido a través de un punto .await',
    code: `let mut guard = std_mutex.lock().unwrap();\ndo_slow_network_request().await; // ¡Bloqueo del worker thread de Tokio!\nguard.value += 1;`,
    problem:
      'Retener un std::sync::MutexGuard a través de `.await` monopoliza el worker thread de Tokio, impidiendo ejecutar otras tareas cooperativas.',
    options: [
      {
        text: 'Liberar el lock antes de la llamada asíncrona o usar `tokio::sync::Mutex`',
        correct: true,
      },
      {
        text: 'Convertir la llamada de red en síncrona bloqueante',
        correct: false,
      },
      {
        text: 'Aumentar la cantidad de threads en el runtime de Tokio a 500',
        correct: false,
      },
    ],
    explanation:
      '`std::sync::Mutex` no debe cruzar puntos `.await`. Si se requiere retener un bloqueo durante I/O asíncrono, se debe usar `tokio::sync::Mutex`.',
  },
  {
    id: 'CR05',
    title: 'Escenario 5: Cancelación de Tokio y consistencia transaccional',
    code: `tokio::select! {\n    _ = cancel_token.cancelled() => { /* Cancelación inmediata */ }\n    res = process_order(&mut tx) => res,\n}`,
    problem:
      'Si la tarea se cancela en un punto `.await` intermedio, la transacción en curso puede quedar en estado inconsistente.',
    options: [
      {
        text: 'Implementar un RAII Drop Guard que ejecute rollback automático al cancelarse la tarea',
        correct: true,
      },
      {
        text: 'Desactivar la cancelación en todo el servidor de producción',
        correct: false,
      },
      {
        text: 'Confiar en que la base de datos detectará la desconexión instantáneamente',
        correct: false,
      },
    ],
    explanation:
      'El destructor `Drop` en Rust se ejecuta incluso cuando una tarea de Tokio es cancelada en un `.await`, permitiendo rollbacks deterministas.',
  },
];

function ConcurrencyRaceGame() {
  const [index, setIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number>(-1);
  const [result, setResult] = useState<boolean | null>(null);

  const c = CONCURRENCY_CASES[index];

  function checkConcurrency() {
    if (selectedOpt < 0) return;
    const isCorrect = c.options[selectedOpt].correct;
    setResult(isCorrect);
    if (isCorrect) {
      updateProgress({ ...progress.value, xp: progress.value.xp + 15 });
    }
  }

  return (
    <Panel title={`Concurrency Race — ${c.title}`}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <span class="tag">
          Simulador {index + 1} de {CONCURRENCY_CASES.length}
        </span>
        <span class="char-pill valid">+15 XP al mitigar la carrera</span>
      </div>

      <div class="codebox" style={{ margin: '10px 0' }}>
        <pre>{c.code}</pre>
      </div>

      <div
        class="notice"
        style={{ margin: '12px 0', borderLeftColor: 'var(--forge)' }}
      >
        <strong>Riesgo de concurrencia:</strong> {c.problem}
      </div>

      <p style={{ fontWeight: 700, margin: '14px 0 10px' }}>
        ¿Qué estrategia arquitectónica garantiza seguridad de memoria y ausencia
        de deadlocks?
      </p>

      <div class="choices">
        {c.options.map((o, i) => (
          <button
            key={o.text}
            type="button"
            class="choice"
            aria-pressed={selectedOpt === i}
            onClick={() => {
              setSelectedOpt(i);
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
            {o.text}
          </button>
        ))}
      </div>

      <div class="actions" style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button
          type="button"
          class="btn btn-primary"
          disabled={selectedOpt < 0}
          onClick={checkConcurrency}
        >
          <Zap size={16} /> Verificar solución concurrente
        </button>
        <button
          type="button"
          class="btn btn-outline"
          onClick={() => {
            setIndex((index + 1) % CONCURRENCY_CASES.length);
            setSelectedOpt(-1);
            setResult(null);
          }}
        >
          Siguiente escenario <ChevronRight size={16} />
        </button>
      </div>

      {result !== null && (
        <div
          class={`feedback ${result ? 'ok' : 'no'}`}
          style={{ marginTop: 16 }}
        >
          <strong>
            {result
              ? '✓ ¡Arquitectura concurrente validada!'
              : '✗ Riesgo concurrente presente'}
          </strong>
          <p style={{ margin: '6px 0 0' }}>{c.explanation}</p>
        </div>
      )}
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
