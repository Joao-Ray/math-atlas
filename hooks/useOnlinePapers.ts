import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { mergeOnlinePapers, normalizePaperRequest, OnlinePaperPage, PaperFeedFilter, paperFilterKey, paperPageIsStale } from '@/data/paperFeed';
import { clearPaperCache, fetchPaperPage, PaperFeedError, readPaperCache, savePaperCache } from '@/services/papersClient';

export function useOnlinePapers(filter: PaperFeedFilter) {
  const parameters = useMemo(() => normalizePaperRequest({ ...filter, start: 0 }), [filter.category, filter.query, filter.sort]);
  const key = paperFilterKey(parameters);
  const [feed, setFeed] = useState<OnlinePaperPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [fromCache, setFromCache] = useState(false);
  const [retryAt, setRetryAt] = useState(0);
  const retryAtRef = useRef(0);
  const feedRef = useRef<OnlinePaperPage | null>(null);
  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const busy = useRef(false);
  const lastAttempt = useRef(0);

  const request = useCallback(async (start: number, replace: boolean, version: number) => {
    if (version !== generation.current) return;
    if (Date.now() < retryAtRef.current) {
      busy.current = false; setLoading(false); setError('来源仍处于限流等待期，请稍后再试；缓存和本地精选可以继续阅读。'); return;
    }
    busy.current = true; setLoading(true); setError(''); lastAttempt.current = Date.now();
    const abort = new AbortController();
    controller.current = abort;
    const timer = setTimeout(() => abort.abort(), 45_000);
    try {
      const page = await fetchPaperPage(parameters, start, abort.signal);
      if (version !== generation.current) return;
      const next = replace ? page : { ...page, papers: mergeOnlinePapers(feedRef.current?.papers ?? [], page.papers),
        fetchedAt: feedRef.current?.fetchedAt ?? page.fetchedAt };
      feedRef.current = next; setFeed(next); setFromCache(false);
      if (start === 0) {
        try { await savePaperCache(parameters, page); }
        catch { if (version === generation.current) setNotice('在线内容已加载，但本机缓存保存失败；离线时可能无法保留。'); }
      }
    } catch (caught) {
      if (version !== generation.current) return;
      if (caught instanceof PaperFeedError) { retryAtRef.current = caught.retryAt; setRetryAt(caught.retryAt); }
      setError(abort.signal.aborted ? '请求超时，请稍后重试；原有内容没有清空。'
        : caught instanceof Error ? caught.message : '论文加载失败，请稍后刷新。');
    } finally {
      clearTimeout(timer);
      if (version === generation.current) { busy.current = false; setLoading(false); controller.current = null; }
    }
  }, [key]);

  useFocusEffect(useCallback(() => {
    const version = ++generation.current;
    controller.current?.abort();
    busy.current = true; setLoading(true); setFeed(null); feedRef.current = null; setError(''); setNotice(''); setFromCache(false);
    void (async () => {
      let cached: OnlinePaperPage | null = null;
      try { cached = await readPaperCache(parameters); }
      catch { if (version === generation.current) setNotice('本机缓存暂时不可读，将尝试在线加载。'); }
      if (version !== generation.current) return;
      if (cached) { feedRef.current = cached; setFeed(cached); setFromCache(true); }
      if (!cached || paperPageIsStale(cached)) await request(0, true, version);
      else { busy.current = false; setLoading(false); }
    })();
    const check = () => {
      if (retryAtRef.current && Date.now() >= retryAtRef.current) { retryAtRef.current = 0; setRetryAt(0); }
      if (Date.now() < retryAtRef.current) return;
      if (busy.current || Date.now() - lastAttempt.current < 15 * 60_000 || AppState.currentState === 'background' || AppState.currentState === 'inactive') return;
      if (!feedRef.current || paperPageIsStale(feedRef.current)) void request(0, true, version);
    };
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') check(); });
    const timer = setInterval(check, 60_000);
    return () => {
      generation.current++; controller.current?.abort(); controller.current = null; busy.current = false;
      clearInterval(timer); subscription.remove();
    };
  }, [key, request]));

  return {
    feed, loading, error, notice, fromCache, retryAt,
    refresh: () => { if (!busy.current) { setNotice(''); void request(0, true, generation.current); } },
    loadMore: () => { const start = feedRef.current?.nextStart; if (!busy.current && start !== null && start !== undefined) void request(start, false, generation.current); },
    clearCache: async () => {
      if (busy.current) return;
      try { await clearPaperCache(); feedRef.current = null; setFeed(null); setFromCache(false); setError(''); setNotice('已清除本机在线论文缓存。学习记录未受影响，点击刷新可重新获取。'); lastAttempt.current = Date.now(); }
      catch { setNotice('缓存清除失败，请稍后重试。'); }
    },
  };
}
