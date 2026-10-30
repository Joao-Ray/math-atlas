import { Image, Text, View } from '@tarojs/components';
import { useDidShow } from '@tarojs/taro';
import { useState } from 'react';
import { courses, formulas, topics, problems } from '../../../data/mockData';
import { getDailyLimitProblems, getDailyLimitSummary, getLocalDateKey } from '../../../data/dailyLimits';
import { getPracticeStats } from '../../../data/studyState';
import MathFormula from '../components/MathFormula';
import { Card, Heading, Screen, Section } from '../components/UI';
import { openPage, openTab } from '../lib/navigation';
import { useStudy } from '../lib/study';

export default function Home() {
  const { state } = useStudy();
  const [today, setToday] = useState(getLocalDateKey);
  useDidShow(() => setToday(getLocalDateKey()));
  const daily = getDailyLimitProblems(today), summary = getDailyLimitSummary(state.dailyLimitRecords, today);
  const stats = getPracticeStats(state.dailyLimitRecords, today);
  const formula = formulas[(Number(today.slice(-2)) - 1) % formulas.length];
  return <Screen>
    <View className='brand-row'><Image src='/assets/brand.png' className='brand-logo' /><View><Text className='brand-name'>Lemivanta</Text><Text className='eyebrow'>YOUR DAILY MATHEMATICAL COMPANION</Text></View></View>
    <Heading kicker={today.replace(/-/g, ' / ')} title='让数学，逐渐清晰。' subtitle='从一个知识点出发，让定义、公式和解题思路连起来。' />
    <Card onClick={() => openPage('roadmap')}><Text className='eyebrow'>COURSE ROADMAP</Text><Text className='card-title'>每门 70 点 · 课程拓展路线 →</Text><Text className='body'>已完善 {topics.length}/700 点。按章查看内容，待补目录不计入知识库。</Text></Card>
    <Card onClick={() => openPage('textbooks')}><Text className='eyebrow'>TEXTBOOK STUDY PATHS</Text><Text className='card-title'>教材导学 · 4 条路线 →</Text><Text className='body'>高数、概率与随机过程：12 个新专题、24 道自编配套题。按核对过的章节逐步学习。</Text></Card>
    <View className='hero'><Text className='eyebrow light'>每天进步一点</Text><Text className='hero-title'>今天的三道极限</Text><Text className='hero-description'>基础 · 方法 · 挑战，每一题都先留给你思考。</Text><View className='between'><Text className='hero-progress'>已自评 {summary.assessed} / 3</Text><Text className='hero-link' onClick={() => openPage('daily')}>开始练习 →</Text></View><View className='progress'><View className='progress-fill' style={{ width: summary.assessed / 3 * 100 + '%' }} /></View></View>
    <View className='stat-grid'><View><Text className='stat-value'>{state.completedProblems.length}</Text><Text className='muted small'>例题完成 / {problems.length}</Text></View><View><Text className='stat-value'>{stats.currentStreak}</Text><Text className='muted small'>连续练习天数</Text></View><View><Text className='stat-value'>{state.favoriteTopics.length + state.favoriteFormulas.length}</Text><Text className='muted small'>我的收藏</Text></View></View>
    <Section title='今日公式' action={<Text className='link small' onClick={() => openTab('formulas')}>全部公式 →</Text>}><Card onClick={() => openPage('topic', formula.topicId)}><Text className='card-title'>{formula.titleZh}</Text><MathFormula latex={formula.latex} /><Text className='body'>{formula.explanation}</Text><Text className='muted small'>适用条件：{formula.conditions ?? '请结合知识点定义与题目条件使用。'}</Text></Card></Section>
    <Section title='探索数学版图' action={<Text className='muted small'>{topics.length} 个知识点</Text>}><View className='course-grid'>{courses.map((course) => <View className='course-tile' key={course.id} onClick={() => openTab('topics', { course: course.id })}><Text className='course-symbol' style={{ color: course.accent }}>{course.icon}</Text><Text className='tile-title'>{course.titleZh}</Text><Text className='muted tiny'>{topics.filter((topic) => topic.courseId === course.id).length} 个专题</Text></View>)}</View></Section>
    <Section title='按你的节奏学习'><Card onClick={() => openTab('problems', { track: 'competition' })}><Text className='eyebrow'>CHALLENGE YOUR THINKING</Text><Text className='card-title'>竞赛题库 · 20 道题 →</Text><Text className='body'>资料真题与自编训练统一练习，题源在详情中区分。</Text></Card><Card onClick={() => openPage('papers')}><Text className='eyebrow'>RESEARCH READING</Text><Text className='card-title'>从课堂走向论文 →</Text><Text className='body'>16 篇本地精选与阅读建议。微信版暂不接入在线更新。</Text></Card></Section>
    <Text className='muted small'>今日练习：{daily.map((item) => item.title).join(' / ')}</Text>
  </Screen>;
}
