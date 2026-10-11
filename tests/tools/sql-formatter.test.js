import { assert, equal, test, throws, run } from './harness.js';
import { formatSql, validateFormatRequest } from '../../sql-formatter/logic.js';
import { createSqlRunner } from '../../sql-formatter/worker-client.js';
const formatter = window.sqlFormatter;

test('PostgreSQL formats the basic query with uppercase keywords', () => {
  const output = formatSql('select id,name from users where active=true;', { dialect: 'postgresql', keywordCase: 'upper' }, formatter).output;
  assert(output.includes('SELECT')); assert(output.includes('FROM\n  users')); assert(output.includes('WHERE\n  active = TRUE;'));
});

test('Formatter output is pinned as a snapshot and stays idempotent', () => {
  const options = { dialect: 'postgresql', indent: '2', keywordCase: 'upper' };
  const first = formatSql('select id,name from users where active=true;', options, formatter).output;
  equal(first, 'SELECT\n  id,\n  name\nFROM\n  users\nWHERE\n  active = TRUE;');
  equal(formatSql(first, options, formatter).output, first);
});

test('Quoted strings retain SQL keywords as literal contents', () => {
  const output = formatSql("select 'select from WHERE' as message;", { dialect: 'postgresql' }, formatter).output;
  assert(output.includes("'select from WHERE'")); assert(output.includes('SELECT'));
});

test('Escaped apostrophes in SQL strings remain intact', () => {
  const output = formatSql("select 'O''Reilly' as author;", { dialect: 'postgresql' }, formatter).output;
  assert(output.includes("'O''Reilly'"));
});

test('Line and block comments remain present', () => {
  const output = formatSql('select id -- comment\nfrom users /* block comment */;', { dialect: 'postgresql' }, formatter).output;
  assert(output.includes('-- comment')); assert(output.includes('/* block comment */'));
});

test('PostgreSQL quoted identifier, positional parameter, and cast are preserved', () => {
  const output = formatSql('select "MixedCase", $1::jsonb from "User";', { dialect: 'postgresql' }, formatter).output;
  assert(output.includes('"MixedCase"')); assert(output.includes('$1::jsonb')); assert(output.includes('"User"'));
});

test('PostgreSQL dollar-quoted body keeps literal keywords', () => {
  const body = "select $body$select from WHERE 'literal'$body$ as text;";
  const output = formatSql(body, { dialect: 'postgresql' }, formatter).output;
  assert(output.includes("$body$select from WHERE 'literal'$body$"));
});

test('MySQL backtick identifiers and question-mark placeholder are preserved', () => {
  const output = formatSql('select `order` from `user` where id = ?;', { dialect: 'mysql' }, formatter).output;
  assert(output.includes('`order`')); assert(output.includes('`user`')); assert(output.includes('?'));
});

test('MySQL hash and executable comments remain intact', () => {
  const output = formatSql('select id # keep this\nfrom users /*! USE INDEX (idx_user) */ where id=?;', { dialect: 'mysql' }, formatter).output;
  assert(output.includes('# keep this')); assert(output.includes('/*! USE INDEX (idx_user) */'));
});

test('Two semicolon-delimited statements remain separate and literals keep semicolons', () => {
  const output = formatSql("select ';' as marker; select 2;", { dialect: 'postgresql' }, formatter).output;
  assert(output.includes("';'")); assert(output.includes('SELECT') && output.includes('2;'));
});

test('Indentation supports 2 spaces, 4 spaces, and tabs', () => {
  const query = 'select a,(select b from t) from x;';
  const two = formatSql(query, { dialect: 'postgresql', indent: '2' }, formatter).output;
  const four = formatSql(query, { dialect: 'postgresql', indent: '4' }, formatter).output;
  const tab = formatSql(query, { dialect: 'postgresql', indent: 'tab' }, formatter).output;
  assert(two.includes('\n  ')); assert(four.includes('\n    ')); assert(tab.includes('\n\t'));
});

