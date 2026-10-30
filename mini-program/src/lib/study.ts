import Taro from '@tarojs/taro';
import { useSyncExternalStore } from 'react';
import { createStudyStore, STORAGE_KEY } from './storeCore';

export const studyStore = createStudyStore({
  read: () => Taro.getStorageSync(STORAGE_KEY),
  write: (value) => Taro.setStorageSync(STORAGE_KEY, value),
  remove: () => Taro.removeStorageSync(STORAGE_KEY),
});
export const useStudy = () => useSyncExternalStore(studyStore.subscribe, studyStore.getSnapshot, studyStore.getSnapshot);
export function act(action: () => void) {
  try { action(); } catch (error) { void Taro.showModal({ title: '操作未完成', content: error instanceof Error ? error.message : '请重试。', showCancel: false }); }
}
