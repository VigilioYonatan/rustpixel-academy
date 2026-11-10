import {expect,test} from '@playwright/test';
test('Senior incident S07 shows branching decisions, remembers progress and can reset',async({page})=>{
 await page.goto('/#/challenge/S07-C01');
 await expect(page.getByRole('heading',{name:/Simulador interactivo/i})).toBeVisible();
 await page.getByRole('button',{name:/Registrar task owners y rastrear JoinHandles/}).click();
 await expect(page.getByText(/Etapa 2 \/ 3/)).toBeVisible();
 await page.reload();
 await expect(page.getByText(/Etapa 2 \/ 3/)).toBeVisible();
 await page.getByRole('button',{name:/Cerrar admisión, cancelar y drenar/}).click();
 await page.getByRole('button',{name:/Probar shutdown, cola llena/}).click();
 await expect(page.getByText(/3 de 3 decisiones alineadas/)).toBeVisible();
 await page.getByRole('button',{name:/Reiniciar incidente/}).click();
 await expect(page.getByText(/Etapa 1 \/ 3/)).toBeVisible();
});
