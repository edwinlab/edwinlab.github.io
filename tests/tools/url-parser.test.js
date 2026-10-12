import { test, assert, equal, deepEqual, throws, run } from './harness.js';
import { parseWebURL, rebuildURL } from '../../url-parser/logic.js';
test('Parses canonical host, default port, ordered duplicate query keys, and fragment',()=>{const p=parseWebURL('https://EXAMPLE.com:443/a?name=A%20B&name=C#top');equal(p.hostname,'example.com');equal(p.port,'');deepEqual(p.query,[['name','A B'],['name','C']]);equal(rebuildURL(p,p.query),'https://example.com/a?name=A+B&name=C#top');});
test('Rebuild preserves empty keys and values while normalizing a bare flag',()=>{const p=parseWebURL('https://example.com/?flag&=empty&a=');deepEqual(p.query,[['flag',''],['','empty'],['a','']]);equal(rebuildURL(p,p.query),'https://example.com/?flag=&=empty&a=');});
test('Query spaces, literal plus signs, and Unicode round-trip as distinct values',()=>{const p=parseWebURL('https://example.com/?q=a+b&literal=a%2Bb&word=%F0%9F%98%80');deepEqual(p.query,[['q','a b'],['literal','a+b'],['word','😀']]);equal(rebuildURL(p,p.query),'https://example.com/?q=a+b&literal=a%2Bb&word=%F0%9F%98%80');});
test('Only HTTP(S) absolute URLs without user information are allowed',()=>{throws(()=>parseWebURL('/path'),'INVALID_URL');throws(()=>parseWebURL('javascript:alert(1)'),'UNSUPPORTED_PROTOCOL');throws(()=>parseWebURL('https://user:pass@example.com/'),'USERINFO_NOT_ALLOWED');});
test('Malformed percent escapes and invalid UTF-8 query bytes fail',()=>{throws(()=>parseWebURL('https://example.com/?a=%'),'INVALID_QUERY_ENCODING');throws(()=>parseWebURL('https://example.com/?a=%FF'),'INVALID_QUERY_ENCODING');});
test('No lookup is performed by parse and row order remains deterministic',()=>{const p=parseWebURL('https://example.com/?b=2&a=1&b=3');assert(p.query.map(x=>x[0]).join(',')==='b,a,b');});
await run();
