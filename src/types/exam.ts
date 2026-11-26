export type ClassName = '7A' | '7B';

export type OptionKey = 'A' | 'B' | 'C' | 'D' | 'E';

export type QuestionSection = 'A' | 'B' | 'C' | 'D' | 'E';

export type QuestionType =
  | 'single-choice'
  | 'multi-choice'
  | 'true-false-matrix'
  | 'matching'
  | 'essay';

export type ScienceTopic =
  | 'Hakikat Sains & Pengukuran'
  | 'Zat dan Perubahannya'
  | 'Suhu, Kalor, dan Pemuaian'
  | 'Gerak dan Gaya';

export type DiagramId =
  | 'pdf-5-pots'
  | 'pdf-7-solid-particles'
  | 'pdf-10-density-block'
  | 'pdf-21-hazard-symbols'
  | 'pdf-22-phase-changes'
  | 'pdf-30-plant-growth-chart'
  | 'pdf-31-liquid-particles'
  | 'pdf-32-floating-beakers'
  | 'pdf-35-measurement-tools'
  | 'pdf-37-element-compound-mixture'
  | 'pdf-43-three-states-particles';

export interface QuestionOption {
  key: OptionKey;
  text: string;
}

export interface QuestionTable {
  headers: string[];
  rows: string[][];
}

export interface MatrixStatement {
  id: number;
  text: string;
  correct: 'Benar' | 'Salah';
}

export interface MatchingPrompt {
  id: number;
  text: string;
  correctKey: OptionKey;
}

export interface EssaySubQuestion {
  id: string; // e.g. 'a', 'b', 'c', 'd'
  label: string;
  prompt: string;
  inputType: 'text' | 'textarea' | 'line-graph';
  placeholder?: string;
  expectedKeywords?: string[][]; // each inner array = group of synonymous keywords; earning points per group matched
  expectedGraphPoints?: Record<number, number>; // for 42b: { 0: 10, 5: 14, 10: 18, 15: 22, 20: 20 }
  sampleAnswer: string;
}

export interface Question {
  id: number;
  section: QuestionSection;
  sectionTitle: string;
  type: QuestionType;
  topic: ScienceTopic;
  prompt: string;
  diagramId?: DiagramId;
  diagramCaption?: string;
  table?: QuestionTable;

  // Type: single-choice & multi-choice
  options?: QuestionOption[];
  correctAnswer?: OptionKey;
  correctAnswers?: OptionKey[];
  requiredCount?: number;

  // Type: true-false-matrix
  statements?: MatrixStatement[];

  // Type: matching
  matchingPrompts?: MatchingPrompt[];
  matchingChoices?: QuestionOption[];
  allowReuseChoices?: boolean;

  // Type: essay
  essayParts?: EssaySubQuestion[];

  explanation: string;
}

/**
 * Unified student answer representation per question ID:
 * - single-choice: 'A' | 'B' | 'C' | 'D'
 * - multi-choice: ['A', 'C', 'E']
 * - true-false-matrix: { 1: 'Benar', 2: 'Salah', ... }
 * - matching: { 1: 'E', 2: 'C', ... }
 * - essay: { a: '...', b: '{"0":10,"5":14,...}', c: '...' }
 */
export type AnswerValue =
  | OptionKey
  | OptionKey[]
  | Record<number, 'Benar' | 'Salah'>
  | Record<number, OptionKey>
  | Record<string, string>;

export type AnswersMap = Record<number, AnswerValue>;

export interface StudentSession {
  name: string;
  className: ClassName;
  startedAt: number;
}

export interface SectionScoreSummary {
  section: QuestionSection;
  earned: number;
  max: number;
}

export interface StudentSubmission {
  id: string;
  name: string;
  className: ClassName;
  score: number; // 0-100
  earnedPoints: number;
  totalQuestions: number;
  correctCount: number; // fully correct items
  wrongCount: number;
  unansweredCount: number;
  sectionScores?: SectionScoreSummary[];
  durationSeconds: number;
  answers: AnswersMap;
  submittedAt: string;
  autoSubmitted?: boolean;
}

export interface QuestionAnalysis {
  questionId: number;
  section: QuestionSection;
  type: QuestionType;
  topic: ScienceTopic;
  shortTitle: string;
  averageAccuracy: number; // 0-100%
  fullCorrectCount: number;
  totalAttempts: number;
}
