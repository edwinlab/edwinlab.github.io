import { assertTextSize, MAX_OUTPUT_BYTES, MAX_TEXT_BYTES } from '../tools/shared/limits.js';
import { parseSafeJSON } from '../tools/shared/json.js';

const BASE64URL = /^[A-Za-z0-9_-]+$/;
const MAX_DATE_MS = 8_640_000_000_000_000;
const TIME_CLAIMS = ['exp', 'nbf', 'iat'];

function jwtError(code, message, cause) {
  const error = new Error(message, cause ? { cause } : undefined);
  error.code = code;
  return error;
}

function decodeSegment(segment, name) {
  if (!segment) throw jwtError('EMPTY_SEGMENT', `The ${name} segment must not be empty.`);
  if (!BASE64URL.test(segment)) {
    throw jwtError('INVALID_BASE64URL', `The ${name} segment contains characters outside the Base64URL alphabet.`);
  }
  if (segment.length % 4 === 1) {
    throw jwtError('INVALID_BASE64URL', `The ${name} segment has an invalid Base64URL length.`);
  }

  let binary;
  try {
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - segment.length % 4) % 4);
    binary = atob(base64);
  } catch (cause) {
    throw jwtError('INVALID_BASE64URL', `The ${name} segment could not be decoded as Base64URL.`, cause);
  }
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);

  let text;
  try {
    // Preserve a UTF-8 BOM so the strict JSON parser can reject it as non-JSON input.
    text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch (cause) {
    throw jwtError('INVALID_UTF8', `The ${name} segment is not valid UTF-8.`, cause);
  }
  try {
    return parseSafeJSON(text);
  } catch (cause) {
    const code = cause.code || 'INVALID_JSON';
    throw jwtError(code, `${name[0].toUpperCase()}${name.slice(1)} JSON: ${cause.message}`, cause);
  }
}

function isJsonObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function decodeJwt(input) {
  // Check the original text before trimming, splitting, Base64 decoding, or JSON parsing.
  assertTextSize(input, MAX_TEXT_BYTES);
  const token = input.trim();
  if (!token) throw jwtError('EMPTY_TOKEN', 'Enter a compact JWT to decode.');
  if (/^Bearer(?:\s|$)/i.test(token)) {
    throw jwtError('BEARER_PREFIX', 'Paste the token only; remove the Bearer prefix.');
  }

  const segments = token.split('.');
  if (segments.length !== 3) {
    throw jwtError('SEGMENT_COUNT', `A compact JWT must contain exactly three segments; found ${segments.length}.`);
  }
  const [headerSegment, payloadSegment, signatureSegment] = segments;
  if (!headerSegment || !payloadSegment) {
    throw jwtError('EMPTY_SEGMENT', 'The header and payload segments must not be empty.');
  }
  if (signatureSegment && (!BASE64URL.test(signatureSegment) || signatureSegment.length % 4 === 1)) {
    throw jwtError('INVALID_BASE64URL', 'The signature segment contains invalid Base64URL data.');
  }

  const header = decodeSegment(headerSegment, 'header');
  if (!isJsonObject(header)) throw jwtError('INVALID_HEADER_TYPE', 'The decoded JWT header must be a JSON object.');
  const payload = decodeSegment(payloadSegment, 'payload');
  if (!isJsonObject(payload)) throw jwtError('INVALID_PAYLOAD_TYPE', 'The decoded JWT payload must be a JSON object.');

  const headerText = JSON.stringify(header, null, 2);
  const payloadText = JSON.stringify(payload, null, 2);
  try {
    assertTextSize(`${headerText}\n${payloadText}`, MAX_OUTPUT_BYTES);
  } catch (cause) {
    throw jwtError('OUTPUT_TOO_LARGE', `Decoded JSON exceeds the ${MAX_OUTPUT_BYTES.toLocaleString('en-US')}-byte output limit.`, cause);
  }

  return {
    header,
    payload,
    headerText,
    payloadText,
    signature: {
      empty: signatureSegment.length === 0,
      encodedLength: signatureSegment.length,
      status: 'Unverified',
    },
  };
}

function numericDateUtc(seconds) {
  const milliseconds = seconds * 1000;
  if (!Number.isFinite(milliseconds) || Math.abs(milliseconds) > MAX_DATE_MS) return null;
  const date = new Date(milliseconds);
  if (!Number.isFinite(date.getTime())) return null;
  return date.toISOString();
}

export function evaluateTimeClaims(payload, nowSeconds) {
  if (!isJsonObject(payload)) throw jwtError('INVALID_PAYLOAD_TYPE', 'Time claims require a JSON object payload.');
  if (!Number.isFinite(nowSeconds)) throw jwtError('INVALID_NOW', 'Pass a finite nowSeconds value when evaluating time claims.');

  return TIME_CLAIMS.map((claim) => {
    if (!Object.hasOwn(payload, claim)) {
      return { claim, present: false, valid: true, valueText: '—', status: 'Not present', dateUtc: null, warning: null };
    }
    const value = payload[claim];
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return {
        claim,
        present: true,
        valid: false,
        valueText: JSON.stringify(value) ?? 'undefined',
        status: 'Warning',
        dateUtc: null,
        warning: 'Expected a finite JSON number in seconds. This claim was not converted.',
      };
    }

    const dateUtc = numericDateUtc(value);
    let status;
    if (claim === 'exp') status = nowSeconds >= value ? 'Expired' : 'Not expired';
    else if (claim === 'nbf') status = nowSeconds < value ? 'Not active yet' : 'Active';
    else status = value > nowSeconds ? 'Issued after the selected current time' : 'Issued at this time';

    return {
      claim,
      present: true,
      valid: true,
      valueText: String(value),
      status,
      dateUtc,
      warning: dateUtc === null ? 'NumericDate is outside the JavaScript Date range; the original number is retained.' : null,
    };
  });
}
