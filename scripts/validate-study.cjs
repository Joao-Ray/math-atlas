// Pure migration, backup, merge and calendar checks; never touches user storage.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const previousLoader = require.extensions['.ts'];
require.extensions['.ts'] = (mod, filename) => {
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  mod._compile(source, filename);
};
let study, limits, data;
try {
  study = require('../data/studyState.ts');
  limits = require('../data/dailyLimits.ts');
  data = require('../data/mockData.ts');
} finally {
  if (previousLoader) require.extensions['.ts'] = previousLoader;
  else delete require.extensions['.ts'];
}
const { normalizeStudyState, mergeStudyStates, createStudyBackup, parseStudyBackup,
  getPracticeDraftKey, getPracticeStats, shiftStudyDate, summarizeStudyState, emptyStudyState } = study;
let checks = 0;
function test(name, action) { try { action(); checks++; } catch (error) { error.message = `${name}: ${error.message}`; throw error; } }
const today = '2026-10-15';
const dailyId = limits.getDailyLimitProblems(today)[0].id;
const attempt = (draft = 'original', result = 'review') => ({ draft, revealed: true, result });
const base = {
  favoriteTopics: [data.topics[0].id], favoriteFormulas: [data.formulas[0].id], completedProblems: [data.problems[0].id],
  dailyLimitRecords: { [today]: { [dailyId]: attempt() } },
  practiceDrafts: { [getPracticeDraftKey(dailyId)]: 'free draft', [getPracticeDraftKey(dailyId, today)]: 'review draft' },
};
test('old saved state migration keeps all existing records', () => {
  const { practiceDrafts, ...legacy } = base;
  assert.deepEqual(normalizeStudyState(legacy), { ...legacy, practiceDrafts: {} });
});
test('invalid local state normalizes without throwing', () => {
  for (const value of [null, [], 4, 'bad', undefined]) assert.deepEqual(normalizeStudyState(value), emptyStudyState);
  assert.deepEqual(normalizeStudyState({ favoriteTopics: [data.topics[0].id, data.topics[0].id, 'unknown', 42] }).favoriteTopics, [data.topics[0].id]);
});
test('draft key scopes bank and dated review independently', () => {
  assert.notEqual(getPracticeDraftKey(dailyId), getPracticeDraftKey(dailyId, today));
  assert.notEqual(getPracticeDraftKey(dailyId, today), getPracticeDraftKey(dailyId, '2026-10-14'));
  assert.deepEqual(normalizeStudyState(base), base);
});
test('invalid drafts are ignored and long drafts capped', () => {
  const drafts = { bad: 'text', 'bank:unknown': 'text', [`review:2026-02-30:${dailyId}`]: 'text',
    [getPracticeDraftKey(dailyId)]: 'a'.repeat(1001), [getPracticeDraftKey(dailyId, today)]: 5 };
  assert.deepEqual(normalizeStudyState({ practiceDrafts: drafts }).practiceDrafts, { [getPracticeDraftKey(dailyId)]: 'a'.repeat(1000) });
});
test('backup round trip preserves all records and draft scopes', () => {
  const restored = parseStudyBackup(createStudyBackup(base, '2026-10-15T04:00:00.000Z'));
  assert.deepEqual(restored.state, base);
  assert.equal(restored.exportedAt, '2026-10-15T04:00:00.000Z');
  assert.deepEqual(summarizeStudyState(restored.state), { favorites: 2, completed: 1, dailyAttempts: 1, drafts: 2 });
});
const backupObject = () => JSON.parse(createStudyBackup(base));
test('invalid JSON, shape and incompatible versions rejected', () => {
  for (const invalid of ['{', 'null', '[]', '{}', JSON.stringify({ app: 'Other', schemaVersion: 1 }),
    JSON.stringify({ ...backupObject(), schemaVersion: 2 }), JSON.stringify({ ...backupObject(), exportedAt: 'bad' })]) {
    assert.throws(() => parseStudyBackup(invalid));
  }
});
test('backup bounds reject oversized input without parsing', () => {
  assert.throws(() => parseStudyBackup(' '.repeat(2_000_001)), /200 万/);
  assert.throws(() => createStudyBackup({ ...base, practiceDrafts: { large: 'x'.repeat(2_000_001) } }), /200 万/);
});
test('invalid IDs, dates, grades and draft lengths rejected', () => {
  const mutations = [
    (s) => { s.favoriteTopics = ['unknown']; }, (s) => { s.completedProblems = null; },
    (s) => { s.dailyLimitRecords['2026-02-30'] = {}; },
    (s) => { s.dailyLimitRecords[today][dailyId].draft = 42; },
    (s) => { s.dailyLimitRecords[today][dailyId].draft = 'x'.repeat(1001); },
    (s) => { s.dailyLimitRecords[today][dailyId].result = 'automatic-pass'; },
    (s) => { s.dailyLimitRecords[today][dailyId].revealed = false; },
    (s) => { s.practiceDrafts = { unknown: 'draft' }; },
    (s) => { s.practiceDrafts = { [getPracticeDraftKey(dailyId)]: 'x'.repeat(1001) }; },
    (s) => { s.dailyLimitRecords[today].unknown = attempt(); },
  ];
  mutations.forEach((mutate) => { const backup = backupObject(); mutate(backup.state); assert.throws(() => parseStudyBackup(JSON.stringify(backup))); });
});
test('backup without new drafts field remains compatible', () => {
  const backup = backupObject(); delete backup.state.practiceDrafts;
  assert.deepEqual(parseStudyBackup(JSON.stringify(backup)).state.practiceDrafts, {});
});
test('merge preserves local same-question answer and self-evaluation', () => {
  const incoming = structuredClone(base);
  incoming.dailyLimitRecords[today][dailyId] = attempt('incoming answer', 'correct');
  incoming.practiceDrafts[getPracticeDraftKey(dailyId)] = 'incoming draft';
  incoming.favoriteTopics.push(data.topics[1].id);
  const extraId = limits.getDailyLimitProblems(today)[1].id;
  incoming.dailyLimitRecords[today][extraId] = attempt('new imported answer');
  const snapshot = JSON.stringify([base, incoming]);
  const merged = mergeStudyStates(base, incoming);
  assert.equal(merged.dailyLimitRecords[today][dailyId].draft, 'original');
  assert.equal(merged.dailyLimitRecords[today][dailyId].result, 'review');
  assert.equal(merged.practiceDrafts[getPracticeDraftKey(dailyId)], 'free draft');
  assert.equal(merged.dailyLimitRecords[today][extraId].draft, 'new imported answer');
  assert.deepEqual(merged.favoriteTopics, [data.topics[0].id, data.topics[1].id]);
  assert.equal(JSON.stringify([base, incoming]), snapshot, 'Do not mutate either input');
  assert.deepEqual(mergeStudyStates(merged, incoming), merged, 'Repeated imports are idempotent');
});
test('even a blank local answer wins over imported answer', () => {
  const current = { ...base, dailyLimitRecords: { [today]: { [dailyId]: { draft: '', revealed: false, result: null } } } };
  assert.equal(mergeStudyStates(current, base).dailyLimitRecords[today][dailyId].draft, '');
});
function recordsFor(dates) {
  return Object.fromEntries(dates.map((date) => [date, { [limits.getDailyLimitProblems(date)[0].id]: attempt() }]));
}
test('empty calendar has 28 unique consecutive days ending today', () => {
  const stats = getPracticeStats({}, today);
  assert.equal(stats.currentStreak, 0); assert.equal(stats.longestStreak, 0); assert.equal(stats.activeDays, 0);
  assert.equal(stats.calendar.length, 28); assert.equal(new Set(stats.calendar.map((day) => day.date)).size, 28);
  assert.equal(stats.calendar[0].date, '2026-09-18'); assert.equal(stats.calendar.at(-1).date, today);
});
test('draft-only and revealed-only days do not count', () => {
  const records = { [today]: { [dailyId]: { draft: 'attempt', revealed: true, result: null } } };
  assert.equal(getPracticeStats(records, today).activeDays, 0);
});
test('current streak allows today still in progress', () => {
  const stats = getPracticeStats(recordsFor(['2026-10-12', '2026-10-13', '2026-10-14']), today);
  assert.equal(stats.currentStreak, 3); assert.equal(stats.longestStreak, 3);
  assert.equal(stats.activeDays, 3);
});
test('gap ends streak but longest remains', () => {
  const stats = getPracticeStats(recordsFor(['2026-10-10', '2026-10-11', '2026-10-12', today, '2026-10-16']), today);
  assert.equal(stats.currentStreak, 1); assert.equal(stats.longestStreak, 3); assert.equal(stats.activeDays, 4);
  assert.equal(getPracticeStats(recordsFor(['2026-10-10']), today).currentStreak, 0);
});
test('year, leap day and DST calendar arithmetic', () => {
  assert.equal(shiftStudyDate('2027-01-01', -1), '2026-12-31');
  assert.equal(shiftStudyDate('2028-03-01', -1), '2028-02-29');
  assert.equal(shiftStudyDate('2026-03-08', 1), '2026-03-09');
  assert.equal(shiftStudyDate('2026-11-01', 1), '2026-11-02');
  assert.equal(getPracticeStats(recordsFor(['2026-12-31', '2027-01-01']), '2027-01-01').currentStreak, 2);
  assert.equal(getPracticeStats(recordsFor(['2026-03-07', '2026-03-08', '2026-03-09']), '2026-03-09').currentStreak, 3);
});
test('invalid date keys do not break stats', () => {
  assert.equal(getPracticeStats({ bad: {}, '2026-02-30': {} }, today).activeDays, 0);
  assert.throws(() => getPracticeStats({}, 'bad'));
});
console.log(JSON.stringify({ studyChecks: checks, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, status: 'passed' }, null, 2));
