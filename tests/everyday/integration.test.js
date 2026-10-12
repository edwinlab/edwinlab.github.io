import { assert, equal, test, run } from '../tools/harness.js';

const tools = [
  { slug: 'penghitung-kata', related: 'ubah-huruf' }, { slug: 'ubah-huruf', related: 'penghitung-kata' },
  { slug: 'kalkulator-persen', related: 'kalkulator-diskon' }, { slug: 'kalkulator-diskon', related: 'kalkulator-persen' },
  { slug: 'kalkulator-usia', related: 'kalkulator-tanggal' }, { slug: 'kalkulator-tanggal', related: 'kalkulator-usia' },
  { slug: 'konversi-satuan', related: ['kalkulator-persen', 'kalkulator-tanggal'] }, { slug: 'link-whatsapp', related: 'pembuat-qr-code' },
  { slug: 'pembuat-qr-code', related: 'link-whatsapp' }, { slug: 'kompres-gambar', related: 'ubah-ukuran-foto' },
  { slug: 'ubah-ukuran-foto', related: 'kompres-gambar' },
];
const devTools = ['jsonlint', 'json-diff', 'json-yaml-converter', 'json-csv-converter', 'base64', 'url-encoder-decoder', 'jwt-decoder', 'timestamp-converter', 'cron-expression', 'uuid-generator', 'sql-formatter', 'regex-tester'];
const publicRoutes = ['/', '/tools/', '/alat/', ...tools.map(tool => `/${tool.slug}/`)];
const cache = new Map();
const pageTitles = new Set(); const pageDescriptions = new Set();
async function get(path) {
  if (!cache.has(path)) cache.set(path, await fetch(path));
  const response = cache.get(path);
  assert(response.ok, `Route/aset tidak tersedia: ${path} (${response.status})`);
  return response.clone();
}
async function page(path) { return new DOMParser().parseFromString(await (await get(path)).text(), 'text/html'); }
async function frame(path, width, callback) {
  const view = document.createElement('iframe'); view.title = `Audit ${path}`;
  view.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:1200px;border:0`;
  const loaded = new Promise((resolve, reject) => { view.onload = resolve; view.onerror = reject; });
  view.src = path; document.body.append(view);
  try { await loaded; await callback(view.contentDocument, view.contentWindow, view); }
  finally { view.remove(); }
}

test('hub memuat 11 card HTML statis pada empat kategori dan tanpa script', async () => {
  const doc = await page('/alat/');
  equal(doc.title, 'Alat Online Gratis untuk Kebutuhan Sehari-hari | Edwin Lab');
  equal(doc.documentElement.lang, 'id'); equal(doc.querySelectorAll('h1').length, 1);
  equal(doc.querySelectorAll('.alat-directory').length, 4); equal(doc.querySelectorAll('.alat-card').length, 11);
  equal(doc.querySelectorAll('script:not([type="application/ld+json"])').length, 0); equal(doc.querySelectorAll('meta[name="robots"]').length, 0);
  equal(doc.querySelector('link[rel="canonical"]').getAttribute('href'), 'https://edwinlab.dev/alat/');
  assert(doc.querySelector('nav a[href="/tools/"]')); assert(doc.querySelector('a[href="/"]'));
  for (const id of ['teks-title', 'kalkulator-title', 'tautan-title', 'gambar-title']) {
    assert(doc.querySelector(`.alat-shortcuts a[href="#${id}"]`), `Shortcut ${id} missing`);
    assert(doc.getElementById(id), `Shortcut target ${id} missing`);
  }
  for (const tool of tools) assert(doc.querySelector(`.alat-card[href="/${tool.slug}/"]`), `Card ${tool.slug} tidak ada`);
});

test('breadcrumb visual dan JSON-LD alat harian mengikuti hierarchy hub', async () => {
  const hub = await page('/alat/');
  const hubTrail = hub.querySelectorAll('.tools-breadcrumb li'); equal(hubTrail.length, 2);
  assert(hubTrail[0].querySelector('a[href="/"]')); equal(hubTrail[1].textContent.trim(), 'Alat Online');
  const hubSchema = [...hub.querySelectorAll('script[type="application/ld+json"]')].map(s => JSON.parse(s.textContent)).find(x => x['@type'] === 'BreadcrumbList');
  equal(hubSchema.itemListElement.length, 2); equal(hubSchema.itemListElement[1].item, 'https://edwinlab.dev/alat/');
  for (const tool of tools) {
    const path = `/${tool.slug}/`, doc = await page(path), trail = doc.querySelectorAll('.tools-breadcrumb li');
    equal(trail.length, 3, `${tool.slug} breadcrumb depth`);
    assert(trail[0].querySelector('a[href="/"]')); assert(trail[1].querySelector('a[href="/alat/"]'));
    assert(trail[2].hasAttribute('aria-current')); equal(trail[2].querySelectorAll('a').length, 0);
    const schema = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(s => JSON.parse(s.textContent)).find(x => x['@type'] === 'BreadcrumbList');
    equal(JSON.stringify(schema.itemListElement.map(x => x.position)), JSON.stringify([1, 2, 3]));
    equal(schema.itemListElement[1].item, 'https://edwinlab.dev/alat/');
    equal(schema.itemListElement[2].item, `https://edwinlab.dev${path}`);
  }
});

