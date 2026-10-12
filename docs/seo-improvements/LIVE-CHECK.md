# Live crawl and indexing check

Date: **12 October 2026 (Asia/Jakarta)**. This is a partial public check. PageSpeed Insights successfully generated a mobile Lighthouse report for six URLs below, which shows that the PSI service could render them at that time. Its report interface did not expose the origin HTTP response status, redirect chain, or response headers. A browser pass after the user confirmed publication verified the rendered DOM on the routes/assets listed in “Post-publication browser verification” below. Do not interpret browser rendering as a verified HTTP status.

## Post-publication browser verification

The following was checked in a browser on `https://edwinlab.dev/` after the user confirmed that the changes were pushed to `master`:

- `/index-master.html` rendered the visible archive notice and link to the current profile; meta robots was `noindex,follow`. The page had no canonical link. This confirms page HTML only, not `X-Robots-Tag` or HTTP status.
- Homepage rendered its self-canonical, `ProfilePage`/`Person` JSON-LD, and `https://edwinlab.dev/assets/social/home.png` metadata.
- `/tools/`, `/alat/`, and `/jsonlint/` rendered expected canonical and OG image metadata. Breadcrumb navigation and JSON-LD appeared on the tool hub and JSONLint. The everyday hub rendered its four category shortcuts.
- All 11 everyday tool routes from the sitemap rendered the hierarchy `Beranda → Alat Online → [tool]`; each had `BreadcrumbList` JSON-LD.
- JSONLint, timestamp converter, and JSON ↔ CSV converter rendered the relevant RFC 8259, RFC 3339, and RFC 4180 links.
- The discount calculator rendered the updated rounding/example copy. An interactive live calculation of Rp200000 with 20% then 10% produced Rp144000,00, total savings Rp56000,00, and 28,00% effective savings.
- `/link-whatsapp/`, `/kompres-gambar/`, and `/pembuat-qr-code/` rendered. QR showed one related-tools section linking to WhatsApp.
- All six social PNG URLs loaded as 1200×630 images in the browser: home, developer tools, everyday tools, JSONLint, WhatsApp link, and image compressor. The corresponding pages in that six-page batch referenced their matching social cards.
- The public everyday integration runner completed **20/21 tests**. The single failure was its hub assertion counting a `type="application/ld+json"` metadata block as executable JavaScript. The local test now excludes JSON-LD when checking for executable scripts; that test correction still needs publication and a repeat run.

This pass verifies rendered HTML/asset availability and one tool interaction. Platform-specific social preview debuggers, HTTP response status/headers, full redirect behavior, all-route response crawling, and Search Console remain unverified.

## Sitemap URL sample

The route inventory is the 26 canonical locations in the local [sitemap.xml](../../sitemap.xml). Every HTTP status, final URL, response `X-Robots-Tag`, and response headers below remains unverified. Browser DOM/source checks from the prior audit showed self-canonical metadata and no visible meta `noindex` in sampled pages, but that is not a substitute for a response-level crawl.

