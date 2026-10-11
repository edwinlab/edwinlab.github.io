export const MAX_TEXT_BYTES = 5 * 1024 * 1024;
export const MAX_OUTPUT_BYTES = 10 * 1024 * 1024;
export const MAX_DEPTH = 100;
const encoder = new TextEncoder();

/** Limits are UTF-8 bytes, not UTF-16 string length. Exact limits are accepted. */
export function assertTextSize(text, maxBytes = MAX_TEXT_BYTES) {
  if (typeof text !== 'string') throw new TypeError('Expected text to be a string.');
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) throw new RangeError('Invalid byte limit.');
  // A UTF-16 code unit uses at least one UTF-8 byte; avoid allocating oversized input.
  if (text.length > maxBytes || encoder.encode(text).byteLength > maxBytes) {
    const error = new Error(`Text exceeds the ${maxBytes.toLocaleString('en-US')}-byte limit.`);
    error.code = 'INPUT_TOO_LARGE';
    throw error;
  }
}
