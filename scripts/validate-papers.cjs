// Offline fixtures, query safety, pagination, caching and upstream throttling.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const previous = require.extensions['.ts'];
require.extensions['.ts'] = (mod, filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, filename);
let model, server;
try { model = require('../data/paperFeed.ts'); server = require('../server/arxiv.ts'); }
finally { if (previous) require.extensions['.ts'] = previous; else delete require.extensions['.ts']; }
const { normalizePaperRequest: normalize, parseOnlinePaperPage: decode, parsePaperCache, buildArxivQuery,
  mergeOnlinePapers, paperPageIsStale, resolvePaperEndpoint, PAPER_CACHE_TTL } = model;
const { parseArxivFeed: parse, createArxivService, PaperApiError } = server;
const request = normalize({ category: 'probability' });
const instant = Date.parse('2026-10-16T00:00:00Z');
function entry(index = 0, version = 1) {
  return '<entry><id>http://arxiv.org/abs/2610.' + String(10000 + index) + 'v' + version + '</id>' +
    '<title> A &amp; B\n paper </title><published>2026-10-14T10:00:00Z</published><updated>2026-10-15T10:00:00Z</updated>' +
    '<summary>Original &lt;script&gt; text and $x^2$.</summary><author><name>Author A</name></author>' +
    '<author><name>Author B</name></author><category term="math.PR"/><arxiv:primary_category term="math.PR"/></entry>';
}
function xml({ count = 1, start = 0, total = count, content } = {}) {
  return '<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom" xmlns:arxiv="http://arxiv.org/schemas/atom" xmlns:opensearch="http://a9.com/-/spec/opensearch/1.1/">' +
    '<opensearch:totalResults>' + total + '</opensearch:totalResults><opensearch:startIndex>' + start + '</opensearch:startIndex>' +
    (content ?? Array.from({ length: count }, (_, index) => entry(start + index)).join('')) + '</feed>';
}
let checks = 0;
async function test(name, run) { try { await run(); checks++; } catch (error) { error.message = name + ': ' + error.message; throw error; } }
async function main() {
  await test('normalization and bounds', () => {
    assert.deepEqual(normalize({}), { category: 'all', query: '', sort: 'updated', start: 0 });
    assert.equal(normalize({ query: '  Brownian   motion ' }).query, 'Brownian motion');
    for (const bad of [{ category: '__proto__' }, { sort: 'random' }, { query: 4 }, { query: 'x'.repeat(121) },
      { query: 'a b c d e f g h i' }, { start: '-1' }, { start: '1.5' }, { start: 1 }, { start: 200 }]) assert.throws(() => normalize(bad));
  });
  await test('query cannot change upstream host or category scope', () => {
    const url = new URL(buildArxivQuery(normalize({ query: 'foo" OR all:*' })));
    assert.equal(url.origin, 'https://export.arxiv.org');
    assert.equal(url.pathname, '/api/query');
    assert.ok(url.searchParams.get('search_query').startsWith('(cat:math.* OR cat:stat.*) AND all:"foo"'));
    assert.equal(url.searchParams.get('max_results'), '10');
    assert.equal(url.searchParams.get('sortBy'), 'lastUpdatedDate');
    assert.equal(new URL(buildArxivQuery(normalize({ sort: 'submitted' }))).searchParams.get('sortBy'), 'submittedDate');
  });
  const page = parse(xml(), request, instant);
  await test('Atom namespaces, entities, authors and original dates', () => {
    assert.equal(page.papers[0].title, 'A & B paper');
    assert.equal(page.papers[0].authors, 'Author A, Author B');
    assert.equal(page.papers[0].abstract, 'Original <script> text and $x^2$.');
    assert.deepEqual(page.papers[0].categories, ['math.PR']);
    assert.equal(page.papers[0].id, '2610.10000');
    assert.equal(page.papers[0].url, 'https://arxiv.org/abs/2610.10000v1');
    assert.notEqual(page.papers[0].publishedAt, page.papers[0].updatedAt);
    assert.deepEqual(decode(page), page);
  });
  await test('empty feed is not a failed request', () => { assert.equal(parse(xml({ count: 0 }), request).total, 0); });
  await test('pagination and browse cap', () => {
    assert.equal(parse(xml({ count: 10, total: 22 }), request).nextStart, 10);
    assert.equal(parse(xml({ count: 10, start: 190, total: 999 }), normalize({ start: 190 })).nextStart, null);
    assert.throws(() => parse(xml({ start: 10 }), request));
  });
  await test('XML errors and entity declarations rejected', () => {
    for (const bad of ['<html>no</html>', '<feed><entry>', '<!DOCTYPE feed><feed/>', '<!ENTITY x "data"><feed/>']) assert.throws(() => parse(bad, request));
    assert.throws(() => parse(xml({ content: entry().replace('http://arxiv.org/abs/', 'https://evil.example/') }), request));
  });
  await test('duplicate IDs collapse across versions', () => {
    const duplicated = parse(xml({ count: 2, content: entry(0, 1) + entry(0, 2) }), request);
    assert.equal(duplicated.papers.length, 1);
  });
  await test('client rejects unsafe URL, bad metadata and invalid pagination', () => {
    const badPaper = (patch) => ({ ...page, papers: [{ ...page.papers[0], ...patch }] });
    for (const bad of [badPaper({ url: 'javascript:alert(1)' }), badPaper({ title: '' }), badPaper({ updatedAt: 'bad' }),
      { ...page, nextStart: 5 }, { ...page, total: -1 }, { ...page, papers: [page.papers[0], page.papers[0]] }]) assert.throws(() => decode(bad));
  });
  await test('newer revisions update by canonical ID without reordering', () => {
    const before = JSON.stringify(page.papers);
    const newer = { ...page.papers[0], updatedAt: '2026-10-16T01:00:00Z', versionedId: '2610.10000v2', url: 'https://arxiv.org/abs/2610.10000v2' };
    assert.equal(mergeOnlinePapers(page.papers, [newer]).length, 1);
    assert.equal(mergeOnlinePapers(page.papers, [newer])[0].versionedId, newer.versionedId);
    assert.equal(mergeOnlinePapers([newer], page.papers)[0].versionedId, newer.versionedId);
    assert.equal(JSON.stringify(page.papers), before);
    const sameTimeNewer = { ...newer, updatedAt: page.papers[0].updatedAt };
    assert.equal(mergeOnlinePapers([sameTimeNewer], page.papers)[0].versionedId, newer.versionedId);
  });
  await test('cache freshness handles expiry and clock skew', () => {
    assert.equal(paperPageIsStale(page, instant + PAPER_CACHE_TTL - 1), false);
    assert.equal(paperPageIsStale(page, instant + PAPER_CACHE_TTL), true);
    assert.equal(paperPageIsStale(page, instant - 600_000), true);
  });
  await test('cache parser ignores corruption and caps retained scopes', () => {
    for (const bad of [null, '{}', 'null', '{', ' '.repeat(2_000_001), '{"version":2,"entries":[]}']) assert.deepEqual(parsePaperCache(bad), []);
    const cache = JSON.stringify({ version: 1, entries: Array.from({ length: 7 }, (_, i) => ({ key: 'query-' + i, page })) });
    assert.equal(parsePaperCache(cache).length, 4);
    assert.deepEqual(parsePaperCache(JSON.stringify({ version: 1, entries: [{ key: 'bad', page: null }] })), []);
  });
  await test('endpoint configuration separates dev and production', () => {
    assert.equal(resolvePaperEndpoint({ platform: 'web', development: true }), '/api/papers');
    assert.equal(resolvePaperEndpoint({ platform: 'native', development: true, hostUri: '192.168.1.4:8082' }), 'http://192.168.1.4:8082/api/papers');
    assert.throws(() => resolvePaperEndpoint({ platform: 'native', development: false }));
    for (const configured of ['http://example.com/api', 'https://user:secret@example.com/api', 'javascript:x', 'https://example.com/api?secret=x']) {
      assert.throws(() => resolvePaperEndpoint({ platform: 'native', development: false, configured }));
    }
  });
  await test('service serializes upstream requests and waits at least 3 seconds', async () => {
    let clock = instant, active = 0, maximum = 0;
    const calls = [];
    const service = createArxivService({ now: () => clock, sleep: async (ms) => { clock += ms; },
      fetcher: async () => { calls.push(clock); maximum = Math.max(maximum, ++active); await Promise.resolve(); active--; return new Response(xml()); } });
    await Promise.all([service.get(normalize({ query: 'one' })), service.get(normalize({ query: 'two' }))]);
    assert.equal(maximum, 1); assert.ok(calls[1] - calls[0] >= 3000);
  });
  await test('identical requests coalesce and daily cache avoids extra fetches', async () => {
    let clock = instant, calls = 0;
    const service = createArxivService({ now: () => clock, sleep: async (ms) => { clock += ms; }, fetcher: async () => { calls++; return new Response(xml()); } });
    await Promise.all([service.get(request), service.get(request)]);
    assert.equal(calls, 1);
    assert.equal((await service.get(request)).serverCached, true);
    clock += PAPER_CACHE_TTL + 1;
    await service.get(request); assert.equal(calls, 2);
  });
  await test('queue has bounded capacity', async () => {
    let release;
    const gate = new Promise((resolve) => { release = resolve; });
    let clock = instant;
    const service = createArxivService({ now: () => clock, sleep: async (ms) => { clock += ms; }, fetcher: async () => { await gate; return new Response(xml()); } });
    const pending = ['a', 'b', 'c'].map((query) => service.get(normalize({ query })));
    await assert.rejects(service.get(normalize({ query: 'd' })), (error) => error instanceof PaperApiError && error.status === 429);
    release(); await Promise.all(pending);
  });
  await test('upstream failures do not poison later requests', async () => {
    let attempts = 0, clock = instant;
    const service = createArxivService({ now: () => clock, sleep: async (ms) => { clock += ms; },
      fetcher: async () => ++attempts === 1 ? new Response('busy', { status: 429 }) : new Response(xml()) });
    await assert.rejects(service.get(request), (error) => error.status === 429);
    await assert.rejects(service.get(request), (error) => error.status === 429 && error.retryAfter > 0);
    assert.equal(attempts, 1, 'Do not retry upstream during cooldown');
    clock += 300_001;
    assert.equal((await service.get(request)).papers.length, 1);
  });
  await test('upstream redirects are rejected without being followed', async () => {
    const service = createArxivService({ fetcher: async (_url, options) => {
      assert.equal(options.redirect, 'manual');
      return new Response(null, {status:302, headers:{Location:'https://example.test/untrusted'}});
    } });
    await assert.rejects(service.get(request), (error) => error instanceof PaperApiError && error.status === 502);
  });
  console.log(JSON.stringify({ paperChecks: checks, status: 'passed' }, null, 2));
  const liveIndex = process.argv.indexOf('--live');
  if (liveIndex !== -1) {
    const base = process.argv[liveIndex + 1] || 'http://127.0.0.1:8082/api/papers';
    const url = new URL(base); url.search = new URLSearchParams({ category: 'probability', sort: 'updated', start: '0' });
    const response = await fetch(url, { signal: AbortSignal.timeout(45_000) });
    const raw = await response.json();
    assert.equal(response.status, 200, JSON.stringify(raw));
    const live = decode(raw);
    assert.ok(live.papers.length > 0);
    console.log(JSON.stringify({ liveApi: 'passed', loaded: live.papers.length, firstId: live.papers[0].versionedId, fetchedAt: live.fetchedAt }, null, 2));
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
