// Offline content validation: no network or application writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

// Only the data modules are loaded through this temporary TypeScript hook.
const originalLoader = require.extensions['.ts'];
require.extensions['.ts'] = (mod, filename) => {
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  mod._compile(source, filename);
};
let data;
let formulaDerivations;
let dailyLimits;
let methodData;
try {
  data = require('../data/mockData.ts');
  ({ formulaDerivations } = require('../data/formulaDerivations.ts'));
  dailyLimits = require('../data/dailyLimits.ts');
  methodData = require('../data/limitMethods.ts');
} finally {
  if (originalLoader) require.extensions['.ts'] = originalLoader;
  else delete require.extensions['.ts'];
}

const { courses, topics, formulas, problems, papers } = data;
const courseIds = new Set(courses.map((item) => item.id));
const topicMap = new Map(topics.map((item) => [item.id, item]));
const formulaMap = new Map(formulas.map((item) => [item.id, item]));
const problemMap = new Map(problems.map((item) => [item.id, item]));
const issues = [];
const check = (condition, message) => { if (!condition) issues.push(message); };
const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;
const { dailyLimitBank, dailyLimitRotationDays, limitLevels, getLocalDateKey, getDailyLimitProblems, getDailyLimitSummary, getLimitReviewItems, normalizeDailyLimitRecords } = dailyLimits;
const { limitMethods, limitProblemMethods, getProblemsForLimitMethod } = methodData;

check(limitMethods.length === 9, 'Limit methods: expected nine lessons');
const methodIds = new Set(limitMethods.map((item) => item.id));
check(methodIds.size === limitMethods.length, 'Limit methods: duplicate lesson IDs');
const limitIds = new Set(dailyLimitBank.map((item) => item.id));
const checkIds = [];
for (const method of limitMethods) {
  for (const field of ['id', 'title', 'shortTitle', 'summary', 'conditions']) check(nonempty(method[field]), method.id + ': missing ' + field);
  check(method.steps.length >= 3 && method.pitfalls.length >= 2 && method.checks.length === 2, method.id + ': incomplete lesson');
  method.steps.forEach((step) => check(nonempty(step.title) && nonempty(step.body), method.id + ': incomplete step'));
  method.pitfalls.forEach((tip) => check(nonempty(tip), method.id + ': empty pitfall'));
  check(getProblemsForLimitMethod(method.id).length > 0, method.id + ': no related practice');
  for (const item of method.checks) {
    checkIds.push(item.id);
    check(nonempty(item.statement) && nonempty(item.explanation) && typeof item.answer === 'boolean', method.id + ': incomplete check');
  }
}
check(new Set(checkIds).size === checkIds.length, 'Limit methods: duplicate concept check IDs');
check(Object.keys(limitProblemMethods).length === dailyLimitBank.length, 'Limit methods: all practice questions need links');
for (const [id, linked] of Object.entries(limitProblemMethods)) {
  check(limitIds.has(id) && linked.length > 0 && linked.every((method) => methodIds.has(method)), id + ': invalid method link');
  check(new Set(linked).size === linked.length, id + ': duplicate method link');
}

check(dailyLimitBank.length === 42, 'Daily limits: expected a 42-question bank');
check(new Set(dailyLimitBank.map((item) => item.id)).size === dailyLimitBank.length, 'Daily limits: duplicate IDs');
for (const level of limitLevels) check(dailyLimitBank.filter((item) => item.level === level).length === dailyLimitRotationDays, `Daily limits: ${level} needs fourteen questions`);
for (const problem of dailyLimitBank) {
  check(nonempty(problem.title) && nonempty(problem.hint) && nonempty(problem.answer), `${problem.id}: incomplete daily problem`);
  check(limitLevels.includes(problem.level) && problem.steps.length >= 2, `${problem.id}: invalid daily level/steps`);
  for (const step of problem.steps) check(nonempty(step.title) && nonempty(step.body), `${problem.id}: incomplete daily step`);
}
const rotationIds = [];
for (let day = 10; day < 10 + dailyLimitRotationDays; day++) {
  const key = `2026-10-${String(day).padStart(2, '0')}`;
  const selected = getDailyLimitProblems(key);
  assert.deepEqual(selected.map((item) => item.level), limitLevels);
  assert.deepEqual(getDailyLimitProblems(key), selected, 'Same day must be deterministic');
  rotationIds.push(...selected.map((item) => item.id));
}
assert.equal(new Set(rotationIds).size, 42, 'No repeat within the fourteen-day rotation');
assert.deepEqual(getDailyLimitProblems('2026-10-10'), getDailyLimitProblems('2026-10-24'));
assert.deepEqual(getDailyLimitProblems('2026-10-09').map((item) => item.id),
  ['limit-rationalize', 'limit-tan-sin', 'limit-log-third-order'], 'Keep the original release day assignments');
