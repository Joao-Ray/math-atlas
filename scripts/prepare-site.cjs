const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('../mini-program/node_modules/esbuild');
if (process.argv.length !== 4) throw new Error('Provide absolute Expo export and Site directories');
const [exportDirectory, destination] = process.argv.slice(2).map(value => path.resolve(value));
if (exportDirectory === destination || !fs.existsSync(path.join(exportDirectory, 'index.html'))) throw new Error('Missing Expo single-output index.html');
const root = path.resolve(__dirname, '..');
const publicDirectory = path.join(destination, 'public');
fs.mkdirSync(publicDirectory, { recursive: true });
fs.mkdirSync(path.join(destination, 'generated'), { recursive: true });
for (const entry of fs.readdirSync(exportDirectory)) if (entry !== 'index.html') fs.cpSync(path.join(exportDirectory, entry), path.join(publicDirectory, entry), { recursive: true });
let html = fs.readFileSync(path.join(exportDirectory, 'index.html'), 'utf8');
html = html.replace(/<html([^>]*)lang="[^"]*"/, '<html$1lang="zh-CN"').replace(/<title>[\s\S]*?<\/title>/, '<title>Lemivanta · 大学数学学习</title>');
html = html.replace('</head>', '<meta name="description" content="305 个知识点、1108 道分步解析题，覆盖十门大学数学课程。每日极限练习、公式库、论文检索。"><meta name="theme-color" content="#F4F1E8"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Lemivanta"><link rel="apple-touch-icon" href="/lemivanta-icon.png"><link rel="manifest" href="/manifest.webmanifest"></head>');
fs.writeFileSync(path.join(destination, 'generated/app-shell.ts'), 'export default '+JSON.stringify(html)+';\n');
const icon = fs.readFileSync(path.join(root, 'assets/images/lemivanta-avatar-v1.png'));
fs.writeFileSync(path.join(publicDirectory, 'lemivanta-icon.png'), icon);
const iconSize = `${icon.readUInt32BE(16)}x${icon.readUInt32BE(20)}`;
fs.writeFileSync(path.join(publicDirectory, 'manifest.webmanifest'), JSON.stringify({ name: 'Lemivanta 大学数学学习', short_name: 'Lemivanta', lang: 'zh-CN', start_url: '/', display: 'standalone', background_color: '#F4F1E8', theme_color: '#355B4A', icons: [{src:'/lemivanta-icon.png',sizes:iconSize,type:'image/png',purpose:'any'}] }, null, 2));
fs.writeFileSync(path.join(publicDirectory, 'robots.txt'), 'User-agent: *\nAllow: /\n');
esbuild.buildSync({ entryPoints: [path.join(root, 'app/api/papers+api.ts')], outfile: path.join(destination, 'generated/papers-api.js'), bundle: true, platform: 'browser', format: 'esm', target: 'es2022' });
// Deliberately exclude credentials, Git state, local records, PDFs and dependencies.
const snapshot = path.join(destination, 'source-app');
fs.mkdirSync(snapshot, { recursive: true });
for (const entry of ['app','assets','components','constants','contexts','data','hooks','services','server','types','utils','scripts','app.json','app.config.ts','package.json','pnpm-lock.yaml','tsconfig.json','expo-env.d.ts']) {
  const source = path.join(root, entry);
  if (fs.existsSync(source)) fs.cpSync(source, path.join(snapshot, entry), { recursive: true });
}
fs.writeFileSync(path.join(destination, 'generated/content-summary.json'), JSON.stringify({ version: '1.23.0', topics: 305, formulas: 321, problems: 1108, labelledNewVariants: 624 }, null, 2));
console.log(JSON.stringify({ status: 'prepared', destination, papersApi: true, sourceSnapshot: true }));
