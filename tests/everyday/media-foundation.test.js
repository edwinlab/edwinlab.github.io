import { test, assert, equal, throws, run } from '../tools/harness.js';
import { makeQrMatrix } from '../../everyday/shared/qr.js';
import {
  MAX_IMAGE_BYTES, MAX_IMAGE_HEADER_BYTES, MAX_IMAGE_PIXELS, MAX_IMAGE_SIDE, MAX_MEDIA_OUTPUT_BYTES,
  inspectImage, decodeImage, encodeImage,
} from '../../everyday/shared/image.js';

const PNG = [137, 80, 78, 71, 13, 10, 26, 10];
const u32 = (view, offset, value) => view.setUint32(offset, value, false);

function utf8(text) { return Array.from(new TextEncoder().encode(text)); }

async function decodeMatrix(matrix) {
  const count = matrix.length;
  const cell = Math.max(2, Math.floor(768 / (count + 8)));
  const size = (count + 8) * cell;
  const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size;
  const context = canvas.getContext('2d', { alpha: false });
  context.fillStyle = '#fff'; context.fillRect(0, 0, size, size);
  context.fillStyle = '#000';
  for (let row = 0; row < count; row += 1) {
    for (let column = 0; column < count; column += 1) {
      if (matrix[row][column]) context.fillRect((column + 4) * cell, (row + 4) * cell, cell, cell);
    }
  }
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  canvas.width = 0; canvas.height = 0;
  assert(blob?.type === 'image/png', 'QR test harus memakai PNG browser.');
  const bitmap = await createImageBitmap(blob);
  try {
    const decodedCanvas = document.createElement('canvas'); decodedCanvas.width = bitmap.width; decodedCanvas.height = bitmap.height;
    const decodedContext = decodedCanvas.getContext('2d', { willReadFrequently: true });
    decodedContext.drawImage(bitmap, 0, 0);
    const image = decodedContext.getImageData(0, 0, bitmap.width, bitmap.height);
    const decoded = globalThis.jsQR(image.data, bitmap.width, bitmap.height, { inversionAttempts: 'dontInvert' });
    decodedCanvas.width = 0; decodedCanvas.height = 0;
    return decoded;
  } finally { bitmap.close(); }
}

function pngHeader(width, height, { totalSize = 45, beforeData = null } = {}) {
  const extra = beforeData ? 12 + beforeData.length : 0;
  const size = Math.max(totalSize, 45 + extra);
  const bytes = new Uint8Array(size);
  bytes.set(PNG);
  const view = new DataView(bytes.buffer);
  u32(view, 8, 13); bytes.set([73, 72, 68, 82], 12);
  u32(view, 16, width); u32(view, 20, height);
  bytes.set([8, 6, 0, 0, 0], 24);
  let offset = 33;
  if (beforeData) {
    u32(view, offset, beforeData.length); bytes.set([97, 99, 84, 76], offset + 4);
    bytes.set(beforeData, offset + 8); offset += 12 + beforeData.length;
  }
  const dataLength = size - offset - 12;
  u32(view, offset, dataLength); bytes.set([73, 68, 65, 84], offset + 4);
  return new File([bytes], 'fixture.png', { type: 'image/png' });
}

function jpegHeader(width, height, { mpf = false, brokenLength = false } = {}) {
  const bytes = [0xff, 0xd8];
  if (mpf) bytes.push(0xff, 0xe2, 0x00, 0x06, 0x4d, 0x50, 0x46, 0x00);
  if (brokenLength) bytes.push(0xff, 0xe0, 0x00, 0x20, 0x01);
  const length = 11;
  bytes.push(0xff, 0xc0, length >> 8, length & 0xff, 8, height >> 8, height & 0xff,
    width >> 8, width & 0xff, 1, 1, 0x11, 0, 0);
  return new File([new Uint8Array(bytes)], 'fixture.jpg', { type: 'image/jpeg' });
}

