import { parseDiscountInput, presentDiscount } from './logic.js';
import { setStatus } from '/tools/shared/ui.js';
import { copyTextId } from '/everyday/shared/ui.js';

const modeSelect = document.querySelector('#discount-mode');
const priceInput = document.querySelector('#price-input');
const discountOne = document.querySelector('#discount-one');
const discountTwo = document.querySelector('#discount-two');
const secondField = document.querySelector('#second-field');
const resultCard = document.querySelector('#result-card');
const finalPrice = document.querySelector('#final-price');
const totalSaved = document.querySelector('#total-saved');
const effectiveSaved = document.querySelector('#effective-saved');
const sequentialNote = document.querySelector('#sequential-note');
const stageRows = document.querySelector('#stage-rows');
const copyButton = document.querySelector('#copy-button');
const status = document.querySelector('#tool-status');
let currentResult = null;

function announce(kind, message) { setStatus(status, { kind, message }); }

function clearResult() {
  currentResult = null;
  resultCard.hidden = true;
  finalPrice.textContent = '';
  totalSaved.textContent = '';
  effectiveSaved.textContent = '';
  stageRows.replaceChildren();
  sequentialNote.hidden = true;
  copyButton.disabled = true;
}

function invalidateResult() {
  if (currentResult !== null) {
    clearResult();
    announce('warning', 'Input berubah. Hitung kembali untuk memperbarui hasil.');
  }
}

function updateMode({ announceChange = true } = {}) {
  const isDouble = modeSelect.value === 'double';
  secondField.hidden = !isDouble;
  discountTwo.value = '';
  clearResult();
  if (announceChange) announce('idle', 'Mode berubah. Periksa input lalu hitung kembali.');
}

function errorMessage(error) {
  const labels = { price: 'Harga awal', discount1: 'Diskon pertama', discount2: 'Diskon kedua' };
  const label = labels[error?.field] || 'Input';
  if (error?.code === 'INPUT_TOO_LARGE') return `${label} melebihi batas 64 karakter.`;
  if (error?.code === 'NUMBER_PRECISION') return error.message;
  if (error?.code === 'RANGE_ERROR') return error.message;
  if (error?.code === 'OUTPUT_TOO_LARGE') return error.message;
  return `Format ${label.toLowerCase()} tidak valid. Gunakan angka desimal tanpa pemisah ribuan.`;
}

function showError(error) {
  announce('error', errorMessage(error));
  const fields = { price: priceInput, discount1: discountOne, discount2: discountTwo };
  (fields[error?.field] || priceInput).focus();
}

modeSelect.addEventListener('change', () => {
  updateMode();
  priceInput.focus();
});
for (const input of [priceInput, discountOne, discountTwo]) input.addEventListener('input', invalidateResult);

document.querySelector('#calculate-button').addEventListener('click', () => {
  clearResult();
  let price;
  let discounts;
  try { price = parseDiscountInput(priceInput.value, 'price', 'price'); }
  catch (error) { showError(error); return; }
  try { discounts = [parseDiscountInput(discountOne.value, 'discount', 'discount1')]; }
  catch (error) { showError(error); return; }
  if (modeSelect.value === 'double') {
    try { discounts.push(parseDiscountInput(discountTwo.value, 'discount', 'discount2')); }
    catch (error) { showError(error); return; }
  }
  try {
    const result = presentDiscount(price, discounts);
    finalPrice.textContent = result.finalText;
    totalSaved.textContent = result.savedText;
    effectiveSaved.textContent = result.effectiveText;
    sequentialNote.hidden = discounts.length !== 2;
    for (const step of result.steps) {
      const row = document.createElement('tr');
      const values = [`Diskon ${step.number}: ${step.discountText}%`, step.beforeText, `${step.discountText}%`, step.discountAmountText, step.afterText];
      for (const value of values) {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      }
      stageRows.append(row);
    }
    resultCard.hidden = false;
    currentResult = result;
    copyButton.disabled = false;
    announce('success', 'Perhitungan diskon selesai.');
  } catch (error) { showError(error); }
});

document.querySelector('#example-button').addEventListener('click', () => {
  priceInput.value = '200000';
  discountOne.value = '20';
  discountTwo.value = modeSelect.value === 'double' ? '10' : '';
  invalidateResult();
  announce('idle', 'Contoh dimuat. Pilih Hitung diskon untuk melihat hasilnya.');
  priceInput.focus();
});

document.querySelector('#clear-button').addEventListener('click', () => {
  priceInput.value = '';
  discountOne.value = '';
  discountTwo.value = '';
  clearResult();
  announce('idle', 'Input dan hasil dibersihkan.');
  priceInput.focus();
});

copyButton.addEventListener('click', async () => {
  if (currentResult === null || copyButton.disabled) return;
  await copyTextId(currentResult.copyText, status);
});

updateMode({ announceChange: false });
