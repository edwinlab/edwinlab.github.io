import { assert, equal, deepEqual, throws, test, run } from '../tools/harness.js';
import { parseDateOnly, toDayNumber, addMonthsClamped } from '/everyday/shared/calendar.js';
import { calculateAge, createAgeSummary, trimDateInput } from '/kalkulator-usia/logic.js';

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
  frame.title = 'Kalkulator usia untuk tes';
  frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:1000px;border:0`;
  document.body.append(frame);
  frame.src = '/kalkulator-usia/';
  await new Promise((resolve, reject) => {
    frame.addEventListener('load', resolve, { once: true });
    frame.addEventListener('error', () => reject(new Error('Route tool gagal dimuat.')), { once: true });
  });
  const win = frame.contentWindow;
  await waitFor(() => win.document.querySelector('#tool-status').getAttribute('aria-live') === 'polite');
  return { frame, win, doc: win.document };
}
function closeApp(app) { app.frame.remove(); }
function calculateInApp(app, birth, asOf) {
  app.doc.querySelector('#birth-date').value = birth;
  app.doc.querySelector('#as-of-date').value = asOf;
  app.doc.querySelector('#calculate-button').click();
}
function setClipboard(win, writeText) {
  Object.defineProperty(win.navigator, 'clipboard', { configurable: true, value: { writeText } });
}

test('ordinal kalender memakai titik awal dan batas yang dikontrak', () => {
  equal(toDayNumber(parseDateOnly('0001-01-01')), 0);
  equal(toDayNumber(parseDateOnly('9999-12-31')), 3652058);
  equal(toDayNumber(parseDateOnly('1900-03-01')) - toDayNumber(parseDateOnly('1900-02-28')), 1);
  equal(toDayNumber(parseDateOnly('2000-03-01')) - toDayNumber(parseDateOnly('2000-02-28')), 2);
});

test('ulang tahun ke-24 tepat menghasilkan 24 tahun dan 8766 hari', () => {
  deepEqual(calculateAge('2000-06-15', '2024-06-15'), { years: 24, months: 0, days: 0, totalDays: 8766 });
});

test('sehari sebelum ulang tahun memakai tahun penuh sebelumnya', () => {
  deepEqual(calculateAge('2000-06-15', '2024-06-14'), { years: 23, months: 11, days: 30, totalDays: 8765 });
});

test('tanggal yang sama menghasilkan seluruh nilai nol', () => {
  deepEqual(calculateAge('2024-10-12', '2024-10-12'), { years: 0, months: 0, days: 0, totalDays: 0 });
});

test('akhir Januari ke akhir Februari dijepit ke hari terakhir bulan', () => {
  deepEqual(calculateAge('2023-01-31', '2023-02-28'), { years: 0, months: 1, days: 0, totalDays: 28 });
});

test('bulan dihitung dari anchor awal, bukan langkah clamped berulang', () => {
  deepEqual(calculateAge('2023-01-31', '2023-03-30'), { years: 0, months: 1, days: 30, totalDays: 58 });
  deepEqual(addMonthsClamped(parseDateOnly('2023-01-31'), 2), { year: 2023, month: 3, day: 31 });
});

test('tahun kabisat 2024 menjepit 31 Januari ke 29 Februari', () => {
  deepEqual(calculateAge('2024-01-31', '2024-02-29'), { years: 0, months: 1, days: 0, totalDays: 29 });
});

test('ulang tahun 29 Februari jatuh pada 28 Februari di tahun nonkabisat', () => {
  deepEqual(calculateAge('2020-02-29', '2021-02-28'), { years: 1, months: 0, days: 0, totalDays: 365 });
  deepEqual(calculateAge('2020-02-29', '2021-02-27'), { years: 0, months: 11, days: 29, totalDays: 364 });
});

test('yearAnchor mengunci hasil kabisat pada 28 Februari 2024', () => {
  deepEqual(calculateAge('2020-02-29', '2024-02-28'), { years: 3, months: 11, days: 31, totalDays: 1460 });
  deepEqual(calculateAge('2020-02-29', '2024-02-29'), { years: 4, months: 0, days: 0, totalDays: 1461 });
});

test('rentang tanggal penuh tidak membentuk kandidat tahun 10000', () => {
  deepEqual(calculateAge('0001-01-01', '9999-12-31'), { years: 9998, months: 11, days: 30, totalDays: 3652058 });
});

test('acuan sebelum lahir memberi kode dan field yang benar', () => {
  const error = throws(() => calculateAge('2024-10-13', '2024-10-12'), 'AS_OF_BEFORE_BIRTH');
  equal(error.field, 'asOf');
});

test('tanggal mustahil dan format salah ditolak pada posisi lahir', () => {
  for (const raw of ['1900-02-29', '2023-02-29', '0000-01-01', '10000-01-01', '2024-2-01', '2024-02-30', '', '2024-01-01T00:00']) {
    const error = throws(() => calculateAge(raw, '2024-10-12'), 'INVALID_DATE');
    equal(error.field, 'birth');
  }
});

test('tanggal mustahil dan format salah ditolak pada posisi acuan', () => {
  for (const raw of ['1900-02-29', '2023-02-29', '0000-01-01', '10000-01-01', '2024-2-01', '2024-02-30', '', '2024-01-01T00:00']) {
    const error = throws(() => calculateAge('2000-06-15', raw), 'INVALID_DATE');
    equal(error.field, 'asOf');
  }
});

test('UI boleh memangkas whitespace ASCII tepi tetapi inti murni menuntut 10 karakter', () => {
  equal(trimDateInput(' \t2000-06-15\n'), '2000-06-15');
  equal(trimDateInput('2000- 6-15'), '2000- 6-15');
  equal(throws(() => calculateAge(' 2000-06-15', '2024-06-15'), 'INVALID_DATE').field, 'birth');
});

test('ringkasan copy memuat kedua tanggal dan hasil dengan output di bawah 2 KiB', () => {
  const age = calculateAge('2000-06-15', '2024-06-15');
  const text = createAgeSummary('2000-06-15', '2024-06-15', age);
  assert(text.includes('Tanggal lahir: 2000-06-15'));
  assert(text.includes('Tanggal acuan: 2024-06-15'));
  assert(text.includes('Usia: 24 tahun, 0 bulan, 0 hari'));
  assert(text.includes('Total: 8766 hari'));
  equal(new TextEncoder().encode(text).byteLength <= 2048, true);
});

test('route memuat canonical, title, H1, FAQ, contoh statis, dan noscript', async () => {
  const app = await openApp();
  try {
    equal(app.doc.title, 'Kalkulator Usia: Tahun, Bulan, dan Hari | Edwin Lab');
    equal(app.doc.documentElement.lang, 'id');
    equal(app.doc.querySelector('link[rel="canonical"]').href, 'https://edwinlab.dev/kalkulator-usia/');
    equal(app.doc.querySelectorAll('h1').length, 1);
    assert(app.doc.querySelector('article').textContent.includes('8766 hari'));
    assert(app.doc.querySelector('article').textContent.includes('28 Februari'));
    assert(app.doc.querySelector('noscript'));
  } finally { closeApp(app); }
});

test('load mengosongkan lahir dan mengisi acuan dengan tanggal lokal hari ini saja', async () => {
  const app = await openApp();
  try {
    const now = new Date();
    const expected = `${String(now.getFullYear()).padStart(4, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    equal(app.doc.querySelector('#birth-date').value, '');
    equal(app.doc.querySelector('#as-of-date').value, expected);
    equal(app.doc.querySelector('#result-card').hidden, true);
  } finally { closeApp(app); }
});

