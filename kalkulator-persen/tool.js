import { presentPercentage, parsePercentageInput } from './logic.js';
import { setStatus } from '/tools/shared/ui.js';
import { copyTextId } from '/everyday/shared/ui.js';

const modeSelect = document.querySelector('#percent-mode');
const firstInput = document.querySelector('#first-value');
const secondInput = document.querySelector('#second-value');
const firstLabel = document.querySelector('#first-label');
const secondLabel = document.querySelector('#second-label');
const fieldsLegend = document.querySelector('#fields-legend');
const modeNote = document.querySelector('#mode-note');
const resultCard = document.querySelector('#result-card');
const resultValue = document.querySelector('#result-value');
const resultMeaning = document.querySelector('#result-meaning');
const resultInputs = document.querySelector('#result-inputs');
const resultFormula = document.querySelector('#result-formula');
const roundingNote = document.querySelector('#rounding-note');
const status = document.querySelector('#tool-status');
const copyButton = document.querySelector('#copy-button');
let currentResult = null;

const modeDetails = {
  portion: {
    first: 'Persentase P (%)', second: 'Nilai N',
    legend: 'Masukkan persentase P dan nilai N',
    note: 'Rumus: P × N ÷ 100. P boleh negatif atau lebih besar dari 100.',
  },
  ratio: {
    first: 'Nilai A', second: 'Nilai B',
    legend: 'Masukkan nilai A dan nilai B',
    note: 'Rumus: A ÷ B × 100. B tidak boleh nol; nilai negatif diperbolehkan dan hasil mengikuti tanda rumus.',
  },
  change: {
    first: 'Nilai awal', second: 'Nilai akhir',
    legend: 'Masukkan nilai awal dan nilai akhir',
    note: 'Rumus: (akhir − awal) ÷ awal × 100. Nilai awal harus lebih besar dari 0.',
  },
};

function showStatus(kind, message) {
  setStatus(status, { kind, message });
}

function clearResult() {
  currentResult = null;
  resultCard.hidden = true;
  resultValue.textContent = '';
  resultMeaning.textContent = '';
  resultInputs.textContent = '';
  resultFormula.textContent = '';
  roundingNote.hidden = true;
  copyButton.disabled = true;
}

function invalidateResult() {
  if (currentResult === null) return;
  clearResult();
  showStatus('warning', 'Input berubah. Hitung kembali untuk memperbarui hasil.');
}

function updateMode({ announce = true } = {}) {
  const details = modeDetails[modeSelect.value];
  firstLabel.textContent = details.first;
  secondLabel.textContent = details.second;
  fieldsLegend.textContent = details.legend;
  modeNote.textContent = details.note;
  firstInput.value = '';
  secondInput.value = '';
  clearResult();
  if (announce) showStatus('idle', 'Mode berubah. Masukkan kembali kedua angka.');
}

function fieldLabel(field) {
  return field === 'second' ? secondLabel.textContent : firstLabel.textContent;
}

function showError(error) {
  const field = error?.field === 'second' ? 'second' : 'first';
  const label = fieldLabel(field);
  const message = error?.code === 'RANGE_ERROR'
    ? `Nilai pada “${label}” harus memiliki nilai absolut paling besar 1.000.000.000.000.`
    : error?.code === 'INPUT_TOO_LARGE'
      ? `Input “${label}” melebihi batas 64 karakter.`
      : error?.code === 'NUMBER_PRECISION'
        ? `Input “${label}” harus memakai paling banyak 13 digit integer dan 6 digit desimal.`
        : error?.code === 'DIVISION_BY_ZERO'
          ? `Input “${label}” tidak boleh nol sebagai penyebut.`
          : error?.code === 'BASE_NOT_POSITIVE'
            ? 'Nilai awal harus lebih besar dari 0 untuk mode perubahan persen.'
            : error?.code === 'OUTPUT_TOO_LARGE'
              ? error.message
              : `Format angka pada “${label}” tidak valid. Gunakan angka dengan koma atau titik desimal, tanpa pemisah ribuan.`;
  showStatus('error', message);
  (field === 'second' ? secondInput : firstInput).focus();
}

modeSelect.addEventListener('change', () => {
  updateMode();
  firstInput.focus();
});
firstInput.addEventListener('input', invalidateResult);
secondInput.addEventListener('input', invalidateResult);

document.querySelector('#calculate-button').addEventListener('click', () => {
  clearResult();
  let first;
  let second;
  try { first = parsePercentageInput(firstInput.value, 'first'); }
  catch (error) { showError(error); return; }
  try { second = parsePercentageInput(secondInput.value, 'second'); }
  catch (error) { showError(error); return; }
  try {
    const result = presentPercentage(modeSelect.value, first, second);
    resultValue.textContent = result.resultText;
    resultMeaning.textContent = result.meaning;
    resultInputs.textContent = `${result.firstText} dan ${result.secondText}`;
    resultFormula.textContent = result.formula;
    roundingNote.hidden = !result.rounded;
    resultCard.hidden = false;
    currentResult = result;
    copyButton.disabled = false;
    showStatus('success', 'Perhitungan selesai.');
  } catch (error) {
    showError(error);
  }
});

document.querySelector('#example-button').addEventListener('click', () => {
  const examples = {
    portion: ['20', '150'],
    ratio: ['45', '180'],
    change: ['80', '100'],
  };
  [firstInput.value, secondInput.value] = examples[modeSelect.value];
  invalidateResult();
  showStatus('idle', 'Contoh dimuat. Pilih Hitung untuk melihat hasilnya.');
  firstInput.focus();
});

document.querySelector('#clear-button').addEventListener('click', () => {
  firstInput.value = '';
  secondInput.value = '';
  clearResult();
  showStatus('idle', 'Input dan hasil dibersihkan.');
  firstInput.focus();
});

copyButton.addEventListener('click', async () => {
  if (currentResult === null || copyButton.disabled) return;
  await copyTextId(currentResult.copyText, status);
});

updateMode({ announce: false });
