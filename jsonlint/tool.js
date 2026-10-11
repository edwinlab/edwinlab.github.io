import { formatJSON, minifyJSON, validateJSON } from './logic.js';
import { assertTextSize, MAX_OUTPUT_BYTES } from '../tools/shared/limits.js';
import { copyText, downloadText, setStatus } from '../tools/shared/ui.js';

const input = document.querySelector('#json-input');
const result = document.querySelector('#json-result');
const indent = document.querySelector('#indent');
const status = document.querySelector('#status');
const validateButton = document.querySelector('#validate');
const formatButton = document.querySelector('#format');
const minifyButton = document.querySelector('#minify');
const copyButton = document.querySelector('#copy');
const downloadButton = document.querySelector('#download');
const jumpButton = document.querySelector('#jump-error');
const clearButton = document.querySelector('#clear');
const processButtons = [validateButton, formatButton, minifyButton, document.querySelector('#valid-example'), document.querySelector('#invalid-example'), clearButton];
let resultKind = null;
let errorOffset = null;
let staleMessageTimer;

function setResultAvailable(available) {
  copyButton.disabled = !available;
  downloadButton.disabled = !available;
}
function clearResult() {
  result.value = '';
  resultKind = null;
  errorOffset = null;
  jumpButton.hidden = true;
  input.removeAttribute('aria-invalid');
  setResultAvailable(false);
}
function readyMessage() {
  setStatus(status, { kind: 'idle', message: 'Input changed. Run an action to update the result.' });
}
function lineColumnOffset(text, line, column) {
  let offset = 0, currentLine = 1;
  while (offset < text.length && currentLine < line) {
    if (text[offset] === '\r' && text[offset + 1] === '\n') offset += 2;
    else offset++;
    if (text[offset - 1] === '\n' || text[offset - 1] === '\r') currentLine++;
  }
  return Math.min(text.length, offset + Math.max(0, column - 1));
}
function friendlyMessage(message) {
  const hints = {
    PropertyNameExpected: 'Expected a property name in double quotes. Check for a trailing comma or unquoted key.',
    ValueExpected: 'Expected a JSON value here. Check for a missing value or comma.',
    ColonExpected: 'Expected a colon between the property name and its value.',
    CommaExpected: 'Expected a comma between JSON properties or array items.',
    CloseBraceExpected: 'Expected a closing brace to finish this object.',
    CloseBracketExpected: 'Expected a closing bracket to finish this array.',
    InvalidSymbol: 'Unexpected character. Check this token, its quotes, and nearby separators.',
    UnexpectedEndOfString: 'This string is missing its closing double quote.',
    UnexpectedEndOfComment: 'JSON does not allow comments. Remove the comment and try again.',
    EndOfFileExpected: 'There is extra content after the single JSON value.',
    UnexpectedEndOfFile: 'The JSON value ends before its object, array, or string is complete.'
  };
  return hints[message] || message;
}
function showError(error) {
  clearResult();
  const isInputError = Number.isInteger(error.offset) && Number.isInteger(error.line) && Number.isInteger(error.column);
  if (isInputError) {
    errorOffset = lineColumnOffset(input.value, error.line, error.column);
    jumpButton.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    setStatus(status, { kind: 'error', message: `Line ${error.line}, column ${error.column}: ${friendlyMessage(error.message || 'Check this JSON value.')}` });
    input.focus();
    input.setSelectionRange(errorOffset, Math.min(input.value.length, errorOffset + 1));
  } else {
    setStatus(status, { kind: 'error', message: error.message || 'The operation could not be completed.' });
  }
}
function clearStaleForInputChange() {
  clearTimeout(staleMessageTimer);
  clearResult();
  input.removeAttribute('aria-invalid');
  setStatus(status, { kind: 'idle', message: '' });
  staleMessageTimer = setTimeout(readyMessage, 180);
}
function cancelPendingStaleMessage() {
  clearTimeout(staleMessageTimer);
  staleMessageTimer = undefined;
}
function validate() {
  cancelPendingStaleMessage();
  const validation = validateJSON(input.value);
  clearResult();
  if (!validation.valid) {
    showError(validation.error);
    return false;
  }
  setStatus(status, { kind: 'success', message: 'Valid JSON syntax. Schema and consumer behavior are not checked.' });
  return true;
}
function transform(kind) {
  cancelPendingStaleMessage();
  clearResult();
  try {
    assertTextSize(input.value);
    const output = kind === 'format' ? formatJSON(input.value, { indent: Number(indent.value) }) : minifyJSON(input.value);
    assertTextSize(output, MAX_OUTPUT_BYTES);
    result.value = output;
    resultKind = kind;
    input.removeAttribute('aria-invalid');
    setResultAvailable(output.length > 0);
    jumpButton.hidden = true;
    setStatus(status, { kind: 'success', message: kind === 'format' ? `JSON formatted with ${indent.value}-space indentation.` : 'JSON minified successfully.' });
  } catch (error) { showError(error); }
}
validateButton.addEventListener('click', validate);
formatButton.addEventListener('click', () => transform('format'));
minifyButton.addEventListener('click', () => transform('minify'));
input.addEventListener('input', clearStaleForInputChange);
indent.addEventListener('change', clearStaleForInputChange);
jumpButton.addEventListener('click', () => {
  if (errorOffset === null) return;
  input.focus();
  input.setSelectionRange(errorOffset, Math.min(input.value.length, errorOffset + 1));
});
copyButton.addEventListener('click', () => {
  if (resultKind && result.value) void copyText(result.value, status);
});
downloadButton.addEventListener('click', () => {
  if (!resultKind || !result.value) return;
  const filename = resultKind === 'format' ? 'formatted.json' : 'minified.json';
  try {
    downloadText(result.value, filename, 'application/json;charset=utf-8');
    setStatus(status, { kind: 'success', message: `Downloading ${filename}.` });
  } catch {
    setStatus(status, { kind: 'error', message: 'The download could not be started. Select and copy the result instead.' });
  }
});
document.querySelector('#valid-example').addEventListener('click', () => {
  cancelPendingStaleMessage();
  input.value = '{\n  "service": "profile-api",\n  "enabled": true,\n  "retryLimit": 3,\n  "regions": ["Jakarta", "Singapore"]\n}';
  clearResult();
  input.removeAttribute('aria-invalid');
  setStatus(status, { kind: 'idle', message: 'Valid example loaded. Choose Validate JSON, Format, or Minify.' });
  input.focus();
});
document.querySelector('#invalid-example').addEventListener('click', () => {
  cancelPendingStaleMessage();
  input.value = '{\n  "service": "profile-api",\n  "enabled": true,\n}';
  clearResult();
  input.removeAttribute('aria-invalid');
  setStatus(status, { kind: 'idle', message: 'Invalid example loaded with a trailing comma. Run Validate JSON to see its location.' });
  input.focus();
});
clearButton.addEventListener('click', () => {
  clearTimeout(staleMessageTimer);
  input.value = '';
  clearResult();
  setStatus(status, { kind: 'idle', message: 'Cleared. Paste JSON to get started.' });
  input.focus();
});
processButtons.forEach(button => { button.disabled = false; });
setStatus(status, { kind: 'idle', message: 'Ready. Choose an action to check your JSON.' });
