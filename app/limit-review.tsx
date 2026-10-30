import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen } from '@/components/AppScreen';
import { LimitSolution } from '@/components/LimitSolution';
import { LimitMethodLinks } from '@/components/LimitMethodLinks';
import { MathFormula } from '@/components/MathFormula';
import { SearchField } from '@/components/SearchField';
import { PageTitle } from '@/components/Typography';
import { palette, radii, spacing } from '@/constants/Theme';
import { useStudy } from '@/contexts/StudyContext';
import { dailyLimitBank, DailyLimitProblem, getLimitReviewItems, limitLevels, LimitLevel } from '@/data/dailyLimits';
import { filterLimitPracticeItems, LimitMethodId, limitMethods, resolveLimitPracticeParams } from '@/data/limitMethods';
import { useLocalDay } from '@/hooks/useLocalDay';
import { getPracticeDraftKey } from '@/data/studyState';

function Practice({ problem, date, onResolved }: { problem: DailyLimitProblem; date?: string; onResolved: () => void }) {
  const { dailyLimitRecords, practiceDrafts, updateDailyLimit, updatePracticeDraft } = useStudy();
  const draft = practiceDrafts[getPracticeDraftKey(problem.id, date)] ?? '';
  const [hint, setHint] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [originalVisible, setOriginalVisible] = useState(false);
  const original = date ? dailyLimitRecords[date]?.[problem.id] : undefined;
  return <View style={styles.practice}>
    <MathFormula latex={problem.expression} />
    <Text style={styles.title}>这次的答案 / 思路</Text>
    <TextInput accessibilityLabel="复习我的答案" multiline maxLength={1000} textAlignVertical="top"
      autoCorrect={false} value={draft} onChangeText={(value) => updatePracticeDraft(problem.id, value, date)} placeholder="先重新尝试，也可以在纸上计算。"
      placeholderTextColor={palette.muted} style={styles.input} />
    <Text style={styles.small}>草稿自动保存在本机，收起或刷新后可继续。原每日作答不会被覆盖；解析每次默认隐藏，系统不自动判分。</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={hint ? '收起复习提示' : '查看复习提示'}
      accessibilityState={{ expanded: hint }} onPress={() => setHint(!hint)} style={styles.button}>
      <Text style={styles.buttonText}>{hint ? '收起提示' : '给我一点提示'}</Text>
    </Pressable>
    {hint ? <><Text style={styles.hint}>{problem.hint}</Text><LimitMethodLinks problemId={problem.id} /></> : null}
    {!revealed ? <Pressable accessibilityRole="button" accessibilityLabel="查看复习解析"
      onPress={() => setRevealed(true)} style={[styles.button, styles.active]}>
      <Text style={styles.activeText}>我已尝试，查看解析</Text>
    </Pressable> : <View>
      <LimitSolution problem={problem} />
      {original ? <>
        <Pressable accessibilityRole="button" accessibilityLabel="查看原每日作答"
          accessibilityState={{ expanded: originalVisible }} onPress={() => setOriginalVisible(!originalVisible)} style={styles.button}>
          <Text style={styles.buttonText}>{originalVisible ? '收起原作答' : '查看原每日作答（只读）'}</Text>
        </Pressable>
        {originalVisible ? <Text style={styles.hint}>{original.draft || '当时未输入答案，可能在纸上作答。'}</Text> : null}
        <Pressable accessibilityRole="button" accessibilityLabel="标记已掌握并移出待复习"
          onPress={() => { updateDailyLimit(date!, problem.id, { result: 'correct' }); onResolved(); }} style={[styles.button, styles.active]}>
          <Text style={styles.activeText}>我已掌握，移出待复习</Text>
        </Pressable>
        <Text style={styles.small}>仍不熟悉？不用修改，它会继续留在待复习中。移出只更新这次记录的自评，原答案保留。</Text>
      </> : <Text style={styles.small}>自由练习草稿会自动保存于本机，不计入每日进度或连续练习天数。</Text>}
    </View>}
  </View>;
}

