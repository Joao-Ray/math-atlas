import { useMemo, useState } from 'react';
import { Text, View } from '@tarojs/components';
import { useDidShow } from '@tarojs/taro';
import { courses, formulas, problems, topics } from '../../../data/mockData';
import { filterStudyProblems, normalizeProblemTrack } from '../../../data/problemFilters';
import type { CourseId, Problem } from '../../../types';
import { practiceSets } from '../../../data/practiceExpansion';
import { Card, Chips, CourseChips, Empty, Heading, ProblemCard, Screen, Search, TopicCard } from '../components/UI';
import MathFormula from '../components/MathFormula';
import { openPage, takeIntent } from '../lib/navigation';
import { act, studyStore, useStudy } from '../lib/study';

const STEP = 12;
function More({ shown, total, onMore }: { shown: number; total: number; onMore: () => void }) {
  return shown < total ? <Text className='load-more' onClick={onMore}>再看 {Math.min(STEP, total - shown)} 项 · 剩余 {total - shown} 项</Text> : null;
}
const courseOK = (value?: string) => courses.some((course) => course.id === value) ? value! : 'all';
export function Topics() {
  const [query, setQuery] = useState(''), [course, setCourse] = useState('all'), [visible, setVisible] = useState(STEP);
  useDidShow(() => { const intent = takeIntent('topics'); if (intent) { setCourse(courseOK(intent.course)); setQuery(''); setVisible(STEP); } });
  const results = useMemo(() => topics.filter((topic) => (course === 'all' || topic.courseId === course)
    && [topic.titleZh, topic.title, topic.summary, courses.find((item) => item.id === topic.courseId)?.titleZh].join(' ').toLowerCase().includes(query.trim().toLowerCase())), [query, course]);
  return <Screen><Heading kicker='KNOWLEDGE MAP' title='知识，连成一张图。' subtitle={courses.length + ' 门课程 · 定义、直觉、适用条件和易错点。'} />
    <Card onClick={() => openPage('roadmap', course)}><Text className='card-title'>每门 70 点 · 课程拓展路线 →</Text><Text className='body'>已完善 {topics.length}/700 点。按章查看，待补目录不计入知识库。</Text></Card>
    <Card onClick={() => openPage('textbooks')}><Text className='card-title'>教材导学 · 4 条路线 →</Text><Text className='body'>12 个新专题、24 道自编题，串起高数、概率与随机过程。</Text></Card>
    <Search value={query} onChange={(value) => { setQuery(value); setVisible(STEP); }} placeholder='搜索知识点、课程或英文名称' /><CourseChips value={course} onChange={(value) => { setCourse(value); setVisible(STEP); }} /><Text className='result-count'>{results.length} 个知识点</Text>{results.slice(0, visible).map((topic) => <TopicCard key={topic.id} topic={topic} />)}{!results.length ? <Empty text='没有找到匹配知识点' onReset={() => { setQuery(''); setCourse('all'); }} /> : null}<More shown={visible} total={results.length} onMore={() => setVisible((value) => value + STEP)} /></Screen>;
}
export function Formulas() {
  const { state } = useStudy();
  const [query, setQuery] = useState(''), [course, setCourse] = useState('all'), [saved, setSaved] = useState(false), [visible, setVisible] = useState(STEP);
  useDidShow(() => { const intent = takeIntent('formulas'); if (intent) { setSaved(intent.saved === 'yes'); setCourse(courseOK(intent.course)); setQuery(''); setVisible(STEP); } });
  const results = formulas.filter((formula) => (course === 'all' || formula.courseId === course)
    && (!saved || state.favoriteFormulas.includes(formula.id))
    && [formula.title, formula.titleZh, formula.explanation].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
  return <Screen><Heading kicker='FORMULA NOTEBOOK' title='记住公式，也理解边界。' subtitle={formulas.length + ' 条公式，附适用条件与关联知识点。'} /><Search value={query} onChange={(value) => { setQuery(value); setVisible(STEP); }} placeholder='搜索公式名称或含义' /><CourseChips value={course} onChange={(value) => { setCourse(value); setVisible(STEP); }} /><Chips options={[{ id: 'all', label: '全部公式' }, { id: 'saved', label: '我的收藏' }]} value={saved ? 'saved' : 'all'} onChange={(value) => { setSaved(value === 'saved'); setVisible(STEP); }} /><Text className='result-count'>{results.length} 条公式</Text>{results.slice(0, visible).map((formula) => <Card key={formula.id}><View className='between'><Text className='card-title'>{formula.titleZh}</Text><Text className='link small' onClick={() => act(() => studyStore.toggleFormula(formula.id))}>{state.favoriteFormulas.includes(formula.id) ? '已收藏' : '收藏'}</Text></View><MathFormula latex={formula.latex} /><Text className='body'>{formula.explanation}</Text><Text className='condition'>适用条件：{formula.conditions ?? '结合定义与题目条件使用。'}</Text><Text className='link small' onClick={() => openPage('topic', formula.topicId)}>查看知识点与推导 →</Text></Card>)}{!results.length ? <Empty text='没有匹配公式' onReset={() => { setQuery(''); setCourse('all'); setSaved(false); }} /> : null}<More shown={visible} total={results.length} onMore={() => setVisible((value) => value + STEP)} /></Screen>;
}
export function Problems() {
  const { state } = useStudy();
  const [query, setQuery] = useState(''), [course, setCourse] = useState('all'), [track, setTrack] = useState<'all' | 'core' | 'competition' | 'practice'>('all');
  const [source, setSource] = useState<'all' | 'past-paper' | 'competition-style'>('all'), [paper, setPaper] = useState<'all' | '非数学 A 类' | '非数学 B 类'>('all');
  const [practiceSet, setPracticeSet] = useState<'all' | NonNullable<Problem['practiceSet']>>('all');
  const [level, setLevel] = useState('all'), [completion, setCompletion] = useState<'all' | 'completed' | 'uncompleted'>('all'), [visible, setVisible] = useState(STEP);
  function resetFilters() { setQuery(''); setCourse('all'); setSource('all'); setPaper('all'); setPracticeSet('all'); setLevel('all'); setCompletion('all'); setVisible(STEP); }
  useDidShow(() => { const intent = takeIntent('problems'); if (intent) { resetFilters(); setTrack(normalizeProblemTrack(intent.track)); } });
  const results = filterStudyProblems(problems, { query, track, courseId: course === 'all' ? null : course as CourseId,
    level: level === 'all' ? null : Number(level), completion, completedIds: state.completedProblems, competitionSource: source, paper, practiceSet }, courses, topics);
  return <Screen><Heading kicker='THINK BEFORE YOU REVEAL' title='把思路，留给自己。' subtitle='提示和解析默认收起，完成后再记录学习进度。' /><Chips id='tracks' options={[{ id: 'all', label: '全部例题' }, { id: 'core', label: '课程练习' }, { id: 'practice', label: '专题练习' }, { id: 'competition', label: '竞赛题库' }]} value={track} onChange={(value) => { setTrack(normalizeProblemTrack(value)); resetFilters(); }} />
    {track === 'competition' ? <><View className='notice'><Text className='card-title'>大学生数学竞赛 · 统一题库</Text><Text className='body'>12 道资料真题与 8 道自编训练。详情区分来源，不显示 PDF 页码；资料真题尚未与官方原卷二次核验。</Text></View><Chips id='sources' options={[{ id: 'all', label: '全部竞赛' }, { id: 'past-paper', label: '真题' }, { id: 'competition-style', label: '训练题' }]} value={source} onChange={(value) => { setSource(value as typeof source); setPaper('all'); setVisible(STEP); }} />{source === 'past-paper' ? <Chips id='paper-categories' options={[{ id: 'all', label: '全部类别' }, { id: '非数学 A 类', label: 'A 类（含共用）' }, { id: '非数学 B 类', label: 'B 类（含共用）' }]} value={paper} onChange={(value) => { setPaper(value as typeof paper); setVisible(STEP); }} /> : null}</> : null}
    {track === 'practice' ? <><Text className='notice body'>18 道自编专题练习，非吉米多维奇原书或教材原题。</Text><Chips options={[{ id: 'all', label: '全部专题' }, ...practiceSets.map((item) => ({ id: item.id, label: item.title }))]} value={practiceSet} onChange={(value) => { setPracticeSet(value as typeof practiceSet); setVisible(STEP); }} /></> : null}
    <Search value={query} onChange={(value) => { setQuery(value); setVisible(STEP); }} placeholder='搜索题目、课程或知识点，不检索答案' /><CourseChips value={course} onChange={(value) => { setCourse(value); setVisible(STEP); }} /><Chips options={[{ id: 'all', label: '全部难度' }, ...[1, 2, 3, 4, 5].map((n) => ({ id: String(n), label: n + ' ★' }))]} value={level} onChange={(value) => { setLevel(value); setVisible(STEP); }} /><Chips options={[{ id: 'all', label: '全部状态' }, { id: 'uncompleted', label: '未完成' }, { id: 'completed', label: '已完成' }]} value={completion} onChange={(value) => { setCompletion(value as typeof completion); setVisible(STEP); }} /><Text className='result-count'>{results.length} 道题</Text>{results.slice(0, visible).map((problem) => <ProblemCard key={problem.id} problem={problem} completed={state.completedProblems.includes(problem.id)} />)}{!results.length ? <Empty text='没有符合筛选条件的题目' onReset={resetFilters} /> : null}<More shown={visible} total={results.length} onMore={() => setVisible((value) => value + STEP)} /></Screen>;
}
