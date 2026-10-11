# 07 — Cron Expression Explainer

Status: SELESAI — implementasi lokal dan QA terverifikasi pada 11 Oktober 2026.
Model: **GPT-6.1 Sol · medium**. Jalankan setelah `00-foundation.md` selesai.
URL: `/cron-expression/`. UI dan konten publik berbahasa Inggris.

## Tujuan dan batas pekerjaan

- Jelaskan cron Unix lima field dan tampilkan lima waktu eksekusi berikutnya dengan zona waktu jelas.
- Dukung menit, jam, tanggal dalam bulan, bulan, dan hari dalam minggu.
- Tidak mendukung field detik/tahun, Quartz, macros seperti `@daily`, `L`, `W`, `#`, atau jadwal sistem.
- Tidak menjalankan job, menyimpan jadwal, membuat reminder, atau menjanjikan perilaku semua scheduler.
- Seluruh parsing dan perhitungan berlangsung lokal di browser.

**Batas teknologi:** hanya HTML, CSS, JavaScript vanilla dan library JavaScript lokal siap browser bila disebutkan. Tanpa npm, package.json, framework, bundler, transpiler, atau backend.

## Prasyarat dan kepemilikan file

- [x] Baca instruksi repository, `README.md`, `CONTRACT.md`, dan `00-foundation.md` di direktori ini.
- [x] Fondasi selesai sebelum mulai; gunakan shared CSS/UI berdasarkan file dan ekspor aktual.
- [x] Miliki `cron-expression/index.html`, `tool.js`, `logic.js`, `worker.js`, dan `worker-client.js`.
- [x] Miliki juga `tests/tools/cron-expression.test.js` dan `tests/tools/cron-expression.html`, memakai harness browser-native foundation.
- [x] Homepage, sitemap, dan daftar tool tetap; pengecualian update dependency foundation disetujui pengguna melalui “continue” setelah blocker dilaporkan.
- [x] Catat kebutuhan integrasi/dependency global untuk tugas integrasi, jangan menebak helper fondasi.

## Keputusan dependency dan perilaku

- [x] Pilih library cron matang dari sumber resmi saat implementasi; gunakan `Croner` dengan distribusi browser resmi.
- [x] Verifikasi dukungan browser, zona IANA, DST, next-occurrence, serta semantik DOM/DOW OR.
- [x] Pin versi tepat; simpan browser ESM dan dependency transitif secara lokal di `/tools/vendor/croner/`.
- [x] Simpan lisensi, URL sumber resmi, versi, dan catatan distribusi siap browser sesuai kontrak fondasi.
- [x] Jangan memakai URL CDN, versi floating, bare package import browser, atau membuat engine cron sendiri.
- [x] Gunakan Croner siap browser dari foundation. Jika tidak kompatibel dengan native browser, laporkan dependency blocker; jangan menambahkan bundler/resolver.
- [x] Batasi grammar publik meskipun library mendukung dialek lain: tepat lima field dengan angka, `*`, `,`, `-`, `/`.
- [x] Rentang: menit 0–59, jam 0–23, DOM 1–31, bulan 1–12, DOW 0–7; 0 dan 7 berarti Minggu.
- [x] Tolak nama bulan/hari pada versi pertama agar grammar dan pesan error tetap tegas.
- [x] Jika DOM dan DOW dibatasi, tanggal cocok ketika salah satunya cocok (OR), bukan keduanya wajib cocok.
- [x] Wildcard DOM/DOW mengikuti semantik Unix library terpilih; jangan mengganti logika berdasarkan tebakan.
- [x] Semua hasil harus setelah waktu referensi, bukan termasuk waktu referensi itu sendiri.
- [x] Default referensi adalah waktu perangkat; injeksikan nilai tetap untuk semua unit test.
- [x] Sediakan UTC sebagai default, Asia/Jakarta, dan pilihan zona IANA yang didukung library.
- [x] Tampilkan zona, offset UTC setiap hasil, ISO UTC, dan waktu lokal agar transisi DST dapat dibedakan.
- [x] Documentasikan perilaku library terhadap jam yang hilang/berulang saat DST; jangan klaim portabilitas universal.

## TODO implementasi

