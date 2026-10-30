import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen } from '@/components/AppScreen';
import { MathFormula } from '@/components/MathFormula';
import { LimitSolution } from '@/components/LimitSolution';
import { LimitMethodLinks } from '@/components/LimitMethodLinks';
import { PageTitle, SectionTitle } from '@/components/Typography';
import { palette, radii, spacing } from '@/constants/Theme';
import { useStudy } from '@/contexts/StudyContext';
import { dailyLimitBank, dailyLimitRotationDays, DailyLimitProblem, emptyDailyLimitAttempt, expandedRotationStarts, getDailyLimitProblems, getDailyLimitSummary, getLimitReviewItems } from '@/data/dailyLimits';
import { useLocalDay } from '@/hooks/useLocalDay';

function Exercise({ problem, day, index }: { problem: DailyLimitProblem; day: string; index: number }) {
  const { dailyLimitRecords, updateDailyLimit, restartDailyLimit } = useStudy();
  const attempt = dailyLimitRecords[day]?.[problem.id] ?? emptyDailyLimitAttempt;
  const [hintVisible, setHintVisible] = useState(false);
  const patch = (value: Parameters<typeof updateDailyLimit>[2]) => updateDailyLimit(day, problem.id, value);

  return (
    <View style={styles.card}>
      <Text style={styles.level}>第 {index + 1} 题 · {problem.level}{index === 2 ? '（可选做）' : ''}</Text>
      <Text style={styles.title}>{problem.title}</Text>
      <MathFormula latex={problem.expression} />
      <Text style={styles.label}>我的答案 / 思路</Text>
      <TextInput
        accessibilityLabel={`第${index + 1}题我的答案`}
        placeholder="先独立计算；也可以在纸上作答。"
        placeholderTextColor={palette.muted}
        value={attempt.draft}
        onChangeText={(draft) => patch({ draft })}
        multiline maxLength={1000} textAlignVertical="top" autoCorrect={false}
        style={styles.input}
      />
      <Text style={styles.small}>答案保存在当前设备。系统不自动判分，请对照解析后自评。</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`${hintVisible ? '收起' : '查看'}第${index + 1}题提示`}
        accessibilityState={{ expanded: hintVisible }} onPress={() => setHintVisible((value) => !value)} style={styles.outline}>
        <Text style={styles.outlineText}>{hintVisible ? '收起提示 ↑' : '卡住了？给我一点提示 ↓'}</Text>
      </Pressable>
      {hintVisible ? <><Text style={styles.hint}>{problem.hint}</Text><LimitMethodLinks problemId={problem.id} /></> : null}
      {!attempt.revealed ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`查看第${index + 1}题解析`}
          onPress={() => patch({ revealed: true })} style={styles.primary}>
          <Text style={styles.primaryText}>我已尝试，查看解析</Text>
        </Pressable>
      ) : (
        <View style={styles.solution}>
          <LimitSolution problem={problem} />
          <Text style={styles.label}>对照解析后，自评本题</Text>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" accessibilityLabel={`第${index + 1}题我做对了`}
              accessibilityState={{ selected: attempt.result === 'correct' }}
              onPress={() => patch({ result: 'correct' })} style={[styles.choice, attempt.result === 'correct' && styles.choiceActive]}>
              <Text style={styles.outlineText}>{attempt.result === 'correct' ? '✓ ' : ''}我做对了</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={`第${index + 1}题还需复习`}
              accessibilityState={{ selected: attempt.result === 'review' }}
              onPress={() => patch({ result: 'review' })} style={[styles.choice, attempt.result === 'review' && styles.choiceActive]}>
              <Text style={styles.outlineText}>{attempt.result === 'review' ? '✓ ' : ''}还需复习</Text>
            </Pressable>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={`重做第${index + 1}题并清空本题答案`}
            onPress={() => { restartDailyLimit(day, problem.id); setHintVisible(false); }} style={styles.restart}>
            <Text style={styles.small}>重做本题（清空本题答案与自评）</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function DailyLimitsScreen() {
  const day = useLocalDay();
  const { dailyLimitRecords, hydrated } = useStudy();
  const problems = getDailyLimitProblems(day);
  const summary = getDailyLimitSummary(dailyLimitRecords, day);
  const reviewCount = getLimitReviewItems(dailyLimitRecords, day).length;
  const history = Object.keys(dailyLimitRecords).filter((date) => date <= day && date !== day)
    .sort().reverse().slice(0, 7);
  return (
    <AppScreen>
      <Stack.Screen options={{ title: '每日极限练习' }} />
      <PageTitle subtitle={`${day} · 按手机/电脑的本地日期换题`}>每天 3 道极限题</PageTitle>
      <View style={styles.notice}>
        <Text style={styles.body}>先独立作答 → 按需看提示 → 对照解析 → 自评与复习。第 3 题是可选挑战，不必一次全部做完。</Text>
        <Text style={styles.small}>题库 {dailyLimitBank.length} 题，{dailyLimitRotationDays} 天轮换；同一天打开不会随机换题。换设备或浏览器不会自动同步记录。</Text>
        {day < expandedRotationStarts ? <Text style={styles.small}>为保留今日作答，扩展轮换从 {expandedRotationStarts} 开始。新题现在就能在“全部题库”中练习。</Text> : null}
      </View>
      {!hydrated ? <Text style={styles.body}>正在读取练习记录…</Text> : (
        <>
          <Text style={styles.progress}>今日已自评 {summary.assessed}/3 · 自评做对 {summary.correct} · 还需复习 {summary.review}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="打开极限方法小课堂" onPress={() => router.push('/limit-methods')} style={styles.methodEntry}>
            <Text style={styles.outlineText}>方法小课堂：先理解，再练习 →</Text>
          </Pressable>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" accessibilityLabel="打开学习日历"
              onPress={() => router.push('/study-calendar')} style={styles.choice}>
              <Text style={styles.outlineText}>学习日历 →</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="打开待复习极限题"
              onPress={() => router.push('/limit-review')} style={styles.choice}>
              <Text style={styles.outlineText}>待复习 {reviewCount} 次 →</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="打开全部极限题库"
              onPress={() => router.push({ pathname: '/limit-review', params: { mode: 'bank' } })} style={styles.choice}>
              <Text style={styles.outlineText}>全部 {dailyLimitBank.length} 题 →</Text>
            </Pressable>
          </View>
          <View style={{ height: spacing.md }} />
          {problems.map((problem, index) => <Exercise key={`${day}:${problem.id}`} problem={problem} day={day} index={index} />)}
          <SectionTitle>最近练习记录</SectionTitle>
          {history.length ? history.map((date) => {
            const previous = getDailyLimitSummary(dailyLimitRecords, date);
            return <View key={date} style={styles.history}>
              <Text style={styles.stepTitle}>{date}</Text>
              <Text style={styles.body}>已自评 {previous.assessed}/3 · 做对 {previous.correct} · 复习 {previous.review}</Text>
            </View>;
          }) : <Text style={styles.body}>往日记录会显示在这里。今天的答案和自评会保存在本机，明天可以继续练。</Text>}
        </>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  methodEntry: { backgroundColor: palette.greenSoft, padding: 14, borderRadius: radii.md, marginBottom: spacing.md },
  notice: { backgroundColor: palette.greenSoft, borderRadius: radii.md, padding: spacing.md, gap: 8 },
  progress: { color: palette.green, fontSize: 13, fontWeight: '700', marginVertical: spacing.md },
  card: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.lg },
  level: { color: palette.green, fontSize: 12, fontWeight: '800' },
  title: { color: palette.ink, fontSize: 19, lineHeight: 27, fontWeight: '800', marginTop: 6 },
  label: { color: palette.ink, fontWeight: '700', fontSize: 14, marginVertical: 10 },
  input: { minHeight: 100, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.background, borderRadius: radii.md, padding: 12, color: palette.ink, fontSize: 16, lineHeight: 24 },
  small: { color: palette.muted, fontSize: 12, lineHeight: 19, marginTop: 6 },
  body: { color: palette.muted, fontSize: 14, lineHeight: 23 },
  outline: { padding: 13, borderWidth: 1, borderColor: palette.green, borderRadius: radii.md, alignItems: 'center', marginTop: 12 },
  outlineText: { color: palette.green, fontSize: 13, fontWeight: '700' },
  primary: { padding: 15, backgroundColor: palette.green, borderRadius: radii.md, alignItems: 'center', marginTop: 12 },
  primaryText: { color: palette.white, fontSize: 14, fontWeight: '700' },
  hint: { color: '#715118', backgroundColor: '#F2E5C8', borderRadius: radii.md, padding: 12, lineHeight: 22, marginTop: 8 },
  solution: { marginTop: spacing.md, borderTopWidth: 1, borderTopColor: palette.line },
  stepTitle: { color: palette.ink, fontSize: 14, fontWeight: '700', marginBottom: 5 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  choice: { padding: 13, borderWidth: 1, borderColor: palette.green, borderRadius: radii.md },
  choiceActive: { backgroundColor: palette.greenSoft },
  restart: { paddingVertical: 12 },
  history: { borderBottomWidth: 1, borderBottomColor: palette.line, paddingVertical: 12 },
});
