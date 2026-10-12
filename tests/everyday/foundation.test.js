import { test, assert, equal, deepEqual, throws, run } from '../tools/harness.js';
import { copyTextId, downloadBlob } from '../../everyday/shared/ui.js';
import { parseDecimal, roundRatio, formatRatio } from '../../everyday/shared/number.js';
import { parseDateOnly, daysInMonth, toDayNumber, fromDayNumber, addMonthsClamped } from '../../everyday/shared/calendar.js';

async function rejects(fn, code) {
  try { await fn(); } catch (error) { equal(error.code, code); return error; }
  throw new Error(`Seharusnya gagal dengan kode ${code}`);
}
const status = () => document.createElement('p');
const dateText = date => `${String(date.year).padStart(4, '0')}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;

test('parseDecimal menjaga koefisien dan skala serta memangkas whitespace ASCII tepi', () => {
  deepEqual(parseDecimal('-12,50'), { coefficient: -1250n, scale: 2 });
  deepEqual(parseDecimal('0.125'), { coefficient: 125n, scale: 3 });
  deepEqual(parseDecimal(' \t12\r\n'), { coefficient: 12n, scale: 0 });
  deepEqual(parseDecimal('-0'), { coefficient: 0n, scale: 0 });
});
test('parseDecimal menolak format ambigu, notasi eksponen, kosong, dan digit non-ASCII', () => {
  for (const value of ['1.000,50', '1,000.50', '1e3', '+3', '.5', '2.', '', '١٢', '１２']) throws(() => parseDecimal(value), 'INVALID_NUMBER');
});
test('parseDecimal memakai batas digit dan input yang tercantum pada kontrak', () => {
  deepEqual(parseDecimal('999', { maxIntegerDigits: 3 }), { coefficient: 999n, scale: 0 });
  throws(() => parseDecimal('1000', { maxIntegerDigits: 3 }), 'NUMBER_PRECISION');
  deepEqual(parseDecimal('0,123', { maxFractionDigits: 3 }), { coefficient: 123n, scale: 3 });
  throws(() => parseDecimal('0,1234', { maxFractionDigits: 3 }), 'NUMBER_PRECISION');
  throws(() => parseDecimal('-1', { allowNegative: false }), 'INVALID_NUMBER');
  throws(() => parseDecimal('1'.repeat(65)), 'INPUT_TOO_LARGE');
});
test('parseDecimal memvalidasi opsi digit', () => {
  for (const options of [{ maxIntegerDigits: 0 }, { maxIntegerDigits: 25 }, { maxFractionDigits: -1 }, { maxFractionDigits: 25 }, { allowNegative: 1 }]) throws(() => parseDecimal('1', options), 'INVALID_NUMBER');
  throws(() => parseDecimal('1', null), 'INVALID_NUMBER');
});
test('roundRatio membulatkan half away from zero dan menormalkan penyebut negatif', () => {
  equal(roundRatio(1n, 8n, 2), 13n);
  equal(roundRatio(-1n, 8n, 2), -13n);
  equal(roundRatio(1n, -8n, 2), -13n);
  equal(roundRatio(-1n, -8n, 2), 13n);
  equal(roundRatio(-1n, 1000n, 2), 0n);
});
test('roundRatio menolak penyebut nol dan argumen tidak valid', () => {
  throws(() => roundRatio(1n, 0n, 2), 'DIVISION_BY_ZERO');
  for (const places of [-1, 13, 1.5, '2']) throws(() => roundRatio(1n, 2n, places), 'INVALID_NUMBER');
  throws(() => roundRatio(1, 2n, 2), 'INVALID_NUMBER');
});
test('formatRatio memakai koma lokal, opsi nol, dan tidak menampilkan minus nol', () => {
  equal(formatRatio(1n, 8n, { places: 2 }), '0,13');
  equal(formatRatio(1n, 2n, { places: 2, trimZeros: true }), '0,5');
  equal(formatRatio(-1n, 1000n, { places: 2 }), '0,00');
  equal(formatRatio(15n, 10n, { places: 0 }), '2');
  throws(() => formatRatio(1n, 2n, { trimZeros: 'yes' }), 'INVALID_NUMBER');
  throws(() => formatRatio(1n, 2n, null), 'INVALID_NUMBER');
});
test('parseDateOnly menerima leap day Gregorian dan menolak tanggal tidak mungkin', () => {
  deepEqual(parseDateOnly('2000-02-29'), { year: 2000, month: 2, day: 29 });
  for (const value of ['1900-02-29', '0000-01-01', '2024-04-31']) throws(() => parseDateOnly(value), 'INVALID_DATE');
});
test('parseDateOnly menuntut format ketat empat digit tanpa spasi atau waktu', () => {
  for (const value of [' 2024-01-01', '2024-01-01 ', '2024-01-01T00:00:00Z', '24-01-01', '２０２４-01-01']) throws(() => parseDateOnly(value), 'INVALID_DATE');
  throws(() => parseDateOnly(null), 'INVALID_DATE');
});
test('daysInMonth mengikuti aturan kabisat proleptik dan menolak bulan invalid', () => {
  equal(daysInMonth(2000, 2), 29); equal(daysInMonth(1900, 2), 28); equal(daysInMonth(2024, 2), 29); equal(daysInMonth(2024, 11), 30);
  throws(() => daysInMonth(0, 1), 'INVALID_DATE'); throws(() => daysInMonth(2024, 13), 'INVALID_DATE');
});
test('toDayNumber menggunakan ordinal yang ditentukan kontrak', () => {
  equal(toDayNumber(parseDateOnly('0001-01-01')), 0);
  equal(toDayNumber(parseDateOnly('0001-01-02')), 1);
  equal(toDayNumber(parseDateOnly('9999-12-31')), 3652058);
});
test('fromDayNumber round trip awal/akhir tahun dan tahun Gregorian terpilih', () => {
  for (const value of ['0001-01-01', '0001-12-31', '0004-02-29', '1900-03-01', '2000-02-29', '2024-12-31', '9999-12-31']) {
    equal(dateText(fromDayNumber(toDayNumber(parseDateOnly(value)))), value);
  }
});
test('fromDayNumber menolak ordinal di luar rentang dan noninteger', () => {
  for (const value of [-1, 3652059, 1.5, NaN]) throws(() => fromDayNumber(value), 'DATE_RANGE');
});
test('addMonthsClamped menjepit tanggal ke akhir bulan sasaran tanpa akumulasi', () => {
  equal(dateText(addMonthsClamped(parseDateOnly('2023-01-31'), 1)), '2023-02-28');
  equal(dateText(addMonthsClamped(parseDateOnly('2023-01-31'), 2)), '2023-03-31');
  equal(dateText(addMonthsClamped(parseDateOnly('2024-03-31'), -1)), '2024-02-29');
  equal(dateText(addMonthsClamped(parseDateOnly('2020-02-29'), 12)), '2021-02-28');
});
test('addMonthsClamped tidak mengubah input dan menolak rentang/pecahan', () => {
  const date = parseDateOnly('2024-01-31');
  addMonthsClamped(date, 1); deepEqual(date, { year: 2024, month: 1, day: 31 });
  throws(() => addMonthsClamped(parseDateOnly('0001-01-01'), -1), 'DATE_RANGE');
  throws(() => addMonthsClamped(parseDateOnly('9999-12-31'), 1), 'DATE_RANGE');
  throws(() => addMonthsClamped(parseDateOnly('2024-01-01'), 0.5), 'DATE_RANGE');
});
test('copyTextId waits for clipboard success and sets one Indonesian live status', async () => {
  const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  let copied, resolveWrite;
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText(text) { copied = text; return new Promise(resolve => { resolveWrite = resolve; }); } } });
  try {
    const element = status(); const pending = copyTextId('fixture ✓', element);
    equal(element.dataset.kind, undefined); resolveWrite();
    equal(await pending, true); equal(copied, 'fixture ✓'); equal(element.dataset.kind, 'success');
    equal(element.textContent, 'Hasil berhasil disalin.'); equal(element.getAttribute('aria-live'), 'polite');
  } finally { if (original) Object.defineProperty(navigator, 'clipboard', original); else delete navigator.clipboard; }
});
test('copyTextId shows Indonesian manual fallback on rejected or unavailable clipboard', async () => {
  const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  try {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { async writeText() { throw new Error('Denied'); } } });
    let element = status(); equal(await copyTextId('fixture', element), false); equal(element.dataset.kind, 'warning');
    equal(element.textContent, 'Clipboard tidak tersedia. Pilih hasil lalu salin secara manual.');
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    element = status(); equal(await copyTextId('fixture', element), false); equal(element.dataset.kind, 'warning');
  } finally { if (original) Object.defineProperty(navigator, 'clipboard', original); else delete navigator.clipboard; }
});
test('copyTextId validates that copied results are text', async () => {
  try { await copyTextId(42, status()); }
  catch (error) { assert(error instanceof TypeError); return; }
  throw new Error('Seharusnya menolak hasil yang bukan teks.');
});
test('downloadBlob preserves Blob type, uses a sanitized basename and releases its object URL', async () => {
  const create = URL.createObjectURL, revoke = URL.revokeObjectURL, click = HTMLAnchorElement.prototype.click;
  let blob, filename, revoked;
  URL.createObjectURL = value => { blob = value; return 'blob:everyday-test'; };
  URL.revokeObjectURL = value => { revoked = value; };
  HTMLAnchorElement.prototype.click = function () { filename = this.download; };
  try {
    const fixture = new Blob(['angka ✓'], { type: 'text/plain;charset=utf-8' });
    downloadBlob(fixture, '../hasil\n<aman>.txt');
    equal(blob, fixture); equal(blob.type, 'text/plain;charset=utf-8'); equal(filename, 'hasil__aman_.txt');
    equal(document.querySelector('a[href="blob:everyday-test"]'), null);
    await new Promise(resolve => setTimeout(resolve, 1050)); equal(revoked, 'blob:everyday-test');
  } finally { URL.createObjectURL = create; URL.revokeObjectURL = revoke; HTMLAnchorElement.prototype.click = click; }
});
test('downloadBlob rejects non-Blobs and falls back for an empty sanitized filename', () => {
  throws(() => downloadBlob('teks', 'hasil.txt'));
  const create = URL.createObjectURL, click = HTMLAnchorElement.prototype.click;
  let filename;
  URL.createObjectURL = () => 'blob:empty-name-test';
  HTMLAnchorElement.prototype.click = function () { filename = this.download; };
  try { downloadBlob(new Blob(['']), '../...'); equal(filename, 'unduhan.bin'); }
  finally { URL.createObjectURL = create; HTMLAnchorElement.prototype.click = click; }
});
test('Template is noindex, Indonesian, static and has labels/status/noscript', async () => {
  const response = await fetch('/docs/everyday-tools/tool-template.html');
  assert(response.ok); const html = await response.text();
  assert(html.includes('name="robots" content="noindex,nofollow"'));
  assert(html.includes('href="https://edwinlab.dev/TOOL_SLUG/"'));
  assert(html.includes('TOOL_STEP_1')); assert(html.includes('name="description"'));
  const frame = document.createElement('iframe'); frame.setAttribute('sandbox', 'allow-same-origin');
  frame.src = '/docs/everyday-tools/tool-template.html'; frame.title = 'Template tanpa JavaScript';
  frame.style.cssText = 'width:390px;height:900px;border:0;position:absolute;left:0;top:0;visibility:hidden'; document.body.append(frame);
  try {
    await new Promise((resolve, reject) => { frame.onload = resolve; frame.onerror = reject; });
    const doc = frame.contentDocument;
    equal(doc.documentElement.lang, 'id'); equal(doc.querySelectorAll('h1').length, 1);
    assert(doc.querySelector('noscript').textContent.includes('Aktifkan JavaScript'));
    for (const element of doc.querySelectorAll('input,select,textarea')) assert(doc.querySelector(`label[for="${element.id}"]`));
    equal(doc.querySelector('#status').getAttribute('aria-live'), 'polite');
    assert(doc.querySelector('#process').disabled && doc.querySelector('#copy').disabled && doc.querySelector('#download').disabled);
    assert(doc.querySelector('article').textContent.includes('Cara menggunakan'));
    equal(doc.querySelectorAll('a[href="/alat/"]').length, 0);
    for (const width of [320, 390, 768, 1440]) {
      frame.style.width = `${width}px`; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      assert(doc.documentElement.scrollWidth <= width, `Template overflow pada ${width}px`);
      const panels = doc.querySelectorAll('.tools-panel');
      if (width < 700) assert(panels[1].getBoundingClientRect().top > panels[0].getBoundingClientRect().top, `Panel tidak bertumpuk pada ${width}px`);
      else assert(Math.abs(panels[0].getBoundingClientRect().top - panels[1].getBoundingClientRect().top) < 1, `Panel tidak sejajar pada ${width}px`);
    }
  } finally { frame.remove(); }
});
test('Foundation and test index are noindex with only live foundation links', async () => {
  const [runner, index] = await Promise.all([fetch('/tests/everyday/foundation.html'), fetch('/tests/everyday/index.html')]);
  assert(runner.ok && index.ok);
  const [runnerHtml, indexHtml] = await Promise.all([runner.text(), index.text()]);
  assert(runnerHtml.includes('name="robots" content="noindex,nofollow"'));
  assert(indexHtml.includes('href="./foundation.html"'));
  equal((indexHtml.match(/href="\.\/[^\"]+\.html"/g) ?? []).length, 1);
});

document.querySelector('#manual-copy').addEventListener('click', () => copyTextId(document.querySelector('#manual-result').value, document.querySelector('#manual-status')));
document.querySelector('#manual-download').addEventListener('click', () => downloadBlob(new Blob(['Contoh Edwin Lab'], { type: 'text/plain;charset=utf-8' }), 'contoh-everyday.txt'));
await run();
