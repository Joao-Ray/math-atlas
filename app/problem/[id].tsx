import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { AppScreen } from '@/components/AppScreen';
import { MathFormula } from '@/components/MathFormula';
import { SectionTitle } from '@/components/Typography';
import { palette, radii, spacing } from '@/constants/Theme';
import { useStudy } from '@/contexts/StudyContext';
import { courseById, problemById, topicById } from '@/data/mockData';

export default function ProblemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const problem = problemById(id);
  const { completedProblems, toggleProblemComplete } = useStudy();

  if (!problem) {
    return <AppScreen><Text style={styles.notFound}>未找到这道例题。</Text></AppScreen>;
  }

  const course = courseById(problem.courseId);
  const topic = topicById(problem.topicId);
  const isCompleted = completedProblems.includes(problem.id);

  return (
    <AppScreen>
      <Stack.Screen options={{ title: problem.title }} />
      <View style={styles.hero}>
        <Pressable accessibilityRole="link"
          onPress={() => router.push({ pathname: '/topic/[slug]', params: { slug: problem.topicId } })}
          style={styles.metaRow}>
          <View style={[styles.dot, { backgroundColor: course?.accent }]} />
          <Text style={styles.meta}>{course?.titleZh} · {topic?.titleZh} ↗</Text>
        </Pressable>
        <Text style={styles.title}>{problem.title}</Text>
        <Text style={styles.difficulty}>{'★'.repeat(problem.difficulty)}{'☆'.repeat(5 - problem.difficulty)}</Text>
      </View>

      <SectionTitle>题目</SectionTitle>
      <View style={styles.promptCard}>
        <Text style={styles.prompt}>{problem.prompt}</Text>
        {problem.formulas.map((formula) => <MathFormula key={formula} latex={formula} compact />)}
      </View>

      <Pressable onPress={() => setShowHints((value) => !value)} style={styles.hintButton}>
        <Text style={styles.hintButtonText}>{showHints ? '隐藏提示' : '需要提示？'}</Text>
        <Text style={styles.hintButtonText}>{showHints ? '↑' : '↓'}</Text>
      </Pressable>
      {showHints ? (
        <View style={styles.hints}>
          {problem.hints.map((hint, index) => <Text key={hint} style={styles.hint}>{index + 1}. {hint}</Text>)}
        </View>
      ) : null}

      {!showSolution ? (
        <Pressable onPress={() => setShowSolution(true)} style={styles.solveButton}>
          <Text style={styles.solveText}>查看详细解析</Text>
        </Pressable>
      ) : (
        <>
          <SectionTitle>详细解析</SectionTitle>
          <View style={styles.timeline}>
            {problem.steps.map((step, index) => (
              <View key={step.title} style={styles.step}>
                <View style={styles.stepRail}>
                  <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{index + 1}</Text></View>
                  {index < problem.steps.length - 1 ? <View style={styles.line} /> : null}
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepBody}>{step.body}</Text>
                  {step.latex ? <MathFormula latex={step.latex} compact /> : null}
                </View>
              </View>
            ))}
          </View>
          <View style={styles.answerCard}>
            <Text style={styles.answerLabel}>FINAL ANSWER</Text>
            <Text style={styles.answer}>{problem.answer}</Text>
          </View>
          <Pressable
            onPress={() => toggleProblemComplete(problem.id)}
            style={[styles.completeButton, isCompleted && styles.completeButtonActive]}>
            <Text style={[styles.completeText, isCompleted && styles.completeTextActive]}>
              {isCompleted ? '✓ 已完成' : '标记为已完成'}
            </Text>
          </Pressable>
          <Pressable onPress={() => setShowSolution(false)} style={styles.hideSolution}>
            <Text style={styles.hideSolutionText}>收起解析</Text>
          </Pressable>
        </>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  notFound: { color: palette.ink, fontSize: 18, paddingTop: 80, textAlign: 'center' },
  hero: { paddingTop: spacing.lg },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 9, height: 9, borderRadius: 5, marginRight: 7 },
  meta: { color: palette.muted, fontSize: 12, fontWeight: '700' },
  title: { color: palette.ink, fontSize: 28, lineHeight: 35, fontWeight: '900', marginTop: spacing.sm },
  difficulty: { color: palette.gold, fontSize: 13, letterSpacing: 1.5, marginTop: spacing.sm },
  promptCard: { backgroundColor: palette.surface, borderColor: palette.line, borderWidth: 1, borderRadius: radii.lg, padding: spacing.lg },
  prompt: { color: palette.ink, fontSize: 16, lineHeight: 26, fontWeight: '600' },
  hintButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderColor: palette.gold, borderWidth: 1, borderRadius: radii.md, padding: spacing.md, marginTop: spacing.md },
  hintButtonText: { color: '#805E23', fontSize: 13, fontWeight: '700' },
  hints: { backgroundColor: '#F2E5C8', borderRadius: radii.md, padding: spacing.md, marginTop: spacing.sm },
  hint: { color: '#715118', fontSize: 13, lineHeight: 20, marginBottom: 4 },
  solveButton: { backgroundColor: palette.green, borderRadius: radii.md, alignItems: 'center', padding: 16, marginTop: spacing.lg },
  solveText: { color: palette.white, fontSize: 15, fontWeight: '800' },
  timeline: { backgroundColor: palette.surface, borderColor: palette.line, borderWidth: 1, borderRadius: radii.lg, padding: spacing.md },
  step: { flexDirection: 'row' },
  stepRail: { width: 36, alignItems: 'center' },
  stepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: palette.green, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: palette.white, fontSize: 12, fontWeight: '800' },
  line: { width: 1, flex: 1, minHeight: 52, backgroundColor: palette.line },
  stepContent: { flex: 1, paddingLeft: spacing.sm, paddingBottom: spacing.lg },
  stepTitle: { color: palette.ink, fontSize: 16, fontWeight: '800', minHeight: 28, paddingTop: 3 },
  stepBody: { color: palette.muted, fontSize: 14, lineHeight: 22, marginTop: spacing.xs },
  answerCard: { backgroundColor: palette.green, borderRadius: radii.lg, padding: spacing.lg, marginTop: spacing.md },
  answerLabel: { color: '#A9C8B8', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  answer: { color: palette.white, fontSize: 18, lineHeight: 26, fontWeight: '800', marginTop: spacing.sm },
  completeButton: { borderWidth: 1, borderColor: palette.green, borderRadius: radii.md, alignItems: 'center', padding: 14, marginTop: spacing.md },
  completeButtonActive: { backgroundColor: palette.greenSoft, borderColor: palette.greenSoft },
  completeText: { color: palette.green, fontSize: 14, fontWeight: '800' },
  completeTextActive: { color: palette.green },
  hideSolution: { alignItems: 'center', padding: spacing.md },
  hideSolutionText: { color: palette.green, fontSize: 13, fontWeight: '700' },
});
