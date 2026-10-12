import { copyText, downloadText, setStatus } from '../tools/shared/ui.js';
import { convertBases, formatReport } from './logic.js';
const $=s=>document.querySelector(s), input=$('#number-input'), base=$('#input-base'), status=$('#status'); let current=null;
function clearOutput(){current=null; for(const b of [2,8,10,16]) $(`#base-${b}`).value=''; $('#copy').disabled=$('#download').disabled=true; document.querySelectorAll('[data-copy-base]').forEach(button=>button.disabled=true);}
$('#convert').addEventListener('click',()=>{ clearOutput(); try{current=convertBases(input.value,Number(base.value)); for(const b of [2,8,10,16]) $(`#base-${b}`).value=current[b]; $('#copy').disabled=$('#download').disabled=false; document.querySelectorAll('[data-copy-base]').forEach(button=>button.disabled=false);setStatus(status,{kind:'success',message:'Converted with exact integer arithmetic.'});}catch(e){setStatus(status,{kind:'error',message:e.message});} });
for(const e of [input,base]) e.addEventListener('input',()=>{clearOutput();setStatus(status,{kind:'idle',message:'Input changed. Convert again.'});});
$('#example').addEventListener('click',()=>{input.value='9007199254740993';base.value='10';$('#convert').click();});
$('#clear').addEventListener('click',()=>{input.value='';base.value='10';clearOutput();setStatus(status,{kind:'idle',message:'Cleared.'});});
$('#copy').addEventListener('click',()=>{if(current)void copyText(formatReport(current),status);});
document.querySelectorAll('[data-copy-base]').forEach(button=>button.addEventListener('click',()=>{if(current)void copyText(current[button.dataset.copyBase],status);}));
$('#download').addEventListener('click',()=>{if(current)downloadText(`${formatReport(current)}\n`,'number-base-conversion.txt');});
