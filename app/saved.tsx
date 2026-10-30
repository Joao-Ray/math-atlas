import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/AppScreen';
import { EmptyState, ProblemCard, TopicRow } from '@/components/Cards';
import { MathFormula } from '@/components/MathFormula';
import { PageTitle, SectionTitle } from '@/components/Typography';
import { palette, radii, spacing } from '@/constants/Theme';
import { useStudy } from '@/contexts/StudyContext';
import { formulaById, problemById, topicById } from '@/data/mockData';

export default function SavedScreen() {
  const { completedProblems, favoriteFormulas, favoriteTopics } = useStudy();
  const savedTopics = favoriteTopics.map(topicById).filter(Boolean);
  const savedFormulas = favoriteFormulas.map(formulaById).filter(Boolean);
  const finishedProblems = completedProblems.map(problemById).filter(Boolean);
  const isEmpty = !savedTopics.length && !savedFormulas.length && !finishedProblems.length;

  return (
    <AppScreen>
      <PageTitle subtitle="收藏和学习状态只保存在这台设备上。">我的学习</PageTitle>
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" accessibilityLabel="我的学习打开日历" onPress={() => router.push('/study-calendar')} style={styles.quickLink}><Text style={styles.linkText}>学习日历 →</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="我的学习打开备份" onPress={() => router.push('/study-backup')} style={styles.quickLink}><Text style={styles.linkText}>备份与恢复 →</Text></Pressable>
      </View>
      {isEmpty ? <EmptyState label="还没有收藏或完成记录，先去探索一个知识点吧" /> : null}

      {savedTopics.length ? (
        <>
          <SectionTitle>收藏的知识点</SectionTitle>
          <View style={styles.list}>
            {savedTopics.map((topic, index) => topic ? <TopicRow key={topic.id} topic={topic} index={index + 1} /> : null)}
          </View>
        </>
      ) : null}

      {savedFormulas.length ? (
        <>
          <SectionTitle>收藏的公式</SectionTitle>
          {savedFormulas.map((formula) => formula ? (
            <Pressable
              key={formula.id}
              onPress={() => router.push({ pathname: '/topic/[slug]', params: { slug: formula.topicId } })}
              style={styles.formulaCard}>
              <Text style={styles.formulaTitle}>{formula.titleZh}</Text>
              <MathFormula latex={formula.latex} compact />
            </Pressable>
          ) : null)}
        </>
      ) : null}

      {finishedProblems.length ? (
        <>
          <SectionTitle>已完成例题</SectionTitle>
          {finishedProblems.map((problem) => problem ? <ProblemCard key={problem.id} problem={problem} /> : null)}
        </>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: spacing.md },
  quickLink: { borderRadius: radii.md, borderWidth: 1, borderColor: palette.green, padding: 13 },
  linkText: { color: palette.green, fontSize: 13, fontWeight: '700' },
  list: { borderRadius: radii.md, borderWidth: 1, borderColor: palette.line, overflow: 'hidden' },
  formulaCard: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.sm },
  formulaTitle: { color: palette.ink, fontSize: 16, fontWeight: '800' },
});
