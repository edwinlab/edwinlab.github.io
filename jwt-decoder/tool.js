import { decodeJwt, evaluateTimeClaims } from './logic.js';
import { copyText, setStatus } from '../tools/shared/ui.js';

const EXAMPLE_TOKEN = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJzYW1wbGUtdXNlciIsImlhdCI6MTcwMDAwMDAwMCwibmJmIjoxNjk5OTk5OTAwLCJleHAiOjE3MDAwMDM2MDB9.';
const input = document.querySelector('#jwt-input');
const decodeButton = document.querySelector('#decode');
const exampleButton = document.querySelector('#load-example');
const clearButton = document.querySelector('#clear');
const result = document.querySelector('#result');
const status = document.querySelector('#status');
const signatureStatus = document.querySelector('#signature-status');
const headerOutput = document.querySelector('#header-output');
const payloadOutput = document.querySelector('#payload-output');
const claimList = document.querySelector('#time-claims');
const copyButtons = [...document.querySelectorAll('[data-copy]')];

function clearResult() {
  result.hidden = true;
  headerOutput.value = '';
  payloadOutput.value = '';
  signatureStatus.textContent = '';
  claimList.replaceChildren();
  copyButtons.forEach((button) => { button.disabled = true; });
}

function renderClaims(claims) {
  claimList.replaceChildren();
  for (const claim of claims) {
    const item = document.createElement('li');
    item.className = 'jwt-claim';
    item.dataset.kind = claim.valid ? (claim.warning ? 'warning' : 'success') : 'error';

    const term = document.createElement('dt');
    term.textContent = claim.claim;
    const detail = document.createElement('dd');
    const value = document.createElement('span');
    value.className = 'jwt-claim-value';
    value.textContent = claim.present ? (claim.valid ? `${claim.valueText} seconds` : claim.valueText) : claim.valueText;
    const claimStatus = document.createElement('span');
    claimStatus.className = 'jwt-claim-status';
    claimStatus.textContent = claim.status;
    detail.append(value);
    if (claim.dateUtc) {
      const date = document.createElement('span');
      date.className = 'jwt-claim-date';
      date.textContent = `UTC: ${claim.dateUtc}`;
      detail.append(date);
    }
    detail.append(claimStatus);
    if (claim.warning) {
      const note = document.createElement('p');
      note.className = 'jwt-claim-note';
      note.textContent = claim.warning;
      detail.append(note);
    }
    item.append(term, detail);
    claimList.append(item);
  }
}

function decode() {
  clearResult();
  try {
    const decoded = decodeJwt(input.value);
    const timeClaims = evaluateTimeClaims(decoded.payload, Math.floor(Date.now() / 1000));
    headerOutput.value = decoded.headerText;
    payloadOutput.value = decoded.payloadText;
    signatureStatus.textContent = decoded.signature.empty
      ? 'Signature segment: empty. Signature status: Unverified.'
      : `Signature segment: present (${decoded.signature.encodedLength} Base64URL characters). Signature status: Unverified.`;
    renderClaims(timeClaims);
    result.hidden = false;
    copyButtons.forEach((button) => { button.disabled = false; });
    setStatus(status, {
      kind: 'success',
      message: 'Decoded successfully. Signature remains Unverified; time claim statuses do not establish token validity.',
    });
    return true;
  } catch (error) {
    const message = error.code === 'INPUT_TOO_LARGE'
      ? 'Token exceeds the 5 MiB UTF-8 input limit.'
      : error.code === 'OUTPUT_TOO_LARGE'
        ? error.message
        : error.message || 'Could not decode this JWT.';
    setStatus(status, { kind: 'error', message });
    input.focus();
    return false;
  }
}

decodeButton.addEventListener('click', decode);
input.addEventListener('input', () => {
  clearResult();
  setStatus(status, { kind: 'idle', message: 'Input changed. Decode again to update the results.' });
});
exampleButton.addEventListener('click', () => {
  input.value = EXAMPLE_TOKEN;
  decode();
});
clearButton.addEventListener('click', () => {
  input.value = '';
  clearResult();
  setStatus(status, { kind: 'idle', message: 'Cleared. Paste a compact JWT to get started.' });
  input.focus();
});
copyButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const output = document.getElementById(button.dataset.copy);
    await copyText(output.value, status);
  });
});

for (const button of [decodeButton, exampleButton, clearButton]) button.disabled = false;
