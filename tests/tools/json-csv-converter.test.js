import { assert, deepEqual, equal, test, throws, run } from './harness.js';
import { csvToJson, jsonToCsv, parseCsv } from '../../json-csv-converter/logic.js';

const parse = text => JSON.parse(text);

test('JSON objects export CRLF rows with missing and null cells empty', () => {
  equal(jsonToCsv('[{"name":"Ada","age":30},{"name":"Lin","age":null}]').output, 'name,age\r\nAda,30\r\nLin,');
});

test('Header is first-seen union; missing keys stay blank and empty array has no invented header', () => {
  equal(jsonToCsv('[{"a":1},{"b":2}]').output, 'a,b\r\n1,\r\n,2');
  const empty = jsonToCsv('[]'); equal(empty.output, ''); equal(empty.rowCount, 0); deepEqual(empty.headers, []);
});

test('CSV quotes delimiter and doubles embedded quotes', () => {
  equal(jsonToCsv('[{"note":"a,b"},{"note":"say \\"hi\\""}]').output, 'note\r\n"a,b"\r\n"say ""hi"""');
});

test('Quoted multiline CSV preserves a leading-zero identifier and cell newline', () => {
  deepEqual(parse(csvToJson('id,note\r\n00123,"first\nsecond"').output), [{ id: '00123', note: 'first\nsecond' }]);
});

test('CSV values that look numeric or boolean stay exact strings', () => {
  deepEqual(parse(csvToJson('n,big,flag\n1e3,9007199254740993,true').output), [{ n: '1e3', big: '9007199254740993', flag: 'true' }]);
});

test('CSV supports one optional final newline and header-only input', () => {
  deepEqual(parse(csvToJson('a,b\r\n1,2\r\n').output), [{ a: '1', b: '2' }]);
  equal(csvToJson('a,b').output, '[]'); equal(csvToJson('a,b').rowCount, 0);
  throws(() => csvToJson(''), 'EMPTY_INPUT');
});

test('CSV rejects mismatched cells, empty or duplicate headers, and malformed quotes', () => {
  for (const input of ['a,b\n1', 'a,a\n1,2', ',b\n1,2', 'a\n"unterminated', 'a\nx"y', 'a\n"x"tail']) {
    let error;
    try { csvToJson(input); } catch (caught) { error = caught; }
    assert(error && ['ROW_WIDTH','DUPLICATE_HEADER','INVALID_HEADER','INVALID_CSV'].includes(error.code), `Expected a CSV error for ${JSON.stringify(input)}`);
  }
});

test('CSV supports BOM and rejects text after closing quotes', () => {
  deepEqual(parse(csvToJson('\ufeffa\n1').output), [{ a: '1' }]);
  throws(() => csvToJson('a\n"x" tail'), 'INVALID_CSV');
});

test('Semicolon and tab delimiters use the same parsing rules', () => {
  deepEqual(parse(csvToJson('a;b\n1;2', { delimiter: ';' }).output), [{ a: '1', b: '2' }]);
  deepEqual(parse(csvToJson('a\tb\n1\t2', { delimiter: '\t' }).output), [{ a: '1', b: '2' }]);
  equal(jsonToCsv('[{"a":"x;y"}]', { delimiter: ';' }).output, 'a\r\n"x;y"');
  equal(jsonToCsv(JSON.stringify([{ a: 'x\ty' }]), { delimiter: '\t' }).output, 'a\r\n"x\ty"');
});

test('Nested JSON values reject by default and serialize into one quoted cell when requested', () => {
  throws(() => jsonToCsv('[{"a":{"x":1}}]'), 'NESTED_VALUE');
  equal(jsonToCsv('[{"a":{"x":1}}]', { nestedMode: 'json' }).output, 'a\r\n"{""x"":1}"');
});

test('Formula safety prefixes risky text values and headers before normal CSV quoting', () => {
  equal(jsonToCsv('[{"x":"=1+1"}]').output, "x\r\n'=1+1");
  equal(jsonToCsv('[{"=header":"=SUM(A1)"}]').output, "'=header\r\n'=SUM(A1)");
  equal(jsonToCsv('[{"x":"=1+1"}]', { escapeSpreadsheetFormulas: false }).output, 'x\r\n=1+1');
});

