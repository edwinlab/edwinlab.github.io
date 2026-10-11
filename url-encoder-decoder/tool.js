import { parseQuery, transformUri } from './logic.js';
import { copyText, setStatus } from '../tools/shared/ui.js';

const input = document.querySelector('#input');
const output = document.querySelector('#output');
const mode = document.querySelector('#mode');
const direction = document.querySelector('#direction');
const directionControl = document.querySelector('#direction-control');
const help = document.querySelector('#mode-help');
const outputPanel = document.querySelector('#uri-output-panel');
const queryTablePanel = document.querySelector('#query-results');
const queryRows = document.querySelector('#query-rows');
const processButton = document.querySelector('#process');
const exampleButton = document.querySelector('#example');
const clearButton = document.querySelector('#clear');
const copyButton = document.querySelector('#copy');
const status = document.querySelector('#status');
let queryJson = '';

const guidance = {
  component: 'Encode one value or decode one component. Plus signs stay literal; use %2B for a plus in a component.',
  whole: 'Encode or decode a whole URI. Reserved separators remain escaped on decode; this does not validate or normalize a URL.',
  query: 'Paste raw query text, an optional leading ?, or an absolute HTTP(S) URL. Form query rules treat + as a space and %2B as a literal plus.',
};

function syncMode() {
  const isQuery = mode.value === 'query';
  directionControl.hidden = isQuery;
  outputPanel.hidden = isQuery;
  queryTablePanel.hidden = !isQuery;
  copyButton.textContent = isQuery ? 'Copy query as JSON' : 'Copy output';
  help.textContent = guidance[mode.value];
}

function invalidate(message = 'Input or settings changed. Process again to update the result.') {
  output.value = '';
  queryRows.replaceChildren();
  queryJson = '';
  copyButton.disabled = true;
  setStatus(status, { kind: 'idle', message });
}

function process() {
  invalidate('');
  try {
    if (mode.value === 'query') {
      const pairs = parseQuery(input.value);
      queryJson = JSON.stringify(pairs, null, 2);
      pairs.forEach((pair, index) => {
        const row = document.createElement('tr');
        const number = document.createElement('td');
        const key = document.createElement('td');
        const value = document.createElement('td');
        number.textContent = String(index + 1);
        key.textContent = pair.key;
        value.textContent = pair.value;
        row.append(number, key, value);
        queryRows.append(row);
      });
      copyButton.disabled = false;
      setStatus(status, { kind: 'success', message: pairs.length ? `Parsed ${pairs.length} query ${pairs.length === 1 ? 'parameter' : 'parameters'} in order. Repeated keys are preserved.` : 'No query parameters found. The result is an empty array.' });
    } else {
      output.value = transformUri(input.value, mode.value, direction.value);
      copyButton.disabled = false;
      setStatus(status, { kind: 'success', message: `${direction.value === 'encode' ? 'Encoded' : 'Decoded'} successfully as ${mode.value === 'component' ? 'a URL component' : 'a whole URI'}.` });
    }
    return true;
  } catch (error) {
    output.value = '';
    queryRows.replaceChildren();
    queryJson = '';
    copyButton.disabled = true;
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

mode.addEventListener('change', () => { syncMode(); invalidate(); });
direction.addEventListener('change', () => invalidate());
input.addEventListener('input', () => invalidate());
processButton.addEventListener('click', process);
exampleButton.addEventListener('click', () => {
  if (mode.value === 'query') input.value = 'q=a+b&q=a%2Bb&flag';
  else if (mode.value === 'component' && direction.value === 'encode') input.value = 'a b+c/d?e=f';
  else if (mode.value === 'component') input.value = 'a+b%20c';
  else if (direction.value === 'encode') input.value = 'https://example.com/a b?q=x y&lang=id';
  else input.value = 'https://example.com/a%20b?q=x%26y';
  process();
});
clearButton.addEventListener('click', () => {
  input.value = '';
  invalidate('Cleared. Enter a component, URI, or query to get started.');
  input.focus();
});
copyButton.addEventListener('click', async () => {
  await copyText(mode.value === 'query' ? queryJson : output.value, status);
});

syncMode();
for (const control of [mode, direction, processButton, exampleButton, clearButton]) control.disabled = false;