export default function LimitReviewScreen() {
  const params = useLocalSearchParams<{ mode?: string; method?: string; problem?: string }>();
  const initial = resolveLimitPracticeParams(params);
  const [mode, setMode] = useState<'review' | 'bank'>(initial.mode);
  const [methodId, setMethodId] = useState<LimitMethodId | null>(initial.methodId);
  const [level, setLevel] = useState<LimitLevel | null>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(initial.selected);
  const [feedback, setFeedback] = useState('');
  const { dailyLimitRecords, hydrated } = useStudy();
  const day = useLocalDay();
  const reviewItems = getLimitReviewItems(dailyLimitRecords, day);
  useEffect(() => {
    const next = resolveLimitPracticeParams(params);
    setMode(next.mode); setMethodId(next.methodId); setSelected(next.selected);
    setQuery(''); setLevel(null); setFeedback('');
  }, [params.mode, params.method, params.problem]);
  const items: { problem: DailyLimitProblem; date: string | undefined }[] = mode === 'review'
    ? reviewItems : dailyLimitBank.map((problem) => ({ problem, date: undefined }));
  const results = filterLimitPracticeItems(items, { query, level, methodId });
  const changeMode = (value: 'review' | 'bank') => { setMode(value); setSelected(null); setQuery(''); setLevel(null); setMethodId(null); setFeedback(''); };

  return <AppScreen>
    <Stack.Screen options={{ title: '极限题库与复习' }} />
    <PageTitle subtitle="答案默认隐藏，先试着做，再对照解析。">极限题库与复习</PageTitle>
    <Pressable accessibilityRole="button" accessibilityLabel="从题库打开方法课堂" style={styles.lessonLink}
      onPress={() => router.push('/limit-methods')}><Text style={styles.buttonText}>先补基础：极限方法小课堂 →</Text></Pressable>
    <View style={styles.filters}>
      {(['review', 'bank'] as const).map((value) => <Pressable key={value} accessibilityRole="button"
        accessibilityLabel={value === 'review' ? '切换待复习' : '切换全部极限题'} accessibilityState={{ selected: mode === value }}
        onPress={() => changeMode(value)} style={[styles.filter, mode === value && styles.active]}>
        <Text style={mode === value ? styles.activeText : styles.buttonText}>{value === 'review' ? `待复习 ${hydrated ? reviewItems.length : '…'} 次` : `全部 ${dailyLimitBank.length} 题`}</Text>
      </Pressable>)}
    </View>
    <SearchField value={query} onChangeText={(value) => { setQuery(value); setSelected(null); }} placeholder="搜索题目或方法，如洛必达、积分、数列" />
    <Text style={styles.small}>按方法筛题（左右滑动）</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.methodFilters}>
      <Pressable accessibilityRole="button" accessibilityLabel="筛选全部解题方法" accessibilityState={{ selected: methodId === null }}
        onPress={() => { setMethodId(null); setSelected(null); }} style={[styles.filter, methodId === null && styles.active]}>
        <Text style={methodId === null ? styles.activeText : styles.buttonText}>全部方法</Text>
      </Pressable>
      {limitMethods.map((method) => <Pressable key={method.id} accessibilityRole="button" accessibilityLabel={'按方法筛选' + method.shortTitle}
        accessibilityState={{ selected: methodId === method.id }} onPress={() => { setMethodId(method.id); setSelected(null); }}
        style={[styles.filter, methodId === method.id && styles.active]}>
        <Text style={methodId === method.id ? styles.activeText : styles.buttonText}>{method.shortTitle}</Text>
      </Pressable>)}
    </ScrollView>
    <View style={styles.filters}>
      {[null, ...limitLevels].map((value) => <Pressable key={value ?? 'all'} accessibilityRole="button"
        accessibilityLabel={`筛选${value ?? '全部难度'}极限题`} accessibilityState={{ selected: level === value }}
        onPress={() => { setLevel(value); setSelected(null); }} style={[styles.filter, level === value && styles.active]}>
        <Text style={level === value ? styles.activeText : styles.buttonText}>{value ?? '全部难度'}</Text>
      </Pressable>)}
    </View>
    {feedback ? <Text accessibilityRole="alert" style={styles.feedback}>{feedback}</Text> : null}
    {!hydrated ? <Text style={styles.body}>正在读取练习与草稿记录…</Text> : <>
      <Text style={styles.body}>{mode === 'review' ? '按原练习日期从早到晚排列；同一题不同日期的记录分别复习。' : '随时自由练习，不必等待每日换题。草稿自动保存在当前设备。'}</Text>
      <Text style={styles.count}>当前筛选：{results.length} {mode === 'review' ? '次待复习' : '道题'}</Text>
      {results.map(({ problem, date }) => {
        const key = `${mode}:${date ?? 'bank'}:${problem.id}`;
        const expanded = key === selected;
        return <View key={key} style={styles.card}>
          <Pressable accessibilityRole="button" accessibilityLabel={`练习${date ? `${date} ` : ''}${problem.title}`}
            accessibilityState={{ expanded }} onPress={() => setSelected(expanded ? null : key)} style={styles.cardHeader}>
            <Text style={styles.small}>{problem.level}{date ? ` · 原练习 ${date}` : ''}</Text>
            <Text style={styles.title}>{problem.title}</Text>
            <Text style={styles.buttonText}>{expanded ? '收起练习 ↑' : '自己练一遍 ↓'}</Text>
          </Pressable>
          {expanded ? <Practice key={key} problem={problem} date={date}
            onResolved={() => { setSelected(null); setFeedback('已更新为“做对了”，原答案保留。仍可在“全部题库”中继续练。'); }} /> : null}
        </View>;
      })}
      {!results.length ? <View style={styles.empty}>
        <Text style={styles.body}>{mode === 'review' && !query.trim() && !level && !methodId
          ? '暂无待复习记录。在每日练习中自评“还需复习”的题会出现在这里。' : '没有匹配的题目，可以清除搜索或切换难度、方法。'}</Text>
        {(query.trim() || level || methodId) ? <Pressable accessibilityRole="button" accessibilityLabel="清除全部极限题筛选"
          onPress={() => { setQuery(''); setLevel(null); setMethodId(null); setSelected(null); }} style={styles.button}>
          <Text style={styles.buttonText}>清除全部筛选</Text>
        </Pressable> : null}
        <Pressable accessibilityRole="button" accessibilityLabel="返回每日极限练习" onPress={() => router.push('/daily-limits')} style={styles.button}>
          <Text style={styles.buttonText}>去做每日 3 题 →</Text>
        </Pressable>
      </View> : null}
    </>}
  </AppScreen>;
}

