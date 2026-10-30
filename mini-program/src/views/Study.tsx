import { useState } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { Text, View } from '@tarojs/components';
import { formulas, topics } from '../../../data/mockData';
import { getLimitReviewItems, getLocalDateKey } from '../../../data/dailyLimits';
import { getPracticeStats } from '../../../data/studyState';
import { Action, Card, Empty, Heading, Screen, Section, TopicCard } from '../components/UI';
import { openPage, openTab } from '../lib/navigation';
import { act, studyStore, useStudy } from '../lib/study';
import { CLIENT_VERSION } from '../lib/release';

export default function Study() {
  const { state } = useStudy();
  const [today, setToday] = useState(getLocalDateKey), [visible, setVisible] = useState(12);
  useDidShow(() => setToday(getLocalDateKey()));
  const stats = getPracticeStats(state.dailyLimitRecords, today);
  const favorites = topics.filter((topic) => state.favoriteTopics.includes(topic.id));
  return <Screen><Heading kicker='YOUR OWN PACE' title='把进步，留在这里。' subtitle='不要求登录；微信小程序与原 App 各自保存，可用备份手动迁移。' /><View className='stat-grid'><View><Text className='stat-value'>{state.completedProblems.length}</Text><Text className='muted small'>已完成例题</Text></View><View><Text className='stat-value'>{stats.currentStreak}</Text><Text className='muted small'>当前连续</Text></View><View><Text className='stat-value'>{stats.longestStreak}</Text><Text className='muted small'>最长连续</Text></View></View>
    <Section title='最近 28 天'><Card><View className='calendar'>{stats.calendar.map((day) => <View key={day.date} className={'calendar-day ' + (day.assessed ? 'active-day' : '')}><Text className='tiny'>{day.date.slice(5)}</Text><Text className='small'>{day.assessed ? day.assessed + '/3' : '·'}</Text></View>)}</View><Text className='muted small'>累计练习 {stats.activeDays} 天；完成任一题自评才计入练习日。</Text></Card></Section>
    <Card onClick={() => openTab('formulas', { saved: 'yes' })}><View className='between'><Text className='card-title'>收藏的公式</Text><Text className='link'>{formulas.filter((formula) => state.favoriteFormulas.includes(formula.id)).length} 条 →</Text></View></Card>
    <Card onClick={() => openPage('review')}><View className='between'><Text className='card-title'>每日极限 · 待复习</Text><Text className='link'>{getLimitReviewItems(state.dailyLimitRecords, today).length} 条 →</Text></View></Card>
    <Section title={'收藏的知识点 · ' + favorites.length}>{favorites.length ? favorites.slice(0, visible).map((topic) => <TopicCard key={topic.id} topic={topic} />) : <Empty text='读到想复习的知识点时，点击收藏。' />}{favorites.length > visible ? <Text className='load-more' onClick={() => setVisible((value) => value + 12)}>继续查看收藏</Text> : null}</Section>
    <Section title='数据与关于'><Card onClick={() => openPage('backup')}><Text className='card-title'>学习记录备份与恢复 →</Text><Text className='body'>与原 App 的备份格式兼容；恢复时合并收藏，冲突保留本机记录。</Text></Card><Card onClick={() => openPage('acceptance')}><Text className='card-title'>手机验收与问题反馈 →</Text><Text className='body'>逐项检查手机体验，复制反馈；不自动上传学习记录。</Text></Card><Card onClick={() => openPage('privacy')}><Text className='card-title'>隐私与题源说明 →</Text><Text className='muted small'>Lemivanta 微信版 {CLIENT_VERSION} · 本地预览版</Text></Card></Section>
    <Action secondary onClick={() => { void Taro.showModal({ title: '清除微信版学习记录？', content: '将清除本小程序的收藏、完成状态、每日草稿和自评。不能撤销，建议先导出备份；不会清除原 App 或其他小程序的数据。', confirmText: '确认清除', confirmColor: '#B5523B' }).then((result) => { if (result.confirm) act(() => studyStore.reset()); }); }}>清除本小程序的学习记录</Action>
  </Screen>;
}
