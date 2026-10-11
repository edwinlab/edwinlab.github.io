import { parseSafeJSON } from '../tools/shared/json.js';
import { assertTextSize, MAX_TEXT_BYTES, MAX_OUTPUT_BYTES } from '../tools/shared/limits.js';

const DELIMITERS = new Set([',', ';', '\t']);
const PREVIEW_LIMIT = 20;
function fail(code, message, row, column) {
  const error = new Error(message); error.code = code;
  if (row !== undefined) Object.assign(error, { row, column });
  return error;
}
function inputText(text) {
  assertTextSize(text, MAX_TEXT_BYTES);
  if (typeof text !== 'string' || !text.trim()) throw fail('EMPTY_INPUT', 'Enter JSON or CSV data to convert.');
}
function delimiterValue(delimiter) {
  if (!DELIMITERS.has(delimiter)) throw fail('INVALID_DELIMITER', 'Choose comma, semicolon, or tab as the delimiter.');
  return delimiter;
}
function checkOutput(output) {
  assertTextSize(output, MAX_OUTPUT_BYTES);
  return output;
}
function formulaRisk(value) {
  return /^(?:[\t\r\n]|\s*[=+\-@])/.test(value);
}
function safeCell(value, enabled) {
  const text = String(value);
  return enabled && formulaRisk(text) ? `'${text}` : text;
}
function quoteCell(value, delimiter) {
  const text = String(value);
  return /["\r\n]/.test(text) || text.includes(delimiter)
    ? `"${text.replaceAll('"', '""')}"`
    : text;
}
function serializeRows(rows, delimiter) {
  return rows.map(row => row.map(cell => quoteCell(cell, delimiter)).join(delimiter)).join('\r\n');
}

export function jsonToCsv(text, { delimiter = ',', nestedMode = 'reject', escapeSpreadsheetFormulas = true } = {}) {
  inputText(text); delimiterValue(delimiter);
  if (!['reject', 'json'].includes(nestedMode)) throw fail('INVALID_NESTED_MODE', 'Choose whether to reject nested JSON values or serialize them as JSON.');
  let value;
  try { value = parseSafeJSON(text); }
  catch (error) { throw fail(error.code || 'INVALID_JSON', error.message, error.line, error.column); }
  if (!Array.isArray(value) || value.some(row => row === null || typeof row !== 'object' || Array.isArray(row))) {
    throw fail('INVALID_ROOT', 'JSON to CSV requires an array of objects.');
  }
  const headers = [];
  const seen = new Set();
  for (const record of value) for (const key of Object.keys(record)) if (!seen.has(key)) { seen.add(key); headers.push(key); }
  const outputHeaders = headers.map(header => safeCell(header, escapeSpreadsheetFormulas));
  const outputRows = value.map((record, rowIndex) => headers.map(header => {
    if (!Object.hasOwn(record, header) || record[header] === null || record[header] === '') return '';
    const cell = record[header];
    if (typeof cell === 'object') {
      if (nestedMode === 'reject') throw fail('NESTED_VALUE', `Nested value at row ${rowIndex + 1}, field ${JSON.stringify(header)} is not supported. Choose JSON serialization to include it.`);
      return JSON.stringify(cell);
    }
    // Only string cells are vulnerable. A native negative JSON number remains numeric text.
    return typeof cell === 'string' ? safeCell(cell, escapeSpreadsheetFormulas) : String(cell);
  }));
  const output = headers.length ? serializeRows([outputHeaders, ...outputRows], delimiter) : '';
  checkOutput(output);
  return { output, headers: outputHeaders, rowCount: value.length, preview: outputRows.slice(0, PREVIEW_LIMIT), previewHeaders: outputHeaders, previewTruncated: value.length > PREVIEW_LIMIT };
}

export function parseCsv(text, delimiter = ',') {
  inputText(text); delimiterValue(delimiter);
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const records = [];
  let row = [], field = '', inQuotes = false, afterQuote = false, recordStarted = false;
  const pushField = () => { row.push(field); field = ''; afterQuote = false; recordStarted = true; };
  const pushRecord = () => { pushField(); records.push(row); row = []; recordStarted = false; };
  const error = (message, index) => {
    const prefix = text.slice(0, index);
    const line = (prefix.match(/\n/g) || []).length + 1;
    const lastBreak = prefix.lastIndexOf('\n');
    throw fail('INVALID_CSV', `${message} at row ${line}, column ${index - lastBreak}.`, line, index - lastBreak);
  };
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') { field += '"'; index++; }
        else { inQuotes = false; afterQuote = true; }
      } else field += char;
      continue;
    }
    if (afterQuote) {
      if (char === delimiter) pushField();
      else if (char === '\n') pushRecord();
      else if (char === '\r' && text[index + 1] === '\n') { pushRecord(); index++; }
      else error('Unexpected character after a closing quote', index);
      continue;
    }
    if (char === '"') {
      if (field.length !== 0) error('Quote inside an unquoted field', index);
      inQuotes = true; recordStarted = true;
    } else if (char === delimiter) pushField();
    else if (char === '\n') pushRecord();
    else if (char === '\r') {
      if (text[index + 1] !== '\n') error('Use LF or CRLF for record endings', index);
      pushRecord(); index++;
    } else { field += char; recordStarted = true; }
  }
  if (inQuotes) error('Unclosed quoted field', text.length);
  if (recordStarted || row.length || field.length || afterQuote) { pushField(); records.push(row); }
  return records;
}

export function csvToJson(text, { delimiter = ',' } = {}) {
  const records = parseCsv(text, delimiter);
  const headers = records[0];
  if (!headers?.length) throw fail('INVALID_HEADER', 'CSV must start with a header row.');
  const seen = new Set();
  for (const header of headers) {
    if (!header.length) throw fail('INVALID_HEADER', 'CSV headers cannot be empty.');
    if (seen.has(header)) throw fail('DUPLICATE_HEADER', `CSV header ${JSON.stringify(header)} appears more than once.`);
    seen.add(header);
  }
  const values = records.slice(1);
  const result = values.map((cells, rowIndex) => {
    if (cells.length !== headers.length) throw fail('ROW_WIDTH', `CSV row ${rowIndex + 2} has ${cells.length} cells; expected ${headers.length}.`, rowIndex + 2, cells.length);
    const object = Object.create(null);
    headers.forEach((header, index) => Object.defineProperty(object, header, { value: cells[index], enumerable: true, configurable: true, writable: true }));
    return object;
  });
  const output = JSON.stringify(result, null, 2);
  checkOutput(output);
  const preview = result.slice(0, PREVIEW_LIMIT).map(record => headers.map(header => record[header]));
  return { output, headers, rowCount: result.length, preview, previewHeaders: headers, previewTruncated: result.length > PREVIEW_LIMIT };
}

export function convert(text, { direction = 'json-csv', delimiter = ',', nestedMode = 'reject', escapeSpreadsheetFormulas = true } = {}) {
  return direction === 'json-csv'
    ? jsonToCsv(text, { delimiter, nestedMode, escapeSpreadsheetFormulas })
    : direction === 'csv-json'
      ? csvToJson(text, { delimiter })
      : (() => { throw fail('INVALID_DIRECTION', 'Choose JSON to CSV or CSV to JSON.'); })();
}
