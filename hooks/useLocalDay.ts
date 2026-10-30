import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { getLocalDateKey } from '@/data/dailyLimits';

export function useLocalDay() {
  const [day, setDay] = useState(getLocalDateKey);
  useEffect(() => {
    const refresh = () => setDay(getLocalDateKey());
    refresh();
    const interval = setInterval(refresh, 30000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => { clearInterval(interval); subscription.remove(); };
  }, []);
  return day;
}
