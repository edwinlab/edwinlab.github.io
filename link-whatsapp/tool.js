import { createWhatsAppLink } from './logic.js';
import { setStatus } from '/tools/shared/ui.js';
import { copyTextId } from '/everyday/shared/ui.js';

const phoneInput = document.querySelector('#phone-input');
const messageInput = document.querySelector('#message-input');
const messageCount = document.querySelector('#message-count');
const resultCard = document.querySelector('#result-card');
const normalizedPhone = document.querySelector('#normalized-phone');
const resultUrl = document.querySelector('#result-url');
const messagePreview = document.querySelector('#message-preview');
const copyButton = document.querySelector('#copy-button');
const openLink = document.querySelector('#open-link');
const status = document.querySelector('#tool-status');
let currentUrl = null;

function announce(kind, message) { setStatus(status, { kind, message }); }

function updateCounter() {
  messageCount.textContent = `${Array.from(messageInput.value).length}/500 karakter`;
}

function clearResult() {
  currentUrl = null;
  resultCard.hidden = true;
  normalizedPhone.textContent = '';
  resultUrl.value = '';
  messagePreview.textContent = '';
  copyButton.disabled = true;
  openLink.removeAttribute('href');
  openLink.hidden = true;
}

function invalidateResult() {
  if (currentUrl === null) return;
  clearResult();
  announce('warning', 'Input berubah. Buat link kembali untuk memperbarui hasil.');
}

function showError(error) {
  const controls = { phone: phoneInput, message: messageInput };
  const labels = { phone: 'nomor seluler Indonesia', message: 'pesan' };
  const field = error?.field === 'message' ? 'message' : 'phone';
  let message;
  if (error?.code === 'PHONE_TOO_LONG') message = 'Nomor mentah maksimal 64 karakter.';
  else if (error?.code === 'MESSAGE_TOO_LONG') message = 'Pesan melewati batas 500 karakter Unicode atau 2000 byte UTF-8.';
  else if (error?.code === 'INVALID_MESSAGE') message = 'Pesan mengandung karakter Unicode atau kontrol yang tidak didukung.';
  else if (error?.code === 'URL_TOO_LONG') message = 'Link yang dihasilkan terlalu panjang.';
  else if (error?.code === 'INVALID_PHONE') message = 'Masukkan nomor seluler Indonesia yang valid dengan awalan 08, 62, atau +62.';
  else message = `Periksa kembali ${labels[field]}.`;
  announce('error', message);
  controls[field].focus();
}

for (const control of [phoneInput, messageInput]) {
  control.addEventListener('input', () => {
    updateCounter();
    invalidateResult();
  });
  control.addEventListener('change', invalidateResult);
}

document.querySelector('#create-button').addEventListener('click', () => {
  clearResult();
  try {
    const result = createWhatsAppLink(phoneInput.value, messageInput.value);
    currentUrl = result.url;
    normalizedPhone.textContent = `+${result.phone}`;
    resultUrl.value = result.url;
    messagePreview.textContent = result.message === '' ? 'Tidak ada pesan awal.' : result.message;
    openLink.href = result.url;
    openLink.hidden = false;
    copyButton.disabled = false;
    resultCard.hidden = false;
    announce('success', 'Link berhasil dibuat di browser. Tidak ada chat yang dibuka atau pesan yang dikirim.');
  } catch (error) { showError(error); }
});

document.querySelector('#example-button').addEventListener('click', () => {
  phoneInput.value = '0812-3456-7890';
  messageInput.value = 'Halo, saya ingin bertanya.';
  updateCounter();
  clearResult();
  announce('idle', 'Contoh sintetis dimuat. Ganti dengan nomor Anda sendiri, lalu pilih Buat link.');
  phoneInput.focus();
});

document.querySelector('#clear-button').addEventListener('click', () => {
  phoneInput.value = '';
  messageInput.value = '';
  updateCounter();
  clearResult();
  announce('idle', 'Nomor, pesan, dan hasil dibersihkan.');
  phoneInput.focus();
});

copyButton.addEventListener('click', async () => {
  if (currentUrl === null || copyButton.disabled) return;
  await copyTextId(currentUrl, status);
});

updateCounter();
