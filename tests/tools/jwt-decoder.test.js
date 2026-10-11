import { assert, equal, test, throws, run } from './harness.js';
import { MAX_TEXT_BYTES } from '../../tools/shared/limits.js';
import { decodeJwt, evaluateTimeClaims } from '../../jwt-decoder/logic.js';

function encodeBase64Url(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function makeToken(header = '{}', payload = '{}', signature = '') {
  return `${encodeBase64Url(header)}.${encodeBase64Url(payload)}.${signature}`;
}

test('alg none with exp zero decodes but remains unverified and expired', () => {
  const decoded = decodeJwt('eyJhbGciOiJub25lIn0.eyJleHAiOjB9.');
  const exp = evaluateTimeClaims(decoded.payload, 1700000000)[0];
  equal(decoded.header.alg, 'none');
  equal(decoded.signature.status, 'Unverified');
  equal(decoded.signature.empty, true);
  equal(exp.valueText, '0');
  equal(exp.status, 'Expired');
});

test('expiration is inclusive at exp and not expired immediately before it', () => {
  const payload = decodeJwt(makeToken('{}', '{"exp":1700000000}')).payload;
  equal(evaluateTimeClaims(payload, 1700000000)[0].status, 'Expired');
  equal(evaluateTimeClaims(payload, 1699999999)[0].status, 'Not expired');
});

test('nbf is inactive before its time and active at its time', () => {
  const payload = decodeJwt(makeToken('{}', '{"nbf":1700000001}')).payload;
  equal(evaluateTimeClaims(payload, 1700000000)[1].status, 'Not active yet');
  equal(evaluateTimeClaims(payload, 1700000001)[1].status, 'Active');
});

test('string NumericDate values warn and are never coerced to numbers', () => {
  const payload = decodeJwt(makeToken('{}', '{"exp":"1700000000"}')).payload;
  const exp = evaluateTimeClaims(payload, 1700000000)[0];
  equal(exp.valid, false);
  equal(exp.status, 'Warning');
  equal(exp.valueText, '"1700000000"');
  equal(exp.dateUtc, null);
});

test('Unicode and boolean payload values survive decoding', () => {
  const decoded = decodeJwt(makeToken('{}', '{"sub":"用户","admin":false}'));
  equal(decoded.payload.sub, '用户');
  equal(decoded.payload.admin, false);
  assert(decoded.payloadText.includes('用户'));
  assert(decoded.payloadText.includes('false'));
});

test('empty signature and ordinary signature bytes always remain unverified', () => {
  const empty = decodeJwt('e30.e30.');
  const present = decodeJwt('e30.e30.YWJj');
  equal(empty.signature.status, 'Unverified');
  equal(empty.signature.empty, true);
  equal(present.signature.status, 'Unverified');
  equal(present.signature.empty, false);
});

test('empty objects decode and time claims are reported as absent', () => {
  const decoded = decodeJwt('e30.e30.');
  equal(Object.keys(decoded.header).length, 0);
  equal(Object.keys(decoded.payload).length, 0);
  for (const claim of evaluateTimeClaims(decoded.payload, 1700000000)) {
    equal(claim.present, false);
    equal(claim.status, 'Not present');
  }
});

test('only outer whitespace is trimmed and Bearer prefixes are called out', () => {
  equal(decodeJwt(' \n e30.e30. \t').signature.status, 'Unverified');
  throws(() => decodeJwt('Bearer e30.e30.'), 'BEARER_PREFIX');
  throws(() => decodeJwt('bearer e30.e30.'), 'BEARER_PREFIX');
  throws(() => decodeJwt('e30. e30.'), 'INVALID_BASE64URL');
});

test('compact tokens must contain exactly three segments', () => {
  throws(() => decodeJwt(''), 'EMPTY_TOKEN');
  throws(() => decodeJwt('abc.def'), 'SEGMENT_COUNT');
  throws(() => decodeJwt('a.b.c.d'), 'SEGMENT_COUNT');
  throws(() => decodeJwt('.e30.'), 'EMPTY_SEGMENT');
  throws(() => decodeJwt('e30..'), 'EMPTY_SEGMENT');
});

test('Base64URL rejects alphabet violations, padding, and length remainder one', () => {
  throws(() => decodeJwt('e+30.e30.'), 'INVALID_BASE64URL');
  throws(() => decodeJwt('e30=.e30.'), 'INVALID_BASE64URL');
  throws(() => decodeJwt('a.e30.'), 'INVALID_BASE64URL');
  throws(() => decodeJwt('e30.e30.+'), 'INVALID_BASE64URL');
});

test('invalid UTF-8 is rejected using fatal decoding', () => {
  throws(() => decodeJwt('e30.wA.'), 'INVALID_UTF8');
});

test('invalid JSON in either segment reports which segment failed', () => {
  throws(() => decodeJwt('bm90LWpzb24.e30.'), 'INVALID_JSON');
  const error = throws(() => decodeJwt('e30.bm90LWpzb24.'), 'INVALID_JSON');
  assert(error.message.startsWith('Payload JSON:'));
});

test('header and payload must be non-null JSON objects', () => {
  throws(() => decodeJwt('bnVsbA.e30.'), 'INVALID_HEADER_TYPE');
  throws(() => decodeJwt('W10.e30.'), 'INVALID_HEADER_TYPE');
  throws(() => decodeJwt('e30.bnVsbA.'), 'INVALID_PAYLOAD_TYPE');
  throws(() => decodeJwt('e30.W10.'), 'INVALID_PAYLOAD_TYPE');
  throws(() => decodeJwt('e30.dHJ1ZQ.'), 'INVALID_PAYLOAD_TYPE');
});

test('duplicate JSON keys and unsafe numeric values are rejected by the shared parser', () => {
  throws(() => decodeJwt(makeToken('{}', '{"exp":0,"exp":1}')), 'DUPLICATE_KEY');
  throws(() => decodeJwt(makeToken('{}', '{"exp":9007199254740993}')), 'UNSAFE_NUMBER');
});

test('prototype-like and HTML payload data stay inert JSON text', () => {
  const before = Object.prototype.polluted;
  const decoded = decodeJwt(makeToken('{}', '{"__proto__":{"polluted":true},"html":"<img onerror=alert(1)>"}'));
  equal(Object.prototype.polluted, before);
  assert(Object.hasOwn(decoded.payload, '__proto__'));
  assert(decoded.payloadText.includes('<img onerror=alert(1)>'));
  equal(evaluateTimeClaims(decoded.payload, 1700000000)[0].present, false);
});

test('zero remains a present NumericDate and fractional values are accepted', () => {
  const payload = decodeJwt(makeToken('{}', '{"exp":0,"iat":1700000000.125}')).payload;
  const claims = evaluateTimeClaims(payload, 1700000000);
  equal(claims[0].present, true);
  equal(claims[0].status, 'Expired');
  equal(claims[2].valueText, '1700000000.125');
  equal(claims[2].dateUtc, '2023-11-14T22:13:20.125Z');
});

test('wrongly typed claims produce warnings without removing other claims', () => {
  const payload = decodeJwt(makeToken('{}', '{"exp":null,"nbf":false,"iat":0}')).payload;
  const claims = evaluateTimeClaims(payload, 0);
  equal(claims[0].valid, false);
  equal(claims[1].valid, false);
  equal(claims[2].valid, true);
  equal(claims[2].status, 'Issued at this time');
});

test('dates outside the JavaScript Date range keep their NumericDate and comparison', () => {
  const payload = decodeJwt(makeToken('{}', '{"exp":8640000000001}')).payload;
  const exp = evaluateTimeClaims(payload, 0)[0];
  equal(exp.valueText, '8640000000001');
  equal(exp.status, 'Not expired');
  equal(exp.dateUtc, null);
  assert(exp.warning.includes('outside the JavaScript Date range'));
});

test('time-claim evaluation requires an explicit finite reference time', () => {
  const payload = decodeJwt(makeToken('{}', '{"exp":0}')).payload;
  throws(() => evaluateTimeClaims(payload), 'INVALID_NOW');
  throws(() => evaluateTimeClaims(payload, Infinity), 'INVALID_NOW');
});

test('input over 5 MiB is rejected before token parsing', () => {
  const oversized = 'x'.repeat(MAX_TEXT_BYTES + 1);
  throws(() => decodeJwt(oversized), 'INPUT_TOO_LARGE');
});

await run();
