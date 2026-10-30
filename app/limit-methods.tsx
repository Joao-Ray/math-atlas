import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen } from '@/components/AppScreen';
import { MathFormula } from '@/components/MathFormula';
import { PageTitle, SectionTitle } from '@/components/Typography';
import { palette, radii, spacing } from '@/constants/Theme';
import { getLimitMethod, getProblemsForLimitMethod, gradeLimitMethodCheck, LimitMethod, limitMethods } from '@/data/limitMethods';

function MethodLesson({ method }: { method: LimitMethod }) {
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  useFocusEffect(useCallback(() => () => {
    setAnswers({}); setSubmitted(false); setMessage('');
  }, []));
  const result = gradeLimitMethodCheck(method, answers);
  const related = getProblemsForLimitMethod(method.id);
  return <>
    <PageTitle subtitle={method.summary}>{method.title}</PageTitle>
    <View style={styles.conditions}>
      <Text style={styles.cardTitle}>先检查使用条件</Text>
      <Text style={styles.body}>{method.conditions}</Text>
    </View>
    <SectionTitle>怎么用</SectionTitle>
    {method.steps.map((step, index) => <View key={step.title} style={styles.card}>
      <Text style={styles.cardTitle}>{index + 1}. {step.title}</Text>
      <Text style={styles.body}>{step.body}</Text>
      {step.latex ? <MathFormula latex={step.latex} compact /> : null}
    </View>)}
    <SectionTitle>常见误区</SectionTitle>
    {method.pitfalls.map((tip, index) => <Text key={tip} style={styles.pitfall}>{index + 1}. {tip}</Text>)}
    <SectionTitle>两道概念自测</SectionTitle>
    <Text style={styles.small}>先判断，再提交查看解释。这是固定答案的概念题，不是 AI 判分；仅本页临时保留，不写入每日进度、日历或备份。</Text>
    {method.checks.map((item, index) => <View key={item.id} style={styles.card}>
      <Text style={styles.cardTitle}>第 {index + 1} 题</Text>
      <Text style={styles.body}>{item.statement}</Text>
      {item.latex ? <MathFormula latex={item.latex} compact /> : null}
      <View style={styles.actions}>{[true, false].map((answer) => <Pressable key={String(answer)} accessibilityRole="button"
        accessibilityLabel={'自测第' + (index + 1) + '题选' + (answer ? '正确' : '错误')}
        accessibilityState={{ selected: answers[item.id] === answer }}
        onPress={() => { setAnswers((current) => ({ ...current, [item.id]: answer })); setSubmitted(false); setMessage(''); }}
        style={[styles.choice, answers[item.id] === answer && styles.active]}>
        <Text style={answers[item.id] === answer ? styles.white : styles.linkText}>{answer ? '正确' : '错误'}</Text>
      </Pressable>)}</View>
      {submitted && result.complete ? <View style={styles.explanation}>
        <Text style={styles.cardTitle}>{answers[item.id] === item.answer ? '✓ 判断正确' : '这题再想一想'} · 正确判断：{item.answer ? '正确' : '错误'}</Text>
        <Text style={styles.body}>{item.explanation}</Text>
      </View> : null}
    </View>)}
    <Pressable accessibilityRole="button" accessibilityLabel="提交概念自测" style={[styles.button, styles.active]}
      onPress={() => {
        if (!result.complete) { setMessage('请先完成两道题的判断，再提交查看解释。'); return; }
        setSubmitted(true); setMessage('本次概念自测答对 ' + result.correct + '/' + result.total + ' 题。请结合解释理解，不计入每日练习统计。');
      }}><Text style={styles.white}>{submitted ? '再次核对概念自测' : '提交判断，查看解释'}</Text></Pressable>
    {message ? <Text accessibilityRole="alert" style={styles.message}>{message}</Text> : null}
    {submitted ? <Pressable accessibilityRole="button" accessibilityLabel="重新开始概念自测" style={styles.button}
      onPress={() => { setAnswers({}); setSubmitted(false); setMessage(''); }}><Text style={styles.linkText}>清空本页选择，重新自测</Text></Pressable> : null}
    <SectionTitle>用题目练一遍</SectionTitle>
    <Text style={styles.small}>本方法关联 {related.length} 道题。题目可能有多种解法，关联不代表唯一方法；先做基础，再做可选挑战。</Text>
    {related.slice(0, 3).map((problem) => <Pressable key={problem.id} accessibilityRole="button"
      accessibilityLabel={'从方法课练习' + problem.title} style={styles.card}
      onPress={() => router.push({ pathname: '/limit-review', params: { mode: 'bank', method: method.id, problem: problem.id } })}>
      <Text style={styles.small}>{problem.level}</Text><Text style={styles.cardTitle}>{problem.title} →</Text>
    </Pressable>)}
    <Pressable accessibilityRole="button" accessibilityLabel="练习本方法全部题目" style={styles.button}
      onPress={() => router.push({ pathname: '/limit-review', params: { mode: 'bank', method: method.id } })}>
      <Text style={styles.linkText}>查看本方法全部 {related.length} 题 →</Text>
    </Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel="返回方法课堂目录" style={styles.button}
      onPress={() => router.push('/limit-methods')}><Text style={styles.linkText}>回到方法目录 →</Text></Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel="从方法课查看相关知识点" style={styles.button}
      onPress={() => router.push({ pathname: '/topic/[slug]', params: { slug: method.id === 'taylor' ? 'taylor-series' : 'limits' } })}>
      <Text style={styles.linkText}>继续学习{method.id === 'taylor' ? '泰勒级数' : '极限与连续'}知识点 →</Text>
    </Pressable>
  </>;
}

