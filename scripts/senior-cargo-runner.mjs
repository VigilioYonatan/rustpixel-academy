import { readdirSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');
const labsRoot = join(root, 'rust-labs');

function findCrates(dir) {
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (existsSync(join(full, 'Cargo.toml'))) {
        results.push(full);
      } else {
        results.push(...findCrates(full));
      }
    }
  }
  return results;
}

const crates = findCrates(labsRoot);
console.log(`\n🦀 RustPixel Academy — Senior Cargo Runner`);
console.log(`Found ${crates.length} crates in ${labsRoot}\n`);

const results = [];
let totalFmtPass = 0;
let totalCheckPass = 0;
let totalClippyPass = 0;
let totalTestPass = 0;

for (const crateDir of crates) {
  const name = crateDir.split(/[\\/]/).pop();
  const manifest = join(crateDir, 'Cargo.toml');

  // 1. fmt check
  const fmtRes = spawnSync('cargo', ['fmt', '--manifest-path', manifest, '--all', '--', '--check'], {
    encoding: 'utf8',
  });
  const fmtOk = fmtRes.status === 0;
  if (fmtOk) totalFmtPass++;

  // 2. check all targets
  const chkRes = spawnSync('cargo', ['check', '--manifest-path', manifest, '--all-targets'], {
    encoding: 'utf8',
  });
  const chkOk = chkRes.status === 0;
  if (chkOk) totalCheckPass++;

  // 3. clippy
  const clpRes = spawnSync(
    'cargo',
    ['clippy', '--manifest-path', manifest, '--all-targets', '--', '-D', 'warnings'],
    { encoding: 'utf8' }
  );
  const clpOk = clpRes.status === 0;
  if (clpOk) totalClippyPass++;

  // 4. test
  const tstRes = spawnSync('cargo', ['test', '--manifest-path', manifest], {
    encoding: 'utf8',
  });
  const tstOk = tstRes.status === 0;
  if (tstOk) totalTestPass++;

  const testStatus = tstOk
    ? 'PASS'
    : tstRes.stderr?.includes('link.exe') || tstRes.stdout?.includes('link.exe')
    ? 'BLOCKED (link.exe missing)'
    : 'FAIL';

  results.push({
    name,
    fmt: fmtOk ? 'PASS' : 'FAIL',
    check: chkOk ? 'PASS' : 'FAIL',
    clippy: clpOk ? 'PASS' : 'FAIL',
    test: testStatus,
  });

  const summary = `[${name}] fmt:${results.at(-1).fmt} check:${results.at(-1).check} clippy:${results.at(-1).clippy} test:${results.at(-1).test}`;
  console.log(summary);
}

console.log(`\n======================================================`);
console.log(`SUMMARY: ${crates.length} Crates`);
console.log(`  cargo fmt:    ${totalFmtPass}/${crates.length} PASS`);
console.log(`  cargo check:  ${totalCheckPass}/${crates.length} PASS`);
console.log(`  cargo clippy: ${totalClippyPass}/${crates.length} PASS`);
console.log(`  cargo test:   ${totalTestPass}/${crates.length} PASS`);
console.log(`======================================================\n`);

if (process.argv.includes('--strict') && (totalFmtPass < crates.length || totalCheckPass < crates.length)) {
  process.exitCode = 1;
}
