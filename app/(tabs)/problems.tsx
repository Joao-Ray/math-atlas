import { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { AppScreen } from '@/components/AppScreen';
import { EmptyState, ProblemCard } from '@/components/Cards';
import { SearchField } from '@/components/SearchField';
import { PageTitle } from '@/components/Typography';
import { palette, radii, spacing } from '@/constants/Theme';
import { useStudy } from '@/contexts/StudyContext';
import { courses, problems, topics } from '@/data/mockData';
import { competitionResource } from '@/data/advancedCurriculum';
import { practiceSets } from '@/data/practiceExpansion';
import { filterStudyProblems, normalizeProblemTrack } from '@/data/problemFilters';
import { CourseId, Problem } from '@/types';

const completionOptions = [
  { id: 'all', label: '全部状态' },
  { id: 'uncompleted', label: '未完成' },
  { id: 'completed', label: '已完成' },
] as const;

export default function ProblemsScreen() {
  const params = useLocalSearchParams<{ track?: string }>();
  const track = normalizeProblemTrack(params.track);
  const [linkError, setLinkError] = useState('');
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<number | null>(null);
  const [courseId, setCourseId] = useState<CourseId | null>(null);
  const [completion, setCompletion] = useState<typeof completionOptions[number]['id']>('all');
  const [paper, setPaper] = useState<'all' | '非数学 A 类' | '非数学 B 类'>('all');
  const [competitionSource, setCompetitionSource] = useState<'all' | 'past-paper' | 'competition-style'>('all');
  const [practiceSet, setPracticeSet] = useState<'all' | NonNullable<Problem['practiceSet']>>('all');
  useEffect(() => {
    setQuery(''); setLevel(null); setCourseId(null); setCompletion('all'); setPaper('all'); setPracticeSet('all'); setCompetitionSource('all');
  }, [track]);
  const { completedProblems } = useStudy();
  const results = useMemo(() => filterStudyProblems(problems, {
    query, level, courseId, completion, track, paper, practiceSet, competitionSource, completedIds: completedProblems,
  }, courses, topics), [query, level, courseId, completion, track, paper, practiceSet, competitionSource, completedProblems]);
  const [visible, setVisible] = useState(40);
  useEffect(() => setVisible(40), [results]);

  return (
    <AppScreen>
      <PageTitle subtitle="先独立作答，再看提示和分步解析；难度星级为应用内分级。">经典例题与竞赛训练</PageTitle>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.courses}>
        {([{ id: 'all', label: '全部例题' }, { id: 'core', label: '课程练习' }, { id: 'practice', label: '专题练习' }, { id: 'competition', label: '竞赛题库' }] as const).map((option) => (
          <Pressable key={option.id} accessibilityRole="button" accessibilityLabel={option.label}
            accessibilityState={{ selected: track === option.id }} onPress={() => router.setParams({ track: option.id })}
            style={[styles.course, track === option.id && styles.active]}>
            <Text style={[styles.levelText, track === option.id && styles.activeText]}>{option.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {track === 'practice' ? <>
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>数学分析 · 线性代数 · 高等数学</Text>
          <Text style={styles.noticeBody}>每组 6 道自编专题题。数学分析按吉米多维奇式专题方向选题；尚无原书页与题号可核对，因此不标为原书原题。它们属于课程练习，也可在这里集中练习。</Text>
          <Text style={styles.noticeBody}>{practiceSets.find((set) => set.id === practiceSet)?.description ?? '先选方向，再用课程、难度或完成状态缩小范围。答案与提示默认隐藏。'}</Text>
        </View>
        <View style={styles.levels}>
          <Pressable accessibilityRole="button" accessibilityState={{ selected: practiceSet === 'all' }}
            onPress={() => setPracticeSet('all')} style={[styles.level, practiceSet === 'all' && styles.active]}>
            <Text style={[styles.levelText, practiceSet === 'all' && styles.activeText]}>全部专题</Text>
          </Pressable>
          {practiceSets.map((set) => <Pressable key={set.id} accessibilityRole="button" accessibilityState={{ selected: practiceSet === set.id }}
            onPress={() => setPracticeSet(set.id)} style={[styles.level, practiceSet === set.id && styles.active]}>
            <Text style={[styles.levelText, practiceSet === set.id && styles.activeText]}>{set.title}</Text>
          </Pressable>)}
        </View>
      </> : null}
      {track === 'competition' ? <>
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>大学生数学竞赛 · 统一题库</Text>
          <Text style={styles.noticeBody}>真题与自编竞赛训练放在一起，支持课程、难度和完成状态筛选。来源在题目详情中区分；资料真题按所给笔记标注整理，未与官方原卷二次核验。</Text>
        </View>
        <View style={styles.levels}>
          {([{ id: 'all', label: '全部竞赛' }, { id: 'past-paper', label: '真题' }, { id: 'competition-style', label: '训练题' }] as const).map((value) => <Pressable key={value.id}
            accessibilityRole="button" accessibilityState={{ selected: competitionSource === value.id }}
            onPress={() => { setCompetitionSource(value.id); setPaper('all'); }} style={[styles.level, competitionSource === value.id && styles.active]}>
            <Text style={[styles.levelText, competitionSource === value.id && styles.activeText]}>{value.label}</Text>
          </Pressable>)}
        </View>
        {competitionSource === 'past-paper' ?
        <View style={styles.levels}>
          {(['all', '非数学 A 类', '非数学 B 类'] as const).map((value) => <Pressable key={value}
            accessibilityRole="button" accessibilityLabel={value === 'all' ? '显示全部真题类别' : value + '含共用题'}
            accessibilityState={{ selected: paper === value }} onPress={() => setPaper(value)}
            style={[styles.level, paper === value && styles.active]}>
            <Text style={[styles.levelText, paper === value && styles.activeText]}>{value === 'all' ? '全部类别' : value + '（含共用）'}</Text>
          </Pressable>)}
        </View> : null}
        <Pressable accessibilityRole="link" accessibilityLabel="打开高校公开竞赛资料"
          onPress={() => { setLinkError(''); void Linking.openURL(competitionResource.url).catch(() => setLinkError('无法打开浏览器，请复制链接：' + competitionResource.url)); }}>
          <Text style={styles.resourceLink}>高校公开竞赛资料 ↗</Text>
        </Pressable>
        {linkError ? <Text selectable style={styles.noticeBody}>{linkError}</Text> : null}
      </> : null}
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
      <Text style={styles.count}>{results.length} 道题 · 已显示 {Math.min(visible, results.length)} 道</Text>
      {!results.length ? <Pressable accessibilityRole="button" accessibilityLabel="清除例题全部筛选"
        onPress={() => { setQuery(''); setLevel(null); setCourseId(null); setCompletion('all'); setPaper('all'); setPracticeSet('all'); setCompetitionSource('all'); router.setParams({ track: 'all' }); }}
        style={styles.course}><Text style={styles.resourceLink}>清除全部筛选</Text></Pressable> : null}
      {results.length ? results.slice(0, visible).map((problem) => (
        <ProblemCard key={problem.id} problem={problem} completed={completedProblems.includes(problem.id)} />
      )) : <EmptyState label="没有符合当前筛选条件的例题" />}
      {visible < results.length ? <Pressable accessibilityRole="button" accessibilityLabel="加载更多题目"
        onPress={() => setVisible(value => value + 40)} style={styles.more}>
        <Text style={styles.resourceLink}>再看 {Math.min(40, results.length - visible)} 道题 · 还剩 {results.length - visible} 道</Text>
      </Pressable> : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  more: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginVertical: spacing.md, borderRadius: radii.md, backgroundColor: palette.greenSoft },
  notice: { backgroundColor: palette.greenSoft, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md },
  noticeTitle: { color: palette.green, fontWeight: '800', fontSize: 16 },
  noticeBody: { color: palette.muted, fontSize: 12, lineHeight: 20, marginTop: spacing.sm },
  resourceLink: { color: palette.green, fontSize: 13, lineHeight: 22, fontWeight: '700', marginTop: spacing.sm },
  courses: { gap: 7, paddingBottom: spacing.md },
  course: { borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 10 },
  levels: { flexDirection: 'row', gap: 7, marginBottom: spacing.md },
  level: { flex: 1, alignItems: 'center', borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, borderRadius: radii.sm, paddingVertical: 8 },
  active: { backgroundColor: palette.green, borderColor: palette.green },
  levelText: { color: palette.muted, fontSize: 11, fontWeight: '700' },
  activeText: { color: palette.white },
  count: { color: palette.muted, fontSize: 12, marginBottom: spacing.sm },
});
