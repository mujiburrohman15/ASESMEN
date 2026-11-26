import { parseGraphPoints } from '../components/diagrams/InteractiveLineGraphPlotter';
import { QUESTIONS } from '../data/questions';
import type {
  AnswersMap,
  AnswerValue,
  OptionKey,
  Question,
  QuestionSection,
  SectionScoreSummary,
} from '../types/exam';

export function isQuestionAnswered(question: Question, answer: AnswerValue | undefined): boolean {
  if (answer === undefined || answer === null) return false;

  switch (question.type) {
    case 'single-choice':
      return typeof answer === 'string' && answer.length > 0;
    case 'multi-choice':
      return Array.isArray(answer) && answer.length > 0;
    case 'true-false-matrix': {
      if (typeof answer !== 'object' || Array.isArray(answer)) return false;
      const map = answer as Record<number, 'Benar' | 'Salah'>;
      const total = question.statements?.length ?? 0;
      return total > 0 && Object.keys(map).length >= total;
    }
    case 'matching': {
      if (typeof answer !== 'object' || Array.isArray(answer)) return false;
      const map = answer as Record<number, OptionKey>;
      const total = question.matchingPrompts?.length ?? 0;
      return total > 0 && Object.values(map).filter(Boolean).length >= total;
    }
    case 'essay': {
      if (typeof answer !== 'object' || Array.isArray(answer)) return false;
      const map = answer as Record<string, string>;
      return Object.values(map).some((v) => typeof v === 'string' && v.trim().length > 0);
    }
  }
}

export function isQuestionPartiallyAnswered(question: Question, answer: AnswerValue | undefined): boolean {
  if (answer === undefined || answer === null) return false;
  if (isQuestionAnswered(question, answer)) return false;

  if (question.type === 'true-false-matrix' || question.type === 'matching') {
    if (typeof answer === 'object' && !Array.isArray(answer)) {
      return Object.values(answer).some(Boolean);
    }
  }
  return false;
}

/**
 * Returns a normalized score between 0 and 1 for any question type.
 */
export function scoreQuestion(question: Question, answer: AnswerValue | undefined): number {
  if (answer === undefined || answer === null) return 0;

  switch (question.type) {
    case 'single-choice': {
      return answer === question.correctAnswer ? 1 : 0;
    }
    case 'multi-choice': {
      if (!Array.isArray(answer) || !question.correctAnswers?.length) return 0;
      const expected = new Set(question.correctAnswers);
      let hits = 0;
      let wrong = 0;
      for (const item of answer) {
        if (expected.has(item)) hits += 1;
        else wrong += 1;
      }
      const raw = (hits - wrong) / expected.size;
      return Math.max(0, Math.min(1, raw));
    }
    case 'true-false-matrix': {
      if (typeof answer !== 'object' || Array.isArray(answer) || !question.statements?.length) return 0;
      const map = answer as Record<number, 'Benar' | 'Salah'>;
      let correct = 0;
      for (const st of question.statements) {
        if (map[st.id] === st.correct) correct += 1;
      }
      return correct / question.statements.length;
    }
    case 'matching': {
      if (typeof answer !== 'object' || Array.isArray(answer) || !question.matchingPrompts?.length) return 0;
      const map = answer as Record<number, OptionKey>;
      let correct = 0;
      for (const p of question.matchingPrompts) {
        if (map[p.id] === p.correctKey) correct += 1;
      }
      return correct / question.matchingPrompts.length;
    }
    case 'essay': {
      if (typeof answer !== 'object' || Array.isArray(answer) || !question.essayParts?.length) return 0;
      const map = answer as Record<string, string>;
      let totalPartScore = 0;

      for (const part of question.essayParts) {
        const val = (map[part.id] || '').trim();
        if (!val) continue;

        if (part.inputType === 'line-graph' && part.expectedGraphPoints) {
          const plotted = parseGraphPoints(val);
          const keys = Object.keys(part.expectedGraphPoints).map(Number);
          let matched = 0;
          for (const x of keys) {
            if (plotted[x] === part.expectedGraphPoints[x]) {
              matched += 1;
            }
          }
          totalPartScore += keys.length > 0 ? matched / keys.length : 0;
        } else if (part.expectedKeywords && part.expectedKeywords.length > 0) {
          const normalized = val.toLowerCase();
          let matchedGroups = 0;
          for (const synGroup of part.expectedKeywords) {
            if (synGroup.some((kw) => normalized.includes(kw.toLowerCase()))) {
              matchedGroups += 1;
            }
          }
          totalPartScore += matchedGroups / part.expectedKeywords.length;
        } else {
          // Fallback credit for non-empty response
          totalPartScore += val.length >= 5 ? 1 : 0.5;
        }
      }

      return Math.min(1, totalPartScore / question.essayParts.length);
    }
  }
}

export function evaluateExam(answers: AnswersMap): {
  score: number;
  earnedPoints: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  sectionScores: SectionScoreSummary[];
} {
  let earnedPoints = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  const sections: Record<QuestionSection, { earned: number; max: number }> = {
    A: { earned: 0, max: 0 },
    B: { earned: 0, max: 0 },
    C: { earned: 0, max: 0 },
    D: { earned: 0, max: 0 },
    E: { earned: 0, max: 0 },
  };

  for (const q of QUESTIONS) {
    const ans = answers[q.id];
    const pts = scoreQuestion(q, ans);
    earnedPoints += pts;
    sections[q.section].earned += pts;
    sections[q.section].max += 1;

    if (!isQuestionAnswered(q, ans) && !isQuestionPartiallyAnswered(q, ans)) {
      unansweredCount += 1;
    } else if (pts >= 0.999) {
      correctCount += 1;
    } else {
      wrongCount += 1;
    }
  }

  const roundedEarned = Math.round(earnedPoints * 100) / 100;
  const score = Math.round((earnedPoints / QUESTIONS.length) * 100);

  const sectionScores: SectionScoreSummary[] = (['A', 'B', 'C', 'D', 'E'] as QuestionSection[]).map(
    (sec) => ({
      section: sec,
      earned: Math.round(sections[sec].earned * 100) / 100,
      max: sections[sec].max,
    }),
  );

  return {
    score,
    earnedPoints: roundedEarned,
    totalQuestions: QUESTIONS.length,
    correctCount,
    wrongCount,
    unansweredCount,
    sectionScores,
  };
}
