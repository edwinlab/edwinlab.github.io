import { assert, equal, throws, test, run } from '../tools/harness.js';
import { assertInputBounds, assertOutputSize, changeCase, createTitlePattern } from '/ubah-huruf/logic.js';

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
  frame.title = 'Ubah huruf untuk tes';
  frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:900px;border:0`;
  document.body.append(frame);
  frame.src = '/ubah-huruf/';
  await new Promise((resolve, reject) => {
    frame.addEventListener('load', resolve, { once: true });
    frame.addEventListener('error', () => reject(new Error('Route tool gagal dimuat.')), { once: true });
  });
  const win = frame.contentWindow;
  await waitFor(() => win.document.querySelector('#transform-button') && win.document.querySelector('#tool-status').getAttribute('aria-live') === 'polite');
  return { frame, win, doc: win.document };
}

function closeApp(app) { app.frame.remove(); }
function transform(app, text, mode = 'upper') {
  const input = app.doc.querySelector('#case-input');
  input.value = text;
  app.doc.querySelector('#case-mode').value = mode;
  app.doc.querySelector('#transform-button').click();
  return app.doc.querySelector('#case-output').value;
}
function setClipboard(win, writeText) {
  Object.defineProperty(win.navigator, 'clipboard', { configurable: true, value: { writeText } });
}

test('HURUF BESAR menggunakan locale Indonesia', () => {
  equal(changeCase('Halo dunia!', 'upper'), 'HALO DUNIA!');
  equal(changeCase('jalan ß 😀', 'upper'), 'JALAN SS 😀');
});

test('huruf kecil mempertahankan digit, tanda baca, dan baris', () => {
  equal(changeCase('EDWIN 123\nLAB!', 'lower'), 'edwin 123\nlab!');
});

test('kapital awal sederhana menerapkan kapital pada semua token huruf', () => {
  equal(changeCase('nASA dan iPhone', 'title'), 'Nasa Dan Iphone');
  equal(changeCase("anak-anak o'NEILL 123abc", 'title'), "Anak-Anak O'Neill 123Abc");
});

test('kapital awal mempertahankan combining mark tanpa normalisasi', () => {
  const result = changeCase('e\u0301COLE', 'title');
  equal(result, 'E\u0301cole');
  equal(result.codePointAt(1), 0x0301);
});

test('kapital awal menyalin semua whitespace persis', () => {
  equal(changeCase(' \tHalo\r\nDunia  ', 'upper'), ' \tHALO\r\nDUNIA  ');
  equal(changeCase(' \tHalo\r\nDunia  ', 'lower'), ' \thalo\r\ndunia  ');
});

test('string kosong sah di ketiga mode dan markup hanya menjadi teks', () => {
  for (const mode of ['upper', 'lower', 'title']) equal(changeCase('', mode), '');
  equal(changeCase('<b>halo</b>', 'upper'), '<B>HALO</B>');
});

test('mode tidak dikenal melempar INVALID_MODE', () => {
  equal(throws(() => changeCase('Halo', 'sentence'), 'INVALID_MODE').code, 'INVALID_MODE');
});

test('fitur property escape tidak didukung melempar CASE_UNSUPPORTED', () => {
  class UnsupportedRegExp { constructor() { throw new SyntaxError('property escapes unsupported'); } }
  equal(throws(() => createTitlePattern(UnsupportedRegExp), 'CASE_UNSUPPORTED').code, 'CASE_UNSUPPORTED');
});

test('batas 100.000 code points menerima tepat batas dan menolak satu lebih', () => {
  equal(changeCase('a'.repeat(100000), 'upper').length, 100000);
  equal(throws(() => changeCase('a'.repeat(100001), 'upper'), 'INPUT_TOO_LARGE').code, 'INPUT_TOO_LARGE');
});

test('batas 400.000 byte UTF-8 menerima tepat 100.000 emoji', () => {
  const exact = '😀'.repeat(100000);
  assertInputBounds(exact);
  equal(changeCase(exact, 'upper'), exact);
});

test('batas output menerima tepat 800.000 byte dan menolak satu byte lebih', () => {
  equal(assertOutputSize('a'.repeat(800000)).length, 800000);
  equal(throws(() => assertOutputSize('a'.repeat(800001)), 'OUTPUT_TOO_LARGE').code, 'OUTPUT_TOO_LARGE');
});

test('direct route memuat SEO, konten statis, dan tanpa noindex', async () => {
  const app = await openApp();
  try {
    equal(app.doc.title, 'Ubah Huruf Besar, Kecil, dan Kapital Online | Edwin Lab');
    equal(app.doc.documentElement.lang, 'id');
    equal(app.doc.querySelector('link[rel="canonical"]').href, 'https://edwinlab.dev/ubah-huruf/');
    equal(app.doc.querySelector('meta[name="robots"]'), null);
    equal(app.doc.querySelectorAll('h1').length, 1);
    assert(app.doc.querySelector('article').textContent.includes('NASA menjadi Nasa'));
    assert(app.doc.querySelector('noscript'));
  } finally { closeApp(app); }
});

test('transform menampilkan teks literal dengan mode yang dipilih', async () => {
  const app = await openApp();
  try {
    equal(transform(app, '<b>halo</b>', 'upper'), '<B>HALO</B>');
    equal(app.doc.querySelectorAll('b').length, 0);
    equal(app.doc.querySelector('#copy-button').disabled, false);
    equal(app.doc.querySelector('#download-button').disabled, false);
  } finally { closeApp(app); }
});

test('hasil kosong memberi pesan tepat dan menonaktifkan salin/unduh', async () => {
  const app = await openApp();
  try {
    equal(transform(app, '', 'upper'), '');
    assert(app.doc.querySelector('#tool-status').textContent.includes('Teks kosong; tidak ada hasil untuk disalin'));
    equal(app.doc.querySelector('#copy-button').disabled, true);
    equal(app.doc.querySelector('#download-button').disabled, true);
  } finally { closeApp(app); }
});

test('whitespace-only result tetap tersedia untuk salin dan unduh', async () => {
  const app = await openApp();
  try {
    equal(transform(app, ' \t\n', 'upper'), ' \t\n');
    equal(app.doc.querySelector('#copy-button').disabled, false);
    equal(app.doc.querySelector('#download-button').disabled, false);
  } finally { closeApp(app); }
});

test('edit teks atau mode menghapus hasil stale dan mematikan tombol', async () => {
  const app = await openApp();
  try {
    transform(app, 'Halo', 'upper');
    app.doc.querySelector('#case-input').value = 'Berubah';
    app.doc.querySelector('#case-input').dispatchEvent(new app.win.Event('input', { bubbles: true }));
    equal(app.doc.querySelector('#case-output').value, '');
    equal(app.doc.querySelector('#copy-button').disabled, true);
    equal(app.doc.querySelector('#download-button').disabled, true);
    transform(app, 'Halo', 'upper');
    app.doc.querySelector('#case-mode').value = 'lower';
    app.doc.querySelector('#case-mode').dispatchEvent(new app.win.Event('change', { bubbles: true }));
    equal(app.doc.querySelector('#case-output').value, '');
    equal(app.doc.querySelector('#copy-button').disabled, true);
  } finally { closeApp(app); }
});

test('contoh hanya mengisi input dan clear mereset mode serta fokus', async () => {
  const app = await openApp();
  try {
    app.doc.querySelector('#case-mode').value = 'lower';
    app.doc.querySelector('#example-button').click();
    equal(app.doc.querySelector('#case-input').value, 'NASA dan iPhone: belajar bersama.');
    equal(app.doc.querySelector('#case-output').value, '');
    equal(app.doc.activeElement.id, 'case-input');
    app.doc.querySelector('#case-input').value = 'teks';
    app.doc.querySelector('#case-mode').value = 'title';
    app.doc.querySelector('#clear-button').click();
    equal(app.doc.querySelector('#case-input').value, '');
    equal(app.doc.querySelector('#case-output').value, '');
    equal(app.doc.querySelector('#case-mode').value, 'upper');
    equal(app.doc.activeElement.id, 'case-input');
  } finally { closeApp(app); }
});

test('batas input pada UI memberi error dan mempertahankan teks', async () => {
  const app = await openApp();
  try {
    const source = 'x'.repeat(100001);
    app.doc.querySelector('#case-input').value = source;
    app.doc.querySelector('#transform-button').click();
    equal(app.doc.querySelector('#case-input').value.length, 100001);
    equal(app.doc.querySelector('#tool-status').dataset.kind, 'error');
    equal(app.doc.querySelector('#case-output').value, '');
    equal(app.doc.querySelector('#copy-button').disabled, true);
  } finally { closeApp(app); }
});

test('copy sukses dan gagal memakai status Indonesia', async () => {
  const app = await openApp();
  try {
    let copied = '';
    setClipboard(app.win, async text => { copied = text; });
    transform(app, 'Halo', 'upper');
    app.doc.querySelector('#copy-button').click();
    await waitFor(() => app.doc.querySelector('#tool-status').textContent.includes('berhasil disalin'));
    equal(copied, 'HALO');
    setClipboard(app.win, async () => { throw new Error('denied'); });
    app.doc.querySelector('#copy-button').click();
    await waitFor(() => app.doc.querySelector('#tool-status').textContent.includes('manual'));
    equal(app.doc.querySelector('#tool-status').dataset.kind, 'warning');
  } finally { closeApp(app); }
});

test('unduh memuat hasil UTF-8 dengan nama dan MIME yang ditentukan', async () => {
  const app = await openApp();
  const oldCreate = Object.getOwnPropertyDescriptor(app.win.URL, 'createObjectURL');
  const oldClick = Object.getOwnPropertyDescriptor(app.win.HTMLAnchorElement.prototype, 'click');
  let capturedBlob = null;
  let capturedName = '';
  try {
    Object.defineProperty(app.win.URL, 'createObjectURL', { configurable: true, value: blob => { capturedBlob = blob; return 'blob:case-test'; } });
    Object.defineProperty(app.win.HTMLAnchorElement.prototype, 'click', { configurable: true, value() { capturedName = this.download; } });
    transform(app, 'straße', 'upper');
    app.doc.querySelector('#download-button').click();
    equal(capturedName, 'hasil-ubah-huruf.txt');
    equal(capturedBlob.type, 'text/plain;charset=utf-8');
    equal(await capturedBlob.text(), 'STRASSE');
    assert(app.doc.querySelector('#tool-status').textContent.includes('Unduhan TXT dimulai'));
  } finally {
    if (oldCreate) Object.defineProperty(app.win.URL, 'createObjectURL', oldCreate);
    else delete app.win.URL.createObjectURL;
    if (oldClick) Object.defineProperty(app.win.HTMLAnchorElement.prototype, 'click', oldClick);
    else delete app.win.HTMLAnchorElement.prototype.click;
    closeApp(app);
  }
});

test('tidak ada overflow horizontal pada 320, 390, 768, dan 1440 px', async () => {
  for (const width of [320, 390, 768, 1440]) {
    const app = await openApp(width);
    try {
      assert(app.doc.documentElement.scrollWidth <= width, `${width}px: scrollWidth ${app.doc.documentElement.scrollWidth}`);
      assert(app.doc.querySelector('#case-input').getBoundingClientRect().width > 0);
    } finally { closeApp(app); }
  }
});

await run();
