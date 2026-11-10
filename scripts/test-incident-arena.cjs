const fs=require('node:fs');const vm=require('node:vm');const assert=require('node:assert/strict');
const html=fs.readFileSync(new URL('../senior-incident-arena.html',`file://${__filename}`),'utf8');
const m=html.match(/<script>([\s\S]+?)<\/script>/);assert.ok(m,'Script de la demo no encontrado');
class Element {constructor(tag){this.tag=tag;this.children=[];this.attributes={};this.textContent='';this.disabled=false;}append(...nodes){this.children.push(...nodes)}replaceChildren(...nodes){this.children=nodes}setAttribute(k,v){this.attributes[k]=v}click(){if(this.onclick)this.onclick();}}
const elements=new Map();const docs={getElementById(id){if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)},createElement(tag){return new Element(tag)}};
const store=new Map();const storage={getItem(k){return store.get(k)??null},setItem(k,v){store.set(k,v)}};
const ctx=vm.createContext({document:docs,localStorage:storage,console,Blob:class Blob{},URL:{createObjectURL:()=> 'blob:local',revokeObjectURL(){}},setTimeout(f){f()},confirm:()=>true});
vm.runInContext(m[1],ctx,{timeout:5000});
assert.equal(vm.runInContext('IDS.length',ctx),18);
for(let i=1;i<=18;i++){
 const id='S'+String(i).padStart(2,'0');vm.runInContext(`current=${JSON.stringify(id)};render()`,ctx);
 for(let step=0;step<3;step++){
  const answer=vm.runInContext(`INCIDENTS[${JSON.stringify(id)}].steps[${step}].correct`,ctx);
  docs.getElementById('activity').children[2].children[answer].click();
 }
 assert.equal(vm.runInContext(`records[${JSON.stringify(id)}].status`,ctx),'resolved');
 assert.equal(vm.runInContext(`records[${JSON.stringify(id)}].choices.length`,ctx),3);
}
assert.equal(vm.runInContext("IDS.filter(id=>records[id].status==='resolved').length",ctx),18);
// Un cierre con la remediación errónea se registra como fallido.
vm.runInContext("current='S07';records[current]=empty(current);render()",ctx);
for(let k=0;k<3;k++){
 const answer=vm.runInContext(`INCIDENTS.S07.steps[${k}].correct`,ctx);const choice=k===1?(answer+1)%3:answer;
 docs.getElementById('activity').children[2].children[choice].click();
}
assert.equal(vm.runInContext('records.S07.status',ctx),'failed');
docs.getElementById('reset').click();assert.equal(vm.runInContext('records.S07.step',ctx),0);
docs.getElementById('clear').click();assert.equal(vm.runInContext('Object.keys(records).length',ctx),0);
console.log('PASS demo HTML: 18 incidentes, 54 elecciones correctas, fallo de remediación, reinicio y borrado local');
