import { assert, equal, throws, test, run } from '../tools/harness.js';
import { parseDecimal, roundRatio } from '/everyday/shared/number.js';
import { assertDiscountOutput, calculateDiscount, formatMoney, parseDiscountInput, presentDiscount } from '/kalkulator-diskon/logic.js';

function decimal(raw, kind = 'price', field = 'price') { return parseDiscountInput(raw, kind, field); }
function result(price, discounts) {
  const parsedPrice = decimal(price);
  const parsedDiscounts = discounts.map(value => decimal(value, 'discount', 'discount1'));
  let calculation;
  try { calculation = calculateDiscount(parsedPrice, parsedDiscounts); }
  catch (error) { throw new Error(`calculateDiscount: ${error?.stack || error?.message || error}`.replaceAll('\n', ' | ')); }
  try { return { ...presentDiscount(parsedPrice, parsedDiscounts), calculation }; }
  catch (error) { throw new Error(`presentDiscount: ${error?.stack || error?.message || error}`.replaceAll('\n', ' | ')); }
}
function assertInvariants(value) {
  value = value.calculation || value;
  equal(typeof value.originalCents, 'bigint');
  equal(typeof value.finalCents, 'bigint');
  equal(typeof value.savedCents, 'bigint');
  equal(value.finalCents + value.savedCents, value.originalCents);
  equal(value.finalCents >= 0n && value.finalCents <= value.originalCents, true);
  equal(value.steps.reduce((sum, step) => sum + step.discountCents, 0n), value.savedCents);
  for (const step of value.steps) {
    equal(typeof step.beforeCents, 'bigint');
    equal(typeof step.discountCents, 'bigint');
    equal(typeof step.afterCents, 'bigint');
    equal(step.beforeCents - step.discountCents, step.afterCents);
    equal(step.discountCents >= 0n && step.afterCents <= step.beforeCents, true);
  }
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
  frame.title = 'Kalkulator diskon untuk tes';
  frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:900px;border:0`;
  document.body.append(frame);
  frame.src = '/kalkulator-diskon/';
  await new Promise((resolve, reject) => {
    frame.addEventListener('load', resolve, { once: true });
    frame.addEventListener('error', () => reject(new Error('Route tool gagal dimuat.')), { once: true });
  });
  const win = frame.contentWindow;
  await waitFor(() => win.document.querySelector('#tool-status').getAttribute('aria-live') === 'polite');
  return { frame, win, doc: win.document };
}
function closeApp(app) { app.frame.remove(); }
function calculateInApp(app, mode, price, first, second = '') {
  const doc = app.doc;
  doc.querySelector('#discount-mode').value = mode;
  doc.querySelector('#discount-mode').dispatchEvent(new app.win.Event('change', { bubbles: true }));
  doc.querySelector('#price-input').value = price;
  doc.querySelector('#discount-one').value = first;
  doc.querySelector('#discount-two').value = second;
  doc.querySelector('#calculate-button').click();
}
function setClipboard(win, writeText) {
  Object.defineProperty(win.navigator, 'clipboard', { configurable: true, value: { writeText } });
}

test('shared parser menerima koma dan titik sebagai desimal tanpa grouping', () => {
  const comma = parseDecimal('100,05', { maxIntegerDigits: 13, maxFractionDigits: 2, allowNegative: false });
  const dot = parseDecimal('12.5', { maxIntegerDigits: 3, maxFractionDigits: 4, allowNegative: false });
  equal(comma.coefficient, 10005n); equal(comma.scale, 2);
  equal(dot.coefficient, 125n); equal(dot.scale, 1);
});

test('diskon tunggal exact menghasilkan harga akhir dan efektif 20 persen', () => {
  const value = result('200000', ['20']);
  equal(value.finalText, 'Rp160000,00'); equal(value.savedText, 'Rp40000,00'); equal(value.effectiveText, '20,00%');
  assertInvariants(value);
});

test('diskon berurutan diterapkan pada sisa harga dan efektif 28 persen', () => {
  const value = result('200000', ['20', '10']);
  equal(value.steps[0].afterText, 'Rp160000,00'); equal(value.steps[0].discountAmountText, 'Rp40000,00');
  equal(value.steps[1].beforeText, 'Rp160000,00'); equal(value.steps[1].afterText, 'Rp144000,00');
  equal(value.savedText, 'Rp56000,00'); equal(value.effectiveText, '28,00%');
  assertInvariants(value);
});

test('persen boundary 0 dan 100 serta diskon lanjutan setelah harga nol', () => {
  const zero = result('100', ['0']); equal(zero.finalText, 'Rp100,00'); equal(zero.savedText, 'Rp0,00'); equal(zero.effectiveText, '0,00%');
  const full = result('100', ['100', '50']); equal(full.finalText, 'Rp0,00'); equal(full.steps[1].discountAmountText, 'Rp0,00'); equal(full.effectiveText, '100,00%');
  assertInvariants(zero); assertInvariants(full);
});

test('harga awal nol tetap nol dan persen efektif tidak berlaku', () => {
  const value = result('0', ['20', '10']);
  equal(value.originalText, 'Rp0,00'); equal(value.finalText, 'Rp0,00'); equal(value.savedText, 'Rp0,00');
  equal(value.effectiveText, 'Tidak berlaku (harga awal nol)'); assertInvariants(value);
});

test('harga bersih setengah cent dibulatkan half away di tiap tahap', () => {
  equal(roundRatio(1n, 2n, 0), 1n);
  const value = result('100,05', ['10']);
  equal(value.finalText, 'Rp90,05'); equal(value.savedText, 'Rp10,00'); equal(value.effectiveText, '≈ 10,00%');
  const repeated = result('0.05', ['50', '50']);
  equal(repeated.steps[0].afterText, 'Rp0,03'); equal(repeated.steps[1].afterText, 'Rp0,02');
  equal(repeated.steps[0].discountAmountText, 'Rp0,02'); equal(repeated.steps[1].discountAmountText, 'Rp0,01');
  equal(repeated.savedText, 'Rp0,03'); equal(repeated.effectiveText, '60,00%'); assertInvariants(repeated);
});

test('tie satu cent membulatkan harga bersih, bukan potongan, ke atas', () => {
  const value = result('0,01', ['50']);
  equal(value.finalText, 'Rp0,01'); equal(value.savedText, 'Rp0,00'); equal(value.effectiveText, '0,00%');
  assertInvariants(value);
});

test('koma/titik, presisi diskon, dan nominal maksimum tetap exact', () => {
  const value = result('1234,56', ['12.5']);
  equal(value.finalText, 'Rp1080,24'); equal(value.savedText, 'Rp154,32'); equal(value.effectiveText, '12,50%');
  equal(formatMoney(calculateDiscount(decimal('1000000000000'), [decimal('0', 'discount')]).finalCents), 'Rp1000000000000,00');
  assertInvariants(value);
});

test('input salah format, negatif, grouping, presisi, dan nilai batas memunculkan kode tepat', () => {
  equal(throws(() => decimal('1000000000000.01'), 'RANGE_ERROR').field, 'price');
  for (const raw of ['1.000', '1.234', '1000000000000.001']) equal(throws(() => decimal(raw), 'NUMBER_PRECISION').code, 'NUMBER_PRECISION');
  for (const raw of ['1.234,56', '+1', '1e3', 'Rp100', '10%', 'NaN', '', '.5', '5.', '１２']) equal(throws(() => decimal(raw), 'INVALID_NUMBER').code, 'INVALID_NUMBER');
  equal(throws(() => decimal('1'.repeat(65)), 'INPUT_TOO_LARGE').code, 'INPUT_TOO_LARGE');
  equal(throws(() => decimal('100.0001', 'discount', 'discount2'), 'RANGE_ERROR').field, 'discount2');
  equal(throws(() => decimal('-1'), 'INVALID_NUMBER').field, 'price');
  equal(throws(() => decimal('-1', 'discount', 'discount2'), 'INVALID_NUMBER').field, 'discount2');
  equal(throws(() => decimal('1.00000', 'discount'), 'NUMBER_PRECISION').code, 'NUMBER_PRECISION');
});

test('mode lain, kosong atau lebih dari dua diskon ditolak', () => {
  equal(throws(() => calculateDiscount(decimal('100'), []), 'INVALID_MODE').code, 'INVALID_MODE');
  equal(throws(() => calculateDiscount(decimal('100'), [decimal('1', 'discount'), decimal('2', 'discount'), decimal('3', 'discount')]), 'INVALID_MODE').code, 'INVALID_MODE');
});

test('invariant cent berlaku pada berbagai nilai dan diskon sampai 100 persen', () => {
  for (const [price, discounts] of [['0', ['0']], ['0,01', ['100']], ['999999,99', ['33.3333', '99.9999']], ['1000000000000', ['100', '100']]]) {
    assertInvariants(calculateDiscount(decimal(price), discounts.map(value => decimal(value, 'discount'))));
  }
});

test('persen efektif boleh pendekatan tanpa mengubah harga uang', () => {
  const value = result('100,05', ['10']);
  equal(value.finalCents, 9005n); equal(value.savedCents, 1000n); equal(value.effectiveText, '≈ 10,00%');
  equal(formatMoney(value.finalCents), 'Rp90,05');
});

test('guard output mengizinkan batas tepat dan menolak satu karakter/byte lebih', () => {
  equal(assertDiscountOutput(['x'.repeat(64)], 'a'.repeat(2048)), true);
  equal(throws(() => assertDiscountOutput(['x'.repeat(65)], ''), 'OUTPUT_TOO_LARGE').code, 'OUTPUT_TOO_LARGE');
  equal(throws(() => assertDiscountOutput(['0'], 'é'.repeat(1025)), 'OUTPUT_TOO_LARGE').code, 'OUTPUT_TOO_LARGE');
});

test('route langsung memiliki canonical, metadata, H1, penjelasan statis dan noscript', async () => {
  const app = await openApp();
  try {
    equal(app.doc.title, 'Kalkulator Diskon dan Diskon Bertingkat | Edwin Lab');
    equal(app.doc.documentElement.lang, 'id');
    equal(app.doc.querySelector('link[rel="canonical"]').href, 'https://edwinlab.dev/kalkulator-diskon/');
    equal(app.doc.querySelectorAll('h1').length, 1);
    assert(app.doc.querySelector('article').textContent.includes('bukan 30%'));
    assert(app.doc.querySelector('noscript'));
  } finally { closeApp(app); }
});

test('UI menghitung dua diskon, merinci setiap tahap dan mengaktifkan salin', async () => {
  const app = await openApp();
  try {
    calculateInApp(app, 'double', '200000', '20', '10');
    equal(app.doc.querySelector('#final-price').textContent, 'Rp144000,00');
    equal(app.doc.querySelector('#total-saved').textContent, 'Rp56000,00');
    equal(app.doc.querySelector('#effective-saved').textContent, '28,00%');
    equal(app.doc.querySelectorAll('#stage-rows tr').length, 2);
    assert(app.doc.querySelector('#sequential-note').textContent.includes('setelah diskon pertama'));
    equal(app.doc.querySelector('#copy-button').disabled, false);
  } finally { closeApp(app); }
});

test('mode tunggal tidak memvalidasi field kedua yang tersembunyi', async () => {
  const app = await openApp();
  try {
    app.doc.querySelector('#discount-two').value = 'bukan angka';
    calculateInApp(app, 'single', '200000', '20', 'bukan angka');
    equal(app.doc.querySelector('#final-price').textContent, 'Rp160000,00');
    equal(app.doc.querySelectorAll('#stage-rows tr').length, 1);
    equal(app.doc.querySelector('#second-field').hidden, true);
  } finally { closeApp(app); }
});

test('input invalid members clear stale result/copy, preserve input and focus the bad field', async () => {
  const app = await openApp();
  try {
    calculateInApp(app, 'double', '200000', '20', '10');
    app.doc.querySelector('#discount-two').value = '100.0001';
    app.doc.querySelector('#discount-two').dispatchEvent(new app.win.Event('input', { bubbles: true }));
    equal(app.doc.querySelector('#result-card').hidden, true);
    equal(app.doc.querySelector('#copy-button').disabled, true);
    app.doc.querySelector('#calculate-button').click();
    equal(app.doc.querySelector('#discount-two').value, '100.0001');
    equal(app.doc.activeElement.id, 'discount-two');
    equal(app.doc.querySelector('#tool-status').dataset.kind, 'error');
  } finally { closeApp(app); }
});

test('ubah mode mengosongkan field kedua/hasil dan clear mempertahankan mode serta fokus harga', async () => {
  const app = await openApp();
  try {
    calculateInApp(app, 'double', '200000', '20', '10');
    app.doc.querySelector('#discount-mode').value = 'single';
    app.doc.querySelector('#discount-mode').dispatchEvent(new app.win.Event('change', { bubbles: true }));
    equal(app.doc.querySelector('#discount-two').value, '');
    equal(app.doc.querySelector('#second-field').hidden, true);
    equal(app.doc.querySelector('#result-card').hidden, true);
    app.doc.querySelector('#discount-mode').value = 'double';
    app.doc.querySelector('#discount-mode').dispatchEvent(new app.win.Event('change', { bubbles: true }));
    app.doc.querySelector('#example-button').click();
    equal(app.doc.querySelector('#price-input').value, '200000');
    equal(app.doc.querySelector('#discount-two').value, '10');
    equal(app.doc.querySelector('#result-card').hidden, true);
    app.doc.querySelector('#clear-button').click();
    equal(app.doc.querySelector('#discount-mode').value, 'double');
    equal(app.doc.activeElement.id, 'price-input');
  } finally { closeApp(app); }
});

test('salin menyertakan masukan, tahap, hasil, hemat, efektif, dan kebijakan rounding', async () => {
  const app = await openApp();
  try {
    let copied = '';
    setClipboard(app.win, async text => { copied = text; });
    calculateInApp(app, 'double', '200000', '20', '10');
    app.doc.querySelector('#copy-button').click();
    await waitFor(() => app.doc.querySelector('#tool-status').textContent.includes('berhasil disalin'));
    for (const phrase of ['Harga awal: Rp200000,00', 'Diskon 1: 20%', 'Diskon 2: 10%', 'Harga akhir: Rp144000,00', 'Total hemat: Rp56000,00', '28,00%', 'setiap tahap']) assert(copied.includes(phrase));
  } finally { closeApp(app); }
});

test('contoh memuat tanpa menghitung, dan edit input membatalkan hasil lama', async () => {
  const app = await openApp();
  try {
    app.doc.querySelector('#discount-mode').value = 'double';
    app.doc.querySelector('#discount-mode').dispatchEvent(new app.win.Event('change', { bubbles: true }));
    app.doc.querySelector('#example-button').click();
    equal(app.doc.querySelector('#price-input').value, '200000');
    equal(app.doc.querySelector('#discount-one').value, '20');
    equal(app.doc.querySelector('#discount-two').value, '10');
    equal(app.doc.querySelector('#result-card').hidden, true);
    app.doc.querySelector('#calculate-button').click();
    app.doc.querySelector('#price-input').value = '100';
    app.doc.querySelector('#price-input').dispatchEvent(new app.win.Event('input', { bubbles: true }));
    equal(app.doc.querySelector('#result-card').hidden, true);
    equal(app.doc.querySelector('#copy-button').disabled, true);
  } finally { closeApp(app); }
});

test('layout tidak melebar di empat lebar viewport', async () => {
  for (const width of [320, 390, 768, 1440]) {
    const app = await openApp(width);
    try {
      assert(app.doc.documentElement.scrollWidth <= width, `${width}px: ${app.doc.documentElement.scrollWidth}`);
      assert(app.doc.querySelector('#price-input').getBoundingClientRect().width > 0);
    } finally { closeApp(app); }
  }
});

await run();
