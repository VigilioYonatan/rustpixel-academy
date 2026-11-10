// Execute compiled, strict-checked TypeScript domain modules from a temporary directory.
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const root=process.argv[2];if(!root)throw Error('Usage: node scripts/test-senior-domain.cjs compiled-directory');
const {newAttempt,updateAttempt,submitAttempt,selfReview,scoreAttempt,nextRevision,parseSeniorRecord,decisionResult}=require(path.join(root,'engine/attempts.js'));
const {getScenario,scenarioCount}=require(path.join(root,'engine/scenarios.js'));
const {getSeniorArtifact,artifactCount}=require(path.join(root,'engine/artifacts.js'));
const {INCIDENTS,newIncident,advanceIncident,incidentScore,parseIncidentRun,incidentReport}=require(path.join(root,'engine/incident.js'));
const content=JSON.parse(fs.readFileSync(path.join(__dirname,'../src/content/senior/challenges.json'),'utf8'));
const fieldGuides=JSON.parse(fs.readFileSync(path.join(__dirname,'../src/content/senior/field-guides.json'),'utf8'));
assert.equal(fieldGuides.length,18);assert.deepEqual(fieldGuides.map(g=>g.id).sort(),Array.from({length:18},(_,i)=>`S${String(i+1).padStart(2,'0')}`));
for(const guide of fieldGuides){for(const key of ['title','baseline','implementation','adversarial','verification','command'])assert.ok(typeof guide[key]==='string'&&guide[key].length>(key==='title'?8:24),`${guide.id}:${key}`);assert.ok(guide.command.includes('cargo test'));}
assert.equal(content.length,18);assert.equal(scenarioCount(),18);assert.equal(artifactCount(),18);
for(const challenge of content){
 const scenario=getScenario(challenge);const artifact=getSeniorArtifact(challenge.moduleId);assert.ok(artifact?.body.length>35);assert.ok(artifact?.reviewPrompt.length>35);assert.equal(scenario.options.length,3);assert.ok(['a','b','c'].includes(scenario.recommended));assert.ok(scenario.reason.length>30);assert.ok(scenario.timeline.length>=3);
 let a=newAttempt(challenge);assert.equal(a.status,'draft');assert.throws(()=>submitAttempt(a));
 a=updateAttempt(a,{decision:scenario.recommended,notes:'Se identifica la causa, se documentan las restricciones y se plantea un caso de regresión verificable para este escenario.',evidenceNotes:'Ejecutar pruebas del crate, repetir el caso adversario y comparar resultados antes/después.'});
 assert.equal(decisionResult(a.decision,scenario.recommended),'supported');
 a=submitAttempt(a);assert.equal(a.status,'submitted');assert.throws(()=>updateAttempt(a,{notes:'modificación tardía'}));
 const scores={correctness:4,reliability:3,architecture:2,performance:1,reasoning:4};a=selfReview(a,scores);assert.equal(a.status,'self-reviewed');assert.equal(scoreAttempt(a),72.5);
 const store=parseSeniorRecord({version:2,attempts:{[challenge.id]:a,evil:{status:'self-reviewed'}}});assert.ok(store.attempts[challenge.id]);assert.equal(Object.keys(store.attempts).length,1);assert.deepEqual(store.history,{});
 const b=nextRevision(a);assert.equal(b.status,'draft');assert.equal(b.revision,2);assert.equal(scoreAttempt(b),null);
 assert.throws(()=>nextRevision(b));
}
assert.deepEqual(parseSeniorRecord({version:2,attempts:[]}).attempts,{});
assert.equal(parseSeniorRecord({version:2,attempts:{},history:{'S01-C01':[newAttempt(content[0])]}}).history['S01-C01'].length,1);
assert.deepEqual(parseSeniorRecord({version:2,attempts:{'S01-C01':{status:'self-reviewed',scores:{correctness:999}}}}).attempts,{});
console.log(`PASS: 18 challenges; state transitions, invalid submissions, rubric, revisions, storage validation and references`);

