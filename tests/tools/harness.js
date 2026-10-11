const cases = [];
let running = false;
export function test(name, fn) {
  if (running) throw new Error('Register tests before calling run().');
  if (typeof fn !== 'function') throw new TypeError('Test requires a function.');
  cases.push({ name, fn });
}
export function assert(condition, message = 'Assertion failed') {
  if (!condition) throw new Error(message);
}
export function equal(actual, expected) {
  assert(Object.is(actual, expected), `Expected ${String(expected)}, received ${String(actual)}`);
}
export function deepEqual(actual, expected) {
  const seen = new WeakMap();
  function same(a, b) {
    if (Object.is(a, b)) return true;
    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a) && a.length !== b.length) return false;
    if (a instanceof Date || b instanceof Date) return a instanceof Date && b instanceof Date && Object.is(a.getTime(), b.getTime());
    if (seen.has(a)) return seen.get(a) === b;
    seen.set(a, b);
    const keys = Object.keys(a), otherKeys = Object.keys(b);
    return keys.length === otherKeys.length && keys.every(key => Object.hasOwn(b, key) && same(a[key], b[key]));
  }
  assert(same(actual, expected), 'Structures differ');
}
export function throws(fn, expectedCode) {
  try { fn(); }
  catch (error) {
    if (expectedCode !== undefined) equal(error.code, expectedCode);
    return error;
  }
  throw new Error(`Expected an exception${expectedCode ? ` with code ${expectedCode}` : ''}`);
}
export async function run() {
  if (running) throw new Error('Tests already started; reload to run again.');
  running = true;
  const summary = document.querySelector('[data-test-summary]');
  const list = document.querySelector('[data-test-results]');
  if (!summary || !list) throw new Error('Runner requires data-test-summary and data-test-results elements.');
  list.replaceChildren();
  summary.textContent = `Running ${cases.length} tests…`;
  let passed = 0;
  for (const { name, fn } of cases) {
    const item = document.createElement('li');
    try { await fn(); passed++; item.className = 'test-pass'; item.textContent = `PASS — ${name}`; }
    catch (error) { item.className = 'test-fail'; item.textContent = `FAIL — ${name}: ${error.message}`; }
    list.append(item);
  }
  const failed = cases.length - passed;
  summary.dataset.kind = failed ? 'error' : 'success';
  summary.dataset.state = 'complete';
  summary.dataset.passed = passed;
  summary.dataset.failed = failed;
  summary.textContent = `${passed}/${cases.length} passed · ${failed} failed`;
  return { passed, failed, total: cases.length };
}
