import { DEFAULT_APPS_SCRIPT_URL } from '../config/appsScriptCode';
import type { StudentSubmission } from '../types/exam';

const STORAGE_URL_KEY = 'ipa7_apps_script_url';
const LOCAL_SUBMISSIONS_KEY = 'ipa7_submissions_backup';

export function getAppsScriptUrl(): string {
  try {
    const saved = localStorage.getItem(STORAGE_URL_KEY);
    if (saved && saved.trim().length > 0) {
      return saved.trim();
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_APPS_SCRIPT_URL;
}

export function setAppsScriptUrl(url: string): void {
  try {
    const trimmed = url.trim();
    if (trimmed) {
      localStorage.setItem(STORAGE_URL_KEY, trimmed);
    } else {
      localStorage.removeItem(STORAGE_URL_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

export function sortLeaderboard(items: StudentSubmission[]): StudentSubmission[] {
  return [...items].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.durationSeconds !== b.durationSeconds) return a.durationSeconds - b.durationSeconds;
    return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
  });
}

function readLocalBackup(): StudentSubmission[] {
  try {
    const raw = localStorage.getItem(LOCAL_SUBMISSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalBackup(items: StudentSubmission[]): void {
  try {
    localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(items));
  } catch {
    // ignore quota errors
  }
}

export async function testAppsScriptConnection(url: string): Promise<{ ok: boolean; message: string }> {
  const cleanUrl = url.trim();
  if (!cleanUrl || !cleanUrl.startsWith('https://script.google.com/')) {
    return {
      ok: false,
      message: 'URL harus diawali https://script.google.com/ dan berakhiran /exec',
    };
  }

  try {
    const sep = cleanUrl.includes('?') ? '&' : '?';
    const res = await fetch(`${cleanUrl}${sep}action=ping`, { method: 'GET' });
    if (!res.ok) {
      return { ok: false, message: `Server mengembalikan status ${res.status}` };
    }
    const json = await res.json();
    if (json.ok) {
      return { ok: true, message: 'Terhubung dengan Google Apps Script (Sheet: ' + (json.sheetName || 'Hasil_TryOut') + ')' };
    }
    return { ok: false, message: json.error || 'Respons script tidak valid.' };
  } catch {
    return {
      ok: false,
      message: 'Gagal menghubungi URL. Pastikan deployment Web App diset "Siapa saja" (Anyone).',
    };
  }
}

export async function fetchAllSubmissions(): Promise<{
  data: StudentSubmission[];
  source: 'google-sheets' | 'server-local';
}> {
  const appsScriptUrl = getAppsScriptUrl();

  if (appsScriptUrl) {
    try {
      const sep = appsScriptUrl.includes('?') ? '&' : '?';
      const response = await fetch(`${appsScriptUrl}${sep}action=list&t=${Date.now()}`, {
        method: 'GET',
      });
      if (response.ok) {
        const json = await response.json();
        if (json.ok && Array.isArray(json.data)) {
          const sorted = sortLeaderboard(json.data);
          saveLocalBackup(sorted);
          return { data: sorted, source: 'google-sheets' };
        }
      }
    } catch {
      // Fall back to server local endpoint if Google Sheets temporarily unreachable
    }
  }

  try {
    const res = await fetch('/api/results');
    if (res.ok) {
      const json = await res.json();
      if (json.ok && Array.isArray(json.data)) {
        const sorted = sortLeaderboard(json.data);
        saveLocalBackup(sorted);
        return { data: sorted, source: 'server-local' };
      }
    }
  } catch {
    // Fall back to localStorage backup
  }

  return { data: sortLeaderboard(readLocalBackup()), source: 'server-local' };
}

export async function submitExamResult(submission: StudentSubmission): Promise<{
  savedToSheets: boolean;
  savedToServer: boolean;
}> {
  const appsScriptUrl = getAppsScriptUrl();
  let savedToSheets = false;
  let savedToServer = false;

  // Always update local backup immediately
  const existing = readLocalBackup().filter((item) => item.id !== submission.id);
  saveLocalBackup(sortLeaderboard([submission, ...existing]));

  // Save to local Express persistence so preview leaderboard updates across tabs
  try {
    const res = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    });
    if (res.ok) {
      savedToServer = true;
    }
  } catch {
    // ignore if static deployment without backend
  }

  // Send to Google Apps Script Web App using text/plain to avoid CORS preflight OPTIONS failure
  if (appsScriptUrl) {
    try {
      const res = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(submission),
      });
      if (res.ok) {
        const json = await res.json();
        savedToSheets = Boolean(json.ok);
      }
    } catch {
      savedToSheets = false;
    }
  }

  return { savedToSheets, savedToServer };
}