assert.equal(Object.keys(INCIDENTS).length,18);
for(const id of Object.keys(INCIDENTS)){
 const scenario=INCIDENTS[id];let run=newIncident(id);assert.equal(incidentScore(run),null);
 assert.throws(()=>advanceIncident(run,8));
 assert.equal(parseIncidentRun({id,step:99,choices:[],status:'resolved'},id).step,0);
 for(const step of scenario.steps){run=advanceIncident(run,step.correct);assert.equal(run.choices.length,run.step);assert.equal(parseIncidentRun(JSON.parse(JSON.stringify(run)),id).step,run.step);}
 assert.equal(incidentScore(run),3);assert.ok(incidentReport(run).includes('SIMULACIÓN EDUCATIVA'));assert.ok(incidentReport(run).includes(scenario.title));assert.throws(()=>advanceIncident(run,0));
 let misleading=newIncident(id);for(let k=0;k<scenario.steps.length;k++)misleading=advanceIncident(misleading,k===1?(scenario.steps[k].correct+1)%3:scenario.steps[k].correct);assert.equal(misleading.status,'failed','La remediación central incorrecta impide cierre exitoso');assert.equal(incidentScore(misleading),2);
 let poor=newIncident(id);for(const st of scenario.steps)poor=advanceIncident(poor,(st.correct+1)%3);assert.equal(incidentScore(poor),0);assert.equal(poor.status,'failed');
}
console.log(`PASS: ${Object.keys(INCIDENTS).length} multi-step educational incidents, correct/wrong branches, state validation and closure`);

const {emptyReview,parseReview,addReviewComment,removeReviewComment,emptyArchitecture,parseArchitecture,addArchitectureNode,removeArchitectureNode,addArchitectureEdge,assessArchitecture,architectureADR}=require(path.join(root,'engine/workspaces.js'));
for(const challenge of content){
 const id=challenge.id;
 let review=emptyReview(id);review=addReviewComment(review,2,'major','Explicar riesgo de panics y proponer una corrección testeable');
 assert.equal(review.comments.length,1);assert.equal(parseReview(JSON.parse(JSON.stringify(review)),id).comments.length,1);
 assert.equal(parseReview({...review,challengeId:'S99-C01'},id).comments.length,0);
 assert.throws(()=>addReviewComment(review,0,'major','Comentario válido con longitud suficiente'));
 assert.throws(()=>addReviewComment(review,1,'minor','corto'));
 assert.equal(removeReviewComment(review,review.comments[0].id).comments.length,0);
 let a=emptyArchitecture(id);
 a=addArchitectureNode(a,{id:'api',name:'Servicio API',kind:'service'});
 a=addArchitectureNode(a,{id:'db',name:'Base de datos',kind:'database'});
 a=addArchitectureEdge(a,{from:'api',to:'db',protocol:'SQL'});
 assert.equal(parseArchitecture(JSON.parse(JSON.stringify(a)),id).nodes.length,2);
 assert.equal(parseArchitecture({...a,edges:[{from:'api',to:'missing',protocol:'SQL'}]},id).nodes.length,0);
 assert.throws(()=>addArchitectureNode(a,{id:'api',name:'Duplicado',kind:'service'}));
 assert.throws(()=>addArchitectureEdge(a,{from:'api',to:'db',protocol:'SQL'}));
 assert.ok(assessArchitecture(a).length>0);
 a={...a,context:'Contexto de alta carga y contratos de integridad obligatorios.',decision:'El servicio API accede a la base con transacciones verificables.',alternatives:'Se evaluó un sistema asíncrono alternativo.',consequences:'Aumenta acoplamiento y requiere monitoreo del pool.',verification:'Ejecutar pruebas de contrato, errores y rollback.'};
 assert.deepEqual(assessArchitecture(a),[]);
 assert.ok(architectureADR(a).includes('Estado: Propuesto por estudiante (NO VERIFICADO)'));
 assert.equal(removeArchitectureNode(a,'db').edges.length,0);
}
console.log('PASS: 18 review workspaces and 18 architecture workspaces; valid/invalid inputs, ADR export and graph integrity');


