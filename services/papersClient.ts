import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { normalizePaperRequest, OnlinePaperPage, PaperFeedFilter, paperFilterKey, parseOnlinePaperPage, parsePaperCache, resolvePaperEndpoint } from '../data/paperFeed';

const CACHE_KEY = '@mathatlas/paper-feed-cache-v1';
export class PaperFeedError extends Error {
  constructor(message: string, public retryAt: number) { super(message); }
}
let writes: Promise<void> = Promise.resolve();
export async function readPaperCache(filter: PaperFeedFilter) {
  await writes;
  return parsePaperCache(await AsyncStorage.getItem(CACHE_KEY)).find((entry) => entry.key === paperFilterKey(filter))?.page ?? null;
}
export function savePaperCache(filter: PaperFeedFilter, page: OnlinePaperPage) {
  const operation = writes.catch(() => undefined).then(async () => {
    const previous = parsePaperCache(await AsyncStorage.getItem(CACHE_KEY));
    const key = paperFilterKey(filter);
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ version: 1, entries: [{ key, page }, ...previous.filter((entry) => entry.key !== key)].slice(0, 4) }));
  });
  writes = operation.catch(() => undefined);
  return operation;
}
export function clearPaperCache() {
  const operation = writes.catch(() => undefined).then(() => AsyncStorage.removeItem(CACHE_KEY));
  writes = operation.catch(() => undefined);
  return operation;
}
export async function fetchPaperPage(filter: PaperFeedFilter, start: number, signal: AbortSignal): Promise<OnlinePaperPage> {
  const params = normalizePaperRequest({ ...filter, start });
  const endpoint = resolvePaperEndpoint({ platform: Platform.OS === 'web' ? 'web' : 'native', development: __DEV__,
    configured: process.env.EXPO_PUBLIC_PAPERS_API_URL, hostUri: Constants.expoConfig?.hostUri });
  const query = new URLSearchParams({ category: params.category, query: params.query, sort: params.sort, start: String(start) });
  let response: Response;
  try { response = await fetch(endpoint + '?' + query.toString(), { signal }); }
  catch (error) { if (signal.aborted) throw error; throw new Error('暂时无法连接论文服务，请检查网络；缓存和本地精选仍可阅读。'); }
  const raw = await response.json().catch(() => null);
  if (!response.ok) {
    const message = raw && typeof raw.error === 'string' && raw.error.length < 500 ? raw.error : '论文服务暂时不可用，请稍后刷新。';
    if (response.status === 429) {
      const retry = Number(response.headers.get('retry-after') ?? 300);
      throw new PaperFeedError(message, Date.now() + Math.min(3600, Math.max(15, Number.isFinite(retry) ? retry : 300)) * 1000);
    }
    throw new Error(message);
  }
  const page = parseOnlinePaperPage(raw);
  if (page.start !== start) throw new Error('论文分页响应不一致，请重新刷新。');
  return page;
}
