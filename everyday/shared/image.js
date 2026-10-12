export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 12_000_000;
export const MAX_IMAGE_SIDE = 8192;
export const MAX_MEDIA_OUTPUT_BYTES = 20 * 1024 * 1024;
export const MAX_IMAGE_HEADER_BYTES = 64 * 1024;

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
const JPEG_SOF_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
  0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

function mediaError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function dimensions(width, height) {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 1 || height < 1 ||
      width > MAX_IMAGE_SIDE || height > MAX_IMAGE_SIDE || width * height > MAX_IMAGE_PIXELS) {
    throw mediaError('IMAGE_DIMENSIONS', 'Dimensi gambar melewati batas 8192 px per sisi dan 12 juta piksel.');
  }
}

function readPngHeader(bytes, fileSize) {
  if (bytes.length < 8 || !PNG_SIGNATURE.every((byte, index) => bytes[index] === byte)) {
    throw mediaError('UNSUPPORTED_IMAGE', 'Pilih gambar JPEG atau PNG yang valid.');
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 8;
  let sawHeader = false;

  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset, false);
    const typeOffset = offset + 4;
    const dataOffset = offset + 8;
    const end = dataOffset + length;
    if (!Number.isSafeInteger(end) || end + 4 > fileSize) {
      throw mediaError('INVALID_IMAGE', 'Struktur header PNG tidak lengkap.');
    }
    const type = String.fromCharCode(bytes[typeOffset], bytes[typeOffset + 1], bytes[typeOffset + 2], bytes[typeOffset + 3]);

    if (!sawHeader) {
      if (type !== 'IHDR' || length !== 13) throw mediaError('INVALID_IMAGE', 'Header PNG tidak valid.');
      sawHeader = true;
      const width = view.getUint32(dataOffset, false);
      const height = view.getUint32(dataOffset + 4, false);
      dimensions(width, height);
    } else if (type === 'acTL') {
      throw mediaError('UNSUPPORTED_IMAGE', 'PNG animasi belum didukung. Pilih satu gambar JPEG atau PNG.');
    } else if (type === 'IDAT') {
      return {
        mime: 'image/png',
        width: view.getUint32(16, false),
        height: view.getUint32(20, false),
        orientation: 1,
      };
    }
    if (end + 4 > bytes.length) {
      throw mediaError('INVALID_IMAGE', 'Header PNG melewati batas pemindaian 64 KiB.');
    }
    offset = end + 4;
  }
  throw mediaError('INVALID_IMAGE', 'Header PNG tidak lengkap sebelum data gambar.');
}

function readExifOrientation(bytes, start, end) {
  if (end - start < 14 || String.fromCharCode(...bytes.subarray(start, start + 6)) !== 'Exif\0\0') return 1;
  const tiff = start + 6;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const byteOrder = String.fromCharCode(bytes[tiff], bytes[tiff + 1]);
  if (byteOrder !== 'II' && byteOrder !== 'MM') return 1;
  const little = byteOrder === 'II';
  const u16 = offset => view.getUint16(offset, little);
  const u32 = offset => view.getUint32(offset, little);
  if (tiff + 8 > end || u16(tiff + 2) !== 42) return 1;
  const ifd = tiff + u32(tiff + 4);
  if (ifd + 2 > end) return 1;
  const count = u16(ifd);
  const tableEnd = ifd + 2 + count * 12;
  if (!Number.isSafeInteger(tableEnd) || tableEnd + 4 > end) return 1;
  for (let index = 0; index < count; index += 1) {
    const entry = ifd + 2 + index * 12;
    if (u16(entry) !== 0x0112) continue;
    if (u16(entry + 2) !== 3 || u32(entry + 4) !== 1) return 1;
    const orientation = u16(entry + 8);
    return orientation >= 1 && orientation <= 8 ? orientation : 1;
  }
  return 1;
}

function readJpegHeader(bytes, fileSize) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw mediaError('UNSUPPORTED_IMAGE', 'Pilih gambar JPEG atau PNG yang valid.');
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 2;
  let orientation = 1;

  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) throw mediaError('INVALID_IMAGE', 'Marker header JPEG tidak valid.');
    while (offset < bytes.length && bytes[offset] === 0xff) offset += 1;
    if (offset >= bytes.length) break;
    const marker = bytes[offset];
    offset += 1;
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) continue;
    if (offset + 2 > bytes.length) throw mediaError('INVALID_IMAGE', 'Segment header JPEG tidak lengkap.');
    const length = view.getUint16(offset, false);
    if (length < 2 || offset + length > fileSize) throw mediaError('INVALID_IMAGE', 'Panjang segment JPEG tidak valid.');
    const dataStart = offset + 2;
    const dataEnd = offset + length;

    if (marker === 0xe2 && dataEnd - dataStart >= 4 &&
        bytes[dataStart] === 0x4d && bytes[dataStart + 1] === 0x50 &&
        bytes[dataStart + 2] === 0x46 && bytes[dataStart + 3] === 0x00) {
      throw mediaError('UNSUPPORTED_IMAGE', 'JPEG multi-foto belum didukung. Pilih JPEG biasa atau PNG.');
    }
    if (marker === 0xe1) {
      if (dataEnd > bytes.length) throw mediaError('INVALID_IMAGE', 'Header EXIF JPEG melewati batas pemindaian 64 KiB.');
      orientation = readExifOrientation(bytes, dataStart, dataEnd);
    }

    if (JPEG_SOF_MARKERS.has(marker)) {
      if (dataEnd > bytes.length) throw mediaError('INVALID_IMAGE', 'Header dimensi JPEG melewati batas pemindaian 64 KiB.');
      if (length < 11) throw mediaError('INVALID_IMAGE', 'Dimensi header JPEG tidak lengkap.');
      const height = view.getUint16(dataStart + 1, false);
      const width = view.getUint16(dataStart + 3, false);
      const components = bytes[dataStart + 5];
      if (components < 1 || length !== 8 + 3 * components) throw mediaError('INVALID_IMAGE', 'Komponen header JPEG tidak valid.');
      dimensions(width, height);
      return { mime: 'image/jpeg', width, height, orientation };
    }
    if (dataEnd > bytes.length) throw mediaError('INVALID_IMAGE', 'Header JPEG melewati batas pemindaian 64 KiB.');
    offset = dataEnd;
  }
  throw mediaError('INVALID_IMAGE', 'Header JPEG tidak memiliki dimensi gambar yang valid.');
}

