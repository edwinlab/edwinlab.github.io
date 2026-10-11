import { assertTextSize } from '../tools/shared/limits.js';

export const MAX_PATTERN_BYTES = 4 * 1024;
export const MAX_INPUT_BYTES = 128 * 1024;
export const MAX_MATCHES = 2000;
export const MAX_RESULT_BYTES = 2 * 1024 * 1024;
const encoder = new TextEncoder();
// JSON escaping is included so copied/serialized captures stay within the budget.
const textBytes = value => encoder.encode(JSON.stringify(value)).byteLength;
const allowedFlags = new Set(['g', 'i', 'm', 's', 'u', 'y']);
function failure(code, message) { return Object.assign(new Error(message), { code }); }

// Main thread validates sizes and flags only. RegExp construction belongs in the worker.
export function validateRequest({ pattern, flags = 'g', text } = {}) {
  if (typeof pattern !== 'string' || typeof flags !== 'string' || typeof text !== 'string') throw failure('INVALID_REQUEST', 'Pattern, flags, and test text must be strings.');
  try { assertTextSize(pattern, MAX_PATTERN_BYTES); }
  catch { throw failure('PATTERN_TOO_LARGE', 'Pattern exceeds 4 KiB UTF-8. Shorten the pattern.'); }
  try { assertTextSize(text, MAX_INPUT_BYTES); }
  catch { throw failure('TEXT_TOO_LARGE', 'Test text exceeds 128 KiB UTF-8. Try a smaller sample.'); }
  const seen = new Set();
  for (const flag of flags) {
    if (!allowedFlags.has(flag) || seen.has(flag)) throw failure('INVALID_FLAGS', 'Use each supported flag at most once: g, i, m, s, u, y.');
    seen.add(flag);
  }
  return { pattern, flags, text };
}

function nextIndex(text, index, unicode) {
  if (!unicode || index + 1 >= text.length) return index + 1;
  const first = text.charCodeAt(index), second = text.charCodeAt(index + 1);
  return index + (first >= 0xd800 && first <= 0xdbff && second >= 0xdc00 && second <= 0xdfff ? 2 : 1);
}

// Only worker.js calls this function; no user regex runs in the page thread.
export function executeRegex(payload) {
  const { pattern, flags, text } = validateRequest(payload);
  let regex;
  try { regex = new RegExp(pattern, flags); }
  catch (cause) { throw failure('INVALID_PATTERN', `JavaScript regex could not be compiled: ${String(cause.message).slice(0, 350)}`); }
  const matches = [];
  let bytes = 0, limited = false, limitReason = null;
  while (true) {
    const match = regex.exec(text);
    if (!match) break;
    const groups = match.slice(1).map((value, i) => ({ number: i + 1, value, matched: value !== undefined }));
    const namedGroups = Object.entries(match.groups || {}).map(([name, value]) => ({ name, value, matched: value !== undefined }));
    const entry = { value: match[0], index: match.index, end: match.index + match[0].length, groups, namedGroups };
    // Count repeated captures as well as match text, with space for result metadata.
    let entryBytes = 128 + textBytes(entry.value);
    for (const group of [...groups, ...namedGroups]) {
      entryBytes += 64 + (group.name ? textBytes(group.name) : 0);
      if (group.value !== undefined) entryBytes += textBytes(group.value);
      if (bytes + entryBytes > MAX_RESULT_BYTES) break;
    }
    if (bytes + entryBytes > MAX_RESULT_BYTES) { limited = true; limitReason = 'Result text and captures reached the 2 MiB budget.'; break; }
    matches.push(entry); bytes += entryBytes;
    if (!regex.global) break;
    if (matches.length >= MAX_MATCHES) { limited = true; limitReason = 'Stopped at the 2,000-match limit; more text may remain unchecked.'; break; }
    if (match[0].length === 0) regex.lastIndex = nextIndex(text, regex.lastIndex, regex.unicode);
  }
  return { matches, limited, limitReason, resultBytes: bytes };
}
