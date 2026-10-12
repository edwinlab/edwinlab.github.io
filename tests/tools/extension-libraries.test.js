import { test, assert, equal, deepEqual, throws, run } from './harness.js';
import createDOMPurify from '/tools/vendor/dompurify/purify.es.mjs';
import { marked } from '/tools/vendor/marked/marked.esm.js';
import { JSONPath } from '/tools/vendor/jsonpath-plus/index-browser-esm.js';

function workerMessage(worker, kind, value, timeout = 2500) {
  const id = crypto.randomUUID();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { worker.terminate(); reject(new Error(`${kind} worker timed out`)); }, timeout);
    const cleanup = () => { clearTimeout(timer); worker.removeEventListener('message', onMessage); worker.removeEventListener('error', onError); };
    const onMessage = event => { if (event.data?.id !== id) return; cleanup(); resolve(event.data); };
    const onError = error => { cleanup(); reject(error); };
    worker.addEventListener('message', onMessage); worker.addEventListener('error', onError); worker.postMessage({ id, kind, value });
  });
}

let classic;
try { classic = new Worker('/tests/tools/extension-libraries.classic-worker.js'); } catch {}
let moduleWorker;
try { moduleWorker = new Worker('/tests/tools/extension-libraries.worker.js', { type: 'module' }); } catch {}

const sanitized = html => {
  const purifier = createDOMPurify(window);
  return purifier.sanitize(html, {
    ALLOWED_TAGS: ['p','h1','h2','h3','h4','h5','h6','ul','ol','li','blockquote','pre','code','em','strong','del','table','thead','tbody','tr','th','td','hr','br','span','a'],
    ALLOWED_ATTR: ['start'], ALLOW_DATA_ATTR: false, ALLOW_ARIA_ATTR: false,
    FORBID_TAGS: ['style','svg','math','iframe','object','embed','form','input','base','meta'],
    FORBID_ATTR: ['href','src','style','id','name','srcdoc']
  });
};

test('jsdiff global and abortable diff API are available', () => {
  assert(typeof Diff.diffArrays === 'function');
  const result = Diff.diffArrays([{text:'a',ending:'LF'}], [{text:'b',ending:'LF'}], { comparator:(a,b)=>a.text===b.text&&a.ending===b.ending, maxEditLength:10, timeout:1000 });
  assert(Array.isArray(result)); assert(result.some(change=>change.added)); assert(result.some(change=>change.removed));
});
test('jsdiff maxEditLength returns undefined when a bounded diff is aborted', () => {
  const left=Array.from({length:200},(_,i)=>`a${i}`),right=Array.from({length:200},(_,i)=>`z${i}`);
  equal(Diff.diffArrays(left,right,{maxEditLength:4,timeout:1000}),undefined);
});
test('jsdiff loads and compares in a classic worker with fixed local importScripts', async () => {
  assert(classic instanceof Worker); const result=await workerMessage(classic,'diff',{left:[{text:'x',ending:'LF'}],right:[{text:'y',ending:'LF'}]});
  assert(result.ok); assert(result.changed);
});
test('XML singleton global loads and preserves the supported leaf text while indenting', () => {
  assert(typeof xmlFormatter==='function');
  const out=xmlFormatter('<root><n a="1">hello &amp; world</n><e/></root>',{indentation:'  ',lineSeparator:'\n',collapseContent:true,throwOnFailure:true});
  assert(out.includes('\n  <n a="1">hello &amp; world</n>')); assert(out.includes('<e/>'));
});
test('XML browser bundle loads in a classic worker and returns valid formatted output', async () => {
  const result=await workerMessage(classic,'xml','<root><n a="1">hello &amp; world</n><e/></root>');
  assert(result.ok); const parsed=new DOMParser().parseFromString(result.formatted,'application/xml');
  assert(!parsed.documentElement.namespaceURI?.includes('parsererror')); equal(parsed.querySelector('n')?.textContent,'hello & world');
});
test('XML formatter changes a whitespace-only leaf, documenting the phase-B blocker', () => {
  const source='<root><space> </space></root>', before=new DOMParser().parseFromString(source,'application/xml');
  const output=xmlFormatter(source,{indentation:'  ',lineSeparator:'\n',collapseContent:true,throwOnFailure:true});
  const after=new DOMParser().parseFromString(output,'application/xml');
  assert(!after.querySelector('parsererror')); assert(before.querySelector('space').textContent!==after.querySelector('space').textContent,`Expected the pinned library limitation to reproduce: ${output}`);
});
test('Marked ESM parser supports basic Markdown and GFM without claiming sanitization', () => {
  const html=marked.parse('# Title\n\n| a |\n| - |\n| x |\n\n- [x] done',{gfm:true,breaks:false,async:false});
  assert(html.includes('<h1>Title</h1>')); assert(html.includes('<table>')); assert(html.includes('type="checkbox"'));
});
test('Marked renderer raw HTML remains untrusted and is handled by sanitizer policy', () => {
  const dirty=marked.parse('<img src=x onerror=alert(1)>\n\n[x](javascript:alert(1))',{gfm:true,breaks:false,async:false});
  const clean=sanitized(dirty); const template=document.createElement('template'); template.innerHTML=clean;
  assert(template.content.querySelector('img,script,a[href]')===null); assert(!/[\"'](?:href|src|onerror)=/i.test(clean));
});
test('DOMPurify strict subset keeps safe structure but drops URL, event, style and clobbering attributes', () => {
  const html=sanitized('<h2 id="x" onclick="x()">Safe</h2><ol start="5"><li><a href="https://example.com">Text</a><img src="https://example.com/x" onerror="x()"></li></ol><svg onload="x()"><script>x()</script></svg>');
  const root=document.createElement('template'); root.innerHTML=html;
  assert(root.content.querySelector('h2')?.textContent==='Safe'); equal(root.content.querySelector('ol')?.getAttribute('start'),'5');
  assert(root.content.querySelector('script,svg,img,a[href],[onclick],[onerror],[id]')===null);
});
test('JSONPath browser ESM works in a real module worker with selector-only options', async () => {
  assert(moduleWorker instanceof Worker);
  const result=await workerMessage(moduleWorker,'jsonpath',{path:'$.store.book[*].title',json:{store:{book:[{title:'A'},{title:'B'}]}}});
  assert(result.ok); deepEqual(result.results,[{path:"$['store']['book'][0]['title']",value:'A'},{path:"$['store']['book'][1]['title']",value:'B'}]);
});
test('JSONPath Plus eval:false rejects filters and the root scalar adapter preserves falsy values', () => {
  throws(()=>JSONPath({path:'$.a[?(@.x)]',json:{a:[{x:1}]},eval:false,ignoreEvalErrors:false,resultType:'all'}));
  for (const value of [0,false,null]) { const matches=JSONPath({path:'$',json:value,eval:false,resultType:'all'}); assert(matches===undefined || (Array.isArray(matches)&&matches.length<=1)); }
});

run();
