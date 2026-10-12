import { parseDecimal } from '/everyday/shared/number.js';

const MAX_RAW_LENGTH = 24;
const MAX_SUMMARY_BYTES = 2 * 1024;

const UNITS = Object.freeze({
  length: Object.freeze({
    mm: Object.freeze({ label: 'Milimeter', symbol: 'mm', factor: 0.001 }),
    cm: Object.freeze({ label: 'Sentimeter', symbol: 'cm', factor: 0.01 }),
    m: Object.freeze({ label: 'Meter', symbol: 'm', factor: 1 }),
    km: Object.freeze({ label: 'Kilometer', symbol: 'km', factor: 1000 }),
    in: Object.freeze({ label: 'Inci', symbol: 'in', factor: 0.0254 }),
    ft: Object.freeze({ label: 'Kaki internasional', symbol: 'ft', factor: 0.3048 }),
    yd: Object.freeze({ label: 'Yard', symbol: 'yd', factor: 0.9144 }),
    mi: Object.freeze({ label: 'Mil internasional', symbol: 'mi', factor: 1609.344 }),
  }),
  mass: Object.freeze({
    mg: Object.freeze({ label: 'Miligram', symbol: 'mg', factor: 0.000001 }),
    g: Object.freeze({ label: 'Gram', symbol: 'g', factor: 0.001 }),
    kg: Object.freeze({ label: 'Kilogram', symbol: 'kg', factor: 1 }),
    t: Object.freeze({ label: 'Ton metrik', symbol: 't', factor: 1000 }),
    lb: Object.freeze({ label: 'Pound avoirdupois', symbol: 'lb', factor: 0.45359237 }),
    oz: Object.freeze({ label: 'Ounce avoirdupois', symbol: 'oz', factor: 0.028349523125 }),
  }),
  area: Object.freeze({
    cm2: Object.freeze({ label: 'Sentimeter persegi', symbol: 'cm²', factor: 0.0001 }),
    m2: Object.freeze({ label: 'Meter persegi', symbol: 'm²', factor: 1 }),
    km2: Object.freeze({ label: 'Kilometer persegi', symbol: 'km²', factor: 1000000 }),
    ha: Object.freeze({ label: 'Hektare', symbol: 'ha', factor: 10000 }),
  }),
  volume: Object.freeze({
    mL: Object.freeze({ label: 'Mililiter', symbol: 'mL', factor: 0.000001 }),
    L: Object.freeze({ label: 'Liter', symbol: 'L', factor: 0.001 }),
    cm3: Object.freeze({ label: 'Sentimeter kubik', symbol: 'cm³', factor: 0.000001 }),
    m3: Object.freeze({ label: 'Meter kubik', symbol: 'm³', factor: 1 }),
  }),
  temperature: Object.freeze({
    C: Object.freeze({ label: 'Celsius', symbol: '°C' }),
    F: Object.freeze({ label: 'Fahrenheit', symbol: '°F' }),
    K: Object.freeze({ label: 'Kelvin', symbol: 'K' }),
  }),
});

const DEFAULT_UNITS = Object.freeze({ length: ['cm', 'm'], mass: ['g', 'kg'], temperature: ['C', 'F'], area: ['m2', 'ha'], volume: ['mL', 'L'] });
const ABSOLUTE_ZERO = Object.freeze({ C: -273.15, F: -459.67, K: 0 });

function codedError(code, message, field = 'value') {
  const error = new Error(message);
  error.code = code;
  error.field = field;
  return error;
}

function unitFor(category, id, field) {
  if (!Object.hasOwn(UNITS, category) || !Object.hasOwn(UNITS[category], id)) {
    throw codedError('INVALID_UNIT', 'Kategori atau satuan tidak dikenal.', field);
  }
  return UNITS[category][id];
}

