// Real search, roadmap and backup consumers catch omitted imports and broken links.
// Independent arithmetic checks below catch worked-example calculation errors.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const previous = require.extensions['.ts'];
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, f);
let data, roadmap, filters, study;
try {
  data = require('../data/mockData.ts');
  roadmap = require('../data/curriculumRoadmap.ts');
  filters = require('../data/problemFilters.ts');
  study = require('../data/studyState.ts');
} finally {
  if (previous) require.extensions['.ts'] = previous;
  else delete require.extensions['.ts'];
}
const selected = {
  'higher-algebra': ['irreducible', 'factorization', 'rational-roots', 'eisenstein'],
  'complex-analysis': ['mobius', 'cross-ratio', 'riemann-sphere', 'extended-plane'],
  'analytic-geometry': ['inner-product', 'affine-combination', 'frames', 'gram-determinant'],
  'measure-theory': ['trace', 'product-sigma', 'counting', 'dirac'],
};
const ids = Object.entries(selected).flatMap(([course, keys]) => keys.map(key => roadmap.roadmapTopicId(course, key)));
const topics = ids.map(id => {
  const topic = data.topicById(id);
  assert.ok(topic, `Missing published lesson: ${id}`);
  const route = roadmap.getCourseRoadmap(topic.courseId, data.topics).flatMap(chapter => chapter.entries);
  assert.equal(route.filter(entry => entry.id === id && entry.published).length, 1);
  const found = filters.filterStudyProblems(data.problems, {
    query: topic.titleZh, courseId: topic.courseId, track: 'core', level: null, completion: 'all', completedIds: [],
  }, data.courses, data.topics).filter(problem => problem.topicId === id);
  assert.equal(found.length, 2, `Search must find both exercises: ${id}`);
  assert.ok(found.every(problem => problem.steps.length >= 2 && problem.hints.length && problem.source.kind === 'original'));
  return topic;
});
const state = { ...study.emptyStudyState, favoriteTopics: ['limits', ...ids], completedProblems: topics.flatMap(topic => topic.problemIds) };
assert.deepEqual(study.parseStudyBackup(study.createStudyBackup(state)).state, state);
assert.deepEqual(study.mergeStudyStates(state, state), state);
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
const answer = (course, key, n, fragment) => assert.ok(data.problemById(roadmap.roadmapTopicId(course, key) + '-exercise-' + n).answer.includes(fragment), `${key}: ${fragment}`);
const dot = (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0);
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
// Factorizations checked at distinct points; degrees bound the polynomial identities.
for (const x of [-3, -2, -1, 0, 1, 2, 3]) {
  near(x**4+4, (x*x-2*x+2)*(x*x+2*x+2));
  near(2*x**3-3*x*x-8*x+12, (2*x-3)*(x*x-4));
  near((x+1)**4+1, x**4+4*x**3+6*x*x+4*x+2);
}
answer('higher-algebra', 'irreducible', 2, '可约');
answer('higher-algebra', 'rational-roots', 1, '3/2');
answer('higher-algebra', 'eisenstein', 2, 'p=2');
for (const z of [-4, 0, 1, 3]) {
  const w = (2*z+1)/(z+1);
  near((w-1)/(2-w), z);
}
const cr = (z, a, b, c) => (z-a)*(b-c)/((z-c)*(b-a));
near(cr(4, 1, 2, 3), -3);
near(cr(1/4, 1, 1/2, 1/3), -3);
near((4/5)**2+(3/5)**2, 1);
answer('complex-analysis', 'cross-ratio', 2, '−3');
answer('complex-analysis', 'extended-plane', 1, '趋于无穷远点');
const u = [1, 2, 0], v = [0, 1, 3];
assert.deepEqual(cross(u, v), [6, -3, 1]);
near(dot(u, u)*dot(v, v)-dot(u, v)**2, 46);
near(dot([1,0,0], cross([1,2,0], [0,1,3])), 6);
assert.deepEqual([1+2, 2+2, 2], [3, 4, 2]);
assert.deepEqual([2*(1/4),2*(1/4)], [1/2,1/2]);
assert.deepEqual([2*(3/2),2*(1/2)], [3,1]);
near(-1+3/2+1/2, 1);
answer('analytic-geometry', 'affine-combination', 1, '(1/2,1/4,1/4)');
answer('analytic-geometry', 'affine-combination', 2, '不是凸组合');
answer('analytic-geometry', 'frames', 1, '(1,2,2)');
answer('analytic-geometry', 'gram-determinant', 1, '36');
// Enumerate the sigma-algebras from their atoms, independently of lesson prose.
const unions = atoms => Array.from({length: 2**atoms.length}, (_, mask) => atoms.reduce((set, atom, i) => mask & (1<<i) ? set | atom : set, 0));
assert.deepEqual([...new Set(unions([3,4]).map(set => set & 5))].sort((a,b)=>a-b), [0,1,4,5]);
const rectangles = unions([5,10]);
assert.equal(rectangles.length, 4);
assert.ok(!rectangles.includes(1));
assert.equal(unions([1,2,4,8]).length, 16);
near(.3*(-1)+.7*2, 1.1);
near(.3*1+.7*4-1.1**2, 1.89);
near([1,-2,3].reduce((sum,x)=>sum+x,0), 2);
near(Array.from({length:40},(_,i)=>2**(-i-1)).reduce((sum,x)=>sum+x,0), 1);
answer('measure-theory', 'trace', 1, '4');
answer('measure-theory', 'product-sigma', 1, '4');
answer('measure-theory', 'counting', 2, '1');
answer('measure-theory', 'dirac', 1, '1.89');
console.log(JSON.stringify({ status: 'passed', newTopics: topics.length, newProblems: topics.flatMap(topic=>topic.problemIds).length, scope: 'Search, published routes, synthetic backups and independent worked-example calculations; no real user storage' }, null, 2));
