import { test, assert, equal, run } from './harness.js';
const tools = [
  { slug: 'jsonlint', example: '#valid-example', process: '#format', input: '#json-input', output: '#json-result', copy: '#copy', bad: '{' },
  { slug: 'json-diff', example: '#example', process: '#compare', input: '#original-json', output: '#diff-rows', copy: '#copy-report', bad: '{' },
  { slug: 'timestamp-converter', example: '#example-seconds', process: '#convert', input: '#value-input', output: '#result-utc', copy: '[data-copy="result-utc"]', bad: 'not a timestamp' },
  { slug: 'jwt-decoder', example: '#load-example', process: '#decode', input: '#jwt-input', output: '#payload-output', copy: '[data-copy="payload-output"]', bad: 'not.a.token' },
  { slug: 'base64', example: '#example', process: '#process', input: '#input', output: '#output', copy: '#copy', bad: '%', badDirection: 'decode' },
  { slug: 'url-encoder-decoder', example: '#example', process: '#process', input: '#input', output: '#output', copy: '#copy', bad: '%', badDirection: 'decode' },
  { slug: 'cron-expression', example: '[data-example]', process: '#explain', input: '#expression', output: '#run-rows', copy: '#copy-runs', bad: 'invalid' },
  { slug: 'uuid-generator', process: '#generate', input: '#count', output: '#output', copy: '#copy', bad: '0' },
  { slug: 'json-yaml-converter', example: '[data-example]', process: '#convert', input: '#input', output: '#output', copy: '#copy', bad: '{' },
  { slug: 'json-csv-converter', example: '[data-example]', process: '#convert', input: '#input', output: '#output', copy: '#copy', bad: '{' },
  { slug: 'sql-formatter', example: '[data-example]', process: '#format', input: '#input', output: '#output', copy: '#copy', bad: "select 'unfinished" },
  { slug: 'regex-tester', example: '[data-pattern]', process: '#run', input: '#input', output: '#highlight', copy: '#copy-matches', bad: '[', badInput: '#pattern' }
];
const extensions = ['hash-generator','password-generator','color-converter','number-base-converter','url-parser','css-gradient-generator'];
const fetched = new Map(), titles = new Set(), descriptions = new Set(), metrics = [];
async function get(path) { if (!fetched.has(path)) fetched.set(path, await fetch(path)); const response = fetched.get(path); assert(response.ok, `Unavailable resource: ${path} (${response.status})`); return response.clone(); }
async function page(path) { return new DOMParser().parseFromString(await (await get(path)).text(), 'text/html'); }
async function until(predicate, timeout = 5000) { const end = performance.now() + timeout; while (!predicate()) { if (performance.now() > end) throw new Error('UI condition timed out'); await new Promise(resolve => setTimeout(resolve, 20)); } }
async function framePage(src, runTest, width = 1440) {
  const frame = document.createElement('iframe'); frame.title = 'Integration fixture ' + src; frame.style.cssText = `position:absolute;left:-10000px;width:${width}px;height:900px`;
  const loaded = new Promise((resolve, reject) => { frame.onload = resolve; frame.onerror = reject; }); frame.src = src; document.body.append(frame);
  try { await loaded; await runTest(frame.contentDocument, frame.contentWindow, frame); } finally { frame.remove(); }
}
test('Selected pages have complete large-image social cards and local PNG assets', async () => {
  const targets = [
    { path: '/', image: '/assets/social/home.png' },
    { path: '/tools/', image: '/assets/social/developer-tools.png' },
    { path: '/alat/', image: '/assets/social/everyday-tools.png' },
    { path: '/jsonlint/', image: '/assets/social/jsonlint.png' },
    { path: '/link-whatsapp/', image: '/assets/social/whatsapp-link.png' },
    { path: '/kompres-gambar/', image: '/assets/social/image-compressor.png' }
  ];
  for (const target of targets) {
    const doc = await page(target.path), canonical = doc.querySelector('link[rel="canonical"]')?.href;
    equal(doc.querySelector('meta[property="og:url"]')?.content, canonical);
    equal(new URL(doc.querySelector('meta[property="og:image"]')?.content).pathname, target.image);
    equal(doc.querySelector('meta[property="og:image:width"]')?.content, '1200');
    equal(doc.querySelector('meta[property="og:image:height"]')?.content, '630');
    assert(doc.querySelector('meta[property="og:image:alt"]')?.content);
    equal(doc.querySelector('meta[name="twitter:card"]')?.content, 'summary_large_image');
    assert(doc.querySelector('meta[name="twitter:title"]')?.content);
    assert(doc.querySelector('meta[name="twitter:description"]')?.content);
    equal(new URL(doc.querySelector('meta[name="twitter:image"]')?.content).pathname, target.image);
    assert(doc.querySelector('meta[name="twitter:image:alt"]')?.content);
    const asset = await get(target.image); assert(asset.headers.get('content-type')?.includes('image/png'));
  }
});
for (const { slug } of tools) test(`${slug}: unique static SEO, canonical, navigation, and available links/assets`, async () => {
  const path = `/${slug}/`, doc = await page(path), base = new URL(path, location.origin);
  equal(doc.documentElement.lang, 'en'); equal(doc.querySelectorAll('h1').length, 1);
  assert(doc.title && !titles.has(doc.title), 'Duplicate/missing title'); titles.add(doc.title);
  const description = doc.querySelector('meta[name="description"]')?.content;
  assert(description && !descriptions.has(description), 'Duplicate/missing description'); descriptions.add(description);
  equal(doc.querySelectorAll('link[rel="canonical"]').length, 1);
  equal(doc.querySelector('link[rel="canonical"]').getAttribute('href'), `https://edwinlab.dev${path}`);
  equal(doc.querySelector('meta[property="og:url"]').content, `https://edwinlab.dev${path}`);
  equal(doc.querySelectorAll('meta[property="og:title"]').length, 1);
  assert(doc.querySelector('meta[name="viewport"]')); assert(doc.querySelector('noscript').textContent.includes('JavaScript'));
  assert(doc.querySelector('article').textContent.length > 700, 'Guide too thin'); assert(doc.querySelector('.tools-intro').textContent.trim());
  assert([...doc.querySelectorAll('nav a')].some(a => a.getAttribute('href') === '/tools/' && a.textContent === 'Developer Tools'));
  const toolLinks = new Set([...doc.querySelectorAll('article a[href]')].map(a => a.getAttribute('href')).filter(href => tools.some(tool => href === `/${tool.slug}/`)));
  assert(toolLinks.size >= 2 && toolLinks.size <= 3, 'Expected 2–3 available related tools');
  for (const label of doc.querySelectorAll('label[for]')) assert(doc.getElementById(label.htmlFor), 'Missing label target');
  for (const script of doc.querySelectorAll('script[type="application/ld+json"]')) {
    const schema = JSON.parse(script.textContent); assert(schema['@context'] === 'https://schema.org'); assert(!schema.aggregateRating);
  }
  for (const element of doc.querySelectorAll('a[href],link[href],script[src],img[src]')) {
    const value = element.getAttribute('href') || element.getAttribute('src');
    const url = new URL(value, base);
    if (url.origin === base.origin) {
      if (url.pathname === path && url.hash) assert(doc.getElementById(url.hash.slice(1)), 'Missing anchor ' + value);
      await get(url.pathname + url.search);
    }
  }
  const image = new URL(doc.querySelector('meta[property="og:image"]').content); equal(image.origin, 'https://edwinlab.dev'); await get(image.pathname);
});

