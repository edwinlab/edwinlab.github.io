import { assertTextSize } from '../tools/shared/limits.js';

const ALGORITHMS = new Map([['SHA-256', 32], ['SHA-384', 48], ['SHA-512', 64]]);
export function bytesToHex(bytes) {
  return Array.from(bytes, value => Number(value).toString(16).padStart(2, '0')).join('');
}
export function encodeHashText(text, maxBytes = 5 * 1024 * 1024) {
  if (typeof text !== 'string') throw new TypeError('Text input must be a string.');
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0xD800 && code <= 0xDBFF) {
      const next = text.charCodeAt(++i);
      if (!(next >= 0xDC00 && next <= 0xDFFF)) throw Object.assign(new Error('Text contains an unpaired Unicode surrogate.'), { code: 'INVALID_UNICODE' });
    } else if (code >= 0xDC00 && code <= 0xDFFF) throw Object.assign(new Error('Text contains an unpaired Unicode surrogate.'), { code: 'INVALID_UNICODE' });
  }
  assertTextSize(text, maxBytes);
  return new TextEncoder().encode(text);
}
export function validateAlgorithm(name) {
  if (!ALGORITHMS.has(name)) throw Object.assign(new Error('Choose SHA-256, SHA-384, or SHA-512.'), { code: 'UNSUPPORTED_ALGORITHM' });
  return name;
}
export async function digestBytes(bytes, algorithm, digestFn = (name, data) => crypto.subtle.digest(name, data)) {
  if (!(bytes instanceof Uint8Array)) throw new TypeError('Digest input must be bytes.');
  validateAlgorithm(algorithm); if (typeof digestFn !== 'function') throw new TypeError('A Web Crypto digest function is required.');
  return bytesToHex(new Uint8Array(await digestFn(algorithm, bytes)));
}
export const encodeText = encodeHashText;
export function expectedHexLength(name) { return ALGORITHMS.get(validateAlgorithm(name)) * 2; }
