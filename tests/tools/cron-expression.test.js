import { test, equal, deepEqual, assert, throws, run } from './harness.js';
import { explainCron, validateReference } from '../../cron-expression/logic.js';
import { createCronRunner } from '../../cron-expression/worker-client.js';

function upcoming(expression, reference, timezone = 'UTC') {
  return explainCron(expression, reference, timezone).runs.map(run => run.utc);
}

test('Croner: strictly subsequent quarter-hour slots', () => deepEqual(upcoming('*/15 * * * *', '2024-01-01T00:00:00Z'), ['2024-01-01T00:15:00.000Z', '2024-01-01T00:30:00.000Z', '2024-01-01T00:45:00.000Z', '2024-01-01T01:00:00.000Z', '2024-01-01T01:15:00.000Z']));
test('Croner: weekday schedule skips weekend and reference slot', () => equal(upcoming('0 9 * * 1-5', '2024-01-05T09:00:00Z')[0], '2024-01-08T09:00:00.000Z'));
test('Croner: restricted day-of-month and weekday use OR', () => deepEqual(upcoming('0 9 1 * 1', '2024-01-29T00:00:00Z'), ['2024-01-29T09:00:00.000Z', '2024-02-01T09:00:00.000Z', '2024-02-05T09:00:00.000Z', '2024-02-12T09:00:00.000Z', '2024-02-19T09:00:00.000Z']));
test('Croner: explicit Jakarta timezone', () => equal(upcoming('0 9 * * *', '2024-01-01T00:00:00Z', 'Asia/Jakarta')[0], '2024-01-01T02:00:00.000Z'));
test('Croner: Sunday zero and seven are equivalent', () => deepEqual(upcoming('0 0 * * 0', '2024-01-01T00:00:00Z'), upcoming('0 0 * * 7', '2024-01-01T00:00:00Z')));
test('Croner: spring DST minute schedule advances to 03:00 EDT', () => equal(upcoming('* * * * *', '2024-03-10T06:59:00Z', 'America/New_York')[0], '2024-03-10T07:00:00.000Z'));
test('Croner: fall DST minute schedule continues at 01:00 EST', () => equal(upcoming('* * * * *', '2024-11-03T05:59:00Z', 'America/New_York')[0], '2024-11-03T06:00:00.000Z'));