test('Hub has eighteen ordinary HTML cards, categories, local CSS, and profile/contact links', async () => {
  const doc = await page('/tools/'); equal(doc.title, 'Free Developer Tools | Edwin Lab');
  const cards = [...doc.querySelectorAll('.hub-card')]; equal(cards.length, 18); equal(new Set(cards.map(card => card.getAttribute('href'))).size, 18);
  for (const tool of tools) assert(cards.some(card => card.getAttribute('href') === `/${tool.slug}/`));
  equal(doc.querySelectorAll('.hub-directory').length, 6); equal(doc.querySelectorAll('script[src]').length, 0);
  assert(doc.querySelector('a[href="/#contact"]')); assert(doc.querySelector('a[href="/"]'));
  const home = await page('/'); assert(home.querySelector('nav a[href="/tools/"]')); assert(home.getElementById('contact'));
  await framePage('/tools/', async (doc, win, frame) => {
    for (const width of [320, 390, 768, 1440]) { frame.style.width = width + 'px'; await new Promise(resolve => win.requestAnimationFrame(() => win.requestAnimationFrame(resolve))); assert(doc.documentElement.scrollWidth <= width, 'Hub overflow at ' + width); }
    const resources = win.performance.getEntriesByType('resource'); assert(resources.every(r => r.name.startsWith(location.origin + '/') && !r.name.includes('/vendor/')));
    recordMetrics('tools', win);
  });
});
test('Sitemap XML includes only thirty-two ready canonical public pages; robots permits required resources', async () => {
  const doc = new DOMParser().parseFromString(await (await get('/sitemap.xml')).text(), 'application/xml'); equal(doc.querySelector('parsererror'), null);
  const urls = [...doc.querySelectorAll('loc')].map(el => el.textContent); equal(urls.length, 32); equal(new Set(urls).size, 32);
  for (const route of ['/', '/tools/', ...tools.map(tool => `/${tool.slug}/`), ...extensions.map(slug=>`/${slug}/`)]) assert(urls.includes(`https://edwinlab.dev${route}`));
  assert(urls.every(url => url.endsWith('/') && !url.includes('/tests/') && !url.includes('/docs/') && !url.includes('/vendor/')));
  equal(doc.querySelectorAll('lastmod').length, 0);
  const robots = await (await get('/robots.txt')).text(); assert(robots.includes('Allow: /')); assert(robots.includes('Sitemap: https://edwinlab.dev/sitemap.xml')); assert(!robots.includes('Disallow:'));
  equal((await (await get('/CNAME')).text()).trim(), 'edwinlab.dev');
});
test('Test directory contains only existing noindex runners and stays outside sitemap', async () => {
  const doc = await page('/tests/tools/'); assert(doc.querySelector('meta[name="robots"]').content.includes('noindex'));
  const runners = [...doc.querySelectorAll('a')].filter(a => a.getAttribute('href').startsWith('./'));
  equal(runners.length, 21);
  for (const link of runners) { const runner = await page('/tests/tools/' + link.getAttribute('href').slice(2)); assert(runner.querySelector('meta[name="robots"]')?.content.includes('noindex'), 'Runner missing noindex'); }
});
function recordMetrics(slug, win) {
  const nav = win.performance.getEntriesByType('navigation')[0], resources = win.performance.getEntriesByType('resource');
  metrics.push({ page: slug, loadMs: Math.round(nav.loadEventEnd - nav.startTime), resourceCount: resources.length, resourceDecodedBytes: resources.reduce((sum, resource) => sum + resource.decodedBodySize, 0), vendorResources: resources.filter(resource => resource.name.includes('/vendor/')).length });
  document.querySelector('#performance-report').textContent = JSON.stringify(metrics, null, 2);
}
for (const tool of tools) test(`${tool.slug}: direct load/refresh, example, process, copy/download, stale/error/clear, and layout`, async () => {
  await framePage(`/${tool.slug}/`, async (doc, win, frame) => {
    await until(() => !doc.querySelector(tool.process).disabled);
    // Refresh via the real directory route; no SPA fallback is involved.
    const reloaded = new Promise(resolve => { frame.onload = resolve; }); win.location.reload(); await reloaded;
    doc = frame.contentDocument; win = frame.contentWindow;
    await until(() => !doc.querySelector(tool.process).disabled);
    let uploads = 0, copied = null, downloaded = null, blob = null, errors = 0;
    win.addEventListener('error', () => { errors++; });
    win.fetch = () => { uploads++; throw new Error('Unexpected upload'); }; win.XMLHttpRequest = function () { uploads++; };
    Object.defineProperty(win.navigator, 'sendBeacon', { configurable: true, value: () => { uploads++; return false; } });
    Object.defineProperty(win.navigator, 'clipboard', { configurable: true, value: { writeText: async text => { copied = text; } } });
    win.URL.createObjectURL = value => { blob = value; return 'blob:integration-fixture'; }; win.URL.revokeObjectURL = () => {};
    win.HTMLAnchorElement.prototype.click = function () { downloaded = this.download; };
    const input = doc.querySelector(tool.input), status = doc.querySelector('#status'), process = doc.querySelector(tool.process), output = doc.querySelector(tool.output), copy = doc.querySelector(tool.copy);
    if (tool.example) doc.querySelector(tool.example).click();
    process.click(); await until(() => ['success', 'warning', 'error'].includes(status.dataset.kind));
    assert(status.dataset.kind !== 'error', status.textContent);
    assert((output.value ?? output.textContent).length > 0, 'Missing output'); assert(!copy.disabled, 'Copy unavailable after success');
    copy.click(); await until(() => copied !== null); assert(copied.length > 0);
    const download = doc.querySelector('#download');
    if (download) { assert(!download.disabled); download.click(); assert(downloaded && blob instanceof win.Blob, 'No download Blob'); assert((await blob.text()).length > 0); }
    for (const width of [390, 1440]) { frame.style.width = width + 'px'; await new Promise(resolve => win.requestAnimationFrame(() => win.requestAnimationFrame(resolve))); assert(doc.documentElement.scrollWidth <= width, 'Page overflow at ' + width); }
    equal(status.getAttribute('aria-live'), 'polite');
    recordMetrics(tool.slug, win);
    const original = input.value;
    input.value = tool.slug === 'uuid-generator' ? '2' : original + 'x'; input.dispatchEvent(new win.Event('input', { bubbles: true })); assert(copy.disabled, 'Stale output remains copyable');
    if (tool.badDirection) { const direction = doc.querySelector('#direction'); direction.value = tool.badDirection; direction.dispatchEvent(new win.Event('change')); }
    const badInput = tool.badInput ? doc.querySelector(tool.badInput) : input;
    badInput.value = tool.bad; badInput.dispatchEvent(new win.Event('input', { bubbles: true })); process.click(); await until(() => status.dataset.kind === 'error'); equal(badInput.value, tool.bad); assert(copy.disabled);
    doc.querySelector('#clear').click(); assert(copy.disabled);
    equal(uploads, 0); equal(errors, 0); assert(!win.location.search && !win.location.hash);
    const resources = win.performance.getEntriesByType('resource'); assert(resources.every(resource => resource.name.startsWith(location.origin + '/')), 'External runtime resource');
    for (const [vendor, owner] of [['/yaml/', 'json-yaml-converter'], ['/sql-formatter/sql-formatter.min.js', 'sql-formatter'], ['/croner/', 'cron-expression']]) {
      if (tool.slug !== owner) assert(resources.every(resource => !resource.name.includes('/tools/vendor' + vendor)), 'Unnecessary heavy dependency');
    }
  });
});
test('All guides and navigation remain readable with scripting disabled, with representative narrow layouts', async () => {
  for (const slug of ['tools', ...tools.map(tool => tool.slug)]) {
    const doc = await page(`/${slug}/`);
    for (const script of doc.querySelectorAll('script')) script.remove();
    const base = doc.createElement('base'); base.href = location.origin + `/${slug}/`; doc.head.prepend(base);
    const frame = document.createElement('iframe'); frame.title = 'No-JS fixture ' + slug; frame.setAttribute('sandbox', 'allow-same-origin'); frame.style.cssText = 'position:absolute;left:-10000px;width:320px;height:900px';
    const ready = new Promise(resolve => { frame.onload = resolve; }); frame.srcdoc = '<!doctype html>' + doc.documentElement.outerHTML; document.body.append(frame);
    try {
      await ready; const rendered = frame.contentDocument;
      assert(rendered.querySelector('h1').getBoundingClientRect().height > 0);
      assert(rendered.querySelector('nav a[href="/"]'));
      if (slug !== 'tools') { assert(rendered.querySelector('noscript').getBoundingClientRect().height > 0); assert(rendered.querySelector('article').getBoundingClientRect().height > 0); }
      for (const width of [320, 768]) { frame.style.width = width + 'px'; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); assert(rendered.documentElement.scrollWidth <= width, `${slug} no-JS overflow at ${width}`); }
    } finally { frame.remove(); }
  }
});
await run();
