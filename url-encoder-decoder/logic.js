import { assertTextSize, MAX_OUTPUT_BYTES, MAX_TEXT_BYTES } from '../tools/shared/limits.js';

export const MAX_QUERY_PAIRS = 1000;

function toolError(code, message, cause) {
  const error = new Error(message, cause ? { cause } : undefined);
  error.code = code;
  return error;
}

function checkInput(text) {
  assertTextSize(text, MAX_TEXT_BYTES);
}

function checkOutput(text) {
  try { assertTextSize(text, MAX_OUTPUT_BYTES); }
  catch (cause) { throw toolError('OUTPUT_TOO_LARGE', `Output exceeds the ${MAX_OUTPUT_BYTES.toLocaleString('en-US')}-byte limit.`, cause); }
  return text;
}

export function transformUri(text, mode = 'component', direction = 'encode') {
  checkInput(text);
  if (mode !== 'component' && mode !== 'whole') throw new TypeError('Choose URL component or Whole URI mode.');
  if (direction !== 'encode' && direction !== 'decode') throw new TypeError('Choose Encode or Decode.');
  try {
    const result = mode === 'component'
      ? (direction === 'encode' ? encodeURIComponent(text) : decodeURIComponent(text))
      : (direction === 'encode' ? encodeURI(text) : decodeURI(text));
    return checkOutput(result);
  } catch (cause) {
    if (cause instanceof URIError) {
      throw toolError('INVALID_URI', `Could not ${direction} this ${mode === 'component' ? 'URL component' : 'URI'}: check percent escapes and UTF-8.`, cause);
    }
    throw cause;
  }
}

function querySource(text) {
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(text) && !/^https?:\/\//i.test(text)) {
    throw toolError('INVALID_URL', 'Only absolute HTTP or HTTPS URLs are accepted in query mode.');
  }
  if (/^https?:\/\//i.test(text)) {
    let url;
    try { url = new URL(text); }
    catch (cause) { throw toolError('INVALID_URL', 'Enter a valid absolute HTTP or HTTPS URL.', cause); }
    return url.search.startsWith('?') ? url.search.slice(1) : '';
  }
  return text.startsWith('?') ? text.slice(1) : text;
}

function countNonemptyPairs(query) {
  if (!query) return 0;
  let count = 0;
  let start = 0;
  while (start <= query.length) {
    const ampersand = query.indexOf('&', start);
    const end = ampersand === -1 ? query.length : ampersand;
    if (end > start) {
      count++;
      if (count > MAX_QUERY_PAIRS) {
        throw toolError('TOO_MANY_PAIRS', `Query contains more than ${MAX_QUERY_PAIRS.toLocaleString('en-US')} parameters.`);
      }
    }
    if (ampersand === -1) break;
    start = ampersand + 1;
  }
  return count;
}

function decodeFormValue(value) {
  try { return decodeURIComponent(value.replace(/\+/g, ' ')); }
  catch (cause) {
    if (cause instanceof URIError) {
      throw toolError('INVALID_QUERY_ENCODING', 'A query parameter contains an invalid percent escape or UTF-8 sequence.', cause);
    }
    throw cause;
  }
}

export function parseQuery(text) {
  checkInput(text);
  const query = querySource(text);
  const count = countNonemptyPairs(query);
  if (count === 0) return [];

  const pairs = [];
  let start = 0;
  while (start <= query.length) {
    const ampersand = query.indexOf('&', start);
    const end = ampersand === -1 ? query.length : ampersand;
    if (end > start) {
      const segment = query.slice(start, end);
      const equals = segment.indexOf('=');
      const key = equals === -1 ? segment : segment.slice(0, equals);
      const value = equals === -1 ? '' : segment.slice(equals + 1);
      pairs.push({ key: decodeFormValue(key), value: decodeFormValue(value) });
    }
    if (ampersand === -1) break;
    start = ampersand + 1;
  }

  checkOutput(JSON.stringify(pairs));
  return pairs;
}
