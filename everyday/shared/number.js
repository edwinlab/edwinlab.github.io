const ASCII_TRIM = /^[\x09-\x0d\x20]+|[\x09-\x0d\x20]+$/g;
const POWERS_OF_TEN = Array.from({ length: 25 }, (_, index) => 10n ** BigInt(index));

function codedError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export function parseDecimal(text, options = {}) {
  if (typeof text !== 'string') throw codedError('INVALID_NUMBER', 'Masukkan angka dalam bentuk teks.');
  if (text.length > 64) throw codedError('INPUT_TOO_LARGE', 'Input angka melebihi 64 karakter.');
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw codedError('INVALID_NUMBER', 'Opsi angka tidak valid.');
  const { maxIntegerDigits = 12, maxFractionDigits = 6, allowNegative = true } = options;
  if (!Number.isInteger(maxIntegerDigits) || maxIntegerDigits < 1 || maxIntegerDigits > 24 ||
      !Number.isInteger(maxFractionDigits) || maxFractionDigits < 0 || maxFractionDigits > 24 ||
      typeof allowNegative !== 'boolean') {
    throw codedError('INVALID_NUMBER', 'Opsi angka tidak valid.');
  }
  const value = text.replace(ASCII_TRIM, '');
  const match = /^(-?)([0-9]+)(?:([.,])([0-9]+))?$/.exec(value);
  if (!match || (!allowNegative && match[1] === '-')) {
    throw codedError('INVALID_NUMBER', 'Format angka tidak valid. Gunakan satu koma atau titik sebagai pemisah desimal.');
  }
  const integerPart = match[2];
  const fractionPart = match[4] ?? '';
  if (integerPart.length > maxIntegerDigits || fractionPart.length > maxFractionDigits) {
    throw codedError('NUMBER_PRECISION', 'Jumlah digit angka melebihi batas.');
  }
  const scale = fractionPart.length;
  let coefficient = BigInt(integerPart + fractionPart);
  if (coefficient !== 0n && match[1] === '-') coefficient = -coefficient;
  return { coefficient, scale };
}

export function roundRatio(numerator, denominator, places = 2) {
  if (typeof numerator !== 'bigint' || typeof denominator !== 'bigint' ||
      !Number.isInteger(places) || places < 0 || places > 12) {
    throw codedError('INVALID_NUMBER', 'Nilai rasio atau jumlah desimal tidak valid.');
  }
  if (denominator === 0n) throw codedError('DIVISION_BY_ZERO', 'Penyebut tidak boleh nol.');
  const scale = POWERS_OF_TEN[places];
  const negative = (numerator < 0n) !== (denominator < 0n);
  const absNumerator = numerator < 0n ? -numerator : numerator;
  const absDenominator = denominator < 0n ? -denominator : denominator;
  const scaled = absNumerator * scale;
  let quotient = scaled / absDenominator;
  const remainder = scaled % absDenominator;
  if (remainder * 2n >= absDenominator) quotient += 1n;
  if (quotient === 0n) return 0n;
  return negative ? -quotient : quotient;
}

export function formatRatio(numerator, denominator, options = {}) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw codedError('INVALID_NUMBER', 'Opsi format angka tidak valid.');
  const { places = 2, trimZeros = false } = options;
  if (typeof trimZeros !== 'boolean' || !Number.isInteger(places) || places < 0 || places > 12) {
    throw codedError('INVALID_NUMBER', 'Opsi format angka tidak valid.');
  }
  const rounded = roundRatio(numerator, denominator, places);
  const negative = rounded < 0n;
  const absolute = negative ? -rounded : rounded;
  const scale = POWERS_OF_TEN[places];
  const integerPart = absolute / scale;
  let fractionPart = places ? String(absolute % scale).padStart(places, '0') : '';
  if (trimZeros) fractionPart = fractionPart.replace(/0+$/, '');
  const sign = negative && absolute !== 0n ? '-' : '';
  return sign + integerPart + (fractionPart ? `,${fractionPart}` : '');
}
