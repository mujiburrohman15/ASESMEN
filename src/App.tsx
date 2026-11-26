import { useCallback, useEffect, useRef, useState } from 'react';
import { AdminDashboardView } from './components/AdminDashboardView';
import { ExamView } from './components/ExamView';
import { LoginView } from './components/LoginView';
import { ResultLeaderboardView } from './components/ResultLeaderboardView';
import { EXAM_DURATION_SECONDS } from './data/questions';
import { submitExamResult } from './services/sheetsApi';
import type {
  AnswersMap,
  AnswerValue,
  ClassName,
  StudentSession,
  StudentSubmission,
} from './types/exam';
import { evaluateExam } from './utils/scoring';

type AppPage = 'login' | 'exam' | 'result' | 'admin';

const ACTIVE_SESSION_KEY = 'ipa7_active_session_v2';
const ACTIVE_ANSWERS_KEY = 'ipa7_active_answers_v2';

function loadSavedSession(): StudentSession | null {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StudentSession;
    if (parsed && parsed.name && parsed.className && parsed.startedAt) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

function loadSavedAnswers(): AnswersMap {
  try {
    const raw = localStorage.getItem(ACTIVE_ANSWERS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as AnswersMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function getInitialPage(): AppPage {
  const params = new URLSearchParams(window.location.search);
  if (params.get('page') === 'admin') return 'admin';
  if (params.get('page') === 'leaderboard') return 'result';
  return 'login';
}

export default function App() {
  const [page, setPage] = useState<AppPage>(getInitialPage);
  const [savedSession, setSavedSession] = useState<StudentSession | null>(loadSavedSession);
  const [activeSession, setActiveSession] = useState<StudentSession | null>(null);
  const [answers, setAnswers] = useState<AnswersMap>(loadSavedAnswers);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(EXAM_DURATION_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<StudentSubmission | null>(null);
  const [syncNote, setSyncNote] = useState<string | null>(null);

  const submittedLockRef = useRef(false);

  const navigateTo = useCallback((nextPage: AppPage) => {
    setPage(nextPage);
    const url = new URL(window.location.href);
    if (nextPage === 'admin') {
      url.searchParams.set('page', 'admin');
    } else if (nextPage === 'result') {
      url.searchParams.set('page', 'leaderboard');
    } else {
      url.searchParams.delete('page');
    }
    window.history.replaceState({}, '', url.toString());
  }, []);

  const clearActiveExamStorage = useCallback(() => {
    try {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
      localStorage.removeItem(ACTIVE_ANSWERS_KEY);
    } catch {
      // ignore
    }
    setSavedSession(null);
  }, []);

  const handleStartExam = (name: string, className: ClassName) => {
    const newSession: StudentSession = {
      name,
      className,
      startedAt: Date.now(),
    };
    submittedLockRef.current = false;
    setActiveSession(newSession);
    setSavedSession(newSession);
    setAnswers({});
    setRemainingSeconds(EXAM_DURATION_SECONDS);
    setLastSubmission(null);
    setSyncNote(null);

    try {
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(newSession));
      localStorage.setItem(ACTIVE_ANSWERS_KEY, JSON.stringify({}));
    } catch {
      // ignore
    }

    navigateTo('exam');
  };

  const handleResumeExam = () => {
    if (!savedSession) return;
    const elapsed = Math.floor((Date.now() - savedSession.startedAt) / 1000);
    const left = Math.max(0, EXAM_DURATION_SECONDS - elapsed);
    submittedLockRef.current = false;
    setActiveSession(savedSession);
    setAnswers(loadSavedAnswers());
    setRemainingSeconds(left);
    navigateTo('exam');
  };

  const handleUpdateAnswer = (questionId: number, value: AnswerValue) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: value };
      try {
        localStorage.setItem(ACTIVE_ANSWERS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleSubmitExam = useCallback(
    async (autoSubmitted: boolean) => {
      if (!activeSession || submittedLockRef.current) return;
      submittedLockRef.current = true;
      setIsSubmitting(true);

      const elapsedSeconds = Math.min(
        EXAM_DURATION_SECONDS,
        Math.max(1, Math.floor((Date.now() - activeSession.startedAt) / 1000)),
      );

      const evaluated = evaluateExam(answers);

      const submissionId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const submission: StudentSubmission = {
        id: submissionId,
        name: activeSession.name,
        className: activeSession.className,
        score: evaluated.score,
        earnedPoints: evaluated.earnedPoints,
        totalQuestions: evaluated.totalQuestions,
        correctCount: evaluated.correctCount,
        wrongCount: evaluated.wrongCount,
        unansweredCount: evaluated.unansweredCount,
        sectionScores: evaluated.sectionScores,
        durationSeconds: elapsedSeconds,
        answers,
        submittedAt: new Date().toISOString(),
        autoSubmitted,
      };

      const syncStatus = await submitExamResult(submission);
      if (syncStatus.savedToSheets) {
        setSyncNote('Tersimpan ke Google Sheets');
      } else if (syncStatus.savedToServer) {
        setSyncNote('Tersimpan di server aplikasi');
      } else {
        setSyncNote('Tersimpan di perangkat');
      }

      clearActiveExamStorage();
      setActiveSession(null);
      setLastSubmission(submission);
      setIsSubmitting(false);
      navigateTo('result');
    },
    [activeSession, answers, clearActiveExamStorage, navigateTo],
  );

  useEffect(() => {
    if (page !== 'exam' || !activeSession) return;

    const syncTimer = () => {
      const elapsed = Math.floor((Date.now() - activeSession.startedAt) / 1000);
      const left = Math.max(0, EXAM_DURATION_SECONDS - elapsed);
      setRemainingSeconds(left);
      if (left <= 0 && !submittedLockRef.current) {
        handleSubmitExam(true);
      }
    };

    syncTimer();
    const interval = window.setInterval(syncTimer, 1000);
    return () => window.clearInterval(interval);
  }, [page, activeSession, handleSubmitExam]);

  if (page === 'admin') {
    return <AdminDashboardView onBackHome={() => navigateTo('login')} />;
  }

  if (page === 'exam' && activeSession) {
    return (
      <ExamView
        session={activeSession}
        answers={answers}
        remainingSeconds={remainingSeconds}
        isSubmitting={isSubmitting}
        onUpdateAnswer={handleUpdateAnswer}
        onSubmitExam={handleSubmitExam}
      />
    );
  }

  if (page === 'result') {
    return (
      <ResultLeaderboardView
        currentSubmission={lastSubmission}
        syncNote={syncNote}
        onBackHome={() => {
          setLastSubmission(null);
          navigateTo('login');
        }}
        onOpenAdmin={() => navigateTo('admin')}
      />
    );
  }

  return (
    <LoginView
      existingSession={savedSession}
      onStartExam={handleStartExam}
      onResumeExam={handleResumeExam}
      onDiscardSession={clearActiveExamStorage}
      onOpenAdmin={() => navigateTo('admin')}
      onOpenLeaderboardPreview={() => {
        setLastSubmission(null);
        navigateTo('result');
      }}
    />
  );
}
