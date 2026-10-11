import { assert, deepEqual, equal, test, throws, run } from './harness.js';
import { compareJson, diffLimits, formatDiffReport } from '../../json-diff/logic.js';

test('object key order and whitespace do not create differences', () => {
  deepEqual(compareJson('{"a":1,"b":2}', '{ "b": 2, "a": 1 }'), { differences: [], truncated: false });
});

test('reports changed, removed, and added object properties at stable paths', () => {
  const result = compareJson('{"a":1,"b":2}', '{"a":3,"c":4}');
  deepEqual(result.differences.map(({ path, type }) => ({ path, type })), [
    { path: '/a', type: 'changed' }, { path: '/b', type: 'removed' }, { path: '/c', type: 'added' }
  ]);
  deepEqual([result.differences[0].before, result.differences[0].after], [1, 3]);
  equal(result.differences[1].before, 2);
  equal(result.differences[2].after, 4);
  // The missing side is a sentinel, not null or the string "missing".
  assert(result.differences[1].after !== null);
  assert(result.differences[1].after !== 'missing');
});

test('null is a present value and differs from a missing property', () => {
  equal(compareJson('{"x":null}', '{}').differences[0].type, 'removed');
  equal(compareJson('{}', '{"x":null}').differences[0].type, 'added');
  equal(compareJson('{"x":null}', '{"x":"missing"}').differences[0].type, 'changed');
});

test('JSON Pointer escapes slash and tilde in property names', () => {
  equal(compareJson('{"a/b":{"~k":1}}', '{"a/b":{"~k":2}}').differences[0].path, '/a~1b/~0k');
});

test('arrays compare by index and report extra values once', () => {
  const { differences } = compareJson('[1,2]', '[2,1,3]');
  deepEqual(differences.map(({ path, type }) => ({ path, type })), [
    { path: '/0', type: 'changed' }, { path: '/1', type: 'changed' }, { path: '/2', type: 'added' }
  ]);
  deepEqual(differences.slice(0, 2).map(({ before, after }) => [before, after]), [[1, 2], [2, 1]]);
  equal(differences[2].after, 3);
});

test('type changes are a single record while a new subtree is one added record', () => {
  deepEqual(compareJson('{"x":{"a":1}}', '{"x":[]}').differences.map(({ path, type }) => ({ path, type })), [{ path: '/x', type: 'changed' }]);
  deepEqual(compareJson('{}', '{"x":{"a":1}}').differences.map(({ path, type }) => ({ path, type })), [{ path: '/x', type: 'added' }]);
});

test('root values and JavaScript numeric equality are explicit', () => {
  const root = compareJson('1', '"1"').differences[0];
  deepEqual({ path: root.path, type: root.type, before: root.before, after: root.after }, { path: '', type: 'changed', before: 1, after: '1' });
  equal(compareJson('-0', '0').differences.length, 0);
  equal(compareJson('1.0', '1e0').differences.length, 0);
});

test('duplicate keys are rejected and identify the original input', () => {
  const error = throws(() => compareJson('{"a":1,"a":2}', '{"a":2}'), 'DUPLICATE_KEY');
  equal(error.inputName, 'Original JSON');
});

test('unsafe numeric values are rejected while quoted identifiers remain exact', () => {
  for (const token of ['9007199254740993', '9007199254740992.0', '1e20', '1e400', '1e-400']) {
    throws(() => compareJson(token, '0'), 'UNSAFE_NUMBER');
  }
  equal(compareJson('"9007199254740993"', '"9007199254740993"').differences.length, 0);
});

test('invalid left and right JSON errors name the input without partial results', () => {
  equal(throws(() => compareJson('{', '{}'), 'INVALID_JSON').inputName, 'Original JSON');
  equal(throws(() => compareJson('{}', '{'), 'INVALID_JSON').inputName, 'Updated JSON');
  throws(() => compareJson('', '{}'), 'INVALID_JSON');
});

test('prototype-looking keys remain ordinary data', () => {
  const before = Object.prototype.polluted;
  const result = compareJson('{"__proto__":{"polluted":true}}', '{}');
  deepEqual(result.differences.map(({ path, type }) => ({ path, type })), [{ path: '/__proto__', type: 'removed' }]);
  equal(Object.prototype.polluted, before);
  equal(compareJson('{"constructor":1,"prototype":2}', '{"constructor":1,"prototype":2}').differences.length, 0);
});

test('more than 500 changes stop traversal and mark the result truncated', () => {
  const left = JSON.stringify(Array.from({ length: 501 }, () => 0));
  const right = JSON.stringify(Array.from({ length: 501 }, () => 1));
  const result = compareJson(left, right);
  equal(result.differences.length, 500);
  equal(result.truncated, true);
  const report = formatDiffReport(result);
  assert(report.includes('Showing the first 500 differences'));
});

test('exactly 500 changes are complete if there is no later difference', () => {
  const left = JSON.stringify(Array.from({ length: 500 }, () => 0));
  const right = JSON.stringify(Array.from({ length: 500 }, () => 1));
  const result = compareJson(left, right);
  equal(result.differences.length, 500);
  equal(result.truncated, false);
});

test('depth and combined UTF-8 input limits are enforced', () => {
  const atDepthLimit = `${'['.repeat(100)}0${']'.repeat(100)}`;
  equal(compareJson(atDepthLimit, atDepthLimit).differences.length, 0);
  const tooDeep = `${'['.repeat(101)}0${']'.repeat(101)}`;
  throws(() => compareJson(tooDeep, '0'), 'MAX_DEPTH');
  const long = `"${'x'.repeat(diffLimits.maxInputBytes - 2)}"`;
  throws(() => compareJson(long, '0'), 'INPUT_TOO_LARGE');
  const exactLimitValue = `"${'x'.repeat(diffLimits.maxInputBytes - 6)}"`;
  equal(new TextEncoder().encode(exactLimitValue).byteLength + 4, diffLimits.maxInputBytes);
  equal(compareJson('null', exactLimitValue).differences.length, 1);
});

test('empty input is invalid and the combined byte limit is exact', () => {
  throws(() => compareJson(' ', '{}'), 'INVALID_JSON');
  equal(diffLimits.maxInputBytes, 5 * 1024 * 1024);
  equal(compareJson('"ok"', '"ok"').differences.length, 0);
});

test('HTML-like values and property names remain plain report text', () => {
  const result = compareJson('{}', '{"<img src=x onerror=alert(1)>":"<script>"}');
  const report = formatDiffReport(result);
  assert(report.includes('<script>'));
  assert(report.includes('<img src=x onerror=alert(1)>'));
});

test('report labels root, types, missing values, and no-difference output', () => {
  equal(formatDiffReport(compareJson('{}', '{}')), 'No differences found.');
  const rootReport = formatDiffReport(compareJson('{}', 'null'));
  assert(rootReport.includes('CHANGED (root)'));
  const report = formatDiffReport(compareJson('{}', '{"x":null}'));
  assert(report.includes('ADDED /x'));
  assert(report.includes('— (missing)'));
  assert(report.includes('[null] null'));
});

await run();