assert.deepEqual(getDailyLimitProblems('2026-10-02'), getDailyLimitProblems('2026-10-09'), 'Keep legacy seven-day schedule');
const legacyIds = Array.from({ length: 7 }, (_, index) => getDailyLimitProblems(`2026-10-0${index + 2}`)).flat();
assert.equal(new Set(legacyIds.map((item) => item.id)).size, 21);
for (const invalid of ['2026-02-30', '2026-2-03', '', 'not-a-date']) assert.throws(() => getDailyLimitProblems(invalid));
for (const valid of ['2028-02-29', '2026-12-31', '2027-01-01']) assert.equal(getDailyLimitProblems(valid).length, 3);
assert.equal(getLocalDateKey(new Date(2026, 9, 9, 23, 59)), '2026-10-09', 'Use local rather than UTC date');
assert.equal(getLocalDateKey(new Date(2026, 9, 10, 0, 1)), '2026-10-10');
assert.deepEqual(normalizeDailyLimitRecords(undefined), {}, 'Old saved state should migrate to empty daily records');
const dailyIds = getDailyLimitProblems('2026-10-09').map((item) => item.id);
const fixture = { '2026-10-09': {
  [dailyIds[0]]: { draft: 'test answer', revealed: true, result: 'correct' },
  [dailyIds[1]]: { draft: 'test steps', revealed: true, result: 'review' },
  [dailyIds[2]]: { draft: 'unfinished', revealed: false, result: null },
} };
assert.deepEqual(normalizeDailyLimitRecords(JSON.parse(JSON.stringify(fixture))), fixture, 'Restore drafts and self-assessments');
assert.deepEqual(getDailyLimitSummary(fixture, '2026-10-09'), { assessed: 2, correct: 1, review: 1 });
assert.deepEqual(getDailyLimitSummary(fixture, '2026-10-10'), { assessed: 0, correct: 0, review: 0 }, 'Do not carry yesterday scores into today');
assert.deepEqual(normalizeDailyLimitRecords({ bad: {}, '2026-10-09': [] }), {});
const hiddenGrade = normalizeDailyLimitRecords({ '2026-10-09': { [dailyIds[0]]: { draft: 42, revealed: false, result: 'correct' } } });
assert.equal(hiddenGrade['2026-10-09'][dailyIds[0]].draft, '');
assert.equal(hiddenGrade['2026-10-09'][dailyIds[0]].result, null, 'Cannot restore a grade with hidden solution');
const snapshot = JSON.stringify(fixture);
assert.deepEqual(getLimitReviewItems(fixture, '2026-10-09').map(({ date, problem }) => [date, problem.id]),
  [['2026-10-09', dailyIds[1]]], 'Only review-marked records appear');
assert.equal(JSON.stringify(fixture), snapshot, 'Reading review items must not change original drafts');
assert.deepEqual(getLimitReviewItems(fixture, '2026-10-08'), [], 'Do not include future records');
const reviewed = { '2026-10-09': { ...fixture['2026-10-09'], [dailyIds[1]]: { ...fixture['2026-10-09'][dailyIds[1]], result: 'correct' } } };
assert.deepEqual(getLimitReviewItems(reviewed, '2026-10-09'), [], 'Mastered records leave review queue');
assert.equal(reviewed['2026-10-09'][dailyIds[1]].draft, 'test steps', 'Keep original draft after changing self-assessment');
assert.deepEqual(getDailyLimitSummary(reviewed, '2026-10-09'), { assessed: 2, correct: 2, review: 0 });
const repeatedReview = { '2026-10-09': fixture['2026-10-09'], '2026-10-02': fixture['2026-10-09'], bad: fixture['2026-10-09'] };
assert.deepEqual(getLimitReviewItems(repeatedReview, '2026-10-09').map((item) => item.date), ['2026-10-02', '2026-10-09'], 'Review repeated questions by original date, oldest first');
assert.deepEqual(getLimitReviewItems({ '2026-10-09': { unknown: { revealed: true, result: 'review', draft: '' } } }, '2026-10-09'), []);

for (const [name, items] of Object.entries({ courses, topics, formulas, problems, papers })) {
  check(new Set(items.map((item) => item.id)).size === items.length, `${name}: duplicate IDs`);
  for (const item of items) check(nonempty(item.id), `${name}: empty ID`);
}
for (const topic of topics) {
  check(courseIds.has(topic.courseId), `${topic.id}: unknown course`);
  for (const field of ['title', 'titleZh', 'summary', 'definition', 'intuition']) {
    check(nonempty(topic[field]), `${topic.id}: missing ${field}`);
  }
  for (const [field, map] of [['formulaIds', formulaMap], ['problemIds', problemMap]]) {
    const ids = topic[field];
    check(ids.length > 0, `${topic.id}: no ${field}`);
    check(new Set(ids).size === ids.length, `${topic.id}: duplicate ${field}`);
    for (const id of ids) {
      const item = map.get(id);
      check(item?.topicId === topic.id && item?.courseId === topic.courseId, `${topic.id}: invalid ${field} ${id}`);
    }
  }
  for (const prerequisite of topic.prerequisites) {
    check(topicMap.has(prerequisite) || ['函数', '不等式', '集合'].includes(prerequisite), `${topic.id}: unknown prerequisite ${prerequisite}`);
  }
  for (const note of topic.learningNotes ?? []) check(nonempty(note), `${topic.id}: empty note`);
}

