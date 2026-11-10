import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const checks=[
 ['Lockfile npm',fs.existsSync('package-lock.json'),'package-lock.json requerido para npm ci'],
 ['Dependencias npm instaladas',fs.existsSync('node_modules/preact/package.json'),'Ejecutar npm ci en un entorno conectado'],
 ['Cargo disponible',spawnSync('cargo',['--version'],{encoding:'utf8'}).status===0,'Instalar Rust toolchain y ejecutar gates Cargo'],
 ['Chromium Playwright',fs.existsSync(`${process.env.HOME}/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome`),'Instalar navegador para E2E real']
];
for(const [label,ok,detail] of checks)console.log(`${ok?'READY':'BLOCKED'} ${label}${ok?'':': '+detail}`);
if(checks.some(([,ok])=>!ok)){console.error('RELEASE GATE: NO APROBADO, falta entorno/reproducibilidad');process.exitCode=1;}else console.log('PRECONDITIONS READY: faltan ejecutar y auditar controles completos');
