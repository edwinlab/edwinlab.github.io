# 13 — Integrasi, SEO, dan verifikasi akhir

Status: TODO, belum implementasi. Model: **GPT-6.1 Sol · medium**. Jalankan setelah satu batch tool selesai; tidak perlu menunggu semua 12 tool.

## Hub dan navigasi awal

Task [02a — Menu Developer Tools dan hub](02a-navigation-hub.md) diprioritaskan sebelum tool 03 untuk menghubungkan JSONlint dan JSON Diff ke homepage. Saat menjalankan task 13, audit dan perluas hub/navigasi yang sudah dibuat oleh 02a; jangan membangun ulang atau menganggapnya belum ada. Gunakan label menu `Developer Tools`. Checkbox di bawah tetap terbuka sampai verifikasi integrasi task 13 benar-benar dilakukan.

## Scope dan file

- `tools/index.html` sebagai direktori statis tool yang siap pakai.
- `sitemap.xml`, `robots.txt` bila sesuai struktur existing; pertahankan aturan/URL valid yang sudah ada.
- `index.html` homepage: penambahan link Tools yang kecil dan relevan, tanpa redesign ulang.
- HTML tool yang siap: breadcrumb, related links, canonical/OG dan konsistensi copy.
- `tests/tools/index.html` sebagai daftar runner tersedia dengan noindex, bukan daftar semua rencana.
- README repo dan tracker: dokumentasi route dan bukti verifikasi aktual.

## TODO integrasi

- [ ] Baca CONTRACT, git status, sitemap/robots/CNAME existing, dan laporan task yang selesai. Bedakan perubahan existing dari pekerjaan ini.
- [ ] Inventaris file aktual; jangan menampilkan tool yang baru berupa rencana atau gagal fixture.
- [ ] Audit/perluas `/tools/` HTML statis dari task 02a (buat hanya jika belum ada) dengan judul `Free Developer Tools | Edwin Lab`, intro singkat, kategori relevan, dan kartu link beserta fungsi konkret.
- [ ] Hub memakai shared CSS dan dapat digunakan tanpa JavaScript; pencarian/filter tidak wajib untuk hanya 12 tool.
- [ ] Verifikasi navigasi Developer Tools dari task 02a pada homepage dan tambahkan pada tool siap yang belum terhubung. Hub menautkan kembali ke profil Edwin dan contact section aktual, tanpa pop-up menghalangi pekerjaan.
- [ ] Sambungkan related tools 2–3 per halaman berdasarkan kegunaan; jangan ada link target belum tersedia. Hub adalah navigasi utama.
- [ ] Periksa logo, font lokal, header/footer, label, focus, responsive states, dan status agar konsisten.
- [ ] Tambahkan index runner hanya untuk test suites yang benar-benar ada.

## TODO SEO teknis

- [ ] Konfirmasi CNAME `edwinlab.dev` dan canonical HTTPS aktual. Jangan ubah domain/DNS/GitHub settings dalam task ini.
- [ ] Pastikan tiap route memiliki `index.html` asli; direct load/refresh bekerja dengan server file biasa tanpa fallback SPA.
- [ ] Canonical, OG URL, sitemap, internal links memakai trailing slash/domain konsisten; satu canonical per halaman.
- [ ] Periksa title, description, H1, intro, contoh, cara pakai, limitations, dan visible FAQ unik; tidak ada placeholder atau keyword stuffing.
- [ ] Periksa `lang=en`, viewport, favicon, OG image yang tersedia, alt text, dan social text akurat.
- [ ] Structured data hanya bila akurat dan berguna; jangan menambahkan rating palsu, FAQ rich-result promise, atau markup fitur yang belum tersedia.
- [ ] Perbarui sitemap hanya dengan halaman publik yang selesai. Jangan menebak URL artikel blog; pertahankan sitemap/blog yang valid. Hindari lastmod otomatis yang tidak merepresentasikan perubahan nyata.
- [ ] robots.txt mengizinkan crawling halaman publik dan menunjuk sitemap canonical. Jangan memblokir CSS/JS yang diperlukan crawler.
- [ ] Test pages memakai noindex; jangan sekaligus memblokir crawling melalui robots jika mengandalkan noindex untuk dibaca. Jangan memasukkan tests/docs/vendor/template ke sitemap.
- [ ] Tidak ada kebutuhan manifest npm atau build untuk menghasilkan sitemap: XML statis boleh diedit langsung.
- [ ] Seluruh HTML/CSS/JS dan module vendor siap disajikan GitHub Pages dari repository tanpa compiler/build aplikasi; verifikasi dengan server file biasa melalui HTTP, tanpa fallback SPA.

## QA dan pengukuran

- [ ] Jalankan seluruh suite yang terintegrasi dan foundation sekali setelah perubahan shared/integrasi; catat pass/fail.
- [ ] Browser smoke tiap tool: direct route/refresh, example, process, error, clear, copy/download jika ada, input berubah, keyboard, dan 390/1440 px; audit representative layout pada 320/768 px.
- [ ] Periksa halaman tanpa JS: navigasi/konten tetap terbaca, pemrosesan menjelaskan kebutuhan JS.
- [ ] Periksa request network: dependency/font lokal; input pengguna tidak dikirim atau ditulis ke URL/storage.
- [ ] Periksa library berat hanya dimuat halaman pemakainya; hub/homepage tidak memuat semua parser. Ukur performa halaman representatif dan catat hasil aktual, bukan skor yang diasumsikan.
- [ ] Validasi href/aset, HTML head, sitemap XML, console, dan `git diff --check`. Perbaiki link mati dan duplicate metadata.
- [ ] Bedakan QA lokal dengan verifikasi publik: selama belum publish, jangan mengklaim live route/indexing/redirect sudah tervalidasi untuk halaman baru.
- [ ] Setelah deployment yang diminta pengguna, verifikasi live HTTPS, status response, redirect domain, dan aset semua route; uji `/jsonlint` serta `/jsonlint/`.
- [ ] Jika Search Console akses tersedia dan pengguna meminta, submit sitemap/inspect URL. Jika tidak, berikan langkah pemilik situs; jangan mengklaim submission berhasil.
- [ ] Catat baseline impressions, clicks, CTR, dan query setelah data tersedia. Jadikan data ini dasar revisi judul/contoh/fitur; jangan membuat monitoring atau automation tanpa permintaan.

## Definition of done

Hub hanya berisi tool yang lulus. Metadata/route/link konsisten, tests dan browser QA lokal lulus, diff tidak menimpa pekerjaan existing. Laporan membedakan pekerjaan lokal selesai, pekerjaan publik menunggu deploy, dan verifikasi Search Console yang memerlukan akses. Checkbox pascadeployment tetap terbuka sampai benar-benar dijalankan.

## Prompt siap tempel

```text
Kerjakan docs/developer-tools/13-integration-seo.md untuk tool yang sudah benar-benar selesai.
Baca README dan CONTRACT di folder itu serta status task terkait. Gunakan HTML CSS JS saja.
Audit/perluas hub dan navigasi hasil task 02a; kerjakan related links, metadata, sitemap/robots sesuai file existing.
Pastikan file siap disajikan GitHub Pages tanpa compiler/build aplikasi.
Pertahankan CNAME dan perubahan pengguna. Jangan menautkan tool belum siap atau redesign homepage.
Jalankan tes dan browser QA, laporkan hasil lokal serta langkah publik yang masih menunggu deployment.
Jangan commit/push/deploy atau mengubah akun Search Console tanpa permintaan pengguna.
```
