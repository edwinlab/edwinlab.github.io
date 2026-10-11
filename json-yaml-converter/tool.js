import { jsonToYaml, yamlToJson } from './logic.js';
import { setStatus, copyText, downloadText } from '../tools/shared/ui.js';

const direction = document.querySelector('#direction');
const input = document.querySelector('#input');
const output = document.querySelector('#output');
const inputLabel = document.querySelector('#input-label');
const outputLabel = document.querySelector('#output-label');
const status = document.querySelector('#status');
const copyButton = document.querySelector('#copy');
const downloadButton = document.querySelector('#download');
let current = null;

function clearResult(message = 'Input changed. Convert again to update the output.') {
  current = null;
  output.value = '';
  copyButton.disabled = true;
  downloadButton.disabled = true;
  setStatus(status, { kind: 'idle', message });
}
function updateDirection() {
  const toYaml = direction.value === 'json-yaml';
  inputLabel.textContent = toYaml ? 'JSON input' : 'YAML input';
  outputLabel.textContent = toYaml ? 'YAML output' : 'JSON output';
  input.placeholder = toYaml ? '{"name":"api","enabled":true}' : 'name: api\nenabled: true';
  document.querySelector('#input-note').textContent = toYaml
    ? 'Strict JSON only. Numbers outside the safe JavaScript range are rejected; use strings for large IDs.'
    : 'YAML 1.2 core data only. Anchors, aliases, tags, merge keys, and multiple documents are not supported.';
  clearResult('Direction changed. Convert the current input to see a new result.');
}

direction.addEventListener('change', updateDirection);
input.addEventListener('input', () => clearResult());
document.querySelector('#convert').addEventListener('click', () => {
  clearResult('Converting locally…');
  try {
    const yaml = direction.value === 'json-yaml';
    const converted = yaml ? jsonToYaml(input.value) : yamlToJson(input.value);
    output.value = converted;
    current = { value: converted, filename: yaml ? 'converted.yaml' : 'converted.json' };
    copyButton.disabled = false;
    downloadButton.disabled = false;
    setStatus(status, { kind: 'success', message: `Converted ${yaml ? 'JSON to YAML' : 'YAML to JSON'} locally. Review data types and formatting before use.` });
  } catch (error) {
    output.value = '';
    current = null;
    const location = error.line && error.column ? ` (line ${error.line}, column ${error.column})` : '';
    setStatus(status, { kind: 'error', message: `${error.message || 'Conversion failed.'}${location}` });
  }
});
for (const button of document.querySelectorAll('[data-example]')) {
  button.addEventListener('click', () => {
    direction.value = button.dataset.direction;
    updateDirection();
    input.value = button.dataset.example;
    clearResult('Example loaded. Convert to see the result.');
    document.querySelector('#convert').focus();
  });
}
document.querySelector('#clear').addEventListener('click', () => {
  input.value = '';
  clearResult('Cleared. Enter a document to get started.');
  input.focus();
});
copyButton.addEventListener('click', () => { if (current) copyText(current.value, status); });
downloadButton.addEventListener('click', () => {
  if (!current) return;
  try {
    downloadText(current.value, current.filename, 'text/plain;charset=utf-8');
    setStatus(status, { kind: 'success', message: `Downloaded ${current.filename}.` });
  } catch { setStatus(status, { kind: 'error', message: 'The converted file could not be prepared.' }); }
});
updateDirection();
