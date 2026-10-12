import {setStatus,copyText,downloadText} from '../tools/shared/ui.js';
import {assertTextSize,MAX_TEXT_BYTES} from '../tools/shared/limits.js';
const jsonInput=document.querySelector('#json-input'),queryInput=document.querySelector('#query-input'),output=document.querySelector('#matches-output'),count=document.querySelector('#match-count');
const runButton=document.querySelector('#run-query'),example=document.querySelector('#example'),clear=document.querySelector('#clear'),cancel=document.querySelector('#cancel'),copy=document.querySelector('#copy'),download=document.querySelector('#download'),status=document.querySelector('#status');
let worker=null,sequence=0,timer=null,currentOutput='';
function end(){clearTimeout(timer);timer=null;worker?.terminate();worker=null;}
function invalidate(message='Input changed. Run the query again to refresh the result.') {sequence++;end();currentOutput='';output.value='';count.textContent='';copy.disabled=download.disabled=cancel.disabled=true;runButton.disabled=false;setStatus(status,{kind:'idle',message});}
function run(){invalidate('Checking JSON and evaluating the selector in a local worker…');const id=sequence;
  try{assertTextSize(jsonInput.value,MAX_TEXT_BYTES);assertTextSize(queryInput.value,4096);}catch(error){setStatus(status,{kind:'error',message:error.message});return;}
  let active;try{active=new Worker('./worker.js',{type:'module'});worker=active;}catch{setStatus(status,{kind:'error',message:'A local JSONPath worker is not available in this browser.'});return;}
  runButton.disabled=true;cancel.disabled=false;timer=setTimeout(()=>{if(id!==sequence)return;end();cancel.disabled=true;runButton.disabled=false;setStatus(status,{kind:'error',message:'The query exceeded the 2-second worker limit. Narrow it and try again.'});},2000);
  active.onmessage=event=>{if(id!==sequence||active!==worker)return;end();runButton.disabled=false;cancel.disabled=true;const data=event.data||{};
    if(!data.ok){const position=data.line?` (line ${data.line}, column ${data.column})`:'';setStatus(status,{kind:'error',message:`${data.code||'PROCESSING_ERROR'}${position}: ${data.message||'The query could not be completed.'}`});return;}
    currentOutput=data.output;output.value=data.output;count.textContent=`${data.count.toLocaleString('en-US')} match${data.count===1?'':'es'}`;copy.disabled=download.disabled=false;setStatus(status,{kind:'success',message:data.count===0?'No matches found.':'Query complete. Results contain only JSON member paths and values.'});
  };
  active.onerror=()=>{if(id!==sequence)return;end();cancel.disabled=true;runButton.disabled=false;setStatus(status,{kind:'error',message:'The local JSONPath worker failed. No partial results were shown.'});};
  active.postMessage({id,jsonText:jsonInput.value,queryText:queryInput.value});
}
jsonInput.addEventListener('input',()=>invalidate());queryInput.addEventListener('input',()=>invalidate());runButton.addEventListener('click',run);
example.addEventListener('click',()=>{jsonInput.value=JSON.stringify({store:{book:[{title:'A',price:8},{title:'B',price:12},{title:'C',price:5}],bicycle:{price:19}},active:false,empty:null},null,2);queryInput.value='$.store.book[*].title';invalidate('Example loaded. Select Run query to inspect matching values and paths.');jsonInput.focus();});
clear.addEventListener('click',()=>{jsonInput.value='';queryInput.value='';invalidate('JSON and query cleared.');jsonInput.focus();});cancel.addEventListener('click',()=>{invalidate('Query cancelled. Your input is unchanged.');jsonInput.focus();});
copy.addEventListener('click',async()=>{if(currentOutput)await copyText(currentOutput,status);});download.addEventListener('click',()=>{if(currentOutput)downloadText(currentOutput,'jsonpath-matches.json','application/json;charset=utf-8');});
for(const b of [example,clear,cancel,copy,download])b.disabled=false;cancel.disabled=copy.disabled=download.disabled=true;
