import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Check,
  Copy,
  Database,
  Download,
  Eye,
  EyeOff,
  FileText,
  Lock,
  RefreshCw,
  Search,
  Table2,
  X,
} from 'lucide-react';
import { APPS_SCRIPT_CODE, SETUP_STEPS } from '../config/appsScriptCode';
import { QUESTIONS } from '../data/questions';
import {
  fetchAllSubmissions,
  getAppsScriptUrl,
  setAppsScriptUrl,
  testAppsScriptConnection,
} from '../services/sheetsApi';
import type { ClassName, QuestionSection, StudentSubmission } from '../types/exam';
import {
  computeQuestionAnalysis,
  exportSubmissionsToCsv,
  formatDurationReadable,
  formatTimestamp,
} from '../utils/formatters';
import { InteractiveLineGraphPlotter } from './diagrams/InteractiveLineGraphPlotter';

interface AdminDashboardViewProps {
  onBackHome: () => void;
}

type AdminTab = 'nilai' | 'analisis' | 'sheets';

const TYPE_BADGE: Record<string, string> = {
  'single-choice': 'PG Tunggal',
  'multi-choice': 'PG Kompleks',
  'true-false-matrix': 'PG Kategori',
  matching: 'Menjodohkan',
  essay: 'Uraian',
};

