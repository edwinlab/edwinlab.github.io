import { setStatus, copyText, downloadText } from '../tools/shared/ui.js';
import { assertTextSize } from '../tools/shared/limits.js';

const left = document.querySelector('#left-text'), right = document.querySelector('#right-text');
const compare = document.querySelector('#compare'), swap = document.querySelector('#swap'), example = document.querySelector('#example'), clear = document.querySelector('#clear'), cancel = document.querySelector('#cancel'), copy = document.querySelector('#copy-report'), download = document.querySelector('#download-report');
const status = document.querySelector('#status'), summary = document.querySelector('#summary'), rows = document.querySelector('#diff-rows'), resultPanel = document.querySelector('#results');
let activeWorker = null, requestId = 0, timer = null, currentReport = '';

function terminate() { clearTimeout(timer); timer = null; activeWorker?.terminate(); activeWorker = null; }
function invalidate(message = 'Input changed. Compare again to refresh the result.') {
  requestId++; terminate(); currentReport = ''; rows.replaceChildren(); summary.textContent = ''; resultPanel.hidden = true; copy.disabled = true; download.disabled = true; compare.disabled = false; cancel.disabled = true;
  setStatus(status, { kind: 'idle', message });
}
function display(result) {
  rows.replaceChildren();
  for (const row of result.rows) {
    const line = document.createElement('div'); line.className = `diff-line diff-${row.kind}`; line.dataset.kind = row.kind;
    const mark = document.createElement('span'); mark.className = 'diff-mark'; mark.textContent = row.kind === 'added' ? '+' : row.kind === 'removed' ? '−' : ' ';
    const number = document.createElement('span'); number.className = 'diff-number'; number.textContent = row.oldLine === null ? `new ${row.newLine}` : row.newLine === null ? `old ${row.oldLine}` : `${row.oldLine} / ${row.newLine}`;
    const text = document.createElement('span'); text.className = 'diff-text'; text.textContent = row.text || ' ';
    const ending = document.createElement('span'); ending.className = 'diff-ending'; ending.textContent = row.ending === 'NONE' ? 'No final newline' : row.ending === 'CRLF' ? 'CRLF' : row.ending === 'CR' ? 'CR' : '';
    line.append(mark, number, text, ending); rows.append(line);
  }
  summary.textContent = `${result.summary.added} added · ${result.summary.removed} removed · ${result.summary.unchanged} unchanged`;
  resultPanel.hidden = false;
}
function runComparison() {
  invalidate('Comparing in a local worker…');
  const id = requestId;
  try { assertTextSize(left.value, 512 * 1024); assertTextSize(right.value, 512 * 1024); }
  catch (error) { setStatus(status,{kind:'error',message:error.message}); return; }
  compare.disabled = true; cancel.disabled = false;
  let worker;
  try { worker = new Worker('./worker.js'); activeWorker = worker; }
  catch { compare.disabled=false; cancel.disabled=true; setStatus(status,{kind:'error',message:'A local Web Worker is not available in this browser.'}); return; }
  timer = setTimeout(() => { if (id !== requestId) return; terminate(); compare.disabled=false; cancel.disabled=true; setStatus(status,{kind:'error',message:'The comparison exceeded its 4-second limit. Reduce the input or make fewer changes.'}); }, 4000);
  worker.onmessage = event => {
    if (id !== requestId || worker !== activeWorker) return;
    clearTimeout(timer); timer=null; activeWorker=null; worker.terminate(); compare.disabled=false; cancel.disabled=true;
    if (!event.data?.ok) { currentReport=''; copy.disabled=true;download.disabled=true;setStatus(status,{kind:'error',message:event.data?.message || 'Unable to compare these texts.'});return; }
    currentReport=event.data.report; display(event.data.result); copy.disabled=false;download.disabled=false;
    setStatus(status,{kind:'success',message:currentReport.includes('\nAdded: 0\nRemoved: 0\n')?'No differences found.':'Comparison complete.'});
  };
  worker.onerror = () => { if(id!==requestId)return; terminate();compare.disabled=false;cancel.disabled=true;setStatus(status,{kind:'error',message:'The local diff worker failed. Your input is unchanged; try a smaller comparison.'}); };
  worker.postMessage({id,left:left.value,right:right.value});
}

for (const input of [left,right]) input.addEventListener('input',()=>invalidate());
compare.addEventListener('click',runComparison);
swap.addEventListener('click',()=>{[left.value,right.value]=[right.value,left.value];invalidate('Inputs swapped. Compare to view the result.');left.focus();});
example.addEventListener('click',()=>{left.value='status: pending\namount: 1200\nregion: west';right.value='status: paid\namount: 1200\nregion: west\nreceipt: R-42';invalidate('Example loaded. Compare to view the result.');left.focus();});
clear.addEventListener('click',()=>{left.value='';right.value='';invalidate('Inputs cleared.');left.focus();});
cancel.addEventListener('click',()=>{invalidate('Comparison cancelled. Your input is unchanged.');left.focus();});
copy.addEventListener('click',async()=>{if(currentReport)await copyText(currentReport,status);});
download.addEventListener('click',()=>{if(currentReport)downloadText(currentReport,'text-diff-report.txt','text/plain;charset=utf-8');});
for(const button of [compare,swap,example,clear,cancel,copy,download])button.disabled=false;
cancel.disabled=true;copy.disabled=true;download.disabled=true;
