const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const ts = require('typescript');
const filename = path.resolve(__dirname, '../src/lib/contentCodec.ts');
assert.ok(fs.existsSync(filename), 'Offline content codec must exist');
const previous = require.extensions['.ts'];
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, f);
try {
  const { decodeContent } = require(filename);
  for (const text of ['微积分 ∫ x² dx — 你好 😀', '', 'a', 'ab', 'abc', 'abcd', 'x'.repeat(32769)]) {
    const fixture = { text, nested: [{ id: 'stable-id', value: 0 }], zero: null };
    const packed = zlib.deflateSync(Buffer.from(JSON.stringify(fixture))).toString('base64');
    assert.deepEqual(decodeContent(packed), fixture);
  }
  for (const bad of ['', 'not base64!', 'AAAA']) assert.throws(() => decodeContent(bad));
  // The actual generated module is checked as well, not just the codec in isolation.
  const source = require('../../data/mockData.ts');
  const generated = require('../src/generated/content.ts');
  for (const key of ['courses', 'topics', 'formulas', 'problems', 'papers']) assert.deepEqual(generated[key], JSON.parse(JSON.stringify(source[key])));
  assert.equal(generated.topicById('limits').id, 'limits');
  assert.equal(generated.problemById('does-not-exist'), undefined);
  console.log(JSON.stringify({ status: 'passed', problems: generated.problems.length, scope: 'Offline UTF-8 decompression and full generated-data parity' }));
} finally {
  if (previous) require.extensions['.ts'] = previous;
  else delete require.extensions['.ts'];
}
