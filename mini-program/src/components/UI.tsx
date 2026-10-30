import type { PropsWithChildren, ReactNode } from 'react';
import { Button, Input, ScrollView, Text, View } from '@tarojs/components';
import { courses } from '../../../data/mockData';
import type { Problem, Topic } from '../../../types';
import { openPage } from '../lib/navigation';
import { useStudy } from '../lib/study';

export function Screen({ children }: PropsWithChildren) {
  const { error } = useStudy();
  return <View className='screen'>{error ? <View className='error-banner'><Text>{error}</Text></View> : null}{children}<Text className='footer'>Lemivanta · 学一点，懂多一点</Text></View>;
}
export function Heading({ title, subtitle, kicker }: { title: string; subtitle?: string; kicker?: string }) {
  return <View className='heading'>{kicker ? <Text className='eyebrow'>{kicker}</Text> : null}<Text className='page-title'>{title}</Text>{subtitle ? <Text className='muted subtitle'>{subtitle}</Text> : null}</View>;
}
export function Section({ title, action, children }: PropsWithChildren<{ title: string; action?: ReactNode }>) {
  return <View className='section'><View className='section-heading'><Text className='section-title'>{title}</Text>{action}</View>{children}</View>;
}
export function Card({ children, onClick, className = '' }: PropsWithChildren<{ onClick?: () => void; className?: string }>) {
  return <View className={'card ' + className} onClick={onClick}>{children}</View>;
}
export function Action({ children, onClick, secondary = false, disabled = false, id }: PropsWithChildren<{ onClick: () => void; secondary?: boolean; disabled?: boolean; id?: string }>) {
  return <Button id={id} className={'action ' + (secondary ? 'secondary' : '')} disabled={disabled} onClick={onClick}>{children}</Button>;
}
export function Search({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <View className='search'><Text className='search-icon'>⌕</Text><Input value={value} maxlength={150} onInput={(event) => onChange(event.detail.value)} placeholder={placeholder} confirmType='search' /></View>;
}
export function Chips({ options, value, onChange, id }: { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void; id?: string }) {
  return <ScrollView scrollX className='chips'><View className='chip-row'>{options.map((option, index) => <View id={id ? id + '-' + index : undefined} key={option.id} className={'chip ' + (option.id === value ? 'selected' : '')} onClick={() => onChange(option.id)}><Text>{option.label}</Text></View>)}</View></ScrollView>;
}
export function CourseChips({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <Chips value={value} onChange={onChange} options={[{ id: 'all', label: '全部课程' }, ...courses.map((course) => ({ id: course.id, label: course.titleZh }))]} />;
}
export function Empty({ text, onReset }: { text: string; onReset?: () => void }) {
  return <Card><Text className='muted'>{text}</Text>{onReset ? <Text className='link' onClick={onReset}>清除筛选</Text> : null}</Card>;
}
export function TopicCard({ topic }: { topic: Topic }) {
  return <Card onClick={() => openPage('topic', topic.id)}><Text className='eyebrow'>{courses.find((course) => course.id === topic.courseId)?.titleZh}</Text><Text className='card-title'>{topic.titleZh}</Text><Text className='muted small'>{topic.title}</Text><Text className='body'>{topic.summary}</Text></Card>;
}
export function ProblemCard({ problem, completed }: { problem: Problem; completed: boolean }) {
  const contest = problem.source?.kind === 'past-paper' || problem.source?.kind === 'competition-style';
  return <Card onClick={() => openPage('problem', problem.id)}><View className='between'><Text className='eyebrow'>{courses.find((course) => course.id === problem.courseId)?.titleZh}{contest ? ' · 竞赛题库' : ''}</Text><Text className='badge'>{completed ? '已完成' : '★'.repeat(problem.difficulty)}</Text></View><Text className='card-title'>{problem.title}</Text><Text className='preview'>{problem.prompt}</Text><Text className='link small'>独立思考，再看解析 →</Text></Card>;
}
