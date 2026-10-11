import { applyEdits, format, SyntaxKind, createScanner } from '../tools/vendor/jsonc-parser/main.js';
import { assertTextSize, MAX_OUTPUT_BYTES, MAX_DEPTH } from '../tools/shared/limits.js';
import { validateJSON as validateStrictJSON } from '../tools/shared/json.js';

const trivia = new Set([SyntaxKind.Trivia, SyntaxKind.LineBreakTrivia, SyntaxKind.LineCommentTrivia, SyntaxKind.BlockCommentTrivia, SyntaxKind.EOF]);
const encoder = new TextEncoder();

function *significantTokens(text) {
  const scanner = createScanner(text, false);
  for (let kind = scanner.scan(); kind !== SyntaxKind.EOF; kind = scanner.scan()) {
    if (trivia.has(kind)) continue;
    const offset = scanner.getTokenOffset();
    yield { kind, raw: text.slice(offset, offset + scanner.getTokenLength()) };
  }
}

function maximumNesting(text) {
  const scanner = createScanner(text, false);
  let depth = 0, maximum = 0;
  for (let kind = scanner.scan(); kind !== SyntaxKind.EOF; kind = scanner.scan()) {
    if (kind === SyntaxKind.OpenBraceToken || kind === SyntaxKind.OpenBracketToken) maximum = Math.max(maximum, ++depth);
    else if (kind === SyntaxKind.CloseBraceToken || kind === SyntaxKind.CloseBracketToken) depth--;
  }
  return maximum;
}

// jsonc-parser's formatter caches indentation strings for ordinary JSON. At
// very deep indentation those cached entries can be undefined; format directly
// from validated source tokens in that case, never from parsed values.
function formatDeepJSON(text, indent, eol) {
  const iterator = significantTokens(text);
  let current = iterator.next(), following = iterator.next();
  let depth = 0, outputBytes = 0, pending = '', chunks = '';
  const flush = () => {
    if (!pending) return;
    outputBytes += encoder.encode(pending).byteLength;
    if (outputBytes > MAX_OUTPUT_BYTES) {
      const error = new Error('The formatted output exceeds the 10 MiB output limit. Try a smaller JSON document.');
      error.code = 'OUTPUT_TOO_LARGE';
      throw error;
    }
    chunks += pending;
    pending = '';
  };
  const append = value => {
    pending += value;
    if (pending.length >= 8192) flush();
  };
  const newline = level => append(eol + ' '.repeat(level * indent));
  while (!current.done) {
    const token = current.value;
    if ((token.kind === SyntaxKind.OpenBraceToken && following.value?.kind === SyntaxKind.CloseBraceToken) ||
        (token.kind === SyntaxKind.OpenBracketToken && following.value?.kind === SyntaxKind.CloseBracketToken)) {
      append(token.raw + following.value.raw);
      current = iterator.next();
      following = iterator.next();
      continue;
    }
    if (token.kind === SyntaxKind.OpenBraceToken || token.kind === SyntaxKind.OpenBracketToken) {
      append(token.raw);
      depth++;
      newline(depth);
    } else if (token.kind === SyntaxKind.CloseBraceToken || token.kind === SyntaxKind.CloseBracketToken) {
      depth--;
      newline(depth);
      append(token.raw);
    } else if (token.kind === SyntaxKind.CommaToken) {
      append(token.raw);
      newline(depth);
    } else if (token.kind === SyntaxKind.ColonToken) append(': ');
    else append(token.raw);
    current = following;
    following = iterator.next();
  }
  flush();
  return chunks;
}

function asSyntaxError(error) {
  const result = new Error(error.message || 'The text is not valid JSON. Check its syntax and try again.');
  Object.assign(result, { code: error.code || 'INVALID_JSON', offset: error.offset, line: error.line, column: error.column });
  return result;
}

function ensureStrict(text) {
  assertTextSize(text);
  if (!text.trim()) {
    const error = new Error('Enter JSON before validating or formatting.');
    Object.assign(error, { code: 'EMPTY_INPUT', offset: 0, line: 1, column: 1 });
    throw error;
  }
  const validation = validateStrictJSON(text);
  if (!validation.valid) throw asSyntaxError(validation.error);
}

function ensureOutput(text) {
  try { assertTextSize(text, MAX_OUTPUT_BYTES); }
  catch (error) {
    const wrapped = new Error('The formatted output exceeds the 10 MiB output limit. Try a smaller JSON document.');
    wrapped.code = 'OUTPUT_TOO_LARGE';
    throw wrapped;
  }
  return text;
}

function applyBoundedEdits(text, edits) {
  const encoder = new TextEncoder();
  let outputBytes = encoder.encode(text).byteLength;
  for (const edit of edits) {
    const original = text.slice(edit.offset, edit.offset + edit.length);
    outputBytes += encoder.encode(edit.content).byteLength - encoder.encode(original).byteLength;
  }
  if (outputBytes > MAX_OUTPUT_BYTES) {
    const error = new Error('The formatted output exceeds the 10 MiB output limit. Try a smaller JSON document.');
    error.code = 'OUTPUT_TOO_LARGE';
    throw error;
  }
  return ensureOutput(applyEdits(text, edits));
}

/** Strict syntax validation only. Valid JSON may still contain values unsuitable for a particular consumer. */
export function validateJSON(text) {
  try {
    assertTextSize(text);
    if (!text.trim()) return { valid: false, error: { code: 'EMPTY_INPUT', message: 'Enter JSON before validating.', offset: 0, line: 1, column: 1 } };
    return validateStrictJSON(text);
  } catch (error) {
    return { valid: false, error: { code: error.code || 'INVALID_JSON', message: error.message, offset: error.offset ?? 0, line: error.line ?? 1, column: error.column ?? 1 } };
  }
}

/** Applies whitespace edits to the original source; scalar tokens are never parsed or re-serialized. */
export function formatJSON(text, { indent = 2 } = {}) {
  ensureStrict(text);
  if (indent !== 2 && indent !== 4) throw new RangeError('Indentation must be 2 or 4 spaces.');
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  if (maximumNesting(text) * indent >= 20) return formatDeepJSON(text, indent, eol);
  const formatted = applyBoundedEdits(text, format(text, undefined, { insertSpaces: true, tabSize: indent, eol }));
  const before = significantTokens(text), after = significantTokens(formatted);
  while (true) {
    const original = before.next(), candidate = after.next();
    if (original.done || candidate.done) {
      if (original.done !== candidate.done) return formatDeepJSON(text, indent, eol);
      break;
    }
    if (original.value.kind !== candidate.value.kind || original.value.raw !== candidate.value.raw) return formatDeepJSON(text, indent, eol);
  }
  return formatted;
}

/** Removes whitespace tokens while copying every significant lexeme directly from the valid input. */
export function minifyJSON(text) {
  ensureStrict(text);
  const scanner = createScanner(text, false);
  const tokens = [];
  for (let kind = scanner.scan(); kind !== SyntaxKind.EOF; kind = scanner.scan()) {
    if (scanner.getTokenError() !== 0) {
      const error = new Error('JSON contains an invalid token.');
      Object.assign(error, { code: 'INVALID_JSON', offset: scanner.getTokenOffset() });
      throw error;
    }
    if (trivia.has(kind)) continue;
    const start = scanner.getTokenOffset();
    tokens.push(text.slice(start, start + scanner.getTokenLength()));
  }
  return ensureOutput(tokens.join(''));
}

export { MAX_DEPTH };
