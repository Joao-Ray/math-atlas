# MathAtlas MVP

一个使用 React Native、Expo Router 与 TypeScript 制作的大学数学学习 App，可继续构建为 TestFlight / App Store 版本。

## 已实现

- Home：首页学习进度、今日公式、每日一题、论文探索
- Topics：5 门课程、40 个知识点、中英文搜索和课程筛选
- Topic Detail：直觉、定义、前置知识、相关例题与论文，10 个基础知识点包含学习方法和易错点
- Formulas：51 条公式、关键公式适用条件、离线 MathJax → SVG 渲染与搜索
- Problems：40 道经典例题，覆盖全部 40 个知识点，支持课程/难度/完成状态组合筛选
- Papers：12 篇已核对 arXiv 来源的精选论文，包含中文阅读建议、知识点双向关联与摘要搜索
- 我的学习：知识点/公式收藏、例题完成状态和本地进度
- 设置与隐私：本地数据清除、应用内隐私政策
- iOS、Android 与 Web 共用一套页面和路由

> 论文列表来自本地精选数据，并非实时更新。条目的标题、作者、日期和 arXiv 链接已核对；接入后端时可替换为实时检索。

## 本地运行

### 1. 准备环境

安装 Node.js LTS，并在手机上安装 Expo Go（或准备 iOS/Android 模拟器）。

### 2. 安装依赖

```bash
cd math-atlas
npm install
```

也可以使用项目生成时使用的 pnpm：

```bash
pnpm install
```

### 3. 启动

```bash
npm run start
```

然后：

- 手机：用 Expo Go 扫描终端二维码
- iOS 模拟器：按 `i`
- Android 模拟器：按 `a`
- 浏览器：按 `w`，或运行 `npm run web`

### 4. 类型检查

```bash
npm run typecheck
```

## 目录

```text
app/
  (tabs)/             5 个底部主页面
  topic/[slug].tsx    知识点详情
  problem/[id].tsx    例题详情
  saved.tsx           我的收藏与完成记录
  settings.tsx        设置和本地数据管理
  privacy.tsx         应用内隐私政策
components/           通用布局、卡片、搜索、公式组件
constants/            颜色与间距
contexts/             本地学习状态与持久化
data/mockData.ts      第一版全部本地数据
store/                App Store 文案、隐私政策与提交清单
types/                领域模型类型
```

## iOS / App Store 准备

项目已包含 `eas.json`、Bundle ID、版本号、iOS Privacy Manifest、1024×1024 图标和商店元数据草案。

在拥有 Expo 账号与有效 Apple Developer Program 会员后：

```bash
npx eas-cli login
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --profile production
```

首次构建时，EAS 会引导创建或关联 Expo project，并配置 Apple 签名凭证。二进制上传后仍需在 App Store Connect 中填写截图、隐私 URL、审核联系人、年龄分级等信息，再手动提交审核。

提交前请逐项完成 [`store/submission-checklist.md`](./store/submission-checklist.md)，特别是确认 Bundle ID 归属和替换隐私政策中的联系邮箱。

## 下一阶段：接入后端

1. 保留现有类型，把 `data/mockData.ts` 替换为 `services/` 请求层。
2. 用 Supabase 或 Firebase 添加账户、收藏和学习进度。
3. 用定时任务同步 arXiv API，并在服务端完成去重、分类和摘要。
4. 为公式、知识点和例题增加稳定 ID，在数据库中建立关联表。
5. 最后再加入 AI 问答；每次提问都附带当前知识点和公式作为上下文。
