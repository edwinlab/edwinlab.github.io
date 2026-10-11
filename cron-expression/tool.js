import { createCronRunner } from './worker-client.js';
import { setStatus, copyText } from '../tools/shared/ui.js';

const expression = document.querySelector('#expression');
const reference = document.querySelector('#reference');
const timezone = document.querySelector('#timezone');
const status = document.querySelector('#status');
const result = document.querySelector('#result');
const fieldsBody = document.querySelector('#field-rows');
const runBody = document.querySelector('#run-rows');
const cancelButton = document.querySelector('#cancel');
const copyExpression = document.querySelector('#copy-expression');
const copyRuns = document.querySelector('#copy-runs');
const runner = createCronRunner();
let revision = 0;
let current = null;

function invalidate(message = 'Input changed. Explain again to update the results.') {
  revision++;
  runner.cancel();
  current = null;
  result.hidden = true;
  fieldsBody.replaceChildren();
  runBody.replaceChildren();
  copyExpression.disabled = true;
  copyRuns.disabled = true;
  cancelButton.disabled = true;
  setStatus(status, { kind: 'idle', message });
}
function row(body, values) {
  const tr = document.createElement('tr');
  for (const value of values) {
    const td = document.createElement('td');
    td.textContent = value;
    tr.append(td);
  }
  body.append(tr);
}
async function explain() {
  invalidate('Calculating up to five occurrences in a worker…');
  const requestRevision = revision;
  cancelButton.disabled = false;
  try {
    const calculated = await runner.run({ expression: expression.value, reference: reference.value, timezone: timezone.value });
    if (requestRevision !== revision) return;
    current = calculated;
    calculated.fields.forEach(field => row(fieldsBody, [field.name, field.token, field.values, field.note]));
    calculated.runs.forEach((run, index) => row(runBody, [String(index + 1), run.local, run.offset, run.utc]));
    document.querySelector('#result-context').textContent = 'Zone: ' + calculated.timezone + ' · Reference: ' + calculated.referenceUtc + ' · Search ends before: ' + calculated.horizonUtc;
    document.querySelector('#day-rule').textContent = calculated.dayRule;
    document.querySelector('#run-note').textContent = calculated.reason || 'Five occurrences strictly after the reference. Offsets belong to each individual occurrence.';
    result.hidden = false;
    copyExpression.disabled = false;
    copyRuns.disabled = calculated.runs.length === 0;
    setStatus(status, { kind: calculated.partial ? 'warning' : 'success', message: calculated.reason || 'Explained successfully. Five upcoming run times are shown.' });
  } catch (error) {
    if (requestRevision !== revision) return;
    setStatus(status, { kind: error.code === 'CANCELLED' ? 'idle' : 'error', message: error.message || 'Could not calculate this expression.' });
    if (error.code === 'INVALID_REFERENCE') reference.focus();
    else if (error.code === 'INVALID_TIMEZONE') timezone.focus();
    else expression.focus();
  } finally {
    if (requestRevision === revision) cancelButton.disabled = true;
  }
}
for (const input of [expression, reference, timezone]) input.addEventListener('input', () => invalidate());
document.querySelector('#explain').addEventListener('click', explain);
document.querySelector('#now').addEventListener('click', () => {
  reference.value = new Date().toISOString();
  invalidate('Reference reset to the current device time. Explain again to update the results.');
});
document.querySelector('#clear').addEventListener('click', () => {
  expression.value = '';
  invalidate('Cleared. Enter a five-field expression to get started.');
  expression.focus();
});
cancelButton.addEventListener('click', () => invalidate('Calculation cancelled.'));
document.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => {
  expression.value = button.dataset.example;
  explain();
}));
copyExpression.addEventListener('click', () => { if (current) copyText(current.expression, status); });
copyRuns.addEventListener('click', () => {
  if (!current) return;
  const lines = ['Expression: ' + current.expression, 'Zone: ' + current.timezone, 'Reference UTC: ' + current.referenceUtc, ...current.runs.map(run => run.local + ' ' + run.offset + ' (' + run.timezone + ') | ' + run.utc)];
  copyText(lines.join('\n'), status);
});
reference.value = new Date().toISOString();
const zones = new Set(['UTC', 'Asia/Jakarta', 'America/New_York', 'Europe/London', 'Australia/Sydney']);
try { Intl.supportedValuesOf('timeZone').forEach(zone => zones.add(zone)); } catch { /* Keep curated zones when enumeration is unavailable. */ }
const zoneList = document.querySelector('#zones');
zoneList.replaceChildren();
for (const zone of zones) {
  const option = document.createElement('option');
  option.value = zone;
  zoneList.append(option);
}
document.querySelectorAll('[data-enable]').forEach(control => { control.disabled = false; });
window.addEventListener('pagehide', () => runner.cancel());

