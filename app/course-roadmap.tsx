import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen } from '@/components/AppScreen';
import { PageTitle } from '@/components/Typography';
import { palette, radii, spacing } from '@/constants/Theme';
import { courses, topics } from '@/data/mockData';
import { COURSE_TOPIC_TARGET, getVisibleRoadmap, getRoadmapSummary } from '@/data/curriculumRoadmap';
import { normalizeCourseSelection } from '@/data/problemFilters';

export default function CourseRoadmap() {
  const params = useLocalSearchParams<{ course?: string }>();
  const selected = normalizeCourseSelection(params.course, courses);
  const courseId = selected === 'all' ? 'calculus' : selected;
  const [open, setOpen] = useState<string | null>(null);
  const [publishedOnly, setPublishedOnly] = useState(false);
  const course = courses.find((item) => item.id === courseId)!;
  const summary = getRoadmapSummary(courseId, topics);
  const chapters = getVisibleRoadmap(courseId, topics, publishedOnly);
  return <AppScreen><PageTitle subtitle={'每门目标 70 点 · 已完善 ' + topics.length + '/' + courses.length * COURSE_TOPIC_TARGET + ' 点'}>课程拓展路线</PageTitle>
    <View style={styles.notice}><Text style={styles.body}>每门课程按 7 章、每章 10 点规划。只有“已完善”条目提供定义、适用条件、公式和解析题；“待补充”仅为后续目录，不计入正式知识库，也不能收藏。</Text></View>
    <View style={styles.chips}>{courses.map((item) => <Pressable key={item.id} accessibilityRole="button" accessibilityState={{ selected: item.id === courseId }} onPress={() => { router.setParams({ course: item.id }); setOpen(null); }} style={[styles.chip, item.id === courseId && styles.active]}><Text style={item.id === courseId ? styles.activeText : styles.meta}>{item.titleZh}</Text></Pressable>)}</View>
    <Text style={styles.title}>{course.titleZh}</Text><Text style={styles.body}>已完善 {summary.published}/{summary.target} · 待补充 {summary.planned}</Text>
    <View accessibilityLabel={'已完善 ' + summary.published + '，目标 ' + summary.target} style={styles.track}><View style={[styles.progress, { width: `${summary.published / summary.target * 100}%` }]} /></View>
    <View style={styles.chips}>{[{ value: false, label: '完整课程目录' }, { value: true, label: '只看已完善' }].map((option) => <Pressable key={option.label} accessibilityRole="button" accessibilityState={{ selected: publishedOnly === option.value }} onPress={() => setPublishedOnly(option.value)} style={[styles.chip, publishedOnly === option.value && styles.active]}><Text style={publishedOnly === option.value ? styles.activeText : styles.meta}>{option.label}</Text></Pressable>)}</View>
    {publishedOnly ? <Text style={styles.meta}>仅显示可学习内容，保留原章节与知识点编号；目标和进度不变。</Text> : null}
    {chapters.length === 0 ? <Text style={styles.meta}>该课程暂时没有已完善的内容，可切换到完整课程目录。</Text> : null}
    {chapters.map((chapter) => <View key={chapter.id} style={styles.card}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open === chapter.id }} onPress={() => setOpen(open === chapter.id ? null : chapter.id)}><Text style={styles.title}>{chapter.position}. {chapter.title} {open === chapter.id ? '−' : '+'}</Text><Text style={styles.meta}>已完善 {chapter.publishedCount}/{chapter.total} · 点击展开</Text></Pressable>
      {open === chapter.id ? chapter.entries.map((entry) => entry.published ? <Pressable key={entry.id} style={styles.row} accessibilityRole="link" onPress={() => router.push({ pathname: '/topic/[slug]', params: { slug: entry.id } })}><Text style={styles.link}>{entry.position}. {entry.title} →</Text><Text style={styles.meta}>已完善 · 定义 / 公式 / 练习</Text></Pressable> : <View key={entry.id} style={styles.row}><Text style={styles.pending}>{entry.position}. {entry.title}</Text><Text style={styles.meta}>待补充 · 仅课程规划</Text></View>) : null}
    </View>)}
  </AppScreen>;
}
const styles = StyleSheet.create({
  notice: { padding: spacing.md, backgroundColor: palette.greenSoft, borderRadius: radii.md, marginBottom: spacing.md },
  body: { color: palette.ink, fontSize: 14, lineHeight: 23 },
  meta: { color: palette.muted, fontSize: 12, lineHeight: 20 },
  title: { color: palette.ink, fontSize: 19, fontWeight: '800', lineHeight: 29 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  chip: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: radii.pill },
  active: { backgroundColor: palette.green }, activeText: { color: palette.white, fontSize: 12, lineHeight: 20 },
  track: { height: 6, borderRadius: 3, backgroundColor: palette.line, overflow: 'hidden', marginTop: 10, marginBottom: spacing.lg }, progress: { height: 6, backgroundColor: palette.green },
  card: { padding: spacing.md, backgroundColor: palette.surface, borderRadius: radii.md, borderColor: palette.line, borderWidth: 1, marginBottom: spacing.md },
  row: { borderTopWidth: 1, borderColor: palette.line, paddingVertical: 12, marginTop: 8 },
  link: { color: palette.green, fontWeight: '700', fontSize: 14, lineHeight: 23 }, pending: { color: palette.muted, fontSize: 14, lineHeight: 23 },
});
