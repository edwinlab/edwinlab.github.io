import { assert, equal, deepEqual, throws, test, run } from './harness.js';
import { validateRequest } from '../../regex-tester/logic.js';
import { createRegexRunner } from '../../regex-tester/worker-client.js';
const match = (pattern, flags, text) => createRegexRunner().run({ pattern, flags, text });
async function rejects(promise, code) { let caught; try { await promise; } catch (error) { caught = error; } assert(caught, 'Expected rejection'); equal(caught.code, code); }
async function until(predicate, timeout = 4000) { const end = performance.now() + timeout; while (!predicate()) { if (performance.now() > end) throw new Error('Condition timed out'); await new Promise(resolve => setTimeout(resolve, 20)); } }

test('Digits report text, start, and exclusive end indices', async () => {
  const result = await match('\\d+', 'g', 'a12 b3');
  deepEqual(result.matches.map(m => [m.value, m.index, m.end]), [['12', 1, 3], ['3', 5, 6]]);
});
test('Without g only the first match is returned; g finds successive matches', async () => {
  equal((await match('a', '', 'aba')).matches.length, 1);
  deepEqual((await match('a', 'g', 'aba')).matches.map(m => m.index), [0, 2]);
});
test('Optional captures distinguish non-participation from an empty match', async () => {
  const result = await match('(a)(b)?', 'g', 'a ab');
  equal(result.matches[0].groups[1].value, undefined); equal(result.matches[0].groups[1].matched, false);
  equal(result.matches[1].groups[1].value, 'b'); equal(result.matches[1].groups[1].matched, true);
  equal((await match('(a*)', '', '')).matches[0].groups[0].value, '');
});
test('Named groups preserve names and values', async () => {
  deepEqual((await match('(?<word>[A-Za-z]+)', 'g', 'hi 42')).matches[0].namedGroups, [{ name: 'word', value: 'hi', matched: true }]);
});
test('Multiline affects start anchors only when selected', async () => {
  equal((await match('^b', 'gm', 'a\nb')).matches[0].index, 2);
  equal((await match('^b', 'g', 'a\nb')).matches.length, 0);
});
test('DotAll matches a line break while the default dot does not', async () => {
  equal((await match('a.b', 's', 'a\nb')).matches.length, 1);
  equal((await match('a.b', '', 'a\nb')).matches.length, 0);
});
test('Ignore-case is opt-in and Unicode properties use the browser engine', async () => {
  equal((await match('a', 'i', 'A')).matches.length, 1);
  equal((await match('a', '', 'A')).matches.length, 0);
  equal((await match('\\p{L}+', 'gu', '東京 😀')).matches[0].value, '東京');
});
test('Sticky starts at index zero and does not search freely', async () => {
  equal((await match('a', 'gy', 'ba')).matches.length, 0);
  deepEqual((await match('a', 'gy', 'aaba')).matches.map(m => m.index), [0, 1]);
});
test('Unicode empty matches advance whole code points', async () => {
  deepEqual((await match('(?:)', 'gu', '😀')).matches.map(m => m.index), [0, 2]);
});
test('Non-Unicode empty matches advance UTF-16 units', async () => {
  deepEqual((await match('(?:)', 'g', '😀')).matches.map(m => m.index), [0, 1, 2]);
});
test('Empty pattern and empty text are valid and terminate', async () => {
  const result = await match('', 'g', ''); equal(result.matches.length, 1); equal(result.matches[0].index, 0);
});
test('Syntax failures are structured worker errors', async () => { await rejects(match('[', 'g', 'x'), 'INVALID_PATTERN'); });
test('Unknown and duplicate flags are rejected before dispatch', () => {
  throws(() => validateRequest({ pattern: 'a', text: 'a', flags: 'gg' }), 'INVALID_FLAGS');
  throws(() => validateRequest({ pattern: 'a', text: 'a', flags: 'd' }), 'INVALID_FLAGS');
});
test('UTF-8 input and pattern limits count emoji bytes and accept exact boundaries', () => {
  validateRequest({ pattern: '😀'.repeat(1024), flags: 'g', text: '😀'.repeat(32768) });
  throws(() => validateRequest({ pattern: '😀'.repeat(1025), flags: 'g', text: '' }), 'PATTERN_TOO_LARGE');
  throws(() => validateRequest({ pattern: '', flags: 'g', text: '😀'.repeat(32769) }), 'TEXT_TOO_LARGE');
});
test('Oversized requests never create a worker', async () => {
  let created = 0;
  const runner = createRegexRunner({ workerFactory: () => { created++; } });
  await rejects(runner.run({ pattern: 'a', flags: 'g', text: 'x'.repeat(131073) }), 'TEXT_TOO_LARGE'); equal(created, 0);
});
test('Worker revalidates untrusted request payloads', async () => {
  const worker = new Worker('/regex-tester/worker.js', { type: 'module' });
  try {
    const reply = await new Promise((resolve, reject) => { worker.onmessage = e => resolve(e.data); worker.onerror = reject; worker.postMessage({ id: 7, payload: { pattern: '', flags: 'gg', text: '' } }); });
    equal(reply.id, 7); equal(reply.error.code, 'INVALID_FLAGS');
  } finally { worker.terminate(); }
});
test('Results stop at 2,000 matches with a clear limit', async () => {
  const result = await match('a', 'g', 'a'.repeat(2001)); equal(result.matches.length, 2000); assert(result.limited); assert(result.limitReason.includes('2,000'));
});
test('Repeated capture text is bounded before returning an oversized payload', async () => {
  const result = await match('('.repeat(24) + 'a+' + ')'.repeat(24), 'g', 'a'.repeat(100000));
  assert(result.limited); assert(result.limitReason.includes('2 MiB')); assert(result.resultBytes <= 2 * 1024 * 1024);
});
test('Serialized control-character captures also stay within the result budget', async () => {
  const result = await match('('.repeat(4) + '.*' + ')'.repeat(4), 'gs', '\0'.repeat(100000));
  assert(result.limited); assert(new TextEncoder().encode(JSON.stringify(result)).byteLength < 2 * 1024 * 1024);
});
test('A pathological regex times out in a real worker without blocking the page', async () => {
  let responsive = false, terminated = 0;
  const runner = createRegexRunner({ workerFactory: () => {
    const worker = new Worker('/regex-tester/worker.js', { type: 'module' }); const terminate = worker.terminate.bind(worker);
    worker.terminate = () => { terminated++; terminate(); }; return worker;
  } });
  const heartbeat = setTimeout(() => { responsive = true; }, 100);
  await rejects(runner.run({ pattern: '(a+)+$', flags: 'g', text: 'a'.repeat(30000) + '!' }), 'TIMEOUT');
  clearTimeout(heartbeat); assert(responsive); equal(terminated, 1);
  equal((await runner.run({ pattern: 'a', flags: 'g', text: 'a' })).matches.length, 1);
});
test('Cancel terminates work and a late response is ignored', async () => {
  let worker, terminated = 0;
  const runner = createRegexRunner({ workerFactory: () => (worker = { postMessage() {}, terminate() { terminated++; } }) });
  const pending = runner.run({ pattern: 'a', flags: 'g', text: 'a' }); runner.cancel();
  worker.onmessage({ data: { id: 1, result: { matches: ['stale'] } } });
  await rejects(pending, 'CANCELLED'); equal(terminated, 1);
});
test('New run supersedes an old run and ignores mismatched request IDs', async () => {
  const workers = [];
  const runner = createRegexRunner({ workerFactory: () => { const worker = { postMessage() {}, terminate() {} }; workers.push(worker); return worker; } });
  const old = runner.run({ pattern: 'a', flags: 'g', text: 'a' }); const oldCheck = rejects(old, 'CANCELLED');
  const next = runner.run({ pattern: 'b', flags: 'g', text: 'b' });
  workers[1].onmessage({ data: { id: 1, result: { matches: ['wrong'] } } });
  workers[1].onmessage({ data: { id: 2, result: { matches: ['correct'] } } });
  await oldCheck; deepEqual((await next).matches, ['correct']);
});
test('Unavailable worker and worker errors have no main-thread fallback', async () => {
  await rejects(createRegexRunner({ workerFactory: () => { throw new Error('Unavailable'); } }).run({ pattern: 'a', flags: 'g', text: 'a' }), 'WORKER_UNAVAILABLE');
  let worker;
  const pending = createRegexRunner({ workerFactory: () => (worker = { postMessage() {}, terminate() {} }) }).run({ pattern: 'a', flags: 'g', text: 'a' });
  worker.onerror({ preventDefault() {} }); await rejects(pending, 'WORKER_ERROR');
});
test('UI rendering, stale state, examples, copy, cancellation, and responsive layout', async () => {
  const frame = document.createElement('iframe'); frame.src = '/regex-tester/'; frame.title = 'Regex UI fixture'; frame.style.cssText = 'position:absolute;left:-10000px;width:1440px;height:900px'; document.body.append(frame);
  try {
    await new Promise((resolve, reject) => { frame.onload = resolve; frame.onerror = reject; });
    const doc = frame.contentDocument, win = frame.contentWindow;
    await until(() => doc.querySelector('#run') && !doc.querySelector('#run').disabled);
    const input = doc.querySelector('#input'), pattern = doc.querySelector('#pattern'), status = doc.querySelector('#status');
    let regexCalls = 0, network = 0, copied;
    win.RegExp = function () { regexCalls++; throw new Error('User regex ran in main thread'); };
    win.fetch = () => { network++; throw new Error('Unexpected upload'); };
    win.XMLHttpRequest = function () { network++; };
    Object.defineProperty(win.navigator, 'clipboard', { configurable: true, value: { writeText: async text => { copied = text; } } });
    for (const example of doc.querySelectorAll('[data-pattern]')) { example.click(); doc.querySelector('#run').click(); await until(() => !doc.querySelector('#run').disabled); equal(status.dataset.kind, 'success'); }
    pattern.value = '(.*)'; input.value = '<img src=x onerror=alert(1)>'; doc.querySelector('#run').click(); await until(() => !doc.querySelector('#run').disabled);
    equal(doc.querySelector('#highlight img'), null); assert(doc.querySelector('#highlight').textContent.includes('<img'));
    doc.querySelector('#copy-pattern').click(); await until(() => copied !== undefined); equal(copied, '(.*)');
    copied = undefined; doc.querySelector('#copy-matches').click(); await until(() => copied !== undefined); assert(copied.includes('<img'));
    for (const width of [320, 375, 390, 768, 1440]) { frame.style.width = width + 'px'; await new Promise(resolve => win.requestAnimationFrame(() => win.requestAnimationFrame(resolve))); assert(doc.documentElement.scrollWidth <= width, 'Overflow at ' + width); }
    input.value = 'edited'; input.dispatchEvent(new win.Event('input')); assert(doc.querySelector('#results').hidden); assert(doc.querySelector('#copy-matches').disabled);
    pattern.value = '(a+)+$'; input.value = 'a'.repeat(30000) + '!'; doc.querySelector('#run').click();
    assert(!doc.querySelector('#cancel').disabled); doc.querySelector('#cancel').click(); assert(status.textContent.includes('Cancelled')); assert(!doc.querySelector('#run').disabled);
    doc.querySelector('#run').click(); input.value = 'a'; input.dispatchEvent(new win.Event('input')); assert(!doc.querySelector('#run').disabled);
    pattern.value = 'a'; doc.querySelector('#run').click(); await until(() => !doc.querySelector('#run').disabled); assert(status.textContent.startsWith('1 matches'));
    pattern.value = '['; pattern.dispatchEvent(new win.Event('input')); doc.querySelector('#run').click(); await until(() => !doc.querySelector('#run').disabled); equal(status.dataset.kind, 'error'); equal(pattern.value, '[');
    doc.querySelector('#clear').click(); equal(input.value, ''); equal(pattern.value, ''); assert(doc.querySelector('#results').hidden);
    equal(regexCalls, 0); equal(network, 0); assert(!win.location.search && !win.location.hash);
    for (const resource of win.performance.getEntriesByType('resource')) assert(resource.name.startsWith(location.origin + '/'), 'External resource');
  } finally { frame.remove(); }
});
test('Static SEO, unique guide, noscript, and local assets are present', async () => {
  const doc = new DOMParser().parseFromString(await (await fetch('/regex-tester/')).text(), 'text/html');
  equal(doc.title, 'JavaScript Regex Tester — Matches & Capture Groups | Edwin Lab'); equal(doc.querySelectorAll('h1').length, 1);
  equal(doc.querySelector('link[rel=canonical]').getAttribute('href'), 'https://edwinlab.dev/regex-tester/');
  assert(doc.querySelector('noscript').textContent.includes('Enable JavaScript')); assert(doc.querySelector('article').textContent.includes('UTF-16'));
  for (const script of doc.querySelectorAll('script[type="application/ld+json"]')) JSON.parse(script.textContent);
});
await run();
