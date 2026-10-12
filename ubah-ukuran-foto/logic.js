function sizeError(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

const ASCII_EDGE_SPACE = /^[\t\n\v\f\r ]+|[\t\n\v\f\r ]+$/g;

export function parseSizeValue(raw) {
  if (typeof raw !== 'string') sizeError('INVALID_SIZE_VALUE', 'Masukkan bilangan bulat ASCII.');
  if (raw.length > 8) sizeError('INVALID_SIZE_VALUE', 'Masukkan maksimal 8 digit.');
  const value = raw.replace(ASCII_EDGE_SPACE, '');
  if (!/^[0-9]+$/.test(value)) sizeError('INVALID_SIZE_VALUE', 'Gunakan angka bulat ASCII tanpa spasi di tengah.');
  const number = Number(value);
  if (!Number.isSafeInteger(number)) sizeError('INVALID_SIZE_VALUE', 'Nilai ukuran tidak valid.');
  return number;
}

export function calculateSize(width, height, mode, value) {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 1 || height < 1) {
    sizeError('INVALID_DIMENSIONS', 'Dimensi asli harus berupa bilangan bulat positif.');
  }
  if (!Number.isSafeInteger(value)) sizeError('INVALID_SIZE_VALUE', 'Nilai ukuran harus berupa bilangan bulat.');
  if (mode === 'width') {
    if (value < 1 || value > width) sizeError('SIZE_RANGE', `Lebar harus antara 1 dan ${width} px.`);
    return { width: value, height: Math.max(1, Math.round(height * value / width)) };
  }
  if (mode === 'height') {
    if (value < 1 || value > height) sizeError('SIZE_RANGE', `Tinggi harus antara 1 dan ${height} px.`);
    return { width: Math.max(1, Math.round(width * value / height)), height: value };
  }
  if (mode === 'percent') {
    if (value < 1 || value > 100) sizeError('SIZE_RANGE', 'Persen harus antara 1 dan 100.');
    return {
      width: Math.max(1, Math.round(width * value / 100)),
      height: Math.max(1, Math.round(height * value / 100)),
    };
  }
  sizeError('INVALID_MODE', 'Pilih mode lebar, tinggi, atau persen.');
}

export function formatImageBytes(bytes) {
  if (!Number.isSafeInteger(bytes) || bytes < 0) sizeError('INVALID_SIZE', 'Ukuran byte tidak valid.');
  if (bytes < 1024 * 1024) return `${bytes} byte (${(bytes / 1024).toFixed(1).replace('.', ',')} KiB)`;
  return `${bytes} byte (${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MiB)`;
}