async function canvasFile(mime, width = 3, height = 2, paint = null) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const context = canvas.getContext('2d');
  if (paint) paint(context);
  else { context.fillStyle = '#e02040'; context.fillRect(0, 0, width, height); }
  const blob = await new Promise(resolve => canvas.toBlob(resolve, mime));
  canvas.width = 0; canvas.height = 0;
  assert(blob && blob.type === mime, `Browser harus membuat ${mime} untuk fixture.`);
  return new File([blob], `fixture.${mime === 'image/png' ? 'png' : 'jpg'}`, { type: mime });
}

function withExifOrientation6(fileBytes) {
  const app1 = new Uint8Array([
    0xff, 0xe1, 0x00, 0x22,
    0x45, 0x78, 0x69, 0x66, 0, 0,
    0x49, 0x49, 0x2a, 0, 0x08, 0, 0, 0,
    0x01, 0, 0x12, 0x01, 0x03, 0, 0x01, 0, 0, 0, 0x06, 0, 0, 0,
    0, 0, 0, 0,
  ]);
  const result = new Uint8Array(fileBytes.length + app1.length);
  result.set(fileBytes.subarray(0, 2)); result.set(app1, 2); result.set(fileBytes.subarray(2), 2 + app1.length);
  return new File([result], 'orientation-6.jpg', { type: 'image/jpeg' });
}

async function rejects(promise, code) {
  try { await promise; } catch (error) { equal(error.code, code); return error; }
  throw new Error(`Seharusnya gagal dengan kode ${code}`);
}

test('PNG header valid menerima signature, IHDR dan dimensi yang wajar', async () => {
  const result = await inspectImage(pngHeader(4000, 3000));
  equal(result.mime, 'image/png'); equal(result.width, 4000); equal(result.height, 3000);
});

test('QR lokal memakai ECC M, auto-version dan mengembalikan matrix boolean persegi', () => {
  const matrix = makeQrMatrix('Halo');
  assert(matrix.length >= 21 && matrix.length <= 177);
  assert(matrix.every(row => row.length === matrix.length && row.every(cell => typeof cell === 'boolean')));
});

test('QR PNG ter-render didecode independen menjadi byte UTF-8 yang sama', async () => {
  const examples = ['Halo', 'https://edwinlab.dev/', 'kopi & teh', 'café', 'Halo 👋', 'Satu\nDua'];
  for (const text of examples) {
    const decoded = await decodeMatrix(makeQrMatrix(text));
    assert(decoded, `Decoder independen harus membaca ${JSON.stringify(text)}.`);
    equal(Array.from(decoded.binaryData).join(','), utf8(text).join(','));
    equal(decoded.data, text);
  }
});

test('QR menerima tepat 1000 byte ASCII atau 250 emoji dan menolak yang melebihinya', async () => {
  for (const text of ['a'.repeat(1000), '👋'.repeat(250)]) {
    equal(utf8(text).length, 1000);
    const decoded = await decodeMatrix(makeQrMatrix(text));
    assert(decoded); equal(Array.from(decoded.binaryData).join(','), utf8(text).join(','));
    equal(decoded.data, text);
  }
  for (const text of ['a'.repeat(1001), '👋'.repeat(251)]) {
    try { makeQrMatrix(text); } catch (error) { equal(error.code, 'INPUT_TOO_LARGE'); continue; }
    throw new Error('Payload di atas 1000 byte harus ditolak.');
  }
});

test('QR menolak input kosong, whitespace, surrogate tunggal, dan library yang tidak ada', () => {
  for (const text of ['', ' \n\t', '\ud800', '\udc00']) {
    try { makeQrMatrix(text); } catch (error) { equal(error.code, 'INVALID_QR_TEXT'); continue; }
    throw new Error('Input QR invalid harus ditolak.');
  }
  const original = globalThis.qrcode;
  try {
    globalThis.qrcode = undefined;
    try { makeQrMatrix('Halo'); } catch (error) { equal(error.code, 'QR_UNAVAILABLE'); return; }
    throw new Error('Library QR yang hilang harus ditolak.');
  } finally { globalThis.qrcode = original; }
});