export function AdminDashboardView({ onBackHome }: AdminDashboardViewProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<AdminTab>('nilai');
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [dataSource, setDataSource] = useState<'google-sheets' | 'server-local'>('server-local');
  const [loading, setLoading] = useState(false);

  const [classFilter, setClassFilter] = useState<'ALL' | ClassName>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [analysisSectionFilter, setAnalysisSectionFilter] = useState<'ALL' | QuestionSection>('ALL');
  const [inspectedStudent, setInspectedStudent] = useState<StudentSubmission | null>(null);

  const [scriptUrlInput, setScriptUrlInput] = useState(() => getAppsScriptUrl());
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [testingUrl, setTestingUrl] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchAllSubmissions();
    setSubmissions(res.data);
    setDataSource(res.source);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Password salah. Silakan periksa kembali password Admin Guru.');
    }
  };

  const stats = useMemo(() => {
    if (submissions.length === 0) {
      return {
        total: 0,
        avgAll: 0,
        avg7A: 0,
        avg7B: 0,
        count7A: 0,
        count7B: 0,
        highest: 0,
        lowest: 0,
      };
    }

    const total = submissions.length;
    const sumAll = submissions.reduce((acc, s) => acc + s.score, 0);
    const list7A = submissions.filter((s) => s.className === '7A');
    const list7B = submissions.filter((s) => s.className === '7B');

    const avg7A =
      list7A.length > 0 ? Math.round((list7A.reduce((a, b) => a + b.score, 0) / list7A.length) * 10) / 10 : 0;
    const avg7B =
      list7B.length > 0 ? Math.round((list7B.reduce((a, b) => a + b.score, 0) / list7B.length) * 10) / 10 : 0;
    const scores = submissions.map((s) => s.score);

    return {
      total,
      avgAll: Math.round((sumAll / total) * 10) / 10,
      avg7A,
      avg7B,
      count7A: list7A.length,
      count7B: list7B.length,
      highest: Math.max(...scores),
      lowest: Math.min(...scores),
    };
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return submissions.filter((s) => {
      const matchClass = classFilter === 'ALL' || s.className === classFilter;
      const matchName = !q || s.name.toLowerCase().includes(q);
      return matchClass && matchName;
    });
  }, [submissions, classFilter, searchQuery]);

  const itemAnalysis = useMemo(() => computeQuestionAnalysis(submissions), [submissions]);

  const filteredAnalysis = useMemo(() => {
    if (analysisSectionFilter === 'ALL') return itemAnalysis;
    return itemAnalysis.filter((item) => item.section === analysisSectionFilter);
  }, [itemAnalysis, analysisSectionFilter]);

  const hardestQuestions = useMemo(() => {
    if (submissions.length === 0) return [];
    return [...itemAnalysis].sort((a, b) => a.averageAccuracy - b.averageAccuracy).slice(0, 3);
  }, [itemAnalysis, submissions.length]);

  const handleSaveAndTestUrl = async () => {
    setAppsScriptUrl(scriptUrlInput);
    if (!scriptUrlInput.trim()) {
      setTestResult({ ok: true, message: 'URL dikosongkan. Aplikasi menggunakan server penyimpanan lokal.' });
      await loadData();
      return;
    }
    setTestingUrl(true);
    const result = await testAppsScriptConnection(scriptUrlInput);
    setTestResult(result);
    setTestingUrl(false);
    if (result.ok) {
      await loadData();
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT_CODE);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // ignore clipboard restrictions
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Admin Guru · IPA Kelas 7
            </span>
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-teal-700 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Kembali</span>
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center">
                <Lock className="w-5 h-5 text-teal-700" aria-hidden="true" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Masuk Dashboard Admin Guru</h1>
              <p className="text-sm text-slate-600">
                Masukkan password guru untuk melihat rekap nilai 45 soal, jawaban uraian siswa, analisis butir soal, dan integrasi Google Sheets.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="admin-password" className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Password Admin
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (authError) setAuthError('');
                    }}
                    placeholder="Masukkan password admin"
                    className="w-full h-11 pl-3.5 pr-11 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authError && (
                <p role="alert" className="text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                className="w-full h-11 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors cursor-pointer"
              >
                Masuk Dashboard
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Dashboard Admin Guru
            </span>
            <span className="hidden sm:inline text-slate-300" aria-hidden="true">·</span>
            <span className="hidden sm:inline text-sm text-slate-500 truncate">
              {dataSource === 'google-sheets' ? 'Terhubung Google Sheets' : 'Mode Server Lokal'}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span className="hidden sm:inline">Sinkronkan</span>
            </button>

            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Halaman Siswa</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* KPI Summary Row */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
            <p className="text-xs font-medium text-slate-500">Total Peserta</p>
            <p className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums mt-1">
              {stats.total}
            </p>
            <p className="text-xs text-slate-500 mt-1 tabular-nums">
              7A: {stats.count7A} · 7B: {stats.count7B}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
            <p className="text-xs font-medium text-slate-500">Rata-Rata Total</p>
            <p className="font-mono text-2xl sm:text-3xl font-bold text-teal-700 tabular-nums mt-1">
              {stats.avgAll}
            </p>
            <p className="text-xs text-slate-500 mt-1">Skala 0 – 100</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
            <p className="text-xs font-medium text-slate-500">Rata-Rata Kelas 7A</p>
            <p className="font-mono text-2xl sm:text-3xl font-bold text-sky-700 tabular-nums mt-1">
              {stats.avg7A}
            </p>
            <p className="text-xs text-slate-500 mt-1 tabular-nums">{stats.count7A} siswa</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
            <p className="text-xs font-medium text-slate-500">Rata-Rata Kelas 7B</p>
            <p className="font-mono text-2xl sm:text-3xl font-bold text-sky-700 tabular-nums mt-1">
              {stats.avg7B}
            </p>
            <p className="text-xs text-slate-500 mt-1 tabular-nums">{stats.count7B} siswa</p>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
            <p className="text-xs font-medium text-slate-500">Tertinggi / Terendah</p>
            <p className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums mt-1">
              {stats.highest} <span className="text-slate-400 text-lg">/</span> {stats.lowest}
            </p>
            <p className="text-xs text-slate-500 mt-1">Rentang nilai masuk</p>
          </div>
        </section>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('nilai')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'nilai' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table2 className="w-4 h-4" aria-hidden="true" />
            <span>Data Nilai Siswa</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analisis')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'analisis' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" aria-hidden="true" />
            <span>Analisis 45 Soal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sheets')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'sheets' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" aria-hidden="true" />
            <span>Integrasi Google Sheets</span>
          </button>
        </div>

        {/* Tab 1: Data Nilai Siswa */}
        {activeTab === 'nilai' && (
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative flex-1 min-w-[220px] max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama siswa..."
                    className="w-full h-10 pl-10 pr-3.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  {(['ALL', '7A', '7B'] as const).map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setClassFilter(cls)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        classFilter === cls ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cls === 'ALL' ? 'Semua' : cls}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={filteredSubmissions.length === 0}
                onClick={() => exportSubmissionsToCsv(filteredSubmissions)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                <span>Export CSV / Excel</span>
              </button>
            </div>

            {filteredSubmissions.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                {submissions.length === 0
                  ? 'Belum ada data nilai siswa yang masuk.'
                  : 'Tidak ditemukan siswa yang sesuai dengan pencarian/filter.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                      <th className="py-3.5 px-4 sm:px-6 w-14">No</th>
                      <th className="py-3.5 px-4">Nama Lengkap</th>
                      <th className="py-3.5 px-4 w-20">Kelas</th>
                      <th className="py-3.5 px-4 w-20 text-right">Skor</th>
                      <th className="py-3.5 px-4 w-28 text-right">Poin (/45)</th>
                      <th className="py-3.5 px-4 w-32 text-right">Durasi</th>
                      <th className="py-3.5 px-4 w-44 text-right">Waktu Kumpul</th>
                      <th className="py-3.5 px-4 sm:px-6 w-28 text-right">Uraian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {filteredSubmissions.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 sm:px-6 font-mono text-slate-500 tabular-nums">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{s.name}</td>
                        <td className="py-3.5 px-4 text-slate-700">{s.className}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-teal-700">
                          {s.score}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-700 tabular-nums">
                          {s.earnedPoints ?? s.correctCount} / 45
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-600 tabular-nums">
                          {formatDurationReadable(s.durationSeconds)}
                        </td>
                        <td className="py-3.5 px-4 text-right text-xs text-slate-500 tabular-nums">
                          {formatTimestamp(s.submittedAt)}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <button
                            type="button"
                            onClick={() => setInspectedStudent(s)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Detail</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Tab 2: Analisis 45 Soal */}
        {activeTab === 'analisis' && (
          <section className="space-y-6">
            {hardestQuestions.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-2">
                <h2 className="text-base font-bold text-amber-950">
                  Materi Prioritas Penguatan (3 Soal dengan Capaian Terendah)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  {hardestQuestions.map((hq) => (
                    <div key={hq.questionId} className="bg-white border border-amber-200 rounded-lg p-3.5 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="font-mono text-amber-800">
                          No. {hq.questionId} ({TYPE_BADGE[hq.type]})
                        </span>
                        <span className="font-mono text-red-700 tabular-nums">{hq.averageAccuracy}%</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800">{hq.topic}</p>
                      <p className="text-xs text-slate-600 line-clamp-2">{hq.shortTitle}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Capaian Jawaban Benar per Butir Soal (1 – 45)
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Berdasarkan {submissions.length} data pengerjaan siswa yang masuk.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  {(['ALL', 'A', 'B', 'C', 'D', 'E'] as const).map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setAnalysisSectionFilter(sec)}
                      className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        analysisSectionFilter === sec
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {sec === 'ALL' ? 'Semua' : `Bag. ${sec}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-slate-200">
                {filteredAnalysis.map((item) => {
                  const barColor =
                    item.averageAccuracy >= 75
                      ? 'bg-emerald-600'
                      : item.averageAccuracy >= 50
                        ? 'bg-sky-600'
                        : 'bg-red-600';
                  const statusLabel =
                    item.totalAttempts === 0
                      ? 'Belum ada data'
                      : item.averageAccuracy >= 75
                        ? 'Dikuasai'
                        : item.averageAccuracy >= 50
                          ? 'Cukup'
                          : 'Perlu Remedial';

                  return (
                    <div key={item.questionId} className="p-4 sm:px-6 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="font-mono font-bold text-slate-900 tabular-nums">
                              No. {item.questionId}
                            </span>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span className="font-semibold text-sky-800">{TYPE_BADGE[item.type]}</span>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span className="font-medium text-teal-800">{item.topic}</span>
                          </div>
                          <p className="text-xs text-slate-600 truncate">{item.shortTitle}</p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-semibold text-slate-600">{statusLabel}</span>
                          <span className="font-mono text-sm font-bold text-slate-900 tabular-nums w-28 text-right">
                            {item.averageAccuracy}% ({item.fullCorrectCount}/{item.totalAttempts})
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${barColor}`}
                          style={{ width: `${item.averageAccuracy}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Tab 3: Integrasi Google Sheets & Code.gs */}
        {activeTab === 'sheets' && (
          <section className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900">Hubungkan URL Web App Google Apps Script</h2>
                <p className="text-sm text-slate-600">
                  Tempelkan URL Web App yang berakhiran <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">/exec</code> agar seluruh hasil 45 soal (termasuk jawaban uraian) tersimpan otomatis di Google Sheet.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  value={scriptUrlInput}
                  onChange={(e) => setScriptUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="flex-1 h-11 px-3.5 font-mono text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
                <button
                  type="button"
                  disabled={testingUrl}
                  onClick={handleSaveAndTestUrl}
                  className="h-11 px-5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  {testingUrl ? 'Menguji Koneksi...' : 'Simpan & Uji Koneksi'}
                </button>
              </div>

              {testResult && (
                <p
                  className={`text-sm font-medium rounded-lg px-4 py-3 border ${
                    testResult.ok
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  {testResult.message}
                </p>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Panduan Setup Google Sheets &amp; Apps Script</h2>
              <div className="divide-y divide-slate-200">
                {SETUP_STEPS.map((item) => (
                  <div key={item.step} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                    <span className="font-mono text-sm font-bold text-teal-700 pt-0.5 tabular-nums">
                      {item.step}
                    </span>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Kode Backend Google Apps Script (Code.gs)</h2>
                  <p className="text-xs text-slate-500">Salin seluruh kode ini ke editor Apps Script pada Google Sheet Anda.</p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Tersalin!' : 'Salin Code.gs'}</span>
                </button>
              </div>
              <pre className="p-5 bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed max-h-[420px]">
                <code>{APPS_SCRIPT_CODE}</code>
              </pre>
            </div>
          </section>
        )}
      </main>

      {/* Modal Detail Jawaban & Uraian Siswa */}
      {inspectedStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-lg">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Detail Jawaban: {inspectedStudent.name} ({inspectedStudent.className})
                </h3>
                <p className="text-xs text-slate-500">
                  Skor: {inspectedStudent.score} · Poin: {inspectedStudent.earnedPoints ?? inspectedStudent.correctCount}/45 · Durasi: {formatDurationReadable(inspectedStudent.durationSeconds)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectedStudent(null)}
                aria-label="Tutup detail"
                className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5">
              {inspectedStudent.sectionScores && (
                <div className="grid grid-cols-5 gap-2">
                  {inspectedStudent.sectionScores.map((sec) => (
                    <div key={sec.section} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
                      <span className="text-[11px] font-semibold text-slate-500 block">Bagian {sec.section}</span>
                      <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                        {sec.earned}/{sec.max}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Jawaban Bagian E (Uraian &amp; Grafik)</h4>
                {QUESTIONS.filter((q) => q.section === 'E').map((q) => {
                  const ans = inspectedStudent.answers[q.id];
                  const essayMap =
                    ans && typeof ans === 'object' && !Array.isArray(ans)
                      ? (ans as Record<string, string>)
                      : {};
                  return (
                    <div key={q.id} className="border border-slate-200 rounded-xl p-4 space-y-3">
                      <p className="text-xs font-bold text-teal-700 font-mono">Soal {q.id}</p>
                      {(q.essayParts || []).map((part) => (
                        <div key={part.id} className="space-y-1.5 text-xs sm:text-sm">
                          <p className="font-semibold text-slate-800">
                            {part.label}. {part.prompt}
                          </p>
                          {part.inputType === 'line-graph' ? (
                            <InteractiveLineGraphPlotter
                              valueJson={essayMap[part.id] || ''}
                              onChange={() => {}}
                              readOnly
                              showExpectedOverlay
                            />
                          ) : (
                            <p className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900">
                              {essayMap[part.id] || <em className="text-slate-400">Tidak dijawab</em>}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
