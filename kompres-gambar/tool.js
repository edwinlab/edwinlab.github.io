import { decodeImage, encodeImage } from '/everyday/shared/image.js';
import { downloadBlob } from '/everyday/shared/ui.js';
import { setStatus } from '/tools/shared/ui.js';
import { formatByteSize, summarizeBytes, validateQuality } from './logic.js';

const fileInput = document.querySelector('#image-file');
const formatSelect = document.querySelector('#output-format');
const qualityInput = document.querySelector('#quality-input');
const qualityValue = document.querySelector('#quality-value');
const fileInfo = document.querySelector('#file-info');
const compressButton = document.querySelector('#compress-button');
const exampleButton = document.querySelector('#example-button');
const clearButton = document.querySelector('#clear-button');
const downloadButton = document.querySelector('#download-button');
const resultCard = document.querySelector('#result-card');
const originalPreview = document.querySelector('#original-preview');
const resultPreview = document.querySelector('#result-preview');
const originalMeta = document.querySelector('#original-meta');
const resultMeta = document.querySelector('#result-meta');
const sizeSummary = document.querySelector('#size-summary');
const sizeChange = document.querySelector('#size-change');
const largerNotice = document.querySelector('#larger-notice');
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
function currentFormat() { return formatSelect.value; }
function currentMime() { return currentFormat() === 'webp' ? 'image/webp' : 'image/jpeg'; }

function revokeUrl(url) {
  if (url) URL.revokeObjectURL(url);
}

function clearOutput() {
  resultBlob = null;
  resultCard.hidden = true;
  resultPreview.removeAttribute('src');
  resultPreview.alt = '';
  resultMeta.textContent = '';
  sizeSummary.textContent = '';
  sizeChange.textContent = '';
  largerNotice.hidden = true;
  downloadButton.disabled = true;
  revokeUrl(resultUrl);
  resultUrl = null;
}

function closeDecoded() {
  if (decoded?.bitmap) decoded.bitmap.close();
  decoded = null;
  revokeUrl(sourceUrl);
  sourceUrl = null;
  originalPreview.removeAttribute('src');
  originalPreview.alt = '';
  originalMeta.textContent = '';
}

function updateButtons() {
  compressButton.disabled = activeJob || !decoded;
  fileInfo.textContent = selectedFile && !decoded && activeJobType === 'decode'
    ? `Membaca ${selectedFile.name}…`
    : fileInfo.textContent;
}

function clearOutputForChange(message) {
  const hadResult = resultBlob !== null;
  clearOutput();
  if (hadResult) announce('warning', message);
}

function invalidateOptions() {
  clearOutputForChange('Pengaturan berubah. Kompres kembali untuk memperbarui hasil.');
  if (activeJob && activeJobType === 'encode') requestId += 1;
  updateButtons();
}

function displayError(error) {
  const code = error?.code;
  let message = 'File atau hasil gambar tidak dapat diproses. Periksa format dan coba lagi.';
  if (code === 'INVALID_IMAGE') message = error.message || 'Pilih file gambar yang valid.';
  else if (code === 'UNSUPPORTED_IMAGE') message = error.message || 'Format gambar belum didukung. Pilih JPEG atau PNG.';
  else if (code === 'INPUT_TOO_LARGE') message = 'Ukuran file maksimal 10 MiB.';
  else if (code === 'IMAGE_DIMENSIONS') message = 'Dimensi gambar maksimal 8192 px per sisi dan 12 juta piksel.';
  else if (code === 'IMAGE_UNSUPPORTED') message = error.message || 'Browser tidak mendukung pembacaan gambar ini.';
  else if (code === 'ENCODE_FAILED') message = currentFormat() === 'webp'
    ? 'Browser tidak mendukung hasil WebP. Pilih format JPEG.'
    : 'Browser gagal membuat hasil JPEG. Coba lagi atau gunakan browser lain.';
  else if (code === 'OUTPUT_TOO_LARGE') message = 'File hasil melewati batas 20 MiB.';
  else if (code === 'INVALID_QUALITY') message = 'Pilih kualitas bulat antara 60 dan 95.';
  announce('error', message);
  if (code === 'ENCODE_FAILED' && currentFormat() === 'webp') formatSelect.focus();
  else fileInput.focus();
}