export default function LimitMethodsScreen() {
  const params = useLocalSearchParams<{ method?: string | string[] }>();
  const requested = Array.isArray(params.method) ? params.method[0] : params.method;
  const method = getLimitMethod(requested);
  return <AppScreen>
    <Stack.Screen options={{ title: method?.title ?? '极限方法小课堂' }} />
    {requested && !method ? <>
      <PageTitle subtitle="这个方法链接可能已经失效；没有修改任何学习记录。">未找到该方法</PageTitle>
      <Pressable accessibilityRole="button" accessibilityLabel="打开有效方法目录" style={styles.button}
        onPress={() => router.replace('/limit-methods')}><Text style={styles.linkText}>查看全部方法 →</Text></Pressable>
    </> : method ? <MethodLesson key={method.id} method={method} /> : <>
      <PageTitle subtitle="先知道为什么，再自己算一遍。">极限方法小课堂</PageTitle>
      <View style={styles.conditions}>
        <Text style={styles.cardTitle}>每节约 3–5 分钟，自定节奏</Text>
        <Text style={styles.body}>判断是否存在 → 检查定义域与未定式 → 选择方法 → 核对条件 → 定向练习。9 组方法讲解、18 道概念自测，关联现有 42 道极限题。</Text>
        <Text style={styles.small}>阅读时间仅为估计。自测选择不保存，离开本节或刷新后重置；原有每日答案和练习草稿不受影响。</Text>
      </View>
      {limitMethods.map((item, index) => <Pressable key={item.id} accessibilityRole="button"
        accessibilityLabel={'打开' + item.title + '小课堂'} style={styles.card}
        onPress={() => router.push({ pathname: '/limit-methods', params: { method: item.id } })}>
        <Text style={styles.small}>方法 {String(index + 1).padStart(2, '0')} · {getProblemsForLimitMethod(item.id).length} 道关联题</Text>
        <Text style={styles.cardTitle}>{item.title} →</Text><Text style={styles.body}>{item.summary}</Text>
      </Pressable>)}
    </>}
  </AppScreen>;
}

const styles = StyleSheet.create({
  conditions: { backgroundColor: palette.greenSoft, padding: spacing.md, borderRadius: radii.md, marginBottom: spacing.md },
  card: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md },
  cardTitle: { color: palette.ink, fontSize: 16, lineHeight: 24, fontWeight: '700', marginBottom: 6 },
  body: { color: palette.muted, fontSize: 14, lineHeight: 24 },
  small: { color: palette.muted, fontSize: 12, lineHeight: 20, marginBottom: 8 },
  pitfall: { color: palette.ink, fontSize: 14, lineHeight: 24, padding: 12, borderRadius: radii.md, backgroundColor: '#F2E5C8', marginBottom: 9 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  choice: { paddingHorizontal: 24, paddingVertical: 13, borderWidth: 1, borderColor: palette.green, borderRadius: radii.md },
  active: { backgroundColor: palette.green },
  white: { color: palette.white, fontSize: 14, fontWeight: '700' },
  linkText: { color: palette.green, fontSize: 14, fontWeight: '700' },
  explanation: { marginTop: 12, padding: 12, borderRadius: radii.md, backgroundColor: palette.greenSoft },
  button: { borderWidth: 1, borderColor: palette.green, borderRadius: radii.md, alignItems: 'center', padding: 14, marginBottom: 12 },
  message: { color: palette.green, fontSize: 14, lineHeight: 23, marginVertical: 12 },
});
