import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DailyLimitAttempt, emptyDailyLimitAttempt } from '@/data/dailyLimits';
import { emptyStudyState, getPracticeDraftKey, mergeStudyStates, normalizeStudyState, StudyState } from '@/data/studyState';

type StudyContextValue = StudyState & {
  hydrated: boolean;
  storageError: string | null;
  toggleTopic: (id: string) => void;
  toggleFormula: (id: string) => void;
  toggleProblemComplete: (id: string) => void;
  updateDailyLimit: (date: string, id: string, patch: Partial<DailyLimitAttempt>) => void;
  restartDailyLimit: (date: string, id: string) => void;
  updatePracticeDraft: (id: string, draft: string, date?: string) => void;
  restoreBackup: (incoming: StudyState) => void;
  snapshot: StudyState;
  resetProgress: () => Promise<void>;
};

const STORAGE_KEY = '@mathatlas/study-state-v1';

const StudyContext = createContext<StudyContextValue | null>(null);

function toggleInList(items: string[], id: string) {
  return items.includes(id) ? items.filter((item) => item !== id) : [...items, id];
}

export function StudyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudyState>(emptyStudyState);
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const canPersist = useRef(false);
  const pendingWrite = useRef(Promise.resolve());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value) setState(normalizeStudyState(JSON.parse(value)));
        canPersist.current = true;
      })
      .catch(() => setStorageError('无法读取本机记录。为保护原数据，已暂停自动保存；请先检查备份或重新打开应用。'))
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated && canPersist.current) {
      const serialized = JSON.stringify(state);
      // Serialize draft writes so a slower earlier write cannot overwrite a newer answer.
      pendingWrite.current = pendingWrite.current
        .then(() => AsyncStorage.setItem(STORAGE_KEY, serialized))
        .then(() => setStorageError(null))
        .catch(() => setStorageError('本机保存失败，最新修改可能未保存。请先在“设置 → 学习记录备份”保留备份文本。'));
    }
  }, [hydrated, state]);

  const value = useMemo<StudyContextValue>(() => ({
    ...state,
    hydrated,
    storageError,
    snapshot: state,
    toggleTopic: (id) => setState((current) => ({ ...current, favoriteTopics: toggleInList(current.favoriteTopics, id) })),
    toggleFormula: (id) => setState((current) => ({ ...current, favoriteFormulas: toggleInList(current.favoriteFormulas, id) })),
    toggleProblemComplete: (id) => setState((current) => ({ ...current, completedProblems: toggleInList(current.completedProblems, id) })),
    updateDailyLimit: (date, id, patch) => setState((current) => ({
      ...current,
      dailyLimitRecords: {
        ...current.dailyLimitRecords,
        [date]: { ...current.dailyLimitRecords[date], [id]: {
          ...emptyDailyLimitAttempt, ...current.dailyLimitRecords[date]?.[id], ...patch,
        } },
      },
    })),
    restartDailyLimit: (date, id) => setState((current) => {
      const day = { ...current.dailyLimitRecords[date] };
      delete day[id];
      const dailyLimitRecords = { ...current.dailyLimitRecords };
      if (Object.keys(day).length) dailyLimitRecords[date] = day;
      else delete dailyLimitRecords[date];
      return { ...current, dailyLimitRecords };
    }),
    updatePracticeDraft: (id, draft, date) => setState((current) => {
      const key = getPracticeDraftKey(id, date);
      const practiceDrafts = { ...current.practiceDrafts };
      if (draft) practiceDrafts[key] = draft.slice(0, 1000);
      else delete practiceDrafts[key];
      return { ...current, practiceDrafts };
    }),
    restoreBackup: (incoming) => {
      canPersist.current = true;
      setState((current) => mergeStudyStates(current, incoming));
    },
    resetProgress: async () => {
      canPersist.current = true;
      setState(emptyStudyState);
      // Clear through the same queue as draft writes; a later write must not race a removal.
      pendingWrite.current = pendingWrite.current
        .then(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(emptyStudyState)))
        .then(() => setStorageError(null))
        .catch(() => setStorageError('本机数据清除未能保存，请先保留备份并重试。'));
      await pendingWrite.current;
    },
  }), [hydrated, state, storageError]);

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const value = useContext(StudyContext);
  if (!value) throw new Error('useStudy must be used inside StudyProvider');
  return value;
}
