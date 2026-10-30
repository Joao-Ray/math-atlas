# 网页托管适配

当前公开网站复用根目录的 Expo 页面。`worker/index.ts` 是生产网站实际使用的请求分发：静态资源、SPA深链接和同域 `/api/papers`。不依赖微信审核或账号登录。

## 可重建的部署输入

先安装根依赖，并按 mini-program/README.md 安装独立客户端的依赖。当前准备脚本复用其 esbuild 来打包论文接口：

```bash
LEMIVANTA_WEB_EXPORT=1 pnpm exec expo export --platform web --output-dir /tmp/lemivanta-web
node scripts/prepare-site.cjs /tmp/lemivanta-web ./web-host
```

这会生成 public/ 静态资源、generated/app-shell.ts、generated/papers-api.js 与 source-app/ 快照；生成目录不提交 Git。准备脚本不下载用户教材、不复制环境密钥或学习记录。

Cloudflare Workers 可使用本目录 wrangler.jsonc，以自己的账号/项目名称配置后构建部署；在线论文通过同域路径提供。当前用户的网站由 Sites 托管，Sites 源码仓库与GitHub开源仓库是两个独立发布目标。在GitHub提交代码不会自动更新线上站点。

本仓库不包含现有站点的发布凭据或账户绑定。请部署自己的项目；保留第三方许可和数据隐私说明。
