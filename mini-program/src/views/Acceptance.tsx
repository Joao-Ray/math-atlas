import { useState } from 'react';
import Taro from '@tarojs/taro';
import { Text, Textarea, View } from '@tarojs/components';
import { formulas, problems } from '../../../data/mockData';
import { Action, Card, Chips, Heading, Screen, Section } from '../components/UI';
import MathFormula from '../components/MathFormula';
import { acceptanceCases, acceptanceReport, summarizeAcceptance, type DeviceSummary, type Verdict, type Verdicts } from '../lib/acceptance';
import { CLIENT_BUILD, CLIENT_VERSION } from '../lib/release';
import { copyText, openPage, openTab } from '../lib/navigation';

const unknownDevice: DeviceSummary = { platform: 'unknown', model: '未读取', system: '未读取', wechat: '未读取', sdk: '未读取', viewport: '未读取' };
export default function Acceptance() {
  const [device, setDevice] = useState(unknownDevice), [verdicts, setVerdicts] = useState<Verdicts>({}), [notes, setNotes] = useState('');
  const summary = summarizeAcceptance(verdicts, device.platform);
  const matrix = problems.flatMap((problem) => problem.formulas).find((latex) => latex.includes('\\begin{pmatrix}'));
  function readDevice() {
    try {
      const info = Taro.getDeviceInfo(), app = Taro.getAppBaseInfo(), window = Taro.getWindowInfo();
      setDevice({ platform: info.platform ?? 'unknown', model: info.model ?? '未知机型', system: info.system ?? '未知系统', wechat: app.version ?? '未提供', sdk: app.SDKVersion ?? '未提供', viewport: `${window.windowWidth} × ${window.windowHeight}` });
    } catch { void Taro.showToast({ title: '设备信息暂不可用，请确认微信版本', icon: 'none' }); }
  }
  return <Screen><Heading kicker={`DEVICE CHECK · ${CLIENT_VERSION} / ${CLIENT_BUILD}`} title='在你的手机上，认真试一遍。' subtitle='只有实际在手机操作后才能确认。构建通过、模拟器正常和展示二维码都不等于真机验收通过。' />
    <Card><Text className='card-title'>本次验收：{summary.passed}/8 项确认通过</Text><Text className='body'>待测 {summary.pending} · 发现问题 {summary.failed}</Text><Text className='muted small'>本页勾选仅当前页面有效。离开前复制反馈；不会改动学习记录，不自动上传结果。</Text><Action secondary onClick={readDevice}>读取本次验收的设备信息</Action><Text className='muted small'>{device.model} · {device.system} · 微信 {device.wechat}</Text><Text className='muted small'>{summary.phone ? '已识别手机环境，仍需本人逐项操作确认。' : '未确认手机环境，不能判为真机通过。'}</Text></Card>
    <Section title='先看公式样本'><Card>{['chain-rule', 'taylor-expansion'].map((id) => { const formula = formulas.find((item) => item.id === id)!; return <View key={id}><Text className='field-label'>{formula.titleZh}</Text><MathFormula latex={formula.latex} /></View>; })}{matrix ? <><Text className='field-label'>矩阵</Text><MathFormula latex={matrix} /></> : null}<Text className='muted small'>长公式请左右滑动，不应该出现“图片加载失败”。</Text></Card></Section>
    <Section title='逐项手动验收'>{acceptanceCases.map((item, index) => <Card key={item.id}><Text className='card-title'>{index + 1}. {item.title}</Text><Text className='body'>{item.steps}</Text><Chips id={'check-' + item.id} value={verdicts[item.id] ?? 'pending'} options={[{ id: 'pending', label: '待测' }, { id: 'pass', label: '本人确认通过' }, { id: 'fail', label: '发现问题' }]} onChange={(value) => setVerdicts((current) => ({ ...current, [item.id]: value as Verdict }))} /></Card>)}</Section>
    <Section title='反馈给开发者'><Card><Text className='body'>请写：在哪个页面 → 点了什么 → 实际出现什么 → 原本期望什么。截图前遮挡备份、邮箱等个人信息。</Text><Textarea className='draft' maxlength={1200} value={notes} placeholder='例如：iPhone 上，公式页向右滑动后仍看不到末尾…' onInput={(event) => setNotes(event.detail.value)} /><Action onClick={() => copyText(acceptanceReport(verdicts, device, notes, new Date().toISOString()))}>复制本次验收反馈</Action><Text className='muted small'>仅复制基本机型、系统/微信版本和你的勾选与说明，不含学习记录或设备唯一标识。</Text></Card></Section>
    <Text className='link' onClick={() => openPage('daily')}>去验收每日练习 →</Text><Text className='link' onClick={() => openPage('review')}>去查看待复习 →</Text><Text className='link' onClick={() => openTab('problems')}>离开此页，去检查题库 →</Text>
  </Screen>;
}
