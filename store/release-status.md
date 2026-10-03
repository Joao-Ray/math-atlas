# MathAtlas 1.0 发布状态

更新时间：2026-09-20

## 当前结论

项目代码已达到“可创建 TestFlight 构建”的准备状态，但尚未生成或上传 iOS 二进制。

## 已验证

- TypeScript 全量检查通过。
- Expo 能读取完整的 iOS 配置、Bundle ID、版本、图标和 Privacy Manifest。
- Web 生产导出成功，共生成 17 条静态路由。
- Expo SDK 依赖版本检查通过。
- 实际操作验证：首页进度、知识点收藏、我的学习、设置和隐私政策。

## 本次上传尝试的停止点

`expo whoami` 返回 `Not logged in`，因此无法创建 EAS project、生成签名的 `.ipa` 或上传 TestFlight。

真正继续构建前还需要：

1. 项目所有者在本机执行 `npx eas-cli login` 登录自己的 Expo 账号。
2. 确认拥有有效的 Apple Developer Program 会员。
3. 确认 `com.mathatlas.learning` 是最终且可用的 Bundle ID。
4. 提供隐私政策公开 HTTPS 地址、Support URL、联系邮箱与版权主体。

不要把 Apple ID 密码或二步验证码写入项目文件。EAS 在交互流程中需要时，应由账号所有者本人输入。
