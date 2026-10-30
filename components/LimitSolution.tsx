import { StyleSheet, Text, View } from 'react-native';
import { MathFormula } from '@/components/MathFormula';
import { palette, radii } from '@/constants/Theme';
import { DailyLimitProblem } from '@/data/dailyLimits';

export function LimitSolution({ problem }: { problem: DailyLimitProblem }) {
  return <View>
    <Text style={styles.label}>分步解析</Text>
    {problem.steps.map((step, index) => <View key={step.title} style={styles.step}>
      <Text style={styles.title}>{index + 1}. {step.title}</Text>
      <Text style={styles.body}>{step.body}</Text>
      {step.latex ? <MathFormula latex={step.latex} compact /> : null}
    </View>)}
    <View style={styles.answer}><Text style={styles.answerText}>参考答案：{problem.answer}</Text></View>
  </View>;
}

const styles = StyleSheet.create({
  label: { color: palette.ink, fontWeight: '700', fontSize: 14, marginVertical: 10 },
  step: { marginBottom: 12 },
  title: { color: palette.ink, fontSize: 14, fontWeight: '700', marginBottom: 5 },
  body: { color: palette.muted, fontSize: 14, lineHeight: 23 },
  answer: { backgroundColor: palette.green, borderRadius: radii.md, padding: 14 },
  answerText: { color: palette.white, fontSize: 17, lineHeight: 25, fontWeight: '700' },
});
