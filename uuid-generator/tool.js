import { generateUUIDs, serializeUUIDs } from './logic.js';
import { setStatus, copyText, downloadText } from '../tools/shared/ui.js';

const form = document.querySelector('#uuid-form');
const countInput = document.querySelector('#count');
const output = document.querySelector('#output');
const status = document.querySelector('#status');
const copyButton = document.querySelector('#copy');
const downloadButton = document.querySelector('#download');
const clearButton = document.querySelector('#clear');
let current = null;

function invalidate(message = 'Count changed. Generate again to update the UUIDs.') {
  current = null;
  output.value = '';
  output.readOnly = true;
  copyButton.disabled = true;
  downloadButton.disabled = true;
  setStatus(status, { kind: 'idle', message });
}

countInput.addEventListener('input', () => invalidate());
form.addEventListener('submit', event => {
  event.preventDefault();
  invalidate('Generating UUIDs with secure browser randomness…');
  try {
    current = generateUUIDs(countInput.value, globalThis.crypto);
    output.value = serializeUUIDs(current);
    copyButton.disabled = false;
    downloadButton.disabled = false;
    setStatus(status, { kind: 'success', message: `Generated ${current.length} UUID v4 ${current.length === 1 ? 'identifier' : 'identifiers'} locally.` });
  } catch (error) {
    current = null;
    output.value = '';
    setStatus(status, { kind: 'error', message: error.message || 'Could not generate UUIDs.' });
    if (error.code === 'INVALID_COUNT' || error.code === 'INPUT_TOO_LARGE') countInput.focus();
  }
});
copyButton.addEventListener('click', () => {
  if (current) copyText(serializeUUIDs(current), status);
});
downloadButton.addEventListener('click', () => {
  if (!current) return;
  try {
    downloadText(serializeUUIDs(current), 'uuids-v4.txt', 'text/plain;charset=utf-8');
    setStatus(status, { kind: 'success', message: 'Downloaded uuids-v4.txt.' });
  } catch {
    setStatus(status, { kind: 'error', message: 'The UUID file could not be prepared.' });
  }
});
clearButton.addEventListener('click', () => {
  countInput.value = '';
  invalidate('Cleared. Enter a count to get started.');
  countInput.focus();
});
