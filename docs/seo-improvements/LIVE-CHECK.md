# Live crawl and indexing check

Date: **12 October 2026 (Asia/Jakarta)**. This is a partial public check. PageSpeed Insights successfully generated a mobile Lighthouse report for six URLs below, which shows that the PSI service could render them at that time. Its report interface did not expose the origin HTTP response status, redirect chain, or response headers. Do not interpret “report generated” as a verified 200 response.

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
