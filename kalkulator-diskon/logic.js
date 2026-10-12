import { parseDecimal, roundRatio, formatRatio } from '/everyday/shared/number.js';

const MAX_PRICE = 1_000_000_000_000n;
const MAX_RAW_LENGTH = 64;
const MAX_OUTPUT_LENGTH = 64;
const MAX_COPY_BYTES = 2 * 1024;
const POWERS_OF_TEN = Array.from({ length: 13 }, (_, index) => 10n ** BigInt(index));

function codedError(code, message, field) {
  const error = new Error(message);
  error.code = code;
  if (field) error.field = field;
  return error;
}

function powerOfTen(scale) {
  if (!Number.isInteger(scale) || scale < 0 || scale > 12) throw codedError('NUMBER_PRECISION', 'Presisi angka tidak valid.');
  return POWERS_OF_TEN[scale];
}

function absolute(value) { return value < 0n ? -value : value; }

function validateDecimal(decimal, kind, field) {
  const maxScale = kind === 'price' ? 2 : 4;
  if (!decimal || typeof decimal.coefficient !== 'bigint' || !Number.isInteger(decimal.scale) || decimal.scale < 0 || decimal.scale > maxScale) {
    throw codedError('NUMBER_PRECISION', kind === 'price' ? 'Harga hanya dapat memakai dua angka desimal.' : 'Persentase hanya dapat memakai empat angka desimal.', field);
  }
  if (decimal.coefficient < 0n) throw codedError('INVALID_NUMBER', 'Nilai tidak boleh negatif.', field);
  const limit = kind === 'price' ? MAX_PRICE : 100n;
  if (decimal.coefficient > limit * powerOfTen(decimal.scale)) {
    throw codedError('RANGE_ERROR', kind === 'price' ? 'Harga harus antara 0 dan 1.000.000.000.000 rupiah.' : 'Persentase diskon harus antara 0 dan 100.', field);
  }
}

export function parseDiscountInput(raw, kind, field) {
  if (typeof raw !== 'string') throw codedError('INVALID_NUMBER', 'Masukkan nilai dalam bentuk angka.', field);
  if (raw.length > MAX_RAW_LENGTH) throw codedError('INPUT_TOO_LARGE', 'Input melebihi 64 karakter.', field);
  if (kind !== 'price' && kind !== 'discount') throw codedError('INVALID_MODE', 'Jenis input tidak dikenal.', field);
  try {
    const decimal = kind === 'price'
      ? parseDecimal(raw, { maxIntegerDigits: 13, maxFractionDigits: 2, allowNegative: false })
      : parseDecimal(raw, { maxIntegerDigits: 3, maxFractionDigits: 4, allowNegative: false });
    validateDecimal(decimal, kind, field);
    return decimal;
  } catch (error) {
    if (error?.code) {
      error.field = field;
      throw error;
    }
    throw codedError('INVALID_NUMBER', 'Format angka tidak valid.', field);
  }
}

function decimalToCents(priceDecimal) {
  validateDecimal(priceDecimal, 'price', 'price');
  return priceDecimal.coefficient * powerOfTen(2 - priceDecimal.scale);
}

export function calculateDiscount(priceDecimal, discountDecimals) {
  if (!Array.isArray(discountDecimals) || discountDecimals.length < 1 || discountDecimals.length > 2) {
    throw codedError('INVALID_MODE', 'Kalkulator mendukung satu atau dua tahap diskon.');
  }
  const originalCents = decimalToCents(priceDecimal);
  for (let index = 0; index < discountDecimals.length; index += 1) {
    validateDecimal(discountDecimals[index], 'discount', `discount${index + 1}`);
  }

  const steps = [];
  let beforeCents = originalCents;
  for (const discount of discountDecimals) {
    const scale = powerOfTen(discount.scale);
    const numerator = beforeCents * (100n * scale - discount.coefficient);
    const denominator = 100n * scale;
    const afterCents = roundRatio(numerator, denominator, 0);
    const discountCents = beforeCents - afterCents;
    if (discountCents < 0n || afterCents < 0n || afterCents > beforeCents) {
      throw codedError('RANGE_ERROR', 'Perhitungan diskon menghasilkan nilai di luar rentang.');
    }
    steps.push({ beforeCents, discountCents, afterCents });
    beforeCents = afterCents;
  }

  const finalCents = beforeCents;
  const savedCents = originalCents - finalCents;
  const stepSavings = steps.reduce((sum, step) => sum + step.discountCents, 0n);
  if (finalCents < 0n || finalCents > originalCents || savedCents !== stepSavings || originalCents !== finalCents + savedCents) {
    throw codedError('RANGE_ERROR', 'Invariant harga dan total hemat tidak terpenuhi.');
  }
  return { originalCents, steps, finalCents, savedCents };
}

