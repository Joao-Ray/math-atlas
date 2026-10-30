import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { buildArxivQuery, mergeOnlinePapers, OnlinePaper, OnlinePaperPage, PAPER_BROWSE_LIMIT, PAPER_CACHE_TTL, PAPER_PAGE_SIZE, PaperFeedRequest, validArxivId, validPaperDate } from '../data/paperFeed';

export class PaperApiError extends Error {
  constructor(public status: number, message: string, public retryAfter?: number) { super(message); }
}
const text = (value: unknown) => typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
export function parseArxivFeed(xml: string, request: PaperFeedRequest, now = Date.now()): OnlinePaperPage {
  if (xml.length > 2_000_000 || /<!DOCTYPE|<!ENTITY/i.test(xml) || XMLValidator.validate(xml) !== true) throw new PaperApiError(502, 'arXiv 返回的 XML 无效。');
  const parsed = new XMLParser({ ignoreAttributes: false, parseTagValue: false, removeNSPrefix: true,
    isArray: (name: string) => ['entry', 'author', 'category', 'link'].includes(name) }).parse(xml);
  const feed = parsed.feed;
  if (!feed || !/^\d+$/.test(String(feed.totalResults ?? '')) || !/^\d+$/.test(String(feed.startIndex ?? ''))) throw new PaperApiError(502, 'arXiv 返回了错误或不完整的数据。');
  const total = Number(feed.totalResults);
  const start = Number(feed.startIndex);
  if (!Number.isSafeInteger(total) || start !== request.start) throw new PaperApiError(502, 'arXiv 分页信息与请求不一致。');
  const entries = feed.entry ?? [];
  if (!Array.isArray(entries) || entries.length > PAPER_PAGE_SIZE) throw new PaperApiError(502, 'arXiv 返回的条目数量无效。');
  const papers: OnlinePaper[] = entries.map((entry) => {
    const rawId = text(entry.id);
    const match = /^https?:\/\/(?:export\.)?arxiv\.org\/abs\/(.+)$/.exec(rawId);
    const versionedId = match?.[1] ?? '';
    const title = text(entry.title);
    const authors = (entry.author ?? []).map((author: { name?: unknown }) => text(author.name)).filter(Boolean).join(', ');
    if (!validArxivId(versionedId) || !title || !authors || !validPaperDate(entry.published) || !validPaperDate(entry.updated)) throw new PaperApiError(502, 'arXiv 条目缺少有效的标识、作者或日期。');
    const categories = (entry.category ?? []).map((category: Record<string, string>) => category['@_term']).filter((category: string) => /^[a-zA-Z0-9.-]{1,40}$/.test(category));
    return { id: versionedId.replace(/v\d+$/, ''), versionedId, title, authors, abstract: text(entry.summary),
      categories: [...new Set<string>(categories)], publishedAt: entry.published, updatedAt: entry.updated, url: 'https://arxiv.org/abs/' + versionedId };
  });
  const unique = mergeOnlinePapers([], papers);
  const next = start + PAPER_PAGE_SIZE;
  return { papers: unique, total, start, nextStart: entries.length === PAPER_PAGE_SIZE && next < total && next < PAPER_BROWSE_LIMIT ? next : null,
    fetchedAt: new Date(now).toISOString(), serverCached: false };
}

export function createArxivService(options: { fetcher?: typeof fetch; now?: () => number; sleep?: (ms: number) => Promise<void> } = {}) {
  const fetcher = options.fetcher ?? fetch;
  const now = options.now ?? Date.now;
  const sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const cache = new Map<string, OnlinePaperPage>();
  const pending = new Map<string, Promise<OnlinePaperPage>>();
  let queue: Promise<unknown> = Promise.resolve();
  let lastStarted = -Infinity;
  let blockedUntil = 0;
  const enforceCooldown = () => {
    const seconds = Math.ceil((blockedUntil - now()) / 1000);
    if (seconds > 0) throw new PaperApiError(429, 'arXiv 正在限流，服务已暂停向来源发送新请求；请稍后再试。', seconds);
  };
  return {
    async get(request: PaperFeedRequest): Promise<OnlinePaperPage> {
      const url = buildArxivQuery(request);
      const cached = cache.get(url);
      if (cached && now() - Date.parse(cached.fetchedAt) < PAPER_CACHE_TTL) return { ...cached, serverCached: true };
      enforceCooldown();
      const existing = pending.get(url);
      if (existing) return existing;
      if (pending.size >= 3) throw new PaperApiError(429, '论文服务正在处理其他检索，请稍后再试。', 15);
      const work = queue.catch(() => undefined).then(async () => {
        enforceCooldown();
        const wait = 3100 - (now() - lastStarted);
        if (wait > 0) await sleep(wait);
        enforceCooldown();
        lastStarted = now();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 20_000);
        try {
          // Workers supports manual/follow only; manual keeps redirects rejected
          // by the non-2xx check below without contacting a different upstream.
          const response = await fetcher(url, { signal: controller.signal, redirect: 'manual',
            headers: { Accept: 'application/atom+xml', 'User-Agent': 'MathAtlas/1.3 (arXiv metadata reader)' } });
          if (response.status === 429) {
            const retry = response.headers.get('retry-after') ?? '';
            const requested = /^\d+$/.test(retry) ? Number(retry) : Math.ceil((Date.parse(retry) - now()) / 1000);
            const seconds = Math.min(3600, Math.max(60, Number.isFinite(requested) ? requested : 300));
            blockedUntil = now() + seconds * 1000;
            throw new PaperApiError(429, 'arXiv 暂时限制请求，服务会暂停重试；缓存内容仍可阅读。', seconds);
          }
          if (!response.ok) throw new PaperApiError(502, 'arXiv 暂时不可用，请稍后再试。');
          if (Number(response.headers.get('content-length') ?? 0) > 2_000_000) throw new PaperApiError(502, 'arXiv 响应过大。');
          const page = parseArxivFeed(await response.text(), request, now());
          cache.delete(url);
          cache.set(url, page);
          while (cache.size > 32) cache.delete(cache.keys().next().value!);
          return page;
        } catch (error) {
          if (error instanceof PaperApiError) throw error;
          throw new PaperApiError(502, '无法连接 arXiv，可能是网络或超时问题。请稍后刷新，或阅读缓存与本地精选。');
        } finally { clearTimeout(timer); }
      });
      queue = work;
      pending.set(url, work);
      try { return await work; } finally { pending.delete(url); }
    },
  };
}
