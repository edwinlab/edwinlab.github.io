const MAX_PHONE_RAW = 64;
const MAX_MESSAGE_RAW = 2000;
const MAX_MESSAGE_CODE_POINTS = 500;
const MAX_MESSAGE_BYTES = 2000;
const MAX_URL_LENGTH = 8192;
const ASCII_EDGE_SPACE = /^[\t\n\v\f\r ]+|[\t\n\v\f\r ]+$/g;
const PHONE_ALLOWED = /^[0-9 +()\-]+$/;

function fail(code, field, message) {
  const error = new Error(message);
  error.code = code;
  error.field = field;
  throw error;
}

function trimAscii(value) {
  return value.replace(ASCII_EDGE_SPACE, '');
}

export function normalizeIndonesianPhone(raw) {
  if (typeof raw !== 'string') fail('INVALID_PHONE', 'phone', 'Nomor harus berupa teks.');
  if (raw.length > MAX_PHONE_RAW) fail('PHONE_TOO_LONG', 'phone', 'Nomor maksimal 64 karakter sebelum dirapikan.');
  const trimmed = trimAscii(raw);
  if (!trimmed || !PHONE_ALLOWED.test(trimmed)) fail('INVALID_PHONE', 'phone', 'Gunakan hanya digit ASCII, spasi, tanda hubung, kurung, dan satu tanda + di depan.');

  const compact = trimmed.replace(/[ ()\-]/g, '');
  const pluses = (compact.match(/\+/g) || []).length;
  if (pluses > 1 || (pluses === 1 && !compact.startsWith('+'))) {
    fail('INVALID_PHONE', 'phone', 'Tanda + hanya boleh muncul satu kali di awal nomor.');
  }
  const digits = compact.startsWith('+') ? compact.slice(1) : compact;
  let canonical;
  if (/^08[0-9]{8,11}$/.test(digits)) canonical = `62${digits.slice(1)}`;
  else if (/^628[0-9]{8,11}$/.test(digits)) canonical = digits;
  else fail('INVALID_PHONE', 'phone', 'Masukkan nomor seluler Indonesia dengan awalan 08, 62, atau +62 dan panjang yang sesuai.');

  if (!/^628[0-9]{8,11}$/.test(canonical)) fail('INVALID_PHONE', 'phone', 'Nomor seluler Indonesia tidak sesuai format.');
  return canonical;
}

function validateMessage(raw) {
  if (typeof raw !== 'string') fail('INVALID_MESSAGE', 'message', 'Pesan harus berupa teks.');
  if (raw.length > MAX_MESSAGE_RAW) fail('MESSAGE_TOO_LONG', 'message', 'Pesan mentah maksimal 2000 karakter UTF-16.');
  const message = raw.replace(/\r\n?/g, '\n');

  for (let i = 0; i < message.length; i += 1) {
    const code = message.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = message.charCodeAt(i + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) fail('INVALID_MESSAGE', 'message', 'Pesan mengandung karakter Unicode yang tidak lengkap.');
      i += 1;
      continue;
    }
    if (code >= 0xdc00 && code <= 0xdfff) fail('INVALID_MESSAGE', 'message', 'Pesan mengandung karakter Unicode yang tidak lengkap.');
    if ((code <= 0x1f && code !== 0x09 && code !== 0x0a) || code === 0x7f) {
      fail('INVALID_MESSAGE', 'message', 'Pesan tidak boleh memuat karakter kontrol selain tab dan baris baru.');
    }
  }

  const codePoints = Array.from(message).length;
  if (codePoints > MAX_MESSAGE_CODE_POINTS) fail('MESSAGE_TOO_LONG', 'message', 'Pesan maksimal 500 karakter Unicode; emoji dihitung satu karakter.');
  const byteLength = new TextEncoder().encode(message).length;
  if (byteLength > MAX_MESSAGE_BYTES) fail('MESSAGE_TOO_LONG', 'message', 'Pesan maksimal 2000 byte UTF-8.');
  return message;
}

export function createWhatsAppLink(phoneRaw, messageRaw = '') {
  const phone = normalizeIndonesianPhone(phoneRaw);
  const message = validateMessage(messageRaw);
  const url = `https://wa.me/${phone}${message === '' ? '' : `?text=${encodeURIComponent(message)}`}`;
  if (url.length > MAX_URL_LENGTH) fail('URL_TOO_LONG', 'message', 'Link terlalu panjang untuk ditampilkan dengan aman.');
  return { phone, message, url };
}
