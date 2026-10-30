import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { AppScreen } from '@/components/AppScreen';
import { EmptyState } from '@/components/Cards';
import { MathFormula } from '@/components/MathFormula';
import { FormulaDerivation } from '@/components/FormulaDerivation';
import { SearchField } from '@/components/SearchField';
import { PageTitle } from '@/components/Typography';
import { palette, radii, spacing } from '@/constants/Theme';
import { useStudy } from '@/contexts/StudyContext';
import { courseById, courses, formulas, topicById } from '@/data/mockData';
import { CourseId } from '@/types';

export default function FormulasScreen() {
  const [query, setQuery] = useState('');
  const [courseId, setCourseId] = useState<CourseId | 'all'>('all');
  const { favoriteFormulas, toggleFormula } = useStudy();
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return formulas.filter((item) => (courseId === 'all' || item.courseId === courseId) && (!q || [
      item.title, item.titleZh, item.explanation, item.conditions ?? '', item.latex,
      topicById(item.topicId)?.titleZh ?? '',
      courseById(item.courseId)?.titleZh ?? '', courseById(item.courseId)?.title ?? '',
      ...(item.derivation ?? []).flatMap((step) => [step.title, step.body, step.latex ?? '']),
    ].join(' ').toLowerCase().includes(q)));
  }, [query, courseId]);
  const [visible, setVisible] = useState(12);
  useEffect(() => setVisible(12), [results]);

  return (
    <AppScreen>
      <PageTitle subtitle="按知识点组织的常用公式，点击即可回到上下文。">公式库</PageTitle>
      <SearchField value={query} onChangeText={setQuery} placeholder="搜索公式、含义或 LaTeX" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        <Pressable accessibilityRole="button" accessibilityState={{ selected: courseId === 'all' }} onPress={() => setCourseId('all')}
          style={[styles.chip, courseId === 'all' && styles.chipActive]}><Text style={courseId === 'all' ? styles.white : styles.chipText}>全部课程</Text></Pressable>
        {courses.map((course) => <Pressable key={course.id} accessibilityRole="button" accessibilityState={{ selected: courseId === course.id }}
          onPress={() => setCourseId(course.id)} style={[styles.chip, courseId === course.id && styles.chipActive]}>
          <Text style={courseId === course.id ? styles.white : styles.chipText}>{course.titleZh}</Text>
        </Pressable>)}
      </ScrollView>
      <Text style={styles.count}>{results.length} 条公式 · 已显示 {Math.min(visible, results.length)} 条</Text>
      {results.length ? results.slice(0, visible).map((formula) => {
        const course = courseById(formula.courseId);
        const isFavorite = favoriteFormulas.includes(formula.id);
        return (
          <Pressable
            key={formula.id}
            onPress={() => router.push({ pathname: '/topic/[slug]', params: { slug: formula.topicId } })}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
            <View style={styles.header}>
              <View style={[styles.dot, { backgroundColor: course?.accent }]} />
              <View style={styles.titleWrap}>
                <Text style={styles.title}>{formula.titleZh}</Text>
                <Text style={styles.meta}>{formula.title} · {course?.titleZh}</Text>
              </View>
              <Pressable
                accessibilityLabel={isFavorite ? '取消收藏公式' : '收藏公式'}
                onPress={(event) => { event.stopPropagation(); toggleFormula(formula.id); }}
                style={[styles.favorite, isFavorite && styles.favoriteActive]}>
                <Text style={[styles.favoriteText, isFavorite && styles.favoriteTextActive]}>{isFavorite ? '★' : '☆'}</Text>
              </Pressable>
            </View>
            <MathFormula latex={formula.latex} compact />
            <Text style={styles.explanation}>{formula.explanation}</Text>
            {formula.conditions ? (
              <View style={styles.conditions}>
                <Text style={styles.conditionsTitle}>适用条件</Text>
                <Text style={styles.explanation}>{formula.conditions}</Text>
              </View>
            ) : null}
            <FormulaDerivation formula={formula} />
          </Pressable>
        );
      }) : <EmptyState />}
      {visible < results.length ? <Pressable accessibilityRole="button" accessibilityLabel="加载更多公式"
        onPress={() => setVisible(value => value + 12)} style={styles.more}>
        <Text style={styles.moreText}>再看 {Math.min(12, results.length - visible)} 条公式</Text>
      </Pressable> : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  more: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginVertical: spacing.md, borderRadius: radii.md, backgroundColor: palette.greenSoft },
  moreText: { color: palette.green, fontWeight: '700', fontSize: 14 },
  filters: { gap: 8, paddingBottom: spacing.md },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: palette.line, borderRadius: radii.pill, backgroundColor: palette.surface },
  chipActive: { backgroundColor: palette.green, borderColor: palette.green },
  chipText: { color: palette.muted, fontSize: 12, fontWeight: '700' },
  white: { color: palette.white, fontSize: 12, fontWeight: '700' },
  count: { color: palette.muted, fontSize: 12, marginBottom: spacing.sm },
  card: { backgroundColor: palette.surface, borderColor: palette.line, borderWidth: 1, borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.sm },
  pressed: { opacity: 0.68 },
  header: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
  titleWrap: { flex: 1 },
  title: { color: palette.ink, fontSize: 17, fontWeight: '800' },
  meta: { color: palette.muted, fontSize: 11, marginTop: 2 },
  favorite: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: palette.line, alignItems: 'center', justifyContent: 'center' },
  favoriteActive: { backgroundColor: '#F2E5C8', borderColor: '#F2E5C8' },
  favoriteText: { color: palette.muted, fontSize: 19 },
  favoriteTextActive: { color: palette.gold },
  explanation: { color: palette.muted, fontSize: 13, lineHeight: 20 },
  conditions: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.line, marginTop: spacing.sm, paddingTop: spacing.sm },
  conditionsTitle: { color: palette.green, fontSize: 12, fontWeight: '800', marginBottom: 4 },
});
