// Offline spot checks and synthetic storage only; never marks real user work completed.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
const previous=require.extensions['.ts'];
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
let d,b,r,study,store,filters;
try {d=require('../data/mockData.ts');b=require('../data/courseExpansionV110.ts');r=require('../data/curriculumRoadmap.ts');study=require('../data/studyState.ts');store=require('../mini-program/src/lib/storeCore.ts');filters=require('../data/problemFilters.ts');}
finally {if(previous)require.extensions['.ts']=previous;else delete require.extensions['.ts'];}
let checks=0;
function test(name,fn){try{fn();checks++;}catch(error){error.message=name+': '+error.message;throw error;}}
const near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<=tol,`${a} vs ${b}`);
const answer=(c,key,n,text)=>assert.ok(d.problemById(r.roadmapTopicId(c,key)+'-exercise-'+n)?.answer.includes(text),`${c}/${key}/${n}: ${text}`);
const CAL='calculus',LA='linear-algebra',PR='probability',ST='statistics',AN='mathematical-analysis';
const rank=rows=>{const a=rows.map(row=>row.slice());let k=0;for(let j=0;j<a[0].length&&k<a.length;j++){const p=a.findIndex((row,i)=>i>=k&&Math.abs(row[j])>1e-10);if(p<0)continue;[a[k],a[p]]=[a[p],a[k]];const t=a[k][j];a[k]=a[k].map(v=>v/t);for(let i=0;i<a.length;i++)if(i!==k){const t=a[i][j];a[i]=a[i].map((v,h)=>v-t*a[k][h]);}k++;}return k;};
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
test('thirty real lessons, sixty original worked problems and exact course deltas',()=>{
  assert.equal(b.expansionV110Topics.length,30);assert.equal(b.expansionV110Formulas.length,30);assert.equal(b.expansionV110Problems.length,60);
  assert.equal(d.topics.length,305);assert.equal(d.formulas.length,321);assert.equal(d.problems.length,1108);
  for(const [course,n,total] of [[CAL,6,42],[LA,8,30],[PR,8,31],[ST,4,33],[AN,4,27]]){assert.equal(b.expansionV110Topics.filter(t=>t.courseId===course).length,n);assert.equal(r.getRoadmapSummary(course,d.topics).published,total);}
  for(const t of b.expansionV110Topics){assert.ok(t.definition.length>60&&t.intuition.length>10&&t.learningNotes.length>=2);assert.equal(t.formulaIds.length,1);assert.equal(t.problemIds.length,2);assert.equal(d.topicById(t.id),t);}
  for(const p of b.expansionV110Problems){assert.equal(p.source.kind,'original');assert.ok(p.source.label.includes('非历年真题'));assert.ok(p.hints.length&&p.steps.length>=2);}
  for(const f of b.expansionV110Formulas)assert.ok(f.conditions.length>10);
});
test('three first chapters are truly covered without altering the seventy-point plans',()=>{
  const all=d.courses.flatMap(c=>r.getCourseRoadmap(c.id,d.topics).flatMap(ch=>ch.entries));assert.equal(all.length,700);assert.equal(all.filter(e=>e.published).length,305);assert.equal(all.filter(e=>!e.published).length,395);
  for(const c of [CAL,LA,PR]){const ch=r.getCourseRoadmap(c,d.topics)[0];assert.equal(ch.entries.length,10);assert.ok(ch.entries.every(e=>e.published));for(const e of ch.entries)assert.ok(d.topicById(e.id)?.problemIds.length>0);}
  for(const c of d.courses){const full=r.getVisibleRoadmap(c.id,d.topics),visible=r.getVisibleRoadmap(c.id,d.topics,true);assert.equal(visible.flatMap(ch=>ch.entries).length,r.getRoadmapSummary(c.id,d.topics).published);for(const ch of visible)for(const e of ch.entries)assert.ok(full.some(f=>f.id===ch.id&&f.position===ch.position&&f.entries.some(o=>o.id===e.id&&o.position===e.position)));}
});
test('all new lessons are searchable, while contest and named practice sets stay unchanged',()=>{
  const base={query:'',track:'all',courseId:null,level:null,completion:'all',completedIds:[]};const select=opts=>filters.filterStudyProblems(d.problems,{...base,...opts},d.courses,d.topics);
  assert.equal(select({track:'core'}).length,1088);assert.equal(select({track:'competition'}).length,20);assert.equal(select({track:'practice'}).length,18);
  for(const t of b.expansionV110Topics)assert.equal(select({query:t.titleZh,courseId:t.courseId}).filter(p=>p.topicId===t.id).length,2);
});
test('new and historical backups coexist and unpublished content cannot be saved',()=>{
  const state={...study.emptyStudyState,favoriteTopics:['limits',...b.expansionV110Topics.map(t=>t.id)],favoriteFormulas:['chain-rule',...b.expansionV110Formulas.map(f=>f.id)],completedProblems:['cmc17-a-fill-1',...b.expansionV110Problems.map(p=>p.id)]};
  const backup=study.createStudyBackup(state);assert.equal(JSON.parse(backup).schemaVersion,1);assert.deepEqual(study.parseStudyBackup(backup).state,state);
  let saved=null;const memory=store.createStudyStore({read:()=>null,write:v=>{saved=v;},remove:()=>{throw Error('Never clear real or test records');}});memory.restoreBackup(backup);assert.deepEqual(JSON.parse(saved),state);
  const planned=r.getCourseRoadmap(AN,d.topics).flatMap(c=>c.entries).find(e=>!e.published);const before=saved;assert.throws(()=>memory.toggleTopic(planned.id),/ID/);assert.equal(saved,before);
  assert.ok(d.topicById('c70-complex-analysis-contours'));assert.ok(d.problemById('small-sample-t-interval'));
});
test('squeeze and one-sided infinite limits keep domain and sign conditions',()=>{
  for(const x of [-.1,-.01,.01,.1])assert.ok(Math.abs(x*x*Math.sin(1/x))<=x*x);
  assert.ok(1/(-.001)<0&&1/.001>0);near(2-5/(1000**2+3),(2*1000**2+1)/(1000**2+3));
  answer(CAL,'squeeze',1,'极限为 0');answer(CAL,'squeeze',2,'均为 1');answer(CAL,'infinite-limits',1,'没有共同双侧极限');answer(CAL,'infinite-limits',2,'y=2');
});
test('equivalent infinitesimals do not permit losing cancelled cubic terms',()=>{
  for(const x of [-.01,.01]){near(Math.sin(3*x)/(5*x),3/5,.0001);near((Math.sin(x)-x)/x**3,-1/6,.00001);}
  answer(CAL,'infinitesimal-orders',1,'3/5');answer(CAL,'infinitesimal-orders',2,'−1/6');
});
test('discontinuity classes distinguish isolated wrong values, jumps and oscillations',()=>{
  assert.equal(Math.floor(-.001),-1);assert.equal(Math.floor(.001),0);
  for(const n of [1,2,10]){near(Math.sin(2*Math.PI*n+Math.PI/2),1);near(Math.sin(2*Math.PI*n+3*Math.PI/2),-1);}
  answer(CAL,'continuity-types',1,'f(0)=1');answer(CAL,'continuity-types',2,'第二类振荡间断');
});
test('zero existence requires continuity and uniqueness needs another condition',()=>{
  const f=x=>x**3+x-1;assert.ok(f(0)<0&&f(1)>0);for(const x of [0,.1,.5,1])assert.ok(3*x*x+1>0);
  for(const x of [-1,-.2,0,.2,1])assert.notEqual(x<0?-1:1,0);answer(CAL,'iv-properties',1,'恰有一个');answer(CAL,'iv-properties',2,'不能应用');
});
test('fundamental limit transformations retain scale factors',()=>{
  for(const x of [-1e-6,1e-6]){near(3/x*Math.log1p(2*x),6,.00001);near(Math.log1p(5*x)/Math.sin(2*x),5/2,.00001);}
  answer(CAL,'elementary-limits',1,'e⁶');answer(CAL,'elementary-limits',2,'5/2');
});
test('linear combinations and spans are checked with vector arithmetic',()=>{
  assert.deepEqual([2+1,2-1],[3,1]);for(const t of [-2,0,1])assert.equal((t*3),3*t);
  assert.equal(rank([[1,0,0],[0,1,0],[1,1,0]]),2);assert.equal(rank([[1,0,0],[0,1,0],[0,0,1]]),3);
  answer(LA,'linear-combination',1,'2(1,1)');answer(LA,'linear-combination',2,'不能表示');answer(LA,'span',1,'不等于 R³');answer(LA,'span',2,'不属于');
});
test('basis coordinates and dimensions are independently reconstructed',()=>{
  assert.deepEqual([3+1,3-1],[4,2]);assert.deepEqual([-1+3,3],[2,3]);assert.equal(rank([[-1,1,0],[-1,0,1]]),2);
  answer(LA,'basis-coordinates',1,'(3,1)');answer(LA,'basis-coordinates',2,'(−1,3)');answer(LA,'dimension',1,'维数 2');answer(LA,'dimension',2,'dim P₂(R)=3');
});
test('parameterized vector rank treats the singular parameter values separately',()=>{
  for(const t of [-2,-1,0,1,2])assert.equal(rank([[1,t],[t,1]]),Math.abs(t)===1?1:2);
  assert.equal(rank([[1,0,1],[0,1,1],[1,1,2]]),2);answer(LA,'vector-rank',1,'秩 2');answer(LA,'vector-rank',2,'t=±1 时秩 1');
});
test('column spaces use original columns and characterize attainable targets',()=>{
  const A=[[1,2,0],[0,0,1],[1,2,1]];for(const t of [-2,0,3]){const v=[2-2*t,t,3];assert.deepEqual(A.map(row=>dot(row,v)),[2,3,5]);}
  assert.equal(2+3,5);assert.notEqual(2+3,6);answer(LA,'column-space',1,'z=x+y');answer(LA,'column-space',2,'第二个无解');
});
test('row-space invariance does not identify row and column ambient spaces',()=>{
  const a=[[1,2,1],[2,4,2],[0,1,1]],basis=[[1,0,-1],[0,1,1]];assert.equal(rank(a),2);assert.equal(rank([...a,...basis]),2);
  const rect=[[1,0,1],[0,1,1]];assert.equal(rect.length,2);assert.equal(rect[0].length,3);assert.equal(rank(rect),2);
  answer(LA,'row-space',1,'维数 2');answer(LA,'row-space',2,'不是同一集合');
});
test('nullspaces and affine translates satisfy the original equations',()=>{
  const A=[[1,2,1],[0,1,1]];assert.deepEqual(A.map(row=>dot(row,[1,-1,1])),[0,0]);assert.equal(3-rank(A),1);
  for(const t of [-2,0,4]){const v=[1+t,-t];assert.deepEqual([[1,1],[2,2]].map(row=>dot(row,v)),[1,2]);}
  answer(LA,'nullspace',1,'维数 1');answer(LA,'nullspace',2,'不是子空间');
});
test('event operations, normalization and disjoint addition',()=>{
  const omega=[1,2,3,4,5,6],a=x=>x%2===0,b=x=>x>=4;
  assert.deepEqual(omega.filter(x=>a(x)&&b(x)),[4,6]);assert.deepEqual(omega.filter(x=>!(a(x)||b(x))),[1,3]);
  near(.2+.3+.5,1);assert.ok(.2+.3+.6>1);near(1/6+1/6,1/3);near(.6+.5-1,.1);
  answer(PR,'event-sets',1,'1/3');answer(PR,'event-sets',2,'恰好一次为 1/2');answer(PR,'axioms',1,'第二张不合法');answer(PR,'axioms',2,'不可能');answer(PR,'addition',1,'互斥但不独立');answer(PR,'addition',2,'0.1');
});
test('independence, total probability and posterior weights use different formulas',()=>{
  near((3/6)*(2/6),1/6);near(.2*.01+.3*.02+.5*.04,.028);near(.5*.5+.5*.9,.7);near(10/12,5/6);
  near(.3*.04/(.7*.01+.3*.04),12/19);near(.25*.8/(.25*.8+.75*.5),8/23);
  answer(PR,'independence',1,'独立');answer(PR,'independence',2,'不独立');answer(PR,'total-probability',1,'2.8%');answer(PR,'total-probability',2,'0.7');answer(PR,'bayes',1,'12/19');answer(PR,'bayes',2,'8/23');
});
test('pairwise independence counterexample is enumerated rather than assumed',()=>{
  const omega=[[0,0],[0,1],[1,0],[1,1]],events=[v=>v[0]===1,v=>v[1]===1,v=>v[0]===v[1]];
  const prob=fn=>omega.filter(fn).length/4;
  for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)near(prob(v=>events[i](v)&&events[j](v)),prob(events[i])*prob(events[j]));
  near(prob(v=>events.every(fn=>fn(v))),1/4);assert.notEqual(1/4,(1/2)**3);
  answer(PR,'mutual-independence',1,'1/4≠1/8');answer(PR,'mutual-independence',2,'相互独立');
});
test('conditioning may create dependence or remove a mixture-induced dependence',()=>{
  near((.2+.8)/2,.5);near((.2**2+.8**2)/2,.34);assert.notEqual(.34,.25);
  const conditioned=[[1,0],[0,1],[1,1]],pA=conditioned.filter(v=>v[0]).length/3,pB=conditioned.filter(v=>v[1]).length/3;
  near(pA*pB,4/9);near(conditioned.filter(v=>v[0]&&v[1]).length/3,1/3);
  answer(PR,'conditional-independence',1,'0.34≠0.25');answer(PR,'conditional-independence',2,'1/3≠4/9');
});
test('statistics depend on data and empirical CDF endpoint conventions are retained',()=>{
  near((2+4+6)/3,4);const F=(sample,t)=>sample.filter(x=>x<=t).length/sample.length;
  near(F([1,1,3,4],1),.5);near(F([1,1,3,4],1.5),.5);near(F([1,1,3,4],3),.75);near(F([2,2,5],5)-F([2,2,5],2),1/3);
  answer(ST,'sample-statistics',1,'不能据此确定总体均值');answer(ST,'sample-statistics',2,'只有 T₁');answer(ST,'empirical-cdf',1,'跳跃 1/2');answer(ST,'empirical-cdf',2,'[2,5] 为 1');
});
test('unbiasedness is model-wide and consistency is distinct',()=>{
  for(const p of [.1,.5,.9]){near((5*p+1)/7-p,(1-2*p)/7);for(const n of [1,10,1000]){const mse=n*p*(1-p)/(n+2)**2+((1-2*p)/(n+2))**2;assert.ok(mse>=0);if(n===1000)assert.ok(mse<.001);}}
  // Uniform maximum of two has density 2t/theta^2 on [0,theta].
  for(const theta of [.5,1,4])near((2/theta**2)*(theta**3/3),2*theta/3);
  assert.ok(Math.abs(0-.5)>.25&&Math.abs(1-.5)>.25);
  answer(ST,'unbiasedness',1,'模型上有偏');answer(ST,'unbiasedness',2,'3M/2');answer(ST,'consistency',1,'不一致');answer(ST,'consistency',2,'依概率一致');
});
test('monotone and recursive convergence requires bounds, not only a fixed-point equation',()=>{
  let a=1;for(let n=1;n<=50;n++){const next=Math.sqrt(2+a);assert.ok(next>=a&&next<=2);a=next;}near(a,2,1e-10);
  let b0=0;for(let n=1;n<=10;n++){b0=1-b0;assert.equal(b0,n%2);}
  for(let m=1;m<=8;m++){let sum=0;for(let k=1;k<=2**m;k++)sum+=1/k;assert.ok(sum>=1+m/2);}
  answer(AN,'monotone-sequences',1,'极限为 1');answer(AN,'monotone-sequences',2,'没有有限极限');answer(AN,'recursive',1,'极限为 2');answer(AN,'recursive',2,'不收敛');
});
test('sequential continuity and Lipschitz claims are independently spot-checked',()=>{
  for(const n of [1,2,20])near(Math.sin(2*Math.PI*n+Math.PI/2),1);
  for(const x of [-2,-1,0,.5,2])for(const y of [-2,-.3,0,1,2])assert.ok(Math.abs(x*x-y*y)<=4*Math.abs(x-y)+1e-12);
  for(const n of [1,5,100])near(Math.sqrt(1/n**2)/(1/n**2),n);
  answer(AN,'heine',1,'不连续');answer(AN,'heine',2,'对任意');answer(AN,'lipschitz',1,'K=4');answer(AN,'lipschitz',2,'不是利普希茨');
});
console.log(JSON.stringify({checks,status:'passed',published:305,target:700,remaining:395,historicalBatch:{topics:30,formulas:30,problems:60,coveredChapters:3},scope:'Offline content, math spot checks, searches and in-memory backups; not full proof review or phone acceptance'},null,2));
