import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

type StudyState = {
  favoriteTopics: string[];
  favoriteFormulas: string[];
  completedProblems: string[];
};

type StudyContextValue = StudyState & {
  hydrated: boolean;
  toggleTopic: (id: string) => void;
  toggleFormula: (id: string) => void;
  toggleProblemComplete: (id: string) => void;
  resetProgress: () => Promise<void>;
};

const STORAGE_KEY = '@mathatlas/study-state-v1';
const emptyState: StudyState = { favoriteTopics: [], favoriteFormulas: [], completedProblems: [] };

const StudyContext = createContext<StudyContextValue | null>(null);

function toggleInList(items: string[], id: string) {
  return items.includes(id) ? items.filter((item) => item !== id) : [...items, id];
}

export function StudyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudyState>(emptyState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => value && setState({ ...emptyState, ...JSON.parse(value) }))
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [hydrated, state]);

  const value = useMemo<StudyContextValue>(() => ({
    ...state,
    hydrated,
    toggleTopic: (id) => setState((current) => ({ ...current, favoriteTopics: toggleInList(current.favoriteTopics, id) })),
    toggleFormula: (id) => setState((current) => ({ ...current, favoriteFormulas: toggleInList(current.favoriteFormulas, id) })),
    toggleProblemComplete: (id) => setState((current) => ({ ...current, completedProblems: toggleInList(current.completedProblems, id) })),
    resetProgress: async () => {
      setState(emptyState);
      await AsyncStorage.removeItem(STORAGE_KEY);
    },
  }), [hydrated, state]);

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const value = useContext(StudyContext);
  if (!value) throw new Error('useStudy must be used inside StudyProvider');
  return value;
}
