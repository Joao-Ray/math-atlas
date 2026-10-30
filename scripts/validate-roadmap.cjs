// No network or real user storage: test actual content separately from the 700-slot plan.
const assert = require('node:assert/strict'), fs = require('node:fs'), ts = require('typescript');
const previous = require.extensions['.ts'];
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, f);
let d, roadmap, additions, study, filters, store;
try { d=require('../data/mockData.ts'); roadmap=require('../data/curriculumRoadmap.ts'); additions=require('../data/courseExpansion70.ts'); study=require('../data/studyState.ts'); filters=require('../data/problemFilters.ts'); store=require('../mini-program/src/lib/storeCore.ts'); }
finally { if(previous)require.extensions['.ts']=previous; else delete require.extensions['.ts']; }
let checks=0;
function test(name,fn){try{fn();checks++;}catch(error){error.message=name+': '+error.message;throw error;}}
function near(a,b){assert.ok(Math.abs(a-b)<1e-9,`${a} vs ${b}`);}
const id=roadmap.roadmapTopicId;
const answer=(course,key,n,text)=>assert.ok(d.problemById(id(course,key)+'-exercise-'+n)?.answer.includes(text),`${course}/${key}/${n}: ${text}`);
const all=d.courses.flatMap(c=>roadmap.getCourseRoadmap(c.id,d.topics).flatMap(ch=>ch.entries));
test('ten courses each have seven chapters of ten unique slots and complete existing coverage',()=>{
  assert.equal(d.courses.length,10); assert.equal(all.length,700); assert.equal(new Set(all.map(e=>e.id)).size,700);
  for(const c of d.courses){const chapters=roadmap.getCourseRoadmap(c.id,d.topics);assert.equal(chapters.length,7);chapters.forEach(ch=>assert.equal(ch.entries.length,10));
    const entries=chapters.flatMap(ch=>ch.entries); const actual=d.topics.filter(t=>t.courseId===c.id);
    assert.equal(roadmap.getRoadmapSummary(c.id,d.topics).published,actual.length);
    actual.forEach(t=>assert.equal(entries.filter(e=>e.id===t.id&&e.published).length,1));
    for(const spec of roadmap.courseBlueprints[c.id].flatMap(ch=>ch.entries.split('|'))){assert.ok(spec.startsWith('@')?actual.some(t=>t.id===spec.slice(1)):/^[a-z0-9-]+=[^=]+$/.test(spec));}
  }
});
test('historical v1.8 batch preserves twenty full lessons and forty original problems',()=>{
  assert.equal(additions.course70Topics.length,20);assert.equal(additions.course70Formulas.length,20);assert.equal(additions.course70Problems.length,40);
  assert.equal(d.topics.length,305);assert.equal(d.formulas.length,321);assert.equal(d.problems.length,1108);
  assert.equal(all.filter(e=>e.published).length,305);assert.equal(all.filter(e=>!e.published).length,395);
  for(const c of d.courses)assert.equal(additions.course70Topics.filter(t=>t.courseId===c.id).length,2);
  additions.course70Topics.forEach(t=>{assert.ok(t.definition.length>50&&t.intuition.length>10&&t.learningNotes.length>=2);assert.equal(t.formulaIds.length,1);assert.equal(t.problemIds.length,2);});
  additions.course70Problems.forEach(p=>{assert.equal(p.source.kind,'original');assert.ok(p.source.label.includes('非历年真题'));assert.ok(p.hints.length&&p.steps.length>=2&&p.answer.length>2);});
  additions.course70Formulas.forEach(f=>assert.ok(f.conditions.length>10));
});
test('unwritten plans cannot be opened, searched as real content, or restored as favorites',()=>{
  const planned=all.filter(e=>!e.published);assert.equal(planned.length,395);
  for(const e of planned){assert.equal(d.topicById(e.id),undefined);assert.ok(!d.problems.some(p=>p.topicId===e.id));assert.ok(!d.formulas.some(f=>f.topicId===e.id));}
  assert.equal(study.normalizeStudyState({...study.emptyStudyState,favoriteTopics:planned.map(e=>e.id)}).favoriteTopics.length,0);
  assert.throws(()=>study.parseStudyBackup(study.createStudyBackup({...study.emptyStudyState,favoriteTopics:[planned[0].id]})),/ID/);
  let writes=0; const memory=store.createStudyStore({read:()=>null,write:()=>{writes++;},remove:()=>{throw new Error('Never reset test storage');}});
  assert.throws(()=>memory.toggleTopic(planned[0].id),/ID/);assert.equal(writes,0);assert.deepEqual(memory.getSnapshot().state.favoriteTopics,[]);
  memory.toggleTopic(additions.course70Topics[0].id);assert.equal(writes,1);assert.deepEqual(memory.getSnapshot().state.favoriteTopics,[additions.course70Topics[0].id]);
  const options={query:'绕数',track:'core',courseId:null,level:null,completion:'all',completedIds:[]};
  assert.equal(filters.filterStudyProblems(d.problems,options,d.courses,d.topics).filter(p=>p.topicId===id('complex-analysis','winding')).length,2);
});
test('published new IDs and historical IDs coexist in the unchanged backup schema',()=>{
  const state={...study.emptyStudyState,favoriteTopics:['limits',...additions.course70Topics.map(t=>t.id)],favoriteFormulas:['chain-rule',...additions.course70Formulas.map(f=>f.id)],completedProblems:['cmc17-a-fill-1',...additions.course70Problems.map(p=>p.id)]};
  const text=study.createStudyBackup(state);assert.equal(JSON.parse(text).schemaVersion,1);assert.deepEqual(study.parseStudyBackup(text).state,state);assert.deepEqual(study.mergeStudyStates(state,state),state);
});
test('limits and independence: conditional conclusions and coordinates are checked',()=>{
  near((2**2+3*(-1))/(2-(-1)),1/3);answer('calculus','limit-laws',1,'1/3');answer('calculus','one-sided',2,'不可导');
  assert.deepEqual([1+0,0+1,1+1],[1,1,2]);near(2.5-0.5,2);near(2.5+0.5,3);answer('linear-algebra','independence',2,'5/2');
  assert.deepEqual([2-2*1,4-2*2,3-2*1],[0,0,1]);answer('linear-algebra','rref',1,'1、3');
});
test('probability and estimation calculations are independently checked',()=>{
  near(3/2-3/4+1/8,7/8);answer('probability','inclusion-exclusion',2,'7/8');near((1/2)*(2/3),1/3);answer('probability','lotus',1,'1/3');assert.ok(.7+.3*Math.E>Math.exp(.3));
  near(((1-3)**2+(2-3)**2+(6-3)**2)/2,7);answer('statistics','unbiased-variance',1,'7');
  for(const [p,expected] of [[.5,.00625],[.2,.0265]])near(.25*p*(1-p)/10+(.25-.5*p)**2,expected);answer('statistics','mse',2,'0.0265');
});
test('conditional Poisson, Markov matrix and polynomial identities are checked',()=>{
  near((3/4)**5,243/1024);answer('stochastic-process','arrival-conditional',1,'243/1024');near(4/3,4*(1-1+1/3));answer('stochastic-process','arrival-conditional',2,'4/3');
  const P=[[.8,.2],[.3,.7]],square=P.map(row=>P[0].map((_,j)=>row.reduce((s,v,k)=>s+v*P[k][j],0)));
  [[.7,.3],[.45,.55]].forEach((row,i)=>row.forEach((v,j)=>near(square[i][j],v)));near(.4*square[0][1],.12);near(.4*.3+.6*.55,.45);answer('stochastic-process','chapman',2,'0.12');
  for(const x of [-2,-1,0,.5,3]){near(.5*(x*x+1)-.5*(x-1)*(x+1),1);near((x*x-1)-(x*x-x),x-1);}answer('higher-algebra','bezout',1,'1/2');answer('higher-algebra','dimension-formula',2,'2 或 3');
});
test('complex branch, oriented winding and geometry examples are checked',()=>{
  near(2*(3*Math.PI/4)-(-Math.PI/2),2*Math.PI);answer('complex-analysis','log-branches',2,'2πi');near((-4*Math.PI)/(2*Math.PI),-2);answer('complex-analysis','winding',2,'−2');
  near((2/3)**2+(-1/3)**2+(2/3)**2,1);near(Math.acos(.5),Math.PI/3);answer('analytic-geometry','direction-cosines',2,'60');
  near(Math.sqrt(25-9),4);assert.ok(4/Math.sqrt(3)>2);answer('analytic-geometry','sphere-plane',1,'(1,2,6)');answer('analytic-geometry','sphere-plane',2,'±2√3');
});
test('measure counterexamples and subsequence claims keep their required assumptions',()=>{
  const completed=Array.from({length:8},(_,mask)=>mask);assert.equal(completed.length,8);assert.equal(completed.filter(m=>m&4).length,4);
  answer('measure-theory','continuity',2,'∞');answer('measure-theory','null-completion',2,'原空间不可测');
  for(const n of [5,20,100]){const odd=(1+(-1)**(2*n-1))/(2*(2*n-1));const even=(1+(-1)**(2*n))/(2*(2*n));near(odd,0);near(even,1/(2*n));}
  answer('mathematical-analysis','subsequence-bw',2,'整列无界');answer('mathematical-analysis','limsup-inf',1,'上极限 1');answer('mathematical-analysis','limsup-inf',2,'均为 0');
});
console.log(JSON.stringify({checks,status:'passed',target:700,published:305,planned:395,historicalBatch:{lessons:20,problems:40},scope:'Static data, math spot checks, search and in-memory backup; not phone acceptance'},null,2));
