import { changeCase } from './logic.js';
import { setStatus, downloadText } from '/tools/shared/ui.js';
import { copyTextId } from '/everyday/shared/ui.js';

const input = document.querySelector('#case-input');
const output = document.querySelector('#case-output');
const mode = document.querySelector('#case-mode');
const status = document.querySelector('#tool-status');
const transformButton = document.querySelector('#transform-button');
const copyButton = document.querySelector('#copy-button');
const downloadButton = document.querySelector('#download-button');
let currentResult = null;

function showStatus(kind, message) {
  setStatus(status, { kind, message });
}

function clearResult() {
  currentResult = null;
  output.value = '';
  copyButton.disabled = true;
  downloadButton.disabled = true;
}

function invalidateResult() {
  if (currentResult === null) return;
  clearResult();
  showStatus('warning', 'Teks atau bentuk huruf berubah. Ubah kembali untuk membuat hasil terbaru.');
}

function explainError(error) {
  switch (error?.code) {
    case 'INPUT_TOO_LARGE': return 'Teks awal melewati batas 100.000 code points atau 400.000 byte UTF-8.';
    case 'OUTPUT_TOO_LARGE': return 'Hasil melewati batas 800.000 byte UTF-8. Teks awal tetap tersedia dan hasil tidak dipotong.';
    case 'INVALID_MODE': return 'Pilih bentuk huruf yang tersedia, lalu coba lagi.';
    case 'CASE_UNSUPPORTED': return error.message;
    default: return 'Teks belum dapat diubah. Periksa masukan dan coba lagi.';
  }
}

transformButton.addEventListener('click', () => {
  clearResult();
  try {
    const result = changeCase(input.value, mode.value);
    output.value = result;
    if (result.length === 0) {
      showStatus('idle', 'Teks kosong; tidak ada hasil untuk disalin.');
      return;
    }
    currentResult = result;
    copyButton.disabled = false;
    downloadButton.disabled = false;
    showStatus('success', 'Perubahan huruf selesai.');
  } catch (error) {
    showStatus('error', explainError(error));
    if (error?.code === 'INPUT_TOO_LARGE') input.focus();
  }
});

input.addEventListener('input', invalidateResult);
mode.addEventListener('change', invalidateResult);

document.querySelector('#example-button').addEventListener('click', () => {
  input.value = 'NASA dan iPhone: belajar bersama.';
  invalidateResult();
  showStatus('idle', 'Contoh dimuat. Pilih Ubah huruf untuk membuat hasil.');
  input.focus();
});

document.querySelector('#clear-button').addEventListener('click', () => {
  input.value = '';
  output.value = '';
  mode.value = 'upper';
  currentResult = null;
  copyButton.disabled = true;
  downloadButton.disabled = true;
  showStatus('idle', 'Teks awal dan hasil dibersihkan.');
  input.focus();
});

copyButton.addEventListener('click', async () => {
  if (currentResult === null || copyButton.disabled) return;
  await copyTextId(currentResult, status);
});

downloadButton.addEventListener('click', () => {
  if (currentResult === null || downloadButton.disabled) return;
  try {
    downloadText(currentResult, 'hasil-ubah-huruf.txt', 'text/plain;charset=utf-8');
    showStatus('success', 'Unduhan TXT dimulai.');
  } catch {
    showStatus('error', 'Hasil belum dapat disiapkan untuk diunduh.');
  }
});
