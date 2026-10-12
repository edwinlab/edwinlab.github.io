const statusKinds = new Set(['idle', 'success', 'error', 'warning']);

function setStatus(element, kind, message) {
  if (!element || !statusKinds.has(kind)) throw new TypeError('Elemen status atau jenis status tidak valid.');
  element.dataset.kind = kind;
  element.setAttribute('role', 'status');
  element.setAttribute('aria-live', 'polite');
  element.setAttribute('aria-atomic', 'true');
  element.textContent = String(message);
}

export async function copyTextId(text, statusElement) {
  if (typeof text !== 'string') throw new TypeError('Hasil harus berupa teks.');
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard tidak tersedia.');
    await navigator.clipboard.writeText(text);
    setStatus(statusElement, 'success', 'Hasil berhasil disalin.');
    return true;
  } catch {
    setStatus(statusElement, 'warning', 'Clipboard tidak tersedia. Pilih hasil lalu salin secara manual.');
    return false;
  }
}

export function downloadBlob(blob, filename) {
  if (!(blob instanceof Blob)) throw new TypeError('File unduhan harus berupa Blob.');
  if (typeof filename !== 'string') throw new TypeError('Nama file harus berupa teks.');
  const basename = filename.split(/[\\/]/).pop();
  const safeName = basename.replace(/[\x00-\x1f\x7f<>:"|?*]/g, '_').replace(/^\.+$/, '');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = safeName || 'unduhan.bin';
  link.hidden = true;
  document.body.append(link);
  try { link.click(); }
  finally {
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
