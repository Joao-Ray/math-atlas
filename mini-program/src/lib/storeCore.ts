import {
  emptyStudyState, normalizeStudyState, mergeStudyStates, parseStudyBackup, createStudyBackup,
  type StudyState,
} from '../../../data/studyState';
import { getDailyLimitProblems, emptyDailyLimitAttempt, type DailyLimitAttempt } from '../../../data/dailyLimits';
import { topics, formulas, problems } from '../../../data/mockData';

export const STORAGE_KEY = 'lemivanta:study:v1';
export type StoragePort = { read: () => unknown; write: (value: string) => void; remove: () => void };
export function createStudyStore(port: StoragePort) {
  let loaded = false, blocked = false;
  let snapshot: { state: StudyState; error: string | null } = { state: normalizeStudyState(emptyStudyState), error: null };
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());
  function load() {
    if (loaded) return;
    loaded = true;
    try {
      const raw = port.read();
      if (raw !== '' && raw != null) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid storage');
        snapshot = { state: normalizeStudyState(parsed), error: null };
      }
    } catch {
      blocked = true;
      snapshot = { ...snapshot, error: '无法读取本机记录，已暂停保存以保护原数据。请保留备份，勿直接清空。' };
    }
  }
  function commit(next: StudyState) {
    load();
    if (blocked) throw new Error('本机记录读取异常，已暂停保存；请先保留原数据并排查。');
    const normalized = normalizeStudyState(next);
    try { port.write(JSON.stringify(normalized)); }
    catch { snapshot = { ...snapshot, error: '本机保存失败，本次修改未保存。请重试并先导出备份。' }; emit(); throw new Error(snapshot.error!); }
    snapshot = { state: normalized, error: null }; emit();
  }
  const toggle = (key: 'favoriteTopics' | 'favoriteFormulas' | 'completedProblems', id: string, allowed: { id: string }[]) => {
    load();
    if (!allowed.some((item) => item.id === id)) throw new Error('无效的内容 ID。');
    const items = snapshot.state[key];
    commit({ ...snapshot.state, [key]: items.includes(id) ? items.filter((item) => item !== id) : [...items, id] });
  };
  return {
    getSnapshot() { load(); return snapshot; },
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    toggleTopic: (id: string) => toggle('favoriteTopics', id, topics),
    toggleFormula: (id: string) => toggle('favoriteFormulas', id, formulas),
    toggleProblem: (id: string) => toggle('completedProblems', id, problems),
    updateDaily(date: string, id: string, patch: Partial<DailyLimitAttempt>) {
      load();
      if (!getDailyLimitProblems(date).some((item) => item.id === id)) throw new Error('此题不属于该日期的每日练习。');
      const state = snapshot.state;
      const attempt = { ...emptyDailyLimitAttempt, ...state.dailyLimitRecords[date]?.[id], ...patch };
      if (!attempt.revealed && attempt.result) throw new Error('先查看解析，再进行自评。');
      commit({ ...state, dailyLimitRecords: { ...state.dailyLimitRecords, [date]: { ...state.dailyLimitRecords[date], [id]: attempt } } });
    },
    exportBackup() { load(); if (blocked) throw new Error('读取异常，无法生成可靠备份；请保留原数据。'); return createStudyBackup(snapshot.state); },
    previewBackup: parseStudyBackup,
    restoreBackup(text: string) { load(); const incoming = parseStudyBackup(text); commit(mergeStudyStates(snapshot.state, incoming.state)); },
    reset() {
      // Call only after explicit UI confirmation; remove only this client's storage key.
      try { port.remove(); }
      catch { throw new Error('清除失败，未更改当前记录。'); }
      loaded = true; blocked = false; snapshot = { state: normalizeStudyState(emptyStudyState), error: null }; emit();
    },
  };
}
