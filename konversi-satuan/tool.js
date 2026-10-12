import { convertUnit, createConversionSummary, getCategoryUnits, getDefaultUnits, getUnit, trimValueInput } from './logic.js';
import { setStatus } from '/tools/shared/ui.js';
import { copyTextId } from '/everyday/shared/ui.js';

const categorySelect = document.querySelector('#category-select');
const valueInput = document.querySelector('#value-input');
const fromSelect = document.querySelector('#from-select');
const toSelect = document.querySelector('#to-select');
const categoryNote = document.querySelector('#category-note');
const resultCard = document.querySelector('#result-card');
const resultValue = document.querySelector('#result-value');
const resultFormula = document.querySelector('#result-formula');
const copyOutput = document.querySelector('#copy-output');
const copyButton = document.querySelector('#copy-button');
const status = document.querySelector('#tool-status');
let currentResult = null;

const categoryLabels = {
  length: 'Panjang', mass: 'Massa (berat)', temperature: 'Suhu', area: 'Luas', volume: 'Volume',
};
const categoryNotes = {
  length: 'Konversi panjang menggunakan meter sebagai dasar dan faktor internasional. Hasil memakai maksimal 12 digit signifikan.',
  mass: 'Konversi massa menggunakan kilogram sebagai dasar. Ounce di sini berarti ounce avoirdupois, bukan ons Indonesia 100 gram.',
  temperature: 'Suhu dikonversi melalui Celsius. Batas bawah mengikuti nol mutlak; presisi hasil dibatasi representasi angka JavaScript.',
  area: 'Luas menggunakan faktor ke meter persegi. Faktor panjang sudah dipangkatkan sesuai luas.',
  volume: 'Volume menggunakan faktor ke meter kubik. Gram ke liter memerlukan massa jenis dan tidak disediakan.',
};

function announce(kind, message) { setStatus(status, { kind, message }); }

function clearResult() {
  currentResult = null;
  resultCard.hidden = true;
  resultValue.textContent = '';
  resultFormula.textContent = '';
  copyOutput.value = '';
  copyButton.disabled = true;
}

function invalidateResult() {
  if (currentResult === null) return;
  clearResult();
  announce('warning', 'Input berubah. Konversi kembali untuk memperbarui hasil.');
}

function populateUnits(category, defaults) {
  const units = getCategoryUnits(category);
  for (const [select, selected] of [[fromSelect, defaults[0]], [toSelect, defaults[1]]]) {
    select.replaceChildren();
    for (const unit of units) {
      const option = document.createElement('option');
      option.value = unit.id;
      option.textContent = `${unit.label} (${unit.symbol})`;
      select.append(option);
    }
    select.value = selected;
  }
}

function formulaFor(category, from, to) {
  const source = getUnit(category, from);
  const target = getUnit(category, to);
  if (from === to) return 'Rumus: nilai tetap sama karena satuan asal dan tujuan sama.';
  if (category !== 'temperature') return `Rumus: nilai × ${source.factor} ÷ ${target.factor} (faktor ke satuan dasar kategori).`;
  const fromSymbol = source.symbol;
  const toSymbol = target.symbol;
  const formulas = {
    C: { F: '°F = °C × 9/5 + 32', K: 'K = °C + 273,15' },
    F: { C: '°C = (°F − 32) × 5/9', K: 'K = (°F − 32) × 5/9 + 273,15' },
    K: { C: '°C = K − 273,15', F: '°F = (K − 273,15) × 9/5 + 32' },
  };
  return `Rumus ${fromSymbol} ke ${toSymbol}: ${formulas[from][to]}.`;
}

