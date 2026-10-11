import { test, assert, equal, deepEqual, throws, run } from './harness.js';
import { MAX_TEXT_BYTES, MAX_OUTPUT_BYTES, MAX_DEPTH, assertTextSize } from '../../tools/shared/limits.js';
import { validateJSON, parseSafeJSON } from '../../tools/shared/json.js';
import { setStatus, copyText, readTextFile, downloadText } from '../../tools/shared/ui.js';
import { createScanner, SyntaxKind, format, applyEdits } from '../../tools/vendor/jsonc-parser/main.js';
import { parseDocument, isMap, isAlias } from '../../tools/vendor/yaml/index.js';
import { Cron } from '../../tools/vendor/croner/croner.js?v=10.0.2-dev.0';

async function rejects(fn, code) {
  try { await fn(); } catch (error) { equal(error.code, code); return error; }
  throw new Error(`Expected rejection ${code}`);
}
const status = () => document.createElement('p');
const nextFrame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

test('Harness compares unordered own keys and distinguishes types', () => {
  deepEqual({ a: 1, b: [true, null] }, { b: [true, null], a: 1 });
  throws(() => deepEqual({ a: undefined }, {}));
  throws(() => deepEqual([], {}));
  throws(() => deepEqual(Array(1), Array(2)));
  throws(() => deepEqual([undefined], Array(1)));
  throws(() => equal(1, '1'));
});
test('Limits use UTF-8 bytes and accept exact boundaries', () => {
  equal(MAX_TEXT_BYTES, 5242880); equal(MAX_OUTPUT_BYTES, 10485760); equal(MAX_DEPTH, 100);
  assertTextSize('😀', 4); throws(() => assertTextSize('😀', 3), 'INPUT_TOO_LARGE');
  assertTextSize('a'.repeat(MAX_TEXT_BYTES));
  throws(() => assertTextSize('a'.repeat(MAX_TEXT_BYTES + 1)), 'INPUT_TOO_LARGE');
  assertTextSize('😀'.repeat(MAX_TEXT_BYTES / 4));
  throws(() => assertTextSize('😀'.repeat(MAX_TEXT_BYTES / 4) + 'a'), 'INPUT_TOO_LARGE');
});
test('Limits reject invalid argument types', () => {
  throws(() => assertTextSize(12)); throws(() => assertTextSize('a', -1));
  throws(() => assertTextSize('a', Infinity));
});
test('Strict JSON accepts all scalar roots and nested objects', () => {
  for (const text of ['0', '-0', 'false', 'null', '"ok"', '{"a":[1,true,null]}']) deepEqual(validateJSON(text), { valid: true });
});
test('Strict JSON rejects comments, trailing commas, empty input, malformed literals and multiple roots', () => {
  for (const text of ['', ' ', '{"a":1,}', '//comment\n{}', '/*x*/{}', "{'a':1}", 'NaN', '01', '{}{}', '"\\x"']) {
    equal(validateJSON(text).valid, false); throws(() => parseSafeJSON(text), 'INVALID_JSON');
  }
});
test('Error locations are one-based for LF and CRLF', () => {
  for (const newline of ['\n', '\r\n']) {
    const text = `{${newline}  "a": @${newline}}`;
    const error = validateJSON(text).error;
    equal(error.line, 2); equal(error.column, 8); equal(error.offset, text.indexOf('@'));
  }
});
test('Depth 100 is accepted and 101 rejected before recursive parsing', () => {
  assert(validateJSON('['.repeat(100) + '0' + ']'.repeat(100)).valid);
  equal(validateJSON('['.repeat(101) + '0' + ']'.repeat(101)).error.code, 'MAX_DEPTH');
  throws(() => parseSafeJSON('['.repeat(101) + '0' + ']'.repeat(101)), 'MAX_DEPTH');
});
test('Large numbers remain valid JSON syntax', () => {
  for (const text of ['9007199254740993', '1e400', '1e-400']) assert(validateJSON(text).valid);
});
test('Semantic JSON rejects unsafe integers, overflow and nonzero underflow', () => {
  for (const text of ['9007199254740993', '-9007199254740993', '9007199254740992.0', '1e20', '1e400', '1e-400', '-1e-400']) throws(() => parseSafeJSON(text), 'UNSAFE_NUMBER');
});
test('Safe numeric boundaries, decimals, strings, zero and negative zero are preserved', () => {
  deepEqual(parseSafeJSON('[9007199254740991,-9007199254740991,1.25,5e-324,0e-400]'), [9007199254740991,-9007199254740991,1.25,5e-324,0]);
  equal(parseSafeJSON('-0'), -0);
  equal(parseSafeJSON('"9007199254740993"'), '9007199254740993');
  equal(parseSafeJSON('"quoted \\" 1e400"'), 'quoted " 1e400');
});
test('Duplicate decoded keys are rejected, including escaped names', () => {
  for (const text of ['{"a":1,"a":2}', '{"a":1,"\\u0061":2}', '{"x":[{"z":1,"z":2}]}']) throws(() => parseSafeJSON(text), 'DUPLICATE_KEY');
  deepEqual(parseSafeJSON('[{"a":1},{"a":2}]'), [{a:1},{a:2}]);
});
test('Prototype-related keys remain own data and do not pollute globals', () => {
  const value = parseSafeJSON('{"__proto__":{"polluted":true},"constructor":1,"prototype":2}');
  assert(Object.hasOwn(value, '__proto__')); equal(value.__proto__.polluted, true);
  equal(Object.getPrototypeOf(value), Object.prototype); equal(({}).polluted, undefined);
});
test('JSON helper enforces the input byte limit', () => {
  throws(() => validateJSON(' '.repeat(MAX_TEXT_BYTES + 1)), 'INPUT_TOO_LARGE');
});
test('Local JSON parser format edits preserve numeric lexemes and duplicate keys', () => {
  const text = '{"a":9007199254740993,"a":1e400,"z":-0}';
  const result = applyEdits(text, format(text, undefined, { insertSpaces: true, tabSize: 2, eol: '\n' }));
  assert(result.includes('9007199254740993')); assert(result.includes('1e400')); assert(result.includes('-0'));
  equal((result.match(/"a"/g) || []).length, 2); assert(validateJSON(result).valid);
  const scanner = createScanner(text); equal(scanner.scan(), SyntaxKind.OpenBraceToken);
});
test('Status renders HTML as literal text with an accessible live region', () => {
  const element = status(); setStatus(element, { kind: 'error', message: '<img src=x onerror=alert(1)>' });
  equal(element.children.length, 0); equal(element.textContent, '<img src=x onerror=alert(1)>');
  equal(element.getAttribute('aria-live'), 'polite'); equal(element.dataset.kind, 'error');
  throws(() => setStatus(element, { kind: 'fake', message: 'x' }));
});
test('Clipboard success is reported only after write resolves', async () => {
  const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  let copied, resolveWrite;
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText(text) { copied = text; return new Promise(resolve => { resolveWrite = resolve; }); } } });
  try { const element = status(); const pending = copyText('fixture ✓', element);
    assert(element.dataset.kind !== 'success'); resolveWrite();
    equal(await pending, true); equal(copied, 'fixture ✓'); equal(element.dataset.kind, 'success'); }
  finally { if (original) Object.defineProperty(navigator, 'clipboard', original); else delete navigator.clipboard; }
});
test('Denied clipboard produces honest manual-copy fallback', async () => {
  const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { async writeText() { throw new Error('Denied'); } } });
  try { const element = status(); equal(await copyText('fixture', element), false); equal(element.dataset.kind, 'warning'); assert(element.textContent.includes('manually')); }
  finally { if (original) Object.defineProperty(navigator, 'clipboard', original); else delete navigator.clipboard; }
});
test('Missing clipboard also offers manual-copy fallback', async () => {
  const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
  try { equal(await copyText('fixture', status()), false); }
  finally { if (original) Object.defineProperty(navigator, 'clipboard', original); else delete navigator.clipboard; }
});
test('File helper preserves Unicode and the UTF-8 BOM', async () => {
  equal(await readTextFile(new File(['日本語 😀'], 'fixture.txt')), '日本語 😀');
  equal(await readTextFile(new File([new Uint8Array([239,187,191,97])], 'bom.txt')), '\ufeffa');
});
test('Invalid UTF-8 and oversized files are rejected before reading', async () => {
  await rejects(() => readTextFile(new File([new Uint8Array([255])], 'bad.txt')), 'INVALID_UTF8');
  const file = new File(['abcd'], 'large.txt');
  file.arrayBuffer = () => { throw new Error('Should not read oversized file'); };
  await rejects(() => readTextFile(file, { maxBytes: 3 }), 'INPUT_TOO_LARGE');
  equal(await readTextFile(new File(['😀'], 'exact.txt'), { maxBytes: 4 }), '😀');
});
test('Download emits the right Blob and safe basename, then releases its object URL', async () => {
  const create = URL.createObjectURL, revoke = URL.revokeObjectURL, click = HTMLAnchorElement.prototype.click;
  let blob, filename, revoked;
  URL.createObjectURL = value => { blob = value; return 'blob:foundation-test'; };
  URL.revokeObjectURL = value => { revoked = value; };
  HTMLAnchorElement.prototype.click = function () { filename = this.download; };
  try {
    downloadText('fixture ✓', '../fixture.txt', 'text/plain;charset=utf-8');
    equal(await blob.text(), 'fixture ✓'); equal(filename, 'fixture.txt');
    equal(document.querySelector('a[href="blob:foundation-test"]'), null);
    await new Promise(resolve => setTimeout(resolve, 1100)); equal(revoked, 'blob:foundation-test');
  } finally { URL.createObjectURL = create; URL.revokeObjectURL = revoke; HTMLAnchorElement.prototype.click = click; }
});
test('Local YAML browser distribution exposes Document, core schema, AST and BigInt', () => {
  const doc = parseDocument('answer: yes\nmode: on\ndate: 2024-01-01\nlarge: 9007199254740993', { version: '1.2', schema: 'core', intAsBigInt: true });
  equal(doc.errors.length, 0); assert(isMap(doc.contents));
  equal(doc.get('answer'), 'yes'); equal(doc.get('mode'), 'on'); equal(doc.get('date'), '2024-01-01'); equal(doc.get('large'), 9007199254740993n);
  assert(doc.contents.items.some(pair => pair.key.value === 'large'));
});
test('YAML exposes duplicate errors and alias AST/expansion controls', () => {
  assert(parseDocument('a: 1\na: 2').errors.length > 0);
  const doc = parseDocument('a: &x [1]\nb: *x');
  assert(isAlias(doc.get('b', true))); throws(() => doc.toJS({ maxAliasCount: 0 }));
});
test('Croner has next-runs without scheduling a callback', () => {
  const cron = new Cron('*/15 * * * *', { timezone: 'UTC', mode: '5-part' });
  try { deepEqual(cron.nextRuns(2, new Date('2024-01-01T00:00:00Z')).map(d => d.toISOString()), ['2024-01-01T00:15:00.000Z', '2024-01-01T00:30:00.000Z']); }
  finally { cron.stop(); }
});
test('Croner verifies Unix OR semantics for restricted DOM and DOW', () => {
  const cron = new Cron('0 9 1 * 1', { timezone: 'UTC', mode: '5-part' });
  try { deepEqual(cron.nextRuns(3, new Date('2024-01-29T00:00:00Z')).map(d => d.toISOString()), ['2024-01-29T09:00:00.000Z', '2024-02-01T09:00:00.000Z', '2024-02-05T09:00:00.000Z']); }
  finally { cron.stop(); }
});
test('Croner continues minutely through fall DST overlap', () => {
  const cron = new Cron('* * * * *', { timezone: 'America/New_York', mode: '5-part' });
  try { equal(cron.nextRun(new Date('2024-11-03T05:59:00Z')).toISOString(), '2024-11-03T06:00:00.000Z'); }
  finally { cron.stop(); }
});
test('Croner calculates IANA timezone dates independently of host timezone', () => {
  const cron = new Cron('0 9 * * *', { timezone: 'Asia/Jakarta', mode: '5-part' });
  try { equal(cron.nextRun(new Date('2024-01-01T00:00:00Z')).toISOString(), '2024-01-01T02:00:00.000Z'); }
  finally { cron.stop(); }
});
test('SQL browser UMD supports PostgreSQL and MySQL while preserving literals', () => {
  assert(typeof window.sqlFormatter?.format === 'function');
  const pg = window.sqlFormatter.format('select "MixedCase", $1::jsonb, \'select from\' from "User";', { language: 'postgresql', keywordCase: 'upper' });
  assert(pg.includes('SELECT')); assert(pg.includes('"MixedCase"')); assert(pg.includes('$1::jsonb')); assert(pg.includes("'select from'"));
  const mysql = window.sqlFormatter.format('select `order` from `user` where id = ?;', { language: 'mysql', keywordCase: 'upper' });
  assert(mysql.includes('`order`')); assert(mysql.includes('?'));
});
test('ESM parsers are also importable in a native module worker', async () => {
  const code = `import { validateJSON } from '${location.origin}/tools/shared/json.js';
    import { parseDocument } from '${location.origin}/tools/vendor/yaml/index.js';
    import { Cron } from '${location.origin}/tools/vendor/croner/croner.js?v=10.0.2-dev.0';
    const cron = new Cron('* * * * *', {timezone:'UTC',mode:'5-part'});
    postMessage({json:validateJSON('{}').valid,yaml:parseDocument('a: yes').get('a'),cron:!!cron.nextRun(new Date('2024-01-01T00:00:00Z'))});cron.stop();`;
  const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
  const worker = new Worker(url, { type: 'module' });
  try {
    const result = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Worker import timeout')), 5000);
      worker.onmessage = event => { clearTimeout(timer); resolve(event.data); };
      worker.onerror = event => { clearTimeout(timer); reject(new Error(event.message)); };
    });
    deepEqual(result, { json: true, yaml: 'yes', cron: true });
  } finally { worker.terminate(); URL.revokeObjectURL(url); }
});
test('Template has static content, no-JS guidance, labels and no dead tool links', async () => {
  const frame = document.createElement('iframe'); frame.setAttribute('sandbox', 'allow-same-origin');
  frame.src = '/docs/developer-tools/tool-template.html'; frame.title = 'No-JavaScript template fixture';
  frame.style.cssText = 'width:390px;height:600px;border:0;position:absolute;left:0;top:0;visibility:hidden';
  document.body.append(frame);
  try {
    await new Promise((resolve, reject) => { frame.onload = resolve; frame.onerror = reject; });
    const doc = frame.contentDocument;
    equal(doc.querySelectorAll('h1').length, 1);
    assert(doc.querySelector('noscript').textContent.includes('Enable JavaScript'));
    assert(doc.querySelector('noscript p').getBoundingClientRect().height > 0);
    for (const element of doc.querySelectorAll('input,select,textarea')) assert(doc.querySelector(`label[for="${element.id}"]`));
    equal(doc.querySelector('#status').getAttribute('aria-live'), 'polite');
    equal(doc.querySelectorAll('a[href="/tools/"]').length, 0);
    assert(doc.querySelector('article').textContent.includes('How to use'));
    for (const width of [320, 390, 768, 1440]) {
      frame.style.width = `${width}px`; await nextFrame();
      assert(doc.documentElement.scrollWidth <= width, `Template overflows at ${width}px`);
      const panels = doc.querySelectorAll('.tools-panel');
      if (width < 700) assert(panels[1].getBoundingClientRect().top > panels[0].getBoundingClientRect().top, `Panels must stack at ${width}px`);
      else assert(Math.abs(panels[0].getBoundingClientRect().top - panels[1].getBoundingClientRect().top) < 1, `Panels must align at ${width}px`);
    }
  } finally { frame.remove(); }
});

