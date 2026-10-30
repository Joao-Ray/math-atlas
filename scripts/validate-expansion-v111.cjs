// Release integration and in-memory backup checks; mathematics is checked in the two focused suites.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const previous = require.extensions['.ts'];
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, f);
let data, stats, processData, roadmap, study, filters;
try {
  data = require('../data/mockData.ts');
  stats = require('../data/statisticsExpansionV111.ts');
  processData = require('../data/stochasticExpansionV111.ts');
  roadmap = require('../data/curriculumRoadmap.ts');
  study = require('../data/studyState.ts');
  filters = require('../data/problemFilters.ts');
} finally {
  if (previous) require.extensions['.ts'] = previous;
  else delete require.extensions['.ts'];
}
const topics = [...stats.statisticsV111Topics, ...processData.stochasticV111Topics];
const formulas = [...stats.statisticsV111Formulas, ...processData.stochasticV111Formulas];
const problems = [...stats.statisticsV111Problems, ...processData.stochasticV111Problems];
assert.equal(topics.length, 18);
assert.equal(formulas.length, 18);
assert.equal(problems.length, 36);
assert.deepEqual([data.topics.length, data.formulas.length, data.problems.length], [305, 321, 1108]);
assert.equal(roadmap.getRoadmapSummary('statistics', data.topics).published, 33);
assert.equal(roadmap.getRoadmapSummary('stochastic-process', data.topics).published, 38);

const entries = data.courses.flatMap(course => roadmap.getCourseRoadmap(course.id, data.topics).flatMap(chapter => chapter.entries));
assert.equal(entries.length, 700);
assert.equal(entries.filter(entry => !entry.published).length, 395);
for (const course of ['calculus', 'linear-algebra', 'probability', 'statistics', 'stochastic-process']) {
  const chapter = roadmap.getCourseRoadmap(course, data.topics)[0];
  assert.equal(chapter.entries.length, 10);
  assert.ok(chapter.entries.every(entry => entry.published));
}
const options = { query: '', track: 'core', courseId: null, level: null, completion: 'all', completedIds: [] };
for (const topic of topics) {
  assert.equal(data.topicById(topic.id), topic);
  assert.equal(topic.problemIds.length, 2);
  assert.equal(topic.formulaIds.length, 1);
  assert.ok(topic.learningNotes.length >= 2);
  assert.equal(entries.filter(entry => entry.id === topic.id && entry.published).length, 1);
  const found = filters.filterStudyProblems(data.problems, { ...options, query: topic.titleZh, courseId: topic.courseId }, data.courses, data.topics);
  assert.equal(found.filter(problem => problem.topicId === topic.id).length, 2);
}
for (const problem of problems) {
  assert.equal(problem.source.kind, 'original');
  assert.ok(problem.hints.length > 0 && problem.steps.length >= 2);
}
const state = {
  ...study.emptyStudyState,
  favoriteTopics: ['limits', ...topics.map(topic => topic.id)],
  favoriteFormulas: ['chain-rule', ...formulas.map(formula => formula.id)],
  completedProblems: ['cmc17-a-fill-1', ...problems.map(problem => problem.id)],
};
const backup = study.createStudyBackup(state);
assert.equal(JSON.parse(backup).schemaVersion, 1);
assert.deepEqual(study.parseStudyBackup(backup).state, state);
assert.deepEqual(study.mergeStudyStates(state, state), state);
console.log(JSON.stringify({
  status: 'passed', published: 305, formulas: 321, problems: 1108, target: 700, remaining: 395,
  newTopics: 18, newProblems: 36, fullyCoveredFirstChapters: 5,
  scope: 'Release integration, searches and synthetic backups; no real user storage',
}, null, 2));
require('./validate-statistics-v111.cjs');
require('./validate-stochastic-v111.cjs');
