import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/AppScreen';
import { EmptyState, ProblemCard } from '@/components/Cards';
import { SearchField } from '@/components/SearchField';
import { PageTitle } from '@/components/Typography';
import { palette, radii, spacing } from '@/constants/Theme';
import { useStudy } from '@/contexts/StudyContext';
import { courseById, courses, problems, topicById } from '@/data/mockData';
import { CourseId } from '@/types';

const completionOptions = [
  { id: 'all', label: '全部状态' },
  { id: 'uncompleted', label: '未完成' },
  { id: 'completed', label: '已完成' },
] as const;

export default function ProblemsScreen() {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<number | null>(null);
  const [courseId, setCourseId] = useState<CourseId | null>(null);
  const [completion, setCompletion] = useState<typeof completionOptions[number]['id']>('all');
  const { completedProblems } = useStudy();
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return problems.filter((item) => {
      const course = courseById(item.courseId);
      const topic = topicById(item.topicId);
      const matchesText = !q || [item.title, item.prompt, item.answer, course?.titleZh,
        course?.title, topic?.titleZh, topic?.title].join(' ').toLowerCase().includes(q);
      const matchesLevel = !level || item.difficulty === level;
      const matchesCourse = !courseId || item.courseId === courseId;
      const isCompleted = completedProblems.includes(item.id);
      const matchesCompletion = completion === 'all'
        || (completion === 'completed' ? isCompleted : !isCompleted);
      return matchesText && matchesLevel && matchesCourse && matchesCompletion;
    });
  }, [query, level, courseId, completion, completedProblems]);

  return (
    <AppScreen>
      <PageTitle subtitle="每题都包含提示、分步解析与最终答案。">经典例题</PageTitle>
      <SearchField value={query} onChangeText={setQuery} placeholder="搜索例题、课程或知识点" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.courses}>
        <Pressable accessibilityRole="button" accessibilityState={{ selected: courseId === null }}
          onPress={() => setCourseId(null)} style={[styles.course, courseId === null && styles.active]}>
          <Text style={[styles.levelText, courseId === null && styles.activeText]}>全部课程</Text>
        </Pressable>
        {courses.map((course) => (
          <Pressable key={course.id} accessibilityRole="button" accessibilityState={{ selected: courseId === course.id }}
            onPress={() => setCourseId(course.id)} style={[styles.course, courseId === course.id && styles.active]}>
            <Text style={[styles.levelText, courseId === course.id && styles.activeText]}>{course.titleZh}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.levels}>
        <Pressable accessibilityRole="button" accessibilityState={{ selected: level === null }}
          onPress={() => setLevel(null)} style={[styles.level, level === null && styles.active]}>
          <Text style={[styles.levelText, level === null && styles.activeText]}>全部</Text>
        </Pressable>
        {[1, 2, 3, 4, 5].map((value) => (
          <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: level === value }}
            onPress={() => setLevel(value)} style={[styles.level, level === value && styles.active]}>
            <Text style={[styles.levelText, level === value && styles.activeText]}>{value}★</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.levels}>
        {completionOptions.map((option) => (
          <Pressable key={option.id} accessibilityRole="button" accessibilityState={{ selected: completion === option.id }}
            onPress={() => setCompletion(option.id)} style={[styles.level, completion === option.id && styles.active]}>
            <Text style={[styles.levelText, completion === option.id && styles.activeText]}>{option.label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.count}>{results.length} 道题</Text>
      {results.length ? results.map((problem) => (
        <ProblemCard key={problem.id} problem={problem} completed={completedProblems.includes(problem.id)} />
      )) : <EmptyState label="没有符合当前筛选条件的例题" />}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  courses: { gap: 7, paddingBottom: spacing.md },
  course: { borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 10 },
  levels: { flexDirection: 'row', gap: 7, marginBottom: spacing.md },
  level: { flex: 1, alignItems: 'center', borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, borderRadius: radii.sm, paddingVertical: 8 },
  active: { backgroundColor: palette.green, borderColor: palette.green },
  levelText: { color: palette.muted, fontSize: 11, fontWeight: '700' },
  activeText: { color: palette.white },
  count: { color: palette.muted, fontSize: 12, marginBottom: spacing.sm },
});