const {createSeniorBackup,parseSeniorBackup,restoreSeniorBackup,blankSeniorBackup}=require(path.join(root,'engine/backup.js'));
function fakeStorage(initial={}){const data=new Map(Object.entries(initial));return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k),entries:()=>Object.fromEntries(data)};}
let storage=fakeStorage();let snapshot=createSeniorBackup(storage);assert.equal(snapshot.format,'rustpixel-senior-backup');
assert.deepEqual(parseSeniorBackup(JSON.parse(JSON.stringify(snapshot))).reviews,{});
assert.throws(()=>parseSeniorBackup({...snapshot,reviews:{'S01-C01':{version:1,challengeId:'S01-C01',comments:[{line:0}]}}}));
const review=addReviewComment(emptyReview('S17-C01'),2,'major','Revisar panics, retries y política de backpressure');
const arc=addArchitectureNode(emptyArchitecture('S18-C01'),{id:'api',kind:'service',name:'API'});
snapshot={...snapshot,reviews:{'S17-C01':review},architectures:{'S18-C01':arc},incidents:{S07:newIncident('S07')}};
restoreSeniorBackup(storage,snapshot);assert.equal(createSeniorBackup(storage).reviews['S17-C01'].comments.length,1);
restoreSeniorBackup(storage,blankSeniorBackup());assert.deepEqual(createSeniorBackup(storage).reviews,{});assert.deepEqual(createSeniorBackup(storage).incidents,{});
let fail=false;const broken={getItem:storage.getItem,setItem:()=>{if(!fail){fail=true;throw Error('quota')}},removeItem:storage.removeItem};
assert.throws(()=>restoreSeniorBackup(broken,snapshot));
console.log('PASS: complete Senior backup import/export, malformed input rejection and workspace cleanup');

const {emptyEvidence,parseEvidence,addEvidence,removeEvidence,evidenceReadiness,evidenceMarkdown,evidenceKey}=require(path.join(root,'engine/evidence.js'));
for(const challenge of content){
 const id=challenge.id;
 let ledger=emptyEvidence(id);
 assert.equal(parseEvidence({version:3,challengeId:id,items:[]},id).items.length,0);
 assert.throws(()=>addEvidence(ledger,{revision:1,kind:'test',source:'ci-export',command:'cargo test --locked',environment:'Linux x86_64',output:'corto'}));
 ledger=addEvidence(ledger,{revision:1,kind:'test',source:'local-command',command:'cargo test --locked',environment:'Linux x86_64',output:'test result: ok. 12 passed; 0 failed; 0 ignored'});
 ledger=addEvidence(ledger,{revision:1,kind:'security',source:'self-report',command:'cargo clippy -- -D warnings',environment:'Linux x86_64',output:'No se registraron alertas en el informe guardado'});
 ledger=addEvidence(ledger,{revision:1,kind:'architecture',source:'peer-review',command:'',environment:'Revisión manual',output:'Revisé los límites y los riesgos asociados a las APIs'});
 assert.equal(evidenceReadiness(ledger,1).readyForExternalReview,true);
 assert.equal(evidenceReadiness(ledger,1).verified,0);
 assert.equal(evidenceReadiness(ledger,2).count,0);
 assert.ok(evidenceMarkdown(ledger).includes('NO VERIFICADO'));
 assert.equal(parseEvidence(JSON.parse(JSON.stringify(ledger)),id).items.length,3);
 assert.equal(parseEvidence({...ledger,items:[ledger.items[0],ledger.items[0]]},id).items.length,0);
 assert.equal(parseEvidence({...ledger,items:[{...ledger.items[0],source:'hacked'}]},id).items.length,0);
 assert.equal(removeEvidence(ledger,ledger.items[0].id).items.length,2);
}
const ledger=addEvidence(emptyEvidence('S17-C01'),{revision:1,kind:'review',source:'peer-review',command:'',environment:'Linux x86_64',output:'Analizado por revisor externo no autenticado'});
let backed=createSeniorBackup(fakeStorage({[evidenceKey('S17-C01')]:JSON.stringify(ledger)}));
assert.equal(backed.evidence['S17-C01'].items.length,1);
assert.throws(()=>parseSeniorBackup({...backed,evidence:{'S17-C01':{version:1,challengeId:'S17-C01',items:[{id:'bad'}]}}}));
const target=fakeStorage();restoreSeniorBackup(target,backed);assert.equal(createSeniorBackup(target).evidence['S17-C01'].items.length,1);
restoreSeniorBackup(target,blankSeniorBackup());assert.deepEqual(createSeniorBackup(target).evidence,{});
console.log('PASS: evidence provenance, all 18 ledgers, invalid data, revision isolation and backup roundtrip');
const allIncidents={};for(const id of Object.keys(INCIDENTS)){allIncidents[id]=newIncident(id);}
const allBacked={...blankSeniorBackup(),incidents:allIncidents};
assert.equal(Object.keys(parseSeniorBackup(allBacked).incidents).length,18);
assert.throws(()=>parseSeniorBackup({...allBacked,incidents:{...allIncidents,S99:newIncident('S01')}}));
console.log('PASS: 18 incidents in backup validated (previous maximum of 6 removed)');
const {calculateSeniorReadiness}=require(path.join(root,'engine/readiness.js'));
let prepared=newIncident('S07');for(const st of INCIDENTS.S07.steps)prepared=advanceIncident(prepared,st.correct);
const attempt=submitAttempt(updateAttempt(newAttempt(content[6]),{decision:'a',notes:'La solución conserva el ownership, propaga errores y valida el cierre ordenado de trabajos concurrentes.',evidenceNotes:'Probé cancelación de tareas en una ejecución independiente y documenté su entorno.'}));
const inputs=fakeStorage({
  'rustpixel:incident:v1:S07':JSON.stringify(prepared),
  [evidenceKey('S07-C01')]:JSON.stringify((()=>{
   let a=emptyEvidence('S07-C01');for(const kind of ['test','security','architecture'])a=addEvidence(a,{revision:1,kind,source:'self-report',command:'cargo test --locked',environment:'Linux container',output:'Salida aportada por estudiante sin verificación independiente'});return a;})())
});
const status=calculateSeniorReadiness({version:2,attempts:{'S07-C01':attempt},history:{}},inputs);
assert.equal(status.submitted,1);assert.equal(status.selfReviewed,0);
assert.equal(status.incidentsResolved,1);assert.equal(status.evidencePrepared,1);
assert.equal(status.externallyVerified,0);assert.equal(status.incompleteIds.length,17);
console.log('PASS: Senior readiness uses real stored state without awarding unverified competencies');

