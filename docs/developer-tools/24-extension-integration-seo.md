# 24 — Integrasi Developer Tools tambahan & SEO

Status: **belum dikerjakan; rencana saja**. Model: **GPT-6 Luna · high, per batch**. Jalankan untuk subset14–23 yang sudah lulus, tidak perlu menunggu semua10 tools. Tidak mengimplementasikan tool yang belum siap.

## Scope/ownership

Baca CONTRACT/EXTENSION-CONTRACT, README, status/hasil task batch, git status aktual, hub/sitemap/robots/CNAME dan runner existing. Miliki perubahan minimal pada `tools/index.html`, `tools/hub.css` bila perlu, related navigation HTML tools siap, `sitemap.xml`, `tests/tools/index.html`, existing integration runner untuk expectation yang berubah, serta `tests/tools/extension-integration.{test.js,html}` bila invariant baru belum terjaga. README repo/tracker boleh diperbarui untuk route/bukti actual. Homepage nav Developer Tools sudah ada; tidak perlu redesign atau menu baru.

Baseline repo sekarang12 developer+11 everyday+homepage+2 hub=26 URL sitemap. Angka14 dalam laporan/suite developer lama adalah keadaan sebelum everyday tools; **inventaris aktual**, jangan hapus11 everyday atau menganggap semua plan ready. Semua10 tambahan lulus memberi total36 URL jika tidak ada route baru lain.

## TODO integrasi dan SEO

- [ ] Inventaris tool selesai: index.html asli, fixture pass, QA workflow pengguna, limits/dependencies, runtime buildless. Task parsial/gagal belum ditautkan sebagai ready.
- [ ] Tambahkan cards HTML biasa pada kategori bermakna; pertahankan12 cards existing, menu Home/AlatOnline/Contact dan semua links existing. Kategori baru Text & markup / Colors & CSS / Numbers & URLs / Hashes & passwords boleh sesuai batch aktual; tidak membuat kategori kosong.
- [ ] Update category count dan copy "12/twelve" pada hub/meta/social text/privacy sentence ke jumlah actual atau kalimat tanpa count agar tidak stale. Hub tetap tanpa executable JS; JSON-LD script diperbolehkan.
- [ ] Tambahkan2–3 related links jika ada workflow yang masuk akal; bila tool belum punya pasangan tepat, hub cukup. Color↔gradient, TextDiff↔Markdown, JSONPath↔JSONLint/JSONDiff, hash↔password/UUID, base↔Base64 (jelaskan beda), URLparser↔URLencoder adalah candidate hanya jika target siap.
- [ ] Breadcrumb visible+JSON-LD Home→DeveloperTools→tool cocok. Unique title/description, lang=en, satu H1, canonical/OGURLdomain + trailing slash, static guide/example/limitations tersedia. Related links tidak membuat hidden keyword blocks.
- [ ] Social OG/Twitter memakai asset yang benar-benar ada dan alt relevan; jangan menyalin dimensi 1200×630 ke logo 225×225. Tidak ada requirement membuat10 gambar baru dalam task ini.
- [ ] Sitemap menambah hanya tool batch siap; pertahankan seluruh existing canonical URLs. XML valid/deduplicate/exclude tests/docs/vendor/legacy; lastmod hanya bila tanggal nyata relevan diketahui. robots tetap allowcrawl/resources dan sitemap domain aktual.
- [ ] Index tests hanya menautkan runner nyata noindex, termasuk readiness runner bila ada. Tidak menambahkan link files yang masih rencana.
- [ ] Audit direct folder routes/index.html, root-relative assets/nativeESM/classicvendorworker, local fonts/logo; tanpa SPAfallback/compiler/build. Tidak membuat runtime registry framework baru.

## TODO regresi dan QA

- [ ] Perbarui stale hard-coded jumlah 14/26 dan route list dalam existing integrationtests berdasarkan batch aktual; jangan mengganti expected dengan hanya hasil aktual yang di-fetch sehingga halaman hilang tidak terdeteksi. Expected set eksplisit mencakup semua26 baseline+ready additions.
- [ ] Assertion "no script" menghitung executable scripts, mengecualikan application/ld+json. Type/properties JSON-LD di-parse dan cocok visible content; no fake ratings/reviews.
- [ ] Jalankan fixture new tools+readiness yang terkait dan integration runner existing yang diedit. Jangan melonggarkan assertions agar suite hijau; report gagal dengan reproduksi.
- [ ] New invariant integration memeriksa10 candidate sesuai ready subset: href/assets/mainhead, input privacy, library hanya dimuat consumer, no framework/build, outputrace/clear jika applicable. Tidak menduplikasi setiap pure fixture tool.
- [ ] Smoke directload/refresh/example/error/clear/stale/copy/download per tool siap; keyboard/no-JS content; hub dan representative pages pada320/390/768/1440 px. Catat browser/network/console.
- [ ] Input teks/file/password/URL tidak muncul pada fetch/XHR/beacon/telemetry/storage/siteURL. Markdown preview tidak memuat resource/navigate dan XML DOCTYPE tidak memicu request. Hanya fixtures sintetis.
- [ ] Periksa ukuran resource/layout awal dan interaksi; dependency berat tidak masuk homepage/hub/tool yang tidak membutuhkan. Ukur masalah sebelum optimasi; tidak mengarang Lighthouse/CrUX/ranking.
- [ ] `git diff --check` lulus; filesowned/perubahan pengguna tetap utuh. Update checklist task24 + row24 README dan rowsbatch hanya berdasarkan evidence yang tersedia.

## Definiteion of Done

Batchready terhubung dari hub, sitemapexpectedset tepat, no broken links/metadata duplicates, tests/QA yang relevan lulus. Status **sebagian** bila integration/QA/public verification masih tertunda. Jangan menandai toolplan sebagai implemented karena dokumen TODO dibuat.

Verifikasi live setelah pemilik mempublikasikan: HTML/asset/directroute/HTTPS/canonical/robots nyata, status/redirect/headers dari tool yang mengungkap response; browser render tidak dijadikan bukti200. GSC indexing/query memerlukan akses/data; tidak submit/change account atau menjanjikan traffic dari dokumen ini.

## Prompt siap tempel

```text
Kerjakan hanya docs/developer-tools/24-extension-integration-seo.md untuk batch <nomor tools siap>.
Baca README/CONTRACT/EXTENSION-CONTRACT serta hasil task batch, inventaris file actual.
Rekomendasi Luna high; scope batch kecil. Integrasikan hanya tools yang lulus, pertahankan26canonical baseline dan12 developer existing.
Update hub/relatedlinks/sitemap/runnerindex dan expectations stale secukupnya. Jangan implementasikan tool lain atau framework/build.
Jalankan checks/fixtures/QA relevant, catat jumlahURLactual serta local/live limitations.
Update checklist task24 dan README berdasarkan bukti. Jangan commit/push/deploy atau mengubah akun/setting.
```

## Hasil eksekusi per batch

Belum dieksekusi. Catat nomor tool/route/jumlah card/jumlah URL sitemap/fixtures/files QA/pending setelah setiap batch.
