import { useState } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { Text, View } from '@tarojs/components';
import { getLimitReviewItems, getLocalDateKey } from '../../../data/dailyLimits';
import { Action, Card, Empty, Heading, Screen } from '../components/UI';
import MathFormula from '../components/MathFormula';
import { openPage } from '../lib/navigation';
import { act, studyStore, useStudy } from '../lib/study';

export default function Review() {
  const { state } = useStudy();
  const [today, setToday] = useState(getLocalDateKey), [visible, setVisible] = useState(10), [selected, setSelected] = useState(''), [revealed, setRevealed] = useState(false);
  useDidShow(() => setToday(getLocalDateKey()));
  const items = getLimitReviewItems(state.dailyLimitRecords, today).reverse();
  return <Screen><Heading kicker='SPACED REFLECTION' title='想通一次，再想通一次。' subtitle='每日极限中标记为“还需复习”的题，按最近记录优先。不同日期的同题分别保留，不会擅自删除旧记录。' /><Text className='result-count'>{items.length} 条待复习记录</Text>
    {!items.length ? <Empty text='暂无待复习记录。在每日练习查看解析并自评“还需复习”后，题目会来到这里。' /> : null}
    {items.slice(0, visible).map(({ date, problem }) => { const key = date + ':' + problem.id, active = selected === key;
      return <Card key={key}><Text className='eyebrow'>{date} · {problem.level}</Text><Text className='card-title'>{problem.title}</Text><Action secondary onClick={() => { setSelected(active ? '' : key); setRevealed(false); }}>{active ? '收起这道题' : '重新思考这道题'}</Action>{active ? <><MathFormula latex={problem.expression} /><Text className='body'>请先在纸上重新推导，再对照解析。</Text>{state.dailyLimitRecords[date]?.[problem.id]?.draft ? <View className='notice'><Text className='field-label'>当时的思路（只读）</Text><Text className='body' selectable>{state.dailyLimitRecords[date][problem.id].draft}</Text></View> : null}
        {!revealed ? <Action onClick={() => setRevealed(true)}>已重新思考 · 对照解析</Action> : <><Text className='condition'>提示：{problem.hint}</Text>{problem.steps.map((step, i) => <View className='solution-step' key={step.title}><Text className='step-title'>{i + 1}. {step.title}</Text><Text className='body'>{step.body}</Text>{step.latex ? <MathFormula latex={step.latex} /> : null}</View>)}<View className='answer'><Text className='eyebrow'>参考答案</Text><Text className='body'>{problem.answer}</Text></View><Action onClick={() => { void Taro.showModal({ title: '确认这次已掌握？', content: `将 ${date} 此题的自评改为已掌握，原草稿保留，并移出待复习；不会新增今天的练习次数。`, confirmText: '确认掌握' }).then((result) => { if (result.confirm) act(() => { studyStore.updateDaily(date, problem.id, { revealed: true, result: 'correct' }); setSelected(''); setRevealed(false); }); }); }}>这次已掌握 · 移出待复习</Action><Text className='muted small'>仍不熟悉可直接返回，继续保留在队列中。</Text></>}
      </> : null}</Card>;
    })}
    {items.length > visible ? <Text className='load-more' onClick={() => setVisible((count) => count + 10)}>再看 10 条复习记录</Text> : null}<Action secondary onClick={() => openPage('daily')}>去做今天的三道题</Action>
  </Screen>;
}
