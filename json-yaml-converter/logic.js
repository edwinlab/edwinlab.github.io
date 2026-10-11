import { parseDocument, stringify, isAlias, isMap, isScalar, isSeq } from '../tools/vendor/yaml/index.js';
import { parseSafeJSON } from '../tools/shared/json.js';
import { assertTextSize, MAX_DEPTH, MAX_OUTPUT_BYTES } from '../tools/shared/limits.js';

function fail(code, message, cause) {
  const error = new Error(message);
  error.code = code;
  if (cause) {
    error.cause = cause;
    const position = cause.linePos?.[0];
    if (position) Object.assign(error, { line: position.line, column: position.col });
  }
  return error;
}
function checkInput(text) {
  assertTextSize(text);
  if (!text.trim()) throw fail('EMPTY_INPUT', 'Enter a JSON or YAML document to convert.');
}
function boundedOutput(output) {
  try { assertTextSize(output, MAX_OUTPUT_BYTES); }
  catch { throw fail('OUTPUT_TOO_LARGE', 'Converted output exceeds the 10 MiB output limit.'); }
  return output;
}

export function jsonToYaml(text) {
  checkInput(text);
  let value;
  try { value = parseSafeJSON(text); }
  catch (error) {
    if (error.code === 'INPUT_TOO_LARGE') throw error;
    throw fail(error.code || 'INVALID_JSON', formatError(error, 'Invalid JSON'), error);
  }
  let output;
  try { output = stringify(value, { indent: 2, lineWidth: 0 }); }
  catch (error) { throw fail('CONVERSION_ERROR', `JSON could not be represented as YAML: ${error.message}`, error); }
  if (!output.endsWith('\n')) output += '\n';
  return boundedOutput(output);
}

function formatError(error, prefix) {
  const location = error.line && error.column ? ` at line ${error.line}, column ${error.column}` : '';
  return `${prefix}${location}: ${error.message}`;
}

function rejectAliases(node, path = '$') {
  if (!node) return;
  if (isAlias(node)) throw fail('UNSUPPORTED_ALIAS', `YAML aliases are not supported (${path}).`);
  if (isSeq(node)) node.items.forEach((item, index) => rejectAliases(item, `${path}[${index}]`));
  else if (isMap(node)) node.items.forEach(pair => rejectAliases(pair?.value, `${path}.${isScalar(pair?.key) ? pair.key.value : '?'}`));
}

function inspectNode(node, depth = 0, path = '$', seen = new WeakSet()) {
  if (!node) return;
  if (isAlias(node)) throw fail('UNSUPPORTED_ALIAS', `YAML aliases are not supported (${path}).`);
  if (isScalar(node)) {
    if (node.anchor) throw fail('UNSUPPORTED_ANCHOR', `YAML anchors are not supported (${path}).`);
    if (node.tag) throw fail('UNSUPPORTED_TAG', `Explicit YAML tags are not supported (${path}).`);
    const value = node.value;
    if (typeof value === 'number' && !Number.isFinite(value)) throw fail('UNSUPPORTED_NUMBER', `Non-finite numbers are not supported (${path}).`);
    if (typeof value === 'bigint' && (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER))) {
      throw fail('UNSAFE_NUMBER', `Integer at ${path} exceeds the safe JavaScript integer range; quote it if it is an identifier.`);
    }
    if (!['string', 'number', 'bigint', 'boolean'].includes(typeof value) && value !== null) {
      throw fail('UNSUPPORTED_VALUE', `This YAML scalar cannot be represented as JSON (${path}).`);
    }
    return;
  }
  if (isSeq(node) || isMap(node)) {
    if (node.anchor) throw fail('UNSUPPORTED_ANCHOR', `YAML anchors are not supported (${path}).`);
    if (seen.has(node)) throw fail('CYCLIC_VALUE', `Cyclic YAML values are not supported (${path}).`);
    seen.add(node);
    if (depth + 1 > MAX_DEPTH) throw fail('MAX_DEPTH', `YAML exceeds the maximum depth of ${MAX_DEPTH} at ${path}.`);
    if (isSeq(node)) {
      node.items.forEach((item, index) => inspectNode(item, depth + 1, `${path}[${index}]`, seen));
    } else {
      const keys = new Set();
      for (const pair of node.items) {
        if (!pair || !isScalar(pair.key) || typeof pair.key.value !== 'string') {
          throw fail('INVALID_KEY', `Mapping keys must be strings (${path}).`);
        }
        const key = pair.key.value;
        if (key === '<<') throw fail('UNSUPPORTED_MERGE', `YAML merge keys are not supported (${path}).`);
        if (pair.key.anchor || pair.key.tag) throw fail(pair.key.anchor ? 'UNSUPPORTED_ANCHOR' : 'UNSUPPORTED_TAG', `Anchors and explicit tags are not supported on mapping keys (${path}).`);
        if (keys.has(key)) throw fail('DUPLICATE_KEY', `Duplicate YAML mapping key ${JSON.stringify(key)} at ${path}.`);
        keys.add(key);
        inspectNode(pair.value, depth + 1, `${path}.${key}`, seen);
      }
    }
    seen.delete(node);
    return;
  }
  throw fail('UNSUPPORTED_VALUE', `YAML node cannot be represented as JSON (${path}).`);
}

function toSafeValue(node, path = '$') {
  if (isScalar(node)) {
    if (typeof node.value === 'bigint') return Number(node.value);
    return node.value;
  }
  if (isSeq(node)) return node.items.map((item, index) => toSafeValue(item, `${path}[${index}]`));
  if (isMap(node)) {
    const result = Object.create(null);
    for (const pair of node.items) {
      Object.defineProperty(result, pair.key.value, {
        value: toSafeValue(pair.value, `${path}.${pair.key.value}`), enumerable: true, writable: true, configurable: true,
      });
    }
    return result;
  }
  throw fail('UNSUPPORTED_VALUE', `YAML node cannot be represented as JSON (${path}).`);
}

export function yamlToJson(text) {
  checkInput(text);
  if (/^\s*%YAML[ \t]+1\.1(?:[ \t]|$)/m.test(text)) throw fail('UNSUPPORTED_VERSION', 'YAML 1.1 directives are not supported. Use YAML 1.2.');
  let document;
  try {
    document = parseDocument(text, { version: '1.2', schema: 'core', intAsBigInt: true, merge: false, uniqueKeys: true, resolveKnownTags: true });
  } catch (error) { throw fail('INVALID_YAML', formatError(error, 'Invalid YAML'), error); }
  if (document.errors.length) throw fail('INVALID_YAML', formatError(document.errors[0], 'Invalid YAML'), document.errors[0]);
  if (document.warnings.length) throw fail('INVALID_YAML', formatError(document.warnings[0], 'YAML warning'), document.warnings[0]);
  if (!document.contents) throw fail('EMPTY_INPUT', 'Enter a YAML document to convert.');
  rejectAliases(document.contents);
  inspectNode(document.contents);

  // The parser's own alias-expansion ceiling remains explicit, even though aliases are rejected above.
  let parsed;
  try { parsed = document.toJS({ maxAliasCount: 0, mapAsMap: true }); }
  catch (error) { throw fail('INVALID_YAML', formatError(error, 'YAML cannot be converted'), error); }
  if (parsed === undefined) throw fail('UNSUPPORTED_VALUE', 'YAML value cannot be represented as JSON.');
  const output = JSON.stringify(toSafeValue(document.contents), null, 2);
  if (output === undefined) throw fail('UNSUPPORTED_VALUE', 'YAML value cannot be represented as JSON.');
  return boundedOutput(output);
}
