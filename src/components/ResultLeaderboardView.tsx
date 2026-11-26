import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trophy,
  XCircle,
} from 'lucide-react';
import { QUESTIONS } from '../data/questions';
import { fetchAllSubmissions } from '../services/sheetsApi';
import type { AnswerValue, ClassName, OptionKey, Question, StudentSubmission } from '../types/exam';
import {
  formatDurationReadable,
  formatTimestamp,
  getMotivationByScore,
} from '../utils/formatters';
import { scoreQuestion } from '../utils/scoring';
import { InteractiveLineGraphPlotter } from './diagrams/InteractiveLineGraphPlotter';

interface ResultLeaderboardViewProps {
  currentSubmission: StudentSubmission | null;
  syncNote: string | null;
  onBackHome: () => void;
  onOpenAdmin: () => void;
}

function formatStudentAnswerSummary(q: Question, ans: AnswerValue | undefined): string {
  if (!ans) return 'Tidak dijawab';

  switch (q.type) {
    case 'single-choice': {
      const key = ans as OptionKey;
      const opt = q.options?.find((o) => o.key === key);
      return opt ? `${key}. ${opt.text}` : String(key);
    }
    case 'multi-choice': {
      const arr = Array.isArray(ans) ? (ans as OptionKey[]) : [];
      return arr.length ? arr.join(', ') : 'Tidak ada pilihan';
    }
    case 'true-false-matrix': {
      const map = ans as Record<number, 'Benar' | 'Salah'>;
      return (q.statements || [])
        .map((st) => `(${st.id}) ${map[st.id] || '-'}`)
        .join(' · ');
    }
    case 'matching': {
      const map = ans as Record<number, OptionKey>;
      return (q.matchingPrompts || [])
        .map((p) => `(${p.id}) ${map[p.id] || '-'}`)
        .join(' · ');
    }
    case 'essay':
      return 'Lihat rincian uraian di bawah';
  }
}

function formatExpectedAnswerSummary(q: Question): string {
  switch (q.type) {
    case 'single-choice': {
      const opt = q.options?.find((o) => o.key === q.correctAnswer);
      return opt ? `${q.correctAnswer}. ${opt.text}` : String(q.correctAnswer);
    }
    case 'multi-choice':
      return (q.correctAnswers || []).join(', ');
    case 'true-false-matrix':
      return (q.statements || []).map((st) => `(${st.id}) ${st.correct}`).join(' · ');
    case 'matching':
      return (q.matchingPrompts || []).map((p) => `(${p.id}) ${p.correctKey}`).join(' · ');
    case 'essay':
      return 'Lihat pedoman jawaban di bawah';
  }
}

