import { useState } from 'react';
import { Text, View } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';
import { courses, formulas, papers, problems, topics } from '../../../data/mockData';
import MathFormula from '../components/MathFormula';
import { Action, Card, Empty, Heading, ProblemCard, Screen, Section } from '../components/UI';
import { openPage, openTab } from '../lib/navigation';
import { act, studyStore, useStudy } from '../lib/study';

export function TopicDetail() {
  const { id } = useRouter().params;
  const { state } = useStudy();
  const [expanded, setExpanded] = useState<string[]>([]);
  const topic = topics.find((item) => item.id === id);
  if (!topic) return <Screen><Heading title='没有找到这个知识点' /><Empty text='可能是旧链接或输入有误。' /><Action onClick={() => openTab('topics')}>返回知识地图</Action></Screen>;
  const course = courses.find((item) => item.id === topic.courseId);
  return <Screen><Heading kicker={course?.titleZh} title={topic.titleZh} subtitle={topic.title} /><Action secondary onClick={() => act(() => studyStore.toggleTopic(topic.id))}>{state.favoriteTopics.includes(topic.id) ? '已收藏 · 点击取消' : '收藏这个知识点'}</Action>
    <Text className='link' onClick={() => openPage('roadmap', topic.courseId)}>查看本课程路线 →</Text>
    <Section title='先建立直觉'><Card><Text className='body'>{topic.intuition}</Text></Card></Section><Section title='定义'><Card><Text className='body' selectable>{topic.definition}</Text></Card></Section>
    {topic.prerequisites.length ? <Section title='先修知识'><View className='flow'>{topic.prerequisites.map((idOrLabel) => {
      const prerequisite = topics.find((item) => item.id === idOrLabel);
      return <Text key={idOrLabel} className={prerequisite ? 'chip link' : 'chip'} onClick={() => { if (prerequisite) openPage('topic', prerequisite.id); }}>{prerequisite?.titleZh ?? idOrLabel}{prerequisite ? ' ↗' : ''}</Text>;
    })}</View></Section> : null}
    {topic.learningNotes?.length ? <Section title='学习方法与易错点'><Card>{topic.learningNotes.map((note, i) => <Text className='body list-item' key={note}>{i + 1}. {note}</Text>)}</Card></Section> : null}
    <Section title='核心公式'>{formulas.filter((formula) => formula.topicId === topic.id).map((formula) => <Card key={formula.id}><View className='between'><Text className='card-title'>{formula.titleZh}</Text><Text className='link small' onClick={() => act(() => studyStore.toggleFormula(formula.id))}>{state.favoriteFormulas.includes(formula.id) ? '已收藏' : '收藏'}</Text></View><MathFormula latex={formula.latex} /><Text className='body'>{formula.explanation}</Text><Text className='condition'>适用条件：{formula.conditions ?? '结合定义与题目条件使用。'}</Text>{formula.derivation?.length ? <><Text className='link' onClick={() => setExpanded((items) => items.includes(formula.id) ? items.filter((item) => item !== formula.id) : [...items, formula.id])}>{expanded.includes(formula.id) ? '收起推导 ↑' : '展开推导 ↓'}</Text>{expanded.includes(formula.id) ? formula.derivation.map((step, i) => <View className='solution-step' key={step.title}><Text className='step-title'>{i + 1}. {step.title}</Text><Text className='body'>{step.body}</Text>{step.latex ? <MathFormula latex={step.latex} /> : null}</View>) : null}</> : null}</Card>)}</Section>
    <Section title='配套例题'>{problems.filter((problem) => problem.topicId === topic.id).map((problem) => <ProblemCard key={problem.id} problem={problem} completed={state.completedProblems.includes(problem.id)} />)}</Section>
    {papers.some((paper) => paper.topicIds.includes(topic.id)) ? <Card onClick={() => openPage('papers')}><Text className='link'>继续探索：本地精选论文 →</Text></Card> : null}
    {topic.sourceNote ? <Text className='muted small'>{topic.sourceNote}</Text> : null}
  </Screen>;
}
export function ProblemDetail() {
  const { id } = useRouter().params;
  const { state } = useStudy();
  const [hints, setHints] = useState(false), [revealed, setRevealed] = useState(false);
  const problem = problems.find((item) => item.id === id);
  if (!problem) return <Screen><Heading title='没有找到这道题' /><Empty text='请回到题库重新选择。' /><Action onClick={() => openTab('problems')}>返回题库</Action></Screen>;
  const topic = topics.find((item) => item.id === problem.topicId), source = problem.source;
  return <Screen><Heading kicker={courses.find((course) => course.id === problem.courseId)?.titleZh} title={problem.title} subtitle={'★'.repeat(problem.difficulty) + '☆'.repeat(5 - problem.difficulty) + ' · 应用内难度分级'} />
    <Text className='link small' onClick={() => openPage('topic', problem.topicId)}>{topic?.titleZh} · 复习相关知识 →</Text>
    {source ? <View className='provenance'><Text className='small'>{source.label}</Text>{source.kind === 'past-paper' ? <><Text className='muted small'>{source.documentTitle} · {source.exam} · {source.paper} · {source.question}</Text><Text className='muted small'>{source.verificationNote}</Text></> : null}</View> : null}
    <Section title='题目'><Card><Text className='body' selectable>{problem.prompt}</Text>{problem.formulas.map((latex, i) => <MathFormula key={i} latex={latex} />)}</Card></Section>
    <Action id='problem-hints' secondary onClick={() => setHints((value) => !value)}>{hints ? '收起提示 ↑' : '需要一点提示？ ↓'}</Action>{hints ? <Card>{problem.hints.map((hint, i) => <Text className='body list-item' key={hint}>{i + 1}. {hint}</Text>)}</Card> : null}
    {!revealed ? <Action id='problem-reveal' onClick={() => setRevealed(true)}>我已思考 · 查看详细解析</Action> : <Section title='详细解析'>
      {source?.kind === 'past-paper' && source.editorialNote ? <View className='notice'><Text className='step-title'>解析勘误与补充</Text><Text className='body'>{source.editorialNote}</Text></View> : null}
      {problem.steps.map((step, i) => <Card key={step.title}><Text className='step-index'>STEP {String(i + 1).padStart(2, '0')}</Text><Text className='card-title'>{step.title}</Text><Text className='body'>{step.body}</Text>{step.latex ? <MathFormula latex={step.latex} /> : null}</Card>)}
      <View className='answer'><Text className='eyebrow'>参考答案</Text><Text className='body' selectable>{problem.answer}</Text></View>
      <Action onClick={() => act(() => studyStore.toggleProblem(problem.id))}>{state.completedProblems.includes(problem.id) ? '已完成 · 点击取消标记' : '标记为已完成'}</Action><Text className='muted small'>完成状态由你自行标记，不是自动判分。</Text>
    </Section>}
  </Screen>;
}
