import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen } from '@/components/AppScreen';
import { PageTitle, SectionTitle } from '@/components/Typography';
import { palette, radii, spacing } from '@/constants/Theme';
import { topicById } from '@/data/mockData';
import { textbookGuides, textbookNotice } from '@/data/textbookStudy';
import { textbookTopics } from '@/data/textbookExpansionV17';
import { useStudy } from '@/contexts/StudyContext';

export default function TextbookGuide() {
  const { completedProblems } = useStudy();
  return <AppScreen><PageTitle subtitle="4 条已核对资料的学习路线 · 12 个新专题 · 24 道自编配套题">教材导学</PageTitle>
    <View style={styles.notice}><Text style={styles.body}>{textbookNotice}</Text><Text style={styles.body}>按路线学习即可跳转知识、公式与解析题；不需要下载或打开整本书。路线顺序是本 App 的学习建议，不冒充教材原目录。</Text></View>
    {textbookGuides.map((guide) => <View key={guide.id} style={styles.card}><Text style={styles.title}>{guide.title}</Text><Text style={styles.meta}>{guide.authors}</Text><Text style={styles.body}>{guide.focus}</Text><Text style={styles.meta}>{guide.chapters.join(' · ')}</Text><Text style={styles.body}>{guide.advice}</Text>
      {guide.topicIds.map((id, index) => { const topic = topicById(id); if (!topic) return null; const count = topic.problemIds.filter((problem) => completedProblems.includes(problem)).length; return <Pressable key={id} accessibilityRole="button" onPress={() => router.push({ pathname: '/topic/[slug]', params: { slug: id } })} style={styles.lesson}><Text style={styles.link}>{index + 1}. {topic.titleZh} →</Text><Text style={styles.meta}>{textbookTopics.some((item) => item.id === id) ? '本轮新增 · ' : ''}例题完成 {count}/{topic.problemIds.length}</Text></Pressable>; })}
      <Text style={styles.meta}>{guide.verification}</Text></View>)}
    <SectionTitle>这轮新增的全部专题</SectionTitle><View style={styles.card}>{textbookTopics.map((topic) => <Pressable key={topic.id} style={styles.lesson} accessibilityRole="button" onPress={() => router.push({ pathname: '/topic/[slug]', params: { slug: topic.id } })}><Text style={styles.link}>{topic.titleZh} →</Text><Text style={styles.meta}>{topic.summary}</Text></Pressable>)}</View>
  </AppScreen>;
}
const styles = StyleSheet.create({
  notice: { backgroundColor: palette.greenSoft, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.lg },
  card: { backgroundColor: palette.surface, borderColor: palette.line, borderWidth: 1, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.lg },
  title: { color: palette.ink, fontSize: 21, fontWeight: '800', lineHeight: 30 },
  body: { color: palette.ink, fontSize: 14, lineHeight: 23, marginTop: 10 },
  meta: { color: palette.muted, fontSize: 12, lineHeight: 20, marginTop: 6 },
  lesson: { paddingVertical: 12, borderTopWidth: 1, borderColor: palette.line, marginTop: 8 },
  link: { color: palette.green, fontSize: 15, fontWeight: '700', lineHeight: 24 },
});
