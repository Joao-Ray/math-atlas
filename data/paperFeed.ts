export const PAPER_PAGE_SIZE = 10;
export const PAPER_BROWSE_LIMIT = 200;
export const PAPER_CACHE_TTL = 24 * 60 * 60 * 1000;
export const paperCategories = [
  { id: 'all', label: '数学 / 统计', search: 'cat:math.* OR cat:stat.*' },
  { id: 'analysis', label: '数学分析', search: 'cat:math.CA OR cat:math.FA OR cat:math.AP' },
  { id: 'linear', label: '线性 / 数值', search: 'cat:math.NA OR cat:math.SP' },
  { id: 'probability', label: '概率 / 随机', search: 'cat:math.PR' },
  { id: 'statistics', label: '统计', search: 'cat:stat.*' },
] as const;
export type PaperCategoryId = typeof paperCategories[number]['id'];
export type PaperFeedFilter = { category: PaperCategoryId; query: string; sort: 'updated' | 'submitted' };
export type PaperFeedRequest = PaperFeedFilter & { start: number };
export type OnlinePaper = {
  id: string; versionedId: string; title: string; authors: string; abstract: string;
  categories: string[]; publishedAt: string; updatedAt: string; url: string;
};
export type OnlinePaperPage = {
  papers: OnlinePaper[]; total: number; start: number; nextStart: number | null;
  fetchedAt: string; serverCached: boolean;
};
export const defaultPaperFilter: PaperFeedFilter = { category: 'all', query: '', sort: 'updated' };
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
export const validArxivId = (value: string) => /^(?:\d{4}\.\d{4,5}|[a-z][a-z0-9.-]*\/\d{7})(?:v[1-9]\d*)?$/.test(value);
export const validPaperDate = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));

