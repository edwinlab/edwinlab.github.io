function codedError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function validYearMonth(year, month) {
  return Number.isInteger(year) && year >= 1 && year <= 9999 &&
    Number.isInteger(month) && month >= 1 && month <= 12;
}

function assertDate(date) {
  if (!date || !validYearMonth(date.year, date.month) || !Number.isInteger(date.day) ||
      date.day < 1 || date.day > daysInMonth(date.year, date.month)) {
    throw codedError('INVALID_DATE', 'Tanggal tidak valid.');
  }
}

export function daysInMonth(year, month) {
  if (!validYearMonth(year, month)) throw codedError('INVALID_DATE', 'Tahun atau bulan tidak valid.');
  if (month === 2) return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function parseDateOnly(raw) {
  if (typeof raw !== 'string') throw codedError('INVALID_DATE', 'Tanggal harus memakai format YYYY-MM-DD.');
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) throw codedError('INVALID_DATE', 'Tanggal harus memakai format YYYY-MM-DD.');
  const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  assertDate(date);
  return date;
}

function daysBeforeYear(year) {
  const previous = year - 1;
  return previous * 365 + Math.floor(previous / 4) - Math.floor(previous / 100) + Math.floor(previous / 400);
}

export function toDayNumber(date) {
  assertDate(date);
  let result = daysBeforeYear(date.year);
  for (let month = 1; month < date.month; month++) result += daysInMonth(date.year, month);
  return result + date.day - 1;
}

export function fromDayNumber(dayNumber) {
  if (!Number.isInteger(dayNumber) || dayNumber < 0 || dayNumber > 3652058) {
    throw codedError('DATE_RANGE', 'Tanggal hasil berada di luar rentang 0001-01-01 sampai 9999-12-31.');
  }
  let low = 1, high = 10000;
  while (low + 1 < high) {
    const middle = Math.floor((low + high) / 2);
    if (daysBeforeYear(middle) <= dayNumber) low = middle;
    else high = middle;
  }
  let remaining = dayNumber - daysBeforeYear(low);
  let month = 1;
  while (remaining >= daysInMonth(low, month)) remaining -= daysInMonth(low, month++);
  return { year: low, month, day: remaining + 1 };
}

export function addMonthsClamped(date, delta) {
  assertDate(date);
  if (!Number.isInteger(delta)) throw codedError('DATE_RANGE', 'Jumlah bulan harus berupa bilangan bulat.');
  const monthIndex = (date.year - 1) * 12 + (date.month - 1) + delta;
  if (monthIndex < 0 || monthIndex > 9999 * 12 - 1) throw codedError('DATE_RANGE', 'Tanggal hasil berada di luar rentang tahun 0001 sampai 9999.');
  const year = Math.floor(monthIndex / 12) + 1;
  const month = monthIndex % 12 + 1;
  return { year, month, day: Math.min(date.day, daysInMonth(year, month)) };
}