test('QR dibuat dari teks secara literal tanpa merombak karakter payload', async () => {
  const text = 'javascript:alert(1)';
  const decoded = await decodeMatrix(makeQrMatrix(text));
  assert(decoded); equal(decoded.data, text); equal(Array.from(decoded.binaryData).join(','), utf8(text).join(','));
});

test('JPEG header membaca SOF dan menolak MPF multi-foto', async () => {
  const result = await inspectImage(jpegHeader(1200, 800));
  equal(result.mime, 'image/jpeg'); equal(result.width, 1200); equal(result.height, 800);
  await rejects(inspectImage(jpegHeader(12, 8, { mpf: true })), 'UNSUPPORTED_IMAGE');
  await rejects(inspectImage(jpegHeader(12, 8, { brokenLength: true })), 'INVALID_IMAGE');
});

test('Validator ukuran menerima tepat 10 MiB dan menolak satu byte di atasnya sebelum membaca', async () => {
  const exact = await inspectImage(pngHeader(2, 2, { totalSize: MAX_IMAGE_BYTES }));
  equal(exact.width, 2);
  const tooLarge = pngHeader(2, 2, { totalSize: MAX_IMAGE_BYTES + 1 });
  await rejects(inspectImage(tooLarge), 'INPUT_TOO_LARGE');
  equal(MAX_IMAGE_HEADER_BYTES, 64 * 1024);
});

test('Validator menolak signature dan struktur header yang rusak atau tidak didukung', async () => {
  await rejects(inspectImage(new File(['not an image'], 'bad.bin')), 'UNSUPPORTED_IMAGE');
  await rejects(inspectImage(new File([new Uint8Array([...PNG, 0, 0, 0, 12])], 'short.png')), 'INVALID_IMAGE');
  const brokenPngBytes = new Uint8Array(await pngHeader(2, 2).arrayBuffer());
  new DataView(brokenPngBytes.buffer).setUint32(8, 0xffff_ffff, false);
  const brokenPng = new File([brokenPngBytes], 'broken.png', { type: 'image/png' });
  await rejects(inspectImage(brokenPng), 'INVALID_IMAGE');
  await rejects(inspectImage(new File([], 'empty.png')), 'INVALID_IMAGE');
});

test('Validator menolak APNG sebelum IDAT dan batas sisi atau piksel sebelum decode', async () => {
  await rejects(inspectImage(pngHeader(2, 2, { beforeData: new Uint8Array(8) })), 'UNSUPPORTED_IMAGE');
  await rejects(inspectImage(pngHeader(MAX_IMAGE_SIDE + 1, 1)), 'IMAGE_DIMENSIONS');
  await rejects(inspectImage(pngHeader(4001, 3000)), 'IMAGE_DIMENSIONS');
  equal(MAX_IMAGE_PIXELS, 12_000_000);
});

test('Pemindaian header berhenti dalam batas 64 KiB untuk metadata sebelum data PNG', async () => {
  const size = MAX_IMAGE_HEADER_BYTES + 256;
  const bytes = new Uint8Array(size); bytes.set(PNG);
  const view = new DataView(bytes.buffer);
  u32(view, 8, 13); bytes.set([73, 72, 68, 82], 12);
  u32(view, 16, 2); u32(view, 20, 2); bytes.set([8, 6, 0, 0, 0], 24);
  const chunk = 33; u32(view, chunk, MAX_IMAGE_HEADER_BYTES);
  bytes.set([116, 69, 88, 116], chunk + 4);
  await rejects(inspectImage(new File([bytes], 'long-header.png')), 'INVALID_IMAGE');
});

test('PNG/JPEG hasil header sintetis harus tetap ditolak native decoder bila datanya truncation', async () => {
  await rejects(decodeImage(pngHeader(2, 2)), 'INVALID_IMAGE');
  await rejects(decodeImage(jpegHeader(2, 2)), 'INVALID_IMAGE');
});

