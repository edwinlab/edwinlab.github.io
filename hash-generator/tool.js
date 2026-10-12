import { copyText, downloadText, setStatus } from '../tools/shared/ui.js';
import { encodeHashText, validateAlgorithm, expectedHexLength } from './logic.js';
const $ = s => document.querySelector(s);
const text = $('#hash-text'), file = $('#hash-file'), mode = $('#mode'), algorithm = $('#algorithm'), result = $('#result'), status = $('#status');
const run = $('#generate'), cancel = $('#cancel'), copy = $('#copy'), download = $('#download');
let request = 0, worker = null, timer = 0, valid = false;
function stop(message = 'Input changed. Generate a new hash to continue.') {
  request++; clearTimeout(timer); worker?.terminate(); worker = null; valid = false; result.value = ''; copy.disabled = download.disabled = true;
  run.disabled = false; cancel.disabled = true; setStatus(status, { kind: 'idle', message });
}
function syncMode() { const isText = mode.value === 'text'; text.disabled = !isText; file.disabled = isText; }
function setResult(value, id, alg) {
  if (id !== request) return;
  if (value.length !== expectedHexLength(alg)) { setStatus(status, { kind: 'error', message: 'The browser returned an unexpected digest.' }); return; }
  result.value = value; valid = true; copy.disabled = download.disabled = false; cancel.disabled = true;
  setStatus(status, { kind: 'success', message: `${alg} hash generated.` });
}
run.addEventListener('click', async () => {
  stop(''); const id = request, alg = algorithm.value, selectedMode = mode.value;
  try {
    if (!window.isSecureContext || !crypto.subtle?.digest || !window.Worker) throw Object.assign(new Error('Hashing requires Web Crypto and workers in a secure context such as HTTPS.'),{code:'CRYPTO_UNAVAILABLE'});
    validateAlgorithm(alg);
    let payload = { id, algorithm: alg, mode: selectedMode };
    if (selectedMode === 'text') { encodeHashText(text.value); payload.text = text.value; }
    else {
      const selected = file.files?.[0]; if (!selected) throw Object.assign(new Error('Choose a file first.'), { code: 'EMPTY_FILE' });
      if (selected.size > 20 * 1024 * 1024) throw Object.assign(new Error('File limit: 20 MiB.'), { code: 'INPUT_TOO_LARGE' });
      payload.file = selected;
    }
    worker = new Worker('./worker.js', { type: 'module' }); cancel.disabled = false; run.disabled = true;
    worker.onmessage = ({ data }) => { if (data.id !== request) return; clearTimeout(timer); worker?.terminate(); worker = null; run.disabled = false; if (data.error) setStatus(status, { kind: 'error', message: data.error.message }); else setResult(data.digest, id, alg); };
    worker.onerror = () => { if (id !== request) return; stop('The local worker could not finish.'); run.disabled = false; setStatus(status, { kind: 'error', message: 'Hashing failed in this browser.' }); };
    timer = setTimeout(() => { if (id === request) { stop('Hashing timed out. Try a smaller input.'); run.disabled = false; setStatus(status, { kind: 'error', message: 'Hashing exceeded the 10-second limit.' }); } }, 10000);
    worker.postMessage(payload);
  } catch (error) { run.disabled = false; setStatus(status, { kind: 'error', message: error.message }); }
});
cancel.addEventListener('click', () => { stop('Hashing cancelled.'); run.disabled = false; });
for (const element of [text, file, mode, algorithm]) element.addEventListener('input', () => { stop(); syncMode(); });
mode.addEventListener('change', () => { stop(); syncMode(); });
$('#example').addEventListener('click', () => { mode.value = 'text'; text.value = 'abc'; file.value = ''; syncMode(); stop('Example loaded. Select Generate hash.'); });
$('#clear').addEventListener('click', () => { text.value = ''; file.value = ''; mode.value = 'text'; algorithm.value = 'SHA-256'; syncMode(); stop('Cleared.'); });
copy.addEventListener('click', () => { if (valid) void copyText(result.value, status); });
download.addEventListener('click', () => { if (!valid) return; downloadText(`${result.value}\n`, `${algorithm.value.toLowerCase()}.txt`); });
syncMode(); run.disabled = cancel.disabled = false;
