import { useState } from 'react';
import { Text, View } from '@tarojs/components';
import { papers, topics } from '../../../data/mockData';
import { Card, Empty, Heading, Screen, Search } from '../components/UI';
import { copyText, openPage } from '../lib/navigation';

export default function Papers() {
  const [query, setQuery] = useState(''), [expanded, setExpanded] = useState<string[]>([]);
  const results = papers.filter((paper) => [paper.title, paper.authors, paper.category, paper.abstract, paper.readingGuide, ...paper.tags].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
  return <Screen><Heading kicker='RESEARCH READING' title='带着问题，读一篇论文。' subtitle='16 篇本地精选，不是实时最新列表；不转存论文全文。' /><View className='notice'><Text className='body'>本版尚未接入在线论文 API。可复制原文链接，在浏览器打开；预印本不等于已通过同行评审。</Text></View><Search value={query} onChange={setQuery} placeholder='搜索标题、作者、摘要或主题' /><Text className='result-count'>{results.length} 篇精选</Text>{results.map((paper) => <Card key={paper.id}><Text className='eyebrow'>{paper.category} · {paper.publishedAt}</Text><Text className='card-title'>{paper.title}</Text><Text className='muted small'>{paper.authors}</Text><Text className='body'>{paper.readingGuide}</Text><Text className='link' onClick={() => setExpanded((items) => items.includes(paper.id) ? items.filter((id) => id !== paper.id) : [...items, paper.id])}>{expanded.includes(paper.id) ? '收起摘要' : '阅读本地摘要'}</Text>{expanded.includes(paper.id) ? <Text className='body' selectable>{paper.abstract}</Text> : null}<View className='flow'>{paper.topicIds.map((id) => { const topic = topics.find((item) => item.id === id); return topic ? <Text className='chip link' key={id} onClick={() => openPage('topic', id)}>{topic.titleZh} ↗</Text> : null; })}</View><Text className='muted tiny'>来源：{paper.source}</Text><Text className='link' onClick={() => copyText(paper.url)}>复制原文链接 ↗</Text></Card>)}{!results.length ? <Empty text='没有匹配论文' onReset={() => setQuery('')} /> : null}</Screen>;
}
