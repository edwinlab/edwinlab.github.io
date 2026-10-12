import { parseDateOnly, toDayNumber, addMonthsClamped } from '/everyday/shared/calendar.js';

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

function parseAgeDate(raw, field) {
  if (typeof raw !== 'string' || raw.length !== 10) {
    throw codedError('INVALID_DATE', 'Tanggal harus tepat 10 karakter dengan format YYYY-MM-DD.', field);
  }
  try { return parseDateOnly(raw); }
  catch (error) {
    if (error?.code === 'INVALID_DATE') error.field = field;
    throw error;
  }
}

export function calculateAge(birthRaw, asOfRaw) {
  const birth = parseAgeDate(birthRaw, 'birth');
  const asOf = parseAgeDate(asOfRaw, 'asOf');
  const birthDay = toDayNumber(birth);
  const asOfDay = toDayNumber(asOf);
  if (asOfDay < birthDay) throw codedError('AS_OF_BEFORE_BIRTH', 'Tanggal acuan harus sama dengan atau setelah tanggal lahir.', 'asOf');

  let years = asOf.year - birth.year;
  let yearAnchor = addMonthsClamped(birth, years * 12);
  if (toDayNumber(yearAnchor) > asOfDay) {
    years -= 1;
    yearAnchor = addMonthsClamped(birth, years * 12);
  }

  let months = Math.min(11, (asOf.year - yearAnchor.year) * 12 + asOf.month - yearAnchor.month);
  while (months > 0 && toDayNumber(addMonthsClamped(yearAnchor, months)) > asOfDay) months -= 1;
  const monthAnchor = addMonthsClamped(yearAnchor, months);
  const days = asOfDay - toDayNumber(monthAnchor);
  const totalDays = asOfDay - birthDay;
  if (![years, months, days, totalDays].every(Number.isSafeInteger) || years < 0 || months < 0 || days < 0 || totalDays < 0) {
    throw codedError('DATE_RANGE', 'Usia berada di luar rentang tanggal yang didukung.');
  }
  return { years, months, days, totalDays };
}

export function createAgeSummary(birthRaw, asOfRaw, age) {
  if (!age || ![age.years, age.months, age.days, age.totalDays].every(value => Number.isSafeInteger(value) && value >= 0)) {
    throw codedError('DATE_RANGE', 'Hasil usia tidak valid.');
  }
  const summary = [
    'Hasil kalkulator usia',
    `Tanggal lahir: ${birthRaw}`,
    `Tanggal acuan: ${asOfRaw}`,
    `Usia: ${age.years} tahun, ${age.months} bulan, ${age.days} hari`,
    `Total: ${age.totalDays} hari`,
  ].join('\n');
  const size = new TextEncoder().encode(summary).byteLength;
  if (size > MAX_SUMMARY_BYTES) throw codedError('OUTPUT_TOO_LARGE', 'Ringkasan usia melebihi batas 2 KiB UTF-8.');
  return summary;
}
