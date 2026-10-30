import type { Formula, Problem, Topic } from '@/types';
import { roadmapTopicId } from './curriculumRoadmap';
import type { SeriesLesson } from './tenVersionTypes';
import { seriesV113 } from './tenVersions/calculus';
import { seriesV114, seriesV115, seriesV116 } from './tenVersions/linearProbabilityStatistics';
import { seriesV117, seriesV118, seriesV119 } from './tenVersions/stochasticAlgebraComplex';
import { seriesV120, seriesV121, seriesV122 } from './tenVersions/geometryMeasureAnalysis';

const batches: SeriesLesson[][] = [seriesV113,seriesV114,seriesV115,seriesV116,seriesV117,seriesV118,seriesV119,seriesV120,seriesV121,seriesV122];
export const tenVersionReleases = batches.map((lessons, releaseIndex) => {
  const version = `1.${13+releaseIndex}.0`;
  const topics: Topic[] = lessons.map(({key,formula,exercises,...topic}) => ({
    ...topic, id: roadmapTopicId(topic.courseId,key),
    sourceNote: topic.sourceNote ?? '本项目原创讲解与配套题；包含明确标注的参数变式，非教材原文、非历年真题。',
    formulaIds: [roadmapTopicId(topic.courseId,key)+'-formula'],
    problemIds: exercises.map((_,i)=>roadmapTopicId(topic.courseId,key)+'-exercise-'+(i+1)),
  }));
  const formulas: Formula[] = lessons.map(({key,courseId,formula})=>({
    ...formula,id:roadmapTopicId(courseId,key)+'-formula',topicId:roadmapTopicId(courseId,key),courseId,
  }));
  const problems: Problem[] = lessons.flatMap(({key,courseId,exercises})=>exercises.map(({variantLabel,...exercise},i)=>({
    ...exercise,id:roadmapTopicId(courseId,key)+'-exercise-'+(i+1),courseId,topicId:roadmapTopicId(courseId,key),formulas:[],
    source:{kind:'original' as const,label:'原创配套练习 · 非教材原题、非历年真题'+(variantLabel?' · 变式：'+variantLabel:'')},
  })));
  return {version,wechatVersion:`0.${8+releaseIndex}.0`,courseId:lessons[0].courseId,topics,formulas,problems,
    cumulative:{topics:225+8*(releaseIndex+1),formulas:241+8*(releaseIndex+1),problems:388+72*(releaseIndex+1)}};
});
export const tenVersionTopics = tenVersionReleases.flatMap(release=>release.topics);
export const tenVersionFormulas = tenVersionReleases.flatMap(release=>release.formulas);
export const tenVersionProblems = tenVersionReleases.flatMap(release=>release.problems);
