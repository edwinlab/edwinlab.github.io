import { createScanner, SyntaxKind, visit, printParseErrorCode } from '../vendor/jsonc-parser/main.js';
import { assertTextSize, MAX_DEPTH } from './limits.js';
const strictOptions = { disallowComments: true, allowTrailingComma: false, allowEmptyContent: false };

function at(text, offset) {
  let line = 1, column = 1;
  for (let i = 0; i < offset; i++) {
    if (text[i] === '\r') { line++; column = 1; if (text[i + 1] === '\n' && i + 1 < offset) i++; }
    else if (text[i] === '\n') { line++; column = 1; }
    else column++;
  }
  return { offset, line, column };
}

function failure(text, code, message, offset = 0) {
  return { valid: false, error: { code, message, ...at(text, offset) } };
}

/** Syntax-only validation never materializes JSON numbers or objects. */
export function validateJSON(text) {
  assertTextSize(text);
  const scanner = createScanner(text, false);
  let depth = 0;
  for (let token = scanner.scan(); token !== SyntaxKind.EOF; token = scanner.scan()) {
    if (token === SyntaxKind.OpenBraceToken || token === SyntaxKind.OpenBracketToken) {
      if (++depth > MAX_DEPTH) return failure(text, 'MAX_DEPTH', `JSON exceeds the maximum depth of ${MAX_DEPTH}.`, scanner.getTokenOffset());
    } else if (token === SyntaxKind.CloseBraceToken || token === SyntaxKind.CloseBracketToken) depth = Math.max(0, depth - 1);
  }
  let firstError;
  visit(text, { onError(code, offset) { firstError ??= failure(text, 'INVALID_JSON', printParseErrorCode(code), offset); } }, strictOptions);
  return firstError ?? { valid: true };
}

/** Validate before JSON.parse so duplicate keys and unsupported numbers cannot disappear. */
export function parseSafeJSON(text) {
  const result = validateJSON(text);
  if (!result.valid) {
    const error = new Error(result.error.message);
    Object.assign(error, result.error);
    throw error;
  }
  const stack = [];
  const fail = (code, message, offset) => {
    const error = new Error(message);
    Object.assign(error, { code, ...at(text, offset) });
    throw error;
  };
  visit(text, {
    onObjectBegin() { stack.push(new Set()); },
    onObjectEnd() { stack.pop(); },
    onArrayBegin() { stack.push(null); },
    onArrayEnd() { stack.pop(); },
    onObjectProperty(key, offset) {
      const keys = stack[stack.length - 1];
      if (keys.has(key)) fail('DUPLICATE_KEY', `Duplicate JSON key: ${key}`, offset);
      keys.add(key);
    },
    onLiteralValue(value, offset, length) {
      if (typeof value !== 'number') return;
      const token = text.slice(offset, offset + length);
      const number = Number(token);
      const nonzero = /[1-9]/.test(token.split(/[eE]/)[0]);
      if (!Number.isFinite(number) || (Number.isInteger(number) && !Number.isSafeInteger(number)) || (number === 0 && nonzero)) {
        fail('UNSAFE_NUMBER', `Number cannot be represented safely: ${token}. Use a string for large numeric IDs.`, offset);
      }
    }
  }, strictOptions);
  // Native parsing preserves __proto__ as an own data property. Do not merge this into config objects.
  return JSON.parse(text);
}
