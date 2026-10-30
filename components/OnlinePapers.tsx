import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SearchField } from '@/components/SearchField';
import { palette, radii, spacing } from '@/constants/Theme';
import { defaultPaperFilter, normalizePaperRequest, OnlinePaper, PAPER_BROWSE_LIMIT, paperCategories, PaperFeedFilter } from '@/data/paperFeed';
import { useOnlinePapers } from '@/hooks/useOnlinePapers';

function OnlinePaperCard({ paper, expanded, onToggle }: { paper: OnlinePaper; expanded: boolean; onToggle: () => void }) {
  const [linkError, setLinkError] = useState('');
  return <View style={styles.card}>
    <Pressable accessibilityRole="button" accessibilityLabel={'展开在线论文 ' + paper.title}
      accessibilityState={{ expanded }} onPress={onToggle}>
      <Text style={styles.category}>{paper.categories.slice(0, 3).join(' · ')}</Text>
      <Text style={styles.title}>{paper.title}</Text>
      <Text style={styles.body}>{paper.authors}</Text>
      <Text style={styles.small}>首次提交 {paper.publishedAt.slice(0, 10)} · 最近修订 {paper.updatedAt.slice(0, 10)}</Text>
      <Text style={styles.link}>arXiv:{paper.versionedId} · {expanded ? '收起摘要 ↑' : '查看原文摘要 ↓'}</Text>
    </Pressable>
    {expanded ? <View style={styles.details}>
      <Text style={styles.label}>作者原文摘要 · 在线获取</Text>
      <Text selectable style={styles.body}>{paper.abstract || '来源暂未提供摘要，请打开原文查看。'}</Text>
      <Text style={styles.small}>自动导入的预印本元数据，未经本应用逐篇人工核验，不等于已通过同行评审；没有自动生成中文解读。</Text>
      <Text selectable style={styles.small}>{paper.url}</Text>
      <Pressable accessibilityRole="link" accessibilityLabel={'打开 arXiv 原文 ' + paper.versionedId}
        onPress={() => { setLinkError(''); void Linking.openURL(paper.url).catch(() => setLinkError('无法打开浏览器，请复制上方 arXiv 链接后打开。')); }} style={styles.button}>
        <Text style={styles.link}>在 arXiv 查看原文 ↗</Text>
      </Pressable>
      {linkError ? <Text accessibilityRole="alert" style={styles.error}>{linkError}</Text> : null}
    </View> : null}
  </View>;
}

