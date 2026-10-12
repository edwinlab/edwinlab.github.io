const MAX_QR_BYTES = 1000;
const QUIET_MODULES = 4;
const MAX_QR_SIDE_PIXELS = 768;

function qrError(code, message, field = 'payload') {
  const error = new Error(message);
  error.code = code;
  error.field = field;
  return error;
}

function assertScalarText(text) {
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = text.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) throw qrError('INVALID_QR_TEXT', 'Teks mengandung karakter Unicode yang tidak lengkap.');
      index += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      throw qrError('INVALID_QR_TEXT', 'Teks mengandung karakter Unicode yang tidak lengkap.');
    }
  }
}

function trimAscii(text) {
  return text.replace(/^[\t\n\v\f\r ]+|[\t\n\v\f\r ]+$/g, '');
}

export function validatePayload(raw, mode) {
  if (typeof raw !== 'string') throw qrError('INVALID_QR_TEXT', 'Masukkan teks atau tautan yang tidak kosong.');
  let payload;
  if (mode === 'url') {
    payload = trimAscii(raw);
    if (!payload) throw qrError('INVALID_URL', 'Masukkan tautan website yang tidak kosong.', 'payload');
    if (!/^https?:\/\//i.test(payload)) throw qrError('INVALID_URL', 'Tautan harus diawali http:// atau https://.', 'payload');
    let parsed;
    try { parsed = new URL(payload); }
    catch { throw qrError('INVALID_URL', 'Tautan website tidak valid. Periksa kembali host dan format URL.', 'payload'); }
    const authority = payload.match(/^https?:\/\/([^/?#]*)/i)?.[1] || '';
    if (!parsed.hostname || parsed.username !== '' || parsed.password !== '' || authority.includes('@')) {
      throw qrError('INVALID_URL', 'Tautan harus memiliki host dan tidak boleh memuat username atau password.', 'payload');
    }
  } else if (mode === 'text') {
    payload = raw;
    if (!payload || payload.trim().length === 0) throw qrError('INVALID_QR_TEXT', 'Masukkan teks yang tidak kosong atau hanya berisi spasi.');
  } else {
    throw qrError('INVALID_MODE', 'Pilih mode tautan website atau teks.');
  }

  assertScalarText(payload);
  if (typeof globalThis.TextEncoder !== 'function') throw qrError('QR_UNAVAILABLE', 'Browser ini belum mendukung pengukuran teks UTF-8 untuk QR.');
  if (payload.length > MAX_QR_BYTES) throw qrError('INPUT_TOO_LARGE', 'Isi QR maksimal 1000 byte UTF-8.');
  const bytes = new TextEncoder().encode(payload);
  if (bytes.length > MAX_QR_BYTES) throw qrError('INPUT_TOO_LARGE', 'Isi QR maksimal 1000 byte UTF-8.');
  return payload;
}

export function getQrLayout(moduleCount) {
  if (!Number.isInteger(moduleCount) || moduleCount < 21 || moduleCount > 177 || (moduleCount - 21) % 4 !== 0) {
    throw qrError('INVALID_QR_MATRIX', 'Ukuran matrix QR tidak valid.');
  }
  const modulePixels = Math.max(2, Math.floor(MAX_QR_SIDE_PIXELS / (moduleCount + QUIET_MODULES * 2)));
  const quietModules = QUIET_MODULES;
  return { modulePixels, quietModules, size: (moduleCount + quietModules * 2) * modulePixels };
}
