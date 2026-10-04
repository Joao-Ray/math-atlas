import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { AppScreen } from '@/components/AppScreen';
import { EmptyState } from '@/components/Cards';
import { MathFormula } from '@/components/MathFormula';
import { FormulaDerivation } from '@/components/FormulaDerivation';
import { SearchField } from '@/components/SearchField';
import { PageTitle } from '@/components/Typography';
import { palette, radii, spacing } from '@/constants/Theme';
import { useStudy } from '@/contexts/StudyContext';
import { courseById, formulas, topicById } from '@/data/mockData';

export default function FormulasScreen() {
  const [query, setQuery] = useState('');
  const { favoriteFormulas, toggleFormula } = useStudy();
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return formulas.filter((item) => !q || [
      item.title, item.titleZh, item.explanation, item.conditions ?? '', item.latex,
      topicById(item.topicId)?.titleZh ?? '',
      ...(item.derivation ?? []).flatMap((step) => [step.title, step.body, step.latex ?? '']),
    ].join(' ').toLowerCase().includes(q));
  }, [query]);

  return (
    <AppScreen>
      <PageTitle subtitle="按知识点组织的常用公式，点击即可回到上下文。">公式库</PageTitle>
      <SearchField value={query} onChangeText={setQuery} placeholder="搜索公式、含义或 LaTeX" />
      <Text style={styles.count}>{results.length} 条公式</Text>
      {results.length ? results.map((formula) => {
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
    </AppScreen>
  );
}

const styles = StyleSheet.create({
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
