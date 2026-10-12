import { assert, equal, deepEqual, throws, test, run } from '../tools/harness.js';
import { calculateSize, parseSizeValue, formatImageBytes } from '/ubah-ukuran-foto/logic.js';
import { MAX_IMAGE_BYTES, MAX_IMAGE_PIXELS, MAX_IMAGE_SIDE, MAX_MEDIA_OUTPUT_BYTES, decodeImage, encodeImage, inspectImage } from '/everyday/shared/image.js';

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
function waitFor(predicate, timeout = 6000) {
  return new Promise((resolve, reject) => {
    const started = performance.now();
    const check = () => {
      try { if (predicate()) return resolve(); }
      catch (error) { return reject(error); }
      if (performance.now() - started > timeout) return reject(new Error('Perkiraan atau hasil tidak siap tepat waktu.'));
      setTimeout(check, 20);
    };
    check();
  });
}
async function openApp(width = 900) {
  const frame = document.createElement('iframe');
  frame.title = 'Ubah ukuran foto untuk tes';
  frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:1400px;border:0`;
  document.body.append(frame); frame.src = '/ubah-ukuran-foto/';
  await new Promise((resolve, reject) => {
    frame.addEventListener('load', resolve, { once: true });
    frame.addEventListener('error', () => reject(new Error('Route ubah ukuran foto gagal dimuat.')), { once: true });
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
  else { context.fillStyle = '#c64b31'; context.fillRect(0, 0, width, height); }
  const blob = await new Promise(resolve => canvas.toBlob(resolve, mime));
  canvas.width = 0; canvas.height = 0;
  assert(blob && blob.type === mime, `Browser tidak menghasilkan ${mime} untuk fixture.`);
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
  return new File([blob], `${name}.${ext}`, { type: mime });
}
function pngHeader(width, height, size = 45) {
  const bytes = new Uint8Array(size); bytes.set(PNG_SIGNATURE);
  const view = new DataView(bytes.buffer);
  view.setUint32(8, 13, false); bytes.set([73, 72, 68, 82], 12);
  view.setUint32(16, width, false); view.setUint32(20, height, false); bytes.set([8, 6, 0, 0, 0], 24);
  view.setUint32(33, size - 45, false); bytes.set([73, 68, 65, 84], 37);
  return new File([bytes], 'header.png', { type: 'image/png' });
}
function withExifOrientation6(bytes) {
  const app1 = new Uint8Array([
    0xff, 0xe1, 0x00, 0x22, 0x45, 0x78, 0x69, 0x66, 0, 0,
    0x49, 0x49, 0x2a, 0, 0x08, 0, 0, 0, 0x01, 0,
    0x12, 0x01, 0x03, 0, 0x01, 0, 0, 0, 0x06, 0, 0, 0, 0, 0, 0, 0,
  ]);
  const result = new Uint8Array(bytes.length + app1.length);
  result.set(bytes.subarray(0, 2)); result.set(app1, 2); result.set(bytes.subarray(2), 2 + app1.length);
  return new File([result], 'orientation-6.jpg', { type: 'image/jpeg' });
}
function setFile(app, file) {
  const transfer = new app.win.DataTransfer(); transfer.items.add(file);
  const input = app.doc.querySelector('#image-file'); input.files = transfer.files;
  input.dispatchEvent(new app.win.Event('change', { bubbles: true }));
}
async function loadFile(app, file) {
  setFile(app, file);
  await waitFor(() => !app.doc.querySelector('#resize-button').disabled || app.doc.querySelector('#tool-status').dataset.kind === 'error');
  if (app.doc.querySelector('#resize-button').disabled) throw new Error(app.doc.querySelector('#tool-status').textContent);
  await waitFor(() => app.doc.querySelector('#original-preview').naturalWidth > 0);
}
async function resize(app) {
  app.doc.querySelector('#resize-button').click();
  await waitFor(() => !app.doc.querySelector('#result-card').hidden || app.doc.querySelector('#tool-status').dataset.kind === 'error');
  if (app.doc.querySelector('#result-card').hidden) throw new Error(app.doc.querySelector('#tool-status').textContent);
}
async function capture(promise) {
  try { await promise; } catch (error) { return error; }
  throw new Error('Fixture harus ditolak.');
}

// Exact pure calculations and ASCII scalar contract.
test('perhitungan width, height, dan percent sesuai sumber asli 1200×800', () => {
  deepEqual(calculateSize(1200, 800, 'width', 600), { width: 600, height: 400 });
  deepEqual(calculateSize(1200, 800, 'width', 601), { width: 601, height: 401 });
  deepEqual(calculateSize(1200, 800, 'height', 100), { width: 150, height: 100 });
  deepEqual(calculateSize(1200, 800, 'percent', 25), { width: 300, height: 200 });
  deepEqual(calculateSize(1200, 800, 'percent', 100), { width: 1200, height: 800 });
});
test('pembulatan dimensi kecil tidak menghasilkan nol atau upscaling', () => {
  deepEqual(calculateSize(3, 2, 'percent', 50), { width: 2, height: 1 });
  deepEqual(calculateSize(1, 100, 'percent', 1), { width: 1, height: 1 });
  deepEqual(calculateSize(1200, 800, 'width', 1), { width: 1, height: 1 });
});
test('nilai menerima integer ASCII dan spasi ASCII hanya pada tepi', () => {
  equal(parseSizeValue('600'), 600); equal(parseSizeValue(' 600\t'), 600); equal(parseSizeValue('\n25\r'), 25);
});
test('nilai menolak kosong, digit non-ASCII, whitespace tengah, decimal, eksponen, dan lebih dari 8 char', () => {
  for (const raw of ['', ' ', '0.5', '50.5', '1e2', '+10', '-1', '1 0', '１２', '١٢', '123456789']) {
    throws(() => parseSizeValue(raw), 'INVALID_SIZE_VALUE');
  }
});
test('perhitungan menolak dimensi dan nilai yang tidak valid atau memperbesar sumber', () => {
  for (const dims of [[0, 5], [-1, 2], [1.5, 3], [NaN, 2]]) throws(() => calculateSize(...dims, 'percent', 50), 'INVALID_DIMENSIONS');
  throws(() => calculateSize(1200, 800, 'width', 1201), 'SIZE_RANGE');
  throws(() => calculateSize(1200, 800, 'height', 801), 'SIZE_RANGE');
  throws(() => calculateSize(1200, 800, 'percent', 101), 'SIZE_RANGE');
  throws(() => calculateSize(1200, 800, 'percent', 0), 'SIZE_RANGE');
  throws(() => calculateSize(1200, 800, 'other', 50), 'INVALID_MODE');
});
test('format byte menampilkan byte tepat dan unit basis 1024', () => {
  equal(formatImageBytes(1024), '1024 byte (1,0 KiB)');
  equal(formatImageBytes(1048576), '1048576 byte (1,0 MiB)');
  throws(() => formatImageBytes(-1), 'INVALID_SIZE');
});

// Shared media bounds, dimensions, orientation, transparency, and encoder behavior.
test('validator menerima tepat 10 MiB dan menolak satu byte di atasnya', async () => {
  equal((await inspectImage(pngHeader(1, 1, MAX_IMAGE_BYTES))).mime, 'image/png');
  equal((await capture(inspectImage(pngHeader(1, 1, MAX_IMAGE_BYTES + 1)))).code, 'INPUT_TOO_LARGE');
});
test('validator menolak dimensi di atas 12 juta piksel atau sisi 8192', async () => {
  equal((await inspectImage(pngHeader(4000, 3000))).width, 4000);
  equal(MAX_IMAGE_PIXELS, 12000000); equal(MAX_IMAGE_SIDE, 8192);
  equal((await capture(inspectImage(pngHeader(4001, 3000)))).code, 'IMAGE_DIMENSIONS');
  equal((await capture(inspectImage(pngHeader(8193, 1)))).code, 'IMAGE_DIMENSIONS');
});
test('header palsu, rusak, file kosong, GIF, dan PNG animasi ditolak', async () => {
  equal((await capture(inspectImage(new File(['bad'], 'wrong.png', { type: 'image/png' })))).code, 'UNSUPPORTED_IMAGE');
  equal((await capture(inspectImage(new File([Uint8Array.from(PNG_SIGNATURE)], 'broken.png')))).code, 'INVALID_IMAGE');
  equal((await capture(inspectImage(new File([], 'empty.png')))).code, 'INVALID_IMAGE');
  equal((await capture(inspectImage(new File(['GIF89a'], 'animated.gif', { type: 'image/gif' })))).code, 'UNSUPPORTED_IMAGE');
  const apng = new Uint8Array(57); apng.set(PNG_SIGNATURE); const view = new DataView(apng.buffer);
  view.setUint32(8, 13, false); apng.set([73, 72, 68, 82], 12); view.setUint32(16, 1, false); view.setUint32(20, 1, false);
  apng.set([8, 6, 0, 0, 0], 24); view.setUint32(33, 8, false); apng.set([97, 99, 84, 76], 37);
  equal((await capture(inspectImage(new File([apng], 'animated.png', { type: 'image/png' })))).code, 'UNSUPPORTED_IMAGE');
});
test('EXIF orientation 6 decodes once to oriented dimensions and resize encoder preserves them', async () => {
  const base = await canvasFile('image/jpeg', 3, 2);
  const rotated = withExifOrientation6(new Uint8Array(await base.arrayBuffer()));
  const image = await decodeImage(rotated);
  try {
    equal(image.width, 2); equal(image.height, 3);
    const blob = await encodeImage(image.bitmap, { width: 1, height: 2, mime: 'image/png' });
    const output = await createImageBitmap(blob);
    try { equal(output.width, 1); equal(output.height, 2); } finally { output.close(); }
  } finally { image.bitmap.close(); }
});
test('PNG alpha tetap transparan pada PNG dan menjadi putih pada JPEG', async () => {
  const file = await canvasFile('image/png', 10, 6, context => { context.fillStyle = '#f00'; context.fillRect(0, 0, 4, 6); });
  const image = await decodeImage(file);
  try {
    for (const [mime, expectedAlpha] of [['image/png', 0], ['image/jpeg', 255]]) {
      const blob = await encodeImage(image.bitmap, { width: 10, height: 6, mime, background: '#ffffff' });
      const output = await createImageBitmap(blob);
      try {
        const canvas = document.createElement('canvas'); canvas.width = 10; canvas.height = 6;
        const context = canvas.getContext('2d', { willReadFrequently: true }); context.drawImage(output, 0, 0);
        const pixel = context.getImageData(8, 3, 1, 1).data;
        if (mime === 'image/png') equal(pixel[3], expectedAlpha);
        else assert(pixel[0] > 240 && pixel[1] > 240 && pixel[2] > 240 && pixel[3] === expectedAlpha, `Latar JPEG tidak putih: ${Array.from(pixel)}`);
        canvas.width = 0; canvas.height = 0;
      } finally { output.close(); }
    }
  } finally { image.bitmap.close(); }
});
test('WebP mempertahankan alpha jika native encoder mendukungnya', async () => {
  const file = await canvasFile('image/png', 2, 1, context => { context.fillStyle = '#0f0'; context.fillRect(0, 0, 1, 1); });
  const image = await decodeImage(file);
  try {
    try {
      const blob = await encodeImage(image.bitmap, { width: 2, height: 1, mime: 'image/webp', quality: 0.9 });
      const output = await createImageBitmap(blob);
      try {
        const canvas = document.createElement('canvas'); canvas.width = 2; canvas.height = 1;
        const context = canvas.getContext('2d', { willReadFrequently: true }); context.drawImage(output, 0, 0);
        equal(context.getImageData(1, 0, 1, 1).data[3], 0); canvas.width = 0; canvas.height = 0;
      } finally { output.close(); }
    } catch (error) { equal(error.code, 'ENCODE_FAILED'); assert(error.message.includes('image/webp')); }
  } finally { image.bitmap.close(); }
});

// Route metadata, UI calculations, async invalidation, download bytes and responsive behavior.
test('route metadata, instructions, canonical, noscript and static SEO copy are present', async () => {
  const html = await (await fetch('/ubah-ukuran-foto/')).text();
  for (const phrase of ['<html lang="id">', '<title>Ubah Ukuran Foto Online dalam Piksel | Edwin Lab</title>', 'Ubah Ukuran Foto</h1>', '1200 × 800 px', '600 × 400 px', 'rasio aspek', 'Apakah foto dipotong?', 'Apakah file pasti lebih kecil?', 'Apakah foto diunggah?', '<noscript>', 'https://edwinlab.dev/ubah-ukuran-foto/']) {
    assert(html.includes(phrase), `Panduan statis tidak memuat: ${phrase}`);
  }
});
test('awal menampilkan format PNG, mode width, tanpa hasil dan unduhan', async () => {
  const app = await openApp();
  try {
    equal(app.doc.querySelector('#size-mode').value, 'width');
    equal(app.doc.querySelector('#output-format').value, 'png');
    equal(app.doc.querySelector('#size-value').value, '');
    equal(app.doc.querySelector('#resize-button').disabled, true);
    equal(app.doc.querySelector('#download-button').disabled, true);
  } finally { closeApp(app); }
});
test('file dimuat dengan orientasi dan nilai default lebar asli', async () => {
  const app = await openApp();
  try {
    await loadFile(app, await canvasFile('image/jpeg', 1200, 800));
    equal(app.doc.querySelector('#size-value').value, '1200');
    assert(app.doc.querySelector('#file-info').textContent.includes('1200 × 800 px'));
    equal(app.doc.querySelector('#estimated-dimensions').textContent, 'Perkiraan: 1200 × 800 px');
    equal(app.doc.querySelector('#size-value').dataset.max, '1200');
  } finally { closeApp(app); }
});
test('ganti mode mereset nilai ke dimensi sumber atau 100 persen', async () => {
  const app = await openApp();
  try {
    await loadFile(app, await canvasFile('image/jpeg', 1200, 800));
    const mode = app.doc.querySelector('#size-mode'); const value = app.doc.querySelector('#size-value');
    mode.value = 'height'; mode.dispatchEvent(new app.win.Event('change', { bubbles: true }));
    equal(value.value, '800'); assert(app.doc.querySelector('#size-value-label').textContent.includes('Tinggi'));
    mode.value = 'percent'; mode.dispatchEvent(new app.win.Event('change', { bubbles: true }));
    equal(value.value, '100'); equal(app.doc.querySelector('#estimated-dimensions').textContent, 'Perkiraan: 1200 × 800 px');
    mode.value = 'width'; mode.dispatchEvent(new app.win.Event('change', { bubbles: true })); equal(value.value, '1200');
  } finally { closeApp(app); }
});
test('perkiraan berubah segera dan nilai invalid fokus ke field serta meniadakan hasil lama', async () => {
  const app = await openApp();
  try {
    await loadFile(app, await canvasFile('image/jpeg', 1200, 800));
    const value = app.doc.querySelector('#size-value');
    value.value = '600'; value.dispatchEvent(new app.win.Event('input', { bubbles: true }));
    equal(app.doc.querySelector('#estimated-dimensions').textContent, 'Perkiraan: 600 × 400 px');
    await resize(app);
    value.value = '1e2'; value.dispatchEvent(new app.win.Event('input', { bubbles: true }));
    equal(app.doc.querySelector('#result-card').hidden, true); equal(app.doc.querySelector('#download-button').disabled, true);
    assert(app.doc.querySelector('#estimated-dimensions').textContent.includes('angka bulat ASCII'));
  } finally { closeApp(app); }
});
test('PNG resize mempertahankan dimensi target dan unduhan dapat didecode ulang', async () => {
  const app = await openApp();
  const originalCreate = app.win.URL.createObjectURL; const originalRevoke = app.win.URL.revokeObjectURL;
  const originalClick = app.win.HTMLAnchorElement.prototype.click;
  let downloadedBlob = null; let downloadedName = '';
  try {
    const file = await canvasFile('image/png', 1200, 800, context => { context.fillStyle = '#0f0'; context.fillRect(0, 0, 600, 800); });
    await loadFile(app, file);
    const input = app.doc.querySelector('#size-value'); input.value = '600'; input.dispatchEvent(new app.win.Event('input', { bubbles: true }));
    await resize(app);
    equal(app.doc.querySelector('#result-preview').naturalWidth, 600); equal(app.doc.querySelector('#result-preview').naturalHeight, 400);
    app.win.URL.createObjectURL = blob => { downloadedBlob = blob; return 'blob:resize-download'; };
    app.win.URL.revokeObjectURL = () => {};
    app.win.HTMLAnchorElement.prototype.click = function () { downloadedName = this.download; };
    app.doc.querySelector('#download-button').click();
    equal(downloadedName, 'foto-resize.png'); equal(downloadedBlob.type, 'image/png');
    const output = await app.win.createImageBitmap(downloadedBlob);
    try { equal(output.width, 600); equal(output.height, 400); } finally { output.close(); }
  } finally {
    app.win.URL.createObjectURL = originalCreate; app.win.URL.revokeObjectURL = originalRevoke;
    app.win.HTMLAnchorElement.prototype.click = originalClick; closeApp(app);
  }
});
test('JPEG dan WebP memilih MIME tepat dan resolusi estimasi', async () => {
  const app = await openApp();
  try {
    await loadFile(app, await canvasFile('image/jpeg', 80, 60));
    const value = app.doc.querySelector('#size-value'); value.value = '50'; value.dispatchEvent(new app.win.Event('input', { bubbles: true }));
    const format = app.doc.querySelector('#output-format');
    format.value = 'jpeg'; format.dispatchEvent(new app.win.Event('change', { bubbles: true })); await resize(app);
    equal(app.doc.querySelector('#result-preview').naturalWidth, 50);
    equal(app.doc.querySelector('#result-preview').naturalHeight, 38);
    assert(app.doc.querySelector('#result-meta').textContent.startsWith('JPG ·'));
    format.value = 'webp'; format.dispatchEvent(new app.win.Event('change', { bubbles: true }));
    app.doc.querySelector('#resize-button').click();
    await waitFor(() => !app.doc.querySelector('#result-card').hidden || app.doc.querySelector('#tool-status').dataset.kind === 'error');
    if (app.doc.querySelector('#tool-status').dataset.kind === 'error') assert(app.doc.querySelector('#tool-status').textContent.includes('Pilih PNG atau JPEG'));
    else assert(app.doc.querySelector('#result-meta').textContent.startsWith('WEBP ·'));
  } finally { closeApp(app); }
});
test('contoh sintetis lokal 160×120 menyiapkan perkiraan tanpa mengubah otomatis', async () => {
  const app = await openApp();
  try {
    app.doc.querySelector('#example-button').click();
    await waitFor(() => !app.doc.querySelector('#resize-button').disabled);
    assert(app.doc.querySelector('#file-info').textContent.includes('160 × 120 px'));
    equal(app.doc.querySelector('#size-value').value, '160');
    equal(app.doc.querySelector('#result-card').hidden, true);
  } finally { closeApp(app); }
});
test('format edit menghapus hasil lama dan menonaktifkan unduhan', async () => {
  const app = await openApp();
  try {
    await loadFile(app, await canvasFile('image/jpeg', 8, 6)); await resize(app);
    app.doc.querySelector('#output-format').value = 'jpeg';
    app.doc.querySelector('#output-format').dispatchEvent(new app.win.Event('change', { bubbles: true }));
    equal(app.doc.querySelector('#result-card').hidden, true); equal(app.doc.querySelector('#download-button').disabled, true);
  } finally { closeApp(app); }
});
test('bersihkan melepas preview, mereset mode format dan fokus input file', async () => {
  const app = await openApp();
  try {
    await loadFile(app, await canvasFile('image/jpeg', 8, 6)); await resize(app);
    app.doc.querySelector('#size-mode').value = 'percent'; app.doc.querySelector('#size-value').value = '50';
    app.doc.querySelector('#output-format').value = 'webp'; app.doc.querySelector('#clear-button').click();
    equal(app.doc.querySelector('#image-file').value, ''); equal(app.doc.querySelector('#size-mode').value, 'width');
    equal(app.doc.querySelector('#output-format').value, 'png'); equal(app.doc.querySelector('#size-value').value, '');
    equal(app.doc.querySelector('#original-preview').hasAttribute('src'), false); equal(app.doc.querySelector('#result-preview').hasAttribute('src'), false);
    equal(app.doc.activeElement, app.doc.querySelector('#image-file'));
  } finally { closeApp(app); }
});
test('toBlob null, output MIME salah, dan hasil di atas 20 MiB tidak dapat diunduh', async () => {
  const app = await openApp(); const original = app.win.HTMLCanvasElement.prototype.toBlob;
  try {
    await loadFile(app, await canvasFile('image/png', 2, 2));
    app.win.HTMLCanvasElement.prototype.toBlob = callback => callback(null);
    app.doc.querySelector('#resize-button').click(); await waitFor(() => app.doc.querySelector('#tool-status').dataset.kind === 'error');
    equal(app.doc.querySelector('#download-button').disabled, true);
    app.win.HTMLCanvasElement.prototype.toBlob = callback => callback(new app.win.Blob(['fallback'], { type: 'image/jpeg' }));
    app.doc.querySelector('#resize-button').click(); await waitFor(() => app.doc.querySelector('#tool-status').dataset.kind === 'error');
    equal(app.doc.querySelector('#download-button').disabled, true);
    app.win.HTMLCanvasElement.prototype.toBlob = callback => callback(new app.win.Blob([new Uint8Array(MAX_MEDIA_OUTPUT_BYTES + 1)], { type: 'image/png' }));
    app.doc.querySelector('#resize-button').click(); await waitFor(() => app.doc.querySelector('#tool-status').dataset.kind === 'error');
    assert(app.doc.querySelector('#tool-status').textContent.includes('20 MiB')); equal(app.doc.querySelector('#download-button').disabled, true);
  } finally { app.win.HTMLCanvasElement.prototype.toBlob = original; closeApp(app); }
});
test('nama berbahaya hanya ditampilkan sebagai teks dan tidak masuk URL', async () => {
  const app = await openApp();
  try {
    await loadFile(app, await canvasFile('image/png', 2, 2, null, '<img src=x>'));
    assert(app.doc.querySelector('#file-info').textContent.includes('<img src=x>'));
    assert(!app.win.location.href.includes('<img src=x>')); equal(app.win.location.search, ''); equal(app.win.location.hash, '');
  } finally { closeApp(app); }
});
test('file baru saat decode aktif diantrikan tanpa dua decoder bersamaan', async () => {
  const app = await openApp(); const original = app.win.createImageBitmap;
  let calls = 0; let active = 0; let peak = 0; let releaseFirst;
  try {
    app.win.createImageBitmap = async (...args) => {
      calls += 1; active += 1; peak = Math.max(peak, active);
      if (calls === 1) await new Promise(resolve => { releaseFirst = resolve; });
      try { return await original(...args); } finally { active -= 1; }
    };
    const first = await canvasFile('image/png', 4, 3, null, 'first'); const second = await canvasFile('image/png', 6, 4, null, 'second');
    setFile(app, first); await waitFor(() => typeof releaseFirst === 'function'); setFile(app, second); await tick(); equal(calls, 1);
    releaseFirst(); await waitFor(() => app.doc.querySelector('#file-info').textContent.includes('6 × 4 px') && !app.doc.querySelector('#resize-button').disabled);
    equal(calls, 2); equal(peak, 1);
  } finally { app.win.createImageBitmap = original; closeApp(app); }
});
test('hasil encode yang selesai setelah input berubah dibuang sebagai stale', async () => {
  const app = await openApp(); const original = app.win.HTMLCanvasElement.prototype.toBlob; let finish;
  try {
    await loadFile(app, await canvasFile('image/jpeg', 8, 6));
    app.win.HTMLCanvasElement.prototype.toBlob = callback => { finish = callback; };
    app.doc.querySelector('#resize-button').click(); await waitFor(() => typeof finish === 'function');
    app.doc.querySelector('#size-value').value = '5'; app.doc.querySelector('#size-value').dispatchEvent(new app.win.Event('input', { bubbles: true }));
    finish(new app.win.Blob(['stale'], { type: 'image/png' })); await tick(); await tick();
    equal(app.doc.querySelector('#result-card').hidden, true); equal(app.doc.querySelector('#download-button').disabled, true);
  } finally { app.win.HTMLCanvasElement.prototype.toBlob = original; closeApp(app); }
});
test('hasil resize tidak pernah menumpuk native encoder saat klik ganda', async () => {
  const app = await openApp(); const original = app.win.HTMLCanvasElement.prototype.toBlob; let calls = 0; let finish;
  try {
    await loadFile(app, await canvasFile('image/jpeg', 8, 6));
    app.win.HTMLCanvasElement.prototype.toBlob = callback => { calls += 1; finish = callback; };
    app.doc.querySelector('#output-format').value = 'jpeg';
    app.doc.querySelector('#output-format').dispatchEvent(new app.win.Event('change', { bubbles: true }));
    app.doc.querySelector('#resize-button').click(); app.doc.querySelector('#resize-button').click(); await tick();
    equal(calls, 1); finish(new app.win.Blob(['bad'], { type: 'image/png' }));
    await waitFor(() => app.doc.querySelector('#tool-status').dataset.kind === 'error');
  } finally { app.win.HTMLCanvasElement.prototype.toBlob = original; closeApp(app); }
});
test('layout awal dan hasil tidak overflow pada empat ukuran viewport', async () => {
  for (const width of [320, 390, 768, 1440]) {
    const app = await openApp(width);
    try {
      await tick(); assert(app.doc.documentElement.scrollWidth <= app.doc.documentElement.clientWidth, `Overflow awal ${width}px`);
      await loadFile(app, await canvasFile('image/jpeg', 32, 24)); await resize(app);
      assert(app.doc.documentElement.scrollWidth <= app.doc.documentElement.clientWidth, `Overflow hasil ${width}px`);
    } finally { closeApp(app); }
  }
});

run();
