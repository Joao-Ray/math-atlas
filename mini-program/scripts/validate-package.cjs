const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../dist');
const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
assert.equal(app.tabBar.list.length, 5);
assert.equal(app.pages.length, 15);
assert.ok(app.pages.includes('pages/roadmap/index'));
assert.ok(app.pages.includes('pages/acceptance/index'));
assert.ok(app.pages.includes('pages/review/index'));
assert.ok(app.pages.includes('pages/textbooks/index'));
const packages = app.subPackages ?? [];
for (const page of [...app.pages, ...packages.flatMap((pack) => pack.pages.map((page) => pack.root + '/' + page))]) {
  for (const ext of ['.js', '.json', '.wxml']) assert.ok(fs.existsSync(path.join(root, page + ext)), 'Missing page: ' + page + ext);
}
const sizes = { main: 0 }, files = [];
for (const pack of packages) sizes[pack.root] = 0;
function walk(dir) { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
  const target = path.join(dir, entry.name); if (entry.isDirectory()) walk(target);
  else { const relative = path.relative(root, target).replaceAll(path.sep, '/'); files.push(relative);
    const pack = packages.find((item) => relative.startsWith(item.root + '/'));
    sizes[pack?.root ?? 'main'] += fs.statSync(target).size;
  }
} }
walk(root);
// Conservative local budgets, not a claim about the user's account-specific upload limits.
for (const [pack, bytes] of Object.entries(sizes)) assert.ok(bytes < 2 * 1024 * 1024, pack + ' exceeds the local 2 MiB budget: ' + bytes);
assert.ok(Object.values(sizes).reduce((a, b) => a + b, 0) < 20 * 1024 * 1024);
assert.ok(files.includes('assets/brand.png'));
assert.ok(!files.some((file) => /\.pdf$|\.map$|\.tsx?$|\.env/.test(file)));
const manifestSource = fs.readFileSync(path.resolve(__dirname, '../src/generated/math-assets.ts'), 'utf8');
const marker = 'export const mathAssets: Record<string, MathAsset> = ';
const manifest = JSON.parse(manifestSource.slice(manifestSource.indexOf(marker) + marker.length).trim().replace(/;$/, ''));
for (const asset of Object.values(manifest)) {
  const filename = path.join(root, asset.src);
  assert.ok(fs.existsSync(filename), 'Missing formula image: ' + asset.src);
  assert.ok(asset.width > 0 && asset.height > 0);
  const png = fs.readFileSync(filename);
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'Invalid formula PNG: ' + asset.src);
  assert.equal(png.readUInt32BE(16), Math.ceil(asset.width * 1.5));
  assert.equal(png.readUInt32BE(20), Math.ceil(asset.height * 1.5));
}
const project = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../project.config.json'), 'utf8'));
assert.equal(project.appid, 'wx44f87bace7f3937f'); assert.equal(project.miniprogramRoot, 'dist/');
console.log(JSON.stringify({ pages: app.pages.length, mathBundles: packages.length, formulaImages: Object.keys(manifest).length, bytes: sizes, headroomBytes: Object.fromEntries(Object.entries(sizes).map(([pack, bytes]) => [pack, 2 * 1024 * 1024 - bytes])), status: 'passed', scope: 'Build artifacts and conservative budgets; not platform review.' }, null, 2));