- [x] Buat HTML statis dengan H1, input cron berlabel, referensi ISO, zona waktu, hasil, dan panduan field.
- [x] Batasi ekspresi maksimal 256 karakter; tolak enam/tujuh field, macros, dan karakter di luar grammar.
- [x] Bungkus library dalam `logic.js`; ekspor fungsi murni dengan cron, referensi, dan zona eksplisit.
- [x] Validasi referensi ISO ber-offset dan zona sebelum meminta iterasi jadwal.
- [x] Tampilkan tabel lima field serta uraian set nilai/rentang/step yang tidak mengubah arti ekspresi.
- [x] Jika deskripsi singkat ambigu, prioritaskan uraian per field yang tepat; jangan membuat klaim salah.
- [x] Tambahkan contoh setiap 15 menit, pukul 09:00 setiap hari kerja, dan tanggal 1 setiap bulan.
- [x] Sediakan tombol explain, copy expression, copy upcoming times, clear, dan reset reference to now.
- [x] Lindungi perhitungan jadwal mustahil/sangat jarang dengan batas iterasi library dan horizon eksplisit.
- [x] Gunakan worker bila fungsi sinkron tidak bisa diberi batas aman; terapkan timeout terminasi 2 detik.
- [x] Batasi horizon maksimal 40 tahun; jika hasil kurang dari lima, beri hasil parsial dan alasan batasnya.
- [x] Input baru/cancel harus membatalkan perhitungan lama; hasil worker lama tidak boleh menimpa input baru.
- [x] Bedakan error sintaks, zona tidak didukung, tidak ada jadwal dalam horizon, dan timeout.
- [x] Tidak mengirim atau menyimpan ekspresi maupun referensi pengguna ke layanan lain.

## TODO SEO dan copy

- [x] Title: `Cron Expression Explainer & Next Run Times | Edwin Lab`.
- [x] H1: `Cron Expression Explainer`; metadata unik menyebut Unix lima field dan timezone.
- [x] Canonical, breadcrumbs, social metadata, dan structured data mengikuti `CONTRACT.md`.
- [x] Sertakan diagram teks lima field yang bisa dibaca crawler, tabel rentang, dan contoh berpenjelasan.
- [x] Jelaskan OR pada day-of-month/day-of-week dengan contoh `0 9 1 * 1`.
- [x] FAQ terlihat membahas lima vs enam field, timezone, DST, dan perbedaan dialek cron.
- [x] Nyatakan tool memperkirakan jadwal menurut library/semantik yang didokumentasikan, bukan scheduler server.
- [x] Tautkan Timestamp Converter dan tool terkait yang sudah tersedia; hindari halaman duplikat per contoh.

## Pengujian inti dengan harness browser-native

- [x] `*/15 * * * *`, UTC, referensi `2024-01-01T00:00:00Z` → 00:15, 00:30, 00:45, 01:00, 01:15 UTC.
- [x] `0 9 * * 1-5`, UTC, referensi Jumat `2024-01-05T09:00:00Z` → Senin 8 Januari 09:00 sebagai hasil pertama.
- [x] `0 9 1 * 1`, UTC, referensi `2024-01-29T00:00:00Z` → 29 Jan, 1 Feb, 5 Feb, 12 Feb, 19 Feb, semuanya 09:00.
- [x] `0 9 * * *`, Asia/Jakarta, referensi `2024-01-01T00:00:00Z` → `2024-01-01T02:00:00Z` sebagai hasil pertama.
- [x] `0 0 * * 0` dan `0 0 * * 7` menghasilkan jadwal Minggu yang sama.
- [x] Referensi tepat pada slot tidak diikutkan; urutan hasil menaik dan tidak memiliki instant duplikat.
- [x] Spring DST: `* * * * *`, America/New_York, referensi `2024-03-10T06:59:00Z` → pertama `07:00Z`, lokal 03:00 offset -04:00.
- [x] Fall DST: `* * * * *`, America/New_York, referensi `2024-11-03T05:59:00Z` → pertama `06:00Z`, lokal 01:00 offset -05:00.
- [x] Tambahkan fixture jadwal jam tetap saat DST sesuai perilaku resmi library; tulis hasil dan kebijakan dalam test.
- [x] Tolak `60 * * * *`, `*/0 * * * *`, enam field, tujuh field, `@daily`, `MON`, dan zona IANA tidak valid.
- [x] `0 0 31 2 *` selesai dengan pesan tidak ada jadwal/limit; tidak boleh membekukan UI.
- [x] Leap-day expression menghasilkan 29 Februari yang valid, bukan 28 Februari atau 1 Maret.
- [x] Uji timeout/cancel dengan worker fixture terkendali tanpa menunggu pekerjaan berbahaya sungguhan.

## QA browser dan selesai jika

- [x] Buka `/tests/tools/cron-expression.html` melalui HTTP lokal; seluruh tes browser-native lulus dan console bersih.
- [x] Uji direct path, refresh, mobile 375 px, desktop, keyboard, label, hasil, contoh, dan copy.
- [x] Independensi zona host diuji dengan melarang getter Date lokal selama fixture zona eksplisit; semua hasil tetap sesuai. Tidak mengganti timezone OS.
- [x] Periksa worker cancel/timeout, error console, dan tidak ada network request berisi input.
- [x] HTML awal memiliki konten SEO; lisensi dependency tersedia; tidak ada impor eksternal runtime.
- [x] Laporkan versi dependency, semantik DST, hasil tes/QA, dan kebutuhan integrasi.

