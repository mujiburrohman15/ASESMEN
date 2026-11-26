/**
 * Google Apps Script Backend untuk Try Out ASAS I Mapel IPA Kelas 7 (Paket A - 45 Soal)
 * Fungsi:
 *  - doPost(e): Menyimpan skor total, poin per bagian (A-E), serta seluruh jawaban siswa (termasuk Uraian & Grafik) ke Google Sheet
 *  - doGet(e): Mengambil seluruh data hasil siswa untuk Papan Peringkat Realtime & Dashboard Admin
 */

const SHEET_NAME = 'Hasil_TryOut';

const HEADERS = [
  'ID',
  'Timestamp',
  'Nama Lengkap',
  'Kelas',
  'Skor (0-100)',
  'Poin (/45)',
  'Benar Sempurna',
  'Salah / Sebagian',
  'Kosong',
  'Durasi (Detik)',
  'Auto Submit',
  'Skor Bagian JSON',
  'Jawaban Lengkap JSON'
];

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#0D9488').setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#0D9488').setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function createJsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'list';
    const sheet = getOrCreateSheet();
    const lastRow = sheet.getLastRow();

    if (action === 'ping') {
      return createJsonResponse({ ok: true, message: 'Google Apps Script aktif', sheetName: SHEET_NAME });
    }

    if (lastRow <= 1) {
      return createJsonResponse({ ok: true, data: [] });
    }

    const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
    const records = values
      .filter(function(row) {
        return row[0] !== '' && row[2] !== '';
      })
      .map(function(row) {
        let parsedSectionScores = undefined;
        let parsedAnswers = {};
        try {
          parsedSectionScores = row[11] ? JSON.parse(row[11]) : undefined;
        } catch (err) {
          parsedSectionScores = undefined;
        }
        try {
          parsedAnswers = row[12] ? JSON.parse(row[12]) : {};
        } catch (err) {
          parsedAnswers = {};
        }

        return {
          id: String(row[0]),
          submittedAt: row[1] instanceof Date ? row[1].toISOString() : String(row[1]),
          name: String(row[2]),
          className: String(row[3]),
          score: Number(row[4]) || 0,
          earnedPoints: Number(row[5]) || 0,
          totalQuestions: 45,
          correctCount: Number(row[6]) || 0,
          wrongCount: Number(row[7]) || 0,
          unansweredCount: Number(row[8]) || 0,
          durationSeconds: Number(row[9]) || 0,
          autoSubmitted: String(row[10]).toUpperCase() === 'YA' || row[10] === true,
          sectionScores: parsedSectionScores,
          answers: parsedAnswers
        };
      });

    return createJsonResponse({ ok: true, data: records });
  } catch (error) {
    return createJsonResponse({ ok: false, error: error.message });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);

    const rawBody = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    const payload = JSON.parse(rawBody);
    const sheet = getOrCreateSheet();

    const id = payload.id || Utilities.getUuid();
    const submittedAt = payload.submittedAt || new Date().toISOString();
    const name = String(payload.name || '').trim();
    const className = String(payload.className || '').trim();
    const score = Number(payload.score) || 0;
    const earnedPoints = Number(payload.earnedPoints) || 0;
    const correctCount = Number(payload.correctCount) || 0;
    const wrongCount = Number(payload.wrongCount) || 0;
    const unansweredCount = Number(payload.unansweredCount) || 0;
    const durationSeconds = Number(payload.durationSeconds) || 0;
    const autoSubmitted = payload.autoSubmitted ? 'YA' : 'TIDAK';
    const sectionScoresJson = JSON.stringify(payload.sectionScores || []);
    const answersJson = JSON.stringify(payload.answers || {});

    if (!name || !className) {
      return createJsonResponse({ ok: false, error: 'Nama lengkap dan kelas wajib diisi.' });
    }

    sheet.appendRow([
      id,
      submittedAt,
      name,
      className,
      score,
      earnedPoints,
      correctCount,
      wrongCount,
      unansweredCount,
      durationSeconds,
      autoSubmitted,
      sectionScoresJson,
      answersJson
    ]);

    return createJsonResponse({
      ok: true,
      message: 'Hasil berhasil disimpan ke Google Sheets',
      id: id
    });
  } catch (error) {
    return createJsonResponse({ ok: false, error: error.message });
  } finally {
    lock.releaseLock();
  }
}
