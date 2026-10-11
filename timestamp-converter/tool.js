import { convertDateToTimestamp, convertTimestampToDate } from './logic.js';
import { copyText, setStatus } from '../tools/shared/ui.js';

const form = document.querySelector('#converter-form');
const mode = document.querySelector('#mode');
const unit = document.querySelector('#unit');
const unitControl = document.querySelector('#unit-control');
const timeZone = document.querySelector('#time-zone');
const valueInput = document.querySelector('#value-input');
const valueLabel = document.querySelector('#value-label');
const inputNote = document.querySelector('#input-note');
const result = document.querySelector('#result');
const summary = document.querySelector('#result-summary');
const status = document.querySelector('#status');
const resultFields = {
  utc: document.querySelector('#result-utc'),
  local: document.querySelector('#result-local'),
  offset: document.querySelector('#result-offset'),
  milliseconds: document.querySelector('#result-ms'),
  seconds: document.querySelector('#result-seconds'),
};
const copyButtons = [...document.querySelectorAll('[data-copy]')];

function clearResult() {
  result.hidden = true;
  Object.values(resultFields).forEach((field) => { field.value = ''; });
  copyButtons.forEach((button) => { button.disabled = true; });
}

function updateMode() {
  const dateMode = mode.value === 'date';
  unitControl.hidden = dateMode;
  valueLabel.textContent = dateMode ? 'ISO 8601 date and time with offset' : 'Unix timestamp';
  valueInput.inputMode = dateMode ? 'text' : 'numeric';
  valueInput.placeholder = dateMode ? 'For example, 2024-01-01T07:00:00+07:00' : 'For example, 1704067200';
  inputNote.textContent = dateMode
    ? 'Use YYYY-MM-DDTHH:mm:ss with Z or an explicit ±HH:mm offset. Optional fractions may contain 1–3 digits.'
    : 'Enter a whole number. Auto treats up to 10 digits as seconds and 11 or more digits as milliseconds; this is a heuristic.';
}

function invalidate(message = 'Input or settings changed. Convert again to update the result.') {
  clearResult();
  setStatus(status, { kind: 'idle', message });
}

function displayResult(converted, { timestampMode, timeZoneName }) {
  resultFields.utc.value = converted.isoUtc;
  resultFields.local.value = `${converted.localizedDate} ${converted.offset} (${converted.timeZone})`;
  resultFields.offset.value = `${converted.offset} (${converted.timeZone})`;
  resultFields.milliseconds.value = String(converted.epochMilliseconds);
  resultFields.seconds.value = converted.epochSeconds;
  copyButtons.forEach((button) => { button.disabled = false; });
  result.hidden = false;

  if (timestampMode && converted.usedAuto) {
    summary.textContent = `Auto detected ${converted.detectedUnit}; this is a digit-count heuristic. The date is displayed in ${timeZoneName}.`;
  } else {
    summary.textContent = `Converted using ${timestampMode ? converted.unit : 'the ISO 8601 offset'}; the date is displayed in ${timeZoneName}.`;
  }
}

function convert() {
  clearResult();
  const selectedZone = timeZone.value.trim();
  if (!selectedZone) {
    setStatus(status, { kind: 'error', message: 'Enter a time zone such as UTC or Asia/Jakarta.' });
    timeZone.focus();
    return false;
  }
  try {
    const timestampMode = mode.value === 'timestamp';
    const converted = timestampMode
      ? convertTimestampToDate(valueInput.value, { unit: unit.value, timeZone: selectedZone })
      : convertDateToTimestamp(valueInput.value, { timeZone: selectedZone });
    displayResult(converted, { timestampMode, timeZoneName: selectedZone });
    setStatus(status, { kind: 'success', message: 'Conversion complete. Results are shown below.' });
    return true;
  } catch (error) {
    setStatus(status, { kind: 'error', message: error.message || 'Could not convert this value.' });
    (error.code === 'INVALID_TIME_ZONE' ? timeZone : valueInput).focus();
    return false;
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  convert();
});

for (const control of [mode, unit]) {
  control.addEventListener('change', () => {
    updateMode();
    invalidate();
  });
}
timeZone.addEventListener('input', () => invalidate());
valueInput.addEventListener('input', () => invalidate());

document.querySelector('#use-current').addEventListener('click', () => {
  mode.value = 'timestamp';
  unit.value = 'milliseconds';
  updateMode();
  valueInput.value = String(Date.now());
  convert();
});

document.querySelector('#example-seconds').addEventListener('click', () => {
  mode.value = 'timestamp';
  unit.value = 'seconds';
  updateMode();
  valueInput.value = '1704067200';
  convert();
});

document.querySelector('#example-milliseconds').addEventListener('click', () => {
  mode.value = 'timestamp';
  unit.value = 'milliseconds';
  updateMode();
  valueInput.value = '1704067200123';
  convert();
});

document.querySelector('#example-iso').addEventListener('click', () => {
  mode.value = 'date';
  unit.value = 'auto';
  updateMode();
  valueInput.value = '2024-01-01T07:00:00+07:00';
  convert();
});

document.querySelector('#clear').addEventListener('click', () => {
  valueInput.value = '';
  clearResult();
  setStatus(status, { kind: 'idle', message: 'Cleared. Enter a timestamp or ISO date to get started.' });
  valueInput.focus();
});

copyButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const field = document.getElementById(button.dataset.copy);
    await copyText(field.value, status);
  });
});

updateMode();
