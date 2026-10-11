import { assert, deepEqual, equal, test, throws, run } from './harness.js';
import { jsonToYaml, yamlToJson } from '../../json-yaml-converter/logic.js';

const parse = text => JSON.parse(text);

test('JSON API settings round-trip through YAML with matching data types', () => {
  const source = '{"name":"api","enabled":true,"ports":[80,443]}';
  const yaml = jsonToYaml(source);
  assert(yaml.endsWith('\n'));
  deepEqual(parse(yamlToJson(yaml)), parse(source));
});

test('YAML API settings become a JSON object with string, boolean, and numeric values', () => {
  deepEqual(parse(yamlToJson('name: api\nenabled: true\nports: [80, 443]')), { name: 'api', enabled: true, ports: [80, 443] });
});

test('YAML 1.2 keeps yes, no, on, off, and an ISO-looking date as strings', () => {
  deepEqual(parse(yamlToJson('answer: yes\nno: no\nmode: on\noff: off\ndate: 2024-01-01')), { answer: 'yes', no: 'no', mode: 'on', off: 'off', date: '2024-01-01' });
});

test('Quoted numeric IDs and boolean-looking strings retain their exact text', () => {
  const source = '{"id":"00123","flag":"true","large":"9007199254740993"}';
  deepEqual(parse(yamlToJson(jsonToYaml(source))), parse(source));
});

test('Unsafe YAML integers fail and quoted large integers remain strings', () => {
  throws(() => yamlToJson('value: 9007199254740993'), 'UNSAFE_NUMBER');
  deepEqual(parse(yamlToJson('value: "9007199254740993"')), { value: '9007199254740993' });
});

test('Unsafe JSON numbers and non-finite YAML values fail while quoted forms work', () => {
  for (const number of ['1e400', '1e20', '9007199254740993']) throws(() => jsonToYaml(`{"value":${number}}`), 'UNSAFE_NUMBER');
  for (const number of ['.nan', '.inf', '-.inf']) throws(() => yamlToJson(`value: ${number}`), 'UNSUPPORTED_NUMBER');
  deepEqual(parse(yamlToJson('nan: ".nan"\ninf: ".inf"\nlarge: "9007199254740993"')), { nan: '.nan', inf: '.inf', large: '9007199254740993' });
});

test('Explicit custom tags, timestamp tags, anchors, and aliases are rejected', () => {
  throws(() => yamlToJson('x: !custom value'), 'INVALID_YAML');
  throws(() => yamlToJson('x: !!timestamp 2024-01-01'), 'UNSUPPORTED_TAG');
  throws(() => yamlToJson('a: &x [1]\nb: *x'), 'UNSUPPORTED_ALIAS');
  throws(() => yamlToJson('a: &x [*x]'), 'UNSUPPORTED_ALIAS');
});

test('Duplicate keys, multiple documents, complex keys, and YAML 1.1 are rejected', () => {
  throws(() => yamlToJson('a: 1\na: 2'), 'INVALID_YAML');
  throws(() => yamlToJson('a: 1\n---\nb: 2'), 'INVALID_YAML');
  throws(() => yamlToJson('? [a, b]\n: c'), 'INVALID_KEY');
  throws(() => yamlToJson('%YAML 1.1\n---\nx: yes'), 'UNSUPPORTED_VERSION');
});

test('Numeric YAML keys are rejected but quoted numeric string keys are accepted', () => {
  throws(() => yamlToJson('1: value'), 'INVALID_KEY');
  deepEqual(parse(yamlToJson('"1": value')), { '1': 'value' });
});

test('__proto__ is preserved as own mapping data without prototype mutation', () => {
  const text = yamlToJson('__proto__: {polluted: true}');
  const value = parse(text);
  assert(Object.hasOwn(value, '__proto__'));
  assert(!Object.hasOwn(Object.prototype, 'polluted'));
  deepEqual(value.__proto__, { polluted: true });
});

test('Null, boolean, array, and string roots convert both ways', () => {
  for (const source of ['null', 'false', '[1,2]', '"hello"']) deepEqual(parse(yamlToJson(jsonToYaml(source))), parse(source));
});

test('Empty JSON and YAML input are rejected', () => {
  throws(() => jsonToYaml(''), 'EMPTY_INPUT'); throws(() => jsonToYaml(' \n '), 'EMPTY_INPUT');
  throws(() => yamlToJson(''), 'EMPTY_INPUT'); throws(() => yamlToJson('  \n'), 'EMPTY_INPUT');
});

test('Multiline strings and Unicode survive both directions', () => {
  const value = { note: 'first\nsecond\n', emoji: '🙂 café' };
  deepEqual(parse(yamlToJson(jsonToYaml(JSON.stringify(value)))), value);
  deepEqual(parse(yamlToJson('note: |\n  first\n  second\nemoji: "🙂 café"')), { note: 'first\nsecond\n', emoji: '🙂 café' });
});

test('JSON and YAML depth is limited to 100 nested collections', () => {
  const nested = depth => '['.repeat(depth) + '0' + ']'.repeat(depth);
  jsonToYaml(nested(100)); throws(() => jsonToYaml(nested(101)), 'MAX_DEPTH');
  const yaml = Array.from({ length: 101 }, (_, index) => `${'  '.repeat(index)}a:`).join('\n') + '\n' + '  '.repeat(101) + '0';
  throws(() => yamlToJson(yaml), 'MAX_DEPTH');
});

test('Input larger than the shared 5 MiB limit is rejected before parsing', () => {
  throws(() => jsonToYaml(' '.repeat(5 * 1024 * 1024 + 1)), 'INPUT_TOO_LARGE');
  throws(() => yamlToJson('x'.repeat(5 * 1024 * 1024 + 1)), 'INPUT_TOO_LARGE');
});

test('Strings containing HTML stay literal text and output length is checked', () => {
  assert(jsonToYaml('{"html":"<script>alert(1)</script>"}').includes('<script>alert(1)</script>'));
  equal(yamlToJson('html: "<script>alert(1)</script>"'), '{\n  "html": "<script>alert(1)</script>"\n}');
});

test('JSON numbers that underflow to zero are rejected, but quoted text is accepted', () => {
  throws(() => jsonToYaml('{"n":1e-400}'), 'UNSAFE_NUMBER');
  deepEqual(parse(yamlToJson('{"n":"1e-400"}')), { n: '1e-400' });
});

test('Direct page SEO, no-JS guide, and local YAML module are present', async () => {
  const response = await fetch('/json-yaml-converter/'); assert(response.ok);
  const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
  equal(doc.title, 'JSON to YAML & YAML to JSON Converter — Edwin Lab');
  equal(doc.querySelector('h1').textContent, 'JSON ↔ YAML Converter');
  equal(doc.querySelector('link[rel=canonical]').href, 'https://edwinlab.dev/json-yaml-converter/');
  assert(doc.querySelector('noscript').textContent.includes('Enable JavaScript'));
  assert(doc.querySelector('article').textContent.includes('Are YAML comments preserved?') || doc.querySelector('article').textContent.includes('comments'));
  assert([...doc.querySelectorAll('script[src]')].every(script => script.src.startsWith(location.origin + '/')));
});

await run();