test('homepage Person markup matches the visible profile links', async () => {
  const doc = await page('/');
  const profile = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(s => JSON.parse(s.textContent)).find(x => x['@type'] === 'ProfilePage');
  assert(profile?.mainEntity?.['@type'] === 'Person');
  equal(profile.mainEntity.name, 'Edwin Andrianto'); equal(profile.mainEntity.jobTitle, 'Technical Lead');
  equal(profile.mainEntity.worksFor?.name, 'OCBC Indonesia');
  assert(profile.mainEntity.sameAs.includes('https://www.linkedin.com/in/edwinlab/'));
  assert(profile.mainEntity.sameAs.includes('https://github.com/edwinlab'));
  assert(!profile.mainEntity.image, 'Brand logo must not be marked as a portrait');
});

test('menu homepage mempertahankan Developer Tools dan menambahkan Alat Online', async () => {
  const doc = await page('/');
  assert(doc.querySelector('nav a[href="/tools/"]')?.textContent.trim() === 'Developer Tools');
  assert(doc.querySelector('nav a[href="/alat/"]')?.textContent.trim() === 'Alat Online');
  assert(doc.querySelector('#contact'));
});

test('menu Developer Tools menautkan hub sehari-hari tanpa mengubah metadata dev', async () => {
  const doc = await page('/tools/');
  equal(doc.title, 'Free Developer Tools | Edwin Lab'); equal(doc.querySelector('h1').textContent, 'Developer Tools');
  assert(doc.querySelector('.tools-nav a[href="/alat/"]'));
  equal(doc.querySelectorAll('.hub-card').length, 12);
  for (const slug of devTools) assert(doc.querySelector(`.hub-card[href="/${slug}/"]`));
});

for (const tool of tools) test(`${tool.slug}: metadata unik, lang=id, noindex absent, assets dan crosslink valid`, async () => {
  const path = `/${tool.slug}/`, doc = await page(path), base = new URL(path, location.origin);
  assert(doc.title && !pageTitles.has(doc.title), 'Title kosong atau duplikat'); pageTitles.add(doc.title);
  equal(doc.documentElement.lang, 'id'); equal(doc.querySelectorAll('h1').length, 1);
  const description = doc.querySelector('meta[name="description"]')?.content.trim();
  assert(description && !pageDescriptions.has(description), 'Deskripsi kosong atau duplikat'); pageDescriptions.add(description);
  equal(doc.querySelectorAll('link[rel="canonical"]').length, 1);
  equal(doc.querySelector('link[rel="canonical"]').getAttribute('href'), `https://edwinlab.dev${path}`);
  equal(doc.querySelector('meta[property="og:url"]')?.content, `https://edwinlab.dev${path}`);
  assert(doc.querySelector('meta[property="og:title"]')?.content);
  assert(!doc.querySelector('meta[name="robots"]')?.content.includes('noindex'));
  assert(doc.querySelector('noscript')?.textContent.trim());
  assert(doc.querySelector('.tools-nav a[href="/"]')); assert(doc.querySelector('.tools-nav a[href="/alat/"]'));
  assert(doc.querySelector('.tools-related'), 'Crosslink area missing');
  const related = [...doc.querySelectorAll('.tools-related a[href]')].map(link => link.getAttribute('href'));
  const expectedRelated = Array.isArray(tool.related) ? tool.related.map(slug => `/${slug}/`) : tool.related ? [`/${tool.related}/`] : [];
  equal(JSON.stringify(related), JSON.stringify(expectedRelated));
  for (const label of doc.querySelectorAll('label[for]')) assert(doc.getElementById(label.htmlFor), `Label tanpa kontrol: ${label.htmlFor}`);
  for (const element of doc.querySelectorAll('a[href],link[href],script[src],img[src]')) {
    const value = element.getAttribute('href') || element.getAttribute('src');
    const url = new URL(value, base);
    if (url.origin === base.origin) {
      if (url.hash) assert(doc.getElementById(url.hash.slice(1)), `Anchor tidak ditemukan: ${value}`);
      await get(url.pathname + url.search);
    }
  }
  const image = new URL(doc.querySelector('meta[property="og:image"]')?.content);
  equal(image.origin, 'https://edwinlab.dev'); await get(image.pathname);
});

