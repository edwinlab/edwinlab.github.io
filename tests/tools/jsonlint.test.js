import { test, assert, equal, deepEqual, throws, run } from './harness.js';
import { formatJSON, minifyJSON, validateJSON } from '../../jsonlint/logic.js';
import { MAX_TEXT_BYTES, MAX_OUTPUT_BYTES, MAX_DEPTH } from '../../tools/shared/limits.js';
import { applyEdits, createScanner, format, SyntaxKind } from '../../tools/vendor/jsonc-parser/main.js';

function tokens(text) {
  const scanner = createScanner(text, false), result = [];
  for (let kind = scanner.scan(); kind !== SyntaxKind.EOF; kind = scanner.scan()) {
    if ([SyntaxKind.Trivia, SyntaxKind.LineBreakTrivia, SyntaxKind.LineCommentTrivia, SyntaxKind.BlockCommentTrivia].includes(kind)) continue;
    result.push(text.slice(scanner.getTokenOffset(), scanner.getTokenOffset() + scanner.getTokenLength()));
  }
  return result;
}
async function rejects(fn, code) {
  try { await fn(); } catch (error) { equal(error.code, code); return error; }
  throw new Error(`Expected error ${code}`);
}

test('Formats nested JSON with the selected two space indentation', () => {
  const actual = formatJSON('{"a":1,"b":[true,null]}', { indent: 2 });
  equal(actual, '{\n  "a": 1,\n  "b": [\n    true,\n    null\n  ]\n}');
  assert(validateJSON(actual).valid);
});
test('Formats with four spaces and rejects unsupported indentation', () => {
  assert(formatJSON('{"a":{"b":1}}', { indent: 4 }).includes('        "b"'));
  throws(() => formatJSON('{"a":1}', { indent: 3 }), undefined);
});
test('Minifies strict JSON and retains source value tokens', () => {
  equal(minifyJSON(' { "name" : "Edwin Lab", "n" : 1 } '), '{"name":"Edwin Lab","n":1}');
  const source = '{ "s" : ' + JSON.stringify('a b  "  \\  ✓') + ', "n" : -0 }';
  const compact = minifyJSON(source);
  assert(compact.includes(JSON.stringify('a b  "  \\  ✓')));
  assert(compact.endsWith('"n":-0}'));
  deepEqual(tokens(compact), tokens(source));
});
test('Format and minify preserve large numbers, overflow values, and negative zero text', () => {
  const source = '{"n":9007199254740993,"e":1e400,"z":-0}';
  assert(validateJSON(source).valid);
  for (const output of [formatJSON(source), minifyJSON(source)]) {
    for (const lexeme of ['9007199254740993', '1e400', '-0']) assert(output.includes(lexeme));
    deepEqual(tokens(output), tokens(source));
  }
});
test('Format and minify preserve Unicode and original escape spellings', () => {
  const source = String.raw`{ "emoji" : "😀 ✓", "escaped" : "\u0061" }`;
  for (const output of [formatJSON(source), minifyJSON(source)]) {
    assert(output.includes('😀 ✓'));
    assert(output.includes(String.raw`\u0061`));
    deepEqual(tokens(output), tokens(source));
  }
});
test('Formatting preserves key order and duplicate property lexemes', () => {
  const source = '{"b":1,"a":2,"a":3}';
  for (const output of [formatJSON(source), minifyJSON(source)]) {
    deepEqual(tokens(output), tokens(source));
    equal((output.match(/"a"/g) || []).length, 2);
    assert(output.indexOf('"b"') < output.indexOf('"a"'));
  }
});
test('Formatting preserves CRLF source line endings', () => {
  const actual = formatJSON('{\r\n"a":1,\r\n"b":2\r\n}');
  assert(actual.includes('\r\n'));
  equal(actual.replace(/\r\n/g, '').includes('\n'), false);
});
test('Validation accepts primitive roots and reports valid syntax separately from schema', () => {
  for (const source of ['0', 'false', 'null', '"ok"', '[]', '{}']) deepEqual(validateJSON(source), { valid: true });
  assert(validateJSON('{"id":9007199254740993}').valid);
});
test('Validation rejects empty text, JSONC, trailing commas, NaN and malformed values', () => {
  const cases = ['', '  \n', '{"a":1,}', "{'a':1}", '{"a":NaN}', '// note\n{}', '/* note */{}', '{"a" 1}', '{}{}'];
  for (const source of cases) assert(!validateJSON(source).valid, `Unexpected valid result for ${JSON.stringify(source)}`);
  equal(validateJSON('').error.code, 'EMPTY_INPUT');
});
test('Format and minify reject malformed inputs rather than using parser recovery', () => {
  for (const source of ['{"a":1,}', "{'a':1}", '{"a":NaN}', '// note\n{}', '{}{}', '']) {
    assert(throws(() => formatJSON(source)).code);
    assert(throws(() => minifyJSON(source)).code);
  }
});
test('Syntax locations identify errors with line and column for LF and CRLF', () => {
  for (const newline of ['\n', '\r\n']) {
    const source = `{${newline}  "a": 1,${newline}  bad${newline}}`;
    const error = validateJSON(source).error;
    equal(error.line, 3); equal(error.column, 3); equal(source[error.offset], 'b');
  }
});
test('Unexpected characters report a source position instead of browser parser wording', () => {
  const source = '{"a": @}';
  const result = validateJSON(source);
  assert(!result.valid); equal(result.error.line, 1); assert(result.error.column >= 1);
  assert(typeof result.error.message === 'string' && result.error.message.length > 0);
});
test('Depth boundary accepts 100 and rejects 101 before format recursion', () => {
  equal(MAX_DEPTH, 100);
  const atLimit = '['.repeat(100) + '0' + ']'.repeat(100);
  assert(validateJSON(atLimit).valid, `100-level input failed: ${JSON.stringify(validateJSON(atLimit).error)}`);
  const beyond = validateJSON('['.repeat(101) + '0' + ']'.repeat(101));
  assert(!beyond.valid, `101-level input was accepted: ${JSON.stringify(beyond)}`);
  assert(beyond.error.message.includes('depth'), `Unexpected depth message: ${beyond.error.message}`);
  const formatted = formatJSON(atLimit), formattedValidation = validateJSON(formatted);
  assert(formattedValidation.valid, `Formatted depth-100 input invalid (${formatted.length} chars): ${JSON.stringify(formattedValidation.error)} near ${JSON.stringify(formatted.slice((formattedValidation.error?.offset || 0) - 30, (formattedValidation.error?.offset || 0) + 30))}`);
});
test('Input boundary accepts exactly five MiB and reports a structured size error above it', () => {
  const exact = '"' + 'x'.repeat(MAX_TEXT_BYTES - 2) + '"';
  equal(exact.length, MAX_TEXT_BYTES); assert(validateJSON(exact).valid);
  const oversized = validateJSON(exact + ' ');
  assert(!oversized.valid); equal(oversized.error.code, 'INPUT_TOO_LARGE');
});
test('Formatter returns an output-limit error before applying oversized result edits', () => {
  equal(MAX_OUTPUT_BYTES, 10485760);
  const nestedObjects = '{"x":'.repeat(99) + '{' + '"a":0,'.repeat(799999) + '"a":0}' + '}'.repeat(99);
  const source = nestedObjects;
  assert(source.length < MAX_TEXT_BYTES); assert(validateJSON(source).valid);
  let output;
  try { output = formatJSON(source); }
  catch (error) { equal(error.code, 'OUTPUT_TOO_LARGE'); return; }
  const outputBytes = new TextEncoder().encode(output).byteLength;
  assert(false, `Expected output limit, formatter returned ${outputBytes} bytes (limit ${MAX_OUTPUT_BYTES}).`);
});
test('Output limit helper value can be used for minify without changing tokens', () => {
  const result = minifyJSON('{"a":1}');
  equal(tokens(result).length, 5); assert(result.length < MAX_OUTPUT_BYTES);
});
test('Valid and invalid JSON examples match their labels', () => {
  const valid = '{\n  "service": "profile-api",\n  "enabled": true,\n  "retryLimit": 3,\n  "regions": ["Jakarta", "Singapore"]\n}';
  const invalid = '{\n  "service": "profile-api",\n  "enabled": true,\n}';
  assert(validateJSON(valid).valid); assert(!validateJSON(invalid).valid);
});
test('JSON-like HTML is text data and formatting does not interpret markup', () => {
  const source = '{"html":"<img src=x onerror=alert(1)>"}';
  const output = formatJSON(source);
  assert(output.includes('<img src=x onerror=alert(1)>'));
  const element = document.createElement('textarea'); element.value = output;
  equal(element.children.length, 0); assert(element.value.includes('<img'));
});
test('Indent option validation and syntax validation do not reorder keys', () => {
  const source = '{"z":0,"a":1}';
  equal(tokens(formatJSON(source, { indent: 4 })).map(x => x.trim()).join(''), tokens(source).map(x => x.trim()).join(''));
});
test('Shared parser browser format API can format source edits without serializing values', () => {
  const source = '{"value":9007199254740993}';
  const edits = format(source, undefined, { insertSpaces: true, tabSize: 2, eol: '\n' });
  const output = applyEdits(source, edits);
  assert(output.includes('9007199254740993')); assert(validateJSON(output).valid);
});

await run();
