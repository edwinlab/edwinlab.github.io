import { copyText, setStatus } from '../tools/shared/ui.js';
const $ = s => document.querySelector(s), form = $('#password-form'), output = $('#result'), status = $('#status');
let worker, timer, request = 0, valid = false;
function clearResult(message = 'Settings changed. Generate a new batch.') { request++; clearTimeout(timer); worker?.terminate(); worker = null; valid = false; output.value = ''; $('#copy').disabled = true; $('#generate').disabled = false; $('#cancel').disabled = true; setStatus(status, { kind: 'idle', message }); }
form.addEventListener('input', () => clearResult());
$('#exclude-similar').addEventListener('input', () => clearResult());
$('#generate').addEventListener('click', () => {
  clearResult(''); const id = request;
  try {
    const selected = Object.fromEntries([...form.querySelectorAll('[data-group]')].map(box => [box.dataset.group, box.checked]));
    worker = new Worker('./worker.js', { type: 'module' }); $('#generate').disabled = true; $('#cancel').disabled = false;
    worker.onmessage = ({ data }) => { if (data.id !== request) return; clearTimeout(timer); worker.terminate(); worker = null; $('#generate').disabled = false; $('#cancel').disabled = true; if (data.error) setStatus(status, { kind: 'error', message: data.error.message }); else { output.value = data.passwords.join('\n'); valid = true; $('#copy').disabled = false; setStatus(status, { kind: 'success', message: `${data.passwords.length} password${data.passwords.length === 1 ? '' : 's'} generated with browser secure randomness.` }); } };
    worker.onerror = () => { if (id !== request) return; clearResult('Generation failed.'); $('#generate').disabled = false; setStatus(status, { kind: 'error', message: 'Secure generation failed in this browser.' }); };
    timer = setTimeout(() => { if (id === request) { clearResult('Generation timed out.'); $('#generate').disabled = false; setStatus(status, { kind: 'error', message: 'Generation exceeded the 2-second limit.' }); } }, 2000);
    worker.postMessage({ id, length: $('#length').value, count: $('#count').value, selected, excludeSimilar: $('#exclude-similar').checked });
  } catch (error) { setStatus(status, { kind: 'error', message: error.message }); }
});
$('#cancel').addEventListener('click', () => { clearResult('Generation cancelled.'); $('#generate').disabled = false; $('#cancel').disabled = true; });
$('#example').addEventListener('click', () => { $('#length').value = 20; $('#count').value = 1; form.querySelectorAll('[data-group]').forEach(box => { box.checked = true; }); $('#exclude-similar').checked = true; clearResult('Example settings loaded.'); });
$('#clear').addEventListener('click', () => { $('#length').value = 20; $('#count').value = 1; form.querySelectorAll('[data-group]').forEach(box => { box.checked = true; }); $('#exclude-similar').checked = false; clearResult('Reset to default settings.'); });
$('#copy').addEventListener('click', () => { if (valid) void copyText(output.value, status); });
