import { Share } from 'react-native';

export async function shareStudyBackup(text: string) {
  const result = await Share.share({ title: 'MathAtlas 学习记录备份', message: text });
  return result.action === Share.dismissedAction ? '已取消分享。备份文本仍保留在本页。' : '已调用系统分享。请自行确认备份是否已保存到选定位置。';
}
