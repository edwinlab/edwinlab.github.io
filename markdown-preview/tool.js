import {setStatus,copyText,downloadText} from '../tools/shared/ui.js';
const input=document.querySelector('#markdown-input'),preview=document.querySelector('#preview-frame'),source=document.querySelector('#html-output'),renderButton=document.querySelector('#preview'),example=document.querySelector('#example'),clear=document.querySelector('#clear'),cancel=document.querySelector('#cancel'),copy=document.querySelector('#copy'),download=document.querySelector('#download'),status=document.querySelector('#status');
let pipeline=null,available=false,worker=null,seq=0,timer=null,fragment='',documentHtml='';
const EMPTY_DOCUMENT='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'none\'; connect-src \'none\'; img-src \'none\'; media-src \'none\'; font-src \'none\'; object-src \'none\'; frame-src \'none\'; base-uri \'none\'; form-action \'none\'; style-src \'unsafe-inline\'"><title>Markdown preview</title></head><body><p>Preview will appear here after you select Preview Markdown.</p></body></html>';
function terminate(){clearTimeout(timer);timer=null;worker?.terminate();worker=null;}
function reset(message='Input changed. Preview it again to refresh the sanitized result.'){
  seq++;terminate();fragment='';documentHtml='';source.value='';copy.disabled=download.disabled=cancel.disabled=true;preview.srcdoc=EMPTY_DOCUMENT;setStatus(status,{kind:'idle',message});sync();
}
function sync(){renderButton.disabled=!available||!input.value.trim()||Boolean(worker);}
function fail(error){fragment='';documentHtml='';source.value='';copy.disabled=download.disabled=true;preview.srcdoc=EMPTY_DOCUMENT;setStatus(status,{kind:'error',message:error.message||'Safe preview is unavailable.'});sync();}
function run(){reset('Parsing and sanitizing Markdown locally…');if(!available){fail({message:'Safe preview is unavailable in this browser.'});return;}if(!input.value.trim()){setStatus(status,{kind:'idle',message:'Add Markdown text before previewing.'});return;}
  const id=seq;let running;try{running=new Worker('./worker.js',{type:'module'});worker=running;}catch{fail({message:'The local Markdown worker is not available in this browser.'});return;}
  renderButton.disabled=true;cancel.disabled=false;timer=setTimeout(()=>{if(id!==seq)return;terminate();fail({code:'TIMEOUT',message:'Markdown parsing exceeded the 3-second worker limit. Reduce the input and try again.'});},3000);
  running.onmessage=event=>{if(id!==seq||worker!==running)return;terminate();cancel.disabled=true;if(!event.data?.ok){fail({message:event.data?.message||'Markdown parsing failed.'});return;}
    try{fragment=pipeline.sanitizeMarkdownHtml(event.data.html);documentHtml=pipeline.buildSafeDocument(fragment);source.value=fragment;preview.srcdoc=documentHtml;copy.disabled=download.disabled=false;setStatus(status,{kind:'success',message:`Preview ready. ${event.data.tokenCount.toLocaleString('en-US')} Markdown tokens processed; links and images are inert.`});sync();}
    catch(error){fail(error);}
  };
  running.onerror=()=>{if(id!==seq)return;terminate();fail({message:'The Markdown worker failed. No preview or export was created.'});};
  running.postMessage({id,text:input.value});
}
input.addEventListener('input',()=>reset());renderButton.addEventListener('click',run);
example.addEventListener('click',()=>{input.value='# Release notes\n\nA concise **local preview** with a [documentation link](https://example.invalid/docs).\nA soft line break stays a soft break.\n\n## Checklist\n\n- [x] Review the API response\n- [ ] Update the example\n\n| Field | Value |\n| --- | --- |\n| Status | Ready |\n\n```js\nconst status = "ready";\n```\n\n![logo](https://example.invalid/logo.png)';reset('Example loaded. Select Preview Markdown to render a safe preview.');input.focus();});
clear.addEventListener('click',()=>{input.value='';reset('Markdown cleared.');input.focus();});cancel.addEventListener('click',()=>{reset('Preview cancelled. The current input is unchanged.');input.focus();});
copy.addEventListener('click',async()=>{if(fragment)await copyText(fragment,status);});download.addEventListener('click',()=>{if(documentHtml)downloadText(documentHtml,'markdown-preview.html','text/html;charset=utf-8');});
for(const button of [example,clear,cancel,copy,download])button.disabled=false;cancel.disabled=copy.disabled=download.disabled=true;preview.srcdoc=EMPTY_DOCUMENT;
try{const module=await import('./logic.js');pipeline=module;const purifier=module.sanitizeMarkdownHtml('');available=typeof purifier==='string';if(!available)throw new Error();setStatus(status,{kind:'idle',message:'Ready. Add Markdown and select Preview Markdown.'});}
catch{available=false;setStatus(status,{kind:'error',message:'Safe preview is unavailable in this browser. Sanitization must succeed before any preview is shown.'});}
sync();
