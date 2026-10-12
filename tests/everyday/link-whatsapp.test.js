import { assert, equal, throws, test, run } from '../tools/harness.js';
import { createWhatsAppLink, normalizeIndonesianPhone } from '/link-whatsapp/logic.js';

const BASE = 'https://wa.me/6281234567890';
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
function waitFor(predicate, timeout = 2500) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const check = () => {
      try { if (predicate()) return resolve(); }
      catch (error) { return reject(error); }
      if (performance.now() - start > timeout) return reject(new Error('Aplikasi tidak siap dalam batas waktu.'));
      setTimeout(check, 20);
    };
    check();
  });
}
async function openApp(width = 900) {
  const frame = document.createElement('iframe');
  frame.title = 'Pembuat link WhatsApp untuk tes';
  frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:1100px;border:0`;
  document.body.append(frame);
  frame.src = '/link-whatsapp/';
  await new Promise((resolve, reject) => {
    frame.addEventListener('load', resolve, { once: true });
    frame.addEventListener('error', () => reject(new Error('Route tool gagal dimuat.')), { once: true });
  });
  const win = frame.contentWindow;
  await waitFor(() => win.document.querySelector('#tool-status').getAttribute('aria-live') === 'polite');
  return { frame, win, doc: win.document };
}
function closeApp(app) { app.frame.remove(); }
function valid(app, phone = '081234567890', message = 'Halo dunia') {
  app.doc.querySelector('#phone-input').value = phone;
  app.doc.querySelector('#message-input').value = message;
  app.doc.querySelector('#create-button').click();
}
function setClipboard(win, writeText) {
  Object.defineProperty(win.navigator, 'clipboard', { configurable: true, value: { writeText } });
}

// Nomor dan batas kebijakan input V1.
test('normalisasi menerima bentuk 08, 62, plus62, separator, dan nol internal', () => {
  for (const raw of ['081234567890', '6281234567890', '+6281234567890', ' +62 (812) 3456-7890 ']) equal(normalizeIndonesianPhone(raw), '6281234567890');
  equal(normalizeIndonesianPhone('081200000000'), '6281200000000');
});
test('panjang nomor minimum dan maksimum kebijakan V1 diterima', () => {
  equal(normalizeIndonesianPhone('0812345678'), '62812345678');
  equal(normalizeIndonesianPhone('0812345678901'), '62812345678901');
});
test('panjang nomor di luar batas V1 ditolak', () => {
  throws(() => normalizeIndonesianPhone('081234567'), 'INVALID_PHONE');
  throws(() => normalizeIndonesianPhone('08123456789012'), 'INVALID_PHONE');
});
test('awalan, jenis nomor, dan karakter yang tidak didukung ditolak', () => {
  for (const raw of ['81234567890', '006281234567890', '+62081234567890', '+14155552671', '02112345678', '0812.3456.7890', '081234567890x1', '++6281234567890', '０81234567890', '']) throws(() => normalizeIndonesianPhone(raw), 'INVALID_PHONE');
});
test('batas raw nomor dan whitespace ASCII tepi diterapkan sebelum normalisasi', () => {
  throws(() => normalizeIndonesianPhone('0'.repeat(65)), 'PHONE_TOO_LONG');
  throws(() => normalizeIndonesianPhone('0812\t34567890'), 'INVALID_PHONE');
  throws(() => normalizeIndonesianPhone('0812\n34567890'), 'INVALID_PHONE');
  equal(normalizeIndonesianPhone(`${' '.repeat(52)}081234567890`), '6281234567890');
});
test('separator telepon hanya dipangkas; kurung tidak wajib seimbang', () => {
  equal(normalizeIndonesianPhone('(08 12)-3456-7890'), '6281234567890');
  throws(() => normalizeIndonesianPhone('08+1234567890'), 'INVALID_PHONE');
});

// Pesan, Unicode dan URL.
test('pesan kosong tidak menambah query dan pesan biasa di-encode native sekali', () => {
  equal(createWhatsAppLink('081234567890', '').url, BASE);
  equal(createWhatsAppLink('081234567890', 'Halo dunia').url, `${BASE}?text=Halo%20dunia`);
  equal(createWhatsAppLink('081234567890', 'A&B + 10%').url, `${BASE}?text=A%26B%20%2B%2010%25`);
});
test('encoding mempertahankan literal persen dan tanda baca sesuai encodeURIComponent', () => {
  equal(createWhatsAppLink('081234567890', '%20').url, `${BASE}?text=%2520`);
  equal(createWhatsAppLink('081234567890', "!'()*").url, `${BASE}?text=!'()*`);
  equal(createWhatsAppLink('081234567890', '<b>Halo</b>').url, `${BASE}?text=%3Cb%3EHalo%3C%2Fb%3E`);
});
test('baris CRLF dan CR dinormalisasi menjadi newline; spasi pesan tetap ada', () => {
  const result = createWhatsAppLink('081234567890', 'Halo\r\nDunia\rLagi');
  equal(result.message, 'Halo\nDunia\nLagi');
  equal(result.url, `${BASE}?text=Halo%0ADunia%0ALagi`);
  equal(createWhatsAppLink('081234567890', ' ').url, `${BASE}?text=%20`);
});
test('emoji, tab dan newline diterima; preview menerima pesan mentah yang dinormalisasi', () => {
  equal(createWhatsAppLink('081234567890', 'Hai 👋').url, `${BASE}?text=Hai%20%F0%9F%91%8B`);
  equal(createWhatsAppLink('081234567890', 'A\tB').url, `${BASE}?text=A%09B`);
});
test('batas pesan 500 code point diterima termasuk 500 emoji tepat 2000 byte', () => {
  const ascii = createWhatsAppLink('081234567890', 'a'.repeat(500));
  equal(Array.from(ascii.message).length, 500);
  const emoji = createWhatsAppLink('081234567890', '😀'.repeat(500));
  equal(Array.from(emoji.message).length, 500);
  equal(new TextEncoder().encode(emoji.message).length, 2000);
  equal(emoji.url, `${BASE}?text=${'%F0%9F%98%80'.repeat(500)}`);
});
test('batas 501 code point dan raw UTF-16 di atas 2000 ditolak', () => {
  throws(() => createWhatsAppLink('081234567890', 'a'.repeat(501)), 'MESSAGE_TOO_LONG');
  throws(() => createWhatsAppLink('081234567890', '😀'.repeat(501)), 'MESSAGE_TOO_LONG');
  throws(() => createWhatsAppLink('081234567890', 'a'.repeat(2001)), 'MESSAGE_TOO_LONG');
});
test('surrogate tunggal dan kontrol selain tab newline ditolak', () => {
  for (const raw of ['\uD800', '\uDC00', '\u0000', '\u0001', '\u000b', '\u000c', '\u007f']) throws(() => createWhatsAppLink('081234567890', raw), 'INVALID_MESSAGE');
});
test('output tidak membawa link mentah dari input nomor dan tetap dibatasi panjangnya', () => {
  const result = createWhatsAppLink(' +62 (812) 3456-7890 ', 'Halo');
  equal(result.phone, '6281234567890');
  equal(result.url, 'https://wa.me/6281234567890?text=Halo');
  assert(result.url.length <= 8192);
});
test('format pesan resmi dan konten panduan tersedia pada HTML statis', async () => {
  const response = await fetch('/link-whatsapp/');
  const html = await response.text();
  assert(html.includes('<title>Pembuat Link WhatsApp +62 dengan Pesan | Edwin Lab</title>'));
  assert(html.includes('https://faq.whatsapp.com/5913398998672934'));
  assert(html.includes('0812-3456-7890'));
  assert(html.includes('Kapan nomor dan pesan keluar dari browser?'));
  assert(html.includes('</noscript>'));
});

