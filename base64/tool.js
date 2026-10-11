import { decodeBase64, encodeBase64 } from './logic.js';
import { copyText, setStatus } from '../tools/shared/ui.js';

const input = document.querySelector('#input');
const output = document.querySelector('#output');
const direction = document.querySelector('#direction');
const alphabet = document.querySelector('#alphabet');
const processButton = document.querySelector('#process');
const exampleButton = document.querySelector('#example');
const clearButton = document.querySelector('#clear');
const copyButton = document.querySelector('#copy');
const status = document.querySelector('#status');

function invalidate(message = 'Settings or input changed. Process again to update the output.') {
  output.value = '';
  copyButton.disabled = true;
  setStatus(status, { kind: 'idle', message });
}

function process() {
  output.value = '';
  copyButton.disabled = true;
  try {
    output.value = direction.value === 'encode'
      ? encodeBase64(input.value, alphabet.value)
      : decodeBase64(input.value, alphabet.value);
    copyButton.disabled = false;
    setStatus(status, { kind: 'success', message: `${direction.value === 'encode' ? 'Encoded' : 'Decoded'} successfully using ${alphabet.value === 'standard' ? 'standard Base64' : 'Base64URL'}.` });
    return true;
  } catch (error) {
    const message = error.code === 'INPUT_TOO_LARGE'
      ? 'Input exceeds the 5 MiB UTF-8 limit.'
      : error.code === 'OUTPUT_TOO_LARGE'
        ? error.message
        : error.message || 'Could not process this input.';
    setStatus(status, { kind: 'error', message });
    input.focus();
    return false;
  }
}

processButton.addEventListener('click', process);
input.addEventListener('input', () => invalidate());
direction.addEventListener('change', () => invalidate());
alphabet.addEventListener('change', () => invalidate());
exampleButton.addEventListener('click', () => {
  if (direction.value === 'encode') input.value = 'Hello, world!';
  else input.value = alphabet.value === 'standard' ? 'SGVsbG8sIHdvcmxkIQ==' : 'SGVsbG8sIHdvcmxkIQ';
  process();
});
clearButton.addEventListener('click', () => {
  input.value = '';
  invalidate('Cleared. Enter text or a Base64 value to get started.');
  input.focus();
});
copyButton.addEventListener('click', async () => { await copyText(output.value, status); });

for (const control of [direction, alphabet, processButton, exampleButton, clearButton]) control.disabled = false;
