import { createRegexRunner } from './worker-client.js';
import { setStatus, copyText } from '../tools/shared/ui.js';
const pattern = document.querySelector('#pattern'), input = document.querySelector('#input');
const flags = [...document.querySelectorAll('[data-flag]')];
const status = document.querySelector('#status'), runButton = document.querySelector('#run'), cancelButton = document.querySelector('#cancel');
const results = document.querySelector('#results'), highlight = document.querySelector('#highlight'), rows = document.querySelector('#match-rows');
const copyMatches = document.querySelector('#copy-matches');
const runner = createRegexRunner();
let revision = 0, current = null;
function reset(message = 'Input changed. Run the regex to update results.') {
  revision++; runner.cancel(); current = null; results.hidden = true; rows.replaceChildren(); highlight.replaceChildren();
  copyMatches.disabled = true; runButton.disabled = false; cancelButton.disabled = true;
  setStatus(status, { kind: 'idle', message });
}
for (const control of [pattern, input, ...flags]) control.addEventListener(control.type === 'checkbox' ? 'change' : 'input', () => reset());
function render(result, text) {
  let offset = 0;
  const fragment = document.createDocumentFragment();
  for (const [matchNumber, match] of result.matches.entries()) {
    fragment.append(document.createTextNode(text.slice(offset, match.index)));
    const mark = document.createElement('mark');
    mark.textContent = match.value || '│';
    mark.title = `Match at UTF-16 index ${match.index}${match.value ? '' : ' (zero-length)'}`;
    if (!match.value) { mark.className = 'regex-zero'; mark.setAttribute('aria-label', `Zero-length match at index ${match.index}`); }
    fragment.append(mark); offset = match.end;
    const row = document.createElement('tr');
    for (const content of [String(matchNumber + 1), `${match.index}–${match.end}`, match.value || '(zero-length)', match.groups.map(group => `Group ${group.number}: ${group.matched ? JSON.stringify(group.value) : 'Not matched'}`).join('\n') || 'None', match.namedGroups.map(group => `${group.name}: ${group.matched ? JSON.stringify(group.value) : 'Not matched'}`).join('\n') || 'None']) {
      const cell = document.createElement('td'); cell.textContent = content; row.append(cell);
    }
    rows.append(row);
  }
  fragment.append(document.createTextNode(text.slice(offset))); highlight.replaceChildren(fragment); results.hidden = false;
}
async function run() {
  reset('Running in an isolated worker…'); const request = revision, text = input.value;
  runButton.disabled = true; cancelButton.disabled = false;
  try {
    const result = await runner.run({ pattern: pattern.value, flags: flags.filter(control => control.checked).map(control => control.dataset.flag).join(''), text });
    if (request !== revision) return;
    current = result; render(result, text); copyMatches.disabled = result.matches.length === 0;
    setStatus(status, { kind: result.limited ? 'warning' : 'success', message: result.limited ? `Results limited. ${result.matches.length} matches shown. ${result.limitReason}` : result.matches.length ? `${result.matches.length} matches. Positions use JavaScript UTF-16 indices.` : 'No matches. Try adjusting the pattern, flags, or test text.' });
  } catch (error) {
    if (request !== revision) return;
    setStatus(status, { kind: error.code === 'CANCELLED' ? 'idle' : 'error', message: error.message });
  } finally { if (request === revision) { runButton.disabled = false; cancelButton.disabled = true; } }
}
runButton.addEventListener('click', run);
cancelButton.addEventListener('click', () => reset('Cancelled. The worker was stopped.'));
for (const editor of [pattern, input]) editor.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); run(); } });
document.querySelector('#copy-pattern').addEventListener('click', () => copyText(pattern.value, status));
copyMatches.addEventListener('click', () => { if (current) copyText(JSON.stringify(current.matches, (_key, value) => value === undefined ? null : value, 2), status); });
document.querySelector('#clear').addEventListener('click', () => { pattern.value = ''; input.value = ''; reset('Cleared. An empty pattern is valid; enter test text or choose an example.'); pattern.focus(); });
for (const example of document.querySelectorAll('[data-pattern]')) example.addEventListener('click', () => {
  pattern.value = example.dataset.pattern; input.value = example.dataset.text;
  for (const control of flags) control.checked = example.dataset.flags.includes(control.dataset.flag);
  reset('Example loaded. Run the regex to see matches.'); pattern.focus();
});
window.addEventListener('pagehide', () => runner.cancel());
if (typeof Worker === 'undefined') { runButton.disabled = true; setStatus(status, { kind: 'error', message: 'Web Workers are unavailable. Regex matching requires a browser with Web Worker support.' }); }