export function OnlinePapers({ onShowCurated }: { onShowCurated: () => void }) {
  const [filter, setFilter] = useState<PaperFeedFilter>(defaultPaperFilter);
  const [input, setInput] = useState('');
  const [formError, setFormError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const { feed, loading, error, notice, fromCache, retryAt, refresh, loadMore, clearCache } = useOnlinePapers(filter);
  const cooling = retryAt > Date.now();
  const search = () => {
    try {
      const next = normalizePaperRequest({ ...filter, query: input, start: 0 });
      setFormError(''); setExpanded(null);
      if (next.query === filter.query) refresh();
      else setFilter({ category: next.category, query: next.query, sort: next.sort });
    } catch (caught) { setFormError(caught instanceof Error ? caught.message : '检索词无效。'); }
  };
  return <>
    <View style={styles.notice}>
      <Text style={styles.label}>arXiv 在线论文 · 自动检查更新</Text>
      <Text style={styles.body}>进入此页、回到前台或保持此页打开时，会检查 24 小时缓存并在过期后尝试更新。刷新会重新查询服务，服务端也会遵循缓存和限流规则。不是实时推送。</Text>
      <Text style={styles.small}>只获取标题、作者、摘要等元数据，不下载或转存论文 PDF。检索词会发送至论文服务和 arXiv，请不要输入个人隐私。离线时可读最近缓存的首页。</Text>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalOptions}>
      {paperCategories.map((category) => <Pressable key={category.id} accessibilityRole="button"
        accessibilityLabel={'在线论文分类 ' + category.label} accessibilityState={{ selected: filter.category === category.id }}
        onPress={() => { setExpanded(null); setFilter((current) => ({ ...current, category: category.id })); }} style={[styles.pill, filter.category === category.id && styles.active]}>
        <Text style={filter.category === category.id ? styles.white : styles.link}>{category.label}</Text>
      </Pressable>)}
    </ScrollView>
    <View style={styles.options}>
      {([{ id: 'updated', label: '最近修订优先' }, { id: 'submitted', label: '首次提交优先' }] as const).map((sort) => <Pressable key={sort.id}
        accessibilityRole="button" accessibilityLabel={sort.label} accessibilityState={{ selected: filter.sort === sort.id }}
        onPress={() => { setExpanded(null); setFilter((current) => ({ ...current, sort: sort.id })); }} style={[styles.pill, filter.sort === sort.id && styles.active]}>
        <Text style={filter.sort === sort.id ? styles.white : styles.link}>{sort.label}</Text>
      </Pressable>)}
    </View>
    <SearchField value={input} onChangeText={(value) => { setInput(value); setFormError(''); }} placeholder="英文标题、作者或摘要关键词；输入后点在线检索" />
    <Text style={styles.small}>当前检索：{filter.query || '本分类最新论文'}。英文关键词通常更适合来源检索；输入时不会逐字发送请求。</Text>
    <View style={styles.options}>
      <Pressable accessibilityRole="button" accessibilityLabel="在线检索论文" disabled={loading || cooling} onPress={search} style={[styles.pill, styles.active, (loading || cooling) && styles.disabled]}><Text style={styles.white}>在线检索</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="刷新在线论文" disabled={loading || cooling} onPress={refresh} style={[styles.pill, (loading || cooling) && styles.disabled]}><Text style={styles.link}>{loading ? '正在加载…' : cooling ? '限流等待中' : '刷新 / 重试'}</Text></Pressable>
      {(input || filter.query) ? <Pressable accessibilityRole="button" accessibilityLabel="清除在线检索词"
        onPress={() => { setInput(''); setFormError(''); setExpanded(null); setFilter((current) => ({ ...current, query: '' })); }} style={styles.pill}><Text style={styles.link}>清除检索词</Text></Pressable> : null}
    </View>
    {cooling ? <Text style={styles.small}>来源要求等待，约 {new Date(retryAt).toLocaleTimeString()} 后可重试。本应用不会绕过限流。</Text> : null}
    {formError || error ? <View style={styles.errorBox}>
      <Text accessibilityRole="alert" style={styles.error}>{formError || error}</Text>
      <Text style={styles.small}>已显示的内容会保留；也可以切换到本地精选。</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="联网失败时阅读本地精选" onPress={onShowCurated}><Text style={styles.link}>阅读本地精选 →</Text></Pressable>
    </View> : null}
    {notice ? <Text accessibilityRole="alert" style={styles.small}>{notice}</Text> : null}
    {feed ? <>
      <Text style={styles.small}>{fromCache ? '本机缓存 · 首页' : feed.serverCached ? '论文服务缓存' : '在线获取'} · 获取于 {new Date(feed.fetchedAt).toLocaleString()}</Text>
      <Text style={styles.label}>匹配 {feed.total} 篇 · 已加载 {feed.papers.length} 篇（按 arXiv ID 去重）</Text>
      {loading ? <Text style={styles.small}>正在更新或加载下一页，原有内容不会清空。</Text> : null}
      {feed.papers.map((paper) => <OnlinePaperCard key={paper.id} paper={paper} expanded={expanded === paper.id}
        onToggle={() => setExpanded((current) => current === paper.id ? null : paper.id)} />)}
      {!feed.papers.length ? <Text style={styles.body}>没有匹配的在线论文。试试简短英文关键词，或切换分类。</Text> : null}
      {feed.nextStart !== null ? <Pressable accessibilityRole="button" accessibilityLabel="加载更多在线论文" disabled={loading || cooling}
        onPress={loadMore} style={[styles.button, (loading || cooling) && styles.disabled]}><Text style={styles.link}>{loading ? '加载中…' : '加载更多（每次 10 篇）'}</Text></Pressable> : feed.total > PAPER_BROWSE_LIMIT && feed.papers.length ? <Text style={styles.small}>已达到本次浏览上限。为避免批量抓取，请缩小分类或检索词后再查。</Text> : null}
    </> : loading ? <Text style={styles.body}>正在读取缓存或连接论文服务…</Text> : null}
    <Text style={styles.small}>本机最多保留最近 4 种检索的首页，每页 10 篇。更多页只在当前页面保留，重新进入会从首页开始；来源更新时分页结果可能移动。</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="清除本机在线论文缓存" disabled={loading}
      onPress={() => { setExpanded(null); void clearCache(); }} style={[styles.button, loading && styles.disabled]}><Text style={styles.link}>清除本机在线论文缓存（不清除学习记录）</Text></Pressable>
  </>;
}

const styles = StyleSheet.create({
  horizontalOptions: { gap: 8, paddingBottom: spacing.md },
  notice: { backgroundColor: palette.greenSoft, padding: spacing.md, borderRadius: radii.md, marginBottom: spacing.md },
  label: { color: palette.ink, fontSize: 14, fontWeight: '700', lineHeight: 22, marginBottom: 8 },
  body: { color: palette.muted, fontSize: 14, lineHeight: 23, marginTop: 6 },
  small: { color: palette.muted, fontSize: 12, lineHeight: 20, marginVertical: 8 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: spacing.md },
  pill: { borderWidth: 1, borderColor: palette.green, borderRadius: radii.pill, paddingHorizontal: 13, paddingVertical: 11 },
  active: { backgroundColor: palette.green },
  white: { color: palette.white, fontSize: 12, fontWeight: '700' },
  link: { color: palette.green, fontSize: 12, lineHeight: 20, fontWeight: '700' },
  disabled: { opacity: 0.5 },
  errorBox: { backgroundColor: '#F8E5E0', padding: spacing.md, borderRadius: radii.md, marginBottom: spacing.md },
  error: { color: palette.red, fontSize: 13, lineHeight: 22 },
  card: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: radii.lg, padding: spacing.md, marginTop: spacing.md },
  category: { color: palette.green, fontSize: 11, fontWeight: '700' },
  title: { color: palette.ink, fontSize: 18, fontWeight: '800', lineHeight: 26, marginTop: 8 },
  details: { marginTop: spacing.md, borderTopWidth: 1, borderTopColor: palette.line, paddingTop: spacing.md },
  button: { borderWidth: 1, borderColor: palette.green, borderRadius: radii.md, alignItems: 'center', padding: 13, marginTop: spacing.md },
});