test('createImageBitmap menerapkan orientasi EXIF 6 tepat sekali', async () => {
  const plain = await canvasFile('image/jpeg', 3, 2);
  const oriented = withExifOrientation6(new Uint8Array(await plain.arrayBuffer()));
  const decoded = await decodeImage(oriented);
  try {
    equal(decoded.width, 2); equal(decoded.height, 3); equal(decoded.mime, 'image/jpeg');
  } finally { decoded.bitmap.close(); }
});

test('PNG alpha bertahan dan JPEG mengisi transparansi dengan latar putih', async () => {
  const file = await canvasFile('image/png', 8, 4, context => {
    context.clearRect(0, 0, 8, 4); context.fillStyle = 'rgba(255,0,0,0.5)'; context.fillRect(0, 0, 4, 4);
  });
  const { bitmap } = await decodeImage(file);
  try {
    const png = await encodeImage(bitmap, { width: 8, height: 4, mime: 'image/png' });
    equal(png.type, 'image/png');
    const pngBitmap = await createImageBitmap(png);
    try {
      const canvas = document.createElement('canvas'); canvas.width = 8; canvas.height = 4;
      const context = canvas.getContext('2d'); context.drawImage(pngBitmap, 0, 0);
      assert(context.getImageData(0, 0, 1, 1).data[3] > 0);
      equal(context.getImageData(7, 2, 1, 1).data[3], 0); canvas.width = 0; canvas.height = 0;
    } finally { pngBitmap.close(); }
    const jpg = await encodeImage(bitmap, { width: 8, height: 4, mime: 'image/jpeg' });
    equal(jpg.type, 'image/jpeg');
    const jpgBitmap = await createImageBitmap(jpg);
    try {
      const canvas = document.createElement('canvas'); canvas.width = 8; canvas.height = 4;
      const context = canvas.getContext('2d'); context.drawImage(jpgBitmap, 0, 0);
      const white = context.getImageData(7, 2, 1, 1).data;
      assert(white[0] > 235 && white[1] > 235 && white[2] > 235 && white[3] === 255, 'Piksel transparan harus putih pada JPEG.');
      canvas.width = 0; canvas.height = 0;
    } finally { jpgBitmap.close(); }
  } finally { bitmap.close(); }
});

test('WebP output mempertahankan MIME browser dan alpha bila encoder tersedia', async () => {
  const file = await canvasFile('image/png', 1, 1, context => context.clearRect(0, 0, 1, 1));
  const { bitmap } = await decodeImage(file);
  try {
    try {
      const webp = await encodeImage(bitmap, { width: 1, height: 1, mime: 'image/webp' });
      equal(webp.type, 'image/webp');
      const decoded = await createImageBitmap(webp);
      try {
        const canvas = document.createElement('canvas'); canvas.width = 1; canvas.height = 1;
        const context = canvas.getContext('2d'); context.drawImage(decoded, 0, 0);
        equal(context.getImageData(0, 0, 1, 1).data[3], 0); canvas.width = 0; canvas.height = 0;
      } finally { decoded.close(); }
    } catch (error) {
      if (error.code !== 'ENCODE_FAILED') throw error;
      assert(/tidak mendukung hasil image\/webp/.test(error.message), 'WebP unsupported harus dijelaskan, bukan diberi extension palsu.');
    }
  } finally { bitmap.close(); }
});

test('toBlob null dan hasil yang melewati 20 MiB ditolak', async () => {
  const file = await canvasFile('image/png'); const { bitmap } = await decodeImage(file);
  const original = HTMLCanvasElement.prototype.toBlob;
  const originalCreateElement = document.createElement;
  const createdCanvases = [];
  document.createElement = function (name, ...args) {
    const element = originalCreateElement.call(this, name, ...args);
    if (name === 'canvas') createdCanvases.push(element);
    return element;
  };
  try {
    HTMLCanvasElement.prototype.toBlob = function (callback) { callback(null); };
    await rejects(encodeImage(bitmap, { width: 3, height: 2, mime: 'image/png' }), 'ENCODE_FAILED');
    HTMLCanvasElement.prototype.toBlob = function (callback, type) {
      callback(new Blob([new Uint8Array(MAX_MEDIA_OUTPUT_BYTES + 1)], { type }));
    };
    await rejects(encodeImage(bitmap, { width: 3, height: 2, mime: 'image/png' }), 'OUTPUT_TOO_LARGE');
    assert(createdCanvases.length === 2 && createdCanvases.every(canvas => canvas.width === 0 && canvas.height === 0), 'Canvas backing store harus dilepas setelah sukses/gagal encode.');
    equal(MAX_MEDIA_OUTPUT_BYTES, 20 * 1024 * 1024);
  } finally {
    HTMLCanvasElement.prototype.toBlob = original;
    document.createElement = originalCreateElement;
    bitmap.close();
  }
});

