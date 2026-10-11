const MAX_DATE_MS = 8_640_000_000_000_000;
const MAX_INPUT_LENGTH = 128;

function toolError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export function formatEpochSeconds(epochMilliseconds) {
  if (!Number.isSafeInteger(epochMilliseconds)) {
    throw toolError('INVALID_EPOCH', 'Epoch milliseconds must be a safe integer.');
  }
  const value = BigInt(epochMilliseconds);
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const whole = absolute / 1000n;
  const remainder = absolute % 1000n;
  if (remainder === 0n) return `${negative ? '-' : ''}${whole}`;
  const fraction = remainder.toString().padStart(3, '0').replace(/0+$/, '');
  return `${negative ? '-' : ''}${whole}.${fraction}`;
}

export function parseUnixTimestamp(input, unit = 'auto') {
  if (!['auto', 'seconds', 'milliseconds'].includes(unit)) {
    throw toolError('INVALID_UNIT', 'Choose Auto, Seconds, or Milliseconds.');
  }
  const text = String(input).trim();
  if (!text) throw toolError('EMPTY_INPUT', 'Enter a Unix timestamp.');
  if (text.length > MAX_INPUT_LENGTH) throw toolError('INPUT_TOO_LONG', 'Timestamp input is too long.');
  if (!/^[+-]?\d+$/.test(text)) {
    throw toolError('INVALID_TIMESTAMP', 'Use a whole number without commas, spaces, or exponent notation.');
  }

  const numeric = Number(text);
  if (!Number.isSafeInteger(numeric)) {
    throw toolError('UNSAFE_INTEGER', 'Timestamp is outside the exact integer range supported by JavaScript.');
  }
  const digits = text.replace(/^[+-]/, '').replace(/^0+(?=\d)/, '');
  const detectedUnit = digits.length <= 10 ? 'seconds' : 'milliseconds';
  const actualUnit = unit === 'auto' ? detectedUnit : unit;
  const epochMilliseconds = actualUnit === 'seconds' ? numeric * 1000 : numeric;
  if (!Number.isSafeInteger(epochMilliseconds) || Math.abs(epochMilliseconds) > MAX_DATE_MS) {
    throw toolError('DATE_OUT_OF_RANGE', 'This timestamp is outside the date range supported by JavaScript.');
  }
  if (!Number.isFinite(new Date(epochMilliseconds).getTime())) {
    throw toolError('DATE_OUT_OF_RANGE', 'This timestamp is outside the date range supported by JavaScript.');
  }

  return {
    epochMilliseconds,
    epochSeconds: formatEpochSeconds(epochMilliseconds),
    unit: actualUnit,
    detectedUnit,
    usedAuto: unit === 'auto',
  };
}

export function parseIsoDate(input) {
  const text = String(input).trim();
  if (!text) throw toolError('EMPTY_INPUT', 'Enter an ISO 8601 date and time.');
  if (text.length > MAX_INPUT_LENGTH) throw toolError('INPUT_TOO_LONG', 'Date input is too long.');
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/.exec(text);
  if (!match) {
    throw toolError('INVALID_ISO_DATE', 'Use YYYY-MM-DDTHH:mm:ss[.SSS] followed by Z or an explicit ±HH:mm offset.');
  }

  const [, yearText, monthText, dayText, hourText, minuteText, secondText, fraction = '', zone] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  const millisecond = Number(fraction.padEnd(3, '0'));
  if (year < 1 || year > 9999 || month < 1 || month > 12 || hour > 23 || minute > 59 || second > 59) {
    throw toolError('INVALID_CALENDAR_DATE', 'Check the year, month, day, hour, minute, and second values.');
  }
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day < 1 || day > daysInMonth[month - 1]) {
    throw toolError('INVALID_CALENDAR_DATE', 'That day does not exist in the selected month and year.');
  }

  let offsetMinutes = 0;
  if (zone !== 'Z') {
    const offsetMatch = /^([+-])(\d{2}):(\d{2})$/.exec(zone);
    const offsetHour = Number(offsetMatch[2]);
    const offsetMinute = Number(offsetMatch[3]);
    if (offsetHour > 14 || offsetMinute > 59 || (offsetHour === 14 && offsetMinute !== 0)) {
      throw toolError('INVALID_OFFSET', 'UTC offsets must be between −14:00 and +14:00.');
    }
    const sign = offsetMatch[1] === '+' ? 1 : -1;
    offsetMinutes = sign * (offsetHour * 60 + offsetMinute);
  }

  // setUTCFullYear avoids Date.UTC's special handling of years 0001–0099.
  const localAsUtc = new Date(0);
  localAsUtc.setUTCFullYear(year, month - 1, day);
  localAsUtc.setUTCHours(hour, minute, second, millisecond);
  const epochMilliseconds = localAsUtc.getTime() - offsetMinutes * 60_000;
  if (!Number.isSafeInteger(epochMilliseconds) || Math.abs(epochMilliseconds) > MAX_DATE_MS) {
    throw toolError('DATE_OUT_OF_RANGE', 'This date is outside the range supported by JavaScript.');
  }
  return {
    epochMilliseconds,
    epochSeconds: formatEpochSeconds(epochMilliseconds),
  };
}

export function formatDateInTimeZone(epochMilliseconds, timeZone = 'UTC') {
  if (!Number.isSafeInteger(epochMilliseconds) || Math.abs(epochMilliseconds) > MAX_DATE_MS) {
    throw toolError('DATE_OUT_OF_RANGE', 'This value is outside the date range supported by JavaScript.');
  }
  let formatter;
  try {
    formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
      hourCycle: 'h23',
      timeZoneName: 'longOffset',
    });
  } catch {
    throw toolError('INVALID_TIME_ZONE', `“${timeZone}” is not a time zone supported by this browser.`);
  }
  const parts = formatter.formatToParts(new Date(epochMilliseconds));
  const part = (type) => parts.find((item) => item.type === type)?.value ?? '';
  const offset = part('timeZoneName').replace(/^GMT$/, 'GMT+00:00');
  return {
    date: `${part('weekday')}, ${part('day')} ${part('month')} ${part('year')}, ${part('hour')}:${part('minute')}:${part('second')}.${part('fractionalSecond')}`,
    offset,
    timeZone,
  };
}

export function convertTimestampToDate(input, { unit = 'auto', timeZone = 'UTC' } = {}) {
  const timestamp = parseUnixTimestamp(input, unit);
  const display = formatDateInTimeZone(timestamp.epochMilliseconds, timeZone);
  return {
    ...timestamp,
    isoUtc: new Date(timestamp.epochMilliseconds).toISOString(),
    localizedDate: display.date,
    offset: display.offset,
    timeZone: display.timeZone,
  };
}

export function convertDateToTimestamp(input, { timeZone = 'UTC' } = {}) {
  const timestamp = parseIsoDate(input);
  const display = formatDateInTimeZone(timestamp.epochMilliseconds, timeZone);
  return {
    ...timestamp,
    isoUtc: new Date(timestamp.epochMilliseconds).toISOString(),
    localizedDate: display.date,
    offset: display.offset,
    timeZone: display.timeZone,
  };
}