test('UI menampilkan usia utama dan total hari pada contoh', async () => {
  const app = await openApp();
  try {
    calculateInApp(app, '2000-06-15', '2024-06-15');
    equal(app.doc.querySelector('#age-main').textContent, '24 tahun, 0 bulan, 0 hari');
    equal(app.doc.querySelector('#age-total').textContent, 'Total: 8766 hari');
    equal(app.doc.querySelector('#copy-button').disabled, false);
  } finally { closeApp(app); }
});

test('hari ini mengisi tanggal lokal, tidak otomatis menghitung, dan membatalkan hasil lama', async () => {
  const app = await openApp();
  try {
    calculateInApp(app, '2000-06-15', '2024-06-15');
    app.doc.querySelector('#today-button').click();
    equal(app.doc.querySelector('#result-card').hidden, true);
    equal(app.doc.querySelector('#copy-button').disabled, true);
    const today = app.doc.querySelector('#as-of-date').value;
    assert(/^\d{4}-\d{2}-\d{2}$/.test(today));
    equal(app.doc.activeElement.id, 'as-of-date');
  } finally { closeApp(app); }
});

test('contoh mengisi tanpa menghitung; clear mengosongkan kedua tanggal dan memfokuskan lahir', async () => {
  const app = await openApp();
  try {
    app.doc.querySelector('#example-button').click();
    equal(app.doc.querySelector('#birth-date').value, '2000-06-15');
    equal(app.doc.querySelector('#as-of-date').value, '2024-06-15');
    equal(app.doc.querySelector('#result-card').hidden, true);
    app.doc.querySelector('#calculate-button').click();
    app.doc.querySelector('#clear-button').click();
    equal(app.doc.querySelector('#birth-date').value, '');
    equal(app.doc.querySelector('#as-of-date').value, '');
    equal(app.doc.querySelector('#copy-button').disabled, true);
    equal(app.doc.activeElement.id, 'birth-date');
  } finally { closeApp(app); }
});

