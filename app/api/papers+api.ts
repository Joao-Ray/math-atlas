import { normalizePaperRequest } from '../../data/paperFeed';
import { createArxivService, PaperApiError } from '../../server/arxiv';

const service = createArxivService();
const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Expose-Headers': 'Retry-After', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
export async function GET(request: Request) {
  let params;
  try {
    const search = new URL(request.url).searchParams;
    const allowed = ['category', 'query', 'sort', 'start'];
    for (const name of search.keys()) if (!allowed.includes(name) || search.getAll(name).length > 1) throw new Error('不支持的请求参数。');
    params = normalizePaperRequest({ category: search.get('category') ?? undefined, query: search.get('query') ?? '',
      sort: search.get('sort') ?? undefined, start: search.get('start') ?? 0 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : '请求参数无效。' }, { status: 400, headers });
  }
  try { return Response.json(await service.get(params), { headers }); }
  catch (error) {
    const status = error instanceof PaperApiError ? error.status : 502;
    return Response.json({ error: error instanceof PaperApiError ? error.message : '论文服务暂时不可用。' },
      { status, headers: { ...headers, ...(status === 429 ? { 'Retry-After': String(error instanceof PaperApiError ? error.retryAfter ?? 300 : 300) } : {}) } });
  }
}
export function OPTIONS() {
  return new Response(null, { status: 204, headers: { ...headers, 'Access-Control-Allow-Methods': 'GET, OPTIONS' } });
}
