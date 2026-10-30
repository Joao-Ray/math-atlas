// Offline curriculum, filters and numerical spot checks. Does not read user storage.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const previous = require.extensions['.ts'];
require.extensions['.ts'] = (mod, filename) => {
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, filename);
};
let data, advanced, filters, study, past, practice, expansion;
try {
  data = require('../data/mockData.ts');
  advanced = require('../data/advancedCurriculum.ts');
  filters = require('../data/problemFilters.ts');
  study = require('../data/studyState.ts');
  past = require('../data/pastPapers.ts');
  practice = require('../data/practiceExpansion.ts');
  expansion = require('../data/courseExpansionV16.ts');
} finally {
  if (previous) require.extensions['.ts'] = previous;
  else delete require.extensions['.ts'];
}
const { courses, topics, formulas, problems } = data;
const { advancedCourses, advancedTopics, advancedFormulas, advancedProblems } = advanced;
const defaults = { query: '', track: 'all', courseId: null, level: null, completion: 'all', completedIds: [] };
const select = (options = {}, items = problems) => filters.filterStudyProblems(items, { ...defaults, ...options }, courses, topics);
let checks = 0;
function test(name, action) {
  try { action(); checks++; } catch (error) { error.message = name + ': ' + error.message; throw error; }
}
function near(actual, expected, tolerance = 1e-8) { assert.ok(Math.abs(actual - expected) < tolerance, actual + ' vs ' + expected); }
function integrate(fn, from, to, n = 4000) {
  const h = (to - from) / n;
  let result = fn(from) + fn(to);
  for (let i = 1; i < n; i++) result += (i % 2 ? 4 : 2) * fn(from + i * h);
  return result * h / 3;
}
const answer = (id, text) => assert.ok(advancedProblems.find((item) => item.id === id)?.answer.includes(text), 'Unexpected answer for ' + id);