test('edit tanggal membatalkan output lama dan copy', async () => {
  const app = await openApp();
  try {
    calculateInApp(app, '2000-06-15', '2024-06-15');
    app.doc.querySelector('#birth-date').value = '2000-06-16';
    app.doc.querySelector('#birth-date').dispatchEvent(new app.win.Event('input', { bubbles: true }));
    equal(app.doc.querySelector('#result-card').hidden, true);
    equal(app.doc.querySelector('#copy-button').disabled, true);
    assert(app.doc.querySelector('#tool-status').textContent.includes('Hitung kembali'));
  } finally { closeApp(app); }
});

test('error mempertahankan nilai, memberi pesan spesifik, dan fokus ke field bermasalah', async () => {
  const app = await openApp();
  try {
    calculateInApp(app, '2024-10-13', '2024-10-12');
    equal(app.doc.querySelector('#birth-date').value, '2024-10-13');
    equal(app.doc.querySelector('#as-of-date').value, '2024-10-12');
    equal(app.doc.activeElement.id, 'as-of-date');
    assert(app.doc.querySelector('#tool-status').textContent.includes('harus sama dengan atau setelah'));
    equal(app.doc.querySelector('#result-card').hidden, true);
  } finally { closeApp(app); }
});

test('copy berhasil memakai clipboard sesudah klik dan menyertakan input serta hasil', async () => {
  const app = await openApp();
  try {
    let copied = '';
    setClipboard(app.win, async text => { copied = text; });
    calculateInApp(app, '2000-06-15', '2024-06-15');
    app.doc.querySelector('#copy-button').click();
    await waitFor(() => app.doc.querySelector('#tool-status').textContent.includes('berhasil disalin'));
    assert(copied.includes('Tanggal lahir: 2000-06-15'));
    assert(copied.includes('Usia: 24 tahun, 0 bulan, 0 hari'));
  } finally { closeApp(app); }
});

test('copy ditolak memberi fallback manual dan ringkasan tetap selectable/read-only', async () => {
  const app = await openApp();
  try {
    setClipboard(app.win, async () => { throw new Error('denied'); });
    calculateInApp(app, '2000-06-15', '2024-06-15');
    app.doc.querySelector('#copy-button').click();
    await waitFor(() => app.doc.querySelector('#tool-status').textContent.includes('tidak tersedia'));
    equal(app.doc.querySelector('#copy-output').readOnly, true);
    assert(app.doc.querySelector('#copy-output').value.includes('8766 hari'));
  } finally { closeApp(app); }
});

test('layout tidak meluap pada empat lebar viewport', async () => {
  for (const width of [320, 390, 768, 1440]) {
    const app = await openApp(width);
    try {
      assert(app.doc.documentElement.scrollWidth <= width, `${width}px: ${app.doc.documentElement.scrollWidth}`);
      assert(app.doc.querySelector('#birth-date').getBoundingClientRect().width > 0);
    } finally { closeApp(app); }
  }
});

await run();
