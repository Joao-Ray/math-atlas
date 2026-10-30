// Build outputs only: reuse the existing offline MathJax renderer, never ship React Native.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ts = require('typescript');
const sharp = require('sharp');
const zlib = require('node:zlib');
const previous = require.extensions['.ts'];
require.extensions['.ts'] = (mod, filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, filename);
let content, daily;
try { content = require('../../data/mockData.ts'); daily = require('../../data/dailyLimits.ts'); }
finally { if (previous) require.extensions['.ts'] = previous; else delete require.extensions['.ts']; }
const base = '../../node_modules/react-native-mathjax-html-to-svg/mathjax/';
const { mathjax } = require(base + 'mathjax');
const { TeX } = require(base + 'input/tex');
const { SVG } = require(base + 'output/svg');
const { liteAdaptor } = require(base + 'adaptors/liteAdaptor');
const { RegisterHTMLHandler } = require(base + 'handlers/html');
require(base + 'input/tex/ams/AmsConfiguration');
const adaptor = liteAdaptor(); RegisterHTMLHandler(adaptor);
const document = mathjax.document('', { InputJax: new TeX({ packages: ['base', 'ams'] }), OutputJax: new SVG({ fontCache: 'none' }) });
const formulas = new Set();
function visit(value, key) {
  if (typeof value === 'string' && ['latex', 'expression', 'formulas'].includes(key)) formulas.add(value);
  else if (Array.isArray(value)) value.forEach((item) => visit(item, key));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([name, item]) => visit(item, name));
}
visit({ formulas: content.formulas, problems: content.problems, daily: daily.dailyLimitBank });
const out = path.resolve(__dirname, '../src/generated');
fs.mkdirSync(out, { recursive: true });
const serialized = JSON.stringify(Object.fromEntries(['courses', 'topics', 'formulas', 'problems', 'papers'].map(key => [key, content[key]])));
const packed = zlib.deflateSync(Buffer.from(serialized), { level: 9 }).toString('base64');
fs.writeFileSync(path.join(out, 'content.ts'), [
  "import type { Course, Topic, Formula, Problem, Paper } from '../../../types';",
  "import { decodeContent } from '../lib/contentCodec';",
  `const content = decodeContent(${JSON.stringify(packed)}) as { courses: Course[]; topics: Topic[]; formulas: Formula[]; problems: Problem[]; papers: Paper[] };`,
  'export const { courses, topics, formulas, problems, papers } = content;',
  'export const courseById = (id: string) => courses.find(item => item.id === id);',
  'export const topicById = (id: string) => topics.find(item => item.id === id);',
  'export const formulaById = (id: string) => formulas.find(item => item.id === id);',
  'export const problemById = (id: string) => problems.find(item => item.id === id);',
].join('\n') + '\n');
const manifest = {};
async function main() {
  for (const latex of formulas) {
    const hash = crypto.createHash('sha256').update(latex).digest('hex').slice(0, 20);
    const folder = path.join(out, 'math');
    fs.mkdirSync(folder, { recursive: true });
    let svg = adaptor.innerHTML(document.convert(latex, { display: true }));
    if (svg.includes('data-mjx-error')) throw new Error('Invalid TeX: ' + latex);
    svg = svg.match(/<svg\b[\s\S]*<\/svg>/)?.[0];
    if (!svg) throw new Error('Missing SVG: ' + latex);
    const exWidth = parseFloat(/\bwidth="([\d.]+)ex"/.exec(svg)?.[1]);
    const exHeight = parseFloat(/\bheight="([\d.]+)ex"/.exec(svg)?.[1]);
    if (!(exWidth > 0 && exHeight > 0)) throw new Error('Missing dimensions: ' + latex);
    const width = Math.ceil(exWidth * 10), height = Math.ceil(exHeight * 10);
    svg = svg.replace(/\bwidth="[^"]+"/, `width="${Math.ceil(width * 1.5)}"`)
      .replace(/\bheight="[^"]+"/, `height="${Math.ceil(height * 1.5)}"`).replace(/currentColor/g, '#172b23');
    // Eight antialiasing levels retain the 1.5x raster dimensions while reducing offline package size.
    await sharp(Buffer.from(svg)).png({ palette: true, colors: 8, dither: 0, compressionLevel: 9 }).toFile(path.join(folder, hash + '.png'));
    manifest[latex] = { src: `/assets/math/${hash}.png`, width, height };
  }
  await sharp(path.resolve(__dirname, '../../assets/images/lemivanta-avatar-v1.png')).resize(192, 192).png().toFile(path.join(out, 'brand.png'));
  fs.writeFileSync(path.join(out, 'math-assets.ts'), 'export type MathAsset = { src: string; width: number; height: number };\nexport const mathAssets: Record<string, MathAsset> = ' + JSON.stringify(manifest) + ';\n');
  console.log(JSON.stringify({ generatedMathImages: formulas.size, bundledLocally: true, logo: '192 x 192', networkRequests: 0 }));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
