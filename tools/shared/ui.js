import { MAX_TEXT_BYTES } from './limits.js';
const statusKinds = new Set(['idle', 'success', 'error', 'warning']);

export function setStatus(element, { kind, message }) {
  if (!element || !statusKinds.has(kind)) throw new TypeError('Invalid status element or kind.');
  element.dataset.kind = kind;
  element.setAttribute('role', 'status');
  element.setAttribute('aria-live', 'polite');
  element.setAttribute('aria-atomic', 'true');
  element.textContent = String(message);
}

export async function copyText(text, statusElement) {
  if (typeof text !== 'string') throw new TypeError('Expected text to be a string.');
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(text);
    setStatus(statusElement, { kind: 'success', message: 'Copied to clipboard.' });
    return true;
  } catch {
    setStatus(statusElement, {
      kind: 'warning',
      message: 'Clipboard access is unavailable. Select the result and copy it manually.'
    });
    return false;
  }
}

export function downloadText(text, filename, mimeType = 'text/plain;charset=utf-8') {
  if (typeof text !== 'string') throw new TypeError('Expected text to be a string.');
  // Only the basename is used, with control characters and reserved path characters removed.
  const safeName = String(filename).split(/[\\/]/).pop().replace(/[\x00-\x1f\x7f<>:"|?*]/g, '_');
  const url = URL.createObjectURL(new Blob([text], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = safeName && !/^\.+$/.test(safeName) ? safeName : 'download.txt';
  link.hidden = true;
  document.body.append(link);
  try { link.click(); }
  finally {
    link.remove();
    // Allow the browser to consume the URL before releasing it.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export async function readTextFile(file, { maxBytes = MAX_TEXT_BYTES } = {}) {
  if (!(file instanceof Blob)) throw new TypeError('Expected a File or Blob.');
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) throw new RangeError('Invalid byte limit.');
  if (file.size > maxBytes) {
    const error = new Error(`File exceeds the ${maxBytes.toLocaleString('en-US')}-byte limit.`);
    error.code = 'INPUT_TOO_LARGE';
    throw error;
  }
  // ignoreBOM means do not consume it: the tool decides whether to allow/remove U+FEFF.
  try { return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(await file.arrayBuffer()); }
  catch (cause) {
    const error = new Error('The file could not be read as valid UTF-8.', { cause });
    error.code = 'INVALID_UTF8';
    throw error;
  }
}
