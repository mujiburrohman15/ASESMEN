import { QUESTIONS } from '../data/questions';
import type { QuestionAnalysis, StudentSubmission } from '../types/exam';
import { scoreQuestion } from './scoring';

export function formatTimer(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatDurationReadable(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  if (mins === 0) return `${secs} dtk`;
  return `${mins} mnt ${secs} dtk`;
}

export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export interface MotivationMessage {
  tierLabel: string;
  headline: string;
  message: string;
  tone: 'emerald' | 'sky' | 'amber';
}

export function getMotivationByScore(score: number, studentName: string): MotivationMessage {
  const firstName = studentName.trim().split(/\s+/)[0] || 'Sobat Sains';

  if (score >= 85) {
    return {
      tierLabel: 'Capaian Sangat Baik (≥ 85)',
      headline: `Luar biasa, ${firstName}! Penguasaan konsep IPA kamu sangat mantap.`,
      message:
        'Ketelitianmu dari soal Pilihan Ganda hingga Uraian sudah sangat kuat. Pertahankan kebiasaan belajar dan cek kembali pembahasan di bawah agar siap meraih nilai maksimal di ASAS I!',
      tone: 'emerald',
    };
  }

  if (score >= 70) {
    return {
      tierLabel: 'Capaian Baik (70–84)',
      headline: `Kerja bagus, ${firstName}! Kamu sudah berada di jalur yang tepat.`,
      message:
        'Pemahaman dasarmu terhadap materi IPA Semester 1 sudah cukup baik. Luangkan waktu untuk meninjau kembali bagian soal Kompleks, Kategori, Menjodohkan, atau Uraian yang masih kurang tepat agar skormu melesat di atas 85.',
      tone: 'sky',
    };
  }

  return {
    tierLabel: 'Terus Semangat Belajar (< 70)',
    headline: `Tetap semangat, ${firstName}! Setiap kesalahan adalah langkah awal menuju paham.`,
    message:
      'Jangan berkecil hati dengan hasil hari ini. Buka kembali ringkasan pembahasan di bawah, pelajari langkah penyelesaian soal hitungan dan grafik, lalu diskusikan dengan guru IPA atau teman belajarmu. Kamu pasti bisa meningkat!',
    tone: 'amber',
  };
}

export function computeQuestionAnalysis(submissions: StudentSubmission[]): QuestionAnalysis[] {
  return QUESTIONS.map((q) => {
    let sumAccuracy = 0;
    let fullCorrectCount = 0;
    const totalAttempts = submissions.length;

    for (const sub of submissions) {
      const pts = sub.answers ? scoreQuestion(q, sub.answers[q.id]) : 0;
      sumAccuracy += pts;
      if (pts >= 0.999) {
        fullCorrectCount += 1;
      }
    }

    const averageAccuracy = totalAttempts > 0 ? Math.round((sumAccuracy / totalAttempts) * 100) : 0;

    return {
      questionId: q.id,
      section: q.section,
      type: q.type,
      topic: q.topic,
      shortTitle: q.prompt.split('\n')[0].slice(0, 78) + (q.prompt.length > 78 ? '...' : ''),
      averageAccuracy,
      fullCorrectCount,
      totalAttempts,
    };
  });
}

export function exportSubmissionsToCsv(submissions: StudentSubmission[]): void {
  const headers = [
    'Peringkat',
    'Nama Lengkap',
    'Kelas',
    'Skor Akhir (0-100)',
    'Poin Total (/45)',
    'Soal Benar Sempurna',
    'Belum Sempurna / Salah',
    'Kosong',
    'Waktu Pengerjaan',
    'Durasi (Detik)',
    'Waktu Pengumpulan',
  ];

  const escapeCell = (val: string | number) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = submissions.map((s, idx) => [
    idx + 1,
    s.name,
    s.className,
    s.score,
    s.earnedPoints ?? s.correctCount,
    s.correctCount,
    s.wrongCount,
    s.unansweredCount,
    formatDurationReadable(s.durationSeconds),
    s.durationSeconds,
    formatTimestamp(s.submittedAt),
  ]);

  const csvContent =
    '\uFEFF' +
    [headers, ...rows]
      .map((row) => row.map(escapeCell).join(','))
      .join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const today = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.setAttribute('download', `Hasil_TryOut_ASAS1_IPA_Kelas7_45Soal_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
