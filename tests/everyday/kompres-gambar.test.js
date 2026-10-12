import { assert, equal, throws, test, run } from '../tools/harness.js';
import { summarizeBytes, validateQuality, formatByteSize } from '/kompres-gambar/logic.js';
import { MAX_IMAGE_BYTES, MAX_IMAGE_PIXELS, MAX_IMAGE_SIDE, MAX_MEDIA_OUTPUT_BYTES, decodeImage, encodeImage, inspectImage } from '/everyday/shared/image.js';

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
function waitFor(predicate, timeout = 6000) {
  return new Promise((resolve, reject) => {
    const started = performance.now();
    const check = () => {
      try { if (predicate()) return resolve(); }
      catch (error) { return reject(error); }
      if (performance.now() - started > timeout) return reject(new Error('Gambar atau hasil tidak siap dalam batas waktu.'));
      setTimeout(check, 20);
    };
    check();
  });
}
async function openApp(width = 900) {
  const frame = document.createElement('iframe');
  frame.title = 'Kompres gambar untuk tes';
  frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:1300px;border:0`;
  document.body.append(frame);
  frame.src = '/kompres-gambar/';
  await new Promise((resolve, reject) => {
    frame.addEventListener('load', resolve, { once: true });
    frame.addEventListener('error', () => reject(new Error('Route kompres gambar gagal dimuat.')), { once: true });
  });
  const win = frame.contentWindow;
  await waitFor(() => win.document.querySelector('#tool-status').getAttribute('aria-live') === 'polite');
  return { frame, win, doc: win.document };
}
function closeApp(app) { app.frame.remove(); }
async function canvasFile(mime, width = 4, height = 3, paint = null, name = 'fixture') {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const context = canvas.getContext('2d');
  if (paint) paint(context);
  else { context.fillStyle = '#d24b3b'; context.fillRect(0, 0, width, height); }
  const blob = await new Promise(resolve => canvas.toBlob(resolve, mime));
  canvas.width = 0; canvas.height = 0;
  assert(blob && blob.type === mime, `Browser tidak menghasilkan ${mime} untuk fixture.`);
  return new File([blob], `${name}.${mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg'}`, { type: mime });
}
function pngHeader(width, height, size = 45) {
  const bytes = new Uint8Array(size);
  bytes.set(PNG_SIGNATURE);
  const view = new DataView(bytes.buffer);
  view.setUint32(8, 13, false); bytes.set([73, 72, 68, 82], 12);
  view.setUint32(16, width, false); view.setUint32(20, height, false);
  bytes.set([8, 6, 0, 0, 0], 24);
  const idat = 33;
  view.setUint32(idat, size - 45, false); bytes.set([73, 68, 65, 84], idat + 4);
  return new File([bytes], 'cap.png', { type: 'image/png' });
}
function withExifOrientation6(fileBytes) {
  const app1 = new Uint8Array([
    0xff, 0xe1, 0x00, 0x22, 0x45, 0x78, 0x69, 0x66, 0, 0,
    0x49, 0x49, 0x2a, 0, 0x08, 0, 0, 0, 0x01, 0,
    0x12, 0x01, 0x03, 0, 0x01, 0, 0, 0, 0x06, 0, 0, 0, 0, 0, 0, 0,
  ]);
  const result = new Uint8Array(fileBytes.length + app1.length);
  result.set(fileBytes.subarray(0, 2)); result.set(app1, 2); result.set(fileBytes.subarray(2), 2 + app1.length);
  return new File([result], 'orientation-6.jpg', { type: 'image/jpeg' });
}
function setFile(app, file) {
  const transfer = new app.win.DataTransfer();
  transfer.items.add(file);
  const input = app.doc.querySelector('#image-file');
  input.files = transfer.files;
  input.dispatchEvent(new app.win.Event('change', { bubbles: true }));
}
async function loadFile(app, file) {
  setFile(app, file);
  await waitFor(() => app.doc.querySelector('#compress-button').disabled === false || app.doc.querySelector('#tool-status').dataset.kind === 'error');
  if (app.doc.querySelector('#compress-button').disabled) throw new Error(app.doc.querySelector('#tool-status').textContent);
  await waitFor(() => app.doc.querySelector('#original-preview').naturalWidth > 0);
}
async function compress(app) {
  app.doc.querySelector('#compress-button').click();
  await waitFor(() => !app.doc.querySelector('#result-card').hidden || app.doc.querySelector('#tool-status').dataset.kind === 'error');
  if (app.doc.querySelector('#result-card').hidden) throw new Error(app.doc.querySelector('#tool-status').textContent);
}
function withExif(fileBytes) { return withExifOrientation6(fileBytes); }

// Pure summaries, byte formatting, and quality guard.
test('ringkasan byte menghitung hemat, sama, dan hasil lebih besar dengan benar', () => {
  equal(JSON.stringify(summarizeBytes(100000, 60000)), JSON.stringify({ deltaBytes: 40000, savedPercent: 40, isSmaller: true }));
  equal(JSON.stringify(summarizeBytes(100000, 100000)), JSON.stringify({ deltaBytes: 0, savedPercent: 0, isSmaller: false }));
  equal(JSON.stringify(summarizeBytes(100000, 110000)), JSON.stringify({ deltaBytes: -10000, savedPercent: -10, isSmaller: false }));
});
test('ringkasan menolak byte nol, negatif, pecahan, nonfinite, dan unsafe integer', () => {
  for (const pair of [[0, 1], [1, 0], [-1, 1], [1, -1], [1.5, 1], [1, 1.5], [Infinity, 1], [Number.MAX_SAFE_INTEGER + 1, 1]]) throws(() => summarizeBytes(...pair), 'INVALID_SIZE');
});
test('kualitas menerima integer 60 sampai 95 dan menolak batas luar atau pecahan', () => {
  equal(validateQuality(60), 60); equal(validateQuality(95), 95); equal(validateQuality(80), 80);
  for (const value of [59, 96, 80.5, NaN, Infinity, '80']) throws(() => validateQuality(value), 'INVALID_QUALITY');
});
test('ukuran ditampilkan dalam byte tepat serta KiB/MiB basis 1024', () => {
  equal(formatByteSize(1000), '1000 byte (1,0 KiB)');
  equal(formatByteSize(1024), '1024 byte (1,0 KiB)');
  equal(formatByteSize(1048576), '1048576 byte (1,0 MiB)');
  throws(() => formatByteSize(-1), 'INVALID_SIZE');
});

test('validator file menerima tepat 10 MiB dan menolak satu byte lebih besar', async () => {
  const exact = pngHeader(1, 1, MAX_IMAGE_BYTES);
  equal(exact.size, MAX_IMAGE_BYTES);
  equal((await inspectImage(exact)).mime, 'image/png');
  const over = pngHeader(1, 1, MAX_IMAGE_BYTES + 1);
  equal((await capture(inspectImage(over))).code, 'INPUT_TOO_LARGE');
});
async function capture(promise) {
  try { await promise; } catch (error) { return error; }
  throw new Error('Fixture harus ditolak.');
}
test('validator dimensi menghormati batas 12 juta piksel dan 8192 px per sisi', async () => {
  equal((await inspectImage(pngHeader(4000, 3000))).width, 4000);
  equal(MAX_IMAGE_PIXELS, 12000000); equal(MAX_IMAGE_SIDE, 8192);
  equal((await capture(inspectImage(pngHeader(4001, 3000)))).code, 'IMAGE_DIMENSIONS');
  equal((await capture(inspectImage(pngHeader(8193, 1)))).code, 'IMAGE_DIMENSIONS');
});
test('signature PNG palsu, header rusak, dan format GIF ditolak oleh shared validator', async () => {
  equal((await capture(inspectImage(new File(['bad'], 'foto.jpg', { type: 'image/jpeg' })))).code, 'UNSUPPORTED_IMAGE');
  const broken = new Uint8Array(PNG_SIGNATURE); equal((await capture(inspectImage(new File([broken], 'broken.png')))).code, 'INVALID_IMAGE');
  equal((await capture(inspectImage(new File(['GIF89a'], 'animated.gif', { type: 'image/gif' })))).code, 'UNSUPPORTED_IMAGE');
});
test('JPEG 1200x800 tetap berukuran sama setelah encode JPEG', async () => {
  const file = await canvasFile('image/jpeg', 1200, 800);
  const { bitmap, width, height, mime } = await decodeImage(file);
  try {
    equal(width, 1200); equal(height, 800); equal(mime, 'image/jpeg');
    const blob = await encodeImage(bitmap, { width, height, mime: 'image/jpeg', quality: 0.8 });
    equal(blob.type, 'image/jpeg');
    const output = await createImageBitmap(blob);
    try { equal(output.width, 1200); equal(output.height, 800); } finally { output.close(); }
  } finally { bitmap.close(); }
});
test('PNG transparan ke JPEG memakai latar putih', async () => {
  const file = await canvasFile('image/png', 20, 10, context => {
    context.fillStyle = '#ff0000'; context.fillRect(0, 0, 8, 10);
  });
  const { bitmap, width, height } = await decodeImage(file);
  try {
    const blob = await encodeImage(bitmap, { width, height, mime: 'image/jpeg', quality: 0.95 });
    const output = await createImageBitmap(blob);
    try {
      const canvas = document.createElement('canvas'); canvas.width = 20; canvas.height = 10;
      const context = canvas.getContext('2d', { willReadFrequently: true }); context.drawImage(output, 0, 0);
      const data = context.getImageData(19, 5, 1, 1).data;
      assert(data[0] > 240 && data[1] > 240 && data[2] > 240, `Piksel transparan tidak putih: ${Array.from(data)}`);
      canvas.width = 0; canvas.height = 0;
    } finally { output.close(); }
  } finally { bitmap.close(); }
});
test('PNG ke WebP mempertahankan alpha jika encoder tersedia atau gagal dengan MIME jelas', async () => {
  const file = await canvasFile('image/png', 2, 1, context => { context.fillStyle = '#00ff00'; context.fillRect(0, 0, 1, 1); });
  const { bitmap, width, height } = await decodeImage(file);
  try {
    try {
      const blob = await encodeImage(bitmap, { width, height, mime: 'image/webp', quality: 0.8 });
      equal(blob.type, 'image/webp');
      const output = await createImageBitmap(blob);
      try {
        const canvas = document.createElement('canvas'); canvas.width = 2; canvas.height = 1;
        const context = canvas.getContext('2d', { willReadFrequently: true }); context.drawImage(output, 0, 0);
        equal(context.getImageData(1, 0, 1, 1).data[3], 0);
        canvas.width = 0; canvas.height = 0;
      } finally { output.close(); }
    } catch (error) {
      equal(error.code, 'ENCODE_FAILED');
      assert(error.message.includes('tidak mendukung hasil image/webp'));
    }
  } finally { bitmap.close(); }
});
test('EXIF orientation 6 diterapkan tepat sekali dan dimensi keluaran mengikuti orientasi', async () => {
  const jpeg = await canvasFile('image/jpeg', 3, 2, context => {
    context.fillStyle = '#f00'; context.fillRect(0, 0, 1, 2);
    context.fillStyle = '#00f'; context.fillRect(2, 0, 1, 2);
  });
  const source = new Uint8Array(await jpeg.arrayBuffer());
  const rotated = withExif(source);
  const { bitmap, width, height } = await decodeImage(rotated);
  try {
    equal(width, 2); equal(height, 3);
    const blob = await encodeImage(bitmap, { width, height, mime: 'image/jpeg', quality: 0.8 });
    const output = await createImageBitmap(blob);
    try { equal(output.width, 2); equal(output.height, 3); } finally { output.close(); }
  } finally { bitmap.close(); }
});
test('HTML statis memuat SEO, batas, transparency, kelebihan hasil besar dan privasi', async () => {
  const html = await (await fetch('/kompres-gambar/')).text();
  for (const phrase of ['<html lang="id">', '<title>Kompres Gambar JPG dan PNG Online | Edwin Lab</title>', 'Kompres Gambar</h1>', 'Maksimal 10 MiB', 'mengisi area transparan PNG dengan latar putih', 'Hasil lebih besar', 'Apakah gambar saya diunggah?', '200 KB', '<noscript>']) assert(html.includes(phrase), `Panduan statis tidak memuat: ${phrase}`);
});

// App workflows, browser APIs, lifecycle, and responsive layout.
test('default opsi JPEG 80, file input accept, dan tanpa hasil/unduh saat awal', async () => {
  const app = await openApp();
  try {
    equal(app.doc.querySelector('#output-format').value, 'jpeg');
    equal(app.doc.querySelector('#quality-input').value, '80');
    equal(app.doc.querySelector('#image-file').getAttribute('accept'), 'image/jpeg,image/png');
    equal(app.doc.querySelector('#compress-button').disabled, true);
    equal(app.doc.querySelector('#download-button').disabled, true);
  } finally { closeApp(app); }
});
test('file asli yang dipilih divalidasi dari bytes dan menampilkan MIME serta dimensi', async () => {
  const app = await openApp();
  try {
    const file = await canvasFile('image/jpeg', 7, 5, null, '<img asli>');
    await loadFile(app, file);
    assert(app.doc.querySelector('#file-info').textContent.includes('JPEG · 7 × 5 px'));
    assert(app.doc.querySelector('#original-preview').getAttribute('alt').includes('<img asli>'));
    equal(app.doc.querySelector('#original-preview').naturalWidth, 7);
  } finally { closeApp(app); }
});
test('contoh sintetis lokal dimuat tanpa kompres otomatis', async () => {
  const app = await openApp();
  try {
    app.doc.querySelector('#example-button').click();
    await waitFor(() => app.doc.querySelector('#compress-button').disabled === false);
    assert(app.doc.querySelector('#file-info').textContent.includes('contoh-transparan.png'));
    assert(app.doc.querySelector('#file-info').textContent.includes('160 × 120 px'));
    equal(app.doc.querySelector('#result-card').hidden, true);
    equal(app.doc.querySelector('#download-button').disabled, true);
  } finally { closeApp(app); }
});
test('hasil JPEG mempertahankan dimensi, menampilkan byte dan menyediakan nama unduh tetap', async () => {
  const app = await openApp();
  const oldCreate = app.win.URL.createObjectURL;
  const oldRevoke = app.win.URL.revokeObjectURL;
  const oldClick = app.win.HTMLAnchorElement.prototype.click;
  try {
    const file = await canvasFile('image/jpeg', 12, 8);
    await loadFile(app, file);
    await compress(app);
    equal(app.doc.querySelector('#result-preview').naturalWidth, 12);
    equal(app.doc.querySelector('#result-preview').naturalHeight, 8);
    assert(app.doc.querySelector('#size-summary').textContent.includes(`${file.size} byte`));
    let name = '';
    app.win.URL.createObjectURL = blob => { equal(blob.type, 'image/jpeg'); return 'blob:compress-test'; };
    app.win.URL.revokeObjectURL = () => {};
    app.win.HTMLAnchorElement.prototype.click = function () { name = this.download; };
    app.doc.querySelector('#download-button').click();
    equal(name, 'gambar-kompres.jpg');
  } finally {
    app.win.URL.createObjectURL = oldCreate;
    app.win.URL.revokeObjectURL = oldRevoke;
    app.win.HTMLAnchorElement.prototype.click = oldClick;
    closeApp(app);
  }
});
test('hasil WebP memakai MIME dan nama yang cocok saat encoder tersedia', async () => {
  const app = await openApp();
  try {
    const file = await canvasFile('image/png', 8, 6);
    await loadFile(app, file);
    app.doc.querySelector('#output-format').value = 'webp';
    app.doc.querySelector('#output-format').dispatchEvent(new app.win.Event('change', { bubbles: true }));
    app.doc.querySelector('#compress-button').click();
    await waitFor(() => !app.doc.querySelector('#result-card').hidden || app.doc.querySelector('#tool-status').dataset.kind === 'error');
    if (app.doc.querySelector('#tool-status').dataset.kind === 'error') {
      assert(app.doc.querySelector('#tool-status').textContent.includes('Pilih format JPEG'));
      equal(app.doc.querySelector('#download-button').disabled, true);
    } else {
      assert(app.doc.querySelector('#result-meta').textContent.startsWith('WEBP'));
      equal(app.doc.querySelector('#result-preview').naturalWidth, 8);
    }
  } finally { closeApp(app); }
});
test('PNG kecil yang menghasilkan JPEG lebih besar diberi peringatan jujur', async () => {
  const app = await openApp();
  try {
    const file = await canvasFile('image/png', 2, 2, context => { context.fillStyle = '#111'; context.fillRect(0, 0, 2, 2); });
    await loadFile(app, file);
    await compress(app);
    const resultBytes = Number(app.doc.querySelector('#size-summary').textContent.match(/Ukuran hasil: ([0-9]+) byte/)[1]);
    assert(resultBytes > file.size, `Fixture PNG kecil harus menghasilkan JPEG lebih besar; asli ${file.size}, hasil ${resultBytes}.`);
    assert(app.doc.querySelector('#larger-notice').textContent.includes('Hasil lebih besar dari file asli. Coba kualitas lebih rendah atau gunakan file asli.'));
    assert(app.doc.querySelector('#tool-status').textContent.includes('Hasil lebih besar'));
  } finally { closeApp(app); }
});
test('perubahan kualitas/format langsung menghapus hasil lama dan menonaktifkan unduh', async () => {
  const app = await openApp();
  try {
    await loadFile(app, await canvasFile('image/jpeg', 8, 5));
    await compress(app);
    app.doc.querySelector('#quality-input').value = '60';
    app.doc.querySelector('#quality-input').dispatchEvent(new app.win.Event('input', { bubbles: true }));
    equal(app.doc.querySelector('#quality-value').textContent, '60%');
    equal(app.doc.querySelector('#result-card').hidden, true);
    equal(app.doc.querySelector('#download-button').disabled, true);
    await compress(app);
    app.doc.querySelector('#output-format').value = 'webp';
    app.doc.querySelector('#output-format').dispatchEvent(new app.win.Event('change', { bubbles: true }));
    equal(app.doc.querySelector('#download-button').disabled, true);
  } finally { closeApp(app); }
});
test('kualitas batas 60 dan 95 dapat dipakai dalam kompresi eksplisit', async () => {
  const app = await openApp();
  try {
    await loadFile(app, await canvasFile('image/jpeg', 16, 10));
    const quality = app.doc.querySelector('#quality-input');
    quality.value = '60'; quality.dispatchEvent(new app.win.Event('input', { bubbles: true }));
    await compress(app);
    assert(app.doc.querySelector('#result-meta').textContent.includes('kualitas 60%'));
    quality.value = '95'; quality.dispatchEvent(new app.win.Event('input', { bubbles: true }));
    await compress(app);
    assert(app.doc.querySelector('#result-meta').textContent.includes('kualitas 95%'));
  } finally { closeApp(app); }
});
test('reset melepaskan preview, mengosongkan file, mereset opsi dan fokus file input', async () => {
  const app = await openApp();
  try {
    await loadFile(app, await canvasFile('image/jpeg', 8, 5));
    await compress(app);
    app.doc.querySelector('#output-format').value = 'webp';
    app.doc.querySelector('#quality-input').value = '95';
    app.doc.querySelector('#clear-button').click();
    equal(app.doc.querySelector('#image-file').value, '');
    equal(app.doc.querySelector('#output-format').value, 'jpeg');
    equal(app.doc.querySelector('#quality-input').value, '80');
    equal(app.doc.querySelector('#original-preview').hasAttribute('src'), false);
    equal(app.doc.querySelector('#result-preview').hasAttribute('src'), false);
    equal(app.doc.activeElement, app.doc.querySelector('#image-file'));
  } finally { closeApp(app); }
});
test('file baru saat decode aktif diantrikan agar tidak ada dua decode bersamaan', async () => {
  const app = await openApp();
  const original = app.win.createImageBitmap;
  let calls = 0; let active = 0; let peak = 0; let releaseFirst;
  try {
    app.win.createImageBitmap = async (...args) => {
      calls += 1; active += 1; peak = Math.max(peak, active);
      if (calls === 1) await new Promise(resolve => { releaseFirst = resolve; });
      try { return await original(...args); } finally { active -= 1; }
    };
    const first = await canvasFile('image/png', 4, 3, null, 'first');
    const second = await canvasFile('image/png', 6, 4, null, 'second');
    setFile(app, first);
    await waitFor(() => typeof releaseFirst === 'function');
    setFile(app, second);
    await tick();
    equal(calls, 1);
    releaseFirst();
    await waitFor(() => app.doc.querySelector('#file-info').textContent.includes('second.png') && !app.doc.querySelector('#compress-button').disabled);
    equal(calls, 2); equal(peak, 1);
    assert(app.doc.querySelector('#file-info').textContent.includes('6 × 4 px'));
  } finally { app.win.createImageBitmap = original; closeApp(app); }
});
test('hasil encode yang selesai setelah perubahan opsi dibuang sebagai stale', async () => {
  const app = await openApp();
  const original = app.win.HTMLCanvasElement.prototype.toBlob;
  let finish;
  try {
    await loadFile(app, await canvasFile('image/jpeg', 8, 6));
    app.win.HTMLCanvasElement.prototype.toBlob = function (callback) { finish = callback; };
    app.doc.querySelector('#compress-button').click();
    await waitFor(() => typeof finish === 'function');
    const quality = app.doc.querySelector('#quality-input'); quality.value = '70'; quality.dispatchEvent(new app.win.Event('input', { bubbles: true }));
    finish(new app.win.Blob(['stale'], { type: 'image/jpeg' }));
    await tick(); await tick();
    equal(app.doc.querySelector('#result-card').hidden, true);
    equal(app.doc.querySelector('#download-button').disabled, true);
  } finally { app.win.HTMLCanvasElement.prototype.toBlob = original; closeApp(app); }
});
test('toBlob null, MIME fallback, dan output di atas 20 MiB tidak membuka unduhan', async () => {
  const app = await openApp();
  const original = app.win.HTMLCanvasElement.prototype.toBlob;
  try {
    await loadFile(app, await canvasFile('image/jpeg', 2, 2));
    app.win.HTMLCanvasElement.prototype.toBlob = function (callback) { callback(null); };
    app.doc.querySelector('#compress-button').click();
    await waitFor(() => app.doc.querySelector('#tool-status').dataset.kind === 'error');
    equal(app.doc.querySelector('#download-button').disabled, true);
    app.doc.querySelector('#output-format').value = 'webp';
    app.doc.querySelector('#output-format').dispatchEvent(new app.win.Event('change', { bubbles: true }));
    app.win.HTMLCanvasElement.prototype.toBlob = function (callback) { callback(new app.win.Blob(['fallback'], { type: 'image/png' })); };
    app.doc.querySelector('#compress-button').click();
    await waitFor(() => app.doc.querySelector('#tool-status').dataset.kind === 'error');
    assert(app.doc.querySelector('#tool-status').textContent.includes('Pilih format JPEG'));
    equal(app.doc.querySelector('#download-button').disabled, true);
    app.doc.querySelector('#output-format').value = 'jpeg';
    app.doc.querySelector('#output-format').dispatchEvent(new app.win.Event('change', { bubbles: true }));
    app.win.HTMLCanvasElement.prototype.toBlob = function (callback) { callback(new app.win.Blob([new Uint8Array(MAX_MEDIA_OUTPUT_BYTES + 1)], { type: 'image/jpeg' })); };
    app.doc.querySelector('#compress-button').click();
    await waitFor(() => app.doc.querySelector('#tool-status').dataset.kind === 'error');
    assert(app.doc.querySelector('#tool-status').textContent.includes('20 MiB'));
    equal(app.doc.querySelector('#download-button').disabled, true);
  } finally { app.win.HTMLCanvasElement.prototype.toBlob = original; closeApp(app); }
});
test('contoh file berbahaya dirender sebagai nama teks dan tidak masuk ke URL situs', async () => {
  const app = await openApp();
  try {
    await loadFile(app, await canvasFile('image/png', 2, 2, null, '<img src=x>'));
    assert(app.doc.querySelector('#file-info').textContent.includes('<img src=x>'));
    assert(!app.win.location.href.includes('<img src=x>'));
    equal(app.win.location.search, ''); equal(app.win.location.hash, '');
  } finally { closeApp(app); }
});
test('layout form dan preview tidak overflow pada empat ukuran layar', async () => {
  for (const width of [320, 390, 768, 1440]) {
    const app = await openApp(width);
    try {
      await tick();
      assert(app.doc.documentElement.scrollWidth <= app.doc.documentElement.clientWidth, `Overflow awal ${width}px`);
      await loadFile(app, await canvasFile('image/jpeg', 32, 24));
      await compress(app);
      assert(app.doc.documentElement.scrollWidth <= app.doc.documentElement.clientWidth, `Overflow hasil ${width}px`);
    } finally { closeApp(app); }
  }
});

run();
