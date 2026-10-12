# 24 — Integrasi Developer Tools tambahan & SEO

Status: **parsial pada 12 Oktober 2026: enam tool diintegrasikan secara lokal; empat tool menunggu dependency readiness 14a.** Model: **GPT-6 Luna · high, per batch**. Jalankan untuk subset14–23 yang sudah lulus, tidak perlu menunggu semua10 tools. Tidak mengimplementasikan tool yang belum siap.

## Scope/ownership

Baca CONTRACT/EXTENSION-CONTRACT, README, status/hasil task batch, git status aktual, hub/sitemap/robots/CNAME dan runner existing. Miliki perubahan minimal pada `tools/index.html`, `tools/hub.css` bila perlu, related navigation HTML tools siap, `sitemap.xml`, `tests/tools/index.html`, existing integration runner untuk expectation yang berubah, serta `tests/tools/extension-integration.{test.js,html}` bila invariant baru belum terjaga. README repo/tracker boleh diperbarui untuk route/bukti aktual. Homepage nav Developer Tools sudah ada; tidak perlu redesign atau menu baru.

Baseline repo sekarang12 developer+11 everyday+homepage+2 hub=26 URL sitemap. Angka14 dalam laporan/suite developer lama adalah keadaan sebelum everyday tools; **inventaris aktual**, jangan hapus11 everyday atau menganggap semua plan ready. Semua10 tambahan lulus memberi total36 URL jika tidak ada route baru lain.

## TODO integrasi dan SEO

- [x] Inventaris tool selesai: index.html asli, fixture pass, QA workflow pengguna, limits/dependencies, runtime buildless. Task parsial/gagal belum ditautkan sebagai ready.
- [x] Tambahkan cards HTML biasa pada kategori bermakna; pertahankan12 cards existing, menu Home/AlatOnline/Contact dan semua links existing. Kategori baru Text & markup / Colors & CSS / Numbers & URLs / Hashes & passwords boleh sesuai batch aktual; tidak membuat kategori kosong.
- [x] Update category count dan copy "12/twelve" pada hub/meta/social text/privacy sentence ke jumlah aktual atau kalimat tanpa count agar tidak stale. Hub tetap tanpa executable JS; JSON-LD script diperbolehkan.
- [x] Tambahkan2–3 related links jika ada workflow yang masuk akal; bila tool belum punya pasangan tepat, hub cukup. Color↔gradient, TextDiff↔Markdown, JSONPath↔JSONLint/JSONDiff, hash↔password/UUID, base↔Base64 (jelaskan beda), URLparser↔URLencoder adalah candidate hanya jika target siap.
- [x] Breadcrumb visible+JSON-LD Home→DeveloperTools→tool cocok. Unique title/description, lang=en, satu H1, canonical/OGURLdomain + trailing slash, static guide/example/limitations tersedia. Related links tidak membuat hidden keyword blocks.
- [x] Social OG/Twitter memakai asset yang benar-benar ada dan alt relevan; jangan menyalin dimensi 1200×630 ke logo 225×225. Tidak ada requirement membuat10 gambar baru dalam task ini.
- [x] Sitemap menambah hanya tool batch siap; pertahankan seluruh existing canonical URLs. XML valid/deduplicate/exclude tests/docs/vendor/legacy; lastmod hanya bila tanggal nyata relevan diketahui. robots tetap allowcrawl/resources dan sitemap domain aktual.
- [x] Index tests hanya menautkan runner nyata noindex, termasuk readiness runner bila ada. Tidak menambahkan link files yang masih rencana.
- [x] Audit direct folder routes/index.html, root-relative assets/nativeESM/classicvendorworker, local fonts/logo; tanpa SPAfallback/compiler/build. Tidak membuat runtime registry framework baru.

## TODO regresi dan QA

