import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { StudentSubmission } from './src/types/exam.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'results.json');
const PORT = 3000;

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readSubmissions(): StudentSubmission[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSubmissions(items: StudentSubmission[]): void {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/results', (_req, res) => {
    const items = readSubmissions();
    res.json({ ok: true, data: items });
  });

  app.post('/api/results', (req, res) => {
    const body = req.body as Partial<StudentSubmission>;
    if (!body || !body.id || !body.name || !body.className) {
      res.status(400).json({ ok: false, error: 'Data pengiriman tidak lengkap.' });
      return;
    }

    const items = readSubmissions().filter((item) => item.id !== body.id);
    const nextItem: StudentSubmission = {
      id: String(body.id),
      name: String(body.name).trim(),
      className: body.className === '7B' ? '7B' : '7A',
      score: Number(body.score) || 0,
      earnedPoints: Number(body.earnedPoints) || 0,
      totalQuestions: Number(body.totalQuestions) || 45,
      correctCount: Number(body.correctCount) || 0,
      wrongCount: Number(body.wrongCount) || 0,
      unansweredCount: Number(body.unansweredCount) || 0,
      sectionScores: Array.isArray(body.sectionScores) ? body.sectionScores : undefined,
      durationSeconds: Number(body.durationSeconds) || 0,
      answers: body.answers || {},
      submittedAt: body.submittedAt || new Date().toISOString(),
      autoSubmitted: Boolean(body.autoSubmitted),
    };

    items.push(nextItem);
    writeSubmissions(items);
    res.json({ ok: true, data: nextItem });
  });

  app.delete('/api/results', (_req, res) => {
    writeSubmissions([]);
    res.json({ ok: true });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
