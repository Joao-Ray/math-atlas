import { useEffect, useState } from 'react';
import { Text, Textarea, View } from '@tarojs/components';
import { useDidShow } from '@tarojs/taro';
import { emptyDailyLimitAttempt, getDailyLimitProblems, getDailyLimitSummary, getLocalDateKey } from '../../../data/dailyLimits';
import { Action, Card, Heading, Screen, Section } from '../components/UI';
import MathFormula from '../components/MathFormula';
import { act, studyStore, useStudy } from '../lib/study';
import { openPage } from '../lib/navigation';

export default function Daily() {
  const { state } = useStudy();
  const [today, setToday] = useState(getLocalDateKey), [hints, setHints] = useState<string[]>([]);
  useDidShow(() => setToday(getLocalDateKey()));
  useEffect(() => setHints([]), [today]);
  useEffect(() => { const timer = setInterval(() => setToday(getLocalDateKey()), 60000); return () => clearInterval(timer); }, []);
  const daily = getDailyLimitProblems(today), summary = getDailyLimitSummary(state.dailyLimitRecords, today);
  return <Screen><Heading kicker={today} title='每天三题，认真想一想。' subtitle='42 题按本地日期 14 天轮换；思路自动保存在当前微信小程序中。' /><View className='notice'><Text className='body'>今天已自评 {summary.assessed}/3 · 掌握 {summary.correct} · 待复习 {summary.review}</Text><Text className='muted small'>答案默认隐藏，不自动判分。写下思路后再对照解析与自评。</Text></View>
    {daily.map((problem, index) => {
      const attempt = state.dailyLimitRecords[today]?.[problem.id] ?? emptyDailyLimitAttempt;
      return <Section key={today + problem.id} title={'0' + (index + 1) + ' / ' + problem.level}><Card><Text className='card-title'>{problem.title}</Text><MathFormula latex={problem.expression} /><Text className='field-label'>我的解题思路</Text><Textarea className='draft' maxlength={1000} value={attempt.draft} placeholder='可以先写使用的方法、关键变形或你的答案…' onInput={(event) => act(() => studyStore.updateDaily(today, problem.id, { draft: event.detail.value }))} /><Text className='muted tiny'>{attempt.draft.length}/1000 · 本机保存</Text><Text className='link' onClick={() => setHints((items) => items.includes(problem.id) ? items.filter((id) => id !== problem.id) : [...items, problem.id])}>{hints.includes(problem.id) ? '收起提示' : '需要提示？'}</Text>{hints.includes(problem.id) ? <Text className='notice body'>{problem.hint}</Text> : null}
        {!attempt.revealed ? <Action onClick={() => act(() => studyStore.updateDaily(today, problem.id, { revealed: true }))}>查看解析与参考答案</Action> : <>
          {problem.steps.map((step, i) => <View className='solution-step' key={step.title}><Text className='step-title'>{i + 1}. {step.title}</Text><Text className='body'>{step.body}</Text>{step.latex ? <MathFormula latex={step.latex} /> : null}</View>)}<View className='answer'><Text className='eyebrow'>参考答案</Text><Text className='body'>{problem.answer}</Text></View><Text className='field-label'>由我自己判断掌握情况</Text><View className='button-row'><Action secondary={attempt.result !== 'correct'} onClick={() => act(() => studyStore.updateDaily(today, problem.id, { result: 'correct' }))}>已掌握</Action><Action secondary={attempt.result !== 'review'} onClick={() => act(() => studyStore.updateDaily(today, problem.id, { result: 'review' }))}>还需复习</Action></View>
        </>}
      </Card></Section>;
    })}
    <Action secondary onClick={() => openPage('review')}>回看标记为“还需复习”的题 →</Action>
  </Screen>;
}