// UI behavior: never click the external WhatsApp action in these tests.
test('form default, counter, and external action initial state are safe', async () => {
  const app = await openApp();
  try {
    equal(app.doc.querySelector('#message-count').textContent, '0/500 karakter');
    equal(app.doc.querySelector('#open-link').hasAttribute('href'), false);
    equal(app.doc.querySelector('#open-link').hidden, true);
    equal(app.doc.querySelector('#copy-button').disabled, true);
  } finally { closeApp(app); }
});
test('contoh sintetis mengisi form tanpa membangun link atau membuka tab', async () => {
  const app = await openApp();
  try {
    app.doc.querySelector('#example-button').click();
    equal(app.doc.querySelector('#phone-input').value, '0812-3456-7890');
    equal(app.doc.querySelector('#message-input').value, 'Halo, saya ingin bertanya.');
    equal(app.doc.querySelector('#result-card').hidden, true);
    equal(app.doc.querySelector('#open-link').hasAttribute('href'), false);
  } finally { closeApp(app); }
});
test('validasi menghasilkan URL, nomor, dan preview teks literal tanpa mengklik aksi', async () => {
  const app = await openApp();
  try {
    valid(app, '081234567890', '<b>Halo</b>');
    equal(app.doc.querySelector('#result-url').value, `${BASE}?text=%3Cb%3EHalo%3C%2Fb%3E`);
    equal(app.doc.querySelector('#normalized-phone').textContent, '+6281234567890');
    equal(app.doc.querySelector('#message-preview').textContent, '<b>Halo</b>');
    equal(app.doc.querySelector('#message-preview').querySelector('b'), null);
    equal(app.doc.querySelector('#open-link').getAttribute('href'), `${BASE}?text=%3Cb%3EHalo%3C%2Fb%3E`);
    equal(app.doc.querySelector('#open-link').getAttribute('target'), '_blank');
    equal(app.doc.querySelector('#open-link').getAttribute('rel'), 'noopener noreferrer');
    equal(app.doc.querySelector('#open-link').getAttribute('referrerpolicy'), 'no-referrer');
  } finally { closeApp(app); }
});
test('edit input segera menghapus href lama dan menonaktifkan copy', async () => {
  const app = await openApp();
  try {
    valid(app);
    const phone = app.doc.querySelector('#phone-input');
    phone.value = '081234567891';
    phone.dispatchEvent(new app.win.Event('input', { bubbles: true }));
    equal(app.doc.querySelector('#result-card').hidden, true);
    equal(app.doc.querySelector('#open-link').hasAttribute('href'), false);
    equal(app.doc.querySelector('#open-link').hidden, true);
    equal(app.doc.querySelector('#copy-button').disabled, true);
    assert(!app.doc.querySelector('#tool-status').textContent.includes('[object Event]'));
  } finally { closeApp(app); }
});
test('error mempertahankan input, menghapus hasil lama, dan fokus pada field terkait', async () => {
  const app = await openApp();
  try {
    valid(app);
    const message = app.doc.querySelector('#message-input');
    message.value = '\uD800';
    message.dispatchEvent(new app.win.Event('input', { bubbles: true }));
    app.doc.querySelector('#create-button').click();
    equal(app.doc.activeElement, message);
    equal(message.value, '\uD800');
    equal(app.doc.querySelector('#open-link').hasAttribute('href'), false);
    equal(app.doc.querySelector('#copy-button').disabled, true);
  } finally { closeApp(app); }
});
test('counter menghitung code point emoji, bukan code unit UTF-16', async () => {
  const app = await openApp();
  try {
    const input = app.doc.querySelector('#message-input');
    input.value = 'Hai 👋';
    input.dispatchEvent(new app.win.Event('input', { bubbles: true }));
    equal(app.doc.querySelector('#message-count').textContent, '5/500 karakter');
  } finally { closeApp(app); }
});
test('clear menghapus input, pratinjau, href dan mengembalikan fokus ke nomor', async () => {
  const app = await openApp();
  try {
    valid(app);
    app.doc.querySelector('#clear-button').click();
    equal(app.doc.querySelector('#phone-input').value, '');
    equal(app.doc.querySelector('#message-input').value, '');
    equal(app.doc.querySelector('#message-count').textContent, '0/500 karakter');
    equal(app.doc.querySelector('#open-link').hasAttribute('href'), false);
    equal(app.doc.querySelector('#copy-button').disabled, true);
    equal(app.doc.activeElement, app.doc.querySelector('#phone-input'));
  } finally { closeApp(app); }
});
test('salin hanya menulis URL valid yang sama dengan hasil yang terlihat', async () => {
  const app = await openApp();
  try {
    let copied = '';
    setClipboard(app.win, async value => { copied = value; });
    valid(app);
    app.doc.querySelector('#copy-button').click();
    await waitFor(() => app.doc.querySelector('#tool-status').dataset.kind === 'success');
    equal(copied, app.doc.querySelector('#result-url').value);
    equal(copied, `${BASE}?text=Halo%20dunia`);
  } finally { closeApp(app); }
});
test('clipboard ditolak memberi panduan copy manual tanpa clipboard read', async () => {
  const app = await openApp();
  try {
    setClipboard(app.win, async () => { throw new Error('denied'); });
    valid(app);
    app.doc.querySelector('#copy-button').click();
    await waitFor(() => app.doc.querySelector('#tool-status').dataset.kind === 'warning');
    assert(app.doc.querySelector('#tool-status').textContent.includes('salin secara manual'));
    equal(app.doc.querySelector('#result-url').readOnly, true);
  } finally { closeApp(app); }
});
test('layout runner tidak membuat lebar dokumen melebihi empat viewport', async () => {
  for (const width of [320, 390, 768, 1440]) {
    const app = await openApp(width);
    try {
      await tick();
      assert(app.doc.documentElement.scrollWidth <= app.doc.documentElement.clientWidth, `Overflow pada ${width}px`);
      valid(app, '081234567890', '😀'.repeat(500));
      assert(app.doc.documentElement.scrollWidth <= app.doc.documentElement.clientWidth, `Overflow hasil pada ${width}px`);
    } finally { closeApp(app); }
  }
});

run();