- [ ] Perbarui stale hard-coded jumlah 14/26 dan route list dalam existing integrationtests berdasarkan batch aktual; jangan mengganti expected dengan hanya hasil aktual yang di-fetch sehingga halaman hilang tidak terdeteksi. Expected set eksplisit mencakup semua26 baseline+ready additions.
- [ ] Assertion "no script" menghitung executable scripts, mengecualikan application/ld+json. Type/properties JSON-LD di-parse dan cocok visible content; no fake ratings/reviews.
- [ ] Jalankan fixture new tools+readiness yang terkait dan integration runner existing yang diedit. Jangan melonggarkan assertions agar suite hijau; report gagal dengan reproduksi.
- [ ] New invariant integration memeriksa10 candidate sesuai ready subset: href/assets/mainhead, input privacy, library hanya dimuat consumer, no framework/build, outputrace/clear jika applicable. Tidak menduplikasi setiap pure fixture tool.
- [ ] Smoke directload/refresh/example/error/clear/stale/copy/download per tool siap; keyboard/no-JS content; hub dan representative pages pada320/390/768/1440 px. Catat browser/network/console.
- [x] Input teks/file/password/URL tidak muncul pada fetch/XHR/beacon/telemetry/storage/siteURL. Markdown preview tidak memuat resource/navigate dan XML DOCTYPE tidak memicu request. Hanya fixtures sintetis.
- [ ] Periksa ukuran resource/layout awal dan interaksi; dependency berat tidak masuk homepage/hub/tool yang tidak membutuhkan. Ukur masalah sebelum optimasi; tidak mengarang Lighthouse/CrUX/ranking.
- [x] `git diff --check` lulus; files owned/perubahan pengguna tetap utuh. Update checklist task 24 + row 24 README dan rows batch hanya berdasarkan evidence yang tersedia.

## Definition of Done

Batchready terhubung dari hub, expected set sitemap tepat, tanpa broken links/metadata duplicates, tests/QA yang relevan lulus. Status **sebagian** bila integration/QA/public verification masih tertunda. Jangan menandai toolplan sebagai implemented karena dokumen TODO dibuat.

Verifikasi live setelah pemilik mempublikasikan: HTML/asset/directroute/HTTPS/canonical/robots nyata, status/redirect/headers dari tool yang mengungkap response; browser render tidak dijadikan bukti200. GSC indexing/query memerlukan akses/data; tidak submit/change account atau menjanjikan traffic dari dokumen ini.

## Prompt siap tempel

```text
Kerjakan hanya docs/developer-tools/24-extension-integration-seo.md untuk batch <nomor tools siap>.
Baca README/CONTRACT/EXTENSION-CONTRACT serta hasil task batch, inventaris file aktual.
Rekomendasi Luna high; scope batch kecil. Integrasikan hanya tools yang lulus, pertahankan26canonical baseline dan12 developer existing.
Update hub/relatedlinks/sitemap/runnerindex dan expectations stale secukupnya. Jangan implementasikan tool lain atau framework/build.
Jalankan checks/fixtures/QA relevant, catat jumlahURLaktual serta local/live limitations.
Update checklist task 24 dan README berdasarkan bukti. Jangan commit/push/deploy atau mengubah akun/setting.
```

## Hasil eksekusi per batch

Batch siap: **15, 16, 17, 20, 21, 22** (`/hash-generator/`, `/password-generator/`, `/color-converter/`, `/number-base-converter/`, `/url-parser/`, `/css-gradient-generator/`). Hub lokal kini memiliki **18 cards / 6 kategori**; sitemap mempertahankan 26 URL existing dan menambah enam, total **32 unique URLs**. Test directory berisi 21 noindex runners. New tool fixtures **43/43**, new integration **10/10**, original integration **29/29** lulus di in-app browser pada HTTP localhost. Responsive smoke pada 320/390/768/1440 px, no-script guide, canonical/metadata, input/network isolation, Blob dispatch/content dan clipboard flow lulus. `git diff --check` bersih.

Masih pending: tahap 14a A–D beserta license/archive/checksum/browser probes, implementasi 14/18/19/23, integrasi mereka ke hub/sitemap, manual keyboard/console review, dan verifikasi live setelah publish. Tidak ada file vendor ditambahkan. Registry gagal di-resolve dari workspace (`Could not resolve host: registry.npmjs.org`), jadi task 14a dan konsumen yang memerlukan library tidak ditandai selesai.
