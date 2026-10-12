import { decodeImage, encodeImage } from '/everyday/shared/image.js';
import { downloadBlob } from '/everyday/shared/ui.js';
import { setStatus } from '/tools/shared/ui.js';
import { calculateSize, formatImageBytes, parseSizeValue } from './logic.js';

const fileInput = document.querySelector('#image-file');
const modeSelect = document.querySelector('#size-mode');
const valueInput = document.querySelector('#size-value');
const valueLabel = document.querySelector('#size-value-label');
const valueHint = document.querySelector('#size-value-hint');
const formatSelect = document.querySelector('#output-format');
const fileInfo = document.querySelector('#file-info');
const estimated = document.querySelector('#estimated-dimensions');
const resizeButton = document.querySelector('#resize-button');
const exampleButton = document.querySelector('#example-button');
const clearButton = document.querySelector('#clear-button');
const downloadButton = document.querySelector('#download-button');
const resultCard = document.querySelector('#result-card');
const originalPreview = document.querySelector('#original-preview');
const resultPreview = document.querySelector('#result-preview');
const originalMeta = document.querySelector('#original-meta');
const resultMeta = document.querySelector('#result-meta');
const resultSummary = document.querySelector('#result-summary');
const status = document.querySelector('#tool-status');
let selectedFile = null;
let decoded = null;
let sourceUrl = null;
let resultUrl = null;
let resultBlob = null;
let requestId = 0;
let activeJob = false;
let activeJobType = '';
let queuedFile = null;

