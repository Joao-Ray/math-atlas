import { DailyLimitRecords, dailyLimitBank, getDailyLimitProblems, getDailyLimitSummary, normalizeDailyLimitRecords } from './dailyLimits';
import { formulas, problems, topics } from './mockData';

export type StudyState = {
  favoriteTopics: string[];
  favoriteFormulas: string[];
  completedProblems: string[];
  dailyLimitRecords: DailyLimitRecords;
  practiceDrafts: Record<string, string>;
};

export const emptyStudyState: StudyState = {
  favoriteTopics: [], favoriteFormulas: [], completedProblems: [], dailyLimitRecords: {}, practiceDrafts: {},
};
const topicIds = new Set(topics.map((item) => item.id));
const formulaIds = new Set(formulas.map((item) => item.id));
const problemIds = new Set(problems.map((item) => item.id));
const limitIds = new Set(dailyLimitBank.map((item) => item.id));
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);

export function getPracticeDraftKey(id: string, date?: string) {
  return date ? `review:${date}:${id}` : `bank:${id}`;
}

function validDraftKey(key: string) {
  if (key.startsWith('bank:')) return limitIds.has(key.slice(5));
  const match = /^review:(\d{4}-\d{2}-\d{2}):(.+)$/.exec(key);
  if (!match || !limitIds.has(match[2])) return false;
  try { return getDailyLimitProblems(match[1]).some((item) => item.id === match[2]); } catch { return false; }
}

export function normalizeStudyState(raw: unknown): StudyState {
  const value = object(raw) ? raw : {};
  const ids = (input: unknown, allowed: Set<string>) => Array.isArray(input)
    ? [...new Set(input.filter((id): id is string => typeof id === 'string' && allowed.has(id)))] : [];
  const practiceDrafts = Object.fromEntries(object(value.practiceDrafts) ? Object.entries(value.practiceDrafts)
    .filter(([key, draft]) => validDraftKey(key) && typeof draft === 'string' && draft.length > 0)
    .map(([key, draft]) => [key, (draft as string).slice(0, 1000)]) : []);
  return {
    favoriteTopics: ids(value.favoriteTopics, topicIds), favoriteFormulas: ids(value.favoriteFormulas, formulaIds),
    completedProblems: ids(value.completedProblems, problemIds),
    dailyLimitRecords: normalizeDailyLimitRecords(value.dailyLimitRecords), practiceDrafts,
  };
}

export function mergeStudyStates(current: StudyState, incoming: StudyState): StudyState {
  const dates = new Set([...Object.keys(incoming.dailyLimitRecords), ...Object.keys(current.dailyLimitRecords)]);
  return {
    favoriteTopics: [...new Set([...current.favoriteTopics, ...incoming.favoriteTopics])],
    favoriteFormulas: [...new Set([...current.favoriteFormulas, ...incoming.favoriteFormulas])],
    completedProblems: [...new Set([...current.completedProblems, ...incoming.completedProblems])],
    dailyLimitRecords: Object.fromEntries([...dates].map((date) => [date, {
      ...incoming.dailyLimitRecords[date], ...current.dailyLimitRecords[date],
    }])),
    practiceDrafts: { ...incoming.practiceDrafts, ...current.practiceDrafts },
  };
}

export function createStudyBackup(state: StudyState, exportedAt = new Date().toISOString()) {
  const text = JSON.stringify({ app: 'MathAtlas', schemaVersion: 1, exportedAt, state }, null, 2);
  if (text.length > 2_000_000) throw new Error('记录超过当前备份支持的 200 万字符上限，请勿删除本地数据。');
  return text;
}

export function parseStudyBackup(text: string): { state: StudyState; exportedAt: string } {
  if (text.length > 2_000_000) throw new Error('备份超过 200 万字符上限，请使用较小的备份。');
  let backup: unknown;
  try { backup = JSON.parse(text); } catch { throw new Error('不是有效的 JSON，请粘贴完整的 MathAtlas 备份文本。'); }
  if (!object(backup) || backup.app !== 'MathAtlas' || backup.schemaVersion !== 1 || !object(backup.state)) {
    throw new Error('备份格式或版本不支持，未修改当前记录。');
  }
  if (typeof backup.exportedAt !== 'string' || !Number.isFinite(Date.parse(backup.exportedAt))) throw new Error('备份缺少有效的导出日期。');
  const source = backup.state;
  for (const [key, allowed] of [['favoriteTopics', topicIds], ['favoriteFormulas', formulaIds], ['completedProblems', problemIds]] as const) {
    const values = source[key];
    if (!Array.isArray(values) || !values.every((id) => typeof id === 'string' && allowed.has(id))) {
      throw new Error('备份中的收藏或例题 ID 无效，可能需要更新 App 后再恢复。');
    }
  }
  if (!object(source.dailyLimitRecords)) throw new Error('备份缺少每日练习记录。');
  for (const [date, entries] of Object.entries(source.dailyLimitRecords)) {
    let assigned: Set<string>;
    try { assigned = new Set(getDailyLimitProblems(date).map((item) => item.id)); }
    catch { throw new Error('备份包含无效的练习日期。'); }
    if (!object(entries)) throw new Error('每日练习记录格式错误。');
    for (const [id, attempt] of Object.entries(entries)) {
      if (!assigned.has(id) || !object(attempt) || typeof attempt.draft !== 'string' || attempt.draft.length > 1000
        || typeof attempt.revealed !== 'boolean' || (attempt.result !== null && attempt.result !== 'correct' && attempt.result !== 'review')
        || (!attempt.revealed && attempt.result !== null)) throw new Error('备份中的题目或自评记录无效。');
    }
  }
  if (source.practiceDrafts !== undefined && (!object(source.practiceDrafts) || !Object.entries(source.practiceDrafts)
    .every(([key, draft]) => validDraftKey(key) && typeof draft === 'string' && draft.length <= 1000))) {
    throw new Error('备份中的自由练习草稿无效。');
  }
  return { state: normalizeStudyState(source), exportedAt: backup.exportedAt };
}

export function summarizeStudyState(state: StudyState) {
  return {
    favorites: state.favoriteTopics.length + state.favoriteFormulas.length, completed: state.completedProblems.length,
    dailyAttempts: Object.values(state.dailyLimitRecords).reduce((sum, day) => sum + Object.keys(day).length, 0),
    drafts: Object.keys(state.practiceDrafts).length,
  };
}

// Calendar math uses date keys, not elapsed local milliseconds, to avoid DST gaps.
export function shiftStudyDate(date: string, offset: number) {
  getDailyLimitProblems(date);
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + offset)).toISOString().slice(0, 10);
}

export function getPracticeStats(records: DailyLimitRecords, today: string) {
  getDailyLimitProblems(today);
  const days = Object.keys(records).filter((date) => {
    if (date > today) return false;
    try { return getDailyLimitSummary(records, date).assessed > 0; } catch { return false; }
  }).sort();
  const active = new Set(days);
  let cursor = active.has(today) ? today : shiftStudyDate(today, -1);
  let currentStreak = 0;
  while (active.has(cursor)) { currentStreak++; cursor = shiftStudyDate(cursor, -1); }
  let longestStreak = 0;
  let run = 0;
  days.forEach((date, index) => {
    run = index > 0 && shiftStudyDate(days[index - 1], 1) === date ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
  });
  const calendar = Array.from({ length: 28 }, (_, index) => {
    const date = shiftStudyDate(today, index - 27);
    return { date, ...getDailyLimitSummary(records, date) };
  });
  return { activeDays: days.length, currentStreak, longestStreak, calendar };
}
