import { convert } from './logic.js';
import { setStatus, copyText, downloadText } from '../tools/shared/ui.js';

const direction = document.querySelector('#direction');
const delimiter = document.querySelector('#delimiter');
const nestedMode = document.querySelector('#nested-mode');
const formulaSafe = document.querySelector('#formula-safe');
const input = document.querySelector('#input');
const output = document.querySelector('#output');
const inputLabel = document.querySelector('#input-label');
const outputLabel = document.querySelector('#output-label');
const status = document.querySelector('#status');
const copyButton = document.querySelector('#copy');
const downloadButton = document.querySelector('#download');
const resultPanel = document.querySelector('#preview');
const previewTable = document.querySelector('#preview-table');
const previewMeta = document.querySelector('#preview-meta');
let current = null;
function clearResult(message = 'Input or options changed. Convert again to update the output.') {
  current = null; output.value = ''; previewTable.replaceChildren(); resultPanel.hidden = true;
  copyButton.disabled = true; downloadButton.disabled = true;
  setStatus(status, { kind: 'idle', message });
}
function updateControls() {
  const exporting = direction.value === 'json-csv';
  inputLabel.textContent = exporting ? 'JSON input' : 'CSV input';
  outputLabel.textContent = exporting ? 'CSV output' : 'JSON output';
  input.placeholder = exporting ? '[{"name":"Ada","age":30}]' : 'name,age\nAda,30';
  document.querySelector('#input-note').textContent = exporting
    ? 'Enter a JSON array of objects. Nested values are rejected by default; imported CSV cells become strings.'
    : 'Enter CSV with one header row. Every data cell becomes a string, including numbers and booleans.';
  document.querySelector('#output-note').textContent = exporting
    ? 'CSV output follows the selected delimiter and formula safety option.'
    : 'JSON output contains string-valued cells; nested structure is not inferred.';
  nestedMode.closest('.tools-control').hidden = !exporting;
  document.querySelector('#formula-control').hidden = !exporting;
  clearResult('Direction or options changed. Convert again to update the output.');
}
for (const control of [direction, delimiter, nestedMode, formulaSafe]) control.addEventListener('change', updateControls);
input.addEventListener('input', () => clearResult());
function renderPreview(result) {
  const head = document.createElement('thead'), headerRow = document.createElement('tr');
  for (const value of result.previewHeaders) { const th = document.createElement('th'); th.scope = 'col'; th.textContent = value; headerRow.append(th); }
  head.append(headerRow);
  const body = document.createElement('tbody');
  for (const values of result.preview) {
    const row = document.createElement('tr');
    for (const value of values) { const cell = document.createElement('td'); cell.textContent = value === null || value === undefined ? '' : String(value); row.append(cell); }
    body.append(row);
  }
  previewTable.replaceChildren(head, body);
  previewMeta.textContent = result.rowCount === 0 ? '0 data rows.' : `Showing ${Math.min(result.rowCount, 20)} of ${result.rowCount} data rows${result.previewTruncated ? ' (preview limited to 20 rows)' : ''}.`;
}
document.querySelector('#convert').addEventListener('click', () => {
  clearResult('Converting locally…');
  try {
    const result = convert(input.value, {
      direction: direction.value, delimiter: delimiter.value, nestedMode: nestedMode.value,
      escapeSpreadsheetFormulas: formulaSafe.checked,
    });
    output.value = result.output;
    current = { ...result, filename: direction.value === 'json-csv' ? 'converted.csv' : 'converted.json', direction: direction.value };
    renderPreview(result);
    resultPanel.hidden = false;
    copyButton.disabled = false; downloadButton.disabled = false;
    if (direction.value === 'json-csv' && !formulaSafe.checked) {
      setStatus(status, { kind: 'warning', message: `Converted ${result.rowCount} rows. Formula escaping is off; cells that begin with spreadsheet formulas may be interpreted when opened.` });
    } else setStatus(status, { kind: 'success', message: `Converted ${result.rowCount} rows locally. CSV cells import as strings.` });
  } catch (error) {
    output.value = ''; current = null; previewTable.replaceChildren(); resultPanel.hidden = true;
    const position = error.row ? ` (row ${error.row}${error.column ? `, column ${error.column}` : ''})` : '';
    setStatus(status, { kind: 'error', message: `${String(error.message || 'Conversion failed.').slice(0, 360)}${position}` });
  }
});
for (const button of document.querySelectorAll('[data-example]')) button.addEventListener('click', () => {
  direction.value = button.dataset.direction; updateControls(); input.value = button.dataset.example;
  clearResult('Example loaded. Convert to preview the result.'); document.querySelector('#convert').focus();
});
document.querySelector('#clear').addEventListener('click', () => { input.value = ''; clearResult('Cleared. Enter data to get started.'); input.focus(); });
copyButton.addEventListener('click', () => { if (current) copyText(current.output, status); });
downloadButton.addEventListener('click', () => {
  if (!current) return;
  try {
    downloadText(current.output, current.filename, 'text/plain;charset=utf-8');
    setStatus(status, { kind: 'success', message: `Downloaded ${current.filename}.` });
  } catch { setStatus(status, { kind: 'error', message: 'The converted file could not be prepared.' }); }
});
updateControls();
