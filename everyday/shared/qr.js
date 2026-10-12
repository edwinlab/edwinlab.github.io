const MAX_QR_BYTES = 1000;

function qrError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function assertScalarText(text) {
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = text.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) throw qrError('INVALID_QR_TEXT', 'Teks berisi karakter Unicode yang tidak lengkap.');
      index += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      throw qrError('INVALID_QR_TEXT', 'Teks berisi karakter Unicode yang tidak lengkap.');
    }
  }
}

export function makeQrMatrix(text) {
  if (typeof text !== 'string' || text.length === 0 || text.trim().length === 0) {
    throw qrError('INVALID_QR_TEXT', 'Masukkan teks atau tautan yang tidak kosong.');
  }
  assertScalarText(text);
  if (typeof globalThis.TextEncoder !== 'function') {
    throw qrError('QR_UNAVAILABLE', 'Browser ini belum mendukung pengodean Unicode yang diperlukan.');
  }
  const bytes = new TextEncoder().encode(text);
  if (bytes.length > MAX_QR_BYTES) throw qrError('INPUT_TOO_LARGE', 'Isi QR maksimal 1000 byte UTF-8.');
  const makeQrCode = globalThis.qrcode;
  if (typeof makeQrCode !== 'function') {
    throw qrError('QR_UNAVAILABLE', 'Library QR lokal belum termuat. Muat ulang halaman atau coba browser lain.');
  }

  try {
    makeQrCode.stringToBytes = value => Array.from(new TextEncoder().encode(value));
    const qr = makeQrCode(0, 'M');
    qr.addData(text, 'Byte');
    qr.make();
    const count = qr.getModuleCount();
    if (!Number.isInteger(count) || count < 21 || count > 177) {
      throw qrError('QR_UNAVAILABLE', 'Library QR menghasilkan ukuran yang tidak valid.');
    }
    const matrix = Array.from({ length: count }, (_, row) =>
      Array.from({ length: count }, (_, column) => qr.isDark(row, column)));
    if (!matrix.every(row => row.length === count && row.every(value => typeof value === 'boolean'))) {
      throw qrError('QR_UNAVAILABLE', 'Library QR menghasilkan pola yang tidak valid.');
    }
    return matrix;
  } catch (error) {
    if (error?.code) throw error;
    throw qrError('QR_UNAVAILABLE', 'QR tidak dapat dibuat dari teks ini.');
  }
}