const styles = StyleSheet.create({
  lessonLink: { backgroundColor: palette.greenSoft, borderRadius: radii.md, padding: 14, marginBottom: spacing.md },
  methodFilters: { gap: 8, paddingBottom: spacing.md },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  filter: { borderWidth: 1, borderColor: palette.green, borderRadius: radii.pill, paddingVertical: 11, paddingHorizontal: 13 },
  active: { backgroundColor: palette.green },
  activeText: { color: palette.white, fontSize: 13, fontWeight: '700' },
  buttonText: { color: palette.green, fontSize: 13, fontWeight: '700' },
  body: { color: palette.muted, fontSize: 14, lineHeight: 23 },
  small: { color: palette.muted, fontSize: 12, lineHeight: 19, marginVertical: 6 },
  title: { color: palette.ink, fontSize: 17, lineHeight: 25, fontWeight: '700', marginBottom: 10 },
  count: { color: palette.green, fontSize: 13, fontWeight: '700', marginVertical: spacing.md },
  card: { backgroundColor: palette.surface, borderColor: palette.line, borderWidth: 1, borderRadius: radii.lg, marginBottom: spacing.md },
  cardHeader: { padding: spacing.md },
  practice: { padding: spacing.md, borderTopWidth: 1, borderTopColor: palette.line },
  input: { minHeight: 100, backgroundColor: palette.background, borderRadius: radii.md, borderWidth: 1, borderColor: palette.line, color: palette.ink, padding: 12, fontSize: 16, lineHeight: 24 },
  button: { borderWidth: 1, borderColor: palette.green, borderRadius: radii.md, alignItems: 'center', padding: 14, marginTop: 12 },
  hint: { color: palette.ink, backgroundColor: palette.greenSoft, borderRadius: radii.md, padding: 12, fontSize: 14, lineHeight: 23, marginTop: 10 },
  feedback: { color: palette.green, backgroundColor: palette.greenSoft, padding: spacing.md, borderRadius: radii.md, marginBottom: spacing.md, lineHeight: 22 },
  empty: { padding: spacing.md },
});
