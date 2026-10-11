import { Cron, CronPattern } from '../tools/vendor/croner/croner.js?v=10.0.2-dev.0';

export const CRONER_VERSION = '10.0.2-dev.0';
const FIELD_INFO = [
  ['minute', 'Minute', 0, 59], ['hour', 'Hour', 0, 23], ['day', 'Day of month', 1, 31],
  ['month', 'Month', 1, 12], ['dayOfWeek', 'Day of week', 0, 7],
];

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export function validateReference(reference) {
  if (typeof reference !== 'string' || reference.length > 64) throw fail('INVALID_REFERENCE', 'Enter an ISO reference with Z or an explicit UTC offset.');
  const text = reference.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/.exec(text);
  if (!match) throw fail('INVALID_REFERENCE', 'Use YYYY-MM-DDTHH:mm:ssZ or an ISO date with an explicit offset, such as +07:00.');
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, offset] = match;
  const [year, month, day, hour, minute, second] = [yearText, monthText, dayText, hourText, minuteText, secondText].map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const monthDays = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > monthDays[month - 1] || hour > 23 || minute > 59 || second > 59 ||
      (offset !== 'Z' && (Number(offset.slice(1, 3)) > 23 || Number(offset.slice(4)) > 59))) {
    throw fail('INVALID_REFERENCE', 'The reference contains an invalid calendar date, time, or UTC offset.');
  }
  const date = new Date(text);
  if (!Number.isFinite(date.getTime()) || date.getUTCFullYear() < 1 || date.getUTCFullYear() > 9999) throw fail('INVALID_REFERENCE', 'Reference must resolve to a date in years 0001–9999.');
  return date;
}

export function validateTimezone(timezone) {
  if (typeof timezone !== 'string' || timezone.length > 100) throw fail('INVALID_TIMEZONE', 'Enter a supported IANA timezone.');
  const zone = timezone.trim();
  if (zone !== 'UTC' && !/^[A-Za-z_]+(?:\/[A-Za-z0-9_+-]+)+$/.test(zone)) throw fail('INVALID_TIMEZONE', 'Use UTC or an IANA zone such as Asia/Jakarta.');
  try { new Intl.DateTimeFormat('en-US', { timeZone: zone }).format(new Date(0)); }
  catch { throw fail('INVALID_TIMEZONE', 'This browser does not support the requested IANA timezone.'); }
  return zone;
}

function validateExpression(expression) {
  if (typeof expression !== 'string' || expression.length > 256) throw fail('INVALID_CRON', 'Cron expression must be at most 256 characters.');
  const fields = expression.trim().split(/\s+/);
  if (fields.length !== 5 || fields.some(field => !/^(?:\*|\d+(?:-\d+)?)(?:\/\d+)?(?:,(?:\*|\d+(?:-\d+)?)(?:\/\d+)?)*$/.test(field))) {
    throw fail('INVALID_CRON', 'Use exactly five numeric fields with *, comma, range, or step syntax. Seconds, years, names, macros, and Quartz modifiers are not supported.');
  }
  return { expression: fields.join(' '), fields };
}

export function formatRun(date, timezone) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', timeZoneName: 'longOffset',
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map(part => [part.type, part.value]));
  const offset = parts.timeZoneName === 'GMT' ? 'UTC+00:00' : parts.timeZoneName.replace('GMT', 'UTC');
  return { utc: date.toISOString(), local: `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`, offset, timezone };
}

export function explainCron(expression, reference, timezone, { horizonYears = 40 } = {}) {
  const validated = validateExpression(expression);
  const date = validateReference(reference);
  const zone = validateTimezone(timezone);
  if (!Number.isInteger(horizonYears) || horizonYears < 1 || horizonYears > 40) throw fail('INVALID_HORIZON', 'Search horizon must be between 1 and 40 years.');
  const horizon = new Date(date);
  horizon.setUTCFullYear(Math.min(date.getUTCFullYear() + horizonYears, 9999));
  let cron, pattern;
  try {
    pattern = new CronPattern(validated.expression, zone, { mode: '5-part', sloppyRanges: false });
    cron = new Cron(validated.expression, { mode: '5-part', timezone: zone, stopAt: horizon, maxRuns: 5 });
  } catch (cause) { throw fail('INVALID_CRON', `Invalid cron expression: ${cause.message}`); }

  try {
    const fields = FIELD_INFO.map(([property, name, min, max], index) => {
      const values = pattern[property].flatMap((value, position) => value ? [position + (property === 'day' || property === 'month' ? 1 : 0)] : []);
      return { name, token: validated.fields[index], range: `${min}–${max}`, values: values.join(', '), note: property === 'dayOfWeek' ? '0 and 7 mean Sunday; normalized values use 0.' : '' };
    });
    const dates = cron.nextRuns(5, date).filter(run => run < horizon);
    if (dates.some((run, index) => run <= (index ? dates[index - 1] : date))) {
      throw fail('CALCULATION_ERROR', 'The library returned a duplicate or non-increasing instant. No result was displayed.');
    }
    const runs = dates.map(run => formatRun(run, zone));
    const partial = runs.length < 5;
    return {
      expression: validated.expression, referenceUtc: date.toISOString(), timezone: zone, fields, runs,
      horizonUtc: horizon.toISOString(), horizonYears, partial,
      reason: partial ? (runs.length ? `Only ${runs.length} occurrences found before the search boundary ${horizon.toISOString()}.` : `No occurrences found before the search boundary ${horizon.toISOString()}.`) : null,
      dayRule: !pattern.starDOM && !pattern.starDOW ? 'Day-of-month OR day-of-week: either restricted field may match.' : 'An unrestricted day field does not impose an additional day constraint; wildcard behavior follows Croner.',
    };
  } finally { cron.stop(); }
}
