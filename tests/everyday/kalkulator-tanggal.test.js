import { assert, equal, throws, test, run } from '../tools/harness.js';
import { createDateSummary, differenceDays, parseDayCount, shiftDate, trimDateInput } from '/kalkulator-tanggal/logic.js';

function waitFor(predicate, timeout = 2500) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const check = () => {
      try { if (predicate()) return resolve(); }
      catch (error) { return reject(error); }
      if (performance.now() - start > timeout) return reject(new Error('Aplikasi tidak siap dalam batas waktu.'));
      setTimeout(check, 20);
    };
    check();
  });
}
async function openApp(width = 900) {
  const frame = document.createElement('iframe');
  frame.title = 'Kalkulator tanggal untuk tes';
  frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:1000px;border:0`;
  document.body.append(frame);
  frame.src = '/kalkulator-tanggal/';
  await new Promise((resolve, reject) => {
    frame.addEventListener('load', resolve, { once: true });
    frame.addEventListener('error', () => reject(new Error('Route tool gagal dimuat.')), { once: true });
  });
  const win = frame.contentWindow;
  await waitFor(() => win.document.querySelector('#tool-status').getAttribute('aria-live') === 'polite');
  return { frame, win, doc: win.document };
}
function closeApp(app) { app.frame.remove(); }
function calculateDifference(app, start, end) {
  app.doc.querySelector('#mode-select').value = 'difference';
  app.doc.querySelector('#mode-select').dispatchEvent(new app.win.Event('change', { bubbles: true }));
  app.doc.querySelector('#start-date').value = start;
  app.doc.querySelector('#end-date').value = end;
  app.doc.querySelector('#calculate-button').click();
}
function calculateShift(app, start, count, direction = 'add') {
  app.doc.querySelector('#mode-select').value = 'shift';
  app.doc.querySelector('#mode-select').dispatchEvent(new app.win.Event('change', { bubbles: true }));
  app.doc.querySelector('#start-date').value = start;
  app.doc.querySelector('#day-count').value = count;
  app.doc.querySelector('#operation-select').value = direction;
  app.doc.querySelector('#calculate-button').click();
}
function setClipboard(win, writeText) {
  Object.defineProperty(win.navigator, 'clipboard', { configurable: true, value: { writeText } });
}

test('selisih tanggal lintas Februari kabisat adalah dua pergantian tanggal', () => {
  equal(differenceDays('2024-02-28', '2024-03-01'), 2);
  equal(differenceDays('2023-02-28', '2023-03-01'), 1);
});

test('selisih bertanda negatif dan endpoint sama mempertahankan tanda/angka', () => {
  equal(differenceDays('2024-03-01', '2024-02-28'), -2);
  equal(differenceDays('2024-10-12', '2024-10-12'), 0);
});

test('ordinal tanggal penuh mendukung urutan naik dan turun', () => {
  equal(differenceDays('0001-01-01', '9999-12-31'), 3652058);
  equal(differenceDays('9999-12-31', '0001-01-01'), -3652058);
});

test('Gregorian 1900 bukan kabisat dan 2000 adalah kabisat', () => {
  equal(differenceDays('1900-02-28', '1900-03-01'), 1);
  equal(differenceDays('2000-02-28', '2000-03-01'), 2);
});

test('jarak melewati akhir pekan tetap menghitung semua hari kalender', () => {
  equal(differenceDays('2024-03-09', '2024-03-11'), 2);
  equal(differenceDays('2024-11-02', '2024-11-04'), 2);
});

test('trim hanya disediakan untuk UI dan parser murni mensyaratkan tepat 10 karakter', () => {
  equal(trimDateInput(' \t2024-02-28\r\n'), '2024-02-28');
  equal(trimDateInput('2024- 2-28'), '2024- 2-28');
  equal(throws(() => differenceDays(' 2024-02-28', '2024-03-01'), 'INVALID_DATE').field, 'start');
});

test('tanggal invalid ditolak pada posisi awal', () => {
  for (const value of ['1900-02-29', '2024-04-31', '0000-01-01', '10000-01-01', '2024-2-01', '01/02/2024', '', '2024-01-01T00:00']) {
    equal(throws(() => differenceDays(value, '2024-03-01'), 'INVALID_DATE').field, 'start');
  }
});

test('tanggal invalid ditolak pada posisi akhir', () => {
  for (const value of ['1900-02-29', '2024-04-31', '0000-01-01', '10000-01-01', '2024-2-01', '01/02/2024', '', '2024-01-01T00:00']) {
    equal(throws(() => differenceDays('2024-02-28', value), 'INVALID_DATE').field, 'end');
  }
});

test('geser tanggal melewati Februari dan pergantian tahun', () => {
  equal(shiftDate('2024-02-28', '2', 'add'), '2024-03-01');
  equal(shiftDate('2024-03-01', '2', 'subtract'), '2024-02-28');
  equal(shiftDate('2024-12-31', '1', 'add'), '2025-01-01');
  equal(shiftDate('2025-01-01', '1', 'subtract'), '2024-12-31');
});

test('pergeseran batas kalender dan jumlah tepat maksimum', () => {
  equal(shiftDate('0001-01-01', '3652058', 'add'), '9999-12-31');
  equal(shiftDate('2023-01-31', '28', 'add'), '2023-02-28');
  equal(shiftDate('2023-01-31', '31', 'add'), '2023-03-03');
  equal(shiftDate('2024-02-29', '0', 'subtract'), '2024-02-29');
  equal(shiftDate('2024-02-29', '0000001', 'add'), '2024-03-01');
});

test('jumlah yang menggeser di luar kalender ditolak sebelum konversi', () => {
  equal(throws(() => shiftDate('9999-12-31', '1', 'add'), 'DATE_RANGE').field, 'count');
  equal(throws(() => shiftDate('0001-01-01', '1', 'subtract'), 'DATE_RANGE').field, 'count');
});

test('count memakai regex digit 1–7, menerima nol/leading zero dan menolak kode yang tepat', () => {
  equal(parseDayCount('0'), 0);
  equal(parseDayCount('0000001'), 1);
  equal(throws(() => parseDayCount('3652059'), 'DAY_COUNT_RANGE').code, 'DAY_COUNT_RANGE');
  for (const raw of ['10000000', '-1', '+1', '1,5', '1.0', '1e2', '']) equal(throws(() => parseDayCount(raw), 'INVALID_DAY_COUNT').code, 'INVALID_DAY_COUNT');
});

test('direction selain add/subtract menghasilkan INVALID_DIRECTION', () => {
  equal(throws(() => shiftDate('2024-02-28', '2', 'multiply'), 'INVALID_DIRECTION').field, 'direction');
});

test('hasil copy mengizinkan ringkasan 2 KiB dan menolak overflow', () => {
  equal(createDateSummary('a'.repeat(2048)).length, 2048);
  equal(throws(() => createDateSummary('é'.repeat(1025)), 'OUTPUT_TOO_LARGE').code, 'OUTPUT_TOO_LARGE');
});

test('route memuat metadata, FAQ, contoh statis dan noscript', async () => {
  const app = await openApp();
  try {
    equal(app.doc.title, 'Kalkulator Tanggal: Selisih dan Tambah Hari | Edwin Lab');
    equal(app.doc.documentElement.lang, 'id');
    equal(app.doc.querySelector('link[rel="canonical"]').href, 'https://edwinlab.dev/kalkulator-tanggal/');
    equal(app.doc.querySelectorAll('h1').length, 1);
    assert(app.doc.querySelector('article').textContent.includes('31 Desember 2024 + 1 hari'));
    assert(app.doc.querySelector('article').textContent.includes('bukan hitungan inklusif kedua tanggal'));
    assert(app.doc.querySelector('noscript'));
  } finally { closeApp(app); }
});

test('UI difference menampilkan dua hari pada tahun kabisat', async () => {
  const app = await openApp();
  try {
    calculateDifference(app, '2024-02-28', '2024-03-01');
    equal(app.doc.querySelector('#result-main').textContent, '2 hari');
    assert(app.doc.querySelector('#result-detail').textContent.includes('pergantian tanggal'));
    equal(app.doc.querySelector('#copy-button').disabled, false);
  } finally { closeApp(app); }
});

test('UI difference negatif memakai minus Unicode dan keterangan arah yang jelas', async () => {
  const app = await openApp();
  try {
    calculateDifference(app, '2024-03-01', '2024-02-28');
    equal(app.doc.querySelector('#result-main').textContent, '−2 hari');
    equal(app.doc.querySelector('#result-detail').textContent, 'Tanggal akhir 2 hari sebelum tanggal awal.');
    assert(app.doc.querySelector('#copy-output').value.includes('Selisih: -2 hari'));
  } finally { closeApp(app); }
});

test('UI shift menunjukkan hasil ISO dan frasa setelah tanggal awal', async () => {
  const app = await openApp();
  try {
    calculateShift(app, '2024-02-28', '2', 'add');
    equal(app.doc.querySelector('#result-main').textContent, '2024-03-01');
    equal(app.doc.querySelector('#result-detail').textContent, '2 hari setelah 2024-02-28.');
    assert(app.doc.querySelector('#copy-output').value.includes('Tanggal hasil: 2024-03-01'));
  } finally { closeApp(app); }
});

test('UI shift nol menjelaskan tanggal tidak berubah', async () => {
  const app = await openApp();
  try {
    calculateShift(app, '2024-02-29', '0', 'subtract');
    equal(app.doc.querySelector('#result-main').textContent, '2024-02-29');
    equal(app.doc.querySelector('#result-detail').textContent, 'Tanggal tidak berubah dari 2024-02-29.');
  } finally { closeApp(app); }
});

test('mode baru mempertahankan input form tetapi membuang hasil dan menukar field', async () => {
  const app = await openApp();
  try {
    calculateDifference(app, '2024-02-28', '2024-03-01');
    app.doc.querySelector('#mode-select').value = 'shift';
    app.doc.querySelector('#mode-select').dispatchEvent(new app.win.Event('change', { bubbles: true }));
    equal(app.doc.querySelector('#start-date').value, '2024-02-28');
    equal(app.doc.querySelector('#end-date').value, '2024-03-01');
    equal(app.doc.querySelector('#end-field').hidden, true);
    equal(app.doc.querySelector('#count-field').hidden, false);
    equal(app.doc.querySelector('#result-card').hidden, true);
    equal(app.doc.querySelector('#copy-button').disabled, true);
  } finally { closeApp(app); }
});

test('field mode tersembunyi tidak divalidasi', async () => {
  const app = await openApp();
  try {
    app.doc.querySelector('#end-date').value = 'invalid';
    calculateShift(app, '2024-02-28', '2', 'add');
    equal(app.doc.querySelector('#result-main').textContent, '2024-03-01');
  } finally { closeApp(app); }
});

test('contoh mengisi tanpa hitung dan mengikuti mode aktif', async () => {
  const app = await openApp();
  try {
    app.doc.querySelector('#example-button').click();
    equal(app.doc.querySelector('#start-date').value, '2024-02-28');
    equal(app.doc.querySelector('#end-date').value, '2024-03-01');
    equal(app.doc.querySelector('#result-card').hidden, true);
    app.doc.querySelector('#mode-select').value = 'shift';
    app.doc.querySelector('#mode-select').dispatchEvent(new app.win.Event('change', { bubbles: true }));
    app.doc.querySelector('#example-button').click();
    equal(app.doc.querySelector('#day-count').value, '2');
    equal(app.doc.querySelector('#operation-select').value, 'add');
    equal(app.doc.querySelector('#result-card').hidden, true);
  } finally { closeApp(app); }
});

test('clear mengosongkan nilai dan mengembalikan mode serta operasi awal', async () => {
  const app = await openApp();
  try {
    calculateShift(app, '2024-02-28', '2', 'subtract');
    app.doc.querySelector('#clear-button').click();
    equal(app.doc.querySelector('#mode-select').value, 'difference');
    equal(app.doc.querySelector('#operation-select').value, 'add');
    equal(app.doc.querySelector('#start-date').value, '');
    equal(app.doc.querySelector('#end-date').value, '');
    equal(app.doc.querySelector('#day-count').value, '');
    equal(app.doc.activeElement.id, 'start-date');
  } finally { closeApp(app); }
});

test('input dan operasi membatalkan hasil stale serta menonaktifkan copy', async () => {
  const app = await openApp();
  try {
    calculateShift(app, '2024-02-28', '2');
    app.doc.querySelector('#operation-select').value = 'subtract';
    app.doc.querySelector('#operation-select').dispatchEvent(new app.win.Event('change', { bubbles: true }));
    equal(app.doc.querySelector('#result-card').hidden, true);
    equal(app.doc.querySelector('#copy-button').disabled, true);
    assert(app.doc.querySelector('#tool-status').textContent.includes('Hitung kembali'));
  } finally { closeApp(app); }
});

test('error menjaga nilai dan memfokuskan jumlah hari yang salah', async () => {
  const app = await openApp();
  try {
    app.doc.querySelector('#mode-select').value = 'shift';
    app.doc.querySelector('#mode-select').dispatchEvent(new app.win.Event('change', { bubbles: true }));
    app.doc.querySelector('#start-date').value = '2024-02-28';
    app.doc.querySelector('#day-count').value = '-1';
    app.doc.querySelector('#calculate-button').click();
    equal(app.doc.querySelector('#day-count').value, '-1');
    equal(app.doc.activeElement.id, 'day-count');
    equal(app.doc.querySelector('#tool-status').dataset.kind, 'error');
    assert(app.doc.querySelector('#tool-status').textContent.includes('1–7 digit'));
  } finally { closeApp(app); }
});

test('copy berhasil dan fallback saat ditolak tetap menawarkan ringkasan yang bisa dipilih', async () => {
  const app = await openApp();
  try {
    let copied = '';
    setClipboard(app.win, async text => { copied = text; });
    calculateDifference(app, '2024-02-28', '2024-03-01');
    app.doc.querySelector('#copy-button').click();
    await waitFor(() => app.doc.querySelector('#tool-status').textContent.includes('berhasil disalin'));
    assert(copied.includes('2024-02-28') && copied.includes('Selisih: 2 hari'));
    setClipboard(app.win, async () => { throw new Error('denied'); });
    app.doc.querySelector('#copy-button').click();
    await waitFor(() => app.doc.querySelector('#tool-status').textContent.includes('tidak tersedia'));
    equal(app.doc.querySelector('#copy-output').readOnly, true);
    assert(app.doc.querySelector('#copy-output').value.includes('endpoint tidak dihitung'));
  } finally { closeApp(app); }
});

test('layout tidak meluap di empat lebar viewport', async () => {
  for (const width of [320, 390, 768, 1440]) {
    const app = await openApp(width);
    try {
      assert(app.doc.documentElement.scrollWidth <= width, `${width}px: ${app.doc.documentElement.scrollWidth}`);
      assert(app.doc.querySelector('#start-date').getBoundingClientRect().width > 0);
    } finally { closeApp(app); }
  }
});

await run();