export async function inspectImage(file) {
  if (!file || typeof file.size !== 'number' || typeof file.slice !== 'function') {
    throw mediaError('INVALID_IMAGE', 'Pilih file gambar terlebih dahulu.');
  }
  if (file.size === 0) throw mediaError('INVALID_IMAGE', 'File gambar kosong.');
  if (!Number.isSafeInteger(file.size) || file.size < 0 || file.size > MAX_IMAGE_BYTES) {
    throw mediaError('INPUT_TOO_LARGE', 'Ukuran file harus antara 1 byte dan 10 MiB.');
  }
  let bytes;
  try { bytes = new Uint8Array(await file.slice(0, Math.min(file.size, MAX_IMAGE_HEADER_BYTES)).arrayBuffer()); }
  catch { throw mediaError('INVALID_IMAGE', 'File gambar tidak dapat dibaca.'); }
  return bytes[0] === PNG_SIGNATURE[0] ? readPngHeader(bytes, file.size) : readJpegHeader(bytes, file.size);
}

export async function decodeImage(file) {
  const header = await inspectImage(file);
  if (typeof globalThis.createImageBitmap !== 'function') {
    throw mediaError('IMAGE_UNSUPPORTED', 'Browser ini belum mendukung pembacaan gambar yang diperlukan. Perbarui browser atau coba browser lain.');
  }
  let bitmap;
  try {
    bitmap = await globalThis.createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch (error) {
    if (error instanceof TypeError) {
      throw mediaError('IMAGE_UNSUPPORTED', 'Browser ini belum mendukung pembacaan gambar berorientasi dengan benar. Perbarui browser atau coba browser lain.');
    }
    throw mediaError('INVALID_IMAGE', 'Data gambar rusak atau tidak dapat dibuka oleh browser.');
  }
  try {
    dimensions(bitmap.width, bitmap.height);
    const swapsSides = header.orientation >= 5 && header.orientation <= 8;
    const expectedWidth = swapsSides ? header.height : header.width;
    const expectedHeight = swapsSides ? header.width : header.height;
    if (bitmap.width !== expectedWidth || bitmap.height !== expectedHeight) {
      throw mediaError('IMAGE_UNSUPPORTED', 'Browser ini tidak menerapkan orientasi foto dengan benar. Coba browser lain.');
    }
    return { bitmap, width: bitmap.width, height: bitmap.height, mime: header.mime };
  } catch (error) {
    bitmap.close();
    throw error;
  }
}

export async function encodeImage(bitmap, { width, height, mime, quality = 0.8, background = '#ffffff' } = {}) {
  if (!bitmap || typeof bitmap.width !== 'number' || typeof bitmap.height !== 'number') {
    throw mediaError('INVALID_IMAGE', 'Bitmap gambar tidak valid.');
  }
  dimensions(width, height);
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mime)) {
    throw mediaError('ENCODE_FAILED', 'Format hasil gambar tidak didukung.');
  }
  if (typeof quality !== 'number' || !Number.isFinite(quality) || quality < 0 || quality > 1 ||
      typeof background !== 'string' || !background.trim()) {
    throw mediaError('ENCODE_FAILED', 'Pengaturan format gambar tidak valid.');
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  try {
    const context = canvas.getContext('2d', { alpha: mime !== 'image/jpeg' });
    if (!context) throw mediaError('ENCODE_FAILED', 'Canvas gambar tidak tersedia di browser ini.');
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    if (mime === 'image/jpeg') {
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);
    }
    context.drawImage(bitmap, 0, 0, width, height);
    let blob;
    try {
      blob = await new Promise((resolve, reject) => {
        try { canvas.toBlob(resolve, mime, quality); } catch (error) { reject(error); }
      });
    } catch { throw mediaError('ENCODE_FAILED', 'Browser gagal membuat file gambar.'); }
    if (!blob || blob.size < 1) throw mediaError('ENCODE_FAILED', 'Browser gagal membuat file gambar.');
    if (blob.type.toLowerCase() !== mime) throw mediaError('ENCODE_FAILED', `Browser tidak mendukung hasil ${mime}. Pilih format JPEG atau PNG.`);
    if (blob.size > MAX_MEDIA_OUTPUT_BYTES) throw mediaError('OUTPUT_TOO_LARGE', 'Ukuran hasil melewati batas 20 MiB.');
    return blob;
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}
