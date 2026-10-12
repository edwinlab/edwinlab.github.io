import { assert, equal, throws, test, run } from '../tools/harness.js';
import { convertUnit, createConversionSummary, formatResult, getCategoryUnits, getDefaultUnits } from '/konversi-satuan/logic.js';

const TOLERANCE = 1e-12;
function close(actual, expected) {
  assert(Math.abs(actual - expected) <= TOLERANCE * Math.max(1, Math.abs(expected)), `Expected ${expected}, received ${actual}`);
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
  frame.title = 'Konversi satuan untuk tes';
  frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:1100px;border:0`;
  document.body.append(frame);
  frame.src = '/konversi-satuan/';
  await new Promise((resolve, reject) => {
    frame.addEventListener('load', resolve, { once: true });
    frame.addEventListener('error', () => reject(new Error('Route tool gagal dimuat.')), { once: true });
  });
  const win = frame.contentWindow;
  await waitFor(() => win.document.querySelector('#tool-status').getAttribute('aria-live') === 'polite');
  return { frame, win, doc: win.document };
}
function closeApp(app) { app.frame.remove(); }
function setClipboard(win, writeText) {
  Object.defineProperty(win.navigator, 'clipboard', { configurable: true, value: { writeText } });
}
function convertInApp(app, { category = 'length', value = '100', from = 'cm', to = 'm' } = {}) {
  const doc = app.doc;
  doc.querySelector('#category-select').value = category;
  doc.querySelector('#category-select').dispatchEvent(new app.win.Event('change', { bubbles: true }));
  doc.querySelector('#value-input').value = value;
  doc.querySelector('#from-select').value = from;
  doc.querySelector('#to-select').value = to;
  doc.querySelector('#convert-button').click();
}

test('length cm ke m dan input desimal koma/titik', () => {
  const result = convertUnit('100', 'length', 'cm', 'm');
  equal(result.value, 1); equal(result.formatted, '1');
  equal(convertUnit('2,5', 'length', 'km', 'm').value, 2500);
  equal(convertUnit('2.5', 'length', 'km', 'm').formatted, '2500');
});

test('faktor panjang inci dan mil internasional tepat', () => {
  const inches = convertUnit('1', 'length', 'in', 'cm');
  close(inches.value, 2.54); equal(inches.formatted, '2,54');
  const miles = convertUnit('1', 'length', 'mi', 'm');
  equal(miles.value, 1609.344); equal(miles.formatted, '1609,344');
});

test('faktor massa pound, ounce, dan ton metrik', () => {
  const pound = convertUnit('1', 'mass', 'lb', 'kg');
  close(pound.value, 0.45359237); equal(pound.formatted, '0,45359237');
  equal(convertUnit('16', 'mass', 'oz', 'lb').formatted, '1');
  equal(convertUnit('1', 'mass', 't', 'kg').formatted, '1000');
});

test('temperatur Celsius/Fahrenheit, titik beku, dan angka negatif', () => {
  equal(convertUnit('0', 'temperature', 'C', 'F').formatted, '32');
  const freezing = convertUnit('32', 'temperature', 'F', 'C');
  equal(freezing.value, 0); equal(freezing.formatted, '0');
  equal(convertUnit('-40', 'temperature', 'C', 'F').formatted, '-40');
});

test('Kelvin dan batas bawah nol mutlak menghasilkan nilai target tepat', () => {
  equal(convertUnit('0', 'temperature', 'K', 'C').formatted, '-273,15');
  equal(convertUnit('-459,67', 'temperature', 'F', 'K').value, 0);
  equal(convertUnit('-459.67', 'temperature', 'F', 'K').formatted, '0');
  equal(convertUnit('-273.15', 'temperature', 'C', 'F').formatted, '-459,67');
});

test('input tepat di bawah nol mutlak ditolak pada skala sumber', () => {
  equal(throws(() => convertUnit('-273,150001', 'temperature', 'C', 'K'), 'BELOW_ABSOLUTE_ZERO').field, 'value');
  equal(throws(() => convertUnit('-0,000001', 'temperature', 'K', 'C'), 'BELOW_ABSOLUTE_ZERO').field, 'value');
});

test('faktor area memakai dimensi luas', () => {
  equal(convertUnit('1', 'area', 'ha', 'm2').formatted, '10000');
  equal(convertUnit('1', 'area', 'm2', 'cm2').formatted, '10000');
});

test('faktor volume memakai dimensi volume', () => {
  equal(convertUnit('1000', 'volume', 'mL', 'L').formatted, '1');
  equal(convertUnit('1', 'volume', 'L', 'm3').formatted, '0,001');
  equal(convertUnit('1', 'volume', 'cm3', 'mL').formatted, '1');
});

test('hasil kecil tetap nonzero dan diformat dengan notasi ilmiah', () => {
  const result = convertUnit('0,000001', 'area', 'cm2', 'km2');
  equal(result.value, 1e-16); equal(result.formatted, '1e-16');
  assert(result.value !== 0);
});

test('hasil meter ke kaki mengikuti 12 digit signifikan', () => {
  const result = convertUnit('1', 'length', 'm', 'ft');
  close(result.value, 3.280839895013123);
  equal(result.formatted, '3,28083989501');
});

test('unit sama mempertahankan angka ternormalisasi dan meniadakan minus nol', () => {
  const zero = convertUnit('-0', 'length', 'm', 'm');
  equal(zero.value, 0); equal(Object.is(zero.value, -0), false); equal(zero.formatted, '0');
  equal(throws(() => convertUnit('-1', 'mass', 'kg', 'g'), 'NEGATIVE_VALUE').code, 'NEGATIVE_VALUE');
});

test('unit allowlist menolak lintas dimensi, enum asing, dan kunci prototype', () => {
  equal(throws(() => convertUnit('1', 'length', 'm', 'kg'), 'INVALID_UNIT').field, 'to');
  equal(throws(() => convertUnit('1', 'unknown', 'm', 'm'), 'INVALID_UNIT').field, 'category');
  equal(throws(() => convertUnit('1', 'length', '__proto__', 'm'), 'INVALID_UNIT').field, 'from');
  equal(throws(() => convertUnit('1', 'length', 'm', 'constructor'), 'INVALID_UNIT').field, 'to');
});

test('panjang input, grammar, presisi digit, dan scalar limit memiliki error yang ditetapkan', () => {
  equal(throws(() => convertUnit('x'.repeat(25), 'length', 'm', 'cm'), 'INPUT_TOO_LONG').code, 'INPUT_TOO_LONG');
  for (const raw of ['1,000.5', '1e3', '+1', '.5', '1.', '', 'NaN', '1234567890', '1.1234567']) {
    equal(throws(() => convertUnit(raw, 'length', 'm', 'cm'), 'INVALID_NUMBER').code, 'INVALID_NUMBER');
  }
});

test('formatter stabil, desimal koma, exponent kecil, finite, dan minus zero', () => {
  equal(formatResult(3.280839895013123), '3,28083989501');
  equal(formatResult(1e-16), '1e-16');
  equal(formatResult(-0), '0');
  equal(throws(() => formatResult(Infinity), 'RESULT_RANGE').code, 'RESULT_RANGE');
});

test('metadata/static guide memuat lima kategori, rumus suhu, source NIST, dan FAQ', async () => {
  const app = await openApp();
  try {
    equal(app.doc.title, 'Konversi Satuan Panjang, Berat, Suhu, Luas & Volume | Edwin Lab');
    equal(app.doc.documentElement.lang, 'id');
    equal(app.doc.querySelector('link[rel="canonical"]').href, 'https://edwinlab.dev/konversi-satuan/');
    equal(app.doc.querySelectorAll('h1').length, 1);
    const article = app.doc.querySelector('article').textContent;
    assert(article.includes('Massa (berat, dasar kilogram)'), 'Panduan harus membedakan kategori massa (berat) dan menyebut dasar kilogram.');
    assert(article.includes('Gram mengukur massa'), 'FAQ harus menerangkan bahwa gram mengukur massa.');
    equal(app.doc.querySelectorAll('article a[href^="https://www.nist.gov/"]').length, 4);
    assert(app.doc.querySelector('noscript'));
  } finally { closeApp(app); }
});

test('default length cm/m dan hasil satuan akurat ditampilkan', async () => {
  const app = await openApp();
  try {
    equal(app.doc.querySelector('#category-select').value, 'length');
    equal(app.doc.querySelector('#value-input').value, '');
    equal(app.doc.querySelector('#from-select').value, 'cm');
    equal(app.doc.querySelector('#to-select').value, 'm');
    convertInApp(app, { category: 'length', value: '100', from: 'cm', to: 'm' });
    equal(app.doc.querySelector('#result-value').textContent, '1 m');
    assert(app.doc.querySelector('#result-formula').textContent.includes('faktor ke satuan dasar'));
  } finally { closeApp(app); }
});

test('pergantian kategori mempertahankan nilai, mengganti pasangan default, dan menghapus hasil', async () => {
  const app = await openApp();
  try {
    convertInApp(app, { value: '12,5' });
    app.doc.querySelector('#category-select').value = 'mass';
    app.doc.querySelector('#category-select').dispatchEvent(new app.win.Event('change', { bubbles: true }));
    equal(app.doc.querySelector('#value-input').value, '12,5');
    equal(app.doc.querySelector('#from-select').value, 'g');
    equal(app.doc.querySelector('#to-select').value, 'kg');
    equal(app.doc.querySelector('#result-card').hidden, true);
    equal(app.doc.querySelector('#copy-button').disabled, true);
  } finally { closeApp(app); }
});

test('semua kategori memiliki pasangan default yang diwajibkan', async () => {
  const app = await openApp();
  try {
    for (const [category, from, to] of [['mass','g','kg'],['temperature','C','F'],['area','m2','ha'],['volume','mL','L']]) {
      app.doc.querySelector('#category-select').value = category;
      app.doc.querySelector('#category-select').dispatchEvent(new app.win.Event('change', { bubbles: true }));
      equal(app.doc.querySelector('#from-select').value, from);
      equal(app.doc.querySelector('#to-select').value, to);
    }
  } finally { closeApp(app); }
});

test('swap menukar enum tanpa memindahkan hasil ke nilai input', async () => {
  const app = await openApp();
  try {
    convertInApp(app, { category: 'length', value: '2,5', from: 'km', to: 'm' });
    equal(app.doc.querySelector('#result-value').textContent, '2500 m');
    app.doc.querySelector('#swap-button').click();
    equal(app.doc.querySelector('#from-select').value, 'm');
    equal(app.doc.querySelector('#to-select').value, 'km');
    equal(app.doc.querySelector('#value-input').value, '2,5');
    equal(app.doc.querySelector('#result-card').hidden, true);
    equal(app.doc.querySelector('#copy-button').disabled, true);
  } finally { closeApp(app); }
});

test('example mengisi 2,5 km ke m tanpa auto-convert dan clear mengembalikan default', async () => {
  const app = await openApp();
  try {
    app.doc.querySelector('#example-button').click();
    equal(app.doc.querySelector('#category-select').value, 'length');
    equal(app.doc.querySelector('#value-input').value, '2,5');
    equal(app.doc.querySelector('#from-select').value, 'km');
    equal(app.doc.querySelector('#to-select').value, 'm');
    equal(app.doc.querySelector('#result-card').hidden, true);
    app.doc.querySelector('#convert-button').click();
    app.doc.querySelector('#clear-button').click();
    equal(app.doc.querySelector('#category-select').value, 'length');
    equal(app.doc.querySelector('#value-input').value, '');
    equal(app.doc.querySelector('#from-select').value, 'cm');
    equal(app.doc.querySelector('#to-select').value, 'm');
    equal(app.doc.activeElement.id, 'value-input');
  } finally { closeApp(app); }
});

test('input edit membatalkan hasil lama dan menonaktifkan copy', async () => {
  const app = await openApp();
  try {
    convertInApp(app);
    app.doc.querySelector('#value-input').value = '200';
    app.doc.querySelector('#value-input').dispatchEvent(new app.win.Event('input', { bubbles: true }));
    equal(app.doc.querySelector('#result-card').hidden, true);
    equal(app.doc.querySelector('#copy-button').disabled, true);
    assert(/konversi kembali/i.test(app.doc.querySelector('#tool-status').textContent), `Status stale tidak terlihat: ${app.doc.querySelector('#tool-status').textContent}`);
  } finally { closeApp(app); }
});

test('error mempertahankan input dan memfokuskan nilai saat melewati nol mutlak', async () => {
  const app = await openApp();
  try {
    app.doc.querySelector('#category-select').value = 'temperature';
    app.doc.querySelector('#category-select').dispatchEvent(new app.win.Event('change', { bubbles: true }));
    app.doc.querySelector('#value-input').value = '-273.150001';
    app.doc.querySelector('#from-select').value = 'C';
    app.doc.querySelector('#to-select').value = 'K';
    app.doc.querySelector('#convert-button').click();
    equal(app.doc.querySelector('#value-input').value, '-273.150001');
    equal(app.doc.activeElement.id, 'value-input');
    assert(app.doc.querySelector('#tool-status').textContent.includes('nol mutlak'));
    equal(app.doc.querySelector('#result-card').hidden, true);
  } finally { closeApp(app); }
});

test('copy menyertakan nilai, label/simbol asal-tujuan, kategori, dan angka hasil', async () => {
  const app = await openApp();
  try {
    let copied = '';
    setClipboard(app.win, async text => { copied = text; });
    convertInApp(app, { value: '100', from: 'cm', to: 'm' });
    app.doc.querySelector('#copy-button').click();
    await waitFor(() => app.doc.querySelector('#tool-status').textContent.includes('berhasil disalin'));
    for (const text of ['Nilai input: 100 Sentimeter (cm)', 'Kategori: Panjang', 'Hasil: 1 Meter (m)']) assert(copied.includes(text));
  } finally { closeApp(app); }
});

test('clipboard ditolak memberi instruksi manual dan hasil readonly tetap tersedia', async () => {
  const app = await openApp();
  try {
    setClipboard(app.win, async () => { throw new Error('denied'); });
    convertInApp(app);
    app.doc.querySelector('#copy-button').click();
    await waitFor(() => app.doc.querySelector('#tool-status').textContent.includes('tidak tersedia'));
    equal(app.doc.querySelector('#copy-output').readOnly, true);
    assert(app.doc.querySelector('#copy-output').value.includes('Hasil: 1 Meter (m)'));
  } finally { closeApp(app); }
});

test('kumpulan satuan kategori hanya berisi enum yang didukung', () => {
  equal(getCategoryUnits('length').length, 8);
  equal(getCategoryUnits('mass').length, 6);
  equal(getCategoryUnits('temperature').length, 3);
  equal(getCategoryUnits('area').length, 4);
  equal(getCategoryUnits('volume').length, 4);
  equal(getDefaultUnits('volume').join(','), 'mL,L');
  equal(throws(() => getCategoryUnits('__proto__'), 'INVALID_UNIT').code, 'INVALID_UNIT');
});

test('layout tidak melebar pada empat lebar viewport', async () => {
  for (const width of [320, 390, 768, 1440]) {
    const app = await openApp(width);
    try {
      assert(app.doc.documentElement.scrollWidth <= width, `${width}px: ${app.doc.documentElement.scrollWidth}`);
      assert(app.doc.querySelector('#value-input').getBoundingClientRect().width > 0);
    } finally { closeApp(app); }
  }
});

await run();
