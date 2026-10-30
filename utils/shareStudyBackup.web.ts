export async function shareStudyBackup(text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `MathAtlas-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  try { link.click(); } finally { link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
  return '已发起备份文件下载，请检查浏览器的下载列表。';
}
