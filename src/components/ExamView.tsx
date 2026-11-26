import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Send,
} from 'lucide-react';
import { QUESTIONS } from '../data/questions';
import type {
  AnswersMap,
  AnswerValue,
  OptionKey,
  Question,
  QuestionSection,
  StudentSession,
} from '../types/exam';
import { formatTimer } from '../utils/formatters';
import { isQuestionAnswered, isQuestionPartiallyAnswered } from '../utils/scoring';
import { InteractiveLineGraphPlotter } from './diagrams/InteractiveLineGraphPlotter';
import { ScienceDiagram } from './diagrams/ScienceDiagrams';

interface ExamViewProps {
  session: StudentSession;
  answers: AnswersMap;
  remainingSeconds: number;
  isSubmitting: boolean;
  onUpdateAnswer: (questionId: number, value: AnswerValue) => void;
  onSubmitExam: (autoSubmitted: boolean) => void;
}

const SECTION_GROUPS: Array<{ section: QuestionSection; label: string }> = [
  { section: 'A', label: 'Bagian A · Pilihan Ganda (1–19)' },
  { section: 'B', label: 'Bagian B · PG Kompleks (20–29)' },
  { section: 'C', label: 'Bagian C · PG Kategori (30–34)' },
  { section: 'D', label: 'Bagian D · Menjodohkan (35–41)' },
  { section: 'E', label: 'Bagian E · Uraian (42–45)' },
];

const TYPE_INSTRUCTION: Record<Question['type'], string> = {
  'single-choice': 'Pilih satu jawaban yang paling benar.',
  'multi-choice': 'Pilih jawaban yang benar sesuai jumlah yang diminta dengan mencentang kotak.',
  'true-false-matrix': 'Tentukan apakah setiap pernyataan Benar atau Salah.',
  matching: 'Jodohkan pernyataan/gambar sebelah kiri dengan pilihan jawaban yang tepat.',
  essay: 'Jawablah setiap sub-pertanyaan dengan jelas dan lengkap.',
};

