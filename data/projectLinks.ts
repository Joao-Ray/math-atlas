export const PROJECT_REPOSITORY_URL = 'https://github.com/Joao-Ray/math-atlas';
export const PROJECT_WEBSITE_URL = 'https://lemivanta-math.hangruij.chatgpt.site';
export const PROJECT_ISSUES_URL = `${PROJECT_REPOSITORY_URL}/issues`;

// Only public question context is selected; no learner state is accepted or read.
export function problemFeedbackUrl(problem: { id: string; title: string }): `https://${string}` {
  const title = `[题目纠错] ${problem.title.slice(0, 120)}`;
  const body = [
    `题目 ID：${problem.id}`,
    `题目链接：${PROJECT_WEBSITE_URL}/problem/${encodeURIComponent(problem.id)}`,
    '', '## 问题位置', '请说明是题干、条件、公式、步骤还是答案有问题。',
    '', '## 建议修正及依据', '请补充推导或可公开查阅的参考资料。',
    '', '提交前请删除个人信息；无需附上学习草稿或备份文件。',
  ].join('\n');
  return `${PROJECT_ISSUES_URL}/new?${new URLSearchParams({ title, body })}`;
}
