import { Text, View } from '@tarojs/components';
import { topics } from '../../../data/mockData';
import { textbookGuides, textbookNotice } from '../../../data/textbookStudy';
import { textbookTopics } from '../../../data/textbookExpansionV17';
import { Card, Heading, Screen, Section } from '../components/UI';
import { openPage } from '../lib/navigation';
import { useStudy } from '../lib/study';

export default function Textbooks() {
  const { state } = useStudy();
  return <Screen><Heading kicker='READ · CONNECT · PRACTISE' title='沿着教材，走出自己的路线。' subtitle='4 条资料导学路线 · 12 个新专题 · 24 道自编配套题' /><Text className='notice body'>{textbookNotice} 路线为本 App 的学习建议，不等于教材原目录；无需打开整本书即可学习。</Text>
    {textbookGuides.map((guide) => <Section key={guide.id} title={guide.title}><Card><Text className='muted small'>{guide.authors}</Text><Text className='body'>{guide.focus}</Text><Text className='condition'>{guide.chapters.join(' · ')}</Text><Text className='body'>{guide.advice}</Text>{guide.topicIds.map((id, index) => { const topic = topics.find((item) => item.id === id); if (!topic) return null; return <View key={id} className='solution-step' onClick={() => openPage('topic', id)}><Text className='link'>{index + 1}. {topic.titleZh} →</Text><Text className='muted small'>{textbookTopics.some((item) => item.id === id) ? '本轮新增 · ' : ''}例题完成 {topic.problemIds.filter((problem) => state.completedProblems.includes(problem)).length}/{topic.problemIds.length}</Text></View>; })}<Text className='condition'>{guide.verification}</Text></Card></Section>)}
    <Section title='本轮新增的 12 个专题'>{textbookTopics.map((topic) => <Card key={topic.id} onClick={() => openPage('topic', topic.id)}><Text className='card-title'>{topic.titleZh} →</Text><Text className='body'>{topic.summary}</Text></Card>)}</Section>
  </Screen>;
}
