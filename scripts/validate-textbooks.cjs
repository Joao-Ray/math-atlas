// Original curriculum and numerical spot checks; no PDF, network or real storage access.
const assert = require('node:assert/strict'), fs = require('node:fs'), ts = require('typescript');
const previous = require.extensions['.ts'];
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, f);
let d, additions, guides, study, filters;
try { d = require('../data/mockData.ts'); additions = require('../data/textbookExpansionV17.ts'); guides = require('../data/textbookStudy.ts'); study = require('../data/studyState.ts'); filters = require('../data/problemFilters.ts'); }
finally { if (previous) require.extensions['.ts'] = previous; else delete require.extensions['.ts']; }
let checks = 0;
function test(name, fn) { try { fn(); checks++; } catch (error) { error.message = name + ': ' + error.message; throw error; } }
function near(a, b, tol = 1e-9) { assert.ok(Math.abs(a-b) < tol, `${a} vs ${b}`); }
function integrate(fn, a, b, n = 8000) { const h=(b-a)/n; let sum=fn(a)+fn(b); for(let i=1;i<n;i++)sum+=(i%2?4:2)*fn(a+i*h); return sum*h/3; }
function answer(id, snippet) { assert.ok(d.problemById(id)?.answer.includes(snippet), 'Unexpected answer: ' + id); }
test('twelve topics and twenty-four clearly original worked problems are exported', () => {
  assert.equal(additions.textbookTopics.length,12); assert.equal(additions.textbookFormulas.length,12); assert.equal(additions.textbookProblems.length,24);
  assert.equal(d.topics.length,305); assert.equal(d.formulas.length,321); assert.equal(d.problems.length,1108);
  for(const [course,count] of [['calculus',3],['probability',2],['stochastic-process',7]]) assert.equal(additions.textbookTopics.filter(t=>t.courseId===course).length,count);
  for(const t of additions.textbookTopics) { assert.equal(t.problemIds.length,2); assert.ok(t.learningNotes.length>=2); assert.ok(t.sourceNote.includes('重新编写')); assert.ok(d.topicById(t.id)); }
  for(const p of additions.textbookProblems) { assert.equal(p.source.kind,'original'); assert.ok(p.source.label.includes('非教材原题')); assert.ok(p.steps.length>=2 && p.hints.length>0); }
  for(const f of additions.textbookFormulas) assert.ok(f.conditions.length>10);
});
test('four verified-content guides cover every new topic without pretending to have a Ross source', () => {
  assert.equal(guides.textbookGuides.length,4); const ids=new Set();
  for(const g of guides.textbookGuides) { assert.ok(!g.id.includes('ross')); assert.ok(g.verification && g.chapters.length>0); assert.equal(new Set(g.topicIds).size,g.topicIds.length); for(const id of g.topicIds) { assert.ok(d.topicById(id)); ids.add(id); } }
  assert.ok(additions.textbookTopics.every(t=>ids.has(t.id)));
  assert.ok(guides.textbookGuides.find(g=>g.id==='papoulis-pillai-4').verification.includes('逐字节相同'));
});
test('new questions search by topic and never enter the competition or named legacy practice sets', () => {
  const base={query:'',track:'all',courseId:null,level:null,completion:'all',completedIds:[]};
  const search=filters.filterStudyProblems(d.problems,{...base,query:'更新报酬'},d.courses,d.topics);
  assert.equal(search.length,2);
  assert.equal(filters.filterStudyProblems(d.problems,{...base,track:'competition'},d.courses,d.topics).length,20);
  assert.equal(filters.filterStudyProblems(d.problems,{...base,track:'practice'},d.courses,d.topics).length,18);
});
test('new and legacy IDs survive backup round trips without changing schema or old records', () => {
  const state={...study.emptyStudyState,favoriteTopics:['limits','ito-isometry'],favoriteFormulas:['chain-rule','nonhomogeneous-poisson-formula'],completedProblems:['cmc17-a-fill-1','critical-branching-constant-mean']};
  assert.deepEqual(study.parseStudyBackup(study.createStudyBackup(state)).state,state);
  assert.deepEqual(study.mergeStudyStates(state,state),state);
});
test('differentials have the claimed direction and rigorous square-root bound', () => {
  const estimate=4.01, exact=Math.sqrt(16.08); assert.ok(estimate>exact); assert.ok(estimate-exact<=1/80000);
  const relative=(10.02/10)**3-1; near(relative,0.006012008); assert.ok(3*0.02/10<relative);
  answer('sqrt-differential-bound','1/80000'); answer('sphere-relative-differential','0.6012008%');
});
test('regular parameter curvature works at a vertical tangent', () => {
  const curvature=(dx,dy,ddx,ddy)=>Math.abs(dx*ddy-dy*ddx)/(dx*dx+dy*dy)**1.5;
  for(const t of [-1,0,0.7])near(curvature(-3*Math.sin(t),3*Math.cos(t),-3*Math.cos(t),-3*Math.sin(t)),1/3);
  near(curvature(0,1,2,0),2); answer('vertical-tangent-curvature','κ=2');
});
test('second-order initial-value solutions satisfy their equations independently', () => {
  for(const x of [-0.5,0,0.3,1]) {
    const y=(1-2*x)*Math.exp(2*x),dy=-4*x*Math.exp(2*x),ddy=(-4-8*x)*Math.exp(2*x);near(ddy-4*dy+4*y,0);
    const r=(Math.sin(x)-x*Math.cos(x))/2,dr=x*Math.sin(x)/2,ddr=(Math.sin(x)+x*Math.cos(x))/2;near(ddr+r,Math.sin(x)); if(x===0){near(y,1);near(dy,0);near(r,0);near(dr,0);}
  }
  answer('repeated-root-initial-value','(1−2x)'); answer('resonant-sine-forcing','(sin x−xcos x)/2');
});
test('total variance retains between-group and random-probability contributions', () => {
  near(1.25+4*0.25*0.75,2);near(integrate(u=>4*u*(1-u),0,1)+16/12,2);
  answer('bernoulli-mixture-total-variance','Var(X)=2');answer('uniform-binomial-mixture-variance','Var(X)=2');
});
test('PGF coefficients and factorial moments agree with the stated ordinary moments', () => {
  let mass=0,mean=0,second=0;for(let k=0;k<100;k++){const p=(k+1)/2**(k+2);mass+=p;mean+=k*p;second+=k*k*p;}near(mass,1);near(mean,2);near(second-mean*mean,4);
  near(3/16,3/2**4);near(5*4*0.4**2+2-4,1.2);
  answer('two-geometric-pgf-sum','3/16');answer('binomial-pgf-moments','1.2');
});
test('nonhomogeneous Poisson uses an interval integral and not a memoryless waiting law', () => {
  near(integrate(t=>2*t,1,3),8);near(Math.exp(-8)*8*8/2,32*Math.exp(-8));
  for(const u of [0.1,1,2]){near(Math.exp(-((1+u)**2))/Math.exp(-1),Math.exp(-2*u-u*u));assert.ok(Math.exp(-2*u-u*u)<Math.exp(-u*u));}
  answer('nhpp-quadratic-intensity-count','32e^(−8)');answer('nhpp-waiting-not-memoryless','exp(−2u−u²)');
});
test('compound Poisson includes variance of the random number of terms', () => {
  const m=(1+3)/2,e2=(1+9)/2;near(3*(e2-m*m)+3*m*m,15);near(4*2*2,16);
  answer('compound-poisson-two-claim-sizes','Var(S)=15');answer('compound-poisson-even-support','不服从泊松分布');
});
test('renewal rewards distinguish time weighting from naive per-cycle averages', () => {
  near(3*4/(4+1),12/5);const ey=(2+6)/2,ey2=(4+36)/2;near(ey2/(2*ey),2.5);assert.ok(ey2/(2*ey)>ey/2);
  answer('machine-renewal-revenue-rate','12/5');answer('renewal-inspection-paradox','2.5');
});
test('periodic chains oscillate while the irreducible self-loop example converges', () => {
  let v=[1,0];for(let n=0;n<50;n++)v=[v[1]/2,v[0]+v[1]/2];near(v[0],1/3);near(v[1],2/3);
  let w=[1,0];for(let n=0;n<4;n++){w=[w[1],w[0]];assert.deepEqual(w,(n%2===0)?[0,1]:[1,0]);}
  answer('alternating-chain-stationary-not-limit','周期 2');answer('self-loop-irreducible-chain-limit','(1/3,2/3)');
});
test('branching extinction selects the minimal root and handles the critical example', () => {
  let q=0;for(let n=0;n<100;n++)q=0.25+0.75*q*q;near(q,1/3);
  near((1+1)/2,1);near((0+2)/2,1);answer('supercritical-binary-extinction','灭绝概率 1/3');answer('critical-branching-constant-mean','E[Zₙ]=1');
});
test('weak stationarity and spectral normalization use the declared angular-frequency convention', () => {
  assert.ok(d.formulaById('weak-stationarity-spectrum-formula').conditions.includes('均方连续'));
  for(const [s,t] of [[0,1],[1.2,2.3],[-0.5,4]])near(Math.cos(s)*Math.cos(t)+Math.sin(s)*Math.sin(t),Math.cos(s-t));
  assert.ok(Math.abs(Math.cos(0)**2-Math.cos(Math.PI/2)**2)>0.99);
  const eps=1e-7; near(integrate(theta=>{const w=2*Math.tan(theta);return 12/(4+w*w)*2/Math.cos(theta)**2;},-Math.PI/2+eps,Math.PI/2-eps)/(2*Math.PI),3,1e-6);
  answer('exponential-covariance-spectrum','12/(4+ω²)');
});
test('Itô variances and non-Gaussian quadratic integral agree with normal moments', () => {
  near(integrate(t=>4*t*t,0,1),4/3);near(integrate(t=>t,0,1),0.5);
  const phi=z=>Math.exp(-z*z/2)/Math.sqrt(2*Math.PI);near(integrate(z=>(z*z-1)/2*phi(z),-9,9),0,1e-8);near(integrate(z=>((z*z-1)/2)**2*phi(z),-9,9),0.5,1e-8);
  answer('brownian-integrand-not-gaussian','不服从正态分布');answer('deterministic-ito-integral-variance','4/3');
});
console.log(JSON.stringify({textbookChecks:checks,status:'passed',scope:'Offline data, backup and independent numerical spot checks; not a complete proof review or phone test.'},null,2));
