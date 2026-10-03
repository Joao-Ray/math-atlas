import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/AppScreen';
import { EmptyState } from '@/components/Cards';
import { SearchField } from '@/components/SearchField';
import { PageTitle } from '@/components/Typography';
import { palette, radii, spacing } from '@/constants/Theme';
import { papers, topicById } from '@/data/mockData';

export default function PapersScreen() {
  const { topic: topicId, paper: paperId } = useLocalSearchParams<{ topic?: string; paper?: string }>();
  const selectedTopic = topicById(topicId ?? '');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  useEffect(() => {
    setExpanded(paperId ?? null);
    setQuery('');
  }, [paperId, topicId]);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return papers
      .filter((paper) => !selectedTopic || paper.topicIds.includes(selectedTopic.id))
      .filter((paper) => {
        const topicNames = paper.topicIds.map((id) => topicById(id)?.titleZh ?? '').join(' ');
        return !q || [paper.title, paper.authors, paper.category, paper.source, paper.abstract,
          paper.readingGuide, topicNames, ...paper.tags].join(' ').toLowerCase().includes(q);
      })
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }, [query, selectedTopic]);

  return (
    <AppScreen>
      <PageTitle subtitle="从可靠来源精选数学、统计与计算方向论文。">精选论文</PageTitle>
      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>真实来源 · 本地精选</Text>
        <Text style={styles.noticeText}>精选条目已核对 arXiv 来源，列表并非实时更新。展开卡片可查看摘要、阅读建议和相关知识点。</Text>
      </View>
      {selectedTopic ? (
        <View style={styles.filterBanner}>
          <Text style={styles.filterLabel}>相关知识点：{selectedTopic.titleZh}</Text>
          <Pressable accessibilityRole="button" onPress={() => router.setParams({ topic: undefined, paper: undefined })}>
            <Text style={styles.filterReset}>查看全部</Text>
          </Pressable>
        </View>
      ) : null}
      <SearchField value={query} onChangeText={setQuery} placeholder="搜索标题、中文摘要或知识点" />
      <Text style={styles.count}>{results.length} 篇论文</Text>
      {results.length ? results.map((paper) => {
        const isOpen = expanded === paper.id;
        return (
          <Pressable
            key={paper.id}
            onPress={() => setExpanded(isOpen ? null : paper.id)}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
            <View style={styles.topline}>
              <Text style={styles.category}>{paper.category}</Text>
              <Text style={styles.date}>{paper.publishedAt}</Text>
            </View>
            <Text style={styles.title}>{paper.title}</Text>
            <Text style={styles.authors}>{paper.authors}</Text>
            <View style={styles.tags}>
              {paper.tags.map((tag) => <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>)}
            </View>
            {isOpen ? (
              <View style={styles.details}>
                <Text style={styles.abstract}>{paper.abstract}</Text>
                <Text style={styles.guideTitle}>怎么开始阅读</Text>
                <Text style={styles.abstract}>{paper.readingGuide}</Text>
                <Text style={styles.guideTitle}>相关知识点</Text>
                <View style={styles.tags}>
                  {paper.topicIds.map((id) => {
                    const topic = topicById(id);
                    return topic ? (
                      <Pressable
                        key={id}
                        accessibilityRole="button"
                        onPress={(event) => {
                          event.stopPropagation();
                          router.push({ pathname: '/topic/[slug]', params: { slug: id } });
                        }}
                        style={styles.topicLink}>
                        <Text style={styles.topicLinkText}>{topic.titleZh} ↗</Text>
                      </Pressable>
                    ) : null;
                  })}
                </View>
                <Pressable
                  accessibilityRole="link"
                  onPress={(event) => { event.stopPropagation(); void Linking.openURL(paper.url); }}
                  style={styles.sourceButton}>
                  <Text style={styles.sourceText}>打开 {paper.source}  ↗</Text>
                </Pressable>
              </View>
            ) : null}
            <Text style={styles.toggle}>{isOpen ? '收起摘要  ↑' : '查看摘要  ↓'}</Text>
          </Pressable>
        );
      }) : <EmptyState label="没有匹配的论文" />}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  notice: { backgroundColor: '#F2E5C8', borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md },
  noticeTitle: { color: '#715118', fontWeight: '800', fontSize: 13 },
  noticeText: { color: '#715118', fontSize: 12, lineHeight: 18, marginTop: 3 },
  filterBanner: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, paddingVertical: spacing.sm },
  filterLabel: { color: palette.muted, fontSize: 13 },
  filterReset: { color: palette.green, fontSize: 13, fontWeight: '800' },
  count: { color: palette.muted, fontSize: 12, marginBottom: spacing.sm },
  card: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.sm },
  pressed: { opacity: 0.72 },
  topline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  category: { color: palette.green, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: .8 },
  date: { color: palette.muted, fontSize: 11 },
  title: { color: palette.ink, fontSize: 18, lineHeight: 24, fontWeight: '800', marginTop: spacing.sm },
  authors: { color: palette.muted, fontSize: 12, marginTop: 6 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.md },
  tag: { backgroundColor: palette.greenSoft, borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 5 },
  tagText: { color: palette.green, fontSize: 10, fontWeight: '700' },
  details: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.line },
  abstract: { color: palette.muted, fontSize: 14, lineHeight: 22 },
  guideTitle: { color: palette.ink, fontSize: 13, fontWeight: '800', marginTop: spacing.md, marginBottom: 5 },
  topicLink: { backgroundColor: palette.greenSoft, borderRadius: radii.pill, paddingHorizontal: 11, paddingVertical: 8 },
  topicLinkText: { color: palette.green, fontSize: 12, fontWeight: '700' },
  sourceButton: { alignSelf: 'flex-start', backgroundColor: palette.greenSoft, borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 8, marginTop: spacing.md },
  sourceText: { color: palette.green, fontSize: 12, fontWeight: '800' },
  toggle: { color: palette.green, fontSize: 12, fontWeight: '700', marginTop: spacing.md },
});
