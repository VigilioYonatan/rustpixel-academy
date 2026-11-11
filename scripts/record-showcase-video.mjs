import { existsSync, mkdirSync, renameSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const VIDEO_DIR = join(ROOT, 'screenshots', 'videos');

if (!existsSync(VIDEO_DIR)) {
  mkdirSync(VIDEO_DIR, { recursive: true });
}

async function recordShowcase() {
  console.log('🎬 Iniciando grabación de video de showcase interactivo en Senior Mode...');
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();
  const BASE_URL = 'http://localhost:5174';

  // Inyectar cursor visual suave
  await page.addInitScript(() => {
    window.addEventListener('DOMContentLoaded', () => {
      const cursor = document.createElement('div');
      cursor.id = 'visual-cursor';
      cursor.style.cssText = `
        position: fixed;
        width: 22px;
        height: 22px;
        border: 2px solid #e76f36;
        background: rgba(231, 111, 54, 0.35);
        border-radius: 50%;
        pointer-events: none;
        z-index: 999999;
        transform: translate(-50%, -50%);
        transition: transform 0.08s ease, width 0.15s ease, height 0.15s ease, background 0.15s ease;
        box-shadow: 0 0 10px rgba(231, 111, 54, 0.6);
      `;
      document.body.appendChild(cursor);

      document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
      });

      document.addEventListener('mousedown', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(0.7)';
        cursor.style.background = 'rgba(242, 190, 88, 0.8)';
      });

      document.addEventListener('mouseup', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.background = 'rgba(231, 111, 54, 0.35)';
      });
    });
  });

  async function moveAndClick(selector, waitAfter = 700) {
    try {
      const el = page.locator(selector).first();
      await el.waitFor({ state: 'visible', timeout: 5000 });
      const box = await el.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 12 });
        await page.waitForTimeout(150);
        await page.mouse.down();
        await page.waitForTimeout(100);
        await page.mouse.up();
        await page.waitForTimeout(waitAfter);
      }
    } catch (e) {
      console.warn(`  ⚠️ Click en '${selector}' falló:`, e.message);
    }
  }

  async function smoothScroll(distance, steps = 10, stepDelay = 40) {
    for (let i = 0; i < steps; i++) {
      await page.mouse.wheel(0, distance / steps);
      await page.waitForTimeout(stepDelay);
    }
  }

  // ==========================================
  // ESCENA 1: HOME & HEROSHOWCASE
  // ==========================================
  console.log('▶ Escena 1: Home Hero, Métricas y Selector de Tema...');
  await page.goto(`${BASE_URL}/#/`);
  await page.waitForTimeout(1000);

  // Mover mouse en el hero
  await page.mouse.move(300, 260, { steps: 15 });
  await page.waitForTimeout(600);

  // Scroll suave para mostrar métricas y rutas
  await smoothScroll(400, 12, 40);
  await page.waitForTimeout(800);
  await smoothScroll(-400, 12, 30);
  await page.waitForTimeout(500);

  // Conmutar tema a Light Mode
  console.log('  - Conmutando a Modo Claro...');
  await moveAndClick('.circle-action[title*="claro" i], .circle-action[title*="modo" i], .header-actions button:has(svg.lucide-sun, svg.lucide-moon)');
  await page.waitForTimeout(900);

  // Conmutar de vuelta a Dark Mode
  console.log('  - Regresando a Modo Oscuro...');
  await moveAndClick('.circle-action[title*="oscuro" i], .circle-action[title*="modo" i], .header-actions button:has(svg.lucide-sun, svg.lucide-moon)');
  await page.waitForTimeout(800);

  // ==========================================
  // ESCENA 2: CATÁLOGO DE APRENDE RUST
  // ==========================================
  console.log('▶ Escena 2: Catálogo Curricular (54 Módulos)...');
  await moveAndClick('.primary-nav a[href="#/learn"]');
  await page.waitForTimeout(800);

  // Búsqueda interactiva
  console.log('  - Filtrando módulos por "ownership"...');
  await page.fill('#search', 'ownership');
  await page.waitForTimeout(700);
  await page.fill('#search', '');
  await page.waitForTimeout(500);

  // Abrir módulo B01
  console.log('  - Abriendo módulo B01...');
  await moveAndClick('a.card[href*="/module/B01"]');
  await page.waitForTimeout(1000);

  // ==========================================
  // ESCENA 3: LECCIÓN Y EDITOR CODEMIRROR 6
  // ==========================================
  console.log('▶ Escena 3: Lección Interactiva y Editor CodeMirror 6...');
  // Cambiar entre pasos de la lección
  await moveAndClick('button:has-text("02. rustc")');
  await page.waitForTimeout(600);
  await moveAndClick('button:has-text("01. Rustup")');
  await page.waitForTimeout(600);

  // Escribir en el editor CodeMirror 6 con resaltado sintáctico de alto contraste
  console.log('  - Escribiendo código Rust en el editor...');
  await moveAndClick('.cm-content');
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await page.keyboard.type('    let version = "2024";', { delay: 40 });
  await page.waitForTimeout(900);

  // Restaurar código a plantilla
  await moveAndClick('button:has-text("Restaurar")');
  await page.waitForTimeout(600);

  // Marcar como estudiado
  await moveAndClick('button:has-text("Marcar estudiado")');
  await page.waitForTimeout(800);

  // ==========================================
  // ESCENA 4: MINIJUEGOS & RETOS LÓGICOS
  // ==========================================
  console.log('▶ Escena 4: Minijuegos & Ownership Puzzle...');
  await moveAndClick('.primary-nav a[href="#/games"]');
  await page.waitForTimeout(800);

  // Seleccionar respuesta en Quiz Battle
  await moveAndClick('.choice:has-text("La variable original deja de ser válida")');
  await page.waitForTimeout(400);
  await moveAndClick('button:has-text("Comprobar solución")');
  await page.waitForTimeout(1000);

  // Cambiar a pestaña Ownership Puzzle
  await moveAndClick('button:has-text("Ownership Puzzle"), .game-tile:has-text("Ownership")');
  await page.waitForTimeout(800);
  await moveAndClick('button:has-text("Siguiente evento")');
  await page.waitForTimeout(700);

  // ==========================================
  // ESCENA 5: SENIOR MODE DASHBOARD & RADAR
  // ==========================================
  console.log('▶ Escena 5: Senior Mode Dashboard y Radar de Competencias...');
  await page.goto(`${BASE_URL}/#/senior`);
  await page.waitForTimeout(1000);

  // Scroll para inspeccionar el Radar SVG de 5 dimensiones
  await smoothScroll(300, 10, 40);
  await page.waitForTimeout(800);

  // Abrir modal de los 90 Criterios de Aceptación
  console.log('  - Abriendo Matriz de los 90 Gates de Aceptación...');
  await moveAndClick('button:has-text("90 Gates de Aceptación")');
  await page.waitForTimeout(1000);

  // Cerrar modal
  await moveAndClick('button:has-text("Cerrar matriz"), button[aria-label="Cerrar modal"]');
  await page.waitForTimeout(800);

  // ==========================================
  // ESCENA 6: SENIOR CHALLENGE S01 & DIFF VIEWER
  // ==========================================
  console.log('▶ Escena 6: Senior Challenge S01 y Visor de Diferencias (Diff)...');
  await page.goto(`${BASE_URL}/#/challenge/S01-C01`);
  await page.waitForTimeout(1000);

  // Ir a pestaña de Artefacto y abrir Comparativa Senior Diff
  await moveAndClick('button:has-text("Artefacto & Revisión")');
  await page.waitForTimeout(800);
  await moveAndClick('button:has-text("Comparativa Senior Diff")');
  await page.waitForTimeout(1200);

  // Volver a Contexto & Formular Solución
  await moveAndClick('button:has-text("Contexto & Guía")');
  await page.waitForTimeout(600);
  await moveAndClick('label.choice:has-text("Perfilar la ruta")');
  await page.waitForTimeout(400);

  // Redactar diagnóstico
  await page.fill('#senior-notes', 'Diagnóstico Senior: El parser genera 25.000 clones de String por segundo. Solución: Refactorizar hacia slices prestados (&str) con lifetime acotado y benchmark de regresión.');
  await page.fill('#senior-evidence', 'cargo test --lib -- --nocapture && cargo clippy -- -D warnings && cargo bench');
  await page.waitForTimeout(800);

  // Entregar análisis
  await moveAndClick('button:has-text("Entregar análisis")');
  await page.waitForTimeout(1000);

  // ==========================================
  // ESCENA 7: INCIDENT ARENA & TELEMETRÍA EN VIVO
  // ==========================================
  console.log('▶ Escena 7: Incident Arena y Telemetría Sparkline en Vivo...');
  await moveAndClick('button:has-text("1. Analizar y resolver")');
  await page.waitForTimeout(400);
  await moveAndClick('button:has-text("Incidente Arena")');
  await page.waitForTimeout(1000);

  // Tomar decisiones en el incidente
  console.log('  - Seleccionando decisiones de mitigación del incidente...');
  await moveAndClick('.incident-actions button:first-child');
  await page.waitForTimeout(1000);

  // Desplegar detalles de decisión
  await moveAndClick('details summary');
  await page.waitForTimeout(800);

  // ==========================================
  // ESCENA 8: PROGRESO Y DESPEDIDA
  // ==========================================
  console.log('▶ Escena 8: Mi Progreso y Cierre...');
  await page.goto(`${BASE_URL}/#/progress`);
  await page.waitForTimeout(1000);

  // Regresar a Home
  await page.goto(`${BASE_URL}/#/`);
  await page.waitForTimeout(1200);

  // Cerrar y guardar video
  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();

  // Renombrar el archivo generado a un nombre canónico
  const videoPath = await video.path();
  const targetPath = join(VIDEO_DIR, 'rustpixel-academy-showcase.webm');

  if (existsSync(targetPath)) {
    try { unlinkSync(targetPath); } catch {}
  }
  renameSync(videoPath, targetPath);

  console.log(`\n🎉 VIDEO SHOWCASE GENERADO CON ÉXITO:`);
  console.log(`📹 Archivo: ${targetPath}`);
}

recordShowcase().catch((err) => {
  console.error('❌ Error grabando showcase:', err);
  process.exit(1);
});
