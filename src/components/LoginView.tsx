import { useState, type FormEvent } from 'react';
import { ArrowRight, BookOpen, Clock, ShieldCheck, Trophy } from 'lucide-react';
import type { ClassName, StudentSession } from '../types/exam';

interface LoginViewProps {
  existingSession: StudentSession | null;
  onStartExam: (name: string, className: ClassName) => void;
  onResumeExam: () => void;
  onDiscardSession: () => void;
  onOpenAdmin: () => void;
  onOpenLeaderboardPreview: () => void;
}

const SECTIONS_OVERVIEW = [
  {
    code: 'A',
    title: 'Bagian A · Pilihan Ganda (Soal 1–19)',
    desc: '19 soal memilih satu jawaban paling benar (A, B, C, atau D).',
  },
  {
    code: 'B',
    title: 'Bagian B · Pilihan Ganda Kompleks (Soal 20–29)',
    desc: '10 soal memilih 2 atau 3 pernyataan yang benar menggunakan kotak centang.',
  },
  {
    code: 'C',
    title: 'Bagian C · Pilihan Ganda Kategori (Soal 30–34)',
    desc: '5 soal menentukan kategori Benar atau Salah untuk masing-masing pernyataan.',
  },
  {
    code: 'D',
    title: 'Bagian D · Menjodohkan (Soal 35–41)',
    desc: '7 soal memasangkan gambar atau deskripsi sebelah kiri dengan pilihan jawaban di sebelah kanan.',
  },
  {
    code: 'E',
    title: 'Bagian E · Uraian & Grafik (Soal 42–45)',
    desc: '4 soal uraian terstruktur mencakup analisis percobaan, pemplotan grafik garis, dan hitungan.',
  },
];

export function LoginView({
  existingSession,
  onStartExam,
  onResumeExam,
  onDiscardSession,
  onOpenAdmin,
  onOpenLeaderboardPreview,
}: LoginViewProps) {
  const [name, setName] = useState('');
  const [className, setClassName] = useState<ClassName>('7A');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError('Mohon masukkan nama lengkap terlebih dahulu (minimal 2 huruf).');
      return;
    }
    setError('');
    onStartExam(trimmed, className);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#beranda"
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            Try Out ASAS I IPA
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#susunan-soal" className="hover:text-teal-700 transition-colors whitespace-nowrap shrink-0">
              Susunan Soal
            </a>
            <a href="#ketentuan" className="hover:text-teal-700 transition-colors whitespace-nowrap shrink-0">
              Ketentuan Ujian
            </a>
            <button
              type="button"
              onClick={onOpenLeaderboardPreview}
              className="hover:text-teal-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Papan Peringkat
            </button>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-teal-700" aria-hidden="true" />
              <span>Admin Guru</span>
            </button>
          </div>
        </div>
      </header>

      <main id="beranda" className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-medium text-teal-700">
                Asesmen IPA Kelas VII · Paket A · Semester 1
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight [text-wrap:balance]">
                Try Out ASAS I Mapel IPA Kelas 7
              </h1>
              <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
                Uji pemahaman seluruh materi IPA Semester 1 menggunakan paket lengkap 45 butir soal (Pilihan Ganda, Kompleks, Kategori Benar/Salah, Menjodohkan, dan Uraian).
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 border-t border-slate-200">
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                  <BookOpen className="w-4 h-4 text-teal-700" aria-hidden="true" />
                  45 Butir Soal (Bagian A–E)
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                  <Clock className="w-4 h-4 text-sky-700" aria-hidden="true" />
                  Durasi Maksimal 100 Menit
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                  <Trophy className="w-4 h-4 text-amber-600" aria-hidden="true" />
                  Peringkat Realtime
                </span>
              </div>
            </div>

            <section id="susunan-soal" className="space-y-4 pt-2">
              <h2 className="text-lg font-bold text-slate-900">Struktur Soal Paket A (45 Butir)</h2>
              <div className="divide-y divide-slate-200 bg-white border border-slate-200 rounded-xl">
                {SECTIONS_OVERVIEW.map((item) => (
                  <div key={item.code} className="p-4 sm:px-5 flex items-start gap-4">
                    <span className="font-mono text-sm font-bold text-teal-700 pt-0.5 tabular-nums w-5">
                      {item.code}
                    </span>
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 space-y-5">
            {existingSession && (
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-5 space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-sky-900">
                    Sesi ujian aktif ditemukan
                  </p>
                  <p className="text-sm text-sky-800">
                    <span className="font-semibold">{existingSession.name}</span> ({existingSession.className}) sedang mengerjakan soal. Lanjutkan pengerjaan atau mulai baru.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={onResumeExam}
                    className="px-4 py-2 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Lanjutkan Ujian
                  </button>
                  <button
                    type="button"
                    onClick={onDiscardSession}
                    className="px-4 py-2 text-sm font-medium text-sky-900 bg-white border border-sky-300 hover:bg-sky-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Mulai Ulang
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-xs">
              <div className="space-y-1.5 mb-6">
                <h2 className="text-xl font-bold text-slate-900">Identitas Peserta</h2>
                <p className="text-sm text-slate-600">
                  Masukkan nama lengkap dan pilih kelasmu tanpa perlu password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label htmlFor="student-name" className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Nama Lengkap
                  </label>
                  <input
                    id="student-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Contoh: Ahmad Fauzan"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-shadow"
                  />
                </div>

                <div>
                  <label htmlFor="student-class" className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Kelas
                  </label>
                  <select
                    id="student-class"
                    value={className}
                    onChange={(e) => setClassName(e.target.value as ClassName)}
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-shadow"
                  >
                    <option value="7A">Kelas 7A</option>
                    <option value="7B">Kelas 7B</option>
                  </select>
                </div>

                {error && (
                  <p role="alert" className="text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full h-12 inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white bg-teal-600 hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-600 rounded-lg transition-colors cursor-pointer"
                >
                  <span>Mulai Mengerjakan</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </form>

              <div id="ketentuan" className="mt-6 pt-5 border-t border-slate-200 space-y-2 text-xs text-slate-600 leading-relaxed">
                <p className="font-semibold text-slate-800 text-sm">Petunjuk Pengerjaan</p>
                <ul className="space-y-1.5 list-disc pl-4">
                  <li>Waktu hitung mundur 100 menit berjalan otomatis setelah memulai.</li>
                  <li>Kerjakan soal mulai dari bagian yang dianggap mudah melalui panel navigasi.</li>
                  <li>Kamu dapat menekan Selesai &amp; Kumpulkan kapan saja sebelum waktu habis.</li>
                  <li>Jika waktu habis, seluruh jawaban otomatis terkirim dan skor langsung muncul.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Try Out ASAS I Mapel IPA Kelas 7 · Paket A (45 Butir Soal)</span>
          <button
            type="button"
            onClick={onOpenLeaderboardPreview}
            className="text-teal-700 hover:underline font-medium cursor-pointer"
          >
            Lihat Papan Peringkat Realtime
          </button>
        </div>
      </footer>
    </div>
  );
}
