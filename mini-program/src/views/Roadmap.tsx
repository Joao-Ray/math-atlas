import { useState } from 'react';
import { Text, View } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';
import { courses, topics } from '../../../data/mockData';
import { COURSE_TOPIC_TARGET, getVisibleRoadmap, getRoadmapSummary } from '../../../data/curriculumRoadmap';
import { normalizeCourseSelection } from '../../../data/problemFilters';
import { Card, Chips, Heading, Screen } from '../components/UI';
import { openPage } from '../lib/navigation';
import type { CourseId } from '../../../types';

export default function Roadmap() {
  const selected = normalizeCourseSelection(useRouter().params.id, courses);
  const [course, setCourse] = useState<CourseId>(selected === 'all' ? 'calculus' : selected);
  const [open, setOpen] = useState<string | null>(null);
  const [publishedOnly, setPublishedOnly] = useState(false);
  const summary = getRoadmapSummary(course, topics);
  const chapters = getVisibleRoadmap(course, topics, publishedOnly);
  return <Screen><Heading kicker='70 POINTS · ONE STEP AT A TIME' title='课程拓展路线' subtitle={'每门目标 70 点 · 已完善 ' + topics.length + '/' + courses.length * COURSE_TOPIC_TARGET + ' 点'} />
    <Text className='notice body'>每门按 7 章、每章 10 点规划。“已完善”有定义、公式与解析题；“待补充”只是目录，不计入知识库，不能打开或收藏。</Text>
    <Chips id='roadmap-courses' value={course} options={courses.map((item) => ({ id: item.id, label: item.titleZh }))} onChange={(value) => { if (courses.some((item) => item.id === value)) { setCourse(value as CourseId); setOpen(null); } }} />
    <Text className='section-title'>{courses.find((item) => item.id === course)?.titleZh}</Text><Text className='body'>已完善 {summary.published}/{summary.target} · 待补充 {summary.planned}</Text>
    <View className='roadmap-track'><View className='roadmap-progress' style={{ width: `${summary.published / summary.target * 100}%` }} /></View>
    <Chips id='roadmap-visibility' value={publishedOnly ? 'published' : 'all'} options={[{ id: 'all', label: '完整课程目录' }, { id: 'published', label: '只看已完善' }]} onChange={(value) => setPublishedOnly(value === 'published')} />
    {publishedOnly ? <Text className='muted small'>仅显示可学习内容，保留原章节与知识点编号；目标和进度不变。</Text> : null}
    {!chapters.length ? <Text className='muted'>该课程暂时没有已完善的内容，可切换完整课程目录。</Text> : null}
    {chapters.map((chapter) => <Card key={chapter.id}><View id={'roadmap-chapter-' + (chapter.position - 1)} onClick={() => setOpen(open === chapter.id ? null : chapter.id)}><Text className='card-title'>{chapter.position}. {chapter.title} {open === chapter.id ? '−' : '+'}</Text><Text className='muted small'>已完善 {chapter.publishedCount}/{chapter.total} · 点击展开</Text></View>
      {open === chapter.id ? chapter.entries.map((entry) => entry.published ? <View key={entry.id} className='solution-step' onClick={() => openPage('topic', entry.id)}><Text className='link'>{entry.position}. {entry.title} →</Text><Text className='muted small'>已完善 · 定义 / 公式 / 练习</Text></View> : <View key={entry.id} className='solution-step'><Text className='muted'>{entry.position}. {entry.title}</Text><Text className='muted small'>待补充 · 仅课程规划</Text></View>) : null}
    </Card>)}
  </Screen>;
}
