import { assertTextSize, MAX_OUTPUT_BYTES, MAX_TEXT_BYTES } from '../tools/shared/limits.js';

function toolError(code, message, cause) {
  const error = new Error(message, cause ? { cause } : undefined);
  error.code = code;
  return error;
}

function bytesToBase64(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

function decodeBase64Bytes(value, mode) {
  if (mode !== 'standard' && mode !== 'url') throw new TypeError('Choose Standard Base64 or Base64URL.');
  if (mode === 'standard') {
    if (value.length % 4 !== 0 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) {
      throw toolError('INVALID_BASE64', 'Invalid standard Base64. Use its standard alphabet, correct ending padding, and no whitespace.');
    }
    let binary;
    try { binary = atob(value); }
    catch (cause) { throw toolError('INVALID_BASE64', 'The input is not valid standard Base64.', cause); }
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    if (bytesToBase64(bytes) !== value) throw toolError('INVALID_BASE64', 'The Base64 input has non-canonical pad bits.');
    return bytes;
  }

  const match = /^([A-Za-z0-9_-]*)(={0,2})$/.exec(value);
  if (!match) throw toolError('INVALID_BASE64', 'Invalid Base64URL. Use only letters, digits, hyphen, underscore, and optional ending padding.');
  const [, unpadded, padding] = match;
  const remainder = unpadded.length % 4;
  if (remainder === 1) throw toolError('INVALID_BASE64', 'Base64URL length cannot leave one character after grouping.');
  const expectedPadding = remainder === 2 ? '==' : remainder === 3 ? '=' : '';
  if (padding && padding !== expectedPadding) throw toolError('INVALID_BASE64', 'Base64URL padding is not in the correct position or amount.');

  const standard = unpadded.replace(/-/g, '+').replace(/_/g, '/') + expectedPadding;
  let binary;
  try { binary = atob(standard); }
  catch (cause) { throw toolError('INVALID_BASE64', 'The input is not valid Base64URL.', cause); }
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const canonical = bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  if (canonical !== unpadded) throw toolError('INVALID_BASE64', 'The Base64URL input has non-canonical pad bits.');
  return bytes;
}

export function encodeBase64(text, mode = 'standard') {
  assertTextSize(text, MAX_TEXT_BYTES);
  if (mode !== 'standard' && mode !== 'url') throw new TypeError('Choose Standard Base64 or Base64URL.');
  const bytes = new TextEncoder().encode(text);
  let output = bytesToBase64(bytes);
  if (mode === 'url') output = output.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  try { assertTextSize(output, MAX_OUTPUT_BYTES); }
  catch (cause) { throw toolError('OUTPUT_TOO_LARGE', `Encoded output exceeds the ${MAX_OUTPUT_BYTES.toLocaleString('en-US')}-byte limit.`, cause); }
  return output;
}

export function decodeBase64(text, mode = 'standard') {
  assertTextSize(text, MAX_TEXT_BYTES);
  const bytes = decodeBase64Bytes(text, mode);
  let output;
  try { output = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch (cause) { throw toolError('INVALID_UTF8', 'Decoded bytes are not valid UTF-8 text.', cause); }
  try { assertTextSize(output, MAX_OUTPUT_BYTES); }
  catch (cause) { throw toolError('OUTPUT_TOO_LARGE', `Decoded text exceeds the ${MAX_OUTPUT_BYTES.toLocaleString('en-US')}-byte output limit.`, cause); }
  return output;
}
