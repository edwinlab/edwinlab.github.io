# 24 — Integrasi Everyday Tools Tambahan dan SEO

Status: **rencana, belum dieksekusi**. Model: **GPT-6 Luna · high, per batch**.
Jalankan setelah subset task14–23 lulus; tidak perlu menunggu semua10 tool atau PDF task12.

## Scope dan inventaris

- [ ] Baca README/CONTRACT/EXTENSION-CONTRACT dan bukti task batch. Periksa git status/file aktual/hub/sitemap/test index sebelum mengedit.
- [ ] Miliki perubahan minimal alat/index.html, alat/hub.css bila perlu, related navigation HTML tool ready, sitemap.xml, tests/everyday/index.html, existing integration.test.js jika expectation berubah, serta extension-integration.html dan extension-integration.test.js. Catatan task24/row24 dan README utama boleh diperbarui untuk inventaris aktual.
- [ ] Homepage menu Alat Online dan Developer Tools sudah ada; tidak perlu menambah menu atau redesign. Algoritme tools, shared/vendor, CNAME, robots yang tidak bermasalah, dan status PDF tetap di luar scope.
- [ ] Baseline perencanaan: 11 everyday cards dan35URL sitemap publik. Verifikasi ulang saat eksekusi; perubahan developer/PDF lain dapat membuat count berbeda. Simpan expected **set baseline eksplisit**, bukan sekadar mencocokkan count dengan hasil fetch.
- [ ] Target candidate: terbilang, split-bill, kalkulator-rata-rata, kalkulator-nilai-akhir, pomodoro, stopwatch, pengacak-daftar, pembersih-teks, konversi-format-gambar, crop-foto. Hanya subset yang punya route/fixture/QA terbukti ditautkan.

## Integrasi dan SEO

- [ ] Tambah cards HTML biasa pada kategori bermakna: Teks, Kalkulator, Fokus & Waktu, Tautan, Gambar & Dokumen. Pengacak bisa berada pada kategori Teks & Daftar jika label kategori diperjelas; tidak membuat kategori kosong.
- [ ] Pertahankan semua cards/navigasi/links existing. Count per kategori/hub/metadata/privacy copy sesuai ready subset atau gunakan kalimat tanpa angka.
- [ ] Related: terbilang↔split-bill/diskon; rata-rata↔nilai-akhir/persen; Pomodoro↔stopwatch; pembersih↔kata/ubah-huruf/pengacak; crop↔resize/format; format↔kompres/resize. Tidak menautkan partner rencana atau menyebut fitur partner yang tidak ada.
- [ ] Audit unique title/description/H1, lang=id, canonical/OG trailing slash domain, breadcrumb visible+JSON-LD cocok, intro/example/limitations/FAQ statis. Logo225×225 tidak diberi dimensi social1200×630 palsu.
- [ ] Sitemap menambah hanya ready canonical paths; mempertahankan baseline everyday+developer+home+hubs, deduplicate/exclude docs/tests/vendor/legacy. Jika seluruh10 selesai dan tidak ada perubahan lain, baseline35→45URL; **angka itu bukan status implementasi sekarang**.
- [ ] Index tests menautkan runner nyata noindex, termasuk extension-integration. Tidak membuat public link ke tests atau mengindex fixture.
- [ ] Native imports/assets/fonts/logo bekerja direct /slug/ dan /slug/index.html di HTTP tanpa compiler/build/SPA fallback. Hub tetap tanpa JS runtime.

## Regresi dan QA batch

- [ ] Update stale expected counts/route lists existing integration berdasarkan inventory+ready list eksplisit. Pertahankan assertions API/metadata/localprivacy; jangan menonaktifkan tes untuk menyembunyikan gagal.
- [ ] Runner baru membuktikan baseline routes tetap ada, cards target ready ada dan pending absent, local imports/assets tersedia, canonical/metadata unik, page indexable, runners noindex, JSON-LD cocok.
- [ ] Smoke tiap ready tool: direct/refresh/example/action/error/clear/stale/copy/export sesuai fitur; timer clock lifecycle/pause reset, random source guard, media MIME/dimension/bitmap cleanup dipakai fixture tool. Tidak menduplikasi seluruh pure test dalam integrator.
- [ ] Hub+representative pages pada320/390/768/1440px, keyboard/focus, no-JS guide. New timer controls tidak membanjiri aria-live; numeric tables/output panjang tidak overflow global.
- [ ] Input/filename/labels/angka tidak muncul pada requests/query/hash/storage/analytics. Hanya local asset/blob requests; hasil random/timer tidak disimpan.
- [ ] Jalankan suite tool batch, extension-integration dan existing everyday integration yang diedit; developer smoke bila sitemap/menu global expectation berubah. Catat count pass/fail serta test yang tidak bisa dijalankan.
- [ ] Periksa initial dependencies/resources: helper media hanya di consumer, hub/homepage tidak mengunduh engine/heavy new assets. Ukur masalah nyata jika muncul; tidak mengarang Lighthouse/CrUX/traffic.
- [ ] git diff --check lulus, file ownership dan perubahan pengguna aman. Update dokumen ini, row24, serta README inventaris berdasarkan evidence; tidak menandai tool lain selesai dari keberadaan card saja.

## Definition of Done dan sesudah publish

Batch ready terhubung dengan metadata/link/routes/sitemap/test directory yang benar dan regression pass. Tracker24 bisa mencatat batch lokal selesai tetapi keseluruhan partial selama candidate yang dipilih atau QA wajib masih tertunda. Task12/PDF mempunyai prasyarat/status terpisah.

- [ ] Catat tabel batch: task IDs, cards total, sitemap unique URLs, fixture/integration pass/fail, browser/viewport, pending QA dan batas.
- [ ] Verifikasi live URL/HTTPS/status/canonical/redirect/robots setelah pemilik mempublikasikan. Tes localhost tidak membuktikan deployment atau search indexing.
- [ ] Search Console/traffic hanya diperiksa bila data/akses tersedia dan diminta. Tidak submit akun atau menjanjikan ranking/traffic dari task ini.

~~~text
Kerjakan hanya docs/everyday-tools/24-extension-integration-seo.md untuk batch <IDs ready>.
Baca kontrak/README dan evidence tools; inventaris file/hub/sitemap/runner aktual.
Integrasikan hanya ready route via cards/related links/sitemap/index tests; preserve
baseline explicit routes termasuk semua developer dan everyday existing. Tidak implement
tool yang pending atau redesign home. HTML/CSS/JS buildless, lang=id/SEO statis.
Jalankan fixtures/integration/QA relevan, update checklist/row24 dan inventaris README
berdasarkan bukti. Jangan mengubah status PDF, shared/vendor/tool logic atau deploy/commit/push.
~~~
