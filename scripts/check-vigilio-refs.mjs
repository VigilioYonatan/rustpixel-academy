import {readFileSync,readdirSync,existsSync} from 'node:fs';import {resolve,join} from 'node:path';
const root=resolve('.agents/skills/vigilio');const failures=[];let refs=0;
for(const dir of readdirSync(root,{withFileTypes:true})){if(!dir.isDirectory()||dir.name==='.vigilio-docs')continue;const file=join(root,dir.name,'SKILL.md');if(!existsSync(file))continue;const text=readFileSync(file,'utf8');for(const match of text.matchAll(/\]\(\.\.\/\.vigilio-docs\/([^)]*)\)/g)){refs++;if(!existsSync(join(root,'.vigilio-docs',match[1])))failures.push(`${dir.name}: ${match[1]}`);}}
if(failures.length){console.error(failures.join('\n'));process.exitCode=1}else console.log(`VIGILIO REFERENCES PASS: ${refs} direct normative links available locally`);
