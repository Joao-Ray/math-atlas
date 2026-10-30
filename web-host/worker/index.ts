import shell from '../generated/app-shell';
import { GET as papers, OPTIONS as paperOptions } from '../generated/papers-api.js';

export default {
  async fetch(request: Request, env: Cloudflare.Env): Promise<Response> {
    const pathname = new URL(request.url).pathname;
    if (pathname === '/api/papers') {
      if (request.method === 'GET') return papers(request);
      if (request.method === 'OPTIONS') return paperOptions();
      return Response.json({ error: '仅支持 GET。' }, { status: 405, headers: { Allow: 'GET, OPTIONS' } });
    }
    if (pathname.startsWith('/api/')) return Response.json({ error: '接口不存在。' }, { status: 404 });
    if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405 });
    const assets = (env as Cloudflare.Env & { ASSETS?: { fetch(request: Request): Promise<Response> } }).ASSETS;
    if (assets) {
      const response = await assets.fetch(request);
      if (response.status !== 404) return response;
    }
    if (/\.[a-z0-9]{2,6}$/i.test(pathname)) return new Response('Not found', { status: 404 });
    return new Response(request.method === 'HEAD' ? null : shell, { headers: {
      'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin',
    } });
  },
};
