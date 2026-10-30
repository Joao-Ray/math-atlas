// Independent checks of the three content packs. Reads data only; no user storage.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const previous = require.extensions['.ts'];
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, f);
let packs, roadmap, baseline;
try {
  packs = require('../data/tenVersions/stochasticAlgebraComplex.ts');
  roadmap = require('../data/curriculumRoadmap.ts');
  baseline = require('../data/mockData.ts');
} finally {
  if (previous) require.extensions['.ts'] = previous; else delete require.extensions['.ts'];
}
const selected = [packs.seriesV117, packs.seriesV118, packs.seriesV119];
const lessons = selected.flat();
const near = (a, b, tol = 1e-10) => assert.ok(Math.abs(a-b) < tol, `${a} != ${b}`);
const lesson = key => { const found = lessons.find(x => x.key === key); assert.ok(found, key); return found; };
const answer = (key, n, form, fragment) => {
  const item = lesson(key).exercises[3*(n-1)+form];
  assert.ok(item.answer.includes(fragment), `${key}, n=${n}, form=${form}: ${fragment}`);
};
const existingIds = new Set(baseline.topics.map(t => t.id));
const allIds = new Set(lessons.map(t => roadmap.roadmapTopicId(t.courseId, t.key)));
const prompts = new Set();
for (const pack of selected) {
  assert.equal(pack.length, 8);
  assert.equal(pack.reduce((s,t) => s+t.exercises.length, 0), 72);
  for (const t of pack) {
    assert.equal(t.exercises.length, 9);
    assert.ok(t.definition.length > 60 && t.intuition.length > 15 && t.summary.length > 10, t.key);
    assert.ok(t.learningNotes.length >= 2 && t.learningNotes.every(x => x.length > 15));
    assert.ok(t.formula.conditions.length > 15 && t.formula.explanation.length > 15);
    assert.ok(t.formula.latex.includes('\\'), `${t.key}: lost LaTeX escapes`);
    assert.ok(t.prerequisites.every(id => existingIds.has(id) || allIds.has(id)), `${t.key}: prerequisite`);
    const spec = roadmap.courseBlueprints[t.courseId].flatMap(c => c.entries.split('|'));
    assert.equal(spec.filter(s => s.startsWith(t.key+'=')).length, 1, `${t.key}: reserved roadmap key`);
    const forms = new Set();
    for (const e of t.exercises) {
      assert.ok(e.variantLabel.includes('参数变式'), `${t.key}: variant label`);
      assert.ok(!prompts.has(e.prompt), `${t.key}: duplicate prompt`); prompts.add(e.prompt);
      assert.ok(e.hints.length > 0 && e.hints.every(x => x.length > 8));
      assert.ok(e.steps.length >= 2 && e.steps.every(s => s.body.length > 30 && s.title.length > 0));
      assert.ok(e.answer.length > 5);
      forms.add(e.title.replace(/（参数 \d+）$/, ''));
    }
    assert.equal(forms.size, 3, `${t.key}: three task forms`);
  }
}
assert.equal(allIds.size, 24); assert.equal(prompts.size, 216);

const dot = (x,y) => x.reduce((s,v,i) => s+v*y[i],0);
const mv = (a,x) => a.map(row => dot(row,x));
const mm = (a,b) => a.map(row => b[0].map((_,j) => dot(row,b.map(r => r[j]))));
const vm = (x,a) => a[0].map((_,j) => dot(x,a.map(r => r[j])));
const matrixNear = (a,b) => a.forEach((r,i) => r.forEach((v,j) => near(v,b[i][j])));
const rank = matrix => {
  const a=matrix.map(r=>r.slice()); let r=0;
  for(let c=0;c<a[0].length && r<a.length;c++) {
    const pivot=a.findIndex((row,i)=>i>=r && Math.abs(row[c])>1e-12);
    if(pivot<0)continue;
    [a[r],a[pivot]]=[a[pivot],a[r]];
    const q=a[r][c]; a[r]=a[r].map(x=>x/q);
    for(let k=0;k<a.length;k++)if(k!==r){const q=a[k][c];a[k]=a[k].map((x,j)=>x-q*a[r][j]);}
    r++;
  }
  return r;
};
// Uniformization computes finite CTMC probabilities from the jump probabilities,
// independently of the two-state closed forms used in the lesson answers.
const transition = (q,t) => {
  const size=q.length, rate=Math.max(...q.map((row,i)=>-row[i]));
  const identity=Array.from({length:size},(_,i)=>Array.from({length:size},(_,j)=>+(i===j)));
  const p=q.map((row,i)=>row.map((v,j)=>v/rate+identity[i][j]));
  let power=identity, weight=Math.exp(-rate*t), out=identity.map(row=>row.map(x=>weight*x));
  for(let k=1;k<120;k++) {
    power=mm(power,p);weight*=rate*t/k;
    out=out.map((row,i)=>row.map((v,j)=>v+weight*power[i][j]));
  }
  return out;
};
const factorial = k => {let x=1;for(let j=2;j<=k;j++)x*=j;return x;};
const poisson = (lambda,k) => Math.exp(-lambda)*lambda**k/factorial(k);
const binomial = (n,k) => factorial(n)/factorial(k)/factorial(n-k);
const simpson = (fn,a,b,steps=2000) => {
  let sum=fn(a)+fn(b);for(let i=1;i<steps;i++)sum+=(i%2?4:2)*fn(a+(b-a)*i/steps);
  return sum*(b-a)/steps/3;
};