## Hasil implementasi dan verifikasi — 11 Oktober 2026

- Halaman statis `/cron-expression/` siap dilayani GitHub Pages tanpa compiler/build, dengan HTML/CSS/JavaScript vanilla, library lokal, panduan, FAQ, canonical domain `edwinlab.dev`, social metadata, dan structured data. Worker memerlukan HTTP(S), yang tersedia pada GitHub Pages.
- Browser-native cron: **25/25 lulus, 0 gagal**, `/tests/tools/cron-expression.html`. Foundation setelah update: **32/32 lulus, 0 gagal**, `/tests/tools/foundation.html`. Console error/warning bersih.
- Fixture meliputi UTC/Jakarta, OR DOM/DOW, Sunday 0/7, strict-after, kedua transisi DST, fixed-time DST, leap day, grammar/reference/timezone invalid, hasil parsial/no-occurrences, real module worker, serta timeout/cancel/stale-message terkendali.
- UI integration memverifikasi tiga contoh, edit saat worker berjalan, reset-now, clear, label/live status, layout dengan hasil pada 320/375/390/768/1440 px, resource lokal, dan zero fetch/XHR/beacon dari input. SEO/panduan/noscript juga lulus dalam iframe dengan script dinonaktifkan.
- QA manual: direct path dan refresh, Explain melalui Enter, navigasi Tab/focus terlihat, Clear mengembalikan focus ke input, error syntax mengembalikan focus ke expression, Copy expression menghasilkan `*/15 * * * *`, dan Copy upcoming times menghasilkan zona/reference/lima instant beserta offset. Screenshot mobile 375 px dan desktop 1440 px diperiksa.
- Perhitungan berlangsung di worker yang diterminasi setelah maksimal dua detik; input baru/cancel membatalkan job lama. Hasil dibatasi lima sebelum horizon maksimal 40 tahun. Impossible February 31 selesai dengan alasan tidak ada occurrence, tanpa memblokir UI.
- `git diff --check`, audit whitespace file task, dan seluruh checksum runtime/license sesuai provenance. Tidak ada perubahan perilaku engine vendor lokal.
- Integrasi lanjutan: task 13 perlu menambahkan Cron Expression ke kartu hub, related links lintas tool, dan sitemap. Perubahan itu tetap di luar task 07.

### Blocker dependency terselesaikan

- Croner 10.0.1 awalnya gagal fixture wajib fall-back: minutely New York dari `2024-11-03T05:59:00Z` memberi `07:00Z`, padahal occurrence berikutnya harus `06:00Z`.
- Pengguna menyetujui kelanjutan dengan update foundation. Distribusi resmi browser ESM dipin ke **Croner 10.0.2-dev.0**, sebuah **prerelease** yang memuat perbaikan upstream [issue #343](https://github.com/Hexagon/croner/issues/343), [PR #344](https://github.com/Hexagon/croner/pull/344), dan [release notes](https://github.com/Hexagon/croner/releases/tag/10.0.2-dev.0). Fixture wajib kini lulus dengan ekspektasi asli `06:00Z`.
- Update terbatas pada vendor Croner, provenance/checksum, README dependency, tes regresi foundation, dan laporan foundation. Archive SHA-512 diverifikasi sebelum ekstraksi; runtime/license identik dengan arsip resmi. Import query versi mencegah module cache lama.
- Semantik DST **terverifikasi untuk build yang dipin**, bukan janji semua scheduler: minutely melewati spring gap dan melanjutkan repeated fall hour; fixed `01:30` fall memakai occurrence pertama. Fixed `02:30` spring New York pada 10 Maret 2024 bergeser ke **03:30 (07:30Z)**, kemudian kembali ke 02:30 hari berikutnya. Hasil spring ini berbeda dari pernyataan umum upstream README bahwa gap jobs dilewati; fixture dan penjelasan publik menyatakan perbedaan itu secara eksplisit. Tidak mengubah engine atau menyembunyikan perbedaan tersebut.

## Prompt eksekusi

```text
Implementasikan docs/developer-tools/07-cron-expression.md setelah membaca README.md, CONTRACT.md,
dan 00-foundation.md di direktori yang sama. Gunakan GPT-6.1 Sol dengan reasoning medium.
Pilih library cron resmi yang matang dan pin versi; jangan membuat scheduler/parser sendiri.
Batasi perubahan ke file milik task dan dependency lokal yang disetujui kontrak. Jangan publish.
Verifikasi OR DOM/DOW, timezone, DST, bounded computation, tes browser-native, serta QA browser.
```