function parseValue(raw) {
  if (typeof raw !== 'string' || raw.length > MAX_RAW_LENGTH) {
    throw codedError('INPUT_TOO_LONG', 'Nilai input maksimal 24 karakter.', 'value');
  }
  const trimmed = trimValueInput(raw);
  try {
    const decimal = parseDecimal(trimmed, { maxIntegerDigits: 9, maxFractionDigits: 6, allowNegative: true });
    return Number(decimal.coefficient) / (10 ** decimal.scale);
  } catch {
    throw codedError('INVALID_NUMBER', 'Format angka tidak valid. Gunakan koma atau titik desimal tanpa pemisah ribuan.', 'value');
  }
}

export function trimValueInput(raw) {
  return typeof raw === 'string' ? raw.replace(/^[\x09-\x0d\x20]+|[\x09-\x0d\x20]+$/g, '') : raw;
}

function fromCelsius(value, unit) {
  if (unit === 'C') return value;
  if (unit === 'F') return (value - 32) * 5 / 9;
  return value - 273.15;
}

function toTargetFromCelsius(value, unit) {
  if (unit === 'C') return value;
  if (unit === 'F') return value * 9 / 5 + 32;
  return value + 273.15;
}

export function formatResult(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw codedError('RESULT_RANGE', 'Hasil konversi tidak berada dalam rentang yang didukung.');
  const normalized = Object.is(value, -0) || value === 0 ? 0 : value;
  return Number(normalized.toPrecision(12)).toString().replace('.', ',');
}

export function convertUnit(raw, category, from, to) {
  if (!Object.hasOwn(UNITS, category)) throw codedError('INVALID_UNIT', 'Kategori atau satuan tidak dikenal.', 'category');
  const source = unitFor(category, from, 'from');
  const target = unitFor(category, to, 'to');
  const value = parseValue(raw);
  let result;
  if (category === 'temperature') {
    if (value < ABSOLUTE_ZERO[from]) throw codedError('BELOW_ABSOLUTE_ZERO', 'Suhu berada di bawah nol mutlak.', 'value');
    if (value === ABSOLUTE_ZERO[from]) result = ABSOLUTE_ZERO[to];
    else if (from === to) result = value;
    else result = toTargetFromCelsius(fromCelsius(value, from), to);
  } else {
    if (value < 0) throw codedError('NEGATIVE_VALUE', 'Nilai untuk satuan ini tidak boleh negatif.', 'value');
    result = from === to ? value : value * source.factor / target.factor;
  }
  if (!Number.isFinite(result)) throw codedError('RESULT_RANGE', 'Hasil konversi tidak berada dalam rentang yang didukung.');
  result = Object.is(result, -0) || result === 0 ? 0 : result;
  return { value: result, formatted: formatResult(result) };
}

export function getCategoryUnits(category) {
  if (!Object.hasOwn(UNITS, category)) throw codedError('INVALID_UNIT', 'Kategori tidak dikenal.', 'category');
  return Object.entries(UNITS[category]).map(([id, unit]) => ({ id, label: unit.label, symbol: unit.symbol }));
}

export function getDefaultUnits(category) {
  if (!Object.hasOwn(DEFAULT_UNITS, category)) throw codedError('INVALID_UNIT', 'Kategori tidak dikenal.', 'category');
  return [...DEFAULT_UNITS[category]];
}

export function getUnit(category, id) { return unitFor(category, id, 'from'); }

export function createConversionSummary({ raw, categoryLabel, fromUnit, toUnit, formatted }) {
  const summary = `Konversi satuan\nNilai input: ${raw} ${fromUnit.label} (${fromUnit.symbol})\nKategori: ${categoryLabel}\nHasil: ${formatted} ${toUnit.label} (${toUnit.symbol})`;
  if (new TextEncoder().encode(summary).byteLength >= MAX_SUMMARY_BYTES) {
    throw codedError('OUTPUT_TOO_LARGE', 'Ringkasan konversi harus kurang dari 2 KiB UTF-8.');
  }
  return summary;
}