test('SQL UMD is usable in a classic worker without a bundler', async () => {
  const code = `importScripts('${location.origin}/tools/vendor/sql-formatter/sql-formatter.min.js');
    postMessage(self.sqlFormatter.format('select id from users;', {language:'postgresql',keywordCase:'upper'}));`;
  const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
  const worker = new Worker(url);
  try {
    const result = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('SQL worker import timeout')), 5000);
      worker.onmessage = event => { clearTimeout(timer); resolve(event.data); };
      worker.onerror = event => { clearTimeout(timer); reject(new Error(event.message)); };
    });
    assert(result.includes('SELECT')); assert(result.includes('users'));
  } finally { worker.terminate(); URL.revokeObjectURL(url); }
});
test('Page resources load only from this local origin', async () => {
  await document.fonts.ready;
  const resources = performance.getEntriesByType('resource');
  assert(resources.length > 0);
  for (const resource of resources) assert(resource.name.startsWith(location.origin + '/') || resource.name.startsWith('blob:'), `Unexpected external resource: ${resource.name}`);
});

const manualStatus = document.querySelector('#manual-status');
document.querySelector('#manual-copy').addEventListener('click', () => copyText(document.querySelector('#manual-result').value, manualStatus));
document.querySelector('#manual-download').addEventListener('click', () => downloadText(document.querySelector('#manual-result').value, 'foundation-fixture.txt', 'text/plain;charset=utf-8'));
await run();