test('encodeImage menolak dimensi, mime dan kualitas yang tidak valid', async () => {
  const { bitmap } = await decodeImage(await canvasFile('image/png'));
  try {
    await rejects(encodeImage(bitmap, { width: MAX_IMAGE_SIDE + 1, height: 1, mime: 'image/png' }), 'IMAGE_DIMENSIONS');
    await rejects(encodeImage(bitmap, { width: 1, height: 1, mime: 'image/svg+xml' }), 'ENCODE_FAILED');
    await rejects(encodeImage(bitmap, { width: 1, height: 1, mime: 'image/jpeg', quality: 1.1 }), 'ENCODE_FAILED');
  } finally { bitmap.close(); }
});

test('PDF-lib lokal di classic worker membuat lalu memuat ulang PDF A4 satu halaman', async () => {
  assert(globalThis.PDFLib?.PDFDocument, 'PDFLib UMD harus termuat pada runner.');
  const jpeg = await canvasFile('image/jpeg', 64, 48);
  const imageBytes = await jpeg.arrayBuffer();
  const worker = new Worker('./media-foundation.worker.js');
  const result = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Worker PDF melewati batas 10 detik.')), 10_000);
    worker.onerror = event => { clearTimeout(timeout); reject(new Error(event.message || 'Worker PDF gagal.')); };
    worker.onmessage = event => { clearTimeout(timeout); resolve(event.data); };
    worker.postMessage({ id: 'pdf-smoke', operation: 'smoke', imageBytes }, [imageBytes]);
  }).finally(() => worker.terminate());
  equal(result.id, 'pdf-smoke'); equal(result.pageCount, 1);
  assert(Math.abs(result.width - 595.2756) < 0.02); assert(Math.abs(result.height - 841.8898) < 0.02);
  const bytes = new Uint8Array(result.pdfBytes);
  equal(String.fromCharCode(...bytes.subarray(0, 5)), '%PDF-');
  const loaded = await PDFLib.PDFDocument.load(bytes);
  equal(loaded.getPageCount(), 1);
  const page = loaded.getPages()[0]; assert(Math.abs(page.getWidth() - result.width) < 0.01);
  const previewUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const sampleLink = document.createElement('a');
  sampleLink.href = previewUrl; sampleLink.download = 'edwinlab-pdf-worker-smoke.pdf';
  sampleLink.textContent = 'Unduh fixture PDF satu halaman untuk pemeriksaan visual';
  sampleLink.className = 'tools-button';
  document.querySelector('.tools-container').append(sampleLink);
  window.addEventListener('pagehide', () => URL.revokeObjectURL(previewUrl), { once: true });
});

test('PDF worker dapat dihentikan sebelum hasil terlambat dipakai', async () => {
  const worker = new Worker('./media-foundation.worker.js');
  let received = false;
  worker.onmessage = () => { received = true; };
  const jpeg = await canvasFile('image/jpeg', 64, 48);
  const imageBytes = await jpeg.arrayBuffer();
  worker.postMessage({ id: 'pdf-cancel', operation: 'smoke', imageBytes, testDelayMs: 500 });
  worker.terminate();
  await new Promise(resolve => setTimeout(resolve, 600));
  equal(received, false);
});

test('inspectImage menolak file yang bukan Blob', async () => {
  await rejects(inspectImage(null), 'INVALID_IMAGE');
});

await run();
