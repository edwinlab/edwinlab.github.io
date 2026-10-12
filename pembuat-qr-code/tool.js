import { makeQrMatrix } from '/everyday/shared/qr.js';
import { getQrLayout, validatePayload } from './logic.js';
import { setStatus } from '/tools/shared/ui.js';
import { downloadBlob } from '/everyday/shared/ui.js';

const input = document.querySelector('#payload-input');
const inputLabel = document.querySelector('label[for="payload-input"]');
const modeHint = document.querySelector('#mode-hint');
const byteCount = document.querySelector('#byte-count');
const modeInputs = [...document.querySelectorAll('input[name="payload-mode"]')];
const createButton = document.querySelector('#create-button');
const clearButton = document.querySelector('#clear-button');
const exampleButton = document.querySelector('#example-button');
const downloadButton = document.querySelector('#download-button');
const resultCard = document.querySelector('#result-card');
const canvas = document.querySelector('#qr-canvas');
const payloadOutput = document.querySelector('#payload-output');
const status = document.querySelector('#tool-status');
let currentBlob = null;
let revision = 0;
let busy = false;

function announce(kind, message) { setStatus(status, { kind, message }); }
function mode() { return modeInputs.find(item => item.checked)?.value || 'url'; }

function updateInputMode() {
  const urlMode = mode() === 'url';
  const label = urlMode ? 'Tautan website untuk QR' : 'Teks untuk QR';
  inputLabel.textContent = label;
  input.setAttribute('aria-label', label);
  modeHint.textContent = urlMode
    ? 'Mode tautan hanya menerima URL http:// atau https:// dengan host yang valid, tanpa username atau password.'
    : 'Mode teks mempertahankan spasi dan baris baru; masukkan setidaknya satu karakter selain spasi.';
  updateByteCount();
}

function updateByteCount() {
  const value = mode() === 'url' ? input.value.replace(/^[\t\n\v\f\r ]+|[\t\n\v\f\r ]+$/g, '') : input.value;
  if (typeof globalThis.TextEncoder !== 'function') {
    byteCount.textContent = 'Ukuran UTF-8 diperiksa saat membuat QR.';
    return;
  }
  byteCount.textContent = `${new TextEncoder().encode(value).length}/1000 byte UTF-8`;
}

function clearResult() {
  currentBlob = null;
  resultCard.hidden = true;
  payloadOutput.value = '';
  canvas.removeAttribute('aria-label');
  canvas.width = 0;
  canvas.height = 0;
  downloadButton.disabled = true;
}

function invalidateResult() {
  const hadOutput = currentBlob !== null || !resultCard.hidden || busy;
  revision += 1;
  clearResult();
  if (hadOutput) announce('warning', 'Input berubah. Hasil QR sebelumnya dibatalkan; buat QR kembali.');
}

function renderMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0 || !matrix.every(row => Array.isArray(row) && row.length === matrix.length && row.every(cell => typeof cell === 'boolean'))) {
    const error = new Error('Pola QR dari library tidak valid.');
    error.code = 'QR_UNAVAILABLE';
    throw error;
  }
  const layout = getQrLayout(matrix.length);
  canvas.width = layout.size;
  canvas.height = layout.size;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) {
    const error = new Error('Browser tidak dapat membuat canvas untuk QR.');
    error.code = 'QR_UNAVAILABLE';
    throw error;
  }
  context.imageSmoothingEnabled = false;
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, layout.size, layout.size);
  context.fillStyle = '#000000';
  for (let row = 0; row < matrix.length; row += 1) {
    for (let column = 0; column < matrix.length; column += 1) {
      if (matrix[row][column]) {
        context.fillRect(
          (column + layout.quietModules) * layout.modulePixels,
          (row + layout.quietModules) * layout.modulePixels,
          layout.modulePixels,
          layout.modulePixels,
        );
      }
    }
  }
  return layout;
}

function canvasBlob(target) {
  return new Promise((resolve, reject) => {
    if (typeof target.toBlob !== 'function') {
      const error = new Error('Browser ini tidak mendukung ekspor PNG dari canvas.');
      error.code = 'QR_UNAVAILABLE';
      reject(error);
      return;
    }
    try { target.toBlob(resolve, 'image/png'); }
    catch (error) { reject(error); }
  });
}

