import { defineConfig } from '@tarojs/cli';
import path from 'node:path';
import { NormalModuleReplacementPlugin } from 'webpack';

export default defineConfig({
  projectName: 'Lemivanta',
  date: '2026-10-16',
  designWidth: 750,
  deviceRatio: { 640: 1.17, 750: 1, 828: 0.905 },
  sourceRoot: 'src',
  outputRoot: 'dist',
  framework: 'react',
  compiler: { type: 'webpack5', prebundle: { enable: false } },
  // Chinese text is smaller as UTF-8 than \uXXXX escapes; Terser still escapes
  // JavaScript syntax-sensitive characters. Offline formula PNGs stay unchanged.
  terser: { config: { output: { ascii_only: false } } },
  alias: { '@': path.resolve(__dirname, '../..') },
  cache: { enable: false },
  copy: { options: {}, patterns: [
    { from: 'src/generated/brand.png', to: 'dist/assets/brand.png' },
    { from: 'src/generated/math', to: 'dist/assets/math' },
  ] },
  mini: {
    webpackChain(chain) {
      chain.plugin('offline-compressed-content').use(NormalModuleReplacementPlugin, [
        /(?:^|[/\\])mockData(?:\.ts)?$/,
        (resource) => {
          const target = path.resolve(__dirname, '../src/generated/content.ts');
          resource.request = target;
          resource.context = path.dirname(target);
          if (resource.createData) {
            resource.createData.resource = target;
            resource.createData.context = path.dirname(target);
          }
        },
      ]);
    },
    compile: { include: [path.resolve(__dirname, '../../data'), path.resolve(__dirname, '../../types')] },
    postcss: { pxtransform: { enable: true }, url: { enable: true, config: { limit: 1024 } } },
  },
});
