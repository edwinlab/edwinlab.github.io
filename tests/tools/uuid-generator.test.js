import { assert, deepEqual, equal, test, throws, run } from './harness.js';
import { generateUUIDs, serializeUUIDs, validateCount } from '../../uuid-generator/logic.js';
import { downloadText } from '../../tools/shared/ui.js';

window.__uuidPageErrors = [];
window.addEventListener('error', event => window.__uuidPageErrors.push({ message: event.message, source: event.filename, line: event.lineno, stack: event.error?.stack }));

const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

for (const [raw, expected] of [['1', 1], ['1000', 1000], ['001', 1], [' 2 ', 2]]) {
  test(`Count ${JSON.stringify(raw)} is accepted as ${expected}`, () => equal(validateCount(raw), expected));
}
for (const raw of ['0', '1001', '-1', '1.5', '1e3', '2abc', 'NaN', '   ', '']) {
  test(`Count ${JSON.stringify(raw)} is rejected`, () => throws(() => validateCount(raw), 'INVALID_COUNT'));
}

test('Count validates the shared UTF-8 input limit before parsing', () => {
  const oversized = '1'.repeat(5 * 1024 * 1024 + 1);
  throws(() => validateCount(oversized), 'INPUT_TOO_LARGE');
});

test('Zero fallback bytes set UUID v4 version and RFC variant bits', () => {
  const uuid = generateUUIDs('1', { getRandomValues(bytes) { bytes.fill(0); return bytes; } })[0];
  equal(uuid, '00000000-0000-4000-8000-000000000000');
});

test('All-ones fallback bytes set UUID v4 version and RFC variant bits', () => {
  const uuid = generateUUIDs('1', { getRandomValues(bytes) { bytes.fill(255); return bytes; } })[0];
  equal(uuid, 'ffffffff-ffff-4fff-bfff-ffffffffffff');
});

test('Fallback formats an ascending byte fixture in lowercase hex', () => {
  const uuid = generateUUIDs('1', { getRandomValues(bytes) { bytes.set(Array.from({ length: 16 }, (_, i) => i)); return bytes; } })[0];
  equal(uuid, '00010203-0405-4607-8809-0a0b0c0d0e0f');
});

test('Injected UUID source runs once per valid count and returns an array', () => {
  let calls = 0;
  const uuids = generateUUIDs('3', { randomUUID() { calls++; return `00000000-0000-4000-8000-${String(calls).padStart(12, '0')}`; } });
  equal(calls, 3); equal(uuids.length, 3); assert(uuids.every(value => pattern.test(value)));
});

test('Invalid counts never call either crypto API', () => {
  let calls = 0;
  throws(() => generateUUIDs('2abc', { randomUUID() { calls++; }, getRandomValues() { calls++; } }), 'INVALID_COUNT');
  equal(calls, 0);
});

test('Fallback requests exactly 16 random bytes per UUID', () => {
  const lengths = [];
  generateUUIDs('3', { getRandomValues(bytes) { lengths.push(bytes.length); bytes.fill(lengths.length); return bytes; } });
  deepEqual(lengths, [16, 16, 16]);
});

test('All injected results use lowercase UUID v4 format', () => {
  const uuids = generateUUIDs('2', { randomUUID: () => 'abcdef01-2345-4abc-8def-0123456789ab' });
  assert(uuids.every(value => pattern.test(value)));
});

test('Missing crypto APIs fail explicitly', () => throws(() => generateUUIDs('1', {}), 'CRYPTO_UNAVAILABLE'));

test('getRandomValues failure produces no partial result', () => {
  let calls = 0;
  throws(() => generateUUIDs('2', { getRandomValues() { if (++calls === 2) throw new Error('blocked'); } }), 'CRYPTO_FAILED');
  equal(calls, 2);
});

test('randomUUID failure falls back only to secure getRandomValues', () => {
  let fallbackCalls = 0;
  const uuid = generateUUIDs('1', { randomUUID() { throw new Error('failed'); }, getRandomValues(bytes) { fallbackCalls++; bytes.fill(0); return bytes; } })[0];
  equal(fallbackCalls, 1); equal(uuid, '00000000-0000-4000-8000-000000000000');
});

