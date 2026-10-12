import { assert, deepEqual, equal, throws, test, run } from '../tools/harness.js';
import { countText, createSegmenters, createSummary, formatReadingTime, parseReadingRate } from '/penghitung-kata/logic.js';

const segmenters = createSegmenters();
const tuple = (text, rate = 200) => {
  const result = countText(text, rate, segmenters);
  return [result.words, result.characters, result.charactersWithoutWhitespace, result.lines, result.paragraphs, result.readingSeconds];
};

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
  frame.title = 'Penghitung kata untuk tes';
  frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:900px;border:0`;
  document.body.append(frame);
  frame.src = '/penghitung-kata/';
  await new Promise((resolve, reject) => {
    frame.addEventListener('load', resolve, { once: true });
    frame.addEventListener('error', () => reject(new Error('Route tool gagal dimuat.')), { once: true });
  });
  const win = frame.contentWindow;
  await waitFor(() => win.document.querySelector('#count-button') && !win.document.querySelector('#count-button').disabled);
  return { frame, win, doc: win.document };
}

function closeApp(app) { app.frame.remove(); }
function setClipboard(win, writeText) {
  Object.defineProperty(win.navigator, 'clipboard', { configurable: true, value: { writeText } });
}

test('fixture kosong dan whitespace', () => {
  deepEqual(tuple(''), [0, 0, 0, 0, 0, 0]);
  deepEqual(tuple(' \t\n'), [0, 3, 0, 2, 0, 0]);
});

test('fixture kalimat, karakter, baris, dan paragraf', () => {
  deepEqual(tuple('Halo dunia!'), [2, 11, 10, 1, 1, 1]);
  deepEqual(tuple('Halo\tDunia\nLagi'), [3, 15, 13, 2, 1, 1]);
  deepEqual(tuple('123 45'), [2, 6, 5, 1, 1, 1]);
});

test('CRLF dinormalisasi pada hitungan dan teks sumber tidak berubah', () => {
  const text = 'Satu\r\n\r\nDua';
  deepEqual(tuple(text), [2, 9, 7, 3, 2, 1]);
  equal(text, 'Satu\r\n\r\nDua');
});

test('gabungan diakritik dan emoji keluarga adalah satu grapheme', () => {
  deepEqual(tuple('e\u0301'), [1, 1, 1, 1, 1, 1]);
  deepEqual(tuple('👨‍👩‍👧‍👦'), [0, 1, 1, 1, 1, 0]);
});

test('401 kata menghasilkan durasi yang ditetapkan', () => {
  const text = 'kata '.repeat(400) + 'kata';
  deepEqual(tuple(text), [401, 2004, 1604, 1, 1, 121]);
  equal(countText(text, 400, segmenters).readingSeconds, 61);
  equal(formatReadingTime(121), '2 menit 1 detik');
});

test('batas code points tepat diterima dan satu di atas ditolak', () => {
  const noParts = { segment: () => [] };
  const fake = { word: noParts, grapheme: noParts };
  equal(countText('a'.repeat(100000), 200, fake).characters, 0);
  equal(throws(() => countText('a'.repeat(100001), 200, fake), 'INPUT_TOO_LARGE').code, 'INPUT_TOO_LARGE');
});

test('batas 400.000 byte UTF-8 menerima tepat 100.000 emoji', () => {
  const noParts = { segment: () => [] };
  const fake = { word: noParts, grapheme: noParts };
  equal(countText('😀'.repeat(100000), 200, fake).words, 0);
});

test('batas byte dan code points ditolak segera sesudah terlampaui', () => {
  const noParts = { segment: () => [] };
  const fake = { word: noParts, grapheme: noParts };
  equal(throws(() => countText('😀'.repeat(100001), 200, fake), 'INPUT_TOO_LARGE').code, 'INPUT_TOO_LARGE');
});

test('laju baca menerima integer batas dan menolak grammar selain ASCII integer', () => {
  equal(parseReadingRate('50'), 50);
  equal(parseReadingRate('1000'), 1000);
  equal(parseReadingRate(' 200\t'), 200);
  for (const raw of ['49', '1001', '2e2', '200.5', '', '+200', '２００']) {
    equal(throws(() => parseReadingRate(raw), 'INVALID_READING_RATE').code, 'INVALID_READING_RATE');
  }
});

test('segmenter tidak tersedia menghasilkan kode error eksplisit', () => {
  equal(throws(() => createSegmenters({}), 'SEGMENTER_UNAVAILABLE').code, 'SEGMENTER_UNAVAILABLE');
  equal(throws(() => countText('Halo', 200, null), 'SEGMENTER_UNAVAILABLE').code, 'SEGMENTER_UNAVAILABLE');
});

test('ringkasan memuat enam statistik dan laju tanpa memasukkan teks sumber', () => {
  const result = countText('rahasia Halo', 200, segmenters);
  const copy = createSummary(result, 200);
  for (const label of ['Kata:', 'Karakter:', 'Karakter tanpa spasi, tab, dan baris baru:', 'Baris:', 'Paragraf:', 'Perkiraan waktu baca:', 'Kecepatan baca:']) assert(copy.includes(label));
  assert(!copy.includes('rahasia'));
  assert(new TextEncoder().encode(copy).byteLength <= 2048);
});

test('route langsung memuat title, canonical, metadata dan konten SEO statis', async () => {
  const app = await openApp();
  try {
    equal(app.doc.title, 'Penghitung Kata dan Karakter Online | Edwin Lab');
    equal(app.doc.documentElement.lang, 'id');
    equal(app.doc.querySelector('link[rel="canonical"]').href, 'https://edwinlab.dev/penghitung-kata/');
    assert(app.doc.querySelector('h1').textContent.includes('Penghitung Kata dan Karakter'));
    assert(app.doc.querySelector('article').textContent.includes('401 kata pada 200 kata per menit menjadi 2 menit 1 detik'));
    assert(app.doc.querySelector('noscript'));
  } finally { closeApp(app); }
});

test('input HTML tampil literal, hitung hasil tepat, dan trailing newline dihitung', async () => {
  const app = await openApp();
  try {
    const input = app.doc.querySelector('#source-text');
    input.value = '<img src=x onerror=alert(1)>\n';
    app.doc.querySelector('#count-button').click();
    equal(app.doc.querySelector('#results').hidden, false);
    equal(app.doc.querySelector('#result-lines').textContent, '2');
    equal(input.value, '<img src=x onerror=alert(1)>\n');
    equal(app.doc.querySelectorAll('img[src="x"]').length, 0);
  } finally { closeApp(app); }
});

test('edit setelah hitung menandai hasil stale dan menonaktifkan copy', async () => {
  const app = await openApp();
  try {
    app.doc.querySelector('#source-text').value = 'Halo dunia!';
    app.doc.querySelector('#count-button').click();
    equal(app.doc.querySelector('#copy-button').disabled, false);
    app.doc.querySelector('#source-text').value = 'Berubah';
    app.doc.querySelector('#source-text').dispatchEvent(new app.win.Event('input', { bubbles: true }));
    equal(app.doc.querySelector('#results').hidden, true);
    equal(app.doc.querySelector('#copy-button').disabled, true);
    assert(app.doc.querySelector('#tool-status').textContent.includes('Hitung kembali'));
  } finally { closeApp(app); }
});

test('contoh tidak menghitung otomatis dan clear mengembalikan laju serta fokus', async () => {
  const app = await openApp();
  try {
    app.doc.querySelector('#reading-rate').value = '400';
    app.doc.querySelector('#example-button').click();
    equal(app.doc.querySelector('#source-text').value, 'Halo dunia!');
    equal(app.doc.querySelector('#results').hidden, true);
    app.doc.querySelector('#clear-button').click();
    equal(app.doc.querySelector('#source-text').value, '');
    equal(app.doc.querySelector('#reading-rate').value, '200');
    equal(app.doc.activeElement.id, 'source-text');
  } finally { closeApp(app); }
});

test('rate invalid difokuskan dan hasil lama tidak dipakai', async () => {
  const app = await openApp();
  try {
    app.doc.querySelector('#source-text').value = 'Halo dunia!';
    app.doc.querySelector('#count-button').click();
    equal(app.doc.querySelector('#copy-button').disabled, false);
    const rate = app.doc.querySelector('#reading-rate');
    rate.value = '2e2';
    rate.dispatchEvent(new app.win.Event('input', { bubbles: true }));
    equal(app.doc.querySelector('#results').hidden, true);
    equal(app.doc.querySelector('#copy-button').disabled, true);
    app.doc.querySelector('#count-button').click();
    assert(app.doc.activeElement.id === 'reading-rate', `Input aktif setelah validasi: ${app.doc.activeElement.id || app.doc.activeElement.tagName}`);
    equal(app.doc.querySelector('#results').hidden, true);
    assert(app.doc.querySelector('#tool-status').textContent.includes('kecepatan baca'));
  } finally { closeApp(app); }
});

test('salin ringkasan mengirim teks ringkas tanpa input', async () => {
  const app = await openApp();
  try {
    let copied = '';
    setClipboard(app.win, async text => { copied = text; });
    app.doc.querySelector('#source-text').value = 'rahasia Halo';
    app.doc.querySelector('#count-button').click();
    app.doc.querySelector('#copy-button').click();
    await waitFor(() => app.doc.querySelector('#tool-status').textContent.includes('berhasil disalin'));
    assert(copied.includes('Kata: 2'));
    assert(!copied.includes('rahasia'));
  } finally { closeApp(app); }
});

test('salin gagal menampilkan instruksi manual', async () => {
  const app = await openApp();
  try {
    setClipboard(app.win, async () => { throw new Error('permission denied'); });
    app.doc.querySelector('#source-text').value = 'Halo';
    app.doc.querySelector('#count-button').click();
    app.doc.querySelector('#copy-button').click();
    await waitFor(() => app.doc.querySelector('#tool-status').textContent.includes('manual'));
    equal(app.doc.querySelector('#tool-status').dataset.kind, 'warning');
  } finally { closeApp(app); }
});

test('layout tidak meluap pada lebar 320, 390, 768, dan 1440 px', async () => {
  for (const width of [320, 390, 768, 1440]) {
    const app = await openApp(width);
    try {
      const root = app.doc.documentElement;
      assert(root.scrollWidth <= width, `${width}px: scrollWidth ${root.scrollWidth}`);
      assert(app.doc.querySelector('#source-text').getBoundingClientRect().width > 0);
    } finally { closeApp(app); }
  }
});

await run();