export function ResultLeaderboardView({
  currentSubmission,
  syncNote,
  onBackHome,
  onOpenAdmin,
}: ResultLeaderboardViewProps) {
  const [leaderboard, setLeaderboard] = useState<StudentSubmission[]>([]);
  const [dataSource, setDataSource] = useState<'google-sheets' | 'server-local'>('server-local');
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState<'ALL' | ClassName>('ALL');
  const [showReview, setShowReview] = useState(false);

  const loadLeaderboard = async () => {
    setLoading(true);
    const result = await fetchAllSubmissions();
    setLeaderboard(result.data);
    setDataSource(result.source);
    setLoading(false);
  };

  useEffect(() => {
    loadLeaderboard();
    const interval = window.setInterval(() => {
      fetchAllSubmissions().then((res) => {
        setLeaderboard(res.data);
        setDataSource(res.source);
      });
    }, 10000);
    return () => window.clearInterval(interval);
  }, []);

  const filteredLeaderboard =
    classFilter === 'ALL'
      ? leaderboard
      : leaderboard.filter((entry) => entry.className === classFilter);

  const currentRank = currentSubmission
    ? leaderboard.findIndex((item) => item.id === currentSubmission.id) + 1
    : 0;

  const motivation = currentSubmission
    ? getMotivationByScore(currentSubmission.score, currentSubmission.name)
    : null;

  const toneClasses = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-950',
    sky: 'bg-sky-50 border-sky-200 text-sky-950',
    amber: 'bg-amber-50 border-amber-200 text-amber-950',
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            Try Out ASAS I IPA
          </span>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {currentSubmission && (
              <a href="#hasil-saya" className="hover:text-teal-700 transition-colors whitespace-nowrap shrink-0">
                Hasil Saya
              </a>
            )}
            <a href="#peringkat" className="hover:text-teal-700 transition-colors whitespace-nowrap shrink-0">
              Papan Peringkat
            </a>
            {currentSubmission && (
              <a href="#pembahasan" className="hover:text-teal-700 transition-colors whitespace-nowrap shrink-0">
                Pembahasan
              </a>
            )}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-teal-700" aria-hidden="true" />
              <span>Admin Guru</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-teal-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Kembali ke Halaman Utama</span>
          </button>

          <span className="text-xs text-slate-500">
            Sumber data: {dataSource === 'google-sheets' ? 'Google Sheets Realtime' : 'Penyimpanan Server Lokal'}
            {syncNote ? ` · ${syncNote}` : ''}
          </span>
        </div>

        {/* Score Summary & Motivation */}
        {currentSubmission && motivation && (
          <section id="hasil-saya" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">
                    Hasil Ujian · {currentSubmission.name} · Kelas {currentSubmission.className}
                  </p>
                  <div className="flex items-baseline gap-3 pt-2">
                    <span className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-teal-700 tabular-nums">
                      {currentSubmission.score}
                    </span>
                    <span className="text-base font-medium text-slate-500">/ 100</span>
                  </div>
                  {currentRank > 0 && (
                    <p className="text-sm font-semibold text-sky-700 pt-1">
                      Peringkat ke-{currentRank} dari {leaderboard.length} peserta
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200">
                  <div>
                    <p className="text-xs text-slate-500">Benar Penuh</p>
                    <p className="font-mono text-xl font-bold text-emerald-700 tabular-nums">
                      {currentSubmission.correctCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Salah / Sebagian</p>
                    <p className="font-mono text-xl font-bold text-red-700 tabular-nums">
                      {currentSubmission.wrongCount + currentSubmission.unansweredCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Waktu</p>
                    <p className="font-mono text-base font-bold text-slate-900 tabular-nums pt-1">
                      {formatDurationReadable(currentSubmission.durationSeconds)}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`lg:col-span-7 border rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-4 ${toneClasses[motivation.tone]}`}>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{motivation.tierLabel}</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold leading-snug [text-wrap:balance]">
                    {motivation.headline}
                  </h1>
                  <p className="text-sm sm:text-base leading-relaxed opacity-90">
                    {motivation.message}
                  </p>
                </div>

                {currentSubmission.autoSubmitted && (
                  <p className="text-xs font-medium pt-3 border-t border-current/15">
                    Catatan: Waktu 100 menit telah berakhir sehingga jawaban dikirimkan otomatis oleh sistem.
                  </p>
                )}
              </div>
            </div>

            {/* Section A-E Score Breakdown */}
            {currentSubmission.sectionScores && currentSubmission.sectionScores.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {currentSubmission.sectionScores.map((sec) => {
                  const labels: Record<string, string> = {
                    A: 'Bagian A (PG)',
                    B: 'Bagian B (Kompleks)',
                    C: 'Bagian C (Kategori)',
                    D: 'Bagian D (Jodohkan)',
                    E: 'Bagian E (Uraian)',
                  };
                  return (
                    <div key={sec.section} className="bg-white border border-slate-200 rounded-xl p-4">
                      <p className="text-xs font-medium text-slate-500">{labels[sec.section]}</p>
                      <p className="font-mono text-lg font-bold text-slate-900 tabular-nums mt-1">
                        {sec.earned} <span className="text-xs font-normal text-slate-400">/ {sec.max}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Realtime Leaderboard */}
        <section id="peringkat" className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-600" aria-hidden="true" />
                <h2 className="text-xl font-bold text-slate-900">Papan Peringkat Realtime</h2>
              </div>
              <p className="text-sm text-slate-600">
                Diurutkan berdasarkan skor tertinggi dan waktu pengerjaan tercepat.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {(['ALL', '7A', '7B'] as const).map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setClassFilter(cls)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      classFilter === cls
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cls === 'ALL' ? 'Semua Kelas' : `Kelas ${cls}`}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={loadLeaderboard}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
                <span>Perbarui</span>
              </button>
            </div>
          </div>

          {loading && leaderboard.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Memuat papan peringkat...
            </div>
          ) : filteredLeaderboard.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Belum ada peserta yang mengumpulkan hasil pada filter ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                    <th className="py-3.5 px-4 sm:px-6 w-20">Peringkat</th>
                    <th className="py-3.5 px-4">Nama Lengkap</th>
                    <th className="py-3.5 px-4 w-24">Kelas</th>
                    <th className="py-3.5 px-4 w-24 text-right">Skor</th>
                    <th className="py-3.5 px-4 sm:px-6 w-40 text-right">Waktu Pengerjaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {filteredLeaderboard.map((item, idx) => {
                    const isSelf = currentSubmission?.id === item.id;
                    const rank = idx + 1;
                    return (
                      <tr
                        key={item.id}
                        className={isSelf ? 'bg-teal-50 font-semibold' : 'hover:bg-slate-50'}
                      >
                        <td className="py-3.5 px-4 sm:px-6 font-mono font-bold tabular-nums text-slate-900">
                          #{rank}
                        </td>
                        <td className="py-3.5 px-4 text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{item.name}</span>
                            {isSelf && (
                              <span className="text-xs font-bold text-teal-800">(Anda)</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">{item.className}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-teal-700">
                          {item.score}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right font-mono text-slate-600 tabular-nums">
                          <span className="inline-flex items-center justify-end gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                            {formatDurationReadable(item.durationSeconds)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Answer Key & Explanation Toggle (All 45 Questions) */}
        {currentSubmission && (
          <section id="pembahasan" className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowReview((prev) => !prev)}
              className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900">Tinjauan Jawaban &amp; Pembahasan (45 Soal)</h2>
                <p className="text-sm text-slate-600">
                  Pelajari kunci jawaban, pedoman uraian, dan penjelasan setiap nomor dari Bagian A sampai E.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 shrink-0">
                <span>{showReview ? 'Tutup' : 'Buka Pembahasan'}</span>
                {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>

            {showReview && (
              <div className="border-t border-slate-200 divide-y divide-slate-200">
                {QUESTIONS.map((q) => {
                  const chosen = currentSubmission.answers[q.id];
                  const earned = scoreQuestion(q, chosen);
                  const isFullCorrect = earned >= 0.999;
                  const isPartial = earned > 0 && earned < 0.999;

                  return (
                    <div key={q.id} className="p-5 sm:p-6 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-slate-500">
                          Soal {q.id} · {q.sectionTitle} · {q.topic}
                        </span>
                        {isFullCorrect ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                            <span>Benar Sempurna (1,0)</span>
                          </span>
                        ) : isPartial ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 font-mono">
                            <span>Sebagian Benar ({Math.round(earned * 100)}%)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700">
                            <XCircle className="w-4 h-4" aria-hidden="true" />
                            <span>Perlu Diperbaiki (0)</span>
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-medium text-slate-900 whitespace-pre-line">{q.prompt}</p>

                      {q.type !== 'essay' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <span className="text-slate-500 block mb-0.5">Jawabanmu:</span>
                            <span className="font-semibold text-slate-900">
                              {formatStudentAnswerSummary(q, chosen)}
                            </span>
                          </div>
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                            <span className="text-emerald-800 block mb-0.5">Kunci Jawaban:</span>
                            <span className="font-semibold text-emerald-950">
                              {formatExpectedAnswerSummary(q)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {(q.essayParts || []).map((part) => {
                            const essayMap =
                              chosen && typeof chosen === 'object' && !Array.isArray(chosen)
                                ? (chosen as Record<string, string>)
                                : {};
                            const val = essayMap[part.id] || '';
                            return (
                              <div key={part.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2 text-xs sm:text-sm">
                                <p className="font-semibold text-slate-900">
                                  {part.label}. {part.prompt}
                                </p>
                                {part.inputType === 'line-graph' ? (
                                  <InteractiveLineGraphPlotter
                                    valueJson={val}
                                    onChange={() => {}}
                                    readOnly
                                    showExpectedOverlay
                                  />
                                ) : (
                                  <p className="text-slate-800">
                                    <span className="text-slate-500">Jawabanmu: </span>
                                    {val || <em className="text-slate-400">Tidak dijawab</em>}
                                  </p>
                                )}
                                <p className="text-emerald-900 bg-emerald-50 border border-emerald-200 rounded p-2">
                                  <span className="font-semibold">Pedoman Jawaban: </span>
                                  {part.sampleAnswer}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-3">
                        <span className="font-semibold text-slate-800">Pembahasan: </span>
                        {q.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {currentSubmission && (
          <p className="text-xs text-slate-400 text-center">
            Dikirim pada {formatTimestamp(currentSubmission.submittedAt)}
          </p>
        )}
      </main>
    </div>
  );
}
