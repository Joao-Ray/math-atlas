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
try {
  data = require('../data/mockData.ts');
  ({ formulaDerivations } = require('../data/formulaDerivations.ts'));
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
];
for (const latex of expressions) {
  try { check(!adaptor.innerHTML(doc.convert(latex, { display: false })).includes('data-mjx-error'), `Invalid TeX: ${latex}`); }
  catch (error) { issues.push(`TeX conversion failed: ${latex}: ${error.message}`); }
}

assert.equal(issues.length, 0, issues.join('\n'));
console.log(JSON.stringify({
  courses: courses.length, topics: topics.length, formulas: formulas.length, problems: problems.length,
  papers: papers.length, proofs: formulas.filter((item) => item.derivation?.length).length,
  latexChecked: expressions.length, status: 'passed',
}, null, 2));