// Official pinned distribution resolves a nonexistent 02:30 to 03:30 on this date.
// This observed behavior differs from README's broad 'gaps are skipped' claim.
test('Pinned spring gap behavior: fixed 02:30 shifts to 03:30, then resumes at 02:30 next day', () => {
  const result = explainCron('30 2 * * *', '2024-03-10T06:00:00Z', 'America/New_York');
  equal(result.runs[0].utc, '2024-03-10T07:30:00.000Z'); equal(result.runs[0].local, '2024-03-10 03:30:00');
  equal(result.runs[1].utc, '2024-03-11T06:30:00.000Z');
});
test('Fall overlap: fixed 01:30 uses only its first occurrence', () => {
  const result = upcoming('30 1 * * *', '2024-11-03T05:00:00Z', 'America/New_York');
  equal(result[0], '2024-11-03T05:30:00.000Z');
  equal(result[1], '2024-11-04T06:30:00.000Z');
});
test('Fall repeated-hour results are strictly increasing and include correct local offset', () => {
  const result = explainCron('* * * * *', '2024-11-03T05:59:00Z', 'America/New_York');
  equal(result.runs[0].local, '2024-11-03 01:00:00');
  equal(result.runs[0].offset, 'UTC-05:00');
  assert(result.runs.every((run, index) => Date.parse(run.utc) > Date.parse(index ? result.runs[index - 1].utc : result.referenceUtc)));
  equal(new Set(result.runs.map(run => run.utc)).size, 5);
});
test('Spring minute result includes 03:00 and EDT offset', () => {
  const run = explainCron('* * * * *', '2024-03-10T06:59:00Z', 'America/New_York').runs[0];
  equal(run.local, '2024-03-10 03:00:00'); equal(run.offset, 'UTC-04:00');
});
test('Field expansion uses library range/list/step selections', () => {
  const result = explainCron('10-40/10 9,17 * * 1-5', '2024-01-01T00:00:00Z', 'UTC');
  equal(result.fields.length, 5);
  equal(result.fields[0].values, '10, 20, 30, 40'); equal(result.fields[1].values, '9, 17'); equal(result.fields[4].values, '1, 2, 3, 4, 5');
});
test('Reject extended grammar, invalid values, and zero steps', () => {
  for (const expression of ['60 * * * *', '*/0 * * * *', '* * * * * *', '* * * * * * *', '@daily', '0 9 * * MON', '0 0 L * *', '0 0 * * +1', '0 0 * * 1#2', '1--2 * * * *', '5/2 * * * *', '0 24 * * *', '0 0 0 * *', '0 0 * 13 *', '0 0 * * 8', 'x'.repeat(257)]) {
    throws(() => explainCron(expression, '2024-01-01T00:00:00Z', 'UTC'), 'INVALID_CRON');
  }
});
test('Reference requires an explicit ISO offset and a real date', () => {
  for (const ref of ['2024-01-01T00:00:00', '2024-02-30T00:00:00Z', '2023-02-29T00:00:00Z', '2024-01-01T24:00:00Z', '2024-01-01T00:00:00+24:00']) throws(() => validateReference(ref), 'INVALID_REFERENCE');
  equal(validateReference('2024-01-01T07:00:00+07:00').toISOString(), '2024-01-01T00:00:00.000Z');
});
test('Unsupported zones and horizons are rejected before iteration', () => {
  throws(() => explainCron('* * * * *', '2024-01-01T00:00:00Z', 'Invalid/Zone'), 'INVALID_TIMEZONE');
  throws(() => explainCron('* * * * *', '2024-01-01T00:00:00Z', 'UTC', { horizonYears: 41 }), 'INVALID_HORIZON');
});
test('Explicit zones do not read host-local Date fields', () => {
  const names = ['getFullYear', 'getMonth', 'getDate', 'getDay', 'getHours', 'getMinutes', 'getSeconds', 'getTimezoneOffset'];
  const original = names.map(name => Date.prototype[name]);
  try {
    names.forEach(name => { Date.prototype[name] = () => { throw new Error('Host local timezone dependency'); }; });
    equal(upcoming('0 9 * * *', '2024-01-01T00:00:00Z', 'Asia/Jakarta')[0], '2024-01-01T02:00:00.000Z');
  } finally { names.forEach((name, index) => { Date.prototype[name] = original[index]; }); }
});
test('Leap day produces February 29 and respects a partial horizon', () => {
  const result = explainCron('0 0 29 2 *', '2024-01-01T00:00:00Z', 'UTC', { horizonYears: 1 });
  deepEqual(result.runs.map(run => run.utc), ['2024-02-29T00:00:00.000Z']);
  assert(result.partial); assert(result.reason.includes('Only 1'));
});
test('Real module worker returns the same bounded result', async () => {
  const runner = createCronRunner();
  const result = await runner.run({ expression: '*/15 * * * *', reference: '2024-01-01T00:00:00Z', timezone: 'UTC' });
  equal(result.runs[0].utc, '2024-01-01T00:15:00.000Z');
});
test('Impossible February 31 finishes without blocking the UI', async () => {
  const runner = createCronRunner();
  const result = await runner.run({ expression: '0 0 31 2 *', reference: '2024-01-01T00:00:00Z', timezone: 'UTC' });
  equal(result.runs.length, 0); assert(result.partial); assert(result.reason.includes('No occurrences'));
});
function fakeFactory(workers) {
  return () => {
    const worker = { terminated: false, postMessage(data) { this.sent = data; }, terminate() { this.terminated = true; } };
    workers.push(worker); return worker;
  };
}
test('Controlled non-responsive worker times out and is terminated', async () => {
  const workers = []; const runner = createCronRunner({ workerFactory: fakeFactory(workers), timeoutMs: 20 });
  const error = await runner.run({}).then(() => { throw new Error('Expected timeout'); }, error => error);
  equal(error.code, 'TIMEOUT'); assert(workers[0].terminated);
});
test('Cancellation rejects, terminates, and ignores a late response', async () => {
  const workers = []; const runner = createCronRunner({ workerFactory: fakeFactory(workers) });
  const request = runner.run({}).catch(error => error);
  const late = workers[0].onmessage; runner.cancel();
  late({ data: { id: workers[0].sent.id, result: 'stale' } });
  equal((await request).code, 'CANCELLED'); assert(workers[0].terminated);
});
test('A new request supersedes old work and rejects mismatched or late messages', async () => {
  const workers = []; const runner = createCronRunner({ workerFactory: fakeFactory(workers) });
  const first = runner.run({}).catch(error => error); const late = workers[0].onmessage;
  const second = runner.run({});
  late({ data: { id: workers[0].sent.id, result: 'old' } });
  workers[1].onmessage({ data: { id: -1, result: 'wrong id' } });
  workers[1].onmessage({ data: { id: workers[1].sent.id, result: 'latest' } });
  equal((await first).code, 'CANCELLED'); equal(await second, 'latest'); assert(workers.every(worker => worker.terminated));
});
test('Worker validation errors are returned with their error code', async () => {
  const runner = createCronRunner();
  const error = await runner.run({ expression: '@daily', reference: '2024-01-01T00:00:00Z', timezone: 'UTC' }).catch(error => error);
  equal(error.code, 'INVALID_CRON');
});



