import { assert, equal, throws, test, run } from '../tools/harness.js';
import { getQrLayout, validatePayload } from '/pembuat-qr-code/logic.js';
import { makeQrMatrix } from '/everyday/shared/qr.js';

const tick = () => new Promise(resolve => setTimeout(resolve, 0));
function waitFor(predicate, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const started = performance.now();
    const check = () => {
      try { if (predicate()) return resolve(); }
      catch (error) { return reject(error); }
      if (performance.now() - started > timeout) return reject(new Error('Aplikasi atau ekspor PNG tidak selesai.'));
      setTimeout(check, 20);
    };
    check();
  });
}
async function openApp(width = 900) {
  const frame = document.createElement('iframe');
  frame.title = 'Pembuat QR code untuk tes';
  frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:1200px;border:0`;
  document.body.append(frame);
  frame.src = '/pembuat-qr-code/';
  await new Promise((resolve, reject) => {
    frame.addEventListener('load', resolve, { once: true });
    frame.addEventListener('error', () => reject(new Error('Route pembuat QR gagal dimuat.')), { once: true });
  });
  const win = frame.contentWindow;
  await waitFor(() => win.document.querySelector('#tool-status').getAttribute('aria-live') === 'polite');
  return { frame, win, doc: win.document };
}
function closeApp(app) { app.frame.remove(); }
function selectMode(app, value) {
  const radio = app.doc.querySelector(`input[name="payload-mode"][value="${value}"]`);
  radio.checked = true;
  radio.dispatchEvent(new app.win.Event('change', { bubbles: true }));
}
async function generate(app, payload, mode = 'url') {
  selectMode(app, mode);
  const input = app.doc.querySelector('#payload-input');
  input.value = payload;
  input.dispatchEvent(new app.win.Event('input', { bubbles: true }));
  app.doc.querySelector('#create-button').click();
  await waitFor(() => app.doc.querySelector('#tool-status').dataset.kind === 'success');
}
function canvasPng(canvas) {
  return new Promise((resolve, reject) => {
    try { canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Canvas tidak membuat PNG.')), 'image/png'); }
    catch (error) { reject(error); }
  });
}
async function decodeCanvas(canvas) {
  const blob = await canvasPng(canvas);
  equal(blob.type, 'image/png');
  const bitmap = await createImageBitmap(blob);
  try {
    const decodedCanvas = document.createElement('canvas');
    decodedCanvas.width = bitmap.width;
    decodedCanvas.height = bitmap.height;
    const context = decodedCanvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(bitmap, 0, 0);
    const image = context.getImageData(0, 0, bitmap.width, bitmap.height);
    const decoded = globalThis.jsQR(image.data, bitmap.width, bitmap.height, { inversionAttempts: 'dontInvert' });
    assert(decoded, 'PNG hasil tidak dapat didecode jsQR.');
    return { decoded, image, blob };
  } finally { bitmap.close(); }
}
function utf8(text) { return Array.from(new TextEncoder().encode(text)); }
function assertBytes(actual, expected) {
  equal(actual.length, expected.length);
  for (let i = 0; i < expected.length; i += 1) equal(actual[i], expected[i]);
}

// Pure validation and exact local QR layout.
test('mode URL memangkas ASCII tepi tetapi mempertahankan payload tepat setelah trim', () => {
  equal(validatePayload(' \t https://example.com/?a=1&b=dua%20kata \n', 'url'), 'https://example.com/?a=1&b=dua%20kata');
  equal(validatePayload('https://edwinlab.dev/', 'url'), 'https://edwinlab.dev/');
});
test('mode URL menolak skema lain, URL relatif, host kosong, dan kredensial', () => {
  for (const raw of ['javascript:alert(1)', 'ftp://example.com', '/halaman', 'https://', 'http://', 'https://user:pass@example.com', 'https://@example.com']) throws(() => validatePayload(raw, 'url'), 'INVALID_URL');
});
test('teks literal boleh berisi javascript; whitespace-only dan mode asing ditolak', () => {
  equal(validatePayload(' javascript:alert(1)\nHalo ', 'text'), ' javascript:alert(1)\nHalo ');
  throws(() => validatePayload('', 'text'), 'INVALID_QR_TEXT');
  throws(() => validatePayload(' \n\t ', 'text'), 'INVALID_QR_TEXT');
  throws(() => validatePayload('x', 'other'), 'INVALID_MODE');
});
test('validasi menolak lone surrogate dan menerima batas tepat 1000 byte UTF-8', () => {
  throws(() => validatePayload('\uD800', 'text'), 'INVALID_QR_TEXT');
  equal(validatePayload('a'.repeat(1000), 'text').length, 1000);
  equal(validatePayload('😀'.repeat(250), 'text'), '😀'.repeat(250));
  throws(() => validatePayload('a'.repeat(1001), 'text'), 'INPUT_TOO_LARGE');
  throws(() => validatePayload('😀'.repeat(251), 'text'), 'INPUT_TOO_LARGE');
});
test('matrix layout menjaga empat modul quiet zone dan skala pixel integer', () => {
  const short = getQrLayout(21);
  equal(short.modulePixels, 26); equal(short.quietModules, 4); equal(short.size, 754);
  const dense = getQrLayout(57);
  equal(dense.modulePixels, 11); equal(dense.quietModules, 4); equal(dense.size, 715);
  for (const invalid of [0, 20, 22, 181, 21.5]) throws(() => getQrLayout(invalid), 'INVALID_QR_MATRIX');
});
test('HTML awal memiliki metadata unik, panduan statis, FAQ dan route kandidat siap', async () => {
  const response = await fetch('/pembuat-qr-code/');
  const html = await response.text();
  assert(html.includes('<html lang="id">'));
  assert(html.includes('<title>Pembuat QR Code Gratis untuk Link dan Teks | Edwin Lab</title>'));
  assert(html.includes('https://edwinlab.dev/pembuat-qr-code/'));
  assert(html.includes('Apakah QR code ini kedaluwarsa?'));
  assert(html.includes('https://edwinlab.dev/'));
  assert(html.includes('Input tidak dikirim ke layanan QR.'));
  assert(html.includes('/link-whatsapp/'));
  assert(html.includes('<noscript>'));
});

test('matrix library dan PNG lokal decode exact UTF-8 untuk URL, query, Latin, emoji, dan multiline', async () => {
  const app = await openApp();
  try {
    const cases = [
      ['https://edwinlab.dev/', 'url'],
      ['https://example.com/?a=1&b=dua%20kata', 'url'],
      ['Halo dunia!', 'text'],
      ['café', 'text'],
      ['Halo 👋', 'text'],
      ['Satu\nDua', 'text'],
    ];
    for (const [payload, mode] of cases) {
      await generate(app, payload, mode);
      const { decoded } = await decodeCanvas(app.doc.querySelector('#qr-canvas'));
      equal(decoded.data, payload);
      assertBytes(decoded.binaryData, utf8(payload));
    }
  } finally { closeApp(app); }
});
test('batas 1000 ASCII dan 250 emoji menghasilkan PNG yang tetap dapat didecode', async () => {
  const app = await openApp();
  try {
    for (const payload of ['a'.repeat(1000), '😀'.repeat(250)]) {
      await generate(app, payload, 'text');
      const { decoded, blob } = await decodeCanvas(app.doc.querySelector('#qr-canvas'));
      equal(decoded.data, payload);
      assertBytes(decoded.binaryData, utf8(payload));
      assert(blob.size > 0 && blob.size <= 20 * 1024 * 1024);
    }
  } finally { closeApp(app); }
});
test('mode teks membuat string berbahaya sebagai teks literal tanpa membuka tautan', async () => {
  const app = await openApp();
  try {
    const literal = 'javascript:alert(1)';
    await generate(app, literal, 'text');
    equal(app.doc.querySelector('#payload-output').value, literal);
    equal(app.doc.querySelector('#download-button').disabled, false);
  } finally { closeApp(app); }
});
test('layout PNG app mempunyai quiet zone putih dan sel modul tanpa pixel antialias', async () => {
  const app = await openApp();
  try {
    await generate(app, 'https://edwinlab.dev/', 'url');
    const canvas = app.doc.querySelector('#qr-canvas');
    const matrix = makeQrMatrix('https://edwinlab.dev/');
    const layout = getQrLayout(matrix.length);
    equal(canvas.width, layout.size); equal(canvas.height, layout.size);
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const sample = (x, y) => Array.from(pixels.slice((y * canvas.width + x) * 4, (y * canvas.width + x) * 4 + 4));
    for (const [x, y] of [[0, 0], [layout.size - 1, 0], [0, layout.size - 1], [layout.size - 1, layout.size - 1], [layout.quietModules * layout.modulePixels - 1, Math.floor(layout.size / 2)]]) equal(sample(x, y).join(','), '255,255,255,255');
    for (let y = 0; y < canvas.height; y += 1) for (let x = 0; x < canvas.width; x += 1) {
      const rgba = sample(x, y);
      assert((rgba[0] === 0 || rgba[0] === 255) && rgba[0] === rgba[1] && rgba[1] === rgba[2] && rgba[3] === 255, 'Canvas mengandung pixel selain hitam/putih opaque.');
    }
    for (const [row, column] of [[0, 0], [0, 1], [Math.floor(matrix.length / 2), Math.floor(matrix.length / 2)], [matrix.length - 1, matrix.length - 1]]) {
      const x = (column + layout.quietModules) * layout.modulePixels + Math.floor(layout.modulePixels / 2);
      const y = (row + layout.quietModules) * layout.modulePixels + Math.floor(layout.modulePixels / 2);
      equal(sample(x, y)[0], matrix[row][column] ? 0 : 255);
    }
  } finally { closeApp(app); }
});
test('URL invalid mempertahankan input, fokus textarea dan tidak meninggalkan unduhan', async () => {
  const app = await openApp();
  try {
    const input = app.doc.querySelector('#payload-input');
    input.value = 'javascript:alert(1)';
    app.doc.querySelector('#create-button').click();
    await waitFor(() => app.doc.querySelector('#tool-status').dataset.kind === 'error');
    equal(input.value, 'javascript:alert(1)');
    equal(app.doc.activeElement, input);
    equal(app.doc.querySelector('#result-card').hidden, true);
    equal(app.doc.querySelector('#download-button').disabled, true);
  } finally { closeApp(app); }
});
test('edit, mode change, clear, dan error membatalkan hasil dan menonaktifkan download lama', async () => {
  const app = await openApp();
  try {
    await generate(app, 'https://edwinlab.dev/', 'url');
    const input = app.doc.querySelector('#payload-input');
    input.value = 'https://example.com/';
    input.dispatchEvent(new app.win.Event('input', { bubbles: true }));
    equal(app.doc.querySelector('#result-card').hidden, true);
    equal(app.doc.querySelector('#download-button').disabled, true);
    await generate(app, 'Halo dunia!', 'text');
    app.doc.querySelector('#clear-button').click();
    equal(app.doc.querySelector('input[name="payload-mode"]:checked').value, 'url');
    equal(input.value, '');
    equal(app.doc.activeElement, input);
    equal(app.doc.querySelector('#download-button').disabled, true);
  } finally { closeApp(app); }
});
test('contoh mengisi konten lokal tanpa membuat QR otomatis', async () => {
  const app = await openApp();
  try {
    app.doc.querySelector('#example-button').click();
    equal(app.doc.querySelector('#payload-input').value, 'https://edwinlab.dev/');
    equal(app.doc.querySelector('#result-card').hidden, true);
    equal(app.doc.querySelector('#download-button').disabled, true);
    selectMode(app, 'text');
    app.doc.querySelector('#example-button').click();
    equal(app.doc.querySelector('#payload-input').value, 'Halo dunia!');
    equal(app.doc.querySelector('#result-card').hidden, true);
  } finally { closeApp(app); }
});
test('counter memperlihatkan jumlah byte sesuai mode dan input tidak ditulis pada URL halaman', async () => {
  const app = await openApp();
  try {
    const input = app.doc.querySelector('#payload-input');
    input.value = 'Halo 👋';
    input.dispatchEvent(new app.win.Event('input', { bubbles: true }));
    assert(app.doc.querySelector('#byte-count').textContent.includes('9/1000 byte'));
    selectMode(app, 'text');
    assert(app.doc.querySelector('#byte-count').textContent.includes('9/1000 byte'));
    equal(app.win.location.search, '');
    equal(app.win.location.hash, '');
  } finally { closeApp(app); }
});
test('unduh hanya mengirim PNG terbaru dengan nama qr-code.png', async () => {
  const app = await openApp();
  const oldCreate = app.win.URL.createObjectURL;
  const oldRevoke = app.win.URL.revokeObjectURL;
  const oldClick = app.win.HTMLAnchorElement.prototype.click;
  try {
    let createdType = '';
    let downloadName = '';
    app.win.URL.createObjectURL = blob => { createdType = blob.type; return 'blob:qr-test'; };
    app.win.URL.revokeObjectURL = () => {};
    app.win.HTMLAnchorElement.prototype.click = function () { downloadName = this.download; equal(this.href, 'blob:qr-test'); };
    await generate(app, 'https://edwinlab.dev/', 'url');
    app.doc.querySelector('#download-button').click();
    equal(createdType, 'image/png');
    equal(downloadName, 'qr-code.png');
  } finally {
    app.win.URL.createObjectURL = oldCreate;
    app.win.URL.revokeObjectURL = oldRevoke;
    app.win.HTMLAnchorElement.prototype.click = oldClick;
    closeApp(app);
  }
});
test('toBlob null dan MIME selain PNG tidak membuat hasil dapat diunduh', async () => {
  const app = await openApp();
  const original = app.win.HTMLCanvasElement.prototype.toBlob;
  try {
    app.win.HTMLCanvasElement.prototype.toBlob = function (callback) { callback(null); };
    app.doc.querySelector('#payload-input').value = 'https://edwinlab.dev/';
    app.doc.querySelector('#create-button').click();
    await waitFor(() => app.doc.querySelector('#tool-status').dataset.kind === 'error');
    equal(app.doc.querySelector('#download-button').disabled, true);
    app.win.HTMLCanvasElement.prototype.toBlob = function (callback) { callback(new app.win.Blob(['x'], { type: 'image/jpeg' })); };
    app.doc.querySelector('#create-button').click();
    await waitFor(() => app.doc.querySelector('#tool-status').dataset.kind === 'error');
    equal(app.doc.querySelector('#download-button').disabled, true);
  } finally {
    app.win.HTMLCanvasElement.prototype.toBlob = original;
    closeApp(app);
  }
});
test('hasil toBlob yang selesai setelah edit tidak mengganti QR yang dibatalkan', async () => {
  const app = await openApp();
  const original = app.win.HTMLCanvasElement.prototype.toBlob;
  let finishEncoding;
  try {
    app.win.HTMLCanvasElement.prototype.toBlob = function (callback) { finishEncoding = callback; };
    app.doc.querySelector('#payload-input').value = 'https://edwinlab.dev/';
    app.doc.querySelector('#create-button').click();
    await waitFor(() => typeof finishEncoding === 'function');
    const input = app.doc.querySelector('#payload-input');
    input.value = 'https://example.com/';
    input.dispatchEvent(new app.win.Event('input', { bubbles: true }));
    finishEncoding(new app.win.Blob(['stale'], { type: 'image/png' }));
    await tick();
    await tick();
    equal(app.doc.querySelector('#result-card').hidden, true);
    equal(app.doc.querySelector('#download-button').disabled, true);
  } finally {
    app.win.HTMLCanvasElement.prototype.toBlob = original;
    closeApp(app);
  }
});
test('tombol buat mencegah dua pekerjaan encode yang tumpang tindih', async () => {
  const app = await openApp();
  const original = app.win.HTMLCanvasElement.prototype.toBlob;
  let calls = 0;
  let finish;
  try {
    app.win.HTMLCanvasElement.prototype.toBlob = function (callback) { calls += 1; finish = callback; };
    app.doc.querySelector('#payload-input').value = 'https://edwinlab.dev/';
    app.doc.querySelector('#create-button').click();
    app.doc.querySelector('#create-button').click();
    equal(calls, 1);
    finish(new app.win.Blob(['png'], { type: 'image/png' }));
    await waitFor(() => app.doc.querySelector('#tool-status').dataset.kind === 'success');
  } finally {
    app.win.HTMLCanvasElement.prototype.toBlob = original;
    closeApp(app);
  }
});
test('layout tidak overflow pada 320, 390, 768, dan 1440 piksel', async () => {
  for (const width of [320, 390, 768, 1440]) {
    const app = await openApp(width);
    try {
      await tick();
      assert(app.doc.documentElement.scrollWidth <= app.doc.documentElement.clientWidth, `Overflow pada ${width}px`);
      await generate(app, 'https://example.com/?a=1&b=dua%20kata', 'url');
      assert(app.doc.documentElement.scrollWidth <= app.doc.documentElement.clientWidth, `Overflow hasil pada ${width}px`);
    } finally { closeApp(app); }
  }
});

run();
