import { CLIENT_BUILD, CLIENT_VERSION } from './release';

export const acceptanceCases = [
  { id: 'navigation', title: '启动与五个底部入口', steps: '在手机打开，依次进入首页、知识、公式、例题、我的；返回无白屏，底部按钮不被遮挡。' },
  { id: 'formulas', title: '公式清楚且可左右滑动', steps: '查看下方示例，再搜索“链式法则”；分式、上下标、矩阵应清楚，长公式可滑到最右端。' },
  { id: 'filters', title: '搜索与竞赛筛选', steps: '公式搜索“链式法则”应为 1 条。例题 → 竞赛题库：全部 20、真题 12、训练题 8；清除关键词和课程等筛选后再核对。' },
  { id: 'solutions', title: '提示与答案分开', steps: '新打开一题时参考答案隐藏；提示按钮只显示提示，点击查看详细解析后才出现步骤和答案。返回列表不报错。' },
  { id: 'daily', title: '每日练习与键盘', steps: '每日 3 题，输入一段测试思路，键盘不遮挡输入；退出并重新进入，草稿仍在。查看解析后自评，“还需复习”的题能在待复习中找到。使用你自己的测试记录，不清空已有数据。' },
  { id: 'records', title: '收藏与重进保存', steps: '收藏一个知识点和公式，在“我的”能找到；关闭小程序重新进入仍保留。取消测试收藏后数量恢复。学习日历与自评数量一致。' },
  { id: 'backup', title: '备份与取消恢复', steps: '先导出真实记录并安全保存；检查同一备份不会更改记录，恢复弹窗点取消不会合并。另在测试记录上确认合并，重复恢复不重复计数。不要用清除记录测试。' },
  { id: 'offline', title: '离线与论文说明', steps: '成功下载预览版后，手机断网查看已打包的知识、公式和题目仍正常。论文页应写明本地精选，不声称实时更新；恢复网络后再反馈。' },
] as const;
export type CaseId = typeof acceptanceCases[number]['id'];
export type Verdict = 'pending' | 'pass' | 'fail';
export type Verdicts = Partial<Record<CaseId, Verdict>>;
export type DeviceSummary = { platform: string; model: string; system: string; wechat: string; sdk: string; viewport: string };
export function isPhone(platform: string) { return platform === 'ios' || platform === 'android'; }
export function summarizeAcceptance(verdicts: Verdicts, platform: string) {
  const count = (status: Verdict) => acceptanceCases.filter((item) => (verdicts[item.id] ?? 'pending') === status).length;
  const passed = count('pass'), failed = count('fail'), pending = count('pending');
  return { passed, failed, pending, phone: isPhone(platform), complete: isPhone(platform) && passed === acceptanceCases.length };
}
export function acceptanceReport(verdicts: Verdicts, device: DeviceSummary, notes: string, time: string) {
  const summary = summarizeAcceptance(verdicts, device.platform);
  const label = { pending: '待测', pass: '本人确认通过', fail: '发现问题' };
  return [
    `Lemivanta ${CLIENT_VERSION} / ${CLIENT_BUILD} 手机验收反馈`, `时间：${time}`,
    `设备：${device.model} · ${device.system} · ${device.platform}`,
    `微信：${device.wechat} · 基础库：${device.sdk} · 窗口：${device.viewport}`,
    summary.complete ? '结论：用户手动确认 8 项通过（不是自动测试、平台审核或正式发布）。' : '结论：真机验收尚未完成。',
    !summary.phone ? '当前未识别为 iOS/Android 手机；模拟器勾选不能视为真机通过。' : '以下为本人逐项操作后的自报结果，需结合实际现象复核。',
    ...acceptanceCases.map((item) => `${item.title}：${label[verdicts[item.id] ?? 'pending']}`),
    `问题说明：${notes.trim().slice(0, 1200) || '未填写（不等于没有问题）'}`,
    '此报告不包含学习草稿、备份内容、账号、手机号或设备唯一标识；仅由用户点击后复制，不自动上传。',
  ].join('\n');
}
