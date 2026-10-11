# 13 — Integrasi, SEO, dan verifikasi akhir

Status: SELESAI secara lokal pada 11 Oktober 2026; verifikasi publik pascadeployment dan Search Console masih menunggu. Model: **GPT-6.1 Sol · medium**. Jalankan setelah satu batch tool selesai; tidak perlu menunggu semua 12 tool.

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

- [x] Baca CONTRACT, git status, sitemap/robots/CNAME existing, dan laporan task yang selesai. Bedakan perubahan existing dari pekerjaan ini.
- [x] Inventaris file aktual; jangan menampilkan tool yang baru berupa rencana atau gagal fixture.
- [x] Audit/perluas `/tools/` HTML statis dari task 02a (buat hanya jika belum ada) dengan judul `Free Developer Tools | Edwin Lab`, intro singkat, kategori relevan, dan kartu link beserta fungsi konkret.
- [x] Hub memakai shared CSS dan dapat digunakan tanpa JavaScript; pencarian/filter tidak wajib untuk hanya 12 tool.
- [x] Verifikasi navigasi Developer Tools dari task 02a pada homepage dan tambahkan pada tool siap yang belum terhubung. Hub menautkan kembali ke profil Edwin dan contact section aktual, tanpa pop-up menghalangi pekerjaan.
- [x] Sambungkan related tools 2–3 per halaman berdasarkan kegunaan; jangan ada link target belum tersedia. Hub adalah navigasi utama.
- [x] Periksa logo, font lokal, header/footer, label, focus, responsive states, dan status agar konsisten.
- [x] Tambahkan index runner hanya untuk test suites yang benar-benar ada.

## TODO SEO teknis

- [x] Konfirmasi CNAME `edwinlab.dev` dan canonical HTTPS aktual. Jangan ubah domain/DNS/GitHub settings dalam task ini.
- [x] Pastikan tiap route memiliki `index.html` asli; direct load/refresh bekerja dengan server file biasa tanpa fallback SPA.
- [x] Canonical, OG URL, sitemap, internal links memakai trailing slash/domain konsisten; satu canonical per halaman.
- [x] Periksa title, description, H1, intro, contoh, cara pakai, limitations, dan visible FAQ unik; tidak ada placeholder atau keyword stuffing.
- [x] Periksa `lang=en`, viewport, favicon, OG image yang tersedia, alt text, dan social text akurat.
- [x] Structured data hanya bila akurat dan berguna; jangan menambahkan rating palsu, FAQ rich-result promise, atau markup fitur yang belum tersedia.
- [x] Perbarui sitemap hanya dengan halaman publik yang selesai. Jangan menebak URL artikel blog; pertahankan sitemap/blog yang valid. Hindari lastmod otomatis yang tidak merepresentasikan perubahan nyata.
- [x] robots.txt mengizinkan crawling halaman publik dan menunjuk sitemap canonical. Jangan memblokir CSS/JS yang diperlukan crawler.
- [x] Test pages memakai noindex; jangan sekaligus memblokir crawling melalui robots jika mengandalkan noindex untuk dibaca. Jangan memasukkan tests/docs/vendor/template ke sitemap.
- [x] Tidak ada kebutuhan manifest npm atau build untuk menghasilkan sitemap: XML statis boleh diedit langsung.
- [x] Seluruh HTML/CSS/JS dan module vendor siap disajikan GitHub Pages dari repository tanpa compiler/build aplikasi; verifikasi dengan server file biasa melalui HTTP, tanpa fallback SPA.

## QA dan pengukuran

- [x] Jalankan seluruh suite yang terintegrasi dan foundation sekali setelah perubahan shared/integrasi; catat pass/fail.
- [x] Browser smoke tiap tool: direct route/refresh, example, process, error, clear, copy/download jika ada, input berubah, keyboard, dan 390/1440 px; audit representative layout pada 320/768 px.
- [x] Periksa halaman tanpa JS: navigasi/konten tetap terbaca, pemrosesan menjelaskan kebutuhan JS.
- [x] Periksa request network: dependency/font lokal; input pengguna tidak dikirim atau ditulis ke URL/storage.
- [x] Periksa library berat hanya dimuat halaman pemakainya; hub/homepage tidak memuat semua parser. Ukur performa halaman representatif dan catat hasil aktual, bukan skor yang diasumsikan.
- [x] Validasi href/aset, HTML head, sitemap XML, console, dan `git diff --check`. Perbaiki link mati dan duplicate metadata.
- [x] Bedakan QA lokal dengan verifikasi publik: selama belum publish, jangan mengklaim live route/indexing/redirect sudah tervalidasi untuk halaman baru.
- [ ] Setelah deployment yang diminta pengguna, verifikasi live HTTPS, status response, redirect domain, dan aset semua route; uji `/jsonlint` serta `/jsonlint/`.
- [ ] Jika Search Console akses tersedia dan pengguna meminta, submit sitemap/inspect URL. Jika tidak, berikan langkah pemilik situs; jangan mengklaim submission berhasil.
- [ ] Catat baseline impressions, clicks, CTR, dan query setelah data tersedia. Jadikan data ini dasar revisi judul/contoh/fitur; jangan membuat monitoring atau automation tanpa permintaan.

