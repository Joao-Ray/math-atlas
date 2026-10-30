import { useState } from 'react';
import Taro from '@tarojs/taro';
import { Text, Textarea, View } from '@tarojs/components';
import { summarizeStudyState } from '../../../data/studyState';
import { Action, Card, Heading, Screen, Section } from '../components/UI';
import { copyText } from '../lib/navigation';
import { act, studyStore } from '../lib/study';

type Preview = { text: string; exportedAt: string; summary: ReturnType<typeof summarizeStudyState> };
export default function Backup() {
  const [output, setOutput] = useState(''), [input, setInput] = useState(''), [preview, setPreview] = useState<Preview | null>(null);
  return <Screen><Heading kicker='LOCAL FIRST' title='让学习记录，有个备份。' subtitle='备份是明文 JSON，只包含收藏、完成记录、每日草稿、自评与旧版练习草稿。请自行妥善保管。' />
    <Section title='导出本机备份'><Action onClick={() => act(() => setOutput(studyStore.exportBackup()))}>生成完整备份</Action>{output ? <Card><Textarea className='backup-text' value={output} disabled maxlength={2000000} /><Action secondary onClick={() => copyText(output)}>复制完整备份</Action><Text className='muted small'>复制后粘贴到你自己的安全文件中保存。不会自动上传至服务器。</Text></Card> : null}</Section>
    <Section title='从原 App 或本小程序恢复'><Card><Text className='body'>粘贴完整备份，先检查内容再确认合并。不读取或自动迁移原 App 的存储。</Text><Textarea className='backup-text' maxlength={2000000} value={input} placeholder='粘贴完整 JSON 备份…' onInput={(event) => { setInput(event.detail.value); setPreview(null); }} /><Action secondary onClick={() => act(() => { const parsed = studyStore.previewBackup(input); setPreview({ text: input, exportedAt: parsed.exportedAt, summary: summarizeStudyState(parsed.state) }); })}>检查备份，不修改记录</Action></Card>
      {preview ? <View className='notice'><Text className='card-title'>备份检查通过</Text><Text className='body'>导出时间：{preview.exportedAt}</Text><Text className='body'>收藏 {preview.summary.favorites} · 完成例题 {preview.summary.completed} · 每日记录 {preview.summary.dailyAttempts} · 旧版练习草稿 {preview.summary.drafts}</Text><Text className='muted small'>同日期同题的记录、同名旧版草稿以本机为准。旧版自由练习草稿会被保留，但本版暂未提供对应编辑页面。</Text><Action onClick={() => { const verified = preview.text; void Taro.showModal({ title: '确认合并备份？', content: '不会覆盖本机同名记录。合并后建议重新导出一份备份。', confirmText: '确认合并' }).then((result) => { if (result.confirm) act(() => { studyStore.restoreBackup(verified); setPreview(null); setInput(''); void Taro.showToast({ title: '已合并恢复', icon: 'success' }); }); }); }}>确认合并恢复</Action></View> : null}
    </Section>
  </Screen>;
}
