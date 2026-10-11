import { assertTextSize, MAX_TEXT_BYTES, MAX_OUTPUT_BYTES } from '../tools/shared/limits.js';

const DIALECTS = new Set(['postgresql', 'mysql']);
const INDENTS = new Set(['2', '4', 'tab']);
const CASES = new Set(['preserve', 'upper', 'lower']);
function error(code, message, cause) { const result = new Error(message); result.code = code; if (cause) result.cause = cause; return result; }

export function validateFormatRequest(text, { dialect = 'postgresql', indent = '2', keywordCase = 'upper' } = {}) {
  assertTextSize(text, MAX_TEXT_BYTES);
  if (!text.trim()) throw error('EMPTY_INPUT', 'Enter a SQL query to format.');
  if (!DIALECTS.has(dialect)) throw error('INVALID_DIALECT', 'Choose PostgreSQL or MySQL.');
  if (!INDENTS.has(indent)) throw error('INVALID_INDENT', 'Choose 2 spaces, 4 spaces, or a tab for indentation.');
  if (!CASES.has(keywordCase)) throw error('INVALID_CASE', 'Choose preserve, uppercase, or lowercase for keywords.');
  return { text, dialect, indent, keywordCase };
}

export function formatSql(text, options = {}, formatter = globalThis.sqlFormatter) {
  const config = validateFormatRequest(text, options);
  if (!formatter || typeof formatter.format !== 'function') throw error('FORMATTER_UNAVAILABLE', 'The local SQL formatter could not be loaded. Refresh the page and try again.');
  const indent = config.indent;
  const formatOptions = {
    language: config.dialect,
    tabWidth: indent === '4' ? 4 : 2,
    useTabs: indent === 'tab',
    keywordCase: config.keywordCase,
  };
  let output;
  try { output = formatter.format(config.text, formatOptions); }
  catch (cause) { throw error('FORMAT_FAILED', `Formatting failed: ${String(cause.message || 'the selected dialect could not format this input').slice(0, 500)}`, cause); }
  if (typeof output !== 'string') throw error('FORMAT_FAILED', 'The formatter returned an invalid result.');
  try { assertTextSize(output, MAX_OUTPUT_BYTES); }
  catch { throw error('OUTPUT_TOO_LARGE', 'Formatted SQL exceeds the 10 MiB output limit.'); }
  return { output, dialect: config.dialect, indent: config.indent, keywordCase: config.keywordCase };
}
