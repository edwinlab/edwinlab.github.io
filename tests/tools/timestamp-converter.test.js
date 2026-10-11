import { assert, equal, test, throws, run } from './harness.js';
import {
  convertDateToTimestamp,
  convertTimestampToDate,
  formatDateInTimeZone,
  formatEpochSeconds,
  parseIsoDate,
  parseUnixTimestamp,
} from '../../timestamp-converter/logic.js';

test('zero seconds maps to the Unix epoch', () => {
  equal(convertTimestampToDate('0', { unit: 'seconds' }).isoUtc, '1970-01-01T00:00:00.000Z');
});

test('negative seconds preserve the second before the epoch', () => {
  equal(convertTimestampToDate('-1', { unit: 'seconds' }).isoUtc, '1969-12-31T23:59:59.000Z');
});

test('a ten-digit timestamp converts from seconds to UTC', () => {
  const result = convertTimestampToDate('1704067200', { unit: 'seconds' });
  equal(result.isoUtc, '2024-01-01T00:00:00.000Z');
  equal(result.epochMilliseconds, 1704067200000);
});

test('a thirteen-digit timestamp converts from milliseconds and keeps its fraction', () => {
  const result = convertTimestampToDate('1704067200123', { unit: 'milliseconds' });
  equal(result.isoUtc, '2024-01-01T00:00:00.123Z');
  equal(result.epochSeconds, '1704067200.123');
});

test('manual milliseconds selection takes precedence over digit-count detection', () => {
  const result = convertTimestampToDate('1704067200', { unit: 'milliseconds' });
  equal(result.isoUtc, '1970-01-20T17:21:07.200Z');
  equal(result.unit, 'milliseconds');
});

test('auto detection treats ten digits as seconds and eleven as milliseconds', () => {
  equal(parseUnixTimestamp('1704067200').unit, 'seconds');
  equal(parseUnixTimestamp('10000000000').unit, 'milliseconds');
  equal(parseUnixTimestamp('-0000000001').unit, 'seconds');
  equal(parseUnixTimestamp('+1704067200', 'seconds').epochMilliseconds, 1704067200000);
});

test('timestamp syntax rejects empty input, exponents, separators, and decimals', () => {
  throws(() => parseUnixTimestamp(''), 'EMPTY_INPUT');
  for (const input of ['1e9', '1,000', '1 000', '1.5', '--1']) {
    throws(() => parseUnixTimestamp(input), 'INVALID_TIMESTAMP');
  }
});

test('unsafe integers and dates outside the JavaScript Date range are rejected', () => {
  throws(() => parseUnixTimestamp('9007199254740992', 'milliseconds'), 'UNSAFE_INTEGER');
  throws(() => parseUnixTimestamp('8640000000000001', 'milliseconds'), 'DATE_OUT_OF_RANGE');
  throws(() => parseUnixTimestamp('8640000000001', 'seconds'), 'DATE_OUT_OF_RANGE');
});

test('an ISO date with a positive offset converts to the same epoch instant', () => {
  const result = convertDateToTimestamp('2024-01-01T07:00:00+07:00');
  equal(result.epochMilliseconds, 1704067200000);
  equal(result.epochSeconds, '1704067200');
  equal(result.isoUtc, '2024-01-01T00:00:00.000Z');
});

test('an ISO fractional second is preserved to millisecond precision', () => {
  const result = parseIsoDate('2024-01-01T00:00:00.123Z');
  equal(result.epochMilliseconds, 1704067200123);
  equal(result.epochSeconds, '1704067200.123');
  equal(parseIsoDate('2024-01-01T00:00:00.12Z').epochSeconds, '1704067200.12');
});

test('negative epoch fractions retain their sign and precision', () => {
  const result = parseIsoDate('1969-12-31T23:59:59.999Z');
  equal(result.epochMilliseconds, -1);
  equal(result.epochSeconds, '-0.001');
  equal(formatEpochSeconds(-120), '-0.12');
});

test('leap days are checked using the Gregorian calendar', () => {
  equal(parseIsoDate('2024-02-29T12:00:00Z').epochMilliseconds, Date.parse('2024-02-29T12:00:00Z'));
  throws(() => parseIsoDate('2023-02-29T12:00:00Z'), 'INVALID_CALENDAR_DATE');
  throws(() => parseIsoDate('2024-02-30T00:00:00Z'), 'INVALID_CALENDAR_DATE');
});

test('hours, minutes, seconds, and years are validated before parsing', () => {
  for (const input of ['2024-01-01T24:00:00Z', '2024-01-01T00:60:00Z', '2024-01-01T00:00:60Z', '0000-01-01T00:00:00Z']) {
    throws(() => parseIsoDate(input), 'INVALID_CALENDAR_DATE');
  }
});

test('ISO input must have a zone and use the supported strict format', () => {
  for (const input of [
    '2024-01-01T00:00:00',
    '2024-01-01 00:00:00Z',
    '2024-01-01T00:00Z',
    '2024-01-01T00:00:00.1234Z',
    'Jan 1, 2024',
  ]) {
    throws(() => parseIsoDate(input), 'INVALID_ISO_DATE');
  }
});

test('UTC offsets are bounded to fourteen hours and valid minutes', () => {
  equal(parseIsoDate('2024-01-01T14:00:00+14:00').epochMilliseconds, Date.parse('2024-01-01T00:00:00Z'));
  throws(() => parseIsoDate('2024-01-01T14:01:00+14:01'), 'INVALID_OFFSET');
  throws(() => parseIsoDate('2024-01-01T00:00:00+15:00'), 'INVALID_OFFSET');
  throws(() => parseIsoDate('2024-01-01T00:00:00+01:60'), 'INVALID_OFFSET');
});

test('years below 100 are not shifted into the twentieth century', () => {
  equal(new Date(parseIsoDate('0001-01-01T00:00:00Z').epochMilliseconds).toISOString(), '0001-01-01T00:00:00.000Z');
});

test('Asia/Jakarta displays 07:00 WIB while UTC epoch values remain unchanged', () => {
  const utc = convertTimestampToDate('1704067200', { unit: 'seconds', timeZone: 'UTC' });
  const jakarta = convertTimestampToDate('1704067200', { unit: 'seconds', timeZone: 'Asia/Jakarta' });
  equal(utc.epochMilliseconds, jakarta.epochMilliseconds);
  equal(jakarta.localizedDate, 'Mon, 01 Jan 2024, 07:00:00.000');
  equal(jakarta.offset, 'GMT+07:00');
});

test('zone formatting uses the offset that applies on the selected date', () => {
  equal(formatDateInTimeZone(Date.parse('2024-01-01T12:00:00Z'), 'America/New_York').offset, 'GMT-05:00');
  equal(formatDateInTimeZone(Date.parse('2024-07-01T12:00:00Z'), 'America/New_York').offset, 'GMT-04:00');
});

test('unsupported time zones fail with a clear error code', () => {
  const error = throws(() => formatDateInTimeZone(0, 'Not/A_Real_Zone'), 'INVALID_TIME_ZONE');
  assert(error.message.includes('not a time zone supported'));
});

test('the heuristic is disclosed in the conversion result', () => {
  equal(convertTimestampToDate('1704067200').usedAuto, true);
  equal(convertTimestampToDate('1704067200', { unit: 'seconds' }).usedAuto, false);
});

test('timestamp input length is bounded', () => {
  throws(() => parseUnixTimestamp('1'.repeat(129)), 'INPUT_TOO_LONG');
  throws(() => parseIsoDate('2'.repeat(129)), 'INPUT_TOO_LONG');
});

await run();