export function ExamView({
  session,
  answers,
  remainingSeconds,
  isSubmitting,
  onUpdateAnswer,
  onSubmitExam,
}: ExamViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const currentQuestion = QUESTIONS[currentIndex];
  const currentAnswer = answers[currentQuestion.id];

  const answeredCount = QUESTIONS.filter((q) => isQuestionAnswered(q, answers[q.id])).length;
  const unansweredCount = QUESTIONS.length - answeredCount;
  const isLowTime = remainingSeconds <= 300;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentIndex]);

  const handleToggleMultiChoice = (optKey: OptionKey) => {
    const current = Array.isArray(currentAnswer) ? (currentAnswer as OptionKey[]) : [];
    const exists = current.includes(optKey);
    const next = exists ? current.filter((k) => k !== optKey) : [...current, optKey];
    onUpdateAnswer(currentQuestion.id, next);
  };

  const handleSetMatrix = (statementId: number, val: 'Benar' | 'Salah') => {
    const prev =
      currentAnswer && typeof currentAnswer === 'object' && !Array.isArray(currentAnswer)
        ? (currentAnswer as Record<number, 'Benar' | 'Salah'>)
        : {};
    onUpdateAnswer(currentQuestion.id, { ...prev, [statementId]: val });
  };

  const handleSetMatching = (promptId: number, choiceKey: OptionKey | '') => {
    const prev =
      currentAnswer && typeof currentAnswer === 'object' && !Array.isArray(currentAnswer)
        ? (currentAnswer as Record<number, OptionKey>)
        : {};
    const next = { ...prev };
    if (choiceKey === '') {
      delete next[promptId];
    } else {
      next[promptId] = choiceKey;
    }
    onUpdateAnswer(currentQuestion.id, next);
  };

  const handleSetEssayPart = (partId: string, textValue: string) => {
    const prev =
      currentAnswer && typeof currentAnswer === 'object' && !Array.isArray(currentAnswer)
        ? (currentAnswer as Record<string, string>)
        : {};
    onUpdateAnswer(currentQuestion.id, { ...prev, [partId]: textValue });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Compact Sticky Exam Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
          <div className="min-w-0 flex items-center gap-3">
            <span className="font-bold text-slate-900 truncate max-w-[140px] sm:max-w-xs">
              {session.name}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-sm font-medium text-slate-600 whitespace-nowrap shrink-0">
              Kelas {session.className}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div
              aria-live="polite"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-sm sm:text-base font-semibold tabular-nums whitespace-nowrap shrink-0 ${
                isLowTime
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-slate-100 border-slate-200 text-slate-900'
              }`}
            >
              <Clock className={`w-4 h-4 ${isLowTime ? 'text-red-600' : 'text-teal-700'}`} aria-hidden="true" />
              <span>{formatTimer(remainingSeconds)}</span>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setShowConfirmModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Selesai &amp; Kumpulkan</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Main Question Area */}
          <section className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 sm:p-7 space-y-6">
            <div className="space-y-1.5 pb-4 border-b border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-bold text-teal-700 font-mono tabular-nums">
                    Soal {currentQuestion.id} / {QUESTIONS.length}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="font-semibold text-slate-800">{currentQuestion.sectionTitle}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-slate-600">{currentQuestion.topic}</span>
                </div>

                <span className="text-xs font-medium text-slate-500 font-mono tabular-nums">
                  {answeredCount} / {QUESTIONS.length} selesai
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {TYPE_INSTRUCTION[currentQuestion.type]}
              </p>
            </div>

            {/* Prompt */}
            <div className="text-base sm:text-lg text-slate-900 leading-relaxed whitespace-pre-line font-medium">
              {currentQuestion.prompt}
            </div>

            {/* Inline SVG Diagram */}
            {currentQuestion.diagramId && (
              <figure className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4">
                <ScienceDiagram id={currentQuestion.diagramId} />
              </figure>
            )}

            {/* Data Table */}
            {currentQuestion.table && (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-semibold">
                      {currentQuestion.table.headers.map((h, i) => (
                        <th key={i} className="py-2.5 px-4 border-r last:border-r-0 border-slate-200">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {currentQuestion.table.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="bg-white">
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className="py-2.5 px-4 border-r last:border-r-0 border-slate-200 font-mono tabular-nums text-slate-800"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TYPE 1: SINGLE-CHOICE (BAGIAN A) */}
            {currentQuestion.type === 'single-choice' && currentQuestion.options && (
              <div className="space-y-3" role="radiogroup" aria-label={`Pilihan soal ${currentQuestion.id}`}>
                {currentQuestion.options.map((opt) => {
                  const isSelected = currentAnswer === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => onUpdateAnswer(currentQuestion.id, opt.key)}
                      className={`w-full text-left flex items-start gap-3.5 p-4 rounded-xl border transition-colors min-h-[52px] cursor-pointer ${
                        isSelected
                          ? 'bg-teal-50 border-teal-600 text-slate-900'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-sm font-bold shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="text-sm sm:text-base leading-relaxed pt-0.5 flex-1">
                        {opt.text}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-1" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* TYPE 2: MULTI-CHOICE KOMPLEKS (BAGIAN B) */}
            {currentQuestion.type === 'multi-choice' && currentQuestion.options && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                  <span>
                    Target pilihan: <strong className="text-slate-900">{currentQuestion.requiredCount} jawaban</strong>
                  </span>
                  <span className="font-mono tabular-nums text-teal-700 font-semibold">
                    Tercentang: {Array.isArray(currentAnswer) ? currentAnswer.length : 0} / {currentQuestion.requiredCount}
                  </span>
                </div>

                {currentQuestion.options.map((opt) => {
                  const selectedArr = Array.isArray(currentAnswer) ? (currentAnswer as OptionKey[]) : [];
                  const isChecked = selectedArr.includes(opt.key);
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      role="checkbox"
                      aria-checked={isChecked}
                      onClick={() => handleToggleMultiChoice(opt.key)}
                      className={`w-full text-left flex items-start gap-3.5 p-4 rounded-xl border transition-colors min-h-[52px] cursor-pointer ${
                        isChecked
                          ? 'bg-teal-50 border-teal-600 text-slate-900'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 mt-0.5 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-teal-600 border-teal-600 text-white'
                            : 'bg-white border-slate-300 text-transparent'
                        }`}
                      >
                        <Check className="w-4 h-4" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-sm font-bold text-slate-700 pt-0.5 shrink-0">
                        {opt.key}.
                      </span>
                      <span className="text-sm sm:text-base leading-relaxed flex-1">
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TYPE 3: PILIHAN GANDA KATEGORI BENAR/SALAH (BAGIAN C) */}
            {currentQuestion.type === 'true-false-matrix' && currentQuestion.statements && (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-semibold">
                      <th className="py-3 px-3 sm:px-4 w-12">No</th>
                      <th className="py-3 px-3 sm:px-4">Pernyataan</th>
                      <th className="py-3 px-3 w-24 text-center">Benar</th>
                      <th className="py-3 px-3 w-24 text-center">Salah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {currentQuestion.statements.map((st) => {
                      const map =
                        currentAnswer && typeof currentAnswer === 'object' && !Array.isArray(currentAnswer)
                          ? (currentAnswer as Record<number, 'Benar' | 'Salah'>)
                          : {};
                      const val = map[st.id];
                      return (
                        <tr key={st.id} className="bg-white">
                          <td className="py-3.5 px-3 sm:px-4 font-mono font-semibold text-slate-600 tabular-nums align-top">
                            {st.id}
                          </td>
                          <td className="py-3.5 px-3 sm:px-4 text-slate-900 leading-relaxed">
                            {st.text}
                          </td>
                          {(['Benar', 'Salah'] as const).map((choice) => {
                            const active = val === choice;
                            return (
                              <td key={choice} className="py-3 px-2 text-center align-middle">
                                <button
                                  type="button"
                                  role="radio"
                                  aria-checked={active}
                                  aria-label={`Pernyataan ${st.id}: ${choice}`}
                                  onClick={() => handleSetMatrix(st.id, choice)}
                                  className={`w-full min-h-[40px] px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                                    active
                                      ? choice === 'Benar'
                                        ? 'bg-emerald-600 border-emerald-700 text-white'
                                        : 'bg-sky-600 border-sky-700 text-white'
                                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  {choice}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* TYPE 4: MENJODOHKAN (BAGIAN D) */}
            {currentQuestion.type === 'matching' &&
              currentQuestion.matchingPrompts &&
              currentQuestion.matchingChoices && (
                <div className="space-y-4">
                  {/* Choices Legend */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-bold text-slate-700">
                      Daftar Pilihan Jawaban{currentQuestion.allowReuseChoices ? ' (boleh dipakai lebih dari sekali)' : ''}:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {currentQuestion.matchingChoices.map((ch) => (
                        <div key={ch.key} className="flex items-start gap-2 text-slate-800">
                          <span className="font-mono font-bold text-teal-700 shrink-0">{ch.key}.</span>
                          <span>{ch.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Matching Rows */}
                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                    {currentQuestion.matchingPrompts.map((mp) => {
                      const map =
                        currentAnswer && typeof currentAnswer === 'object' && !Array.isArray(currentAnswer)
                          ? (currentAnswer as Record<number, OptionKey>)
                          : {};
                      const selected = map[mp.id] || '';
                      return (
                        <div
                          key={mp.id}
                          className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <span className="font-mono text-sm font-bold text-slate-500 tabular-nums pt-0.5">
                              {mp.id}.
                            </span>
                            <span className="text-sm sm:text-base text-slate-900 leading-relaxed">
                              {mp.text}
                            </span>
                          </div>
                          <select
                            aria-label={`Pilih pasangan untuk pernyataan ${mp.id}`}
                            value={selected}
                            onChange={(e) => handleSetMatching(mp.id, e.target.value as OptionKey | '')}
                            className={`h-11 px-3 rounded-lg border text-sm font-medium sm:w-64 shrink-0 focus:outline-none focus:ring-2 focus:ring-teal-600 ${
                              selected
                                ? 'bg-teal-50 border-teal-600 text-slate-900'
                                : 'bg-white border-slate-300 text-slate-700'
                            }`}
                          >
                            <option value="">-- Pilih Jawaban --</option>
                            {currentQuestion.matchingChoices?.map((ch) => (
                              <option key={ch.key} value={ch.key}>
                                {ch.key}. {ch.text}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* TYPE 5: URAIAN & GRAFIK (BAGIAN E) */}
            {currentQuestion.type === 'essay' && currentQuestion.essayParts && (
              <div className="space-y-5">
                {currentQuestion.essayParts.map((part) => {
                  const map =
                    currentAnswer && typeof currentAnswer === 'object' && !Array.isArray(currentAnswer)
                      ? (currentAnswer as Record<string, string>)
                      : {};
                  const val = map[part.id] || '';

                  return (
                    <div key={part.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
                      <label htmlFor={`essay-${currentQuestion.id}-${part.id}`} className="block text-sm sm:text-base font-semibold text-slate-900">
                        <span className="font-mono text-teal-700 mr-2">{part.id}.</span>
                        {part.prompt}
                      </label>

                      {part.inputType === 'line-graph' ? (
                        <InteractiveLineGraphPlotter
                          valueJson={val}
                          onChange={(nextJson) => handleSetEssayPart(part.id, nextJson)}
                        />
                      ) : part.inputType === 'text' ? (
                        <input
                          id={`essay-${currentQuestion.id}-${part.id}`}
                          type="text"
                          value={val}
                          onChange={(e) => handleSetEssayPart(part.id, e.target.value)}
                          placeholder={part.placeholder}
                          className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                        />
                      ) : (
                        <textarea
                          id={`essay-${currentQuestion.id}-${part.id}`}
                          rows={3}
                          value={val}
                          onChange={(e) => handleSetEssayPart(part.id, e.target.value)}
                          placeholder={part.placeholder}
                          className="w-full p-3.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 resize-y"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Navigation */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                <span>Sebelumnya</span>
              </button>

              {currentIndex < QUESTIONS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(QUESTIONS.length - 1, prev + 1))}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span>Selesai &amp; Kumpulkan</span>
                </button>
              )}
            </div>
          </section>

          {/* 45-Question Grouped Navigator Sidebar */}
          <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-5 lg:sticky lg:top-24">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900">Navigasi 45 Soal (Bagian A–E)</h2>
              <p className="text-xs text-slate-500">
                Klik nomor soal untuk berpindah cepat antar bagian.
              </p>
            </div>

            <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
              {SECTION_GROUPS.map((group) => {
                const sectionQuestions = QUESTIONS.filter((q) => q.section === group.section);
                return (
                  <div key={group.section} className="space-y-2">
                    <p className="text-xs font-bold text-slate-600">{group.label}</p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {sectionQuestions.map((q) => {
                        const idx = QUESTIONS.findIndex((item) => item.id === q.id);
                        const isActive = idx === currentIndex;
                        const done = isQuestionAnswered(q, answers[q.id]);
                        const partial = isQuestionPartiallyAnswered(q, answers[q.id]);
                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => setCurrentIndex(idx)}
                            aria-label={`Soal nomor ${q.id}${done ? ', selesai' : partial ? ', sebagian' : ', belum dijawab'}`}
                            className={`h-10 rounded-lg font-mono text-xs font-bold tabular-nums transition-colors flex items-center justify-center border cursor-pointer ${
                              isActive
                                ? 'bg-sky-600 border-sky-700 text-white ring-2 ring-sky-200'
                                : done
                                  ? 'bg-teal-50 border-teal-500 text-teal-900 hover:bg-teal-100'
                                  : partial
                                    ? 'bg-amber-50 border-amber-400 text-amber-900 hover:bg-amber-100'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {q.id}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-teal-50 border border-teal-500 inline-block" />
                  Selesai dijawab
                </span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">{answeredCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-slate-50 border border-slate-300 inline-block" />
                  Belum selesai
                </span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">{unansweredCount}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setShowConfirmModal(true)}
              className="w-full h-11 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              <span>Selesai &amp; Kumpulkan</span>
            </button>
          </aside>
        </div>
      </main>

      {/* Confirmation Dialog Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-5 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h3 id="confirm-title" className="text-lg font-bold text-slate-900">
                  Kumpulkan Jawaban Sekarang?
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Pastikan seluruh soal dari Bagian A sampai Bagian E sudah diperiksa kembali.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Soal selesai dijawab</span>
                <span className="font-mono font-bold text-teal-700 tabular-nums">
                  {answeredCount} dari {QUESTIONS.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Belum selesai</span>
                <span className={`font-mono font-bold tabular-nums ${unansweredCount > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                  {unansweredCount} soal
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Sisa waktu</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {formatTimer(remainingSeconds)}
                </span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <p className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5">
                Perhatian: Masih ada {unansweredCount} soal yang belum lengkap dijawab.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                Periksa Lagi
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setShowConfirmModal(false);
                  onSubmitExam(false);
                }}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Mengirim...' : 'Ya, Kumpulkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
