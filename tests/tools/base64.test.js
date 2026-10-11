import { test, equal, throws, run } from './harness.js';
import { decodeBase64, encodeBase64 } from '../../base64/logic.js';

test('standard encoding of Hello, world!', () => equal(encodeBase64('Hello, world!'), 'SGVsbG8sIHdvcmxkIQ=='));
test('standard decoding of Hello, world!', () => equal(decodeBase64('SGVsbG8sIHdvcmxkIQ=='), 'Hello, world!'));
test('Unicode check mark round-trips', () => { equal(encodeBase64('✓'), '4pyT'); equal(decodeBase64('4pyT'), '✓'); });
test('emoji uses correct standard and URL-safe forms', () => { equal(encodeBase64('😀'), '8J+YgA=='); equal(encodeBase64('😀', 'url'), '8J-YgA'); });
test('Base64URL accepts unpadded and correctly padded emoji', () => { equal(decodeBase64('8J-YgA', 'url'), '😀'); equal(decodeBase64('8J-YgA==', 'url'), '😀'); });
test('URL alphabet is rejected in standard mode and standard alphabet in URL mode', () => { throws(() => decodeBase64('8J-YgA=='), 'INVALID_BASE64'); throws(() => decodeBase64('8J+YgA==', 'url'), 'INVALID_BASE64'); });
test('f, fo, and foo have canonical standard encodings', () => { equal(encodeBase64('f'), 'Zg=='); equal(encodeBase64('fo'), 'Zm8='); equal(encodeBase64('foo'), 'Zm9v'); });
test('f, fo, and foo have canonical URL-safe encodings', () => { equal(encodeBase64('f', 'url'), 'Zg'); equal(encodeBase64('fo', 'url'), 'Zm8'); equal(encodeBase64('foo', 'url'), 'Zm9v'); });
test('standard mode requires padding when a group is incomplete', () => throws(() => decodeBase64('Zg'), 'INVALID_BASE64'));
test('URL mode accepts unpadded f', () => equal(decodeBase64('Zg', 'url'), 'f'));
test('malformed alphabets, padding, lengths, and whitespace are rejected', () => {
  for (const value of ['A', 'Z=g=', 'Zg===', 'Zg==!', 'Z g==']) throws(() => decodeBase64(value), 'INVALID_BASE64');
});
test('non-canonical pad bits are rejected in both modes', () => { throws(() => decodeBase64('Zh=='), 'INVALID_BASE64'); throws(() => decodeBase64('Zh', 'url'), 'INVALID_BASE64'); });
test('non-UTF-8 bytes produce a clear UTF-8 error', () => throws(() => decodeBase64('/w=='), 'INVALID_UTF8'));
test('spaces, line breaks, and Japanese text round-trip unchanged', () => {
  const value = ' line one\nline two 日本語 ';
  equal(decodeBase64(encodeBase64(value)), value);
});
test('empty input encodes and decodes to empty output', () => { equal(encodeBase64(''), ''); equal(decodeBase64(''), ''); equal(decodeBase64('', 'url'), ''); });
test('HTML-like text remains ordinary output data', () => equal(decodeBase64(encodeBase64('<img src=x onerror=alert(1)>')), '<img src=x onerror=alert(1)>'));
test('UTF-8 input size above 5 MiB is rejected before conversion', () => throws(() => encodeBase64('x'.repeat(5 * 1024 * 1024 + 1)), 'INPUT_TOO_LARGE'));
test('encoded text can be decoded under the shared input limit', () => equal(decodeBase64(encodeBase64('x'.repeat(100))), 'x'.repeat(100)));

await run();
