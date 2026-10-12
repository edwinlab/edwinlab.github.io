import {setStatus,copyText,downloadText} from '../tools/shared/ui.js';
import {inspectXml,verifyFormattedXml} from './logic.js';
const input=document.querySelector('#xml-input'),output=document.querySelector('#xml-output'),indent=document.querySelector('#indent'),consent=document.querySelector('#whitespace-consent');
const formatButton=document.querySelector('#format'),example=document.querySelector('#example'),clear=document.querySelector('#clear'),cancel=document.querySelector('#cancel'),copy=document.querySelector('#copy'),download=document.querySelector('#download'),status=document.querySelector('#status');
let worker=null,seq=0,timer=null,current='';
function endJob(){clearTimeout(timer);timer=null;worker?.terminate();worker=null;}
function reset(message='Input changed. Review the whitespace policy and format again.'){seq++;endJob();current='';output.value='';copy.disabled=download.disabled=cancel.disabled=true;setStatus(status,{kind:'idle',message});sync();}
function sync(){formatButton.disabled=!input.value||!consent.checked||Boolean(worker);}
function start(){reset('Validating XML and formatting in a local worker…');const id=seq;const checked=inspectXml(input.value,{whitespaceConsent:consent.checked});if(!checked.ok){setStatus(status,{kind:checked.code==='WHITESPACE_CONSENT_REQUIRED'?'warning':'error',message:checked.message});return;}
  try{worker=new Worker('./worker.js');}catch{setStatus(status,{kind:'error',message:'A local XML worker is not available in this browser.'});sync();return;}
  const running=worker;cancel.disabled=false;formatButton.disabled=true;
  timer=setTimeout(()=>{if(id!==seq)return;endJob();cancel.disabled=false;cancel.disabled=true;setStatus(status,{kind:'error',message:'XML formatting exceeded its 5-second worker limit. Your input is unchanged.'});sync();},5000);
  running.onmessage=event=>{if(id!==seq||running!==worker)return;endJob();cancel.disabled=true;if(!event.data?.ok){setStatus(status,{kind:'error',message:event.data?.message||'Formatting failed.'});sync();return;}
    const result=verifyFormattedXml(checked.text,event.data.output,{whitespaceConsent:consent.checked});if(!result.ok){setStatus(status,{kind:'error',message:result.message});sync();return;}
    output.value=result.output;current=result.output;copy.disabled=download.disabled=false;setStatus(status,{kind:'success',message:result.bomRemoved?'XML formatted. A leading UTF-8 BOM was removed.':'XML formatted and preservation checks passed.'});sync();
  };
  running.onerror=()=>{if(id!==seq)return;endJob();cancel.disabled=true;setStatus(status,{kind:'error',message:'The XML worker failed. Your input is unchanged.'});sync();};
  running.postMessage({id,text:checked.text,indentation:indent.value,ignoredPaths:checked.ignoredPaths});
}
input.addEventListener('input',()=>reset());indent.addEventListener('change',()=>reset());consent.addEventListener('change',()=>reset(consent.checked?'Whitespace consent recorded. You can format the XML.':'Consent removed. Formatting is disabled until you review and accept the policy.'));
formatButton.addEventListener('click',start);example.addEventListener('click',()=>{input.value='<?xml version="1.0" encoding="UTF-8"?>\n<service>\n  <name>Search API</name>\n  <timeout unit="seconds">30</timeout>\n  <retry enabled="true"/>\n</service>';consent.checked=true;reset('Example loaded. Review the whitespace policy, then select Format XML.');input.focus();});
clear.addEventListener('click',()=>{input.value='';output.value='';consent.checked=false;reset('Input cleared.');input.focus();});cancel.addEventListener('click',()=>{reset('Formatting cancelled. Your input is unchanged.');input.focus();});copy.addEventListener('click',async()=>{if(current)await copyText(current,status);});download.addEventListener('click',()=>{if(current)downloadText(current,'formatted.xml','application/xml;charset=utf-8');});
for(const control of [example,clear,cancel,copy,download])control.disabled=false;cancel.disabled=copy.disabled=download.disabled=true;sync();
