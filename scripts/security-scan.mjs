import fs from 'node:fs';import path from 'node:path';
const root=process.cwd();const ignore=new Set(['node_modules','dist','.git','coverage','target','docs','public']);
const findings=[];const suspicious=[/-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/,/ghp_[A-Za-z0-9]{30,}/,/AKIA[0-9A-Z]{16}/,/(?:api[_-]?key|access[_-]?token|password)\s*[:=]\s*['"][^'"]{12,}['"]/i];
function scan(dir){for(const f of fs.readdirSync(dir,{withFileTypes:true})){if(ignore.has(f.name)||f.name.startsWith('.env'))continue;const p=path.join(dir,f.name);if(f.isDirectory())scan(p);else if(f.isFile()&&/\.(?:ts|tsx|js|mjs|json|yml|yaml|md|rs)$/.test(f.name)){const t=fs.readFileSync(p,'utf8');if(suspicious.some(r=>r.test(t)))findings.push(path.relative(root,p));}}}
scan(root);if(findings.length){console.error('Potential secrets',findings);process.exitCode=1}else console.log('SECURITY PATTERN SCAN PASS (heuristic, not a substitute for secret scanning)');
