import { calculateAge, createAgeSummary, trimDateInput } from './logic.js';
import { setStatus } from '/tools/shared/ui.js';
import { copyTextId } from '/everyday/shared/ui.js';

const birthInput = document.querySelector('#birth-date');
const asOfInput = document.querySelector('#as-of-date');
const resultCard = document.querySelector('#result-card');
const ageMain = document.querySelector('#age-main');
const ageTotal = document.querySelector('#age-total');
const copyOutput = document.querySelector('#copy-output');
const copyButton = document.querySelector('#copy-button');
const status = document.querySelector('#tool-status');
let currentResult = null;

function announce(kind, message) { setStatus(status, { kind, message }); }

function localToday() {
  const now = new Date();
  const year = String(now.getFullYear()).padStart(4, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function clearResult() {
  currentResult = null;
  resultCard.hidden = true;
  ageMain.textContent = '';
  ageTotal.textContent = '';
  copyOutput.value = '';
  copyButton.disabled = true;
}

function invalidateResult() {
  if (currentResult === null) return;
  clearResult();
  announce('warning', 'Tanggal berubah. Hitung kembali untuk memperbarui hasil.');
}

function showError(error) {
  const input = error?.field === 'asOf' ? asOfInput : birthInput;
  const message = error?.code === 'AS_OF_BEFORE_BIRTH'
    ? 'Tanggal acuan harus sama dengan atau setelah tanggal lahir.'
    : error?.code === 'DATE_RANGE'
      ? 'Tanggal berada di luar rentang 0001-01-01 sampai 9999-12-31.'
      : error?.code === 'OUTPUT_TOO_LARGE'
        ? error.message
        : error?.field === 'asOf'
          ? 'Tanggal acuan tidak valid. Pilih tanggal kalender yang benar.'
          : 'Tanggal lahir tidak valid. Pilih tanggal kalender yang benar.';
  announce('error', message);
  input.focus();
}

for (const input of [birthInput, asOfInput]) {
  input.addEventListener('input', invalidateResult);
  input.addEventListener('change', invalidateResult);
}

document.querySelector('#calculate-button').addEventListener('click', () => {
  clearResult();
  const birth = trimDateInput(birthInput.value);
  const asOf = trimDateInput(asOfInput.value);
  let age;
  try { age = calculateAge(birth, asOf); }
  catch (error) { showError(error); return; }
  try {
    const summary = createAgeSummary(birth, asOf, age);
    ageMain.textContent = `${age.years} tahun, ${age.months} bulan, ${age.days} hari`;
    ageTotal.textContent = `Total: ${age.totalDays} hari`;
    copyOutput.value = summary;
    currentResult = summary;
    resultCard.hidden = false;
    copyButton.disabled = false;
    announce('success', 'Perhitungan usia selesai.');
  } catch (error) { showError(error); }
});

document.querySelector('#today-button').addEventListener('click', () => {
  asOfInput.value = localToday();
  invalidateResult();
  announce('idle', 'Tanggal acuan diisi dengan hari ini menurut kalender lokal perangkat. Pilih Hitung usia untuk memperbarui hasil.');
  asOfInput.focus();
});

document.querySelector('#example-button').addEventListener('click', () => {
  birthInput.value = '2000-06-15';
  asOfInput.value = '2024-06-15';
  invalidateResult();
  announce('idle', 'Contoh dimuat. Pilih Hitung usia untuk melihat hasilnya.');
  birthInput.focus();
});

document.querySelector('#clear-button').addEventListener('click', () => {
  birthInput.value = '';
  asOfInput.value = '';
  clearResult();
  announce('idle', 'Tanggal dan hasil dibersihkan.');
  birthInput.focus();
});

copyButton.addEventListener('click', async () => {
  if (currentResult === null || copyButton.disabled) return;
  await copyTextId(currentResult, status);
});

asOfInput.value = localToday();
