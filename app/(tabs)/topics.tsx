import { useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/AppScreen';
import { EmptyState, TopicRow } from '@/components/Cards';
import { SearchField } from '@/components/SearchField';
import { PageTitle } from '@/components/Typography';
import { palette, radii, spacing } from '@/constants/Theme';
import { courses, topics } from '@/data/mockData';
import { normalizeCourseSelection } from '@/data/problemFilters';

export default function TopicsScreen() {
  const [query, setQuery] = useState('');
  const params = useLocalSearchParams<{ course?: string }>();
  const selected = normalizeCourseSelection(params.course, courses);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return topics.filter((topic) => {
      const inCourse = selected === 'all' || topic.courseId === selected;
      const matches = !q || `${topic.title} ${topic.titleZh} ${topic.summary}`.toLowerCase().includes(q);
      return inCourse && matches;
    });
  }, [query, selected]);

  return (
    <AppScreen>
      <PageTitle subtitle={courses.length + ' 门课程 · ' + topics.length + ' 个知识点，从计算走向证明。'}>知识地图</PageTitle>
      <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/course-roadmap', params: { course: selected } })} style={styles.guide}><Text style={styles.guideTitle}>每门 70 点 · 课程拓展路线 →</Text><Text style={styles.courseDescription}>查看分章目录与已完善进度。待补充目录不计入正式知识库。</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={() => router.push('/textbook-guide')} style={styles.guide}><Text style={styles.guideTitle}>教材导学 · 4 条路线 →</Text><Text style={styles.courseDescription}>新增高数、概率与随机过程 12 个专题、24 道自编题，按已核对章节建立学习顺序。</Text></Pressable>
      <Text style={styles.courseDescription}>新增高等代数、复变函数、解析几何、测度论与数学分析入门精选。每个新知识点配有适用条件、易错点和例题；这些内容是学习起点，不代替完整教材。</Text>
      <SearchField value={query} onChangeText={setQuery} placeholder="搜索知识点（中英文）" />
      <View style={styles.filters}>
        <Pressable accessibilityRole="button" accessibilityState={{ selected: selected === 'all' }}
          onPress={() => router.setParams({ course: 'all' })} style={[styles.chip, selected === 'all' && styles.chipActive]}>
          <Text style={[styles.chipText, selected === 'all' && styles.chipTextActive]}>全部</Text>
        </Pressable>
        {courses.map((course) => (
          <Pressable key={course.id} accessibilityRole="button" accessibilityState={{ selected: selected === course.id }}
            onPress={() => router.setParams({ course: course.id })} style={[styles.chip, selected === course.id && styles.chipActive]}>
            <Text style={[styles.chipText, selected === course.id && styles.chipTextActive]}>{course.titleZh}</Text>
          </Pressable>
        ))}
      </View>

      {selected === 'all' && !query ? courses.map((course) => {
        const courseTopics = topics.filter((topic) => topic.courseId === course.id);
        return (
          <View key={course.id} style={styles.courseBlock}>
            <View style={styles.courseHeader}>
              <View style={[styles.courseIcon, { backgroundColor: course.accent }]}><Text style={styles.courseIconText}>{course.icon}</Text></View>
              <View style={styles.courseTitleWrap}>
                <Text style={styles.courseTitle}>{course.titleZh}</Text>
                <Text style={styles.courseMeta}>{course.title} · {courseTopics.length} 个知识点</Text>
              </View>
            </View>
            <Text style={styles.courseDescription}>{course.description}</Text>
            <View style={styles.topicList}>
              {courseTopics.map((topic, index) => <TopicRow key={topic.id} topic={topic} index={index + 1} />)}
            </View>
          </View>
        );
      }) : (
        <View style={styles.results}>
          <Text style={styles.resultCount}>{filtered.length} 个结果</Text>
          {filtered.length ? (
            <View style={styles.topicList}>{filtered.map((topic, index) => <TopicRow key={topic.id} topic={topic} index={index + 1} />)}</View>
          ) : <EmptyState />}
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  guide: { backgroundColor: palette.greenSoft, padding: spacing.md, borderRadius: radii.md, marginBottom: spacing.md },
  guideTitle: { color: palette.green, fontWeight: '800', fontSize: 16 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.sm },
  chip: { borderRadius: radii.pill, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, paddingHorizontal: 12, paddingVertical: 8 },
  chipActive: { backgroundColor: palette.green, borderColor: palette.green },
  chipText: { color: palette.muted, fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: palette.white },
  courseBlock: { marginTop: spacing.lg },
  courseHeader: { flexDirection: 'row', alignItems: 'center' },
  courseIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  courseIconText: { color: palette.white, fontSize: 18, fontWeight: '900' },
  courseTitleWrap: { flex: 1 },
  courseTitle: { color: palette.ink, fontSize: 21, fontWeight: '800' },
  courseMeta: { color: palette.muted, fontSize: 12, marginTop: 2 },
  courseDescription: { color: palette.muted, fontSize: 13, lineHeight: 20, marginTop: spacing.sm, marginBottom: spacing.sm },
  topicList: { borderRadius: radii.md, borderWidth: 1, borderColor: palette.line, overflow: 'hidden' },
  results: { marginTop: spacing.md },
  resultCount: { color: palette.muted, fontSize: 12, marginBottom: spacing.sm },
});
