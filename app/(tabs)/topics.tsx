import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/AppScreen';
import { EmptyState, TopicRow } from '@/components/Cards';
import { SearchField } from '@/components/SearchField';
import { PageTitle } from '@/components/Typography';
import { palette, radii, spacing } from '@/constants/Theme';
import { courses, topics } from '@/data/mockData';
import { CourseId } from '@/types';

export default function TopicsScreen() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<CourseId | 'all'>('all');

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
      <PageTitle subtitle="第一版覆盖 5 门大学数学核心课程。">知识地图</PageTitle>
      <SearchField value={query} onChangeText={setQuery} placeholder="搜索知识点（中英文）" />
      <View style={styles.filters}>
        <Pressable onPress={() => setSelected('all')} style={[styles.chip, selected === 'all' && styles.chipActive]}>
          <Text style={[styles.chipText, selected === 'all' && styles.chipTextActive]}>全部</Text>
        </Pressable>
        {courses.map((course) => (
          <Pressable key={course.id} onPress={() => setSelected(course.id)} style={[styles.chip, selected === course.id && styles.chipActive]}>
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
