# MathAtlas MVP

一个使用 React Native、Expo Router 与 TypeScript 制作的大学数学学习 App，可继续构建为 TestFlight / App Store 版本。

## 已实现

- Home：首页学习进度、今日公式、每日一题、论文探索
- Topics：5 门课程、50 个知识点，中英文搜索和课程筛选
- Topic Detail：直觉、定义、前置知识、相关例题与论文，20 个知识点包含学习方法和易错点
- Formulas：66 条公式，关键公式适用条件、10 条可展开的分步推导、离线 MathJax → SVG 渲染与搜索
- Problems：55 道经典例题，覆盖全部 50 个知识点，支持课程/难度/完成状态组合筛选
- Papers：16 篇已核对 arXiv 来源的精选论文，包含中文阅读建议、知识点双向关联与摘要搜索
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

### 4. 检查类型与学习内容

```bash
npm run typecheck
npm run validate:content
```

内容检查会验证稳定 ID、课程归属、知识点与例题/公式的双向关联、前置知识图是否有环、论文元数据格式，以及全部公式与解析中的 LaTeX 是否可离线渲染。它不能代替数学内容的人工复核，也不会在线核验论文。

## 本轮拓展内容

每门课程新增 2 个知识点，并为已有知识点增加复合求导、正交残差、全方差、后验预测与布朗鞅等进阶练习：

- 微积分：换元与分部积分、拉格朗日乘子与约束极值
- 线性代数：矩阵对角化、二次型与正定矩阵
- 概率论：随机变量变换、马尔可夫与切比雪夫不等式
- 统计学：未知方差的 t 推断、卡方拟合优度检验
- 随机过程：随机游走、泊松过程叠加与稀疏化

新增论文元数据于 2026-10-04 对照 arXiv 核对。列表日期统一使用首次提交日期，不代表最新修订日期。中文摘要与阅读建议为本地编辑内容，仅提供阅读入口：

- [Scientific Applications Leveraging Randomized Linear Algebra](https://arxiv.org/abs/2506.16457)
- [Unbiased Markov Chain Monte Carlo: what, why, and how](https://arxiv.org/abs/2406.06851)
- [Concentration Inequalities for Statistical Inference](https://arxiv.org/abs/2011.02258)
- [Randomized Numerical Linear Algebra: Foundations & Algorithms](https://arxiv.org/abs/2002.01387)

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
data/mockData.ts      汇总数据与查询函数
data/extensions.ts    新增知识点、公式、例题与已核对论文
data/formulaDerivations.ts  现有核心公式的分步推导
scripts/validate-content.cjs  离线内容完整性与 LaTeX 检查
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
