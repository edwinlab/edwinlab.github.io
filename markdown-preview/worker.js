import {marked,Renderer} from '/tools/vendor/marked/marked.esm.js';
const MARKDOWN_INPUT_LIMIT=256*1024,MAX_TOKENS=20000,MAX_DEPTH=100;

function inspectTokenTree(tokens){
  const stack=[{list:tokens,depth:1}];let count=0;
  while(stack.length){const {list,depth}=stack.pop();if(depth>MAX_DEPTH)throw Object.assign(new Error(`Markdown nesting exceeds ${MAX_DEPTH} levels.`),{code:'MAX_DEPTH'});
    for(const token of list||[]){if(++count>MAX_TOKENS)throw Object.assign(new Error(`Markdown exceeds ${MAX_TOKENS.toLocaleString('en-US')} tokens.`),{code:'TOO_MANY_TOKENS'});
      if(Array.isArray(token.tokens))stack.push({list:token.tokens,depth:depth+1});
      if(Array.isArray(token.items))for(const item of token.items)stack.push({list:[item],depth:depth+1});
    }
  }
  return count;
}

const escape=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const renderer=new Renderer();
renderer.html=token=>escape(token.text);
renderer.link=token=>`<span>${renderer.parser.parseInline(token.tokens||[])}</span>`;
renderer.image=token=>`<span>[Image: ${escape(token.text||'')}]</span>`;
renderer.listitem=token=>{
  const contentTokens=(token.tokens||[]).filter(item=>item.type!=='checkbox');
  const content=renderer.parser.parse(contentTokens);
  return `<li>${token.task?`[${token.checked?'x':' '}] `:''}${content}</li>`;
};
self.onmessage=event=>{
  const {id,text}=event.data||{};
  try{
    if(typeof text!=='string')throw Object.assign(new Error('Markdown text is required.'),{code:'INVALID_INPUT'});
    if(new TextEncoder().encode(text).byteLength>MARKDOWN_INPUT_LIMIT)throw Object.assign(new Error('Markdown input is limited to 256 KiB UTF-8.'),{code:'INPUT_TOO_LARGE'});
    const tokens=marked.lexer(text,{gfm:true,breaks:false});const tokenCount=inspectTokenTree(tokens);
    const html=marked.parser(tokens,{gfm:true,breaks:false,async:false,renderer});
    self.postMessage({id,ok:true,html,tokenCount});
  }catch(error){self.postMessage({id,ok:false,code:error.code||'PROCESSING_ERROR',message:error.message||'Unable to preview this Markdown.'});}
};