test('If both crypto APIs fail, no partial batch is returned', () => {
  let fallbackCalls = 0;
  throws(() => generateUUIDs('2', { randomUUID() { throw new Error('failed'); }, getRandomValues() { fallbackCalls++; throw new Error('failed'); } }), 'CRYPTO_FAILED');
  equal(fallbackCalls, 1);
});

test('Invalid crypto output is rejected without returning a partial batch', () => {
  let calls = 0;
  throws(() => generateUUIDs('2', { randomUUID() { return ++calls === 1 ? '00000000-0000-4000-8000-000000000000' : '<bad>'; } }), 'CRYPTO_FAILED');
  equal(calls, 2);
});

test('Serialization joins two UUIDs with exactly one newline', () => {
  const values = ['00000000-0000-4000-8000-000000000000', 'ffffffff-ffff-4fff-bfff-ffffffffffff'];
  equal(serializeUUIDs(values), values.join('\n'));
  equal(serializeUUIDs(values).split('\n').length, 2);
});

test('Serialization rejects unsafe values instead of exposing them', () => throws(() => serializeUUIDs(['<img>']), 'INVALID_UUIDS'));

test('Download helper receives newline-separated UUIDs as the named UTF-8 text file', async () => {
  const values = ['00000000-0000-4000-8000-000000000000', 'ffffffff-ffff-4fff-bfff-ffffffffffff'];
  let blob, name;
  const originalCreate = URL.createObjectURL, originalRevoke = URL.revokeObjectURL;
  const originalClick = HTMLAnchorElement.prototype.click;
  URL.createObjectURL = value => { blob = value; return 'blob:uuid-fixture'; };
  URL.revokeObjectURL = () => {};
  HTMLAnchorElement.prototype.click = function () { name = this.download; };
  try {
    downloadText(serializeUUIDs(values), 'uuids-v4.txt', 'text/plain;charset=utf-8');
    equal(name, 'uuids-v4.txt'); equal(blob.type, 'text/plain;charset=utf-8');
    equal(await blob.text(), values.join('\n'));
  } finally { URL.createObjectURL = originalCreate; URL.revokeObjectURL = originalRevoke; HTMLAnchorElement.prototype.click = originalClick; }
});

test('Deterministic fixtures do not claim random UUID uniqueness', () => {
  const uuids = generateUUIDs('2', { randomUUID: () => '00000000-0000-4000-8000-000000000000' });
  equal(uuids[0], uuids[1]);
});

test('Browser crypto smoke test generates a real single UUID v4', () => {
  assert(globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function');
  const uuids = generateUUIDs('1', globalThis.crypto);
  equal(uuids.length, 1); assert(pattern.test(uuids[0]));
});

test('Browser crypto bulk smoke test generates 1,000 formatted UUIDs', () => {
  const uuids = generateUUIDs('1000', globalThis.crypto);
  equal(uuids.length, 1000); assert(uuids.every(value => pattern.test(value)));
});

test('Static page exposes the labeled controls and SEO without starting generation', async () => {
  const response = await fetch('/uuid-generator/');
  assert(response.ok, 'Direct static tool route should load');
  const markup = await response.text();
  const doc = new DOMParser().parseFromString(markup, 'text/html');
  equal(doc.title, 'UUID v4 Generator — Generate Bulk UUIDs Online | Edwin Lab');
  equal(doc.querySelectorAll('h1').length, 1);
  equal(doc.querySelector('link[rel=canonical]').href, 'https://edwinlab.dev/uuid-generator/');
  equal(doc.querySelector('#count').value, '1');
  equal(doc.querySelector('#count').type, 'number');
  equal(doc.querySelector('#count').min, '1'); equal(doc.querySelector('#count').max, '1000'); equal(doc.querySelector('#count').step, '1');
  equal(doc.querySelector('#output').value, '');
  assert(doc.querySelector('#output').hasAttribute('readonly'));
  assert(doc.querySelector('noscript').textContent.includes('Enable JavaScript'));
  assert(doc.querySelector('article').textContent.includes('550e8400-e29b-41d4-a716-446655440000'));
  assert(doc.querySelector('article').textContent.includes('not a password or secret token'));
  for (const script of doc.querySelectorAll('script[type="application/ld+json"]')) JSON.parse(script.textContent);
  for (const script of doc.querySelectorAll('script[src]')) assert(script.src.startsWith(location.origin + '/'));
});

test('Page has no uncaught JavaScript errors', () => equal(window.__uuidPageErrors.length, 0));

await run();
