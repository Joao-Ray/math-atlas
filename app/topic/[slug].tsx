import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/AppScreen';
import { MathFormula } from '@/components/MathFormula';
import { SectionTitle } from '@/components/Typography';
import { palette, radii, spacing } from '@/constants/Theme';
import { useStudy } from '@/contexts/StudyContext';
import { courseById, formulaById, problemById, topicById } from '@/data/mockData';

export default function TopicDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const topic = topicById(slug);
  const { favoriteTopics, toggleTopic } = useStudy();

  if (!topic) {
    return (
      <AppScreen>
        <Text style={styles.notFound}>未找到这个知识点。</Text>
      </AppScreen>
    );
  }

  const course = courseById(topic.courseId);
  const isFavorite = favoriteTopics.includes(topic.id);
  const relatedFormulas = topic.formulaIds.map(formulaById).filter(Boolean);
  const relatedProblems = topic.problemIds.map(problemById).filter(Boolean);

  return (
    <AppScreen>
      <Stack.Screen options={{ title: topic.titleZh }} />
      <View style={styles.hero}>
        <View style={[styles.icon, { backgroundColor: course?.accent }]}><Text style={styles.iconText}>{course?.icon}</Text></View>
        <Text style={styles.course}>{course?.titleZh} · {course?.title}</Text>
        <Text style={styles.title}>{topic.titleZh}</Text>
        <Text style={styles.english}>{topic.title}</Text>
        <Text style={styles.summary}>{topic.summary}</Text>
        <Pressable onPress={() => toggleTopic(topic.id)} style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}>
          <Text style={[styles.favoriteText, isFavorite && styles.favoriteTextActive]}>{isFavorite ? '★ 已收藏' : '☆ 收藏知识点'}</Text>
        </Pressable>
      </View>

      <SectionTitle>一句话理解</SectionTitle>
      <View style={styles.intuitionCard}>
        <Text style={styles.quote}>“</Text>
        <Text style={styles.intuition}>{topic.intuition}</Text>
      </View>

      <SectionTitle>定义</SectionTitle>
      <View style={styles.textCard}><Text style={styles.body}>{topic.definition}</Text></View>

      {relatedFormulas.length ? (
        <>
          <SectionTitle>核心公式</SectionTitle>
          {relatedFormulas.map((formula) => formula ? (
            <View key={formula.id} style={styles.formulaCard}>
              <Text style={styles.formulaTitle}>{formula.titleZh}</Text>
              <Text style={styles.formulaMeta}>{formula.title}</Text>
              <MathFormula latex={formula.latex} />
              <Text style={styles.body}>{formula.explanation}</Text>
            </View>
          ) : null)}
        </>
      ) : null}

      <SectionTitle>前置知识</SectionTitle>
      <View style={styles.prerequisites}>
        {topic.prerequisites.length ? topic.prerequisites.map((item) => {
          const prerequisite = topicById(item);
          return (
            <Pressable
              key={item}
              disabled={!prerequisite}
              onPress={() => prerequisite && router.push({ pathname: '/topic/[slug]', params: { slug: prerequisite.id } })}
              style={styles.pill}>
              <Text style={styles.pillText}>{prerequisite?.titleZh ?? item}</Text>
            </Pressable>
          );
        }) : <Text style={styles.body}>无，可直接开始。</Text>}
      </View>

      <SectionTitle>经典例题</SectionTitle>
      {relatedProblems.length ? relatedProblems.map((problem) => problem ? (
        <Pressable
          key={problem.id}
          onPress={() => router.push({ pathname: '/problem/[id]', params: { id: problem.id } })}
          style={({ pressed }) => [styles.problem, pressed && styles.pressed]}>
          <View style={styles.problemNumber}><Text style={styles.problemNumberText}>?</Text></View>
          <View style={styles.problemContent}>
            <Text style={styles.problemTitle}>{problem.title}</Text>
            <Text style={styles.problemPrompt} numberOfLines={2}>{problem.prompt}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ) : null) : (
        <View style={styles.textCard}><Text style={styles.body}>例题正在补充中。</Text></View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  notFound: { color: palette.ink, fontSize: 18, paddingTop: 80, textAlign: 'center' },
  hero: { paddingTop: spacing.lg, alignItems: 'center' },
  icon: { width: 58, height: 58, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  iconText: { color: palette.white, fontSize: 22, fontWeight: '900' },
  course: { color: palette.green, fontSize: 12, fontWeight: '800', letterSpacing: .8 },
  title: { color: palette.ink, fontSize: 30, fontWeight: '900', marginTop: spacing.sm, textAlign: 'center' },
  english: { color: palette.muted, fontSize: 15, marginTop: 3 },
  summary: { color: palette.muted, fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: spacing.md, paddingHorizontal: spacing.md },
  favoriteButton: { borderRadius: radii.pill, borderWidth: 1, borderColor: palette.green, paddingHorizontal: 15, paddingVertical: 9, marginTop: spacing.md },
  favoriteButtonActive: { backgroundColor: palette.green },
  favoriteText: { color: palette.green, fontSize: 12, fontWeight: '800' },
  favoriteTextActive: { color: palette.white },
  intuitionCard: { backgroundColor: palette.green, borderRadius: radii.lg, padding: spacing.lg, flexDirection: 'row' },
  quote: { color: '#8FB7A3', fontSize: 38, lineHeight: 34, marginRight: spacing.sm },
  intuition: { color: palette.white, fontSize: 16, lineHeight: 25, fontWeight: '600', flex: 1 },
  textCard: { backgroundColor: palette.surface, borderRadius: radii.md, borderColor: palette.line, borderWidth: 1, padding: spacing.md },
  body: { color: palette.muted, fontSize: 14, lineHeight: 22 },
  formulaCard: { backgroundColor: palette.surface, borderRadius: radii.lg, borderColor: palette.line, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  formulaTitle: { color: palette.ink, fontSize: 17, fontWeight: '800' },
  formulaMeta: { color: palette.muted, fontSize: 11, marginTop: 3 },
  prerequisites: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { backgroundColor: palette.greenSoft, borderRadius: radii.pill, paddingHorizontal: 13, paddingVertical: 9 },
  pillText: { color: palette.green, fontSize: 12, fontWeight: '700' },
  problem: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.surface, borderRadius: radii.md, borderColor: palette.line, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  pressed: { opacity: .65 },
  problemNumber: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F2E5C8', alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  problemNumberText: { color: palette.gold, fontSize: 17, fontWeight: '900' },
  problemContent: { flex: 1 },
  problemTitle: { color: palette.ink, fontSize: 15, fontWeight: '800' },
  problemPrompt: { color: palette.muted, fontSize: 12, lineHeight: 18, marginTop: 3 },
  chevron: { color: palette.muted, fontSize: 26, marginLeft: spacing.sm },
});
