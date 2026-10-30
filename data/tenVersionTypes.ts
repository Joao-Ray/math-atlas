import type { CourseId, Formula, Problem, Topic } from '@/types';

export type SeriesExercise = Omit<Problem, 'id' | 'courseId' | 'topicId' | 'source' | 'formulas'> & {
  variantLabel?: string;
};
export type SeriesLesson = Omit<Topic, 'id' | 'courseId' | 'formulaIds' | 'problemIds'> & {
  courseId: CourseId;
  key: string;
  formula: Omit<Formula, 'id' | 'courseId' | 'topicId'>;
  exercises: SeriesExercise[];
};
export const seriesExercise = (
  title: string, prompt: string, hint: string, work: [string, string][], answer: string,
  difficulty: Problem['difficulty'] = 3, variantLabel?: string,
): SeriesExercise => ({ title, prompt, hints: [hint], steps: work.map(([title, body]) => ({ title, body })), answer, difficulty, variantLabel });