test('Formula prefixes include plus, minus, at, whitespace, tabs, CR, and LF', () => {
  for (const value of ['+cmd', '-1', '@SUM(A1)', ' =1', '\u00a0=1', '\t=1', '\r=1', '\n=1']) {
    const csv = jsonToCsv(JSON.stringify([{ x: value }])).output;
    assert(csv.includes("'" + value), `Did not escape ${JSON.stringify(value)}`);
  }
});

test('Native negative JSON numbers remain numeric text, unlike negative strings', () => {
  equal(jsonToCsv('[{"number":-1,"text":"-1"}]').output, "number,text\r\n-1,'-1");
});

test('__proto__ remains an own JSON key without prototype mutation on CSV import/export', () => {
  const csv = jsonToCsv('[{"__proto__":"safe"}]', { escapeSpreadsheetFormulas: false }).output;
  const json = parse(csvToJson('__proto__\nsafe').output);
  assert(Object.hasOwn(json[0], '__proto__')); equal(json[0].__proto__, 'safe');
  assert(!Object.hasOwn(Object.prototype, 'polluted'));
  assert(csv.startsWith('__proto__'));
});

test('JSON numbers are safely parsed and CSV cell HTML stays plain text', () => {
  throws(() => jsonToCsv('[{"id":9007199254740993}]'), 'UNSAFE_NUMBER');
  equal(jsonToCsv('[{"id":"9007199254740993"}]').rowCount, 1);
  equal(csvToJson('html\n"<script>alert(1)</script>"').output.includes('<script>alert(1)</script>'), true);
});

test('JSON root must be an array of non-null objects with unique source keys', () => {
  for (const source of ['{}', 'null', '[null]', '[1]', '[[]]', '[{"a":1,"a":2}]']) {
    let error; try { jsonToCsv(source); } catch (caught) { error = caught; }
    assert(error, `Expected invalid JSON-to-CSV input: ${source}`);
  }
});

test('A blank interior record is one empty cell and must match header width', () => {
  throws(() => csvToJson('a,b\n\n'), 'ROW_WIDTH');
  deepEqual(parse(csvToJson('a\n\n').output), [{ a: '' }]);
});

test('Twenty-one rows show only twenty in preview while output stays complete', () => {
  const result = jsonToCsv(JSON.stringify(Array.from({ length: 21 }, (_, i) => ({ id: i }))));
  equal(result.preview.length, 20); equal(result.rowCount, 21); assert(result.previewTruncated);
  equal(result.output.split('\r\n').length, 22);
});

test('Input byte limit and JSON nesting depth are enforced before conversion', () => {
  throws(() => jsonToCsv(' '.repeat(5 * 1024 * 1024 + 1)), 'INPUT_TOO_LARGE');
  throws(() => csvToJson('x'.repeat(5 * 1024 * 1024 + 1)), 'INPUT_TOO_LARGE');
  const nested = depth => '['.repeat(depth) + '{}'+']'.repeat(depth);
  throws(() => jsonToCsv(nested(101)), 'MAX_DEPTH');
});

test('Input and output options validate and return useful conversion metadata', () => {
  throws(() => jsonToCsv('[{"x":1}]', { delimiter: ':' }), 'INVALID_DELIMITER');
  throws(() => jsonToCsv('[{"x":1}]', { nestedMode: 'flatten' }), 'INVALID_NESTED_MODE');
  throws(() => csvToJson('a\n1', { delimiter: ':' }), 'INVALID_DELIMITER');
  const result = csvToJson('a,b\n1,2'); equal(result.rowCount, 1); deepEqual(result.headers, ['a', 'b']);
});

test('Static page has canonical metadata, safety guidance, and no-JS content', async () => {
  const response = await fetch('/json-csv-converter/'); assert(response.ok);
  const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
  equal(doc.title, 'JSON to CSV & CSV to JSON Converter — Edwin Lab');
  equal(doc.querySelector('h1').textContent, 'JSON ↔ CSV Converter');
  equal(doc.querySelector('link[rel=canonical]').href, 'https://edwinlab.dev/json-csv-converter/');
  assert(doc.querySelector('noscript').textContent.includes('Enable JavaScript'));
  assert(doc.querySelector('article').textContent.includes('This reduces formula risk'));
  assert([...doc.querySelectorAll('script[src]')].every(script => script.src.startsWith(location.origin + '/')));
});

await run();