export function normalizePaperRequest(raw: { category?: unknown; query?: unknown; sort?: unknown; start?: unknown }): PaperFeedRequest {
  const category = raw.category ?? 'all';
  const sort = raw.sort ?? 'updated';
  if (!paperCategories.some((item) => item.id === category)) throw new Error('不支持的论文分类。');
  if (sort !== 'updated' && sort !== 'submitted') throw new Error('不支持的论文排序。');
  if (typeof (raw.query ?? '') !== 'string') throw new Error('检索词格式错误。');
  const query = String(raw.query ?? '').trim().replace(/\s+/g, ' ');
  if (query.length > 120 || /[\u0000-\u001f\u007f]/.test(query) || query.split(' ').length > 8) throw new Error('请使用不超过 120 字符、8 个词的检索词。');
  const startText = String(raw.start ?? 0);
  if (!/^\d+$/.test(startText)) throw new Error('分页位置无效。');
  const start = Number(startText);
  if (!Number.isSafeInteger(start) || start < 0 || start >= PAPER_BROWSE_LIMIT || start % PAPER_PAGE_SIZE !== 0) throw new Error('最多浏览前 200 条，请缩小检索范围。');
  return { category: category as PaperCategoryId, query, sort, start };
}
export function paperFilterKey(filter: PaperFeedFilter) {
  return JSON.stringify([filter.category, filter.query, filter.sort]);
}
export function buildArxivQuery(request: PaperFeedRequest) {
  const category = paperCategories.find((item) => item.id === request.category)!;
  const tokens = request.query.replace(/["\\]/g, ' ').split(/\s+/).filter(Boolean);
  const search = '(' + category.search + ')' + tokens.map((word) => ' AND all:"' + word + '"').join('');
  const url = new URL('https://export.arxiv.org/api/query');
  url.search = new URLSearchParams({ search_query: search, start: String(request.start), max_results: String(PAPER_PAGE_SIZE),
    sortBy: request.sort === 'updated' ? 'lastUpdatedDate' : 'submittedDate', sortOrder: 'descending' }).toString();
  return url.toString();
}
export function parseOnlinePaperPage(raw: unknown): OnlinePaperPage {
  if (!object(raw) || !Array.isArray(raw.papers) || raw.papers.length > PAPER_PAGE_SIZE
    || !Number.isSafeInteger(raw.total) || Number(raw.total) < 0 || !Number.isSafeInteger(raw.start)
    || Number(raw.start) < 0 || Number(raw.start) >= PAPER_BROWSE_LIMIT || Number(raw.start) % PAPER_PAGE_SIZE !== 0
    || !validPaperDate(raw.fetchedAt) || typeof raw.serverCached !== 'boolean') throw new Error('论文接口返回的数据格式不正确。');
  if (raw.nextStart !== null && (raw.nextStart !== Number(raw.start) + PAPER_PAGE_SIZE || Number(raw.nextStart) >= PAPER_BROWSE_LIMIT)) throw new Error('论文接口分页信息无效。');
  const papers = raw.papers.map((paper): OnlinePaper => {
    if (!object(paper) || typeof paper.id !== 'string' || !validArxivId(paper.id) || /v\d+$/.test(paper.id)
      || typeof paper.versionedId !== 'string' || !validArxivId(paper.versionedId) || paper.versionedId.replace(/v\d+$/, '') !== paper.id
      || typeof paper.title !== 'string' || !paper.title.trim() || paper.title.length > 2000
      || typeof paper.authors !== 'string' || !paper.authors.trim() || paper.authors.length > 20_000
      || typeof paper.abstract !== 'string' || paper.abstract.length > 30_000
      || !Array.isArray(paper.categories) || !paper.categories.every((category) => typeof category === 'string' && /^[a-zA-Z0-9.-]{1,40}$/.test(category))
      || !validPaperDate(paper.publishedAt) || !validPaperDate(paper.updatedAt)
      || paper.url !== 'https://arxiv.org/abs/' + paper.versionedId) throw new Error('论文条目未通过格式检查。');
    return { id: paper.id, versionedId: paper.versionedId, title: paper.title, authors: paper.authors, abstract: paper.abstract,
      categories: [...paper.categories] as string[], publishedAt: paper.publishedAt, updatedAt: paper.updatedAt, url: paper.url };
  });
  if (new Set(papers.map((paper) => paper.id)).size !== papers.length) throw new Error('论文接口包含重复条目。');
  return { papers, total: Number(raw.total), start: Number(raw.start), nextStart: raw.nextStart as number | null,
    fetchedAt: raw.fetchedAt, serverCached: raw.serverCached };
}
export function mergeOnlinePapers(current: OnlinePaper[], incoming: OnlinePaper[]) {
  const result = new Map(current.map((paper) => [paper.id, paper]));
  incoming.forEach((paper) => {
    const old = result.get(paper.id);
    const version = (id: string) => Number(/v(\d+)$/.exec(id)?.[1] ?? 0);
    if (!old || Date.parse(paper.updatedAt) > Date.parse(old.updatedAt)
      || (paper.updatedAt === old.updatedAt && version(paper.versionedId) >= version(old.versionedId))) result.set(paper.id, paper);
  });
  return [...result.values()];
}
export function paperPageIsStale(page: OnlinePaperPage, now = Date.now()) {
  const age = now - Date.parse(page.fetchedAt);
  return age < -300_000 || age >= PAPER_CACHE_TTL;
}
export type PaperCacheEntry = { key: string; page: OnlinePaperPage };
export function parsePaperCache(value: string | null): PaperCacheEntry[] {
  if (!value || value.length > 2_000_000) return [];
  try {
    const raw = JSON.parse(value);
    if (!object(raw) || raw.version !== 1 || !Array.isArray(raw.entries)) return [];
    return raw.entries.slice(0, 4).flatMap((entry: unknown) => {
      try {
        if (!object(entry) || typeof entry.key !== 'string' || entry.key.length > 200) return [];
        const page = parseOnlinePaperPage(entry.page);
        return page.start === 0 ? [{ key: entry.key, page }] : [];
      } catch { return []; }
    });
  } catch { return []; }
}
export function resolvePaperEndpoint(options: { platform: 'web' | 'native'; development: boolean; configured?: string; hostUri?: string }) {
  if (options.configured) {
    let url: URL;
    try { url = new URL(options.configured); } catch { throw new Error('论文接口地址配置不正确。'); }
    if ((url.protocol !== 'https:' && !(options.development && url.protocol === 'http:')) || url.username || url.password || url.search || url.hash) throw new Error('正式版论文接口需要不含凭据的 HTTPS 地址。');
    return url.toString();
  }
  if (options.platform === 'web') return '/api/papers';
  if (options.development && options.hostUri) return new URL('/api/papers', 'http://' + options.hostUri.replace(/^https?:\/\//, '')).toString();
  throw new Error('独立安装版尚未配置在线论文服务。可先阅读本地精选，发布前需设置论文服务的 HTTPS 地址。');
}
