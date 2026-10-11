import { compareJson, formatDiffReport } from './logic.js';
import { assertTextSize, MAX_OUTPUT_BYTES } from '../tools/shared/limits.js';
import { copyText, setStatus } from '../tools/shared/ui.js';

const originalInput = document.querySelector('#original-json');
const updatedInput = document.querySelector('#updated-json');
const status = document.querySelector('#status');
const resultSection = document.querySelector('#results');
const filter = document.querySelector('#change-filter');
const summary = document.querySelector('#summary');
const counts = document.querySelector('#counts');
const rows = document.querySelector('#diff-rows');
const copyButton = document.querySelector('#copy-report');
let currentResult = null;

function clearResult() {
  currentResult = null;
  resultSection.hidden = true;
  filter.disabled = true;
  copyButton.disabled = true;
  rows.replaceChildren();
  counts.replaceChildren();
  summary.textContent = '';
}

function displayType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value === 'object' ? 'object' : typeof value;
}

function appendValueCell(value, missing) {
  const cell = document.createElement('td');
  if (missing) {
    cell.textContent = '—';
    cell.setAttribute('aria-label', 'Missing value');
    return cell;
  }
  const type = document.createElement('span');
  type.className = 'diff-type';
  type.textContent = `[${displayType(value)}]`;
  const preview = document.createElement('span');
  preview.className = 'diff-value';
  const text = JSON.stringify(value);
  preview.textContent = text.length > 600 ? `${text.slice(0, 600)}… (preview shortened)` : text;
  if (text.length > 600) preview.setAttribute('aria-label', `${displayType(value)} value preview shortened to 600 characters. Copy the report for the full value.`);
  cell.append(type, preview);
  return cell;
}

function visibleDifferences() {
  const selected = filter.value;
  return currentResult.differences.filter(item => selected === 'all' || item.type === selected);
}

function renderResults() {
  if (!currentResult) return;
  const visible = visibleDifferences();
  rows.replaceChildren();
  for (const difference of visible) {
    const row = document.createElement('tr');
    row.className = 'diff-row';
    row.dataset.change = difference.type;
    const change = document.createElement('td');
    const type = document.createElement('span');
    type.className = 'diff-type';
    type.textContent = difference.type;
    change.append(type);
    const path = document.createElement('td');
    path.className = 'diff-path';
    path.textContent = difference.path || '(root)';
    row.append(change, path);
    row.append(appendValueCell(difference.before, difference.type === 'added'));
    row.append(appendValueCell(difference.after, difference.type === 'removed'));
    rows.append(row);
  }

  const displayed = currentResult.differences;
  const totals = { added: 0, removed: 0, changed: 0 };
  for (const item of displayed) totals[item.type]++;
  counts.replaceChildren();
  for (const type of ['added', 'removed', 'changed']) {
    const badge = document.createElement('span');
    badge.textContent = `${type[0].toUpperCase()}${type.slice(1)}: ${totals[type]}`;
    counts.append(badge);
  }

  if (!displayed.length && !currentResult.truncated) {
    summary.textContent = 'No differences found.';
  } else if (currentResult.truncated) {
    summary.textContent = `Showing the first 500 differences. Counts include only the ${displayed.length} differences shown.`;
  } else {
    summary.textContent = `${displayed.length} difference${displayed.length === 1 ? '' : 's'} found. The counts above cover all differences.`;
  }
  if (filter.value !== 'all' && displayed.length) {
    summary.textContent += ` Showing ${visible.length} ${filter.value} change${visible.length === 1 ? '' : 's'} in the table.`;
  } else if (filter.value !== 'all' && !visible.length && displayed.length) {
    summary.textContent += ` No ${filter.value} changes match this filter.`;
  }
  copyButton.disabled = false;
}

function invalidateForInputChange() {
  clearResult();
  originalInput.removeAttribute('aria-invalid');
  updatedInput.removeAttribute('aria-invalid');
  setStatus(status, { kind: 'idle', message: 'Input changed. Compare again to update the results.' });
}

function compare() {
  clearResult();
  originalInput.removeAttribute('aria-invalid');
  updatedInput.removeAttribute('aria-invalid');
  try {
    currentResult = compareJson(originalInput.value, updatedInput.value);
    const report = formatDiffReport(currentResult);
    assertTextSize(report, MAX_OUTPUT_BYTES);
    filter.disabled = false;
    resultSection.hidden = false;
    renderResults();
    setStatus(status, { kind: 'success', message: currentResult.differences.length || currentResult.truncated ? 'Comparison complete.' : 'No differences found.' });
  } catch (error) {
    if (error.inputName === 'Original JSON') originalInput.setAttribute('aria-invalid', 'true');
    if (error.inputName === 'Updated JSON') updatedInput.setAttribute('aria-invalid', 'true');
    const source = error.inputName ? `${error.inputName}: ` : '';
    const location = Number.isInteger(error.line) && Number.isInteger(error.column) ? ` Line ${error.line}, column ${error.column}.` : '';
    const advice = error.code === 'UNSAFE_NUMBER' ? ' Quote large numeric IDs as strings.' : '';
    setStatus(status, { kind: 'error', message: `${source}${error.message || 'The comparison could not be completed.'}${location}${advice}` });
  }
}

document.querySelector('#compare').addEventListener('click', compare);
document.querySelector('#swap').addEventListener('click', () => {
  [originalInput.value, updatedInput.value] = [updatedInput.value, originalInput.value];
  invalidateForInputChange();
  setStatus(status, { kind: 'idle', message: 'Inputs swapped. Compare again to update the results.' });
});
document.querySelector('#example').addEventListener('click', () => {
  originalInput.value = '{\n  "service": "profile-api",\n  "status": "pending",\n  "amount": 1200,\n  "items": ["book", "pen"]\n}';
  updatedInput.value = '{\n  "service": "profile-api",\n  "status": "paid",\n  "amount": 1200,\n  "items": ["book", "notebook"],\n  "receipt": "R-42"\n}';
  invalidateForInputChange();
  setStatus(status, { kind: 'idle', message: 'Example loaded. Select Compare JSON to review its changes.' });
  originalInput.focus();
});
document.querySelector('#clear').addEventListener('click', () => {
  originalInput.value = '';
  updatedInput.value = '';
  invalidateForInputChange();
  setStatus(status, { kind: 'idle', message: 'Cleared. Add two JSON values to get started.' });
  originalInput.focus();
});
originalInput.addEventListener('input', invalidateForInputChange);
updatedInput.addEventListener('input', invalidateForInputChange);
filter.addEventListener('change', renderResults);
copyButton.addEventListener('click', async () => {
  if (!currentResult) return;
  try {
    const report = formatDiffReport(currentResult);
    assertTextSize(report, MAX_OUTPUT_BYTES);
    await copyText(report, status);
  } catch (error) {
    setStatus(status, { kind: 'error', message: `The report exceeds the 10 MiB output limit. ${error.message}` });
  }
});

for (const id of ['compare', 'swap', 'example', 'clear']) document.getElementById(id).disabled = false;