| Requested route | PSI fetched/rendered | HTTP status / final URL / headers | Canonical / robots response |
|---|---|---|---|
| `/` | Yes; [mobile report](https://pagespeed.web.dev/analysis/https-edwinlab-dev/je32uuxm3p?form_factor=mobile) | Not exposed | Prior DOM sample only; response headers unknown |
| `/tools/` | Yes; [mobile report](https://pagespeed.web.dev/analysis/https-edwinlab-dev-tools/tfn6cibagf?form_factor=mobile) | Not exposed | Prior DOM sample only; response headers unknown |
| `/jsonlint/` | Yes; [mobile report](https://pagespeed.web.dev/analysis/https-edwinlab-dev-jsonlint/vmfv4zyeai?form_factor=mobile) | Not exposed | Prior DOM sample only; response headers unknown |
| `/sql-formatter/` | Yes; [mobile report](https://pagespeed.web.dev/analysis/https-edwinlab-dev-sql-formatter/0vhb9vlwtf?form_factor=mobile) | Not exposed | Source canonical; live response unknown |
| `/kompres-gambar/` | Yes; [mobile report](https://pagespeed.web.dev/analysis/https-edwinlab-dev-kompres-gambar/0eekwykec2?form_factor=mobile) | Not exposed | Prior DOM sample only; response headers unknown |
| `/alat/` | Yes; [mobile report](https://pagespeed.web.dev/analysis/https-edwinlab-dev-alat/ghff9tmjwv?form_factor=mobile) | Not exposed | Prior DOM sample only; response headers unknown |
| `/json-diff/` | No PSI report in this pass | Not tested | Source only |
| `/json-yaml-converter/` | No PSI report in this pass | Not tested | Source only |
| `/json-csv-converter/` | No PSI report in this pass | Not tested | Source only |
| `/base64/` | No PSI report in this pass | Not tested | Source only |
| `/url-encoder-decoder/` | No PSI report in this pass | Not tested | Source only |
| `/jwt-decoder/` | No PSI report in this pass | Not tested | Source only |
| `/timestamp-converter/` | No PSI report in this pass | Not tested | Prior DOM sample only; response headers unknown |
| `/cron-expression/` | No PSI report in this pass | Not tested | Source only |
| `/uuid-generator/` | No PSI report in this pass | Not tested | Source only |
| `/regex-tester/` | No PSI report in this pass | Not tested | Source only |
| `/penghitung-kata/` | No PSI report in this pass | Not tested | Prior source audit only |
| `/ubah-huruf/` | No PSI report in this pass | Not tested | Source only |
| `/kalkulator-persen/` | No PSI report in this pass | Not tested | Source only |
| `/kalkulator-diskon/` | No PSI report in this pass | Not tested | Prior source audit only |
| `/kalkulator-usia/` | No PSI report in this pass | Not tested | Source only |
| `/kalkulator-tanggal/` | No PSI report in this pass | Not tested | Prior source audit only |
| `/konversi-satuan/` | No PSI report in this pass | Not tested | Source only |
| `/link-whatsapp/` | No PSI report in this pass | Not tested | Prior DOM sample only; response headers unknown |
| `/pembuat-qr-code/` | No PSI report in this pass | Not tested | Source only |
| `/ubah-ukuran-foto/` | No PSI report in this pass | Not tested | Source only |

The legacy `/index-master.html`, blog index, and one blog article were rendered in browser in the prior audit. Exact HTTP/header results were not exposed. The blog canonical/OG identity problems are in [AUDIT.md](AUDIT.md); the blog is not in this site's 26-URL sitemap.

## Domain variants, robots, and sitemaps

- Local source in [robots.txt](../../robots.txt) allows crawling and points to `https://edwinlab.dev/sitemap.xml`. Local sitemap has 26 unique routes, all ending in `/`; no `/tests/`, `/docs/`, `/vendor/`, or legacy route is listed.
- Public reads of sitemap, robots, and legacy page were unavailable in the current web retrieval surface. Public HTTP status, XML response, and redirects therefore remain unverified.
- HTTP→HTTPS, `www`, and `edwinlab.github.io` redirect behavior was not measured. No redirect code or status is inferred.
- Whether the blog has a separate sitemap or feed was not established.

## Search Console

No authenticated Search Console report or owner-property UI was available. The repository's Google verification file alone does not prove ownership. Sitemap status, indexing coverage, Google-selected canonical, URL Inspection samples, and 28-day clicks/impressions/CTR/position/query/device/country are **not available in this check**. Do not submit, remove, or change a property based on this file.

## Remaining evidence

A complete response crawl still needs a tool or environment that exposes each HTTP response and redirect chain. Search Console reporting needs the owner's verified property. Keep these separate from local source checks and PSI lab metrics.