function announce(kind, message) { setStatus(status, { kind, message }); }
function modeBounds() {
  if (!decoded) return { min: 1, max: 100 };
  if (modeSelect.value === 'width') return { min: 1, max: decoded.width };
  if (modeSelect.value === 'height') return { min: 1, max: decoded.height };
  return { min: 1, max: 100 };
}
function modeLabel() {
  return modeSelect.value === 'width' ? 'Lebar (px)' : modeSelect.value === 'height' ? 'Tinggi (px)' : 'Persen (%)';
}
function modeValue() {
  if (!decoded) return modeSelect.value === 'percent' ? 100 : '';
  return modeSelect.value === 'width' ? decoded.width : modeSelect.value === 'height' ? decoded.height : 100;
}
function selectedMime() { return formatSelect.value === 'png' ? 'image/png' : formatSelect.value === 'webp' ? 'image/webp' : 'image/jpeg'; }
function extensionFor(mime) { return mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg'; }
function revoke(url) { if (url) URL.revokeObjectURL(url); }

function clearOutput() {
  resultBlob = null;
  resultCard.hidden = true;
  resultPreview.removeAttribute('src');
  resultPreview.alt = '';
  resultMeta.textContent = '';
  resultSummary.textContent = '';
  downloadButton.disabled = true;
  revoke(resultUrl);
  resultUrl = null;
}
function closeDecoded() {
  if (decoded?.bitmap) decoded.bitmap.close();
  decoded = null;
  revoke(sourceUrl);
  sourceUrl = null;
  originalPreview.removeAttribute('src');
  originalPreview.alt = '';
  originalMeta.textContent = '';
}
function currentSize() {
  const value = parseSizeValue(valueInput.value);
  return calculateSize(decoded.width, decoded.height, modeSelect.value, value);
}
function updateModeControls(resetValue = false) {
  const label = modeLabel();
  const { min, max } = modeBounds();
  valueLabel.textContent = label;
  valueInput.setAttribute('aria-label', label);
  valueInput.maxLength = 8;
  valueInput.inputMode = 'numeric';
  valueHint.textContent = modeSelect.value === 'width'
    ? `Masukkan 1–${max} px. Rasio aspek tetap terkunci.`
    : modeSelect.value === 'height'
      ? `Masukkan 1–${max} px. Rasio aspek tetap terkunci.`
      : 'Masukkan 1–100%. Persentase selalu dihitung dari gambar asli.';
  valueInput.dataset.min = String(min);
  valueInput.dataset.max = String(max);
  if (resetValue) valueInput.value = String(modeValue());
}
function showEstimate() {
  if (!decoded) {
    estimated.textContent = 'Pilih gambar untuk melihat perkiraan dimensi.';
    resizeButton.disabled = true;
    return false;
  }
  try {
    const { width, height } = currentSize();
    estimated.textContent = `Perkiraan: ${width} × ${height} px`;
    resizeButton.disabled = activeJob;
    return true;
  } catch (error) {
    estimated.textContent = error.message || 'Periksa nilai ukuran.';
    resizeButton.disabled = true;
    return false;
  }
}
function updateButtons() {
  if (activeJob) resizeButton.disabled = true;
  else showEstimate();
}
function invalidate(message = 'Pengaturan berubah. Buat ulang ukuran sebelum mengunduh.') {
  if (activeJobType !== 'decode') requestId += 1;
  const hadResult = resultBlob !== null;
  clearOutput();
  showEstimate();
  if (hadResult) announce('warning', message);
}
function displayError(error) {
  const code = error?.code;
  let message = 'Gambar tidak dapat diproses. Periksa file dan coba lagi.';
  if (code === 'INVALID_IMAGE') message = error.message || 'Pilih file gambar yang valid.';
  else if (code === 'UNSUPPORTED_IMAGE') message = error.message || 'Format belum didukung. Pilih JPEG atau PNG.';
  else if (code === 'INPUT_TOO_LARGE') message = 'Ukuran file maksimal 10 MiB.';
  else if (code === 'IMAGE_DIMENSIONS') message = 'Dimensi gambar maksimal 8192 px per sisi dan 12 juta piksel.';
  else if (code === 'IMAGE_UNSUPPORTED') message = error.message || 'Browser belum mendukung pembacaan gambar ini.';
  else if (code === 'OUTPUT_TOO_LARGE') message = 'File hasil melewati batas 20 MiB.';
  else if (code === 'ENCODE_FAILED') message = formatSelect.value === 'webp'
    ? 'Browser tidak mendukung ekspor WebP. Pilih PNG atau JPEG.'
    : 'Browser gagal membuat file gambar. Coba lagi atau gunakan browser lain.';
  announce('error', message);
  if (code === 'ENCODE_FAILED' && formatSelect.value === 'webp') formatSelect.focus();
  else fileInput.focus();
}

async function loadFile(file, id) {
  activeJob = true;
  activeJobType = 'decode';
  fileInfo.textContent = `Membaca ${file.name}…`;
  updateButtons();
  try {
    const image = await decodeImage(file);
    if (id !== requestId) { image.bitmap.close(); return; }
    selectedFile = file;
    decoded = image;
    sourceUrl = URL.createObjectURL(file);
    originalPreview.src = sourceUrl;
    originalPreview.alt = `Pratinjau foto asli ${file.name}`;
    originalMeta.textContent = `${image.mime === 'image/png' ? 'PNG' : 'JPEG'} · ${image.width} × ${image.height} px · ${formatImageBytes(file.size)}`;
    fileInfo.textContent = `${file.name} · ${image.mime === 'image/png' ? 'PNG' : 'JPEG'} · ${image.width} × ${image.height} px · ${formatImageBytes(file.size)}`;
    updateModeControls(true);
    showEstimate();
    announce('success', 'Foto siap. Atur lebar, tinggi, atau persen, lalu pilih Ubah ukuran.');
  } catch (error) {
    if (id === requestId) {
      selectedFile = file;
      fileInfo.textContent = `${file.name} · belum dapat dibaca`;
      closeDecoded();
      displayError(error);
    }
  } finally {
    activeJob = false;
    activeJobType = '';
    updateButtons();
    processQueuedFile();
  }
}
function processQueuedFile() {
  if (activeJob || !queuedFile) return;
  const queued = queuedFile;
  queuedFile = null;
  if (queued.id === requestId && queued.file) void loadFile(queued.file, queued.id);
}
function selectFile(file) {
  const id = ++requestId;
  queuedFile = null;
  clearOutput();
  closeDecoded();
  selectedFile = file || null;
  if (!file) {
    fileInfo.textContent = 'Belum ada foto dipilih.';
    updateModeControls(true);
    showEstimate();
    announce('idle', 'Pilih file JPEG atau PNG untuk memulai.');
    return;
  }
  if (activeJob) {
    queuedFile = { file, id };
    fileInfo.textContent = `${file.name} · menunggu pekerjaan sebelumnya selesai…`;
    announce('warning', 'Foto baru dipilih. Pekerjaan browser akan diselesaikan lalu hasil lamanya dibuang.');
    return;
  }
  void loadFile(file, id);
}

fileInput.addEventListener('change', () => selectFile(fileInput.files?.[0] || null));
modeSelect.addEventListener('change', () => {
  updateModeControls(true);
  invalidate();
});
valueInput.addEventListener('input', () => {
  invalidate();
});
formatSelect.addEventListener('change', () => invalidate());

resizeButton.addEventListener('click', async () => {
  if (activeJob || !selectedFile || !decoded) return;
  let target;
  try { target = currentSize(); }
  catch (error) { showEstimate(); announce('error', error.message || 'Periksa nilai ukuran.'); valueInput.focus(); return; }
  const id = requestId;
  const file = selectedFile;
  const bitmap = decoded.bitmap;
  const sourceWidth = decoded.width;
  const sourceHeight = decoded.height;
  const mime = selectedMime();
  clearOutput();
  activeJob = true;
  activeJobType = 'encode';
  updateButtons();
  announce('idle', 'Mengubah ukuran satu foto di browser…');
  try {
    const blob = await encodeImage(bitmap, {
      width: target.width,
      height: target.height,
      mime,
      quality: 0.9,
      background: '#ffffff',
    });
    if (id !== requestId) return;
    if (blob.type !== mime || blob.size < 1 || blob.size > 20 * 1024 * 1024) {
      const error = new Error('Format atau ukuran file hasil tidak sesuai.');
      error.code = blob.size > 20 * 1024 * 1024 ? 'OUTPUT_TOO_LARGE' : 'ENCODE_FAILED';
      throw error;
    }
    resultBlob = blob;
    resultUrl = URL.createObjectURL(blob);
    resultPreview.src = resultUrl;
    const ext = extensionFor(mime);
    resultPreview.alt = `Pratinjau hasil ${ext.toUpperCase()}, ${target.width} × ${target.height} piksel`;
    resultMeta.textContent = `${ext.toUpperCase()} · ${target.width} × ${target.height} px · ${formatImageBytes(blob.size)}`;
    resultSummary.textContent = `Foto asli ${sourceWidth} × ${sourceHeight} px · ${formatImageBytes(file.size)}. Hasil ${target.width} × ${target.height} px · ${formatImageBytes(blob.size)}.`;
    resultCard.hidden = false;
    downloadButton.disabled = false;
    announce('success', 'Foto berukuran baru siap. Tinjau pratinjau sebelum mengunduh. Ukuran file dapat bertambah atau berkurang.');
  } catch (error) {
    if (id === requestId) { clearOutput(); displayError(error); }
  } finally {
    activeJob = false;
    activeJobType = '';
    updateButtons();
    processQueuedFile();
  }
});

exampleButton.addEventListener('click', async () => {
  if (activeJob) return;
  const id = ++requestId;
  queuedFile = null;
  clearOutput();
  closeDecoded();
  selectedFile = null;
  activeJob = true;
  activeJobType = 'example';
  updateButtons();
  fileInfo.textContent = 'Membuat contoh sintetis…';
  const canvas = document.createElement('canvas');
  canvas.width = 160; canvas.height = 120;
  try {
    const context = canvas.getContext('2d');
    context.fillStyle = '#10b99b'; context.fillRect(10, 10, 64, 48);
    context.fillStyle = '#e5673f'; context.fillRect(86, 58, 62, 48);
    const blob = await new Promise((resolve, reject) => {
      try { canvas.toBlob(value => value ? resolve(value) : reject(new Error('Contoh tidak dapat dibuat.')), 'image/png'); }
      catch (error) { reject(error); }
    });
    if (id === requestId) {
      queuedFile = { file: new File([blob], 'contoh-160x120.png', { type: 'image/png' }), id };
      fileInfo.textContent = 'Contoh sintetis siap dibaca…';
      announce('idle', 'Contoh lokal disiapkan. Foto belum diubah ukurannya.');
    }
  } catch {
    if (id === requestId) announce('error', 'Browser tidak dapat menyiapkan contoh. Pilih file JPEG atau PNG sendiri.');
  } finally {
    canvas.width = 0; canvas.height = 0;
    activeJob = false; activeJobType = '';
    updateButtons(); processQueuedFile();
  }
});

clearButton.addEventListener('click', () => {
  requestId += 1;
  queuedFile = null;
  fileInput.value = '';
  selectedFile = null;
  closeDecoded(); clearOutput();
  fileInfo.textContent = 'Belum ada foto dipilih.';
  modeSelect.value = 'width';
  formatSelect.value = 'png';
  valueInput.value = '';
  updateModeControls(); showEstimate();
  announce('idle', 'File, pratinjau, dan hasil dibersihkan. Pilih foto untuk mulai lagi.');
  fileInput.focus();
});
downloadButton.addEventListener('click', () => {
  if (!resultBlob || downloadButton.disabled) return;
  try {
    downloadBlob(resultBlob, `foto-resize.${extensionFor(selectedMime())}`);
    announce('success', 'Unduhan dimulai. Periksa file sebelum membagikannya.');
  } catch { announce('error', 'Unduhan gagal dimulai. Coba lagi atau gunakan browser lain.'); }
});
window.addEventListener('pagehide', () => {
  requestId += 1; queuedFile = null; clearOutput(); closeDecoded();
});

updateModeControls();
showEstimate();
fileInfo.textContent = 'Belum ada foto dipilih.';
