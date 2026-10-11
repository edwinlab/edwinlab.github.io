import { assertTextSize, MAX_OUTPUT_BYTES } from '../tools/shared/limits.js';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export function validateCount(rawCount) {
  if (typeof rawCount !== 'string') throw fail('INVALID_COUNT', 'Enter a whole number from 1 to 1,000.');
  assertTextSize(rawCount);
  const value = rawCount.trim();
  if (!/^\d+$/.test(value)) throw fail('INVALID_COUNT', 'Use decimal digits only, from 1 to 1,000.');
  const count = Number(value);
  if (!Number.isSafeInteger(count) || count < 1 || count > 1000) {
    throw fail('INVALID_COUNT', 'Choose a whole number from 1 to 1,000.');
  }
  return count;
}

function fallbackUUID(cryptoSource) {
  if (typeof cryptoSource?.getRandomValues !== 'function') {
    throw fail('CRYPTO_UNAVAILABLE', 'Secure browser randomness is unavailable. No UUIDs were generated.');
  }
  const bytes = new Uint8Array(16);
  try {
    cryptoSource.getRandomValues(bytes);
  } catch {
    throw fail('CRYPTO_FAILED', 'Secure browser randomness failed. No UUIDs were generated.');
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function generateUUIDs(rawCount, cryptoSource = globalThis.crypto) {
  const count = validateCount(rawCount);
  if (typeof cryptoSource?.randomUUID !== 'function' && typeof cryptoSource?.getRandomValues !== 'function') {
    throw fail('CRYPTO_UNAVAILABLE', 'Secure browser randomness is unavailable. No UUIDs were generated.');
  }
  const result = [];
  try {
    for (let index = 0; index < count; index++) {
      let uuid;
      if (typeof cryptoSource.randomUUID === 'function') {
        try { uuid = cryptoSource.randomUUID(); }
        catch {
          if (typeof cryptoSource.getRandomValues !== 'function') throw fail('CRYPTO_FAILED', 'Secure browser randomness failed. No UUIDs were generated.');
          uuid = fallbackUUID(cryptoSource);
        }
      } else uuid = fallbackUUID(cryptoSource);
      if (typeof uuid !== 'string' || !UUID_V4.test(uuid)) {
        if (typeof cryptoSource.getRandomValues === 'function') uuid = fallbackUUID(cryptoSource);
        else throw fail('CRYPTO_FAILED', 'The browser returned an invalid UUID. No results were displayed.');
      }
      if (!UUID_V4.test(uuid)) throw fail('CRYPTO_FAILED', 'Secure browser randomness failed. No UUIDs were generated.');
      result.push(uuid);
    }
  } catch (cause) {
    if (cause?.code === 'CRYPTO_FAILED' || cause?.code === 'CRYPTO_UNAVAILABLE') throw cause;
    throw fail('CRYPTO_FAILED', 'Secure browser randomness failed. No UUIDs were generated.');
  }
  const output = result.join('\n');
  try { assertTextSize(output, MAX_OUTPUT_BYTES); }
  catch { throw fail('OUTPUT_TOO_LARGE', 'Generated output exceeds the allowed size.'); }
  return result;
}

export function serializeUUIDs(uuids) {
  if (!Array.isArray(uuids) || uuids.some(uuid => typeof uuid !== 'string' || !UUID_V4.test(uuid))) {
    throw fail('INVALID_UUIDS', 'Expected an array of lowercase UUID v4 values.');
  }
  const output = uuids.join('\n');
  try { assertTextSize(output, MAX_OUTPUT_BYTES); }
  catch { throw fail('OUTPUT_TOO_LARGE', 'Generated output exceeds the allowed size.'); }
  return output;
}