function errorMessage(error) {
  const labels = { value: 'Nilai', category: 'Kategori', from: 'Dari satuan', to: 'Ke satuan' };
  const field = error?.field || 'value';
  const label = labels[field] || 'Nilai';
  if (error?.code === 'INPUT_TOO_LONG') return 'Nilai input maksimal 24 karakter.';
  if (error?.code === 'INVALID_NUMBER') return 'Format nilai tidak valid. Gunakan koma atau titik desimal, tanpa pemisah ribuan; maksimum 9 digit integer dan 6 digit desimal.';
  if (error?.code === 'NEGATIVE_VALUE') return 'Nilai untuk panjang, massa, luas, dan volume tidak boleh negatif.';
  if (error?.code === 'BELOW_ABSOLUTE_ZERO') return 'Suhu tidak boleh berada di bawah nol mutlak.';
  if (error?.code === 'INVALID_UNIT') return `${label} tidak dikenal. Pilih kategori dan satuan dari daftar.`;
  if (error?.code === 'RESULT_RANGE') return 'Hasil berada di luar rentang angka yang dapat ditampilkan.';
  if (error?.code === 'OUTPUT_TOO_LARGE') return error.message;
  return `Periksa kembali ${label.toLowerCase()} dan satuan yang dipilih.`;
}

function showError(error) {
  const controls = { value: valueInput, category: categorySelect, from: fromSelect, to: toSelect };
  announce('error', errorMessage(error));
  (controls[error?.field] || valueInput).focus();
}

categorySelect.addEventListener('change', () => {
  const defaults = getDefaultUnits(categorySelect.value);
  populateUnits(categorySelect.value, defaults);
  categoryNote.textContent = categoryNotes[categorySelect.value];
  clearResult();
  announce('idle', 'Kategori berubah dan satuan mengikuti kategori. Nilai input tetap; konversi kembali untuk melihat hasil.');
});
for (const control of [valueInput, fromSelect, toSelect]) {
  control.addEventListener('input', invalidateResult);
  control.addEventListener('change', invalidateResult);
}

document.querySelector('#convert-button').addEventListener('click', () => {
  clearResult();
  const category = categorySelect.value;
  const from = fromSelect.value;
  const to = toSelect.value;
  try {
    const result = convertUnit(valueInput.value, category, from, to);
    const source = getUnit(category, from);
    const target = getUnit(category, to);
    const raw = trimValueInput(valueInput.value);
    const categoryLabel = categoryLabels[category];
    const summary = createConversionSummary({ raw, categoryLabel, fromUnit: source, toUnit: target, formatted: result.formatted });
    resultValue.textContent = `${result.formatted} ${target.symbol}`;
    resultFormula.textContent = formulaFor(category, from, to);
    copyOutput.value = summary;
    currentResult = summary;
    resultCard.hidden = false;
    copyButton.disabled = false;
    announce('success', 'Konversi selesai. Hasil dibulatkan menjadi paling banyak 12 digit signifikan.');
  } catch (error) { showError(error); }
});

document.querySelector('#swap-button').addEventListener('click', () => {
  const hadResult = currentResult !== null;
  const from = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = from;
  if (hadResult) {
    clearResult();
    announce('warning', 'Satuan ditukar; nilai input tidak berubah. Konversi kembali untuk memperbarui hasil.');
  } else announce('idle', 'Satuan ditukar. Nilai input tidak berubah; pilih Konversi untuk menghitung lagi.');
});

document.querySelector('#example-button').addEventListener('click', () => {
  categorySelect.value = 'length';
  populateUnits('length', ['km', 'm']);
  categoryNote.textContent = categoryNotes[categorySelect.value];
  valueInput.value = '2,5';
  clearResult();
  announce('idle', 'Contoh 2,5 km ke meter dimuat. Pilih Konversi untuk melihat hasil.');
  valueInput.focus();
});

document.querySelector('#clear-button').addEventListener('click', () => {
  categorySelect.value = 'length';
  populateUnits('length', ['cm', 'm']);
  categoryNote.textContent = categoryNotes[categorySelect.value];
  valueInput.value = '';
  clearResult();
  announce('idle', 'Kategori dan satuan dikembalikan ke nilai awal; input dan hasil dibersihkan.');
  valueInput.focus();
});

copyButton.addEventListener('click', async () => {
  if (currentResult === null || copyButton.disabled) return;
  await copyTextId(currentResult, status);
});

populateUnits('length', ['cm', 'm']);