test('Keyword case preserve, uppercase, and lowercase changes recognized tokens only', () => {
  const query = 'select "MixedCase", name from users;';
  const preserve = formatSql(query, { dialect: 'postgresql', keywordCase: 'preserve' }, formatter).output;
  const upper = formatSql(query, { dialect: 'postgresql', keywordCase: 'upper' }, formatter).output;
  const lower = formatSql(query, { dialect: 'postgresql', keywordCase: 'lower' }, formatter).output;
  assert(preserve.startsWith('select')); assert(upper.startsWith('SELECT')); assert(lower.startsWith('select'));
  assert(upper.includes('"MixedCase"') && lower.includes('"MixedCase"'));
});

test('Empty input, invalid options, and oversized input fail explicitly', () => {
  throws(() => formatSql('  ', {}, formatter), 'EMPTY_INPUT');
  throws(() => validateFormatRequest('select 1', { dialect: 'sqlite' }), 'INVALID_DIALECT');
  throws(() => validateFormatRequest('select 1', { indent: '3' }), 'INVALID_INDENT');
  throws(() => validateFormatRequest('select 1', { keywordCase: 'sentence' }), 'INVALID_CASE');
  throws(() => validateFormatRequest('x'.repeat(5 * 1024 * 1024 + 1)), 'INPUT_TOO_LARGE');
});

test('Unsupported formatter syntax reports an error without changing the input', () => {
  const input = "select 'unfinished";
  const before = input;
  throws(() => formatSql(input, { dialect: 'postgresql' }, formatter), 'FORMAT_FAILED');
  equal(input, before);
});

test('HTML-like query text is returned as text and never inserted into markup', () => {
  const query = "select '<script>alert(1)</script>' as message;";
  assert(formatSql(query, { dialect: 'postgresql' }, formatter).output.includes('<script>alert(1)</script>'));
});

test('Local classic worker loads the vendor and returns formatted SQL', async () => {
  const runner = createSqlRunner();
  const result = await runner.run({ text: 'select id from users;', options: { dialect: 'postgresql', indent: '2', keywordCase: 'upper' } });
  assert(result.output.includes('SELECT\n  id')); equal(result.dialect, 'postgresql');
});

test('Worker timeout terminates a controlled non-responsive worker', async () => {
  let terminated = 0;
  const runner = createSqlRunner({ timeoutMs: 20, workerFactory: () => ({ postMessage() {}, terminate() { terminated++; } }) });
  let code; try { await runner.run({ text: 'select 1' }); } catch (error) { code = error.code; }
  equal(code, 'TIMEOUT'); equal(terminated, 1);
});

test('Worker cancel terminates work and ignores a late response', async () => {
  let worker, terminated = 0;
  const runner = createSqlRunner({ timeoutMs: 500, workerFactory: () => (worker = { postMessage() {}, terminate() { terminated++; } }) });
  let code; const pending = runner.run({ text: 'select 1' }).catch(error => { code = error.code; });
  runner.cancel(); worker.onmessage({ data: { id: 1, result: { output: 'stale' } } }); await pending;
  equal(code, 'CANCELLED'); equal(terminated, 1);
});

test('Direct static page has canonical guide and loads only a local vendor script', async () => {
  const response = await fetch('/sql-formatter/'); assert(response.ok);
  const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
  equal(doc.title, 'SQL Formatter Online — PostgreSQL & MySQL | Edwin Lab', `title=${doc.title}`);
  equal(doc.querySelector('h1')?.textContent, 'SQL Formatter', 'h1 missing or incorrect');
  equal(doc.querySelector('link[rel=canonical]')?.getAttribute('href'), 'https://edwinlab.dev/sql-formatter/', 'canonical missing or incorrect');
  assert(doc.querySelector('noscript')?.textContent.includes('Enable JavaScript'), 'noscript guidance missing');
  assert(doc.querySelector('article')?.textContent.includes('does not convert a query between dialects'), 'SEO article guidance missing');
  assert([...doc.querySelectorAll('script[src]')].every(script => new URL(script.getAttribute('src'), location.href).origin === location.origin), 'non-local script source found');
});

await run();
