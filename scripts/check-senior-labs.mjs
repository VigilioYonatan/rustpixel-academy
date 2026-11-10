import {readdirSync,existsSync,readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
const dir=resolve('rust-labs/senior');let faults=[];const folders=readdirSync(dir,{withFileTypes:true}).filter(d=>d.isDirectory());
for(const folder of folders){const base=join(dir,folder.name),files=['Cargo.toml','README.md','src/lib.rs'];for(const file of files)if(!existsSync(join(base,file)))faults.push(`${folder.name}: missing ${file}`);
const source=existsSync(join(base,'src/lib.rs'))?readFileSync(join(base,'src/lib.rs'),'utf8'):'';if(!source.includes('#[test]')&&!source.includes('#[tokio::test]'))faults.push(`${folder.name}: no unit test entry point`);
const manifest=existsSync(join(base,'Cargo.toml'))?readFileSync(join(base,'Cargo.toml'),'utf8'):'';if(!/edition\s*=\s*"2024"/.test(manifest))faults.push(`${folder.name}: not edition 2024`);}
const expected=['s01','s02','s03','s04','s05','s06','s07','s08','s09','s10','s11','s12','s13','s14','s15','s16','s17','s18'];for(const id of expected)if(folders.filter(d=>d.name.startsWith(id+'-')).length!==1)faults.push(`${id}: expected exactly one lab`);
if(folders.length!==18)faults.push(`Expected 18 labs, got ${folders.length}`);
if(faults.length){console.error(faults.join('\n'));process.exitCode=1}else console.log('STRUCTURAL PASS: 18 distinct Cargo labs with sources and test entry points; cargo execution still required.');
