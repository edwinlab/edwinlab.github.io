import { validateFormatRequest } from './logic.js';
import { createSqlRunner } from './worker-client.js';
import { setStatus, copyText, downloadText } from '../tools/shared/ui.js';

const input = document.querySelector('#input');
const output = document.querySelector('#output');
const dialect = document.querySelector('#dialect');
const indent = document.querySelector('#indent');
const keywordCase = document.querySelector('#keyword-case');
const status = document.querySelector('#status');
const formatButton = document.querySelector('#format');
const cancelButton = document.querySelector('#cancel');
const copyButton = document.querySelector('#copy');
const downloadButton = document.querySelector('#download');
const runner = createSqlRunner();
let revision = 0, current = null;
function clearResult(message = 'Query or format options changed. Format again to update the result.') {
  revision++; runner.cancel(); current = null; output.value = ''; copyButton.disabled = true; downloadButton.disabled = true; cancelButton.disabled = true; formatButton.disabled = false;
  setStatus(status, { kind: 'idle', message });
}
for (const control of [input, dialect, indent, keywordCase]) control.addEventListener(control === input ? 'input' : 'change', () => clearResult());
async function format() {
  clearResult('Formatting locally in a worker…'); const request = revision;
  try {
    const options = { dialect: dialect.value, indent: indent.value, keywordCase: keywordCase.value };
    validateFormatRequest(input.value, options);
    cancelButton.disabled = false; formatButton.disabled = true;
    const result = await runner.run({ text: input.value, options });
    if (request !== revision) return;
    current = result; output.value = result.output; copyButton.disabled = false; downloadButton.disabled = false;
    setStatus(status, { kind: 'success', message: `Formatted for ${dialect.options[dialect.selectedIndex].text}. Formatting does not validate database compatibility.` });
  } catch (error) {
    if (request !== revision) return;
    setStatus(status, { kind: error.code === 'CANCELLED' ? 'idle' : 'error', message: String(error.message || 'Formatting failed.').slice(0, 520) });
    if (error.code === 'EMPTY_INPUT' || error.code === 'INPUT_TOO_LARGE') input.focus();
  } finally { if (request === revision) { cancelButton.disabled = true; formatButton.disabled = false; } }
}
formatButton.addEventListener('click', format);
input.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); format(); } });
cancelButton.addEventListener('click', () => clearResult('Formatting cancelled.'));copyButton.addEventListener('click', () => { if (current) copyText(current.output, status); });
downloadButton.addEventListener('click', () => {
  if (!current) return;
  try { downloadText(current.output, 'formatted-query.sql', 'text/plain;charset=utf-8'); setStatus(status, { kind: 'success', message: 'Downloaded formatted-query.sql.' }); }
  catch { setStatus(status, { kind: 'error', message: 'The formatted SQL file could not be prepared.' }); }
});
document.querySelector('#clear').addEventListener('click', () => { input.value = ''; clearResult('Cleared. Enter a query to get started.'); input.focus(); });
for (const button of document.querySelectorAll('[data-example]')) button.addEventListener('click', () => { dialect.value = button.dataset.dialect; input.value = button.dataset.example; clearResult('Example loaded. Format the query to preview it.'); input.focus(); });
window.addEventListener('pagehide', () => runner.cancel());