export function formatMoney(cents) {
  if (typeof cents !== 'bigint' || cents < 0n) throw codedError('RANGE_ERROR', 'Nilai rupiah tidak valid.');
  const value = `Rp${formatRatio(cents, 100n, { places: 2, trimZeros: false })}`;
  if (value.length > MAX_OUTPUT_LENGTH) throw codedError('OUTPUT_TOO_LARGE', 'Nilai hasil melewati batas 64 karakter.');
  return value;
}

function formatDiscount(discount) {
  return formatRatio(discount.coefficient, powerOfTen(discount.scale), { places: 4, trimZeros: true });
}

function effectiveSavings(calculation) {
  if (calculation.originalCents === 0n) return 'Tidak berlaku (harga awal nol)';
  const effective = formatRatio(calculation.savedCents * 100n, calculation.originalCents, { places: 2, trimZeros: false });
  const approximate = (calculation.savedCents * 10000n) % calculation.originalCents !== 0n;
  return `${approximate ? '≈ ' : ''}${effective}%`;
}

function utf8Bytes(text) {
  return new TextEncoder().encode(text).byteLength;
}

export function assertDiscountOutput(values, copyText) {
  if (!Array.isArray(values) || typeof copyText !== 'string') throw new TypeError('Hasil diskon tidak valid.');
  if (values.some(value => typeof value !== 'string' || value.length > MAX_OUTPUT_LENGTH)) {
    throw codedError('OUTPUT_TOO_LARGE', 'Angka hasil melewati batas 64 karakter.');
  }
  if (utf8Bytes(copyText) > MAX_COPY_BYTES) throw codedError('OUTPUT_TOO_LARGE', 'Rincian salin melewati batas 2 KiB UTF-8.');
  return true;
}

export function presentDiscount(priceDecimal, discountDecimals) {
  const calculation = calculateDiscount(priceDecimal, discountDecimals);
  const discountTexts = discountDecimals.map(formatDiscount);
  const steps = calculation.steps.map((step, index) => ({
    number: index + 1,
    discountText: discountTexts[index],
    beforeText: formatMoney(step.beforeCents),
    discountAmountText: formatMoney(step.discountCents),
    afterText: formatMoney(step.afterCents),
  }));
  const originalText = formatMoney(calculation.originalCents);
  const finalText = formatMoney(calculation.finalCents);
  const savedText = formatMoney(calculation.savedCents);
  const effectiveText = effectiveSavings(calculation);
  const copyText = [
    'Rincian kalkulator diskon',
    `Harga awal: ${originalText}`,
    ...steps.map(step => `Diskon ${step.number}: ${step.discountText}% — ${step.beforeText} − ${step.discountAmountText} = ${step.afterText}`),
    `Harga akhir: ${finalText}`,
    `Total hemat: ${savedText}`,
    `Persen hemat efektif: ${effectiveText}`,
    'Pembulatan: harga bersih dibulatkan ke cent terdekat pada setiap tahap; setengah cent dibulatkan ke atas.',
  ].join('\n');
  assertDiscountOutput([originalText, finalText, savedText, effectiveText, ...steps.flatMap(step => [step.beforeText, step.discountAmountText, step.afterText])], copyText);
  return { ...calculation, discountTexts, originalText, finalText, savedText, effectiveText, steps, copyText };
}
