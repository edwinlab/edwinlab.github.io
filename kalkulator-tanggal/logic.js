import { parseDateOnly, toDayNumber, fromDayNumber } from '/everyday/shared/calendar.js';

const MAX_DAY_NUMBER = 3652058;
const MAX_SUMMARY_BYTES = 2 * 1024;
const ASCII_TRIM = /^[\x09-\x0d\x20]+|[\x09-\x0d\x20]+$/g;

function codedError(code, message, field) {
  const error = new Error(message);
  error.code = code;
  if (field) error.field = field;
  return error;
}

export function trimDateInput(raw) {
  return typeof raw === 'string' ? raw.replace(ASCII_TRIM, '') : raw;
}

function parseDate(raw, field) {
  if (typeof raw !== 'string' || raw.length !== 10) {
    throw codedError('INVALID_DATE', 'Tanggal harus tepat 10 karakter dengan format YYYY-MM-DD.', field);
  }
  try { return parseDateOnly(raw); }
  catch (error) {
    if (error?.code === 'INVALID_DATE') error.field = field;
    throw error;
  }
}

export function differenceDays(startRaw, endRaw) {
  const start = parseDate(startRaw, 'start');
  const end = parseDate(endRaw, 'end');
  return toDayNumber(end) - toDayNumber(start);
}

export function parseDayCount(countRaw) {
  if (typeof countRaw !== 'string' || !/^[0-9]{1,7}$/.test(countRaw)) {
    throw codedError('INVALID_DAY_COUNT', 'Jumlah hari harus berupa 1–7 digit angka bulat nonnegatif.', 'count');
  }
  const count = Number(countRaw);
  if (!Number.isSafeInteger(count) || count > MAX_DAY_NUMBER) {
    throw codedError('DAY_COUNT_RANGE', 'Jumlah hari harus antara 0 dan 3652058.', 'count');
  }
  return count;
}

function formatDate(date) {
  return `${String(date.year).padStart(4, '0')}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
}

export function shiftDate(startRaw, countRaw, direction) {
  const start = parseDate(startRaw, 'start');
  const count = parseDayCount(countRaw);
  if (direction !== 'add' && direction !== 'subtract') {
    throw codedError('INVALID_DIRECTION', 'Pilih tambah atau kurangi hari.', 'direction');
  }
  const startDay = toDayNumber(start);
  const targetDay = direction === 'add' ? startDay + count : startDay - count;
  if (!Number.isInteger(targetDay) || targetDay < 0 || targetDay > MAX_DAY_NUMBER) {
    throw codedError('DATE_RANGE', 'Tanggal hasil berada di luar rentang 0001-01-01 sampai 9999-12-31.', 'count');
  }
  return formatDate(fromDayNumber(targetDay));
}

export function createDateSummary(text) {
  if (typeof text !== 'string') throw new TypeError('Ringkasan tanggal harus berupa teks.');
  if (new TextEncoder().encode(text).byteLength > MAX_SUMMARY_BYTES) {
    throw codedError('OUTPUT_TOO_LARGE', 'Ringkasan melebihi batas 2 KiB UTF-8.');
  }
  return text;
}
