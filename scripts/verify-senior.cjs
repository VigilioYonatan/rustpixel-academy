const {spawnSync}=require('node:child_process');
const {mkdtempSync,rmSync,existsSync}=require('node:fs');
const {tmpdir}=require('node:os');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const temp=mkdtempSync(path.join(tmpdir(),'rustpixel-senior-'));
const files=[
  'src/features/senior/model/senior.types.ts',
  'src/features/senior/engine/attempts.ts',
  'src/features/senior/engine/scenarios.ts',
  'src/features/senior/engine/artifacts.ts',
  'src/features/senior/engine/incident.ts',
  'src/features/senior/engine/incident-extensions.ts',
  'src/features/senior/engine/workspaces.ts',
  'src/features/senior/engine/backup.ts',
  'src/features/senior/engine/evidence.ts',
  'src/features/senior/engine/readiness.ts',
  'src/features/senior/engine/acceptance.ts',
];

function resolveTsc() {
  const candidates = [
    path.join(root, 'node_modules/typescript/bin/tsc'),
    path.join(root, '../nexamarket-ai-platform-source-v0.2.0/node_modules/typescript/bin/tsc'),
    path.join(root, '../enterprise-ai-agent-platform/node_modules/typescript/bin/tsc'),
  ];
  for (const c of candidates) {
    if (existsSync(c)) {
      return { cmd: process.execPath, args: [c] };
    }
  }
  const binary = process.platform === 'win32' ? 'tsc.cmd' : 'tsc';
  return { cmd: binary, args: [] };
}

try{
  const { cmd, args } = resolveTsc();
  const compile = spawnSync(cmd, [...args, '--target', 'ES2022', '--module', 'commonjs', '--moduleResolution', 'node', '--strict', '--outDir', temp, ...files], { cwd: root, encoding: 'utf8' });
  if (compile.status !== 0) {
    const err = (compile.stdout || '') + (compile.stderr || '') + (compile.error ? compile.error.message : '');
    process.stderr.write(err || 'Failed to execute tsc\n');
    process.exitCode = 1;
  } else {
    const test = spawnSync(process.execPath, [path.join(__dirname, 'test-senior-domain.cjs'), temp], { cwd: root, encoding: 'utf8' });
    process.stdout.write(test.stdout || '');
    process.stderr.write(test.stderr || '');
    if (test.status !== 0) process.exitCode = 1;
  }
}finally{
  rmSync(temp, { recursive: true, force: true });
}
