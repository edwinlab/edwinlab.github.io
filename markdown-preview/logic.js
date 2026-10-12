import createDOMPurify from '../tools/vendor/dompurify/purify.es.mjs';
import {assertTextSize} from '../tools/shared/limits.js';

export const MARKDOWN_INPUT_LIMIT=256*1024;
export const MARKDOWN_OUTPUT_LIMIT=1024*1024;
export const MARKDOWN_MAX_TOKENS=20000;
export const MARKDOWN_MAX_DEPTH=100;
const encoder=new TextEncoder();
const ALLOWED_TAGS=['p','h1','h2','h3','h4','h5','h6','blockquote','ul','ol','li','pre','code','strong','em','del','hr','br','table','thead','tbody','tr','th','td','span','a'];
const purifier=typeof window==='undefined'?null:createDOMPurify(window);
if(purifier?.addHook)purifier.addHook('uponSanitizeAttribute',(node,data)=>{
  if(data.attrName!=='start'||node.nodeName!=='OL'||!/^[1-9][0-9]{0,8}$/.test(data.attrValue)||Number(data.attrValue)>999999999)data.keepAttr=false;
});

export function sanitizeMarkdownHtml(dirty){
  if(!purifier?.isSupported||typeof purifier.sanitize!=='function')throw Object.assign(new Error('Safe preview is unavailable in this browser.'),{code:'SANITIZER_UNAVAILABLE'});
  try{assertTextSize(dirty,MARKDOWN_OUTPUT_LIMIT);}catch{throw Object.assign(new Error('Rendered Markdown exceeds the 1 MiB output limit.'),{code:'OUTPUT_TOO_LARGE'});}
  let clean;
  try{clean=purifier.sanitize(dirty,{ALLOWED_TAGS,ALLOWED_ATTR:['start'],ALLOW_DATA_ATTR:false,ALLOW_ARIA_ATTR:false,SANITIZE_DOM:true,SANITIZE_NAMED_PROPS:true,FORBID_ATTR:['href','src','srcset','xlink:href','style','id','name','srcdoc','formaction'],FORBID_TAGS:['script','style','form','input','button','iframe','object','embed','svg','math','base','meta','link','video','audio','source','template']});}
  catch{throw Object.assign(new Error('The HTML sanitizer failed. No preview or export was created.'),{code:'SANITIZER_ERROR'});}
  try{assertTextSize(clean,MARKDOWN_OUTPUT_LIMIT);}catch{throw Object.assign(new Error('Sanitized Markdown exceeds the 1 MiB output limit.'),{code:'OUTPUT_TOO_LARGE'});}
  return clean;
}

export function buildSafeDocument(fragment){
  const csp="default-src 'none'; script-src 'none'; connect-src 'none'; img-src 'none'; media-src 'none'; font-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'; style-src 'unsafe-inline'";
  const document=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${csp}"><meta name="referrer" content="no-referrer"><title>Markdown preview</title><style>body{font:16px/1.6 system-ui,sans-serif;max-width:900px;margin:24px auto;padding:0 18px;color:#1f2c26}pre,code{font-family:ui-monospace,monospace;background:#f2f5f3;border-radius:4px}pre{padding:14px;overflow:auto}code{padding:2px 4px}table{border-collapse:collapse;display:block;max-width:100%;overflow:auto}td,th{border:1px solid #b8c4bc;padding:6px 10px;text-align:left}blockquote{border-left:3px solid #15a98e;margin-left:0;padding-left:16px;color:#506057}hr{border:0;border-top:1px solid #ccd5cf}</style></head><body>${fragment}</body></html>`;
  try{assertTextSize(document,MARKDOWN_OUTPUT_LIMIT);}catch{throw Object.assign(new Error('The complete preview document exceeds the 1 MiB export limit.'),{code:'OUTPUT_TOO_LARGE'});}
  return document;
}

export function markdownOutputBytes(value){return encoder.encode(value).byteLength;}
