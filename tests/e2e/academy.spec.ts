import {expect,test} from '@playwright/test';
test('homepage navigates to Rust Senior modules',async ({page})=>{
  await page.goto('/');
  await expect(page.getByRole('heading',{name:/RustPixel/})).toBeVisible();
  await page.getByRole('navigation',{name:'Navegación principal'}).getByRole('link',{name:/Senior Mode/}).click();
  await expect(page.getByRole('heading',{name:/Rust Senior Mode/})).toBeVisible();
  await page.getByRole('link',{name:/Rust idiomático y ownership avanzado/}).first().click();
  await expect(page.getByRole('heading',{name:/S01/})).toBeVisible();
});
test('quiz shows real feedback',async ({page})=>{
  await page.goto('/#/games');
  await page.getByRole('button',{name:/La variable original deja de ser válida/}).click();
  await page.getByRole('button',{name:'Comprobar respuesta'}).click();
  await expect(page.getByRole('status')).toContainText('Correcto');
});
