import { test, equal, deepEqual, throws, run } from './harness.js';
import { parseQuery, transformUri } from '../../url-encoder-decoder/logic.js';

test('component encoding escapes spaces, plus, slash, question mark, and equals', () => equal(transformUri('a b+c/d?e=f'), 'a%20b%2Bc%2Fd%3Fe%3Df'));
test('component decoding keeps plus literal and decodes percent space', () => equal(transformUri('a+b%20c', 'component', 'decode'), 'a+b c'));
test('whole URI encoding preserves URI separators', () => equal(transformUri('https://example.com/a b?q=x y&lang=id', 'whole'), 'https://example.com/a%20b?q=x%20y&lang=id'));
test('whole URI decoding preserves reserved percent escapes', () => equal(transformUri('https://example.com/a%20b?q=x%26y', 'whole', 'decode'), 'https://example.com/a b?q=x%26y'));
test('component and whole URI decoding decode exactly once and by their own semantics', () => { equal(transformUri('%252F', 'component', 'decode'), '%2F'); equal(transformUri('%2F', 'whole', 'decode'), '%2F'); });
test('query form decoding distinguishes plus space from plus literal', () => deepEqual(parseQuery('q=a+b&q=a%2Bb'), [{ key: 'q', value: 'a b' }, { key: 'q', value: 'a+b' }]));
test('repeated keys, empty values, and flag parameters remain separate', () => deepEqual(parseQuery('a=1&a=2&empty=&flag'), [{ key: 'a', value: '1' }, { key: 'a', value: '2' }, { key: 'empty', value: '' }, { key: 'flag', value: '' }]));
test('empty keys, empty segments, and equals after first delimiter are handled', () => deepEqual(parseQuery('=x&&a=b=c'), [{ key: '', value: 'x' }, { key: 'a', value: 'b=c' }]));
test('absolute URLs return query pairs in order and ignore fragments', () => deepEqual(parseQuery('https://example.com/?a=1&a=2#section'), [{ key: 'a', value: '1' }, { key: 'a', value: '2' }]));
test('query mode accepts an optional question mark and empty input', () => { deepEqual(parseQuery('?x=1'), [{ key: 'x', value: '1' }]); deepEqual(parseQuery(''), []); deepEqual(parseQuery('?'), []); });
test('non-HTTP URL schemes are not accepted as absolute URLs', () => throws(() => parseQuery('ftp://example.com/?a=1'), 'INVALID_URL'));
test('prototype-like keys remain ordinary ordered pair data', () => {
  const pairs = parseQuery('__proto__=x&constructor=y&toString=z');
  deepEqual(pairs, [{ key: '__proto__', value: 'x' }, { key: 'constructor', value: 'y' }, { key: 'toString', value: 'z' }]);
  equal(Object.getPrototypeOf(pairs[0]), Object.prototype);
});
test('bad percent escapes and malformed UTF-8 are rejected in component decoding', () => {
  for (const value of ['%', '%2', '%GG', '%C3%28']) throws(() => transformUri(value, 'component', 'decode'), 'INVALID_URI');
});
test('bad query percent escapes and malformed UTF-8 are rejected', () => {
  for (const value of ['x=%', 'x=%2', 'x=%GG', 'x=%C3%28']) throws(() => parseQuery(value), 'INVALID_QUERY_ENCODING');
});
test('Unicode and emoji round-trip through URI component encoding', () => {
  const value = '日本語 😀';
  equal(transformUri(transformUri(value), 'component', 'decode'), value);
});
test('lone UTF-16 surrogate produces a URI error', () => throws(() => transformUri('\uD800'), 'INVALID_URI'));
test('empty component encode/decode returns empty output', () => { equal(transformUri(''), ''); equal(transformUri('', 'component', 'decode'), ''); });
test('empty query returns an empty pair list', () => deepEqual(parseQuery(''), []));
test('exactly 1,000 query pairs are accepted', () => equal(parseQuery(Array.from({ length: 1000 }, (_, index) => `k=${index}`).join('&')).length, 1000));
test('more than 1,000 query pairs are rejected explicitly', () => throws(() => parseQuery(Array.from({ length: 1001 }, (_, index) => `k=${index}`).join('&')), 'TOO_MANY_PAIRS'));
test('input above 5 MiB is rejected before URI processing', () => throws(() => transformUri('x'.repeat(5 * 1024 * 1024 + 1)), 'INPUT_TOO_LARGE'));
test('percent-encoded output above 10 MiB is rejected', () => throws(() => transformUri('#'.repeat(3_600_000)), 'OUTPUT_TOO_LARGE'));
test('query JSON output above 10 MiB is rejected before rendering pairs', () => throws(() => parseQuery(`x=${'%00'.repeat(1_747_626)}`), 'OUTPUT_TOO_LARGE'));

await run();