test('Page UI, examples, stale output, responsive widths, and local-only requests', async () => {
  const frame = document.createElement('iframe');
  frame.src = '/cron-expression/';
  frame.title = 'Cron UI fixture';
  frame.style.cssText = 'width:375px;height:800px;border:0;position:absolute;left:0;top:0;visibility:hidden';
  document.body.append(frame);
  try {
    await new Promise((resolve, reject) => { frame.onload = resolve; frame.onerror = reject; });
    const doc = frame.contentDocument; const win = frame.contentWindow;
    const input = doc.querySelector('#expression'); const reference = doc.querySelector('#reference');
    equal(doc.querySelector('h1').textContent, 'Cron Expression Explainer');
    for (const element of doc.querySelectorAll('input')) assert(doc.querySelector('label[for="' + element.id + '"]'));
    equal(doc.querySelector('#status').getAttribute('aria-live'), 'polite');
    let requests = 0;
    win.fetch = () => { requests++; throw new Error('Unexpected input request'); };
    win.XMLHttpRequest = class { constructor() { requests++; throw new Error('Unexpected input request'); } };
    win.navigator.sendBeacon = () => { requests++; return false; };
    const finished = async () => {
      const start = Date.now();
      while (doc.querySelector('#cancel').disabled === false && Date.now() - start < 3000) await new Promise(resolve => setTimeout(resolve, 10));
      assert(doc.querySelector('#cancel').disabled, 'UI calculation did not finish');
      equal(doc.querySelector('#status').dataset.kind, 'success');
    };
    reference.value = '2024-01-01T00:00:00Z';
    for (const [pattern, first] of [
      ['*/15 * * * *', '2024-01-01T00:15:00.000Z'],
      ['0 9 * * 1-5', '2024-01-01T09:00:00.000Z'],
      ['0 0 1 * *', '2024-02-01T00:00:00.000Z'],
    ]) {
      doc.querySelector('[data-example="' + pattern + '"]').click(); await finished();
      equal(doc.querySelectorAll('#field-rows tr').length, 5);
      equal(doc.querySelectorAll('#run-rows tr').length, 5);
      assert(doc.querySelector('#run-rows tr').textContent.includes(first));
    }
    for (const width of [320, 375, 390, 768, 1440]) {
      frame.style.width = width + 'px';
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      assert(doc.documentElement.scrollWidth <= width, 'Page overflow at ' + width);
    }
    input.value = '* * * * *'; doc.querySelector('#explain').click();
    input.value = '0 9 * * *'; input.dispatchEvent(new win.Event('input', { bubbles: true }));
    assert(doc.querySelector('#result').hidden); assert(doc.querySelector('#copy-runs').disabled);
    doc.querySelector('#explain').click(); await finished();
    assert(doc.querySelector('#run-rows tr').textContent.includes('2024-01-01T09:00:00.000Z'), 'Old worker response won');
    doc.querySelector('#now').click();
    assert(doc.querySelector('#result').hidden); assert(doc.querySelector('#copy-expression').disabled);
    assert(Math.abs(Date.parse(reference.value) - Date.now()) < 2000);
    doc.querySelector('#clear').click(); equal(input.value, '');
    equal(requests, 0);
    const resources = win.performance.getEntriesByType('resource');
    assert(resources.length > 0);
    for (const resource of resources) {
      assert(resource.name.startsWith(location.origin + '/'), 'External runtime resource: ' + resource.name);
      assert(!resource.name.includes('2024-01-01') && !resource.name.includes('expression='), 'Input in resource URL');
    }
  } finally { frame.remove(); }
});
test('Static SEO, field guide, and noscript remain available with scripts disabled', async () => {
  const frame = document.createElement('iframe');
  frame.setAttribute('sandbox', 'allow-same-origin'); frame.src = '/cron-expression/';
  frame.title = 'Cron no-JavaScript fixture'; frame.style.cssText = 'position:absolute;visibility:hidden;width:375px;height:600px';
  document.body.append(frame);
  try {
    await new Promise((resolve, reject) => { frame.onload = resolve; frame.onerror = reject; });
    const doc = frame.contentDocument;
    assert(doc.querySelector('noscript p').getBoundingClientRect().height > 0);
    assert(doc.querySelector('article').textContent.includes('day-of-month'));
    assert(doc.querySelector('article').textContent.includes('OR'));
    equal(doc.querySelectorAll('h1').length, 1);
    equal(doc.querySelector('link[rel=canonical]').href, 'https://edwinlab.dev/cron-expression/');
    equal(doc.querySelector('title').textContent, 'Cron Expression Explainer & Next Run Times | Edwin Lab');
    for (const script of doc.querySelectorAll('script[type="application/ld+json"]')) JSON.parse(script.textContent);
  } finally { frame.remove(); }
});

await run();

