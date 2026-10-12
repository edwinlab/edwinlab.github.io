import { createDateSummary, differenceDays, parseDayCount, shiftDate, trimDateInput } from './logic.js';
import { setStatus } from '/tools/shared/ui.js';
import { copyTextId } from '/everyday/shared/ui.js';

const modeSelect = document.querySelector('#mode-select');
const startInput = document.querySelector('#start-date');
const endInput = document.querySelector('#end-date');
const countInput = document.querySelector('#day-count');
const operationSelect = document.querySelector('#operation-select');
const startLabel = document.querySelector('#start-label');
const endField = document.querySelector('#end-field');
const countField = document.querySelector('#count-field');
const operationField = document.querySelector('#operation-field');
const calculateButton = document.querySelector('#calculate-button');
const resultCard = document.querySelector('#result-card');
const resultMain = document.querySelector('#result-main');
const resultDetail = document.querySelector('#result-detail');
const copyOutput = document.querySelector('#copy-output');
const copyButton = document.querySelector('#copy-button');
const status = document.querySelector('#tool-status');
let currentResult = null;

function announce(kind, message) { setStatus(status, { kind, message }); }

function clearResult() {
  currentResult = null;
  resultCard.hidden = true;
  resultMain.textContent = '';
  resultDetail.textContent = '';
  copyOutput.value = '';
  copyButton.disabled = true;
}

function invalidateResult() {
  if (currentResult === null) return;
  clearResult();
  announce('warning', 'Input berubah. Hitung kembali untuk memperbarui hasil.');
}

function updateMode({ announceChange = true } = {}) {
  const shifting = modeSelect.value === 'shift';
  startLabel.textContent = shifting ? 'Tanggal mulai' : 'Tanggal awal';
  endField.hidden = shifting;
  countField.hidden = !shifting;
  operationField.hidden = !shifting;
  calculateButton.textContent = shifting ? 'Hitung tanggal' : 'Hitung selisih';
  clearResult();
  if (announceChange) announce('idle', 'Mode berubah. Nilai form tetap; pilih Hitung untuk menghitung lagi.');
}

function showError(error) {
  const controls = { start: startInput, end: endInput, count: countInput, direction: operationSelect };
  const focusTarget = controls[error?.field] || startInput;
  const labels = { start: 'tanggal awal/mulai', end: 'tanggal akhir', count: 'jumlah hari', direction: 'operasi' };
  const label = labels[error?.field] || 'tanggal';
  const message = error?.code === 'INVALID_DATE'
    ? `Format ${label} tidak valid. Pilih tanggal kalender YYYY-MM-DD yang benar.`
    : error?.code === 'INVALID_DAY_COUNT'
      ? 'Jumlah hari harus 1–7 digit angka bulat nonnegatif.'
      : error?.code === 'DAY_COUNT_RANGE'
        ? 'Jumlah hari harus antara 0 dan 3652058.'
        : error?.code === 'INVALID_DIRECTION'
          ? 'Pilih operasi tambah atau kurangi.'
          : error?.code === 'DATE_RANGE'
            ? 'Tanggal hasil berada di luar rentang 0001-01-01 sampai 9999-12-31.'
            : error?.code === 'OUTPUT_TOO_LARGE'
              ? error.message
              : 'Input tidak valid. Periksa kembali tanggal dan jumlah hari.';
  announce('error', message);
  focusTarget.focus();
}

function renderDifference() {
  const start = trimDateInput(startInput.value);
  const end = trimDateInput(endInput.value);
  const days = differenceDays(start, end);
  const magnitude = Math.abs(days);
  const display = days < 0 ? `−${magnitude} hari` : `${days} hari`;
  const detail = days < 0 ? `Tanggal akhir ${magnitude} hari sebelum tanggal awal.` : 'Selisih menghitung pergantian tanggal, bukan kedua endpoint secara inklusif.';
  const copiedDays = `${days < 0 ? '-' : ''}${magnitude} hari`;
  const summary = createDateSummary([
    'Hasil selisih tanggal',
    `Tanggal awal: ${start}`,
    `Tanggal akhir: ${end}`,
    `Selisih: ${copiedDays}`,
    'Definisi: jumlah pergantian tanggal; endpoint tidak dihitung secara inklusif.',
  ].join('\n'));
  return { display, detail, summary };
}

function renderShift() {
  const start = trimDateInput(startInput.value);
  const countRaw = countInput.value;
  const count = parseDayCount(countRaw);
  const direction = operationSelect.value;
  const shifted = shiftDate(start, countRaw, direction);
  const directionText = direction === 'add' ? 'setelah' : 'sebelum';
  const display = shifted;
  const detail = count === 0 ? `Tanggal tidak berubah dari ${start}.` : `${count} hari ${directionText} ${start}.`;
  const summary = createDateSummary([
    'Hasil tambah/kurangi hari',
    `Tanggal mulai: ${start}`,
    `Operasi: ${direction === 'add' ? 'Tambah' : 'Kurangi'}`,
    `Jumlah hari: ${count}`,
    `Tanggal hasil: ${shifted}`,
  ].join('\n'));
  return { display, detail, summary };
}

for (const control of [startInput, endInput, countInput, operationSelect]) {
  control.addEventListener('input', invalidateResult);
  control.addEventListener('change', invalidateResult);
}
modeSelect.addEventListener('change', () => updateMode());

calculateButton.addEventListener('click', () => {
  clearResult();
  try {
    const result = modeSelect.value === 'shift' ? renderShift() : renderDifference();
    resultMain.textContent = result.display;
    resultDetail.textContent = result.detail;
    copyOutput.value = result.summary;
    currentResult = result.summary;
    resultCard.hidden = false;
    copyButton.disabled = false;
    announce('success', 'Perhitungan tanggal selesai.');
  } catch (error) { showError(error); }
});

document.querySelector('#example-button').addEventListener('click', () => {
  if (modeSelect.value === 'shift') {
    startInput.value = '2024-02-28';
    countInput.value = '2';
    operationSelect.value = 'add';
  } else {
    startInput.value = '2024-02-28';
    endInput.value = '2024-03-01';
  }
  invalidateResult();
  announce('idle', 'Contoh dimuat. Pilih tombol hitung untuk melihat hasil.');
  startInput.focus();
});

document.querySelector('#clear-button').addEventListener('click', () => {
  modeSelect.value = 'difference';
  operationSelect.value = 'add';
  startInput.value = '';
  endInput.value = '';
  countInput.value = '';
  updateMode({ announceChange: false });
  announce('idle', 'Input dan hasil dibersihkan.');
  startInput.focus();
});

copyButton.addEventListener('click', async () => {
  if (currentResult === null || copyButton.disabled) return;
  await copyTextId(currentResult, status);
});

updateMode({ announceChange: false });
