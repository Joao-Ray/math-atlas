const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const file = require('node:path').join(__dirname, '../data/tenVersions/geometryMeasureAnalysis.ts');
assert.ok(fs.existsSync(file), 'Three new releases must be authored');
const previous = require.extensions['.ts'];
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, f);
let releases, roadmap, data;
try {
  releases = require(file);
  roadmap = require('../data/curriculumRoadmap.ts');
  data = require('../data/mockData.ts');
} finally {
  if (previous) require.extensions['.ts'] = previous;
  else delete require.extensions['.ts'];
}
const all = ['seriesV120', 'seriesV121', 'seriesV122'].flatMap(name => {
  assert.equal(releases[name].length, 8, name);
  assert.equal(releases[name].reduce((n, t) => n + t.exercises.length, 0), 72);
  return releases[name];
});
assert.equal(new Set(all.map(t => t.courseId + ':' + t.key)).size, 24);
const prompts = new Set();
const existingIds = new Set(data.topics.map(t => t.id));
// Exercise formula cards go through the same parser/packages as the application.
const mathRoot = 'react-native-mathjax-html-to-svg/mathjax/';
const { mathjax } = require(mathRoot + 'mathjax');
const { TeX } = require(mathRoot + 'input/tex');
const { SVG } = require(mathRoot + 'output/svg');
const { liteAdaptor } = require(mathRoot + 'adaptors/liteAdaptor');
const { RegisterHTMLHandler } = require(mathRoot + 'handlers/html');
require(mathRoot + 'input/tex/ams/AmsConfiguration');
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const mathDocument = mathjax.document('', { InputJax: new TeX({packages:['base','ams']}), OutputJax: new SVG({fontCache:'none'}) });
for (const lesson of all) {
  assert.ok(roadmap.courseBlueprints[lesson.courseId].some(c => c.entries.split('|').some(e => e.startsWith(lesson.key + '='))), lesson.key);
  assert.ok(lesson.definition.length > 60 && lesson.intuition.length > 15);
  assert.ok(lesson.learningNotes.length >= 2 && lesson.formula.conditions.length > 10);
  assert.ok(!adaptor.innerHTML(mathDocument.convert(lesson.formula.latex,{display:false})).includes('data-mjx-error'), lesson.key);
  lesson.prerequisites.forEach(id => assert.ok(existingIds.has(id), `Unknown prerequisite ${id}`));
  assert.equal(lesson.exercises.length, 9);
  for (const p of lesson.exercises) {
    assert.ok(!prompts.has(p.prompt), p.prompt); prompts.add(p.prompt);
    assert.ok(p.variantLabel && p.hints.length && p.answer && p.steps.length >= 2);
    assert.ok(p.steps.every(s => s.body.length > 12));
  }
}
const topic = key => all.find(t => t.key === key);
const answer = (key, form, n) => topic(key).exercises[form * 3 + n - 1].answer;
const has = (key, form, n, fragment) => assert.ok(answer(key, form, n).includes(fragment), `${key}/${form}/${n}: ${fragment} not in ${answer(key, form, n)}`);
const near = (a,b) => assert.ok(Math.abs(a-b) < 1e-9, `${a} != ${b}`);
const dot = (a,b) => a.reduce((s,x,i)=>s+x*b[i],0);
// Coordinate, distance, projection and angle checks use the defining equations.
for (let n=1; n<=3; n++) {
  has('coordinates',0,n,String(Math.hypot(n,2*n,2*n)));
  has('coordinates',1,n,`(${2*n},2,1)`);
  has('coordinates',2,n,`(${n},2,3)`);
  has('line-parameter',0,n,`(${2*n},${2*n+1},${n})`);
  has('line-parameter',1,n,'不在');
  has('line-parameter',2,n,`(${n+3},7,3)`);
  has('plane-normal',0,n,`=${n}`);
  has('plane-normal',1,n,`${n}/3`);
  const foot=[8*n/3,-2*n/3,-2*n/3];
  near(dot(foot,[1,2,2]),0);
  near(Math.hypot(3*n-foot[0],foot[1],foot[2]),n);
  has('plane-normal',2,n,`(${8*n}/3,${-2*n}/3,${-2*n}/3)`);
  near(dot([n,0,0],[1,1,0])/(n*Math.sqrt(2)),Math.SQRT1_2);
  near(dot([1,n,0],[-n,1,0]),0);
  near(dot([n,n,0],[1,0,1])/(Math.sqrt(2)*n*Math.sqrt(2)),.5);
  has('line-angle',0,n,'π/4'); has('line-angle',1,n,`a=${-n}`); has('line-angle',2,n,'π/3');
  has('line-angle',2,n,'a=±1');
  for (const a of [-1,1]) near(Math.abs(dot([n,n,0],[1,0,a]))/(Math.hypot(n,n)*Math.hypot(1,a)),.5);
  has('plane-angle',0,n,'π/4'); has('plane-angle',1,n,`a=${-n}`); has('plane-angle',2,n,'π/2');
  has('plane-angle',2,n,`x+y=${2*n}`);
  has('two-spheres',0,n,'外切'); has('two-spheres',1,n,'内切');
  near(n*n-(n/2)**2,3*n*n/4); has('two-spheres',2,n,`${n}√3/2`);
  has('point-sphere',0,n,`距离=${n}`); has('point-sphere',1,n,`距离=${n}`); has('point-sphere',2,n,`距离=${2*n}`);
  has('power',0,n,String((2*n)**2-n*n)); has('power',1,n,String(-n*n));
  near((5*n)**2-(3*n)**2,(4*n)**2); has('power',2,n,`切线长=${4*n}`);
  // Enumerate every subset and distinguish generated finite sigma-algebra atoms.
  const m=n+2, full=(1<<m)-1;
  const generated = generators => {
    const sets=new Set([0,full,...generators]);
    let changed=true;
    while(changed) {
      const before=sets.size, old=[...sets];
      old.forEach(a=>{ sets.add(full^a); old.forEach(b=>sets.add(a|b)); });
      changed=sets.size!==before;
    }
    return sets;
  };
  assert.equal(generated([1]).size,4); assert.equal(generated([1,2]).size,8);
  has('algebras',0,n,'4'); has('algebras',1,n,'8'); has('algebras',2,n,'不是');
  has('atoms',0,n,`{1,…,${n+1}}`);
  has('atoms',1,n,String(Array.from({length:n+1},(_,i)=>i===0?n:1).reduce((a,b)=>a+b,0)));
  has('atoms',2,n,String((n+1)*n+(n+1)*2*n));
  const weights=[n,1,1], mass=weights.reduce((a,b)=>a+b,0);
  has('probability',0,n,`${n+1}/${mass}`); has('probability',1,n,`3/${mass}`); has('probability',2,n,`2/${mass}`);
  has('integrable',0,n,String([n,-2*n,3*n].reduce((s,x)=>s+Math.abs(x),0)));
  has('integrable',1,n,'绝对积分='+[n,4*n,3*n].reduce((a,b)=>a+b,0)); has('integrable',2,n,'不可积');
  has('positive-negative',0,n,`f⁺=(${n},0,0)`); has('positive-negative',0,n,`f⁻=(0,${2*n},0)`);
  has('positive-negative',1,n,`积分=${n}`); has('positive-negative',2,n,`绝对积分=${2*n}`);
  const f=[0,n,3*n]; near(f.filter(x=>x>=2*n).length,1);
  has('markov',0,n,'上界=2'); has('markov',1,n,'上界=2/3'); has('markov',2,n,'上界=5/12');
  has('norm',0,n,`${n}√2`); has('norm',1,n,`范数=${2*n}`); has('norm',2,n,`范数=${4*n}`);
  const vectors=[[n,0,2*n],[n,n,3*n],[0,2*n,3*n]], projections=[[n,n,n],[2*n,0,2*n],[n,n,3*n]];
  vectors.forEach((v,j)=>{
    const residual=v.map((x,i)=>x-projections[j][i]);
    const space=j===0?[[1,1,1]]:j===1?[[1,0,1]]:[[1,1,0],[0,0,1]];
    space.forEach(b=>near(dot(residual,b),0));
    has('l2-projection',j,n,`误差平方=${dot(residual,residual)}`);
  });
  // Stolz polynomial differences are verified symbolically by enough evaluations.
  for(let m=1;m<=8;m++) {
    near(n*(m+1), n*((m+1)*(m+2)/2-m*(m+1)/2));
    near(n*(m+1)**2,n*((m+1)*(m+2)*(2*m+3)/6-m*(m+1)*(2*m+1)/6));
  }
  has('stolz',0,n,`${n}/2`); has('stolz',1,n,`${n}/3`); has('stolz',2,n,`极限=${n}`);
  has('asymptotic',0,n,`C=${n}`); has('asymptotic',1,n,'小 o'); has('asymptotic',2,n,'渐近等价');
  for(const epsilon of [.1,.01,.001]) {
    const threshold=Math.floor(n/epsilon)+1;
    assert.ok(n/threshold<epsilon);
    const K=Math.ceil(3/epsilon);
    for(let r=0;r<3;r++) assert.ok((r+1)/(K+1)<epsilon);
  }
  has('subsequence-criterion',0,n,`${n+1}`); has('subsequence-criterion',0,n,`${n-1}`);
  has('subsequence-criterion',1,n,`极限=${n}`); has('subsequence-criterion',2,n,`极限=${n}`);
  assert.ok(-n<0 && (n+1)**3-n>0);
  has('intermediate',0,n,'唯一'); has('intermediate',1,n,`±${n}`); has('intermediate',2,n,'不连续');
  has('extreme-value',0,n,`最大值=${n*n}`); has('extreme-value',1,n,'均不取到'); has('extreme-value',2,n,'最小值=1/2');
  has('fermat',0,n,`x=${n}`); has('fermat',1,n,'不可导'); has('fermat',2,n,'端点');
  near(2*(n/2)-n,0); has('rolle',0,n,`c=${n}/2`); has('rolle',1,n,'不可导'); has('rolle',2,n,'c=0');
  has('taylor-peano',0,n,`${(n+1)*n/2}x²`); has('taylor-peano',1,n,`${n*n}/2`); has('taylor-peano',2,n,`${n**3}/6`);
  // Direct function evaluation cross-checks coefficient signs and limiting scale.
  const h=1e-3;
  assert.ok(Math.abs((Math.expm1(n*h)-n*h)/(h*h)-n*n/2)<.006);
  assert.ok(Math.abs((Math.sin(n*h)-n*h)/(h**3)+n**3/6)<.00001);
  for(const x of [-.2,.1,.4]) {
    const a=n+1;
    const rest=a===2?0:a===3?x**3:4*x**3+x**4;
    near((1+x)**a,1+a*x+(a*(a-1)/2)*x*x+rest);
  }
}
console.log('PASS: v1.20–v1.22: 24 reserved lessons, 216 worked exercises; finite enumeration, geometry, norm/projection and limit checks passed.');
