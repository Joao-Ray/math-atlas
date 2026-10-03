import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/AppScreen';
import { EmptyState, ProblemCard } from '@/components/Cards';
import { SearchField } from '@/components/SearchField';
import { PageTitle } from '@/components/Typography';
import { palette, radii, spacing } from '@/constants/Theme';
import { problems } from '@/data/mockData';

export default function ProblemsScreen() {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<number | null>(null);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return problems.filter((item) => {
      const matchesText = !q || `${item.title} ${item.prompt} ${item.answer}`.toLowerCase().includes(q);
      const matchesLevel = !level || item.difficulty === level;
      return matchesText && matchesLevel;
    });
  }, [query, level]);

  return (
    <AppScreen>
      <PageTitle subtitle="每题都包含提示、分步解析与最终答案。">经典例题</PageTitle>
      <SearchField value={query} onChangeText={setQuery} placeholder="搜索例题" />
      <View style={styles.levels}>
        <Pressable onPress={() => setLevel(null)} style={[styles.level, level === null && styles.active]}>
          <Text style={[styles.levelText, level === null && styles.activeText]}>全部</Text>
        </Pressable>
        {[1, 2, 3, 4, 5].map((value) => (
          <Pressable key={value} onPress={() => setLevel(value)} style={[styles.level, level === value && styles.active]}>
            <Text style={[styles.levelText, level === value && styles.activeText]}>{value}★</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.count}>{results.length} 道题</Text>
      {results.length ? results.map((problem) => <ProblemCard key={problem.id} problem={problem} />) : <EmptyState />}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  levels: { flexDirection: 'row', gap: 7, marginBottom: spacing.md },
  level: { flex: 1, alignItems: 'center', borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, borderRadius: radii.sm, paddingVertical: 8 },
  active: { backgroundColor: palette.green, borderColor: palette.green },
  levelText: { color: palette.muted, fontSize: 11, fontWeight: '700' },
  activeText: { color: palette.white },
  count: { color: palette.muted, fontSize: 12, marginBottom: spacing.sm },
});
