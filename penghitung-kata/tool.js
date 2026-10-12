import { countText, createSegmenters, createSummary, formatReadingTime, parseReadingRate } from './logic.js';
import { setStatus } from '/tools/shared/ui.js';
import { copyTextId } from '/everyday/shared/ui.js';

const form = document.querySelector('#word-form');
const textarea = document.querySelector('#source-text');
const rateInput = document.querySelector('#reading-rate');
const status = document.querySelector('#tool-status');
const results = document.querySelector('#results');
const copyButton = document.querySelector('#copy-button');
const summary = document.querySelector('#copy-summary');
const countButton = document.querySelector('#count-button');
let segmenters = null;
let latest = null;

const fields = {
  words: document.querySelector('#result-words'),
  characters: document.querySelector('#result-characters'),
  noWhitespace: document.querySelector('#result-no-whitespace'),
  lines: document.querySelector('#result-lines'),
  paragraphs: document.querySelector('#result-paragraphs'),
  time: document.querySelector('#result-time'),
  rate: document.querySelector('#result-rate'),
};

function showStatus(kind, message) {
  setStatus(status, { kind, message });
}

function clearResults() {
  latest = null;
  results.hidden = true;
  copyButton.disabled = true;
  summary.value = '';
}

function invalidateResults() {
  if (!latest) return;
  clearResults();
  showStatus('warning', 'Masukan berubah. Hitung kembali untuk memperbarui hasil.');
}

function messageFor(error) {
  switch (error?.code) {
    case 'INPUT_TOO_LARGE': return 'Teks melewati batas 100.000 Unicode code points atau 400.000 byte UTF-8.';
    case 'INVALID_READING_RATE': return error.message;
    case 'SEGMENTER_UNAVAILABLE': return error.message;
    case 'OUTPUT_TOO_LARGE': return error.message;
    default: return 'Teks belum dapat dihitung. Periksa masukan dan coba lagi.';
  }
}

try {
  segmenters = createSegmenters();
  showStatus('idle', 'Siap menghitung teks di browser ini.');
} catch (error) {
  countButton.disabled = true;
  showStatus('error', messageFor(error));
}

form.addEventListener('submit', event => {
  event.preventDefault();
  clearResults();
  let rate;
  try { rate = parseReadingRate(rateInput.value); }
  catch (error) {
    showStatus('error', messageFor(error));
    rateInput.focus();
    return;
  }
  try {
    const result = countText(textarea.value, rate, segmenters);
    const copyValue = createSummary(result, rate);
    fields.words.textContent = String(result.words);
    fields.characters.textContent = String(result.characters);
    fields.noWhitespace.textContent = String(result.charactersWithoutWhitespace);
    fields.lines.textContent = String(result.lines);
    fields.paragraphs.textContent = String(result.paragraphs);
    fields.time.textContent = formatReadingTime(result.readingSeconds);
    fields.rate.textContent = `Pada ${rate} kata/menit`;
    summary.value = copyValue;
    results.hidden = false;
    copyButton.disabled = false;
    latest = { text: textarea.value, rate };
    showStatus('success', 'Teks berhasil dihitung.');
  } catch (error) {
    showStatus('error', messageFor(error));
    if (error?.code === 'INPUT_TOO_LARGE') textarea.focus();
    else if (error?.code === 'INVALID_READING_RATE') rateInput.focus();
  }
});

textarea.addEventListener('input', invalidateResults);
rateInput.addEventListener('input', invalidateResults);

document.querySelector('#example-button').addEventListener('click', () => {
  textarea.value = 'Halo dunia!';
  invalidateResults();
  showStatus('idle', 'Contoh dimuat. Pilih Hitung untuk melihat hasilnya.');
  textarea.focus();
});

document.querySelector('#clear-button').addEventListener('click', () => {
  textarea.value = '';
  rateInput.value = '200';
  clearResults();
  showStatus('idle', 'Masukan dan hasil dibersihkan.');
  textarea.focus();
});

copyButton.addEventListener('click', async () => {
  if (!latest || results.hidden || copyButton.disabled) return;
  await copyTextId(summary.value, status);
});
