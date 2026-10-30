# 参与 Lemivanta

欢迎纠正数学错误、改善讲解与可访问性，或修复页面问题。项目使用 React Native、Expo Router 和 TypeScript；网站与移动端复用课程和学习记录逻辑。

## 本地运行

需要 Node.js 24 与 pnpm 10。

```bash
git clone https://github.com/Joao-Ray/math-atlas.git
cd math-atlas
corepack enable
pnpm install --frozen-lockfile
pnpm web
```

打开开发服务打印的网址。论文服务使用同域 `/api/papers`；除在线论文外，核心练习使用随项目提供的数据，不需要账号或 API 密钥。不要在公开反馈中填写个人学习内容。

## 修改与验证

从 main 创建自己的分支。提交前运行：

```bash
pnpm test
pnpm typecheck
```

Web 客户端导出：`LEMIVANTA_WEB_EXPORT=1 pnpm exec expo export --platform web --output-dir /tmp/lemivanta-web`。该导出是前端；公开部署还需服务端论文接口。网站适配参考 web-host/README.md。

微信客户端位于 mini-program/，有独立依赖及构建方式，见其 README。开源参与者需使用自己的微信 AppID；不要上传 AppSecret、签名密钥或私有配置。

## 数学内容

- 提供定义、适用条件、推导步骤、答案与可核查的参考依据。
- 原创题、参数变式和资料题必须明确区分；不要把自编题标为历年真题。
- 使用新的稳定 ID；不要重排旧 ID 或更改学习记录格式。检查知识点、公式与题目的双向关联。
- 不提交整本教材、扫描 PDF、受限付费内容或未经许可的大段教材文字。第三方材料保留来源与许可，见 THIRD_PARTY_NOTICES.md。

## 反馈与 Pull Request

题目详情的“反馈这道题”只打开 GitHub 草稿，不自动提交。请说明题号、错误位置、建议修正与依据；普通界面问题请描述复现步骤和期望结果。提交前搜索现有 Issues，避免重复。

PR 请说明问题、修改后的行为与验证结果。先完成测试，再请求维护者审阅；无需重写与本次修改无关的文件。

项目自编代码适用 MIT。第三方资料的权利不因向本项目贡献而改变。
