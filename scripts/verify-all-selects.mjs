import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCREENSHOTS_DIR = path.join(ROOT, 'screenshots', 'selects');

fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const BASE_URL = process.env.APP_URL || 'http://localhost:5174';

const ROUTES_TO_INSPECT = [
  { name: '01_home', url: `${BASE_URL}/#/` },
  { name: '02_learn_catalog', url: `${BASE_URL}/#/learn` },
  { name: '03_module_b01', url: `${BASE_URL}/#/module/B01` },
  { name: '04_module_b05_ownership', url: `${BASE_URL}/#/module/B05` },
  { name: '05_module_i03_traits', url: `${BASE_URL}/#/module/I03` },
  { name: '06_module_a05_tokio', url: `${BASE_URL}/#/module/A05` },
  { name: '07_module_s01_senior', url: `${BASE_URL}/#/module/S01` },
  { name: '08_games_quiz', url: `${BASE_URL}/#/games` },
  { name: '09_ecosystem_academy', url: `${BASE_URL}/#/ecosystem` },
  { name: '10_senior_dashboard', url: `${BASE_URL}/#/senior` },
  { name: '11_senior_challenge_s01', url: `${BASE_URL}/#/challenge/S01-C01` },
  { name: '12_senior_challenge_s04_unsafe', url: `${BASE_URL}/#/challenge/S04-C01` },
  { name: '13_senior_challenge_s18_sysdesign', url: `${BASE_URL}/#/challenge/S18-C01` },
  { name: '14_progress_logros', url: `${BASE_URL}/#/progress` },
  { name: '15_settings_preferences', url: `${BASE_URL}/#/settings` },
  { name: '16_standalone_incident_arena', url: `${BASE_URL}/senior-incident-arena.html` },
  { name: '17_standalone_senior_demo', url: `${BASE_URL}/senior-demo.html` },
];

async function main() {
  console.log('🚀 Iniciando verificación de navegación y validación de <select> / formularios...');
  console.log(`🌐 URL Base: ${BASE_URL}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const auditReport = [];
  let totalSelectsChecked = 0;
  let hasErrors = false;

  for (const item of ROUTES_TO_INSPECT) {
    console.log(`👉 Navegando a: ${item.name} (${item.url})`);
    try {
      await page.goto(item.url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(400);

      // Inspección de selects en la página
      const selects = await page.$$('select');
      const selectInfo = [];

      for (let i = 0; i < selects.length; i++) {
        const select = selects[i];
        const isVisible = await select.isVisible();
        const optionCount = await select.evaluate((el) => el.options.length);
        const selectedValue = await select.evaluate((el) => el.value);
        const ariaLabel = (await select.getAttribute('aria-label')) || (await select.getAttribute('id')) || `select-${i}`;

        if (optionCount === 0) {
          console.error(`  ❌ ERROR: Select "${ariaLabel}" en ${item.name} está VACÍO.`);
          hasErrors = true;
        }

        selectInfo.push({
          ariaLabel,
          isVisible,
          optionCount,
          selectedValue,
        });
        totalSelectsChecked++;
      }

      // Validar inputs y textareas
      const inputCount = await page.$$eval('input:not([type="hidden"])', (els) => els.length);
      const textareaCount = await page.$$eval('textarea', (els) => els.length);
      const buttonCount = await page.$$eval('button', (els) => els.length);

      // Captura de pantalla
      const shotPath = path.join(SCREENSHOTS_DIR, `${item.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });

      auditReport.push({
        page: item.name,
        selects: selectInfo.length,
        inputs: inputCount,
        textareas: textareaCount,
        buttons: buttonCount,
        status: 'OK',
      });

      console.log(`  ✓ OK · Selects: ${selectInfo.length} · Inputs: ${inputCount} · Textareas: ${textareaCount} · Botones: ${buttonCount}`);
    } catch (err) {
      console.error(`  ❌ Error al procesar ${item.name}:`, err.message);
      hasErrors = true;
      auditReport.push({
        page: item.name,
        error: err.message,
        status: 'FAIL',
      });
    }
  }

  await browser.close();

  console.log('\n======================================================');
  console.log('📊 RESUMEN DE NAVEGACIÓN Y AUDITORÍA DE FORMULARIOS');
  console.log('======================================================');
  console.table(auditReport);
  console.log(`Total páginas inspeccionadas: ${auditReport.length}`);
  console.log(`Total selects validados: ${totalSelectsChecked}`);
  console.log(`Capturas guardadas en: ${SCREENSHOTS_DIR}`);

  if (hasErrors) {
    console.error('\n❌ La verificación detectó anomalías en páginas o selects.');
    process.exit(1);
  } else {
    console.log('\n✅ PASS: Todas las páginas y formularios son válidos.');
  }
}

main().catch((err) => {
  console.error('Fallo fatal:', err);
  process.exit(1);
});
