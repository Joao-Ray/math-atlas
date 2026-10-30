import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, radii } from '@/constants/Theme';
import { getMethodsForLimitProblem } from '@/data/limitMethods';

export function LimitMethodLinks({ problemId }: { problemId: string }) {
  const methods = getMethodsForLimitProblem(problemId);
  if (!methods.length) return null;
  return <View style={styles.wrap}>
    <Text style={styles.label}>想补一下基础？相关方法：</Text>
    <View style={styles.links}>{methods.map((method) => <Pressable key={method.id} accessibilityRole="button"
      accessibilityLabel={'学习' + method.title} onPress={() => router.push({ pathname: '/limit-methods', params: { method: method.id } })}
      style={styles.link}><Text style={styles.linkText}>{method.shortTitle} →</Text></Pressable>)}</View>
  </View>;
}

const styles = StyleSheet.create({
  wrap: { marginVertical: 10 },
  label: { color: palette.muted, fontSize: 12, marginBottom: 8 },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  link: { borderWidth: 1, borderColor: palette.green, borderRadius: radii.pill, paddingHorizontal: 13, paddingVertical: 11 },
  linkText: { color: palette.green, fontSize: 12, fontWeight: '700' },
});