test('five new courses each have five worked introductory lessons', () => {
  assert.equal(courses.length, 10); assert.equal(advancedCourses.length, 5);
  for (const course of advancedCourses) {
    assert.equal(advancedTopics.filter((topic) => topic.courseId === course.id).length, 5);
    assert.ok(advancedProblems.some((problem) => problem.courseId === course.id));
  }
  assert.equal(advancedTopics.filter((topic) => topic.courseId === 'calculus').length, 6);
});
test('all additions are exported without replacing legacy IDs', () => {
  assert.equal(advancedTopics.length, 31); assert.equal(advancedFormulas.length, 31); assert.equal(advancedProblems.length, 43);
  assert.equal(topics.length, 305); assert.equal(formulas.length, 321); assert.equal(problems.length, 1108);
  assert.equal(data.topicById('limits').courseId, 'calculus');
  assert.equal(data.problemById('small-sample-t-interval').topicId, 'student-t-inference');
  for (const topic of advancedTopics) {
    const current = data.topicById(topic.id);
    assert.equal(current.courseId, topic.courseId);
    assert.ok(topic.problemIds.every((id) => current.problemIds.includes(id)));
  }
});
test('new lessons have conditions, pitfalls and clearly labeled problem origins', () => {
  advancedTopics.forEach((topic) => assert.ok(topic.learningNotes.length >= 2));
  advancedFormulas.forEach((formula) => assert.ok(formula.conditions.length > 10));
  advancedProblems.forEach((problem) => {
    assert.ok(['original', 'competition-style'].includes(problem.source.kind));
    assert.ok(problem.source.label.includes('非历年真题'));
  });
  assert.equal(advancedTopics.filter((topic) => topic.sourceNote).length, 6);
});
test('competition track merges twelve sourced questions and eight training questions exactly once', () => {
  const selected = select({ track: 'competition' });
  assert.equal(selected.length, 20);
  assert.equal(new Set(selected.map((item) => item.id)).size, 20);
  const training=select({ track: 'competition', competitionSource: 'competition-style' });
  assert.equal(training.length,8);
  assert.ok(training.every((item) => item.source.kind === 'competition-style' && item.difficulty>=4));
  assert.equal(select({ track: 'core' }).length + selected.length, problems.length);
  assert.deepEqual(select({track:'past-paper'}),selected,'Legacy links open the merged collection');
});
test('Chinese and English course searches find the added curriculum', () => {
  for (const [query, courseId] of [['高等代数', 'higher-algebra'], ['COMPLEX ANALYSIS', 'complex-analysis'], ['测度论', 'measure-theory']]) {
    const expectedIds = problems.filter(problem => problem.courseId === courseId).map(problem => problem.id).sort();
    assert.deepEqual(select({ query }).map(problem => problem.id).sort(), expectedIds);
  }
  assert.equal(select({ query: '  一致收敛  ' }).length, 4);
});
test('track, course, difficulty and completion filters intersect', () => {
  const id = 'contest-idempotent-decomposition';
  assert.deepEqual(select({ track: 'competition', courseId: 'higher-algebra', level: 4, completion: 'completed', completedIds: [id] }).map((item) => item.id), [id]);
  assert.equal(select({ track: 'competition', courseId: 'complex-analysis' }).length, 0);
  assert.equal(select({ track: 'competition', level: 1 }).length, 0);
  assert.ok(!select({ completion: 'uncompleted', completedIds: [id] }).some((item) => item.id === id));
});
test('route normalization accepts known courses and safely rejects malformed input', () => {
  for (const course of courses) assert.equal(filters.normalizeCourseSelection(course.id, courses), course.id);
  for (const invalid of [null, undefined, ['higher-algebra'], 'unknown', 'all']) assert.equal(filters.normalizeCourseSelection(invalid, courses), 'all');
  for (const invalid of [null, ['competition'], 'unknown']) assert.equal(filters.normalizeProblemTrack(invalid), 'all');
  assert.equal(filters.normalizeProblemTrack('competition'), 'competition');
});
test('filtering is pure and hidden answers are not search inputs', () => {
  const snapshot = JSON.stringify(problems);
  select({ track: 'competition', query: '极限' });
  assert.equal(JSON.stringify(problems), snapshot);
  const fixture = [{ ...problems[0], title: 'visible', prompt: 'question', answer: 'answeronlytoken' }];
  assert.equal(select({ query: 'answeronlytoken' }, fixture).length, 0);
});
test('mixed old and new saved IDs survive normalize, backup and merge', () => {
  const state = { ...study.emptyStudyState, favoriteTopics: ['limits', 'dominated-convergence'],
    favoriteFormulas: ['chain-rule', 'minimal-polynomial-formula'],
    completedProblems: ['small-sample-t-interval', 'contest-uniform-rational'] };
  assert.deepEqual(study.normalizeStudyState(state), state);
  assert.deepEqual(study.parseStudyBackup(study.createStudyBackup(state)).state, state);
  assert.deepEqual(study.mergeStudyStates(state, state), state);
});
test('asymptotic coefficients match stable small-input evaluation', () => {
  const x = 0.01;
  near((Math.expm1(x*x) + 2*Math.sin(x/2)**2 - 1.5*x*x) / x**4, 11/24, 2e-5);
  const y = 0.001;
  near((Math.log1p(y) - y + y*y/2) / y**3, 1/3, 3e-4);
  answer('contest-exp-cos-cancellation', '11/24'); answer('log-cancellation-third', '1/3');
});
test('moving-bound and parameter integral derivatives', () => {
  const x = 0.5, h = 1e-5;
  const fn = (value) => integrate((t) => Math.exp(t*t), value, value*value);
  near((fn(x+h)-fn(x-h))/(2*h), 2*x*Math.exp(x**4)-Math.exp(x*x), 1e-7);
  const a = 2;
  near(integrate((t) => 1/(1+a*t), 0, 1), Math.log1p(a)/a);
  answer('parameter-log-integral', 'log(1+a)/a');
});
test('Wallis and beta integrals', () => {
  near(integrate((x) => Math.sin(x)**6, 0, Math.PI/2), 5*Math.PI/32);
  near(integrate((x) => x*Math.sin(x)**4, 0, Math.PI), 3*Math.PI**2/16);
  near(integrate((x) => x*(1-x)**2, 0, 1), 1/12);
  answer('wallis-sixth-power', '5π/32'); answer('wallis-weighted-fourth', '3π²/16'); answer('beta-polynomial-integral', '1/12');
});
test('Gaussian and reflection integrals', () => {
  near(integrate((x) => Math.exp(-x*x), 0, 8), Math.sqrt(Math.PI)/2);
  near(integrate((x) => x*Math.sin(x)/(1+Math.cos(x)**2), 0, Math.PI), Math.PI**2/4);
  near(integrate((x) => x**3/(x**3+(1-x)**3), 0, 1), 0.5);
  answer('contest-gaussian-half', '√π/2'); answer('symmetric-trig-denominator', 'π²/4'); answer('contest-reflection-ratio', '1/2');
});
test('polar area and principal-axis coefficients', () => {
  near(integrate((t) => (1+Math.cos(t))**2/2, 0, 2*Math.PI), 3*Math.PI/2);
  for (const [x,y] of [[1,2],[-1,3],[2,-3]]) {
    const u=(x+y)/Math.sqrt(2), v=(x-y)/Math.sqrt(2);
    near(5*x*x+6*x*y+5*y*y, 8*u*u+2*v*v);
  }
  answer('cardioid-area', '3π/2'); answer('rotated-ellipse', '1、2');
});
test('complex cube roots and rational residue coefficient', () => {
  for (const theta of [Math.PI/3, Math.PI, 5*Math.PI/3]) { near(Math.cos(3*theta), -1); near(Math.sin(3*theta), 0); }
  near(1/(0-3), -1/3);
  answer('cube-roots-negative-one', '1/2+i√3/2'); answer('residue-rational-two', '−2πi/3');
});
test('truncation integral and uniform-error estimates', () => {
  for (const n of [1,2,10,100]) {
    const cut=1/n**2;
    near(n*cut+2*(1-Math.sqrt(cut)), 2-1/n);
    const x=1/Math.sqrt(n);
    near(x/(1+n*x*x), 1/(2*Math.sqrt(n)));
  }
  answer('monotone-truncation-integral', '2−1/n'); answer('contest-uniform-rational', '1/(2√n)');
});
test('PDF past papers are a separate, uniquely identified 12-question collection', () => {
  assert.equal(past.pastPaperProblems.length, 12);
  assert.equal(past.examTopics.length, 9); assert.equal(past.examFormulas.length, 9);
  assert.equal(select({ track: 'competition', competitionSource: 'past-paper' }).length, 12);
  assert.ok(select({ track: 'competition', competitionSource: 'past-paper' }).every((problem) => problem.source.kind === 'past-paper'));
  assert.equal(select({ track: 'core' }).length, 1088);
});
test('PDF provenance is explicit and does not invent calendar years', () => {
  for (const problem of past.pastPaperProblems) {
    const item = problem.source;
    assert.equal(item.documentTitle, '微积分学习笔记');
    assert.equal(item.exam, '第17届大学生数学竞赛');
    assert.ok(item.verificationNote.includes('未与官方原卷'));
    assert.ok(item.pdfPages.length > 0 && item.pdfPages.every((page) => Number.isInteger(page) && page >= 839 && page <= 855));
    assert.ok(item.printedPages.every((page) => item.pdfPages.includes(page + 20)));
    assert.ok(!('year' in item));
  }
  assert.equal(data.problemById('cmc17-a-fill-3').source.question, '填空题 3');
  assert.deepEqual(data.problemById('cmc17-a-fill-3').source.pdfPages, [849]);
  assert.deepEqual(data.problemById('cmc17-a-fill-3').source.printedPages, []);
});
test('A/B filtering includes shared questions without duplicating all-results IDs', () => {
  const a = select({ track: 'competition', competitionSource: 'past-paper', paper: '非数学 A 类' });
  const b = select({ track: 'competition', competitionSource: 'past-paper', paper: '非数学 B 类' });
  assert.equal(a.length, 8); assert.equal(b.length, 6);
  assert.equal(a.filter((item) => b.some((other) => other.id === item.id)).length, 2);
  assert.equal(new Set([...a,...b].map((item) => item.id)).size, 12);
  assert.equal(select({ track: 'competition', paper: '非数学 A 类' }).length, 8);
});
test('past-paper filters, source search and completion are combined correctly', () => {
  assert.equal(select({ track: 'competition', query: '填空题 3' })[0].id, 'cmc17-a-fill-3');
  assert.equal(select({ track: 'competition', query: '微积分学习笔记' }).length, 12);
  assert.equal(select({ track: 'competition', courseId: 'measure-theory' }).length, 0);
  assert.equal(select({ track: 'competition', completion: 'completed', completedIds: ['cmc17-a-fill-1'] }).length, 1);
  assert.equal(filters.normalizeProblemTrack('past-paper'), 'competition');
});
test('PDF question IDs and new lesson IDs survive learning backup without altering older IDs', () => {
  const state = { ...study.emptyStudyState, favoriteTopics: ['limits','scalar-line-integrals'],
    favoriteFormulas: ['chain-rule','graph-surface-area-formula'],
    completedProblems: ['small-sample-t-interval','contest-uniform-rational','cmc17-a-fill-5'] };
  assert.deepEqual(study.normalizeStudyState(state), state);
  assert.deepEqual(study.parseStudyBackup(study.createStudyBackup(state)).state, state);
});
const pastAnswer = (id, fragment) => assert.ok(data.problemById(id).answer.includes(fragment), 'Unexpected PDF answer: ' + id);
test('PDF A fill-1 coefficient agrees with a stable small-input calculation', () => {
  const x=0.0001;
  near((x-Math.log1p(x)-0.5*x*Math.sin(x))/x**3, -1/3, 5e-5);
  pastAnswer('cmc17-a-fill-1', '−1/3');
});
test('PDF A fill-3 checks both sides and preserves the squared-sine upper bound', () => {
  for (const x of [-0.01,0.01]) {
    const numerator=integrate((t) => Math.log1p(t), 0, Math.sin(x)**2, 200);
    const denominator=Math.expm1(Math.log1p(x**3)/3)*Math.sin(x);
    near(numerator/denominator, 1.5, 2e-4);
  }
  pastAnswer('cmc17-a-fill-3', '3/2');
  assert.ok(data.problemById('cmc17-a-fill-3').formulas[0].includes('sin^2'));
});
test('PDF A fill-5 circle parameterization verifies the integral, not a pointwise identity', () => {
  const value = (t) => {
    const x=1+Math.cos(t)/Math.sqrt(2)+Math.sin(t)/Math.sqrt(6);
    const y=1-Math.cos(t)/Math.sqrt(2)+Math.sin(t)/Math.sqrt(6);
    return x*x+2*x*y;
  };
  near(integrate(value,0,2*Math.PI), 6*Math.PI);
  assert.ok(Math.abs(value(0)-3)>0.1);
  pastAnswer('cmc17-a-fill-5', '6π');
});
test('PDF A question-2 candidate satisfies derivative, integral and full identity', () => {
  const c=3/22, fn=(x)=>x**3-c*x*x-c*x;
  const m=integrate(fn,0,1);
  near(m,c);
  for (const x of [-2,-0.2,0,1,3]) near(fn(x),x**3-c*x*x-x*m);
  near((fn(1e-5)-fn(-1e-5))/2e-5, -c);
  pastAnswer('cmc17-a-question-2', '3x²/22');
});
test('PDF A question-4 sliced integral and positive z square root', () => {
  near(1.5*integrate((u)=>u/Math.sqrt(1+u*u),0,1),1.5*(Math.sqrt(2)-1));
  pastAnswer('cmc17-a-question-4', '3(√2−1)/2');
});
test('PDF B fill-5 exponential substitution checks the infinite tail integral', () => {
  near(integrate((u)=>u*Math.exp(-u)/(1+Math.exp(-u))**2,0,40),Math.log(2),1e-8);
  pastAnswer('cmc17-b-fill-5', 'ln 2');
});
test('PDF B question-2 gradient normalization and graph surface area', () => {
  near(Math.hypot(-8,-6),10);
  near((-8)*(-4/5)+(-6)*(-3/5),10);
  near(2*Math.PI*integrate((r)=>r*Math.sqrt(1+4*r*r),0,1),Math.PI*(5*Math.sqrt(5)-1)/6);
  pastAnswer('cmc17-b-question-2', 'π(5√5−1)/6');
});
test('PDF B question-3 stationary points satisfy F=0 and opposite Hessian signs', () => {
  for (const [x,z,expected] of [[-2,1,-15],[16/7,-8/7,15]]) {
    near(2*x*x+z*z+8*x*z-z+8,0);
    near(4*x+8*z,0); near(2*z+8*x-1,expected);
    assert.ok((-4/expected)*(z===1 ? 1 : -1)>0);
  }
  pastAnswer('cmc17-b-question-3', '局部极小值为 1');
});
test('PDF shared ODE restores the zero branch and checks the original equation', () => {
  for (const [x,c] of [[0.3,2],[2,3],[4,1]]) {
    const u=Math.log(x)/(x+c), du=((x+c)/x-Math.log(x))/(x+c)**2;
    const sin=Math.sqrt(1-u*u), dy=-du/sin;
    near(x*Math.log(x)*dy*sin+(1-x*u)*u,0);
  }
  for (const x of [0.3,1,2]) {
    const y=Math.PI/2;
    near((1-x*Math.cos(y))*Math.cos(y),0);
  }
  pastAnswer('cmc17-ab-ode', 'y≡π/2+kπ');
});
test('PDF shared question-5 derivative signs, product identity and geometric envelope', () => {
  const fn=(x)=>Math.sin(x)**2*Math.sin(2*x);
  const derivative=(x)=>2*Math.sin(x)**2*(4*Math.cos(x)**2-1);
  assert.ok(derivative(Math.PI/6)>0 && derivative(Math.PI/2)<0 && derivative(5*Math.PI/6)>0);
  near(fn(Math.PI/3),3*Math.sqrt(3)/8); near(fn(2*Math.PI/3),-3*Math.sqrt(3)/8);
  for (const x of [-2.1,-0.4,0,0.1,0.4,Math.PI/3,2.1,Math.PI]) {
    for (let n=1;n<=12;n++) {
      let product=1, regroup=Math.abs(Math.sin(x))*Math.sin(2**n*x)**2;
      for(let k=0;k<=n;k++) product*=Math.sin(2**k*x)**2;
      for(let k=0;k<n;k++) regroup*=Math.abs(fn(2**k*x));
      near(product**1.5,regroup);
      assert.ok(product<=(3/4)**n+1e-12);
    }
  }
  pastAnswer('cmc17-ab-question-5', '递减区间 (π/3,2π/3)');
});
test('PDF B question-6 fixed global energy controls several smooth functions', () => {
  for (const [fn,df] of [[(x)=>x,(x)=>1],[(x)=>x*x+Math.sin(x),(x)=>2*x+Math.cos(x)],[(x)=>Math.exp(x),(x)=>Math.exp(x)]]) {
    const a=-1,b=2,mean=integrate(fn,a,b)/(b-a);
    const variance=integrate((x)=>(fn(x)-mean)**2,a,b), energy=integrate((x)=>df(x)**2,a,b);
    assert.ok(variance<=(b-a)**2/2*energy+1e-9);
  }
  assert.ok(data.problemById('cmc17-b-question-6').source.editorialNote.includes('不把含变上限'));
});
test('PDF A question-6 sign identity also holds when g is not globally monotone', () => {
  const c=7/25;
  const fn=(x)=>(x*x-c)*(2-x*x), gn=(x)=>x*(2-x*x);
  const F=(x)=>-(x**5)/5+(2+c)*x**3/3-2*c*x;
  const G=(x)=>x*x-x**4/4-3/4;
  near(integrate(fn,-1,1),0); near(integrate(gn,-1,1),0);
  assert.ok(2-3*0**2>0 && 2-3*0.9**2<0);
  for (const x of [-1,-0.5,0,0.5,1]) assert.ok((2-x*x)**2*(x*x+c)>0);
  const left=integrate((x)=>fn(x)*G(x),-1,1);
  const right=-integrate((x)=>gn(x)*F(x),-1,1);
  near(left,right); assert.ok(left>0);
  assert.ok(data.problemById('cmc17-a-question-6').source.editorialNote.includes('不假设 g 全域单调'));
});
test('three practice sets each have six self-authored exercises with no invented book question numbers', () => {
  assert.equal(practice.practiceTopics.length,5); assert.equal(practice.practiceFormulas.length,5);
  assert.equal(practice.practiceProblems.length,18);
  for (const set of practice.practiceSets) assert.equal(select({track:'practice',practiceSet:set.id}).length,6);
  assert.equal(select({track:'practice'}).length,18);
  assert.equal(select({track:'practice',query:'吉米多维奇'}).length,6);
  assert.equal(filters.normalizeProblemTrack('practice'),'practice');
  for (const item of practice.practiceProblems) {
    assert.equal(item.source.kind,'original');
    assert.ok(item.source.label.includes('非原书原题') || item.source.label.includes('非教材原题'));
    assert.ok(!('question' in item.source));
  }
});
test('practice course, topic group and completion filters intersect without leaking into past papers', () => {
  assert.equal(select({track:'practice',practiceSet:'analysis',courseId:'linear-algebra'}).length,0);
  assert.equal(select({track:'practice',practiceSet:'linear-algebra',courseId:'linear-algebra'}).length,6);
  assert.equal(select({track:'practice',completion:'completed',completedIds:['practice-linear-nullspace']}).length,1);
  assert.equal(select({track:'competition',competitionSource:'past-paper',practiceSet:'analysis'}).length,12);
  assert.equal(select({track:'competition',practiceSet:'analysis'}).length,20);
});
test('epsilon-N bounds and monotone recursion meet their numerical claims', () => {
  for (const eps of [0.001,0.1,1,10]) {
    const n=Math.floor(5/eps)+1;
    assert.ok(Math.abs((2*n+1)/(n+3)-2)<eps);
  }
  let x=1;
  for (let n=0;n<20;n++) {const next=Math.sqrt(2+x);assert.ok(next>=x && next<=2);x=next;}
  near(x,2,1e-10);
});
test('moving-peak error remains away from zero despite pointwise convergence', () => {
  for (const n of [1,2,10,100]) {
    const x=n/(n+1), value=n*x**n*(1-x);
    near(value,(n/(n+1))**(n+1));
    assert.ok(value>0.2);
  }
  near((10000/10001)**10001,1/Math.E,2e-5);
});
test('linear drill answers satisfy nullspace, normalization and finite inverse identities', () => {
  for (const [x,y,z] of [[-2,1,0],[-3,0,1]]) near(x+2*y+3*z,0);
  const q1=[1/Math.sqrt(2),1/Math.sqrt(2),0],q2=[1/Math.sqrt(6),-1/Math.sqrt(6),2/Math.sqrt(6)];
  near(q1.reduce((sum,x,i)=>sum+x*q2[i],0),0);near(Math.hypot(...q1),1);near(Math.hypot(...q2),1);
  const a=[[1,-1,0],[0,1,-1],[0,0,1]],b=[[1,1,1],[0,1,1],[0,0,1]];
  for(let i=0;i<3;i++)for(let j=0;j<3;j++)near(a[i].reduce((sum,x,k)=>sum+x*b[k][j],0),i===j?1:0);
  near(3*(4/3)-4,0);
  for(const t of [-2,0,1,3]) {
    const determinant=t*t-1-(t-1)+(1-t);
    near(determinant,(t-1)**2);
  }
});
test('calculus drill integrals, minima and first-order ODE agree with independent evaluation', () => {
  for(const x of [-0.01,0.01]) near(integrate((t)=>t-Math.sin(t),0,x,200)/x**4,1/24,2e-6);
  near(integrate(Math.atan,0,1),Math.PI/4-Math.log(2)/2);
  near(2*Math.PI*integrate((r)=>r**3,0,1),Math.PI/2);
  near((1/Math.E)**(1/Math.E),Math.exp(-1/Math.E));
  for(const x of [-1,0,2]) {
    const y=Math.exp(-x)-Math.exp(-2*x),dy=-Math.exp(-x)+2*Math.exp(-2*x);
    near(dy+2*y,Math.exp(-x));
  }
});
test('version 1.6 adds one lesson and two original worked problems to each course', () => {
  assert.equal(expansion.expansionTopics.length,10);
  assert.equal(expansion.expansionFormulas.length,10);
  assert.equal(expansion.expansionProblems.length,20);
  for(const course of courses) {
    const lessons=expansion.expansionTopics.filter((item)=>item.courseId===course.id);
    assert.equal(lessons.length,1);
    assert.equal(lessons[0].problemIds.length,2);
    assert.ok(lessons[0].learningNotes.length>=2);
    assert.equal(expansion.expansionProblems.filter((item)=>item.courseId===course.id).length,2);
  }
  for(const problem of expansion.expansionProblems) {
    assert.equal(problem.source.kind,'original');
    assert.ok(problem.source.label.includes('非历年真题'));
    assert.ok(problem.steps.length>=2 && problem.hints.length>=1);
    assert.ok(select({track:'core'}).some((item)=>item.id===problem.id));
    assert.ok(!select({track:'competition'}).some((item)=>item.id===problem.id));
  }
});
test('new mean-value bounds and orthogonal transformations satisfy independent spot checks', () => {
  for(const x of [0.0001,0.1,1,10,1000]) {
    assert.ok(x/(1+x)<Math.log1p(x) && Math.log1p(x)<x);
  }
  const q=[[0.5,-Math.sqrt(3)/2],[Math.sqrt(3)/2,0.5]];
  near(q[0][0]*2,1);near(q[1][0]*2,Math.sqrt(3));
  for(let i=0;i<2;i++)for(let j=0;j<2;j++)near(q.reduce((sum,row)=>sum+row[i]*row[j],0),i===j?1:0);
  const u=[1/Math.sqrt(2),-1/Math.sqrt(2)];
  for(let i=0;i<2;i++)for(let j=0;j<2;j++)near((i===j?1:0)-2*u[i]*u[j],i===j?0:1);
  assert.ok(data.problemById('householder-reflection-plane').answer.includes('det H=−1'));
});
test('new projection answer is on the line and has perpendicular residual', () => {
  const point=[2,0,0],base=[0,1,0],direction=[1,1,0];
  const t=direction.reduce((sum,v,i)=>sum+v*(point[i]-base[i]),0)/2;
  near(t,0.5);
  const foot=base.map((v,i)=>v+t*direction[i]),residual=point.map((v,i)=>v-foot[i]);
  assert.deepEqual(foot,[0.5,1.5,0]);
  near(residual.reduce((sum,v,i)=>sum+v*direction[i],0),0);
  near(Math.hypot(...residual),3/Math.sqrt(2));
  assert.ok(data.problemById('distance-point-to-slanted-line').answer.includes('3/√2'));
});
test('new harmonic conjugates satisfy both Cauchy-Riemann equations numerically', () => {
  const h=1e-5;
  const dx=(fn,x,y)=>(fn(x+h,y)-fn(x-h,y))/(2*h);
  const dy=(fn,x,y)=>(fn(x,y+h)-fn(x,y-h))/(2*h);
  for(const [u,v] of [[(x,y)=>x*x-y*y,(x,y)=>2*x*y],[(x,y)=>Math.exp(x)*Math.cos(y),(x,y)=>Math.exp(x)*Math.sin(y)]]) {
    for(const [x,y] of [[0,0],[0.3,-0.7],[-1,2]]) {
      near(dx(u,x,y),dy(v,x,y),1e-7);near(dy(u,x,y),-dx(v,x,y),1e-7);
    }
  }
});
test('new marginal densities normalize and absorption answers solve their equations', () => {
  near(integrate((x)=>2*x,0,1),1);near(integrate((y)=>2*(1-y),0,1),1);
  near(integrate(()=>1/2,0,2),1);near(integrate(()=>1/3,0,3),1);
  near((1/2)*(1/3),1/6);
  near(1+0.7*(10/3),10/3);near(0.3+0.5*0.6,0.6);near(1+0.5*2,2);
  assert.ok(data.problemById('absorbing-chain-success-probability').answer.includes('0.6'));
});
test('old and new IDs coexist in backup without changing previous completion records', () => {
  const state={...study.emptyStudyState,
    completedProblems:['small-sample-t-interval','cmc17-a-fill-1','practice-calculus-linear-ode','mvt-log-bounds'],
    favoriteTopics:['limits','sequence-limit-proof','fatou-lemma'],
    favoriteFormulas:['chain-rule','nilpotent-matrix-series-formula','harmonic-conjugates-formula']};
  assert.deepEqual(study.normalizeStudyState(state),state);
  assert.deepEqual(study.parseStudyBackup(study.createStudyBackup(state)).state,state);
});
console.log(JSON.stringify({ curriculumChecks: checks, addedCourses: advancedCourses.length, addedTopics: advancedTopics.length,
  addedFormulas: advancedFormulas.length, addedProblems: advancedProblems.length, competitionTraining: select({ track: 'competition', competitionSource: 'competition-style' }).length,
  competitionTotal: select({track:'competition'}).length,
  pdfPastPapers: past.pastPaperProblems.length, examTopics: past.examTopics.length,
  practiceSets: practice.practiceSets.length, practiceProblems: practice.practiceProblems.length,
  status: 'passed', scope: 'Offline checks and numerical spot checks; not a proof checker or UI test.' }, null, 2));