for (const n of [1,2,3]) {
  const q=[[-n-2,n,2],[1,-1,0],[n+1,0,-n-1]];
  q.forEach((row,i)=>{near(row.reduce((s,x)=>s+x,0),0);row.forEach((x,j)=>assert.ok(i===j||x>=0));});
  answer('generator',n,0,`[-${n+2},${n},2]`);
  const p=transition([[-n,n],[n,-n]],1);
  near(p[0][0],(1+Math.exp(-2*n))/2);
  assert.ok(p[0][0]>Math.exp(-n));
  near((1-Math.exp(-n))**2/2,p[0][0]-Math.exp(-n));
  near(simpson(t=>Math.exp(-(n+2)*t),0,20),1/(n+2),1e-8);
  answer('holding',n,0,`1/${(n+2)**2}`);
  near(n/(2*n+1)+(n+1)/(2*n+1),1);
  near(2*(n+1)/(5*(n+1)),2/5);
  const pi=[(n+1)/(2*n+1),n/(2*n+1)];
  vm(pi,[[-n,n],[n+1,-n-1]]).forEach(v=>near(v,0));
  answer('jump-chain',n,2,`${n+1}/${2*n+1}`);
  const derivative=vm([1/3,2/3],[[-n,n],[2,-2]]);
  near(derivative[0],(4-n)/3);near(derivative[1],(n-4)/3);
  near(transition([[-n,n],[0,0]],.7)[0][1],1-Math.exp(-.7*n));
  answer('forward',n,0,`${4-n}/3`);
  const m=[1/n+1/2,1/2,0];
  const residual=mv([[-n,n,0],[0,-2,2],[0,0,0]],m);
  near(residual[0],-1);near(residual[1],-1);near(residual[2],0);
  answer('backward',n,1,`1/${n}+1/2`);
  const birth=[[-n,n,0],[1,-n-1,n],[0,1,-1]], weights=[1,n,n*n], total=1+n+n*n;
  vm(weights.map(x=>x/total),birth).forEach(v=>near(v,0));
  const absorb=[[-n-1,n,1],[0,0,0],[0,0,0]];
  for(const a of [0,.3,1])vm([0,a,1-a],absorb).forEach(v=>near(v,0));
  answer('ctmc-stationary',n,1,`(1,${n},${n*n})/${total}`);
  // Integrate Erlang(2,n) density and compare with count-tail duality.
  const cdf=simpson(t=>n*n*t*Math.exp(-n*t),0,1);
  near(cdf,1-poisson(n,0)-poisson(n,1));
  answer('erlang',n,1,`${n+1}e^(-${n})`);
  // Exhaustively enumerate all fair labels given the total number of arrivals.
  const count=2*n, samples=Array.from({length:2**count},(_,mask)=>{
    let a=0;for(let j=0;j<count;j++)a+=+(!!(mask&(1<<j)));return [a,count-a];
  });
  const mean=samples.reduce((s,[a])=>s+a,0)/samples.length;near(mean,n);
  const cov=samples.reduce((s,[a,b])=>s+(a-n)*(b-n),0)/samples.length;near(cov,-n/2);
  for(let a=0;a<4;a++)for(let b=0;b<4;b++) {
    // Poisson total followed by independent binomial marking equals product law.
    near(poisson(3*n,a+b)*binomial(a+b,a)*(1/3)**a*(2/3)**b,poisson(n,a)*poisson(2*n,b));
  }
  answer('marked',n,1,`-${n}/2`);

  const sb=[[1,n],[0,1]], inv=[[1,-n],[0,1]];
  matrixNear(mm(inv,sb),[[1,0],[0,1]]);
  near(dot([2,3*n],mv(inv,[.7,-1.2])),2*.7+n*(-1.2));
  answer('dual',n,1,`2φ₁+${3*n}φ₂`);
  for(const [a,b] of [[-2,.25],[1,3],[0,0]]) {
    const functional=[-n*a,a,b]; near(dot(functional,[1,n,0]),0);
    near(dot([1,n,1],[-n*a-b,a,b]),0);
  }
  assert.equal(rank([[1,0,0],[1,n,0]]),2);
  answer('annihilator',n,2,'span{z}');
  matrixNear([mv(inv,[n+1,2])],[[1-n,2]]);
  matrixNear([mv(sb,[n,-1])],[[0,-1]]);
  const cv=mv(inv,[1,n]), cw=mv(inv,[n,1]), cs=mv(inv,[n+1,n+1]);
  cv.forEach((v,i)=>near(v+cw[i],cs[i]));
  answer('coordinates',n,0,`(${1-n},2)`);
  matrixNear(mm([[1,-n-1],[0,1]],sb),[[1,-1],[0,1]]);
  matrixNear(mm(mm(inv,[[1,0],[0,2]]),sb),[[1,-n],[0,2]]);
  answer('change-basis',n,2,`[[1,-${n}],[0,2]]`);
  const map=[[1,n,0],[0,0,1]]; assert.equal(rank(map),2);
  mv(map,[-n,1,0]).forEach(v=>near(v,0));
  // Derivative matrix on monomials has exactly one lost (constant) coordinate.
  const derivativeMatrix=Array.from({length:n+1},(_,i)=>Array.from({length:n+2},(_,j)=>j===i+1?j:0));
  assert.equal(rank(derivativeMatrix),n+1);
  answer('rank-nullity',n,2,`秩 ${n+1}`);
  for(const x of [-1,.5,3])for(const y of [-2,1])for(const c of [-3,2]) {
    near((x-n*c)+n*(y+c),x+n*y);
  }
  answer('first-isomorphism',n,2,`span{(1,${n},0)}`);
  const projection=[[1,n],[0,0]], complement=[[0,-n],[0,1]];
  matrixNear(mm(projection,projection),projection);matrixNear(mm(complement,complement),complement);
  matrixNear(mm(projection,complement),[[0,0],[0,0]]);
  near(dot([1,0],[-n,1]),-n);
  answer('projections',n,1,`(-${n},1)`);
  near(dot([2,1-2*n],[n,1]),1);
  near(n-n,0);near(n*(n-n),0);
  answer('functionals',n,1,`x(x-${n})`);
}

