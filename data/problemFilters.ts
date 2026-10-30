import type { Course, CourseId, Problem, Topic } from '@/types';

export type ProblemTrack = 'all' | 'core' | 'competition' | 'practice';
export function normalizeProblemTrack(value: unknown): ProblemTrack {
  if (value === 'past-paper') return 'competition'; // Keep saved links working after the merger.
  return value === 'core' || value === 'competition' || value === 'practice' ? value : 'all';
}
export function normalizeCourseSelection(value: unknown, courses: Course[]): CourseId | 'all' {
  return courses.find((course) => course.id === value)?.id ?? 'all';
}
export function filterStudyProblems(items: Problem[], options: {
  query: string; track: ProblemTrack; courseId: CourseId | null; level: number | null;
  completion: 'all' | 'completed' | 'uncompleted'; completedIds: string[];
  paper?: 'all' | '非数学 A 类' | '非数学 B 类';
  practiceSet?: 'all' | NonNullable<Problem['practiceSet']>;
  competitionSource?: 'all' | 'past-paper' | 'competition-style';
}, courses: Course[], topics: Topic[]) {
  const query = options.query.trim().toLowerCase();
  const completed = new Set(options.completedIds);
  const track = normalizeProblemTrack(options.track);
  return items.filter((item) => {
    const course = courses.find((entry) => entry.id === item.courseId);
    const topic = topics.find((entry) => entry.id === item.topicId);
    const competition = item.source?.kind === 'competition-style';
    const past = item.source?.kind === 'past-paper' ? item.source : null;
    return (!query || [item.title, item.prompt, course?.titleZh, course?.title, topic?.titleZh, topic?.title, item.source?.label,
      past?.exam, past?.question, past?.paper, past?.documentTitle].join(' ').toLowerCase().includes(query))
      && (track === 'all' || (track === 'competition' ? competition || !!past : track === 'practice' ? !!item.practiceSet : !competition && !past))
      && (track !== 'competition' || !options.competitionSource || options.competitionSource === 'all' || item.source?.kind === options.competitionSource)
      && (track !== 'competition' || !options.paper || options.paper === 'all' || past?.paper === options.paper || past?.paper === '非数学 A/B 类')
      && (track !== 'practice' || !options.practiceSet || options.practiceSet === 'all' || item.practiceSet === options.practiceSet)
      && (!options.courseId || item.courseId === options.courseId)
      && (!options.level || item.difficulty === options.level)
      && (options.completion === 'all' || (options.completion === 'completed' ? completed.has(item.id) : !completed.has(item.id)));
  });
}
