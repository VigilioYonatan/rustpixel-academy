const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto('http://localhost:5174/#/challenge/S01-C01');
  await page.waitForTimeout(600);
  await page.click('button:has-text("Incidente Arena")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'screenshots/showcase/09_challenge_incident_sparkline.png' });

  // Also capture the diff mode
  await page.click('button:has-text("Artefacto & Revisión")');
  await page.waitForTimeout(400);
  await page.click('button:has-text("Comparativa Senior Diff")');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'screenshots/showcase/10_challenge_diff_viewer.png' });

  await browser.close();
  console.log('✓ Capturas 09 y 10 generadas con éxito');
})();