// Prerequisite graphs should remain usable as forward learning paths.
const visited = new Set();
const visiting = new Set();
function visit(id) {
  if (visiting.has(id)) { issues.push(`Prerequisite cycle at ${id}`); return; }
  if (visited.has(id)) return;
  visiting.add(id);
  for (const prerequisite of topicMap.get(id).prerequisites) if (topicMap.has(prerequisite)) visit(prerequisite);
  visiting.delete(id);
  visited.add(id);
}
for (const topic of topics) visit(topic.id);

for (const [items, backlink] of [[formulas, 'formulaIds'], [problems, 'problemIds']]) {
  for (const item of items) {
    const topic = topicMap.get(item.topicId);
    check(topic?.courseId === item.courseId && topic?.[backlink].includes(item.id), `${item.id}: missing topic backlink`);
  }
}
for (const formula of formulas) {
  check(nonempty(formula.explanation) && nonempty(formula.latex), `${formula.id}: incomplete formula`);
  for (const step of formula.derivation ?? []) check(nonempty(step.title) && nonempty(step.body), `${formula.id}: incomplete proof step`);
}
for (const id of Object.keys(formulaDerivations)) check(formulaMap.has(id), `Proof for unknown formula: ${id}`);
for (const problem of problems) {
  check(Number.isInteger(problem.difficulty) && problem.difficulty >= 1 && problem.difficulty <= 5, `${problem.id}: invalid difficulty`);
  check(nonempty(problem.prompt) && nonempty(problem.answer), `${problem.id}: incomplete prompt/answer`);
  check(problem.steps.length >= 2 && problem.hints.length > 0, `${problem.id}: incomplete explanation`);
  for (const step of problem.steps) check(nonempty(step.title) && nonempty(step.body), `${problem.id}: incomplete solution step`);
}
const paperUrls = new Set();
for (const paper of papers) {
  check(!paperUrls.has(paper.url), `${paper.id}: duplicate paper URL`);
  paperUrls.add(paper.url);
  check(/^https:\/\/arxiv\.org\/abs\/\d{4}\.\d{4,5}$/.test(paper.url), `${paper.id}: invalid arXiv URL`);
  check(paper.url.endsWith(paper.source.replace('arXiv:', '')), `${paper.id}: source/URL mismatch`);
  const date = new Date(`${paper.publishedAt}T00:00:00Z`);
  check(!Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === paper.publishedAt, `${paper.id}: invalid date`);
  for (const field of ['title', 'authors', 'abstract', 'readingGuide']) check(nonempty(paper[field]), `${paper.id}: missing ${field}`);
  check(paper.topicIds.length > 0 && paper.topicIds.every((id) => topicMap.has(id)), `${paper.id}: invalid related topics`);
}

// Use exactly the same TeX packages as the web renderer to detect unsupported commands.
const root = 'react-native-mathjax-html-to-svg/mathjax/';
const { mathjax } = require(root + 'mathjax');
const { TeX } = require(root + 'input/tex');
const { SVG } = require(root + 'output/svg');
const { liteAdaptor } = require(root + 'adaptors/liteAdaptor');
const { RegisterHTMLHandler } = require(root + 'handlers/html');
require(root + 'input/tex/ams/AmsConfiguration');
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const doc = mathjax.document('', { InputJax: new TeX({ packages: ['base', 'ams'] }), OutputJax: new SVG({ fontCache: 'none' }) });
const expressions = [
  ...formulas.flatMap((item) => [item.latex, ...(item.derivation ?? []).map((step) => step.latex).filter(Boolean)]),
  ...problems.flatMap((item) => [...item.formulas, ...item.steps.map((step) => step.latex).filter(Boolean)]),
  ...dailyLimitBank.flatMap((item) => [item.expression, ...item.steps.map((step) => step.latex).filter(Boolean)]),
  ...limitMethods.flatMap((item) => [...item.steps, ...item.checks].map((part) => part.latex).filter(Boolean)),
];
for (const latex of expressions) {
  try { check(!adaptor.innerHTML(doc.convert(latex, { display: false })).includes('data-mjx-error'), `Invalid TeX: ${latex}`); }
  catch (error) { issues.push(`TeX conversion failed: ${latex}: ${error.message}`); }
}

assert.equal(issues.length, 0, issues.join('\n'));
console.log(JSON.stringify({
  courses: courses.length, topics: topics.length, formulas: formulas.length, problems: problems.length,
  papers: papers.length, proofs: formulas.filter((item) => item.derivation?.length).length,
  dailyLimits: dailyLimitBank.length, dailyRotationDays: dailyLimitRotationDays, latexChecked: expressions.length, status: 'passed',
  limitMethodLessons: limitMethods.length, conceptChecks: checkIds.length,
}, null, 2));