function showError(error) {
  const code = error?.code;
  const messages = {
    INVALID_URL: 'Masukkan URL website lengkap berawalan http:// atau https://, tanpa username atau password.',
    INVALID_QR_TEXT: 'Masukkan teks atau tautan yang tidak kosong dan tidak hanya berisi spasi.',
    INPUT_TOO_LARGE: 'Isi QR maksimal 1000 byte UTF-8. Teks dan emoji dapat memakai jumlah byte berbeda.',
    QR_UNAVAILABLE: error?.message || 'QR atau ekspor PNG tidak tersedia di browser ini. Muat ulang halaman atau coba browser lain.',
    INVALID_QR_MATRIX: 'Pola QR tidak valid dan tidak dapat ditampilkan.',
    INVALID_MODE: 'Pilih mode tautan website atau teks.',
    PNG_UNAVAILABLE: 'Browser tidak menghasilkan PNG yang valid. Coba ulang atau gunakan browser lain.',
    PNG_TOO_LARGE: 'File PNG melebihi batas 20 MiB dan tidak dapat disiapkan.',
  };
  announce('error', messages[code] || 'QR belum dapat dibuat. Periksa input dan coba lagi.');
  input.focus();
}

for (const control of [input, ...modeInputs]) {
  control.addEventListener('input', () => {
    if (control === input) updateByteCount();
    invalidateResult();
  });
  control.addEventListener('change', () => {
    invalidateResult();
    if (control.name === 'payload-mode') {
      updateInputMode();
      announce('idle', mode() === 'url' ? 'Mode tautan website dipilih.' : 'Mode teks dipilih.');
    }
  });
}

createButton.addEventListener('click', async () => {
  if (busy) return;
  clearResult();
  const job = ++revision;
  busy = true;
  createButton.disabled = true;
  try {
    const selectedMode = mode();
    const payload = validatePayload(input.value, selectedMode);
    const matrix = makeQrMatrix(payload);
    renderMatrix(matrix);
    announce('idle', 'Menyiapkan PNG lokal…');
    const blob = await canvasBlob(canvas);
    if (job !== revision) return;
    if (!(blob instanceof Blob) || blob.type !== 'image/png') {
      const error = new Error('Browser tidak menghasilkan file PNG.');
      error.code = 'PNG_UNAVAILABLE';
      throw error;
    }
    if (blob.size > 20 * 1024 * 1024) {
      const error = new Error('File PNG melebihi 20 MiB.');
      error.code = 'PNG_TOO_LARGE';
      throw error;
    }
    currentBlob = blob;
    payloadOutput.value = payload;
    canvas.setAttribute('aria-label', 'Pratinjau QR code hitam putih dengan ruang putih di sekelilingnya. Isi payload tersedia pada kolom teks di bawah.');
    resultCard.hidden = false;
    downloadButton.disabled = false;
    announce('success', 'QR siap. Unduh PNG lalu uji hasilnya sebelum dicetak.');
  } catch (error) {
    if (job === revision) showError(error);
  } finally {
    busy = false;
    createButton.disabled = false;
  }
});

exampleButton.addEventListener('click', () => {
  input.value = mode() === 'url' ? 'https://edwinlab.dev/' : 'Halo dunia!';
  updateByteCount();
  invalidateResult();
  announce('idle', 'Contoh dimuat tanpa membuat QR. Pilih Buat QR untuk melanjutkan.');
  input.focus();
});

clearButton.addEventListener('click', () => {
  revision += 1;
  modeInputs[0].checked = true;
  input.value = '';
  updateInputMode();
  clearResult();
  announce('idle', 'Input dan hasil dibersihkan; mode tautan website dipilih.');
  input.focus();
});

downloadButton.addEventListener('click', () => {
  if (!currentBlob || downloadButton.disabled) return;
  try {
    downloadBlob(currentBlob, 'qr-code.png');
    announce('success', 'Unduhan PNG dimulai. Uji file QR sebelum dibagikan atau dicetak.');
  } catch {
    announce('error', 'Unduhan PNG gagal dimulai. Coba ulang atau simpan hasil lewat browser lain.');
  }
});

updateInputMode();
