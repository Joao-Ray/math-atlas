import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, radii, spacing } from '@/constants/Theme';
import { courseById } from '@/data/mockData';
import { Problem, Topic } from '@/types';

export function TopicRow({ topic, index }: { topic: Topic; index?: number }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/topic/[slug]', params: { slug: topic.id } })}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.indexCircle}><Text style={styles.indexText}>{index ?? '→'}</Text></View>
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>{topic.titleZh}</Text>
        <Text style={styles.rowMeta}>{topic.title}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export function ProblemCard({ problem, completed = false }: { problem: Problem; completed?: boolean }) {
  const course = courseById(problem.courseId);
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/problem/[id]', params: { id: problem.id } })}
      style={({ pressed }) => [styles.problemCard, pressed && styles.pressed]}>
      <View style={styles.labelRow}>
        <View style={[styles.courseDot, { backgroundColor: course?.accent }]} />
        <Text style={styles.metaLabel}>{course?.titleZh}</Text>
        <Text style={styles.difficulty}>{'★'.repeat(problem.difficulty)}{'☆'.repeat(5 - problem.difficulty)}</Text>
      </View>
      <Text style={styles.problemTitle}>{problem.title}</Text>
      {problem.source?.kind === 'competition-style' || problem.source?.kind === 'past-paper'
        ? <Text style={styles.completed}>竞赛题库</Text> : null}
      {problem.practiceSet ? <Text style={styles.completed}>自编专题练习 · 非原书原题</Text> : null}
      <Text style={styles.problemPrompt} numberOfLines={2}>{problem.prompt}</Text>
      {completed ? <Text style={styles.completed}>✓ 已完成</Text> : null}
      <Text style={styles.openText}>查看详细解析  →</Text>
    </Pressable>
  );
}

export function EmptyState({ label = '没有找到匹配内容' }: { label?: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptySymbol}>∅</Text>
      <Text style={styles.emptyText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: palette.surface,
    borderBottomColor: palette.line, borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md, paddingVertical: 14,
  },
  pressed: { opacity: 0.62 },
  indexCircle: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: palette.greenSoft,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm,
  },
  indexText: { color: palette.green, fontSize: 12, fontWeight: '800' },
  rowContent: { flex: 1 },
  rowTitle: { color: palette.ink, fontSize: 16, fontWeight: '700' },
  rowMeta: { color: palette.muted, fontSize: 12, marginTop: 2 },
  chevron: { color: palette.muted, fontSize: 24 },
  problemCard: {
    backgroundColor: palette.surface, borderRadius: radii.md, borderColor: palette.line,
    borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  courseDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  metaLabel: { color: palette.muted, fontSize: 12, flex: 1 },
  difficulty: { color: palette.gold, fontSize: 11, letterSpacing: 1 },
  problemTitle: { color: palette.ink, fontSize: 18, fontWeight: '800', marginTop: spacing.sm },
  problemPrompt: { color: palette.muted, fontSize: 14, lineHeight: 21, marginTop: spacing.xs },
  openText: { color: palette.green, fontSize: 13, fontWeight: '700', marginTop: spacing.md },
  completed: { color: palette.green, fontSize: 12, fontWeight: '700', marginTop: spacing.sm },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptySymbol: { color: palette.line, fontSize: 42 },
  emptyText: { color: palette.muted, fontSize: 14, marginTop: spacing.sm },
});
