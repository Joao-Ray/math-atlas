import { Stack } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppScreen } from '@/components/AppScreen';
import { PageTitle, SectionTitle } from '@/components/Typography';
import { palette, radii, spacing } from '@/constants/Theme';
import { useStudy } from '@/contexts/StudyContext';
import { createStudyBackup, parseStudyBackup, summarizeStudyState } from '@/data/studyState';
import { shareStudyBackup } from '@/utils/shareStudyBackup';

export default function StudyBackupScreen() {
  const { snapshot, hydrated, restoreBackup } = useStudy();
  const [exportText, setExportText] = useState('');
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState<ReturnType<typeof parseStudyBackup> | null>(null);
  const [message, setMessage] = useState('');
  const totals = summarizeStudyState(snapshot);
  const inspect = () => {
    try { setPreview(parseStudyBackup(input)); setMessage('格式检查通过。请核对下方摘要，再决定是否合并恢复。'); }
    catch (error) { setPreview(null); setMessage(error instanceof Error ? error.message : '备份读取失败。'); }
  };
  return <AppScreen>
    <Stack.Screen options={{ title: '学习记录备份' }} />
    <PageTitle subtitle="手动备份和跨设备迁移，不需要登录。">把学习记录留好</PageTitle>
    <View style={styles.notice}><Text style={styles.body}>备份含有你输入的答案和思路。仅保存或分享给你信任的位置，不要公开发布。App 不会自动上传；选择系统分享后，由你选择的应用或服务处理。</Text></View>
    {!hydrated ? <Text style={styles.body}>正在读取本机记录…</Text> : <>
      <SectionTitle>导出当前记录</SectionTitle>
      <Text style={styles.body}>收藏 {totals.favorites} 项 · 完成例题 {totals.completed} 道 · 每日作答 {totals.dailyAttempts} 条 · 自由/复习草稿 {totals.drafts} 条</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="生成学习备份文本" style={styles.button}
        onPress={() => {
          try { setExportText(createStudyBackup(snapshot)); setMessage('已生成当前记录的快照。之后的新作答需要重新生成备份。'); }
          catch (error) { setMessage(error instanceof Error ? error.message : '备份生成失败，请勿清除原数据。'); }
        }}>
        <Text style={styles.buttonText}>{exportText ? '重新生成备份快照' : '生成备份文本'}</Text>
      </Pressable>
      {exportText ? <>
        <TextInput accessibilityLabel="可复制的学习备份文本" value={exportText} editable={false} multiline selectTextOnFocus style={styles.code} />
        <Pressable accessibilityRole="button" accessibilityLabel="下载或分享学习备份" style={styles.button} onPress={async () => {
          try { setMessage(await shareStudyBackup(exportText)); } catch { setMessage('无法下载或分享，请手动复制上方完整备份文本并妥善保存。'); }
        }}><Text style={styles.buttonText}>{Platform.OS === 'web' ? '下载 JSON 备份文件' : '用系统分享保存备份文本'}</Text></Pressable>
        <Text style={styles.small}>也可手动复制上方完整文本。在另一台设备打开 MathAtlas，粘贴到下方恢复区。仅生成文本不会上传数据。</Text>
      </> : null}
      <SectionTitle>合并恢复备份</SectionTitle>
      <Text style={styles.body}>打开之前保存的 JSON 文件并复制全文，或使用之前保存的完整备份文本。收藏和完成状态取并集；同一天同一道题、同名草稿发生冲突时保留本机记录，不覆盖。</Text>
      <TextInput accessibilityLabel="粘贴学习备份文本" value={input} onChangeText={(text) => { setInput(text); setPreview(null); setMessage(''); }}
        multiline maxLength={2_000_001} autoCorrect={false} autoCapitalize="none" textAlignVertical="top"
        placeholder="在此粘贴完整 MathAtlas JSON 备份" placeholderTextColor={palette.muted} style={styles.input} />
      <Pressable accessibilityRole="button" accessibilityLabel="检查学习备份" onPress={inspect} style={styles.button}><Text style={styles.buttonText}>先检查备份，不修改记录</Text></Pressable>
      {preview ? <View style={styles.notice}>
        <Text style={styles.body}>备份导出时间：{preview.exportedAt}</Text>
        <Text style={styles.body}>{(() => { const count = summarizeStudyState(preview.state); return `收藏 ${count.favorites} 项 · 完成例题 ${count.completed} 道 · 每日作答 ${count.dailyAttempts} 条 · 草稿 ${count.drafts} 条`; })()}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="确认合并恢复学习备份" style={[styles.button, styles.primary]}
          onPress={() => { restoreBackup(preview.state); setPreview(null); setInput(''); setMessage('已合并到当前学习记录，正在自动保存；同名记录保留本机版本。请留意本地保存错误提示，并保留原备份。'); }}>
          <Text style={styles.white}>确认合并恢复（保留本机同名记录）</Text>
        </Pressable>
      </View> : null}
      {message ? <Text accessibilityRole="alert" style={styles.message}>{message}</Text> : null}
      <Text style={styles.small}>清除 App 数据不会删除你另外保存的备份文件。新旧设备不会自动同步；导入后可以在学习日历核对。仅支持 MathAtlas 备份格式，版本或题目不兼容时拒绝导入。</Text>
    </>}
  </AppScreen>;
}

const styles = StyleSheet.create({
  notice: { backgroundColor: palette.greenSoft, padding: spacing.md, borderRadius: radii.md, marginVertical: 12 },
  body: { color: palette.ink, fontSize: 14, lineHeight: 24 },
  small: { color: palette.muted, fontSize: 12, lineHeight: 20, marginTop: 8 },
  button: { borderWidth: 1, borderColor: palette.green, padding: 14, borderRadius: radii.md, alignItems: 'center', marginTop: 12 },
  buttonText: { color: palette.green, fontSize: 14, fontWeight: '700' },
  primary: { backgroundColor: palette.green },
  white: { color: palette.white, fontSize: 13, fontWeight: '700' },
  input: { minHeight: 160, maxHeight: 280, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, borderRadius: radii.md, padding: 12, color: palette.ink, fontSize: 14, lineHeight: 22, marginTop: 12 },
  code: { height: 180, borderWidth: 1, borderColor: palette.line, padding: 12, borderRadius: radii.md, color: palette.ink, backgroundColor: palette.surface, fontSize: 12, lineHeight: 18, marginTop: 12 },
  message: { backgroundColor: palette.greenSoft, color: palette.green, padding: spacing.md, borderRadius: radii.md, marginTop: spacing.md, lineHeight: 23 },
});