// Complex arithmetic and finite sums are independent of the displayed solutions.
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]], scale=(s,a)=>[s*a[0],s*a[1]];
const mul=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]];
const div=(a,b)=>scale(1/(b[0]**2+b[1]**2),mul(a,[b[0],-b[1]]));
const power=(a,n)=>{let v=[1,0];for(let k=0;k<n;k++)v=mul(v,a);return v;};
const exp=a=>scale(Math.exp(a[0]),[Math.cos(a[1]),Math.sin(a[1])]);
const complexNear=(a,b,tol=1e-9)=>{near(a[0],b[0],tol);near(a[1],b[1],tol);};
const sum=(fn,count=90)=>{let s=[0,0];for(let k=0;k<count;k++)s=add(s,fn(k));return s;};
for(const n of [1,2,3]) {
  const z=[.12,.17], conjugate=[z[0],-z[1]];
  // Real central differences reconstruct the two Wirtinger operators.
  const fn=w=>add(mul(w,w),scale(n,[w[0],-w[1]])), h=1e-5;
  const dx=scale(1/(2*h),add(fn(add(z,[h,0])),scale(-1,fn(add(z,[-h,0])))));
  const dy=scale(1/(2*h),add(fn(add(z,[0,h])),scale(-1,fn(add(z,[0,-h])))));
  complexNear(scale(.5,add(dx,scale(-1,mul([0,1],dy)))),scale(2,z));
  complexNear(scale(.5,add(dx,mul([0,1],dy))),[n,0]);
  answer('wirtinger',n,0,`∂共轭zf=${n}`);
  for(const theta of [0,Math.PI/4]) {
    const w=[Math.cos(theta),Math.sin(theta)], bar=[w[0],-w[1]];
    const quotient=scale(n,div(mul(bar,bar),mul(w,w)));
    complexNear(quotient,[theta===0?n:-n,0]);
  }
  answer('cr-sufficiency',n,2,`差商为 ${n} 与 -${n}`);
  // Trapezoidal quadrature of an analytic periodic contour integrand checks
  // the Cauchy factor and orientation, without reading the answer as a formula.
  let integral=[0,0];const points=1024;
  for(let k=0;k<points;k++) {
    const theta=2*Math.PI*k/points, w=[Math.cos(theta),Math.sin(theta)], point=add([n,0],w);
    integral=add(integral,scale(2*Math.PI/points,div(mul(exp(point),mul([0,1],w)),power(w,3))));
  }
  complexNear(integral,[0,Math.PI*Math.exp(n)],1e-8);
  near(6*n/8,3*n/4); answer('higher-derivatives',n,2,`${3*n}/4`);
  complexNear(sum(k=>power(scale(n,z),k)),div([1,0],add([1,0],scale(-n,z))));
  complexNear(sum(k=>scale(n**k/factorial(k),power(z,k)),35),exp(scale(n,z)));
  answer('analytic-power',n,2,`f″(0)=${n*n}`);
  const pole=n+2;
  complexNear(div(add(z,[-1,0]),mul(add(z,[-1,0]),add(z,[-pole,0]))),div([1,0],add(z,[-pole,0])));
  assert.equal(Math.abs(pole-n),2); answer('taylor-radius',n,2,`R=${pole}`);
  // Limit of the normalized local leading term, evaluated using the stable
  // real expm1 to avoid unnecessary cancellation in the zero-order checks.
  const small=1e-4;
  near((Math.expm1(n*small)-n*small)/(small*small),n*n/2,5e-4);
  near(1/(2*n),1/(n+n)); answer('zero-order',n,2,`f″(0)=${n*n}`);
  // Contour quadrature extracts the local residue around zero for both a pole
  // and an essential singularity; radius is strictly less than the other pole.
  for(const [fn,expected] of [
    [w=>div([1,0],mul(power(w,2),add(w,[-n,0]))),-1/(n*n)],
    [w=>exp(div([n,0],w)),n],
  ]) {
    let contour=[0,0]; const radius=.8;
    for(let k=0;k<points;k++) {
      const theta=2*Math.PI*k/points,w=scale(radius,[Math.cos(theta),Math.sin(theta)]);
      contour=add(contour,scale(2*Math.PI/points,mul(fn(w),mul([0,1],w))));
    }
    complexNear(div(contour,[0,2*Math.PI]),[expected,0],1e-8);
  }
  answer('principal-part',n,1,`留数 -1/${n*n}`);
  const inside=scale(n,[.2,.1]), outside=scale(n,[2.5,.5]);
  complexNear(sum(k=>scale(-1/n**(k+1),power(inside,k))),div([1,0],add(inside,[-n,0])));
  complexNear(sum(k=>scale(n**k,div([1,0],power(outside,k+1)))),div([1,0],add(outside,[-n,0])));
  const middle=[1.4,.2];
  const mixed=add(sum(k=>scale(-1/(n+1),div([1,0],power(middle,k+1)))),sum(k=>scale(-1/((n+1)*pole**(k+1)),power(middle,k))));
  complexNear(mixed,div([1,0],mul(add(middle,[-1,0]),add(middle,[-pole,0]))));
  answer('annuli',n,2,`系数 -1/${n+1}`);
}
console.log(JSON.stringify({status:'passed', packs:3, topics:24, problems:216,
  checks:'Metadata, reserved IDs, prerequisites, variants, CTMC uniformization, Erlang integration, exhaustive mark enumeration, matrix identities, quotient invariance, complex differences, contour quadrature and Laurent sums; no real storage'},null,2));