## Definition of done

Hub hanya berisi tool yang lulus. Metadata/route/link konsisten, tests dan browser QA lokal lulus, diff tidak menimpa pekerjaan existing. Laporan membedakan pekerjaan lokal selesai, pekerjaan publik menunggu deploy, dan verifikasi Search Console yang memerlukan akses. Checkbox pascadeployment tetap terbuka sampai benar-benar dijalankan.

## Hasil integrasi dan QA lokal — 11 Oktober 2026

- Memperluas hub 02a menjadi **12 tools** dalam empat kategori dengan HTML statis, shared CSS, link profil dan contact aktual. Menu Developer Tools pada homepage sudah tersedia dan dipertahankan.
- Menambahkan related links pada JSONLint/JSON Diff dan memperbarui kaitan Timestamp Converter. Semua halaman memiliki 2–3 related tool yang benar-benar tersedia. Tidak mengubah logic tool lain atau shared files; pemuatan SQL UMD halaman dihapus karena worker sudah memuatnya sendiri.
- `CNAME` tetap `edwinlab.dev`. HTTPS homepage publik dapat dibaca pada sesi ini, tetapi masih menampilkan situs lama: [homepage publik](https://edwinlab.dev/). Ini bukan bukti bahwa halaman baru sudah dipublikasikan.
- Repository sebelumnya tidak memiliki sitemap/robots. `sitemap.xml` kini memuat **14 URL**: homepage, hub, dan 12 tools; tanpa lastmod rekaan atau URL blog/artikel yang belum diverifikasi. Link blog existing dipertahankan. `robots.txt` mengizinkan crawling dan menyebut sitemap canonical. `.nojekyll` menandai penyajian file statis GitHub Pages.
- Index test berisi **14 runner yang ada**, seluruhnya noindex, dan tidak disertakan pada sitemap. Metadata/canonical/OG/schema, label, aset, internal href/anchor, sitemap XML, dan CNAME lulus audit.
- **321/321 fixture lulus, 0 gagal**: foundation 32; JSONLint 20; JSON Diff 17; timestamp 21; JWT 20; Base64 18; URL 23; cron 25; UUID 34; YAML 18; CSV 21; SQL 19; regex 25; integrasi 28. Runner normal/halaman smoke tidak menghasilkan error atau warning aplikasi.
- Smoke seluruh tools memverifikasi direct route + refresh pada server file biasa, contoh/proses, clipboard, Blob download bila tersedia, stale/error/clear, input tidak hilang, label/live status, dan layout dengan hasil pada 390/1440 px. Hub serta HTML tanpa scripting diuji pada 320/768 px; regex juga pada 375 px. Clipboard manual regex dan shortcut Ctrl+Enter berhasil.
- Fixture mencatat **0 fetch/XHR/beacon dari interaksi**. Resource halaman semuanya lokal; hub tidak memuat script/library. YAML/SQL/Croner hanya dimuat pemakainya. Core regex tidak dieksekusi di main thread. No-JS diuji dengan iframe sandbox, script dihapus dari salinan HTML agar tidak menimbulkan pesan penolakan script yang disengaja.
- Pengukuran lokal setelah cache terisi, bukan Lighthouse atau skor produksi: hub **11 ms / 43.571 byte resource decoded / 5 resource**, JSONLint **14 ms / 134.715 byte / 15**, YAML **15 ms / 401.938 byte / 87**, SQL **17 ms / 46.231 byte / 10**, regex **13 ms / 52.752 byte / 13**. Byte/timing ini berasal dari Resource/Navigation Timing halaman; beban internal worker tidak termasuk pada resource halaman utama.
- `git diff --check` lulus; perubahan dari task sebelumnya dipertahankan. Tidak ada commit, push, deployment, perubahan DNS/settings GitHub, atau submission Search Console.

## Tindak lanjut publik

Checklist tiga langkah publik di atas sengaja belum dicentang. Setelah pemilik meminta deployment, verifikasi HTTPS dan aset semua route, redirect domain, serta `/jsonlint` ke `/jsonlint/`. Dengan akses Search Console, pemilik dapat mengirim `https://edwinlab.dev/sitemap.xml`, melakukan URL Inspection pada hub dan tools, lalu mencatat impressions, clicks, CTR, serta query setelah tersedia. Tidak ada klaim indexing atau ranking dari QA lokal.

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
