import { parseDecimal, formatRatio } from '/everyday/shared/number.js';

const MAX_ABS_VALUE = 1_000_000_000_000n;
const MAX_RESULT_CHARS = 64;
const MAX_COPY_BYTES = 2 * 1024;
const MAX_RAW_LENGTH = 64;
const POWERS_OF_TEN = Array.from({ length: 13 }, (_, index) => 10n ** BigInt(index));

function codedError(code, message, field) {
  const error = new Error(message);
  error.code = code;
  if (field) error.field = field;
  return error;
}

function pow10(scale) {
  if (!Number.isInteger(scale) || scale < 0 || scale > 12) {
    throw codedError('NUMBER_PRECISION', 'Presisi angka tidak valid.');
  }
  return POWERS_OF_TEN[scale];
}

function abs(value) { return value < 0n ? -value : value; }

function gcd(left, right) {
  let a = abs(left);
  let b = abs(right);
  while (b !== 0n) [a, b] = [b, a % b];
  return a || 1n;
}

function normalize(numerator, denominator, unit) {
  if (denominator === 0n) throw codedError('DIVISION_BY_ZERO', 'Penyebut tidak boleh nol.', 'second');
  if (denominator < 0n) {
    numerator = -numerator;
    denominator = -denominator;
  }
  const divisor = gcd(numerator, denominator);
  return { numerator: numerator / divisor, denominator: denominator / divisor, unit };
}

function assertDecimal(decimal) {
  if (!decimal || typeof decimal.coefficient !== 'bigint' || !Number.isInteger(decimal.scale) || decimal.scale < 0 || decimal.scale > 6) {
    throw codedError('NUMBER_PRECISION', 'Angka harus memiliki maksimal enam digit pecahan.');
  }
  if (abs(decimal.coefficient) > MAX_ABS_VALUE * pow10(decimal.scale)) {
    throw codedError('RANGE_ERROR', 'Nilai absolut angka tidak boleh lebih dari 1.000.000.000.000.');
  }
}

export function parsePercentageInput(raw, field = 'first') {
  if (typeof raw !== 'string') throw codedError('INVALID_NUMBER', 'Masukkan angka yang valid.', field);
  if (raw.length > MAX_RAW_LENGTH) throw codedError('INPUT_TOO_LARGE', 'Input angka melebihi 64 karakter.', field);
  try {
    const decimal = parseDecimal(raw, { maxIntegerDigits: 13, maxFractionDigits: 6, allowNegative: true });
    assertDecimal(decimal);
    return decimal;
  } catch (error) {
    if (error?.code) {
      error.field = field;
      if (error.code === 'RANGE_ERROR') error.message = 'Nilai absolut angka tidak boleh lebih dari 1.000.000.000.000.';
      throw error;
    }
    throw codedError('INVALID_NUMBER', 'Format angka tidak valid.', field);
  }
}

export function calculatePercentage(mode, firstDecimal, secondDecimal) {
  if (!['portion', 'ratio', 'change'].includes(mode)) {
    throw codedError('INVALID_MODE', 'Pilih jenis perhitungan persen yang tersedia.');
  }
  assertDecimal(firstDecimal);
  assertDecimal(secondDecimal);
  const first = firstDecimal.coefficient;
  const second = secondDecimal.coefficient;
  const firstScale = firstDecimal.scale;
  const secondScale = secondDecimal.scale;

  if (mode === 'portion') {
    return normalize(first * second, pow10(firstScale + secondScale) * 100n, 'number');
  }
  if (mode === 'ratio') {
    if (second === 0n) throw codedError('DIVISION_BY_ZERO', 'Penyebut B tidak boleh nol untuk menghitung persentase.', 'second');
    return normalize(first * pow10(secondScale) * 100n, second * pow10(firstScale), 'percent');
  }

  if (first <= 0n) {
    throw codedError('BASE_NOT_POSITIVE', 'Nilai awal harus lebih besar dari 0 untuk mode perubahan persen.', 'first');
  }
  const commonScale = Math.max(firstScale, secondScale);
  const initialAtScale = first * pow10(commonScale - firstScale);
  const finalAtScale = second * pow10(commonScale - secondScale);
  const difference = finalAtScale - initialAtScale;
  return normalize(difference * 100n * pow10(firstScale), pow10(commonScale) * first, 'percent');
}

function normalizedDecimal(decimal) {
  return formatRatio(decimal.coefficient, pow10(decimal.scale), { places: 6, trimZeros: true });
}

function isRounded(calculation) {
  return (calculation.numerator * 1_000_000n) % calculation.denominator !== 0n;
}

function utf8Bytes(text) {
  return new TextEncoder().encode(text).byteLength;
}

export function assertOutputLimits(resultText, copyText = '') {
  if (typeof resultText !== 'string' || typeof copyText !== 'string') {
    throw new TypeError('Hasil dan ringkasan harus berupa string.');
  }
  if (resultText.length > MAX_RESULT_CHARS) {
    throw codedError('OUTPUT_TOO_LARGE', 'Hasil melewati batas 64 karakter.');
  }
  if (utf8Bytes(copyText) > MAX_COPY_BYTES) {
    throw codedError('OUTPUT_TOO_LARGE', 'Ringkasan salin melewati batas 2 KiB.');
  }
  return { resultText, copyText };
}

export function presentPercentage(mode, firstDecimal, secondDecimal) {
  const calculation = calculatePercentage(mode, firstDecimal, secondDecimal);
  const value = formatRatio(calculation.numerator, calculation.denominator, { places: 6, trimZeros: true });
  const rounded = isRounded(calculation);
  const resultText = `${rounded ? '≈ ' : ''}${value}${calculation.unit === 'percent' ? '%' : ''}`;

  const first = normalizedDecimal(firstDecimal);
  const second = normalizedDecimal(secondDecimal);
  let modeLabel;
  let formula;
  let meaning;
  if (mode === 'portion') {
    modeLabel = 'P persen dari N';
    formula = `${first} × ${second} ÷ 100 = ${resultText}`;
    meaning = `${first}% dari ${second}`;
  } else if (mode === 'ratio') {
    modeLabel = 'A berapa persen dari B';
    formula = `${first} ÷ ${second} × 100 = ${resultText}`;
    meaning = `${first} dibandingkan dengan ${second}`;
  } else {
    modeLabel = 'Perubahan persen';
    formula = `(${second} − ${first}) ÷ ${first} × 100 = ${resultText}`;
    meaning = calculation.numerator > 0n ? 'Naik' : calculation.numerator < 0n ? 'Turun' : 'Tidak berubah';
  }

  const copyText = [
    `Mode: ${modeLabel}`,
    `Nilai: ${first} dan ${second}`,
    `Hasil: ${resultText}${mode === 'change' ? ` (${meaning})` : ''}`,
    `Rumus: ${formula}`,
    ...(rounded ? ['Dibulatkan hingga 6 angka desimal'] : []),
  ].join('\n');
  assertOutputLimits(resultText, copyText);
  return {
    ...calculation,
    resultText,
    rounded,
    firstText: first,
    secondText: second,
    formula,
    meaning,
    modeLabel,
    copyText,
  };
}