test('sitemap XML berisi 26 URL publik unik dan route terdaftar memiliki canonical cocok', async () => {
  const xml = new DOMParser().parseFromString(await (await get('/sitemap.xml')).text(), 'application/xml');
  equal(xml.querySelector('parsererror'), null);
  const urls = [...xml.querySelectorAll('loc')].map(node => node.textContent.trim());
  equal(urls.length, 26); equal(new Set(urls).size, urls.length);
  const expected = [...publicRoutes, ...devTools.map(slug => `/${slug}/`)];
  for (const path of expected) assert(urls.includes(`https://edwinlab.dev${path}`), `Sitemap kurang ${path}`);
  assert(urls.every(url => url.endsWith('/') && !url.includes('/tests/') && !url.includes('/docs/') && !url.includes('/vendor/')));
  for (const path of [...publicRoutes.slice(1), ...devTools.map(slug => `/${slug}/`)]) {
    const doc = await page(path);
    equal(doc.querySelector('link[rel="canonical"]')?.getAttribute('href'), `https://edwinlab.dev${path}`);
  }
});

test('robots mengizinkan halaman publik dan menunjuk sitemap custom domain', async () => {
  const robots = await (await get('/robots.txt')).text();
  assert(robots.includes('Allow: /')); assert(robots.includes('Sitemap: https://edwinlab.dev/sitemap.xml'));
  assert(!robots.includes('Disallow:'));
  equal((await (await get('/CNAME')).text()).trim(), 'edwinlab.dev');
});

test('index tes hanya menautkan runner nyata dan setiap runner noindex', async () => {
  const doc = await page('/tests/everyday/');
  assert(doc.querySelector('meta[name="robots"]')?.content.includes('noindex'));
  const links = [...doc.querySelectorAll('a[href^="./"]')]; equal(links.length, 14);
  for (const link of links) {
    const runner = await page(`/tests/everyday/${link.getAttribute('href').slice(2)}`);
    assert(runner.querySelector('meta[name="robots"]')?.content.includes('noindex'), `Runner ${link.href} harus noindex`);
  }
});

test('hub langsung tampil tanpa overflow pada empat ukuran viewport', async () => {
  for (const width of [320, 390, 768, 1440]) await frame('/alat/', width, async (doc, win) => {
    await new Promise(resolve => win.requestAnimationFrame(() => win.requestAnimationFrame(resolve)));
    assert(doc.documentElement.scrollWidth <= width, `Hub overflow pada ${width}px`);
    equal(doc.querySelectorAll('.alat-card').length, 11);
  });
});

test('menu homepage tetap terlihat tanpa overflow pada empat ukuran viewport', async () => {
  for (const width of [320, 390, 768, 1440]) await frame('/', width, async (doc, win) => {
    await new Promise(resolve => win.requestAnimationFrame(() => win.requestAnimationFrame(resolve)));
    assert(doc.querySelector('nav a[href="/alat/"]')?.getBoundingClientRect().width > 0);
    assert(doc.querySelector('nav a[href="/tools/"]')?.getBoundingClientRect().width > 0);
    assert(doc.documentElement.scrollWidth <= width, `Homepage overflow pada ${width}px`);
  });
});

await run();
