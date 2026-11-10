const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const SHOWCASE_DIR = path.join(ROOT, 'screenshots', 'showcase');

fs.mkdirSync(SHOWCASE_DIR, { recursive: true });

const BASE_URL = process.env.APP_URL || 'http://localhost:5174';

const SHOWCASE_VIEWS = [
  {
    name: '01_home_dark_hero',
    url: `${BASE_URL}/#/`,
    theme: 'dark',
    setup: async (page) => {
      // Ensure dark theme
      await page.evaluate(() => {
        document.documentElement.dataset.theme = 'dark';
      });
      await page.waitForTimeout(300);
    },
  },
  {
    name: '02_home_light_hero',
    url: `${BASE_URL}/#/`,
    theme: 'light',
    setup: async (page) => {
      await page.evaluate(() => {
        document.documentElement.dataset.theme = 'light';
      });
      await page.waitForTimeout(300);
    },
  },
  {
    name: '03_learn_catalog',
    url: `${BASE_URL}/#/learn`,
    theme: 'dark',
    setup: async (page) => {
      await page.evaluate(() => {
        document.documentElement.dataset.theme = 'dark';
      });
      await page.waitForTimeout(300);
    },
  },
  {
    name: '04_editor_lesson_b01',
    url: `${BASE_URL}/#/module/B01`,
    theme: 'dark',
    setup: async (page) => {
      await page.waitForTimeout(400);
    },
  },
  {
    name: '05_senior_dashboard',
    url: `${BASE_URL}/#/senior`,
    theme: 'dark',
    setup: async (page) => {
      await page.waitForTimeout(400);
    },
  },
  {
    name: '06_senior_challenge_s01',
    url: `${BASE_URL}/#/challenge/S01-C01`,
    theme: 'dark',
    setup: async (page) => {
      await page.waitForTimeout(400);
    },
  },
  {
    name: '07_incident_arena_standalone',
    url: `${BASE_URL}/senior-incident-arena.html`,
    theme: 'dark',
    setup: async (page) => {
      await page.waitForTimeout(400);
    },
  },
  {
    name: '08_acceptance_90_gates_matrix',
    url: `${BASE_URL}/#/senior`,
    theme: 'dark',
    setup: async (page) => {
      await page.waitForTimeout(300);
      const matrixBtn = page.locator('button:has-text("90 Gates")').first();
      await matrixBtn.click();
      await page.waitForTimeout(500);
    },
  },
];

async function main() {
  console.log('📸 Iniciando captura de showcase para README y auditoría visual...');
  console.log(`🌐 URL Base: ${BASE_URL}\n`);

  const browser = await chromium.launch({ headless: true });
  // Retina 2x display
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  for (const view of SHOWCASE_VIEWS) {
    console.log(`📷 Capturando: ${view.name}...`);
    try {
      await page.goto(view.url, { waitUntil: 'networkidle', timeout: 15000 });
      if (view.setup) {
        await view.setup(page);
      }
      const outPath = path.join(SHOWCASE_DIR, `${view.name}.png`);
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`  ✓ Guardado: ${outPath}`);
    } catch (err) {
      console.error(`  ❌ Error capturando ${view.name}:`, err.message);
    }
  }

  await browser.close();

  console.log('\n======================================================');
  console.log('🎉 CAPTURAS SHOWCASE COMPLETADAS (Retina 2x)');
  console.log(`Ubicación: ${SHOWCASE_DIR}`);
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('Fallo fatal:', err);
  process.exit(1);
});
