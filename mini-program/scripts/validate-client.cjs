// Pure storage/filter tests. Never touches real wx storage, account, or network.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const previous = require.extensions['.ts'];
require.extensions['.ts'] = (mod, filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, filename);
let createStudyStore, STORAGE_KEY, data, daily, study, filters, acceptance, release;
try {
  ({ createStudyStore, STORAGE_KEY } = require('../src/lib/storeCore.ts'));
  data = require('../../data/mockData.ts'); daily = require('../../data/dailyLimits.ts');
  study = require('../../data/studyState.ts'); filters = require('../../data/problemFilters.ts');
  acceptance = require('../src/lib/acceptance.ts'); release = require('../src/lib/release.ts');
} finally { if (previous) require.extensions['.ts'] = previous; else delete require.extensions['.ts']; }
let checks = 0;
function test(name, fn) { try { fn(); checks++; } catch (e) { e.message = name + ': ' + e.message; throw e; } }
function memory(raw = '') {
  const port = { value: raw, writes: 0, removes: 0, read() { return this.value; }, write(value) { this.value = value; this.writes++; }, remove() { this.value = ''; this.removes++; } };
  return { port, store: createStudyStore({ read: () => port.read(), write: (value) => port.write(value), remove: () => port.remove() }) };
}
const params = { query: '', track: 'competition', courseId: null, level: null, completion: 'all', completedIds: [] };
const select = (extra) => filters.filterStudyProblems(data.problems, { ...params, ...extra }, data.courses, data.topics);
test('content counts and unified competition IDs match the Expo source', () => {
  assert.equal(data.topics.length, 305); assert.equal(data.formulas.length, 321); assert.equal(data.problems.length, 1108);
  assert.equal(data.papers.length, 16); assert.equal(daily.dailyLimitBank.length, 42);
  assert.equal(select({}).length, 20); assert.equal(select({ competitionSource: 'past-paper' }).length, 12);
  assert.equal(select({ competitionSource: 'competition-style' }).length, 8);
  assert.equal(select({ competitionSource: 'past-paper', paper: '非数学 A 类' }).length, 8);
  assert.equal(select({ competitionSource: 'past-paper', paper: '非数学 B 类' }).length, 6);
  assert.equal(select({ track: 'practice' }).length, 18);
});
test('client storage is isolated and empty state does not write on startup', () => {
  assert.equal(STORAGE_KEY, 'lemivanta:study:v1');
  const { store, port } = memory(); assert.deepEqual(store.getSnapshot().state, study.emptyStudyState);
  assert.equal(port.writes, 0); assert.equal(store.getSnapshot().error, null);
});
test('favorites and completion persist once and survive a new store', () => {
  const { store, port } = memory(); let events = 0;
  const unsubscribe = store.subscribe(() => events++);
  store.toggleTopic('limits'); store.toggleFormula('chain-rule'); store.toggleProblem('cmc17-a-fill-1');
  assert.equal(events, 3); assert.equal(port.writes, 3); unsubscribe();
  const restored = memory(port.value).store.getSnapshot().state;
  assert.deepEqual(restored.favoriteTopics, ['limits']); assert.deepEqual(restored.completedProblems, ['cmc17-a-fill-1']);
  store.toggleTopic('limits'); assert.deepEqual(store.getSnapshot().state.favoriteTopics, []); assert.equal(events, 3);
});
test('invalid IDs cannot mutate storage', () => {
  const { store, port } = memory();
  assert.throws(() => store.toggleTopic('not-found')); assert.throws(() => store.toggleFormula('__proto__'));
  assert.throws(() => store.toggleProblem('not-found')); assert.equal(port.writes, 0);
});
test('corrupt read is protected, export and mutations cannot erase it', () => {
  const { store, port } = memory('{broken');
  assert.ok(store.getSnapshot().error); assert.throws(() => store.toggleTopic('limits')); assert.throws(() => store.exportBackup());
  assert.equal(port.value, '{broken'); assert.equal(port.writes, 0);
});
test('storage exceptions keep the last successful snapshot and surface failure', () => {
  let fail = false, value = '';
  const store = createStudyStore({ read: () => value, write: (next) => { if (fail) throw new Error('quota'); value = next; }, remove() {} });
  store.toggleTopic('limits'); fail = true;
  assert.throws(() => store.toggleTopic('fatou-lemma'));
  assert.deepEqual(store.getSnapshot().state.favoriteTopics, ['limits']); assert.ok(store.getSnapshot().error);
  fail = false; store.toggleTopic('fatou-lemma'); assert.equal(store.getSnapshot().error, null);
});
test('daily drafts persist, truncate at 1000, and self-assessment requires reveal', () => {
  const { store, port } = memory(), date = '2026-10-16', id = daily.getDailyLimitProblems(date)[0].id;
  store.updateDaily(date, id, { draft: 'x'.repeat(1200) });
  assert.equal(store.getSnapshot().state.dailyLimitRecords[date][id].draft.length, 1000);
  assert.throws(() => store.updateDaily(date, id, { result: 'correct' }));
  store.updateDaily(date, id, { revealed: true }); store.updateDaily(date, id, { result: 'review' });
  assert.equal(memory(port.value).store.getSnapshot().state.dailyLimitRecords[date][id].result, 'review');
  assert.deepEqual(daily.getDailyLimitSummary(store.getSnapshot().state.dailyLimitRecords, date), { assessed: 1, correct: 0, review: 1 });
});
test('wrong date and unassigned daily question cannot be stored', () => {
  const { store, port } = memory(); assert.throws(() => store.updateDaily('2026-02-30', 'limit-factor', {}));
  assert.throws(() => store.updateDaily('2026-10-16', 'not-found', { revealed: true })); assert.equal(port.writes, 0);
});
test('MathAtlas backups preview without mutation and merge preserves local conflicts', () => {
  const { store, port } = memory(), date = '2026-10-16', id = daily.getDailyLimitProblems(date)[0].id;
  store.updateDaily(date, id, { draft: 'local' }); store.toggleTopic('limits');
  const remote = { ...study.emptyStudyState, favoriteTopics: ['fatou-lemma'], completedProblems: ['mvt-log-bounds'], dailyLimitRecords: { [date]: { [id]: { draft: 'incoming', revealed: true, result: 'correct' } } }, practiceDrafts: { 'bank:limit-factor': 'old client draft' } };
  const backup = study.createStudyBackup(remote), before = port.writes;
  assert.equal(store.previewBackup(backup).state.favoriteTopics[0], 'fatou-lemma'); assert.equal(port.writes, before);
  store.restoreBackup(backup);
  const state = store.getSnapshot().state;
  assert.deepEqual(state.favoriteTopics, ['limits', 'fatou-lemma']); assert.equal(state.dailyLimitRecords[date][id].draft, 'local');
  assert.equal(state.practiceDrafts['bank:limit-factor'], 'old client draft');
  const snapshot = JSON.stringify(state); store.restoreBackup(backup); assert.equal(JSON.stringify(store.getSnapshot().state), snapshot);
  assert.deepEqual(study.parseStudyBackup(store.exportBackup()).state, state);
});
test('bad backups leave memory and storage untouched', () => {
  const { store, port } = memory(); store.toggleTopic('limits'); const before = port.value;
  for (const text of ['invalid', '{}', JSON.stringify({ app: 'Other', schemaVersion: 1, state: {} })]) assert.throws(() => store.restoreBackup(text));
  assert.equal(port.value, before); assert.deepEqual(store.getSnapshot().state.favoriteTopics, ['limits']);
});
test('explicit reset removes only its storage port and can recover a broken read', () => {
  const { store, port } = memory('{broken'); store.getSnapshot(); store.reset();
  assert.equal(port.removes, 1); assert.equal(port.writes, 0); assert.equal(store.getSnapshot().error, null);
  assert.deepEqual(store.getSnapshot().state, study.emptyStudyState); store.toggleTopic('limits'); assert.equal(port.writes, 1);
});
test('review completes the original attempt without creating a new practice day or losing its draft', () => {
  const { store, port } = memory(), date = '2026-10-15', today = '2026-10-16', id = daily.getDailyLimitProblems(date)[0].id;
  store.updateDaily(date, id, { draft: '原解题思路', revealed: true, result: 'review' });
  assert.equal(daily.getLimitReviewItems(store.getSnapshot().state.dailyLimitRecords, today).length, 1);
  store.updateDaily(date, id, { revealed: true, result: 'correct' });
  const restored = memory(port.value).store.getSnapshot().state;
  assert.equal(daily.getLimitReviewItems(restored.dailyLimitRecords, today).length, 0);
  assert.equal(restored.dailyLimitRecords[date][id].draft, '原解题思路');
  assert.equal(restored.dailyLimitRecords[today], undefined);
  assert.equal(daily.getDailyLimitSummary(restored.dailyLimitRecords, today).assessed, 0);
});
test('acceptance starts pending and simulator checks never become phone acceptance', () => {
  assert.equal(new Set(acceptance.acceptanceCases.map((item) => item.id)).size, 8);
  assert.deepEqual(acceptance.summarizeAcceptance({}, 'ios'), { passed: 0, failed: 0, pending: 8, phone: true, complete: false });
  const passed = Object.fromEntries(acceptance.acceptanceCases.map((item) => [item.id, 'pass']));
  for (const platform of ['unknown', 'devtools', 'windows', 'mac']) assert.equal(acceptance.summarizeAcceptance(passed, platform).complete, false);
  assert.equal(acceptance.summarizeAcceptance(passed, 'android').complete, true);
  assert.equal(acceptance.summarizeAcceptance({ ...passed, formulas: 'fail' }, 'ios').complete, false);
});
test('acceptance report names the build, does not imply review approval, and omits extra device fields', () => {
  const pkg = JSON.parse(fs.readFileSync(require('node:path').resolve(__dirname, '../package.json'), 'utf8'));
  assert.equal(pkg.version, release.CLIENT_VERSION);
  const device = { platform: 'devtools', model: 'simulator', system: 'test', wechat: 'test', sdk: 'test', viewport: '375 × 812', account: 'DO_NOT_INCLUDE_ACCOUNT', uuid: 'DO_NOT_INCLUDE_UUID' };
  const report = acceptance.acceptanceReport({}, device, 'x'.repeat(1500), '2026-10-16T12:00:00.000Z');
  assert.ok(report.includes(release.CLIENT_BUILD)); assert.ok(report.includes('真机验收尚未完成'));
  assert.ok(report.includes('模拟器勾选不能视为真机通过'));
  assert.ok(!report.includes(device.account)); assert.ok(!report.includes(device.uuid));
  assert.ok(report.includes('x'.repeat(1200))); assert.ok(!report.includes('x'.repeat(1201)));
});
console.log(JSON.stringify({ clientChecks: checks, status: 'passed', scope: 'Offline pure logic; not a WeChat simulator or phone test.' }, null, 2));
