# Lemivanta · MathAtlas

大学数学学习应用：知识点、公式、分步例题、每日练习与研究论文。使用 React Native、Expo Router 和 TypeScript，支持网页、iOS、Android；微信客户端独立构建。

**[访问公开网站](https://lemivanta-math.hangruij.chatgpt.site)** · [项目源码](https://github.com/Joao-Ray/math-atlas) · [参与贡献](./CONTRIBUTING.md)

当前应用版本 **1.23.0**。网站无需登录，学习记录保存在当前浏览器；iPhone 可用 Safari 打开后“分享 → 添加到主屏幕”。网页与本地开发域名的记录不会自动互通，可在应用内导出、导入备份。

## 内容

| 内容 | 数量 |
| --- | ---: |
| 大学数学课程 | 10 |
| 已完善知识点 | 305 |
| 公式 | 321 |
| 分步解析题 | 1108 |
| 独立每日极限题库 | 42 |
| 本地精选论文 | 16 |

课程覆盖微积分、线性代数、概率论、统计学、随机过程、高等代数、复变函数、解析几何、测度论、数学分析。每门70点的路线共700项，其中395项仍是待补目录，不计入已完善知识点。

1108题中含20道资料/训练竞赛题；最近十轮新增720题，624题明确标注为参数变式。参数变式不是624种不同解法；每日42题单独计数。题目来源、适用条件与勘误说明以数据和详情页为准。

## 功能

- 课程知识点、前置关联、公式条件和分步推导。
- 题库搜索、课程/难度/完成状态筛选、分批加载；提示与解析默认隐藏。
- 每日3道极限题、草稿、自评、待复习队列与学习日历。
- 本地收藏、完成记录以及手动备份、合并恢复。
- arXiv论文分类、关键词检索、分页和24小时缓存；本地精选独立保留。
- 设置中的源码与参与贡献页面；题目详情可打开GitHub纠错草稿，需用户自行提交。

在线论文只获取元数据，检索词会发送给论文服务和arXiv；不自动上传学习答案。更新在页面进入、前台恢复或缓存过期时尝试发生，不是后台实时推送。没有账号系统或跨设备云同步，也没有离线Service Worker保证。

## 本地运行

需要Node.js 24与pnpm 10：

```bash
git clone https://github.com/Joao-Ray/math-atlas.git
cd math-atlas
corepack enable
pnpm install --frozen-lockfile
pnpm web
```

打开终端打印的网址。也可使用 `pnpm start`，根据Expo提示在手机Expo Go或模拟器中打开。在线论文使用同域 `/api/papers`；无需填写密钥，配置示例见 [.env.example](./.env.example)。

```bash
pnpm test
pnpm typecheck
```

`pnpm test`运行课程关联、LaTeX渲染、学习状态/备份、路线、论文逻辑、历史内容及数值抽查等17组检查。它不能代替逐题数学审校或iPhone真机验收。

## 目录

```text
app/             页面、路由与论文API
components/      公式、卡片、布局等共享组件
data/            课程、题库、路线与纯学习逻辑
contexts/        学习状态和本地持久化
server/          arXiv来源解析、缓存与限流
services/        论文客户端
scripts/         内容检查和网站准备
mini-program/    独立微信客户端
web-host/        网页生产托管适配与重建说明
```

网页客户端导出：

```bash
LEMIVANTA_WEB_EXPORT=1 pnpm exec expo export --platform web --output-dir /tmp/lemivanta-web
```

该产物是前端，在线论文需要服务端接口；见 [托管说明](./web-host/README.md)。微信客户端使用自己的依赖、构建步骤和AppID，见 [微信说明](./mini-program/README.md)。本项目尚未发布到App Store或微信正式版。

## 贡献与许可

见 [贡献指南](./CONTRIBUTING.md)。题目详情中的“反馈这道题”仅预填公开编号、标题和链接，不读取个人草稿、答案或学习记录，不自动创建Issue。

项目代码采用[MIT许可](./LICENSE)，保留Expo原始署名。第三方题源、论文与字体保留各自权利，见[第三方说明](./THIRD_PARTY_NOTICES.md)。仓库不分发用户上传的教材PDF。
