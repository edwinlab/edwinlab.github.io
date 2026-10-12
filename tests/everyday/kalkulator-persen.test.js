import { assert, equal, throws, test, run } from '../tools/harness.js';
import { formatRatio, parseDecimal, roundRatio } from '/everyday/shared/number.js';
import { assertOutputLimits, calculatePercentage, parsePercentageInput, presentPercentage } from '/kalkulator-persen/logic.js';

function decimal(raw, field = 'first') { return parsePercentageInput(raw, field); }
function result(mode, first, second) { return presentPercentage(mode, decimal(first), decimal(second)); }
function assertRational(actual, numerator, denominator, unit) {
  equal(actual.unit, unit);
  equal(actual.denominator > 0n, true);
  equal(actual.numerator * denominator, numerator * actual.denominator);
}
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
  frame.title = 'Kalkulator persen untuk tes';
  frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:900px;border:0`;
  document.body.append(frame);
  frame.src = '/kalkulator-persen/';
  await new Promise((resolve, reject) => {
    frame.addEventListener('load', resolve, { once: true });
    frame.addEventListener('error', () => reject(new Error('Route tool gagal dimuat.')), { once: true });
  });
  const win = frame.contentWindow;
  await waitFor(() => win.document.querySelector('#tool-status').getAttribute('aria-live') === 'polite');
  return { frame, win, doc: win.document };
}
function closeApp(app) { app.frame.remove(); }
function calculateInApp(app, mode, first, second) {
  const doc = app.doc;
  doc.querySelector('#percent-mode').value = mode;
  doc.querySelector('#percent-mode').dispatchEvent(new app.win.Event('change', { bubbles: true }));
  doc.querySelector('#first-value').value = first;
  doc.querySelector('#second-value').value = second;
  doc.querySelector('#calculate-button').click();
}
function setClipboard(win, writeText) {
  Object.defineProperty(win.navigator, 'clipboard', { configurable: true, value: { writeText } });
}

test('parseDecimal shared mempertahankan coefficient/scale untuk dua tanda desimal', () => {
  const comma = parseDecimal('12,5', { maxIntegerDigits: 13, maxFractionDigits: 6, allowNegative: true });
  const dot = parseDecimal('12.5', { maxIntegerDigits: 13, maxFractionDigits: 6, allowNegative: true });
  equal(comma.coefficient, 125n); equal(comma.scale, 1);
  equal(dot.coefficient, 125n); equal(dot.scale, 1);
});

test('portion memakai rasional exact dan hasil utama sesuai contoh', () => {
  const calculation = calculatePercentage('portion', decimal('20'), decimal('150'));
  assertRational(calculation, 30n, 1n, 'number');
  equal(result('portion', '20', '150').resultText, '30');
  equal(result('portion', '20', '150').formula, '20 × 150 ÷ 100 = 30');
});

test('portion menerima koma/titik desimal dan persen di atas 100', () => {
  equal(result('portion', '12,5', '80').resultText, '10');
  equal(result('portion', '12.5', '80').resultText, '10');
  equal(result('portion', '150', '80').resultText, '120');
});

test('portion menerima tanda negatif dan tidak menampilkan minus nol', () => {
  equal(result('portion', '-10', '200').resultText, '-20');
  equal(result('portion', '0', '-200').resultText, '0');
});

test('ratio menghasilkan persen bertanda dan penyebut nol ditolak', () => {
  equal(result('ratio', '45', '180').resultText, '25%');
  equal(result('ratio', '25', '-100').resultText, '-25%');
  equal(throws(() => calculatePercentage('ratio', decimal('0'), decimal('0')), 'DIVISION_BY_ZERO').field, 'second');
  equal(throws(() => calculatePercentage('ratio', decimal('1'), decimal('0')), 'DIVISION_BY_ZERO').code, 'DIVISION_BY_ZERO');
});

test('ratio membulat half away dan menandai hasil pendekatan', () => {
  equal(result('ratio', '1', '3').resultText, '≈ 33,333333%');
  equal(result('ratio', '1', '6').resultText, '≈ 16,666667%');
  equal(result('ratio', '1', '3').rounded, true);
  equal(formatRatio(-1n, 2000000n, { places: 6, trimZeros: true }), '-0,000001');
});

test('rational ratio/change dan helper roundRatio diuji terpisah dari tampilan', () => {
  assertRational(calculatePercentage('ratio', decimal('45'), decimal('180')), 25n, 1n, 'percent');
  assertRational(calculatePercentage('change', decimal('80'), decimal('100')), 25n, 1n, 'percent');
  equal(roundRatio(1n, 8n, 2), 13n);
  equal(roundRatio(-1n, 8n, 2), -13n);
});

test('change menentukan arah dari numerator eksak dan menerima nilai akhir negatif', () => {
  equal(result('change', '80', '100').resultText, '25%');
  equal(result('change', '80', '100').meaning, 'Naik');
  equal(result('change', '100', '80').resultText, '-20%');
  equal(result('change', '100', '80').meaning, 'Turun');
  equal(result('change', '100', '100').meaning, 'Tidak berubah');
  equal(result('change', '100', '-50').resultText, '-150%');
});

test('change memerlukan nilai awal positif', () => {
  equal(throws(() => calculatePercentage('change', decimal('0'), decimal('10')), 'BASE_NOT_POSITIVE').field, 'first');
  equal(throws(() => calculatePercentage('change', decimal('-100'), decimal('-50')), 'BASE_NOT_POSITIVE').code, 'BASE_NOT_POSITIVE');
});

test('range tepat 1e12 sah dan angka lebih besar ditolak tanpa Number', () => {
  equal(result('portion', '1000000000000', '1000000000000').resultText, '10000000000000000000000');
  equal(throws(() => parsePercentageInput('1000000000000.000001'), 'RANGE_ERROR').code, 'RANGE_ERROR');
  equal(throws(() => parsePercentageInput('1000000000001'), 'RANGE_ERROR').code, 'RANGE_ERROR');
});

test('format mengartikan 1,000 sebagai satu dengan tiga desimal', () => {
  equal(result('portion', '1,000', '100').resultText, '1');
});

test('hasil sangat kecil membulat ke nol tetapi tetap bertanda pendekatan', () => {
  const value = result('portion', '0.000001', '0.000001');
  equal(value.resultText, '≈ 0');
  equal(value.rounded, true);
});

test('parser menolak presisi, panjang, format campuran dan input bukan ASCII', () => {
  equal(parsePercentageInput(` 12${' '.repeat(61)}`).coefficient, 12n);
  equal(parsePercentageInput(` 12${' '.repeat(61)}`).scale, 0);
  equal(throws(() => parsePercentageInput('1.1234567'), 'NUMBER_PRECISION').code, 'NUMBER_PRECISION');
  equal(throws(() => parsePercentageInput('1'.repeat(65)), 'INPUT_TOO_LARGE').code, 'INPUT_TOO_LARGE');
  for (const raw of ['1.234,56', '1e3', 'NaN', '+3', '', '.5', '5.', '１２']) {
    equal(throws(() => parsePercentageInput(raw), 'INVALID_NUMBER').code, 'INVALID_NUMBER');
  }
  equal(throws(() => parseDecimal('1,000.50'), 'INVALID_NUMBER').code, 'INVALID_NUMBER');
});

test('invalid mode dan format error memakai kode yang ditentukan', () => {
  equal(throws(() => calculatePercentage('discount', decimal('20'), decimal('100')), 'INVALID_MODE').code, 'INVALID_MODE');
});

test('cap teks hasil tepat 64 karakter dan satu lebih memicu OUTPUT_TOO_LARGE', () => {
  equal(assertOutputLimits('x'.repeat(64), '').resultText.length, 64);
  equal(throws(() => assertOutputLimits('x'.repeat(65), ''), 'OUTPUT_TOO_LARGE').code, 'OUTPUT_TOO_LARGE');
});

test('cap ringkasan tepat 2 KiB UTF-8 dan satu byte lebih memicu error', () => {
  equal(assertOutputLimits('0', 'a'.repeat(2048)).copyText.length, 2048);
  equal(throws(() => assertOutputLimits('0', 'a'.repeat(2049)), 'OUTPUT_TOO_LARGE').code, 'OUTPUT_TOO_LARGE');
});

test('route langsung memuat title, canonical, H1 dan artikel statis', async () => {
  const app = await openApp();
  try {
    equal(app.doc.title, 'Kalkulator Persen: Hitung Persentase dan Perubahan | Edwin Lab');
    equal(app.doc.documentElement.lang, 'id');
    equal(app.doc.querySelector('link[rel="canonical"]').href, 'https://edwinlab.dev/kalkulator-persen/');
    equal(app.doc.querySelectorAll('h1').length, 1);
    assert(app.doc.querySelector('article').textContent.includes('80 ke 100 = naik 25%'));
    assert(app.doc.querySelector('noscript'));
  } finally { closeApp(app); }
});

test('UI menampilkan rumus, input normal, hasil dan indikator pembulatan', async () => {
  const app = await openApp();
  try {
    calculateInApp(app, 'ratio', '1', '3');
    equal(app.doc.querySelector('#result-value').textContent, '≈ 33,333333%');
    equal(app.doc.querySelector('#result-inputs').textContent, '1 dan 3');
    equal(app.doc.querySelector('#result-formula').textContent, '1 ÷ 3 × 100 = ≈ 33,333333%');
    equal(app.doc.querySelector('#rounding-note').hidden, false);
    equal(app.doc.querySelector('#copy-button').disabled, false);
  } finally { closeApp(app); }
});

test('perubahan UI menunjukkan Naik, Turun, dan Tidak berubah', async () => {
  const app = await openApp();
  try {
    calculateInApp(app, 'change', '80', '100');
    equal(app.doc.querySelector('#result-meaning').textContent, 'Naik');
    calculateInApp(app, 'change', '100', '80');
    equal(app.doc.querySelector('#result-meaning').textContent, 'Turun');
    calculateInApp(app, 'change', '100', '100');
    equal(app.doc.querySelector('#result-meaning').textContent, 'Tidak berubah');
  } finally { closeApp(app); }
});

test('invalid input clears stale copy, preserves values and focuses invalid field', async () => {
  const app = await openApp();
  try {
    calculateInApp(app, 'portion', '20', '150');
    equal(app.doc.querySelector('#copy-button').disabled, false);
    app.doc.querySelector('#first-value').value = '1.234,56';
    app.doc.querySelector('#first-value').dispatchEvent(new app.win.Event('input', { bubbles: true }));
    equal(app.doc.querySelector('#result-card').hidden, true);
    equal(app.doc.querySelector('#copy-button').disabled, true);
    app.doc.querySelector('#second-value').value = '150';
    app.doc.querySelector('#calculate-button').click();
    equal(app.doc.querySelector('#first-value').value, '1.234,56');
    equal(app.doc.activeElement.id, 'first-value');
    equal(app.doc.querySelector('#tool-status').dataset.kind, 'error');
  } finally { closeApp(app); }
});

test('pindah mode mengosongkan input dan memperbarui label serta rumus', async () => {
  const app = await openApp();
  try {
    app.doc.querySelector('#first-value').value = '4';
    app.doc.querySelector('#second-value').value = '5';
    app.doc.querySelector('#percent-mode').value = 'ratio';
    app.doc.querySelector('#percent-mode').dispatchEvent(new app.win.Event('change', { bubbles: true }));
    equal(app.doc.querySelector('#first-value').value, '');
    equal(app.doc.querySelector('#second-value').value, '');
    equal(app.doc.querySelector('#first-label').textContent, 'Nilai A');
    assert(app.doc.querySelector('#mode-note').textContent.includes('B tidak boleh nol'));
  } finally { closeApp(app); }
});

test('contoh sesuai mode tanpa menghitung otomatis dan Bersihkan mempertahankan mode', async () => {
  const app = await openApp();
  try {
    app.doc.querySelector('#percent-mode').value = 'change';
    app.doc.querySelector('#percent-mode').dispatchEvent(new app.win.Event('change', { bubbles: true }));
    app.doc.querySelector('#example-button').click();
    equal(app.doc.querySelector('#first-value').value, '80');
    equal(app.doc.querySelector('#second-value').value, '100');
    equal(app.doc.querySelector('#result-card').hidden, true);
    app.doc.querySelector('#clear-button').click();
    equal(app.doc.querySelector('#first-value').value, '');
    equal(app.doc.querySelector('#percent-mode').value, 'change');
    equal(app.doc.activeElement.id, 'first-value');
  } finally { closeApp(app); }
});

test('salin merangkum mode, nilai, hasil, rumus dan simbol pendekatan', async () => {
  const app = await openApp();
  try {
    let copied = '';
    setClipboard(app.win, async text => { copied = text; });
    calculateInApp(app, 'ratio', '1', '3');
    app.doc.querySelector('#copy-button').click();
    await waitFor(() => app.doc.querySelector('#tool-status').textContent.includes('berhasil disalin'));
    for (const phrase of ['Mode: A berapa persen dari B', 'Nilai: 1 dan 3', 'Hasil: ≈ 33,333333%', 'Rumus:', 'Dibulatkan hingga 6 angka desimal']) assert(copied.includes(phrase));
  } finally { closeApp(app); }
});

test('layout tidak meluap pada empat lebar layar', async () => {
  for (const width of [320, 390, 768, 1440]) {
    const app = await openApp(width);
    try {
      assert(app.doc.documentElement.scrollWidth <= width, `${width}px: ${app.doc.documentElement.scrollWidth}`);
      assert(app.doc.querySelector('#first-value').getBoundingClientRect().width > 0);
    } finally { closeApp(app); }
  }
});

await run();