const {MODULE_ACCEPTANCE_DEFS,getModuleAcceptance,calculateAcceptanceSummary}=require(path.join(root,'engine/acceptance.js'));
assert.equal(Object.keys(MODULE_ACCEPTANCE_DEFS).length,18);
let totalGatesCount=0;
for(let i=1;i<=18;i++){
  const id=`S${String(i).padStart(2,'0')}`;
  const defs=MODULE_ACCEPTANCE_DEFS[id];
  assert.ok(Array.isArray(defs),`Defs for ${id} must be an array`);
  assert.equal(defs.length,5,`Module ${id} must have exactly 5 acceptance gates`);
  const ids=defs.map(d=>d.id);
  assert.deepEqual(ids,['correctness','security','architecture','operations','performance']);
  for(const d of defs){
    assert.ok(d.requirement.length>15,`Gate requirement for ${id}:${d.id} must be descriptive`);
    assert.ok(d.commandSnippet.startsWith('cargo'),`Command snippet for ${id}:${d.id} must start with cargo`);
  }
  totalGatesCount+=defs.length;
}
assert.equal(totalGatesCount,90,'There must be exactly 90 acceptance gates across 18 modules');

// Test gate coverage calculation
const emptyStore={version:2,attempts:{},history:{}};
const emptyAcc=calculateAcceptanceSummary(fakeStorage(),emptyStore);
assert.equal(emptyAcc.totalGates,90);
assert.equal(emptyAcc.totalDeclared,0);
assert.equal(emptyAcc.totalMissing,90);
assert.equal(emptyAcc.totalExternallyRequired,90);
assert.equal(emptyAcc.externallyVerified,0);

// With inputs and evidence
const preparedAcc=calculateAcceptanceSummary(inputs,{version:2,attempts:{'S07-C01':attempt},history:{}});
assert.equal(preparedAcc.modules.S07.declaredCount,4);
assert.equal(preparedAcc.totalDeclared,4);
assert.equal(preparedAcc.totalMissing,86);
assert.equal(preparedAcc.externallyVerified,0);

// With performance evidence added
let fullEv=emptyEvidence('S07-C01');
for(const kind of ['test','security','architecture','benchmark']) fullEv=addEvidence(fullEv,{revision:1,kind,source:'self-report',command:'cargo bench',environment:'Linux container',output:'Benchmark output recorded by student'});
const fullInputs=fakeStorage({
  'rustpixel:incident:v1:S07':JSON.stringify(prepared),
  [evidenceKey('S07-C01')]:JSON.stringify(fullEv)
});
const fullAcc=calculateAcceptanceSummary(fullInputs,{version:2,attempts:{'S07-C01':attempt},history:{}});
assert.equal(fullAcc.modules.S07.declaredCount,5);
assert.equal(fullAcc.totalDeclared,5);
assert.equal(fullAcc.totalMissing,85);
assert.equal(fullAcc.externallyVerified,0);
console.log('PASS: 90 Senior acceptance criteria (5 per module), gate states, coverage calculation and external verification rules');
