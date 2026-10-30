export type CourseId =
  | 'calculus'
  | 'linear-algebra'
  | 'probability'
  | 'statistics'
  | 'stochastic-process'
  | 'higher-algebra'
  | 'complex-analysis'
  | 'analytic-geometry'
  | 'measure-theory'
  | 'mathematical-analysis';

export type Course = {
  id: CourseId;
  title: string;
  titleZh: string;
  description: string;
  accent: string;
  icon: string;
};

export type Topic = {
  id: string;
  courseId: CourseId;
  title: string;
  titleZh: string;
  summary: string;
  definition: string;
  intuition: string;
  prerequisites: string[];
  formulaIds: string[];
  problemIds: string[];
  learningNotes?: string[];
  sourceNote?: string;
};

export type Formula = {
  id: string;
  courseId: CourseId;
  title: string;
  titleZh: string;
  latex: string;
  explanation: string;
  conditions?: string;
  derivation?: { title: string; body: string; latex?: string }[];
  topicId: string;
};

export type Problem = {
  id: string;
  courseId: CourseId;
  topicId: string;
  title: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  prompt: string;
  formulas: string[];
  hints: string[];
  steps: { title: string; body: string; latex?: string }[];
  answer: string;
  practiceSet?: 'analysis' | 'linear-algebra' | 'calculus';
  source?: {
    kind: 'original' | 'competition-style';
    label: string;
  } | {
    kind: 'past-paper';
    label: string;
    exam: string;
    paper: '非数学 A 类' | '非数学 B 类' | '非数学 A/B 类';
    question: string;
    documentTitle: string;
    pdfPages: number[];
    printedPages: number[];
    verificationNote: string;
    editorialNote?: string;
  };
};

export type Paper = {
  id: string;
  title: string;
  authors: string;
  category: string;
  publishedAt: string;
  abstract: string;
  tags: string[];
  source: string;
  url: string;
  topicIds: string[];
  readingGuide: string;
};
