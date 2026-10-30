import { router, Stack } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/AppScreen';
import { MathFormula } from '@/components/MathFormula';
import { PageTitle, SectionTitle } from '@/components/Typography';
import { palette, radii, spacing } from '@/constants/Theme';
import { useStudy } from '@/contexts/StudyContext';
import { getDailyLimitProblems, getDailyLimitSummary } from '@/data/dailyLimits';
import { getPracticeStats } from '@/data/studyState';
import { useLocalDay } from '@/hooks/useLocalDay';

export default function StudyCalendarScreen() {
  const today = useLocalDay();
  const { dailyLimitRecords, hydrated } = useStudy();
  const [selected, setSelected] = useState(today);
  useEffect(() => setSelected(today), [today]);
  const stats = useMemo(() => getPracticeStats(dailyLimitRecords, today), [dailyLimitRecords, today]);
  const summary = getDailyLimitSummary(dailyLimitRecords, selected);
  return <AppScreen>
    <Stack.Screen options={{ title: '学习日历' }} />
    <PageTitle subtitle="至少完成 1 道每日题的自评，才计为一个练习日。">看见自己的积累</PageTitle>
    {!hydrated ? <Text style={styles.body}>正在读取学习记录…</Text> : <>
      <View style={styles.metrics}>
        {[['当前连续', stats.currentStreak], ['最长连续', stats.longestStreak], ['累计练习', stats.activeDays]].map(([title, value]) => <View key={title} style={styles.metric}>
          <Text style={styles.metricNumber}>{value}<Text style={styles.unit}> 天</Text></Text>
          <Text style={styles.metricLabel}>{title}</Text>
        </View>)}
      </View>
      <Text style={styles.small}>当前连续天数计算到今天；今天尚未自评时，计算到昨天。自由练习、只写草稿或只看解析不计入。重做、恢复或修改自评后会重新统计。</Text>
      <SectionTitle>最近 28 天</SectionTitle>
      <Text style={styles.small}>深色代表当日 3 题都已自评，浅色代表已自评 1–2 题。点击日期查看记录，不会修改作答。</Text>
      <View style={styles.grid}>
        {stats.calendar.map((entry) => <View key={entry.date} style={styles.cellWrap}>
          <Pressable accessibilityRole="button" accessibilityLabel={`${entry.date}，已自评${entry.assessed}道题`}
            accessibilityState={{ selected: selected === entry.date }} onPress={() => setSelected(entry.date)}
            style={[styles.cell, entry.assessed > 0 && styles.partial, entry.assessed === 3 && styles.full, selected === entry.date && styles.selected]}>
            <Text style={[styles.cellDate, entry.assessed === 3 && styles.white]}>{entry.date.slice(5).replace('-', '/')}</Text>
            <Text style={[styles.cellCount, entry.assessed === 3 && styles.white]}>{entry.assessed}/3</Text>
            {entry.date === today ? <Text style={[styles.today, entry.assessed === 3 && styles.white]}>今天</Text> : null}
          </Pressable>
        </View>)}
      </View>
      <SectionTitle>{selected} 的记录</SectionTitle>
      <Text style={styles.body}>已自评 {summary.assessed}/3 · 自评做对 {summary.correct} · 还需复习 {summary.review}</Text>
      {getDailyLimitProblems(selected).map((problem) => {
        const attempt = dailyLimitRecords[selected]?.[problem.id];
        const status = attempt?.result === 'correct' ? '自评做对' : attempt?.result === 'review' ? '还需复习'
          : attempt?.revealed ? '已看解析，未自评' : attempt?.draft ? '已有草稿，未自评' : '尚未作答';
        return <View key={problem.id} style={styles.card}>
          <Text style={styles.status}>{problem.level} · {status}</Text>
          <Text style={styles.title}>{problem.title}</Text>
          <MathFormula latex={problem.expression} compact />
          <Text selectable style={styles.body}>{attempt?.draft ? `当时的答案 / 思路：${attempt.draft}` : '没有输入答案。纸上作答不会自动记录。'}</Text>
        </View>;
      })}
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" accessibilityLabel="从日历开始今日练习" onPress={() => router.push('/daily-limits')} style={styles.button}>
          <Text style={styles.buttonText}>做今日 3 题 →</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="从日历打开待复习" onPress={() => router.push('/limit-review')} style={styles.button}>
          <Text style={styles.buttonText}>查看待复习 →</Text>
        </Pressable>
      </View>
      <Text style={styles.small}>仅根据当前设备或导入的本地记录统计，不代表全部学习时长或客观成绩。</Text>
    </>}
  </AppScreen>;
}

const styles = StyleSheet.create({
  metrics: { flexDirection: 'row', backgroundColor: palette.green, padding: spacing.md, borderRadius: radii.lg },
  metric: { flex: 1, alignItems: 'center' },
  metricNumber: { fontSize: 28, color: palette.white, fontWeight: '800' },
  metricLabel: { color: '#D8E7DE', fontSize: 12, marginTop: 4 },
  unit: { fontSize: 12 },
  small: { fontSize: 12, color: palette.muted, lineHeight: 20, marginVertical: 7 },
  body: { fontSize: 14, color: palette.muted, lineHeight: 23 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -3, marginTop: 10 },
  cellWrap: { width: '14.285714%', padding: 3 },
  cell: { minHeight: 70, borderRadius: 9, backgroundColor: palette.surface, borderWidth: 2, borderColor: palette.line, alignItems: 'center', justifyContent: 'center' },
  partial: { backgroundColor: palette.greenSoft },
  full: { backgroundColor: palette.green },
  selected: { borderColor: palette.gold },
  cellDate: { fontSize: 10, color: palette.ink, fontWeight: '700' },
  cellCount: { fontSize: 11, color: palette.muted, marginTop: 3 },
  white: { color: palette.white },
  today: { fontSize: 9, color: palette.green, marginTop: 2 },
  card: { backgroundColor: palette.surface, borderRadius: radii.md, borderColor: palette.line, borderWidth: 1, padding: spacing.md, marginTop: spacing.md },
  title: { color: palette.ink, fontSize: 16, lineHeight: 24, fontWeight: '700', marginTop: 6 },
  status: { color: palette.green, fontSize: 12, fontWeight: '700' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: spacing.md },
  button: { borderWidth: 1, borderColor: palette.green, padding: 14, borderRadius: radii.md },
  buttonText: { color: palette.green, fontWeight: '700', fontSize: 13 },
});
