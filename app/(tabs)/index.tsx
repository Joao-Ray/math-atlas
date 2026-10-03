import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/AppScreen';
import { MathFormula } from '@/components/MathFormula';
import { Eyebrow, PageTitle, SectionTitle } from '@/components/Typography';
import { palette, radii, spacing } from '@/constants/Theme';
import { useStudy } from '@/contexts/StudyContext';
import { courseById, papers, problems, topicById } from '@/data/mockData';

export default function HomeScreen() {
  const { completedProblems, favoriteFormulas, favoriteTopics } = useStudy();
  const dailyProblem = problems[Math.floor(Date.now() / 86400000) % problems.length];
  const nextProblem = problems.find((problem) => !completedProblems.includes(problem.id)) ?? problems[0];
  const nextTopic = topicById(nextProblem.topicId)!;
  const nextCourse = courseById(nextTopic.courseId)!;
  const greeting = new Date().getHours() < 12 ? '早上好' : new Date().getHours() < 18 ? '下午好' : '晚上好';
  const completionPercent = Math.round((completedProblems.length / problems.length) * 100);

  return (
    <AppScreen>
      <View style={styles.brandRow}>
        <View style={styles.logo}><Text style={styles.logoText}>M</Text></View>
        <Text style={styles.brand}>MathAtlas</Text>
        <Pressable accessibilityLabel="我的学习" onPress={() => router.push('/saved')} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>☆</Text>
        </Pressable>
        <Pressable accessibilityLabel="设置" onPress={() => router.push('/settings')} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>•••</Text>
        </Pressable>
      </View>

      <PageTitle subtitle="把知识点、公式、例题与前沿论文连成一张图。">{greeting}，今天学一点什么？</PageTitle>

      <Pressable onPress={() => router.push('/saved')} style={styles.overviewCard}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{completedProblems.length}</Text>
          <Text style={styles.metricLabel}>已完成例题</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{favoriteTopics.length + favoriteFormulas.length}</Text>
          <Text style={styles.metricLabel}>收藏内容</Text>
        </View>
        <Text style={styles.overviewArrow}>›</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push({ pathname: '/topic/[slug]', params: { slug: nextTopic.id } })}
        style={({ pressed }) => [styles.continueCard, pressed && styles.pressed]}>
        <Eyebrow>{completionPercent === 100 ? '复习知识点' : '继续学习'} · {nextCourse.titleZh}</Eyebrow>
        <Text style={styles.continueTitle}>{nextTopic.titleZh}</Text>
        <Text style={styles.continueMeta}>{nextTopic.title} · {nextProblem.title}</Text>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${completionPercent}%` }]} /></View>
        <View style={styles.continueFooter}>
          <Text style={styles.progressLabel}>例题进度 {completionPercent}%</Text>
          <Text style={styles.go}>继续  →</Text>
        </View>
      </Pressable>

      <SectionTitle>今日公式</SectionTitle>
      <View style={styles.surfaceCard}>
        <Text style={styles.cardTitle}>方差恒等式</Text>
        <Text style={styles.cardMeta}>Variance identity</Text>
        <MathFormula latex="\\mathrm{Var}(X)=E[X^2]-E[X]^2" />
        <Text style={styles.cardBody}>方差 = 二阶矩 − 期望的平方</Text>
        <View style={styles.actions}>
          <Pressable onPress={() => router.push({ pathname: '/topic/[slug]', params: { slug: 'expectation-variance' } })} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>查看推导</Text>
          </Pressable>
          <Pressable onPress={() => router.push({ pathname: '/problem/[id]', params: { id: 'dice-variance' } })} style={styles.primaryButton}>
            <Text style={styles.primaryText}>做一道题</Text>
          </Pressable>
        </View>
      </View>

      <SectionTitle>每日一题</SectionTitle>
      <Pressable
        onPress={() => router.push({ pathname: '/problem/[id]', params: { id: dailyProblem.id } })}
        style={({ pressed }) => [styles.problemCard, pressed && styles.pressed]}>
        <View style={styles.questionMark}><Text style={styles.questionMarkText}>?</Text></View>
        <View style={styles.problemContent}>
          <Text style={styles.problemTitle}>{dailyProblem.title}</Text>
          <Text style={styles.problemText} numberOfLines={2}>{dailyProblem.prompt}</Text>
          <Text style={styles.difficulty}>难度  {'★'.repeat(dailyProblem.difficulty)}{'☆'.repeat(5 - dailyProblem.difficulty)}</Text>
        </View>
      </Pressable>

      <SectionTitle
        action={<Pressable onPress={() => router.push('/papers')}><Text style={styles.link}>全部论文</Text></Pressable>}>
        论文探索
      </SectionTitle>
      <View style={styles.paperList}>
        {papers.slice(0, 3).map((paper, index) => (
          <View key={paper.id} style={[styles.paperRow, index === 2 && styles.lastRow]}>
            <View style={styles.paperNumber}><Text style={styles.paperNumberText}>0{index + 1}</Text></View>
            <View style={styles.paperContent}>
              <Text style={styles.paperTitle} numberOfLines={2}>{paper.title}</Text>
              <Text style={styles.paperMeta}>{paper.category} · {paper.publishedAt.slice(5)}</Text>
            </View>
          </View>
        ))}
      </View>
      <Text style={styles.dataNote}>论文条目已核对 arXiv 来源；后续可接入 API 自动更新。</Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md },
  logo: { width: 32, height: 32, borderRadius: 10, backgroundColor: palette.green, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: palette.white, fontWeight: '900', fontSize: 16 },
  brand: { color: palette.ink, fontWeight: '800', fontSize: 18, marginLeft: spacing.sm, flex: 1 },
  headerButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: palette.surface, borderColor: palette.line, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  headerButtonText: { color: palette.green, fontWeight: '900', fontSize: 15 },
  pressed: { opacity: 0.68 },
  overviewCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.surface, borderRadius: radii.md, borderWidth: 1, borderColor: palette.line, paddingVertical: 13, paddingHorizontal: spacing.md, marginBottom: spacing.md },
  metric: { flex: 1 },
  metricValue: { color: palette.ink, fontSize: 20, fontWeight: '900' },
  metricLabel: { color: palette.muted, fontSize: 11, marginTop: 2 },
  metricDivider: { width: 1, height: 30, backgroundColor: palette.line, marginHorizontal: spacing.md },
  overviewArrow: { color: palette.muted, fontSize: 25, marginLeft: spacing.sm },
  continueCard: { backgroundColor: palette.green, borderRadius: radii.lg, padding: spacing.lg },
  continueTitle: { color: palette.white, fontSize: 26, fontWeight: '800' },
  continueMeta: { color: '#C8DDD1', fontSize: 13, marginTop: 4 },
  progressTrack: { height: 7, borderRadius: 4, backgroundColor: '#487760', marginTop: spacing.lg, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#F1C974' },
  continueFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  progressLabel: { color: '#C8DDD1', fontSize: 12 },
  go: { color: palette.white, fontWeight: '800', fontSize: 13 },
  surfaceCard: { backgroundColor: palette.surface, borderColor: palette.line, borderWidth: 1, borderRadius: radii.lg, padding: spacing.lg },
  cardTitle: { color: palette.ink, fontSize: 20, fontWeight: '800' },
  cardMeta: { color: palette.muted, fontSize: 12, marginTop: 3 },
  cardBody: { color: palette.muted, fontSize: 14, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  secondaryButton: { flex: 1, alignItems: 'center', borderRadius: radii.md, borderWidth: 1, borderColor: palette.green, padding: 12 },
  primaryButton: { flex: 1, alignItems: 'center', borderRadius: radii.md, backgroundColor: palette.green, padding: 12 },
  secondaryText: { color: palette.green, fontWeight: '700' },
  primaryText: { color: palette.white, fontWeight: '700' },
  problemCard: { flexDirection: 'row', backgroundColor: '#F2E5C8', borderRadius: radii.lg, padding: spacing.lg },
  questionMark: { width: 48, height: 48, borderRadius: 24, backgroundColor: palette.gold, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  questionMarkText: { color: palette.white, fontSize: 24, fontWeight: '900' },
  problemContent: { flex: 1 },
  problemTitle: { color: palette.ink, fontSize: 17, fontWeight: '800' },
  problemText: { color: '#5F594E', fontSize: 13, lineHeight: 19, marginTop: spacing.xs },
  difficulty: { color: palette.gold, fontSize: 11, marginTop: spacing.sm },
  link: { color: palette.green, fontSize: 13, fontWeight: '700' },
  paperList: { backgroundColor: palette.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: palette.line, overflow: 'hidden' },
  paperRow: { flexDirection: 'row', padding: spacing.md, borderBottomColor: palette.line, borderBottomWidth: StyleSheet.hairlineWidth },
  lastRow: { borderBottomWidth: 0 },
  paperNumber: { width: 34 },
  paperNumberText: { color: palette.gold, fontWeight: '800', fontSize: 12 },
  paperContent: { flex: 1 },
  paperTitle: { color: palette.ink, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  paperMeta: { color: palette.muted, fontSize: 11, marginTop: 5 },
  dataNote: { color: palette.muted, fontSize: 11, lineHeight: 16, marginTop: spacing.sm, textAlign: 'center' },
});
