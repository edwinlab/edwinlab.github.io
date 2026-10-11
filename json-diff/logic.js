import { parseSafeJSON } from '../tools/shared/json.js';
import { assertTextSize, MAX_DEPTH, MAX_TEXT_BYTES } from '../tools/shared/limits.js';

const MAX_DIFFERENCES = 500;
const MISSING = Symbol('missing JSON value');

function assertCombinedInputSize(leftText, rightText) {
  assertTextSize(leftText, MAX_TEXT_BYTES);
  assertTextSize(rightText, MAX_TEXT_BYTES);
  const bytes = new TextEncoder().encode(leftText).byteLength + new TextEncoder().encode(rightText).byteLength;
  if (bytes > MAX_TEXT_BYTES) {
    const error = new Error('The combined inputs exceed the 5 MiB UTF-8 limit.');
    error.code = 'INPUT_TOO_LARGE';
    throw error;
  }
}

function valueType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value === 'object' ? 'object' : typeof value;
}

function pointerChild(path, key) {
  const escaped = String(key).replace(/~/g, '~0').replace(/\//g, '~1');
  return `${path}/${escaped}`;
}

function compareParsedJSON(left, right) {
  const differences = [];
  let truncated = false;
  let stopped = false;

  function record(path, type, before, after) {
    if (differences.length === MAX_DIFFERENCES) {
      truncated = true;
      stopped = true;
      return;
    }
    differences.push({ path, type, before, after });
  }

  function visit(leftValue, rightValue, path, depth) {
    if (stopped) return;
    if (depth > MAX_DEPTH) {
      const error = new Error(`The JSON structure exceeds the maximum depth of ${MAX_DEPTH}.`);
      error.code = 'MAX_DEPTH';
      throw error;
    }

    if (leftValue === MISSING) { record(path, 'added', MISSING, rightValue); return; }
    if (rightValue === MISSING) { record(path, 'removed', leftValue, MISSING); return; }

    const leftType = valueType(leftValue);
    const rightType = valueType(rightValue);
    if (leftType !== rightType) { record(path, 'changed', leftValue, rightValue); return; }

    if (leftType === 'object') {
      const keys = [...new Set([...Object.keys(leftValue), ...Object.keys(rightValue)])].sort();
      for (const key of keys) {
        if (stopped) return;
        const hasLeft = Object.hasOwn(leftValue, key);
        const hasRight = Object.hasOwn(rightValue, key);
        visit(hasLeft ? leftValue[key] : MISSING, hasRight ? rightValue[key] : MISSING, pointerChild(path, key), depth + 1);
      }
      return;
    }

    if (leftType === 'array') {
      const length = Math.max(leftValue.length, rightValue.length);
      for (let index = 0; index < length; index++) {
        if (stopped) return;
        const hasLeft = index < leftValue.length;
        const hasRight = index < rightValue.length;
        visit(hasLeft ? leftValue[index] : MISSING, hasRight ? rightValue[index] : MISSING, pointerChild(path, index), depth + 1);
      }
      return;
    }

    // JSON numbers use JavaScript's number semantics after safe parsing: -0 equals 0.
    if (leftValue !== rightValue) record(path, 'changed', leftValue, rightValue);
  }

  visit(left, right, '', 0);
  return { differences, truncated };
}

/** Compare two strict JSON texts. Object keys are order-independent; arrays use indices. */
export function compareJson(leftText, rightText) {
  assertCombinedInputSize(leftText, rightText);
  let left;
  let right;
  try { left = parseSafeJSON(leftText); }
  catch (error) { error.inputName = 'Original JSON'; throw error; }
  try { right = parseSafeJSON(rightText); }
  catch (error) { error.inputName = 'Updated JSON'; throw error; }
  return compareParsedJSON(left, right);
}

function reportValue(value) {
  if (value === MISSING) return '— (missing)';
  const type = valueType(value);
  return `[${type}] ${JSON.stringify(value)}`;
}

/** Produce a copyable plain-text report with explicit type and truncation information. */
export function formatDiffReport(result) {
  const { differences, truncated } = result;
  if (!differences.length && !truncated) return 'No differences found.';
  const lines = differences.map(({ path, type, before, after }) => {
    const displayPath = path || '(root)';
    if (type === 'added') return `ADDED ${displayPath}\n  Before: ${reportValue(before)}\n  After:  ${reportValue(after)}`;
    if (type === 'removed') return `REMOVED ${displayPath}\n  Before: ${reportValue(before)}\n  After:  ${reportValue(after)}`;
    return `CHANGED ${displayPath}\n  Before: ${reportValue(before)}\n  After:  ${reportValue(after)}`;
  });
  if (truncated) lines.push('Showing the first 500 differences. The full difference list was truncated.');
  return lines.join('\n\n');
}

export const diffLimits = Object.freeze({ maxDifferences: MAX_DIFFERENCES, maxDepth: MAX_DEPTH, maxInputBytes: MAX_TEXT_BYTES });
