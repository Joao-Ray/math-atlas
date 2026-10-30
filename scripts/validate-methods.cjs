// Pure method links, filters, navigation and quiz checks; never changes user data.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const previous = require.extensions['.ts'];
require.extensions['.ts'] = (mod, filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, filename);
let methods, limits;
try {
  methods = require('../data/limitMethods.ts');
  limits = require('../data/dailyLimits.ts');
} finally {
  if (previous) require.extensions['.ts'] = previous;
  else delete require.extensions['.ts'];
}
const { limitMethods, getLimitMethod, getMethodsForLimitProblem, getProblemsForLimitMethod,
  filterLimitPracticeItems, resolveLimitPracticeParams, gradeLimitMethodCheck } = methods;
const items = limits.dailyLimitBank.map((problem) => ({ problem, date: '2026-10-15' }));
const noFilters = { query: '', level: null, methodId: null };
let checks = 0;
function test(name, run) { try { run(); checks++; } catch (error) { error.message = name + ': ' + error.message; throw error; } }
test('all 42 questions have valid method links', () => {
  assert.equal(items.length, 42);
  items.forEach(({ problem }) => assert.ok(getMethodsForLimitProblem(problem.id).length));
  for (const method of limitMethods) for (const problem of getProblemsForLimitMethod(method.id)) {
    assert.ok(getMethodsForLimitProblem(problem.id).some((item) => item.id === method.id));
  }
});
test('invalid IDs do not crash lookups', () => {
  for (const id of ['missing', '__proto__', 'constructor', '']) {
    assert.equal(getLimitMethod(id), undefined);
    assert.deepEqual(getMethodsForLimitProblem(id), []);
    assert.deepEqual(getProblemsForLimitMethod(id), []);
  }
});
test('unfiltered results preserve order and extra row fields', () => {
  assert.deepEqual(filterLimitPracticeItems(items, noFilters), items);
  assert.ok(filterLimitPracticeItems(items, noFilters).every((item) => item.date === '2026-10-15'));
});
test('method, level and text filters combine', () => {
  const result = filterLimitPracticeItems(items, { query: '积分', level: '进阶挑战', methodId: 'integral' });
  assert.deepEqual(result.map((item) => item.problem.id), ['limit-integral-second-order']);
  assert.deepEqual(filterLimitPracticeItems(items, { query: '积分', level: '基础巩固', methodId: 'integral' }), []);
});
test('search includes methods even if not in question title', () => {
  const result = filterLimitPracticeItems(items, { ...noFilters, query: '  洛必达  ' });
  assert.ok(result.some((item) => item.problem.id === 'limit-lhopital-infinity'));
  assert.ok(result.every((item) => getMethodsForLimitProblem(item.problem.id).some((method) => method.id === 'lhopital')));
  assert.deepEqual(filterLimitPracticeItems(items, { ...noFilters, query: '<script>.*' }), []);
});
test('lesson practice links select only compatible known questions', () => {
  for (const method of limitMethods) {
    for (const problem of getProblemsForLimitMethod(method.id)) {
      assert.deepEqual(resolveLimitPracticeParams({ mode: 'bank', method: method.id, problem: problem.id }),
        { mode: 'bank', methodId: method.id, selected: 'bank:bank:' + problem.id });
    }
  }
  assert.equal(resolveLimitPracticeParams({ mode: 'bank', method: 'integral', problem: 'limit-factor' }).selected, null);
});
test('bad or repeated URL params degrade safely', () => {
  assert.deepEqual(resolveLimitPracticeParams({}), { mode: 'review', methodId: null, selected: null });
  assert.deepEqual(resolveLimitPracticeParams({ mode: 'invalid', method: '__proto__', problem: 'unknown' }),
    { mode: 'review', methodId: null, selected: null });
  assert.deepEqual(resolveLimitPracticeParams({ mode: ['bank', 'review'], method: ['algebra'], problem: ['limit-factor'] }),
    { mode: 'bank', methodId: 'algebra', selected: 'bank:bank:limit-factor' });
  assert.equal(resolveLimitPracticeParams({ mode: 'review', problem: 'limit-factor' }).selected, null);
});
test('unanswered checks cannot produce a final score', () => {
  for (const method of limitMethods) {
    assert.deepEqual(gradeLimitMethodCheck(method, {}), { complete: false, answered: 0, total: 2 });
    const partial = gradeLimitMethodCheck(method, { [method.checks[0].id]: false });
    assert.equal(partial.complete, false); assert.equal(partial.answered, 1);
    assert.ok(!Object.hasOwn(partial, 'correct'));
    assert.equal(gradeLimitMethodCheck(method, { [method.checks[0].id]: 'false' }).answered, 0);
  }
});
test('all boolean answer combinations score correctly', () => {
  for (const method of limitMethods) for (const a of [false, true]) for (const b of [false, true]) {
    const answers = { [method.checks[0].id]: a, [method.checks[1].id]: b };
    const before = JSON.stringify(answers);
    const result = gradeLimitMethodCheck(method, answers);
    assert.equal(result.complete, true);
    assert.equal(result.correct, Number(a === method.checks[0].answer) + Number(b === method.checks[1].answer));
    assert.equal(JSON.stringify(answers), before);
  }
});
test('false answers are valid answers, not blanks', () => {
  const method = getLimitMethod('algebra');
  assert.deepEqual(gradeLimitMethodCheck(method, { 'algebra-continuity': true, 'algebra-zero': false }),
    { complete: true, answered: 2, total: 2, correct: 2 });
});
test('filtering and lookups never mutate question order or schedule', () => {
  const before = JSON.stringify(limits.dailyLimitBank);
  limitMethods.forEach((method) => filterLimitPracticeItems(items, { ...noFilters, methodId: method.id }));
  assert.equal(JSON.stringify(limits.dailyLimitBank), before);
  assert.deepEqual(limits.getDailyLimitProblems('2026-10-09').map((item) => item.id),
    ['limit-rationalize', 'limit-tan-sin', 'limit-log-third-order']);
});
console.log(JSON.stringify({ methodChecks: checks, lessons: limitMethods.length,
  conceptChecks: limitMethods.reduce((sum, item) => sum + item.checks.length, 0), status: 'passed' }, null, 2));