async function loadSelectedFile(file, id) {
  activeJob = true;
  activeJobType = 'decode';
  fileInfo.textContent = `Membaca ${file.name}…`;
  updateButtons();
  try {
    const decodedImage = await decodeImage(file);
    if (id !== requestId) {
      decodedImage.bitmap.close();
      return;
    }
    selectedFile = file;
    decoded = { ...decodedImage };
    sourceUrl = URL.createObjectURL(file);
    originalPreview.src = sourceUrl;
    originalPreview.alt = `Pratinjau gambar asli ${file.name}`;
    originalMeta.textContent = `${decodedImage.mime === 'image/png' ? 'PNG' : 'JPEG'} · ${decodedImage.width} × ${decodedImage.height} px`;
    fileInfo.textContent = `${file.name} · ${decodedImage.mime === 'image/png' ? 'PNG' : 'JPEG'} · ${decodedImage.width} × ${decodedImage.height} px · ${formatByteSize(file.size)}`;
    announce('success', 'Gambar siap. Pilih format dan kualitas, lalu pilih Kompres gambar.');
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
  if (queued.id === requestId && queued.file) void loadSelectedFile(queued.file, queued.id);
}

function selectFile(file) {
  const id = ++requestId;
  queuedFile = null;
  clearOutput();
  closeDecoded();
  selectedFile = file || null;
  if (!file) {
    fileInfo.textContent = 'Belum ada gambar dipilih.';
    updateButtons();
    announce('idle', 'Pilih file JPEG atau PNG untuk memulai.');
    return;
  }
  if (activeJob) {
    queuedFile = { file, id };
    fileInfo.textContent = `${file.name} · menunggu pekerjaan sebelumnya selesai…`;
    announce('warning', 'File baru dipilih. Pekerjaan browser yang sedang berjalan akan diselesaikan lalu hasil lamanya dibuang.');
    return;
  }
  void loadSelectedFile(file, id);
}

fileInput.addEventListener('change', () => selectFile(fileInput.files?.[0] || null));
qualityInput.addEventListener('input', () => {
  qualityValue.textContent = `${qualityInput.value}%`;
  invalidateOptions();
});
formatSelect.addEventListener('change', invalidateOptions);

compressButton.addEventListener('click', async () => {
  if (activeJob || !selectedFile || !decoded) return;
  let quality;
  try { quality = validateQuality(Number(qualityInput.value)); }
  catch (error) { displayError(error); return; }
  const id = requestId;
  const file = selectedFile;
  const bitmap = decoded.bitmap;
  const { width, height } = decoded;
  const mime = currentMime();
  clearOutput();
  activeJob = true;
  activeJobType = 'encode';
  updateButtons();
  announce('idle', 'Mengompres satu gambar di browser…');
  try {
    const blob = await encodeImage(bitmap, { width, height, mime, quality: quality / 100, background: '#ffffff' });
    if (id !== requestId) return;
    if (blob.type !== mime || blob.size < 1 || blob.size > 20 * 1024 * 1024) {
      const error = new Error('Format atau ukuran hasil gambar tidak sesuai.');
      error.code = blob.size > 20 * 1024 * 1024 ? 'OUTPUT_TOO_LARGE' : 'ENCODE_FAILED';
      throw error;
    }
    resultBlob = blob;
    resultUrl = URL.createObjectURL(blob);
    resultPreview.src = resultUrl;
    const ext = mime === 'image/webp' ? 'webp' : 'jpg';
    resultPreview.alt = `Pratinjau hasil kompresi ${ext.toUpperCase()}, ${width} × ${height} piksel`;
    const summary = summarizeBytes(file.size, blob.size);
    resultMeta.textContent = `${ext.toUpperCase()} · ${width} × ${height} px · kualitas ${quality}%`;
    sizeSummary.textContent = `Ukuran asli: ${formatByteSize(file.size)}. Ukuran hasil: ${formatByteSize(blob.size)}.`;
    if (summary.isSmaller) sizeChange.textContent = `Lebih kecil ${summary.savedPercent.toFixed(1).replace('.', ',')}% (${summary.deltaBytes} byte).`;
    else if (summary.deltaBytes === 0) sizeChange.textContent = 'Ukuran file sama; tidak ada penghematan.';
    else sizeChange.textContent = `Ukuran bertambah ${Math.abs(summary.savedPercent).toFixed(1).replace('.', ',')}% (${Math.abs(summary.deltaBytes)} byte).`;
    largerNotice.hidden = summary.isSmaller || summary.deltaBytes === 0;
    resultCard.hidden = false;
    downloadButton.disabled = false;
    announce(summary.isSmaller || summary.deltaBytes === 0 ? 'success' : 'warning', summary.isSmaller
      ? 'Hasil kompresi siap. Tinjau pratinjau sebelum mengunduh.'
      : summary.deltaBytes === 0
        ? 'Ukuran hasil sama dengan file asli. Tinjau pratinjau sebelum mengunduh.'
        : 'Hasil lebih besar dari file asli. Coba kualitas lebih rendah atau gunakan file asli.');
  } catch (error) {
    if (id === requestId) {
      clearOutput();
      displayError(error);
    }
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
  canvas.width = 160;
  canvas.height = 120;
  try {
    const context = canvas.getContext('2d');
    context.fillStyle = '#10b99b';
    context.fillRect(12, 12, 66, 48);
    context.fillStyle = '#e5673f';
    context.fillRect(84, 58, 62, 44);
    const blob = await new Promise((resolve, reject) => {
      try { canvas.toBlob(value => value ? resolve(value) : reject(new Error('Contoh gambar tidak dapat dibuat.')), 'image/png'); }
      catch (error) { reject(error); }
    });
    if (id === requestId) {
      queuedFile = { file: new File([blob], 'contoh-transparan.png', { type: 'image/png' }), id };
      fileInfo.textContent = 'Contoh sintetis siap dibaca…';
      announce('idle', 'Contoh sintetis disiapkan. Pilih format dan kualitas lalu kompres untuk membandingkan hasilnya.');
    }
  } catch {
    if (id === requestId) announce('error', 'Browser tidak dapat menyiapkan contoh gambar. Pilih file JPEG atau PNG sendiri.');
  } finally {
    canvas.width = 0;
    canvas.height = 0;
    activeJob = false;
    activeJobType = '';
    updateButtons();
    processQueuedFile();
  }
});

clearButton.addEventListener('click', () => {
  requestId += 1;
  queuedFile = null;
  fileInput.value = '';
  selectedFile = null;
  closeDecoded();
  clearOutput();
  fileInfo.textContent = 'Belum ada gambar dipilih.';
  formatSelect.value = 'jpeg';
  qualityInput.value = '80';
  qualityValue.textContent = '80%';
  updateButtons();
  announce('idle', 'File, pratinjau, dan hasil dibersihkan; pengaturan dikembalikan ke JPEG 80%.');
  fileInput.focus();
});

downloadButton.addEventListener('click', () => {
  if (!resultBlob || downloadButton.disabled) return;
  const filename = currentFormat() === 'webp' ? 'gambar-kompres.webp' : 'gambar-kompres.jpg';
  try {
    downloadBlob(resultBlob, filename);
    announce('success', 'Unduhan hasil dimulai. Nama file mengikuti format gambar yang dipilih.');
  } catch {
    announce('error', 'Unduhan gagal dimulai. Coba lagi atau gunakan browser lain.');
  }
});

window.addEventListener('pagehide', () => {
  requestId += 1;
  queuedFile = null;
  clearOutput();
  closeDecoded();
});

qualityValue.textContent = '80%';
fileInfo.textContent = 'Belum ada gambar dipilih.';
