import { assertTextSize, MAX_OUTPUT_BYTES } from '../tools/shared/limits.js';

export const MAX_COMBINED_BYTES = 512 * 1024;
export const MAX_LINE_TOKENS = 5000;
const encoder = new TextEncoder();

export function tokenizeLines(text) {
  if (typeof text !== 'string') throw Object.assign(new Error('Text input is required.'), { code: 'INVALID_INPUT' });
  const rows = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '\n' && text[i] !== '\r') continue;
    const ending = text[i] === '\r' && text[i + 1] === '\n' ? 'CRLF' : text[i] === '\r' ? 'CR' : 'LF';
    rows.push({ text: text.slice(start, i), ending });
    if (ending === 'CRLF') i++;
    start = i + 1;
    if (rows.length > MAX_LINE_TOKENS) throw Object.assign(new Error(`Combined input exceeds ${MAX_LINE_TOKENS.toLocaleString('en-US')} line tokens.`), { code: 'TOO_MANY_LINES' });
  }
  if (start < text.length) rows.push({ text: text.slice(start), ending: 'NONE' });
  return rows;
}

function pushRow(rows, kind, oldLine, newLine, token) {
  rows.push({ kind, oldLine, newLine, text: token.text, ending: token.ending });
}

export function compareText(left, right, { diffArrays } = {}) {
  if (typeof diffArrays !== 'function') throw Object.assign(new Error('The local diff library is unavailable.'), { code: 'DEPENDENCY_UNAVAILABLE' });
  assertTextSize(left, MAX_COMBINED_BYTES); assertTextSize(right, MAX_COMBINED_BYTES);
  if (encoder.encode(left).byteLength + encoder.encode(right).byteLength > MAX_COMBINED_BYTES) throw Object.assign(new Error('Combined input exceeds 512 KiB of UTF-8 text.'), { code: 'INPUT_TOO_LARGE' });
  const oldTokens = tokenizeLines(left), newTokens = tokenizeLines(right);
  if (oldTokens.length + newTokens.length > MAX_LINE_TOKENS) throw Object.assign(new Error(`Combined input exceeds ${MAX_LINE_TOKENS.toLocaleString('en-US')} line tokens.`), { code: 'TOO_MANY_LINES' });
  const changes = diffArrays(oldTokens, newTokens, {
    comparator: (a, b) => a.text === b.text && a.ending === b.ending,
    maxEditLength: 2000,
    timeout: 3000
  });
  if (changes === undefined) throw Object.assign(new Error('The comparison exceeded its edit or time limit. Reduce the size of the changes and try again.'), { code: 'DIFF_LIMIT' });
  const rows = [];
  let oldLine = 1, newLine = 1;
  for (let i = 0; i < changes.length;) {
    const change = changes[i];
    if (!change.added && !change.removed) {
      for (const token of change.value) pushRow(rows, 'unchanged', oldLine++, newLine++, token);
      i++; continue;
    }
    const removed = [], added = [];
    while (i < changes.length && (changes[i].added || changes[i].removed)) {
      const part = changes[i++];
      if (part.removed) removed.push(...part.value);
      if (part.added) added.push(...part.value);
    }
    for (const token of removed) pushRow(rows, 'removed', oldLine++, null, token);
    for (const token of added) pushRow(rows, 'added', null, newLine++, token);
  }
  if (rows.length > MAX_LINE_TOKENS) throw Object.assign(new Error('The result exceeds the supported line limit.'), { code: 'TOO_MANY_LINES' });
  const summary = { added: rows.filter(row => row.kind === 'added').length, removed: rows.filter(row => row.kind === 'removed').length, unchanged: rows.filter(row => row.kind === 'unchanged').length };
  return { rows, summary };
}

export function formatDiffReport(result) {
  const { rows, summary } = result;
  const output = [`Text comparison report`, `Added: ${summary.added}`, `Removed: ${summary.removed}`, `Unchanged: ${summary.unchanged}`, ``, `This is a line-by-line report, not an applicable patch. Textarea values normalize line endings to LF.`];
  for (const row of rows) {
    const prefix = row.kind === 'added' ? '+' : row.kind === 'removed' ? '-' : ' ';
    const line = row.kind === 'removed' ? row.oldLine : row.newLine;
    const eol = row.ending === 'NONE' ? ' [no final newline]' : row.ending === 'CRLF' ? ' [CRLF]' : row.ending === 'CR' ? ' [CR]' : '';
    output.push(`${prefix} ${line}: ${row.text}${eol}`);
  }
  const report = output.join('\n');
  assertTextSize(report, MAX_OUTPUT_BYTES);
  return report;
}
