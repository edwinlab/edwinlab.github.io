# 07 — Cron Expression Explainer

Status: belum diimplementasikan. Dokumen ini adalah TODO untuk satu sesi implementasi.
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

- [ ] Baca instruksi repository, `README.md`, `CONTRACT.md`, dan `00-foundation.md` di direktori ini.
- [ ] Fondasi selesai sebelum mulai; gunakan shared CSS/UI berdasarkan file dan ekspor aktual.
- [ ] Miliki `cron-expression/index.html`, `tool.js`, `logic.js`, dan bila diperlukan `worker.js`.
- [ ] Miliki juga `tests/tools/cron-expression.test.js` dan `tests/tools/cron-expression.html`, memakai harness browser-native foundation.
- [ ] Jangan mengubah homepage, sitemap, daftar tool, shared files, atau manifest global.
- [ ] Catat kebutuhan integrasi/dependency global untuk tugas integrasi, jangan menebak helper fondasi.

## Keputusan dependency dan perilaku

- [ ] Pilih library cron matang dari sumber resmi saat implementasi; gunakan `Croner` dengan distribusi browser resmi.
- [ ] Verifikasi dukungan browser, zona IANA, DST, next-occurrence, serta semantik DOM/DOW OR.
- [ ] Pin versi tepat; simpan browser ESM dan dependency transitif secara lokal di `/tools/vendor/croner/`.
- [ ] Simpan lisensi, URL sumber resmi, versi, dan catatan distribusi siap browser sesuai kontrak fondasi.
- [ ] Jangan memakai URL CDN, versi floating, bare package import browser, atau membuat engine cron sendiri.
- [ ] Gunakan Croner siap browser dari foundation. Jika tidak kompatibel dengan native browser, laporkan dependency blocker; jangan menambahkan bundler/resolver.
- [ ] Batasi grammar publik meskipun library mendukung dialek lain: tepat lima field dengan angka, `*`, `,`, `-`, `/`.
- [ ] Rentang: menit 0–59, jam 0–23, DOM 1–31, bulan 1–12, DOW 0–7; 0 dan 7 berarti Minggu.
- [ ] Tolak nama bulan/hari pada versi pertama agar grammar dan pesan error tetap tegas.
- [ ] Jika DOM dan DOW dibatasi, tanggal cocok ketika salah satunya cocok (OR), bukan keduanya wajib cocok.
- [ ] Wildcard DOM/DOW mengikuti semantik Unix library terpilih; jangan mengganti logika berdasarkan tebakan.
- [ ] Semua hasil harus setelah waktu referensi, bukan termasuk waktu referensi itu sendiri.
- [ ] Default referensi adalah waktu perangkat; injeksikan nilai tetap untuk semua unit test.
- [ ] Sediakan UTC sebagai default, Asia/Jakarta, dan pilihan zona IANA yang didukung library.
- [ ] Tampilkan zona, offset UTC setiap hasil, ISO UTC, dan waktu lokal agar transisi DST dapat dibedakan.
- [ ] Documentasikan perilaku library terhadap jam yang hilang/berulang saat DST; jangan klaim portabilitas universal.

## TODO implementasi

- [ ] Buat HTML statis dengan H1, input cron berlabel, referensi ISO, zona waktu, hasil, dan panduan field.
- [ ] Batasi ekspresi maksimal 256 karakter; tolak enam/tujuh field, macros, dan karakter di luar grammar.
- [ ] Bungkus library dalam `logic.js`; ekspor fungsi murni dengan cron, referensi, dan zona eksplisit.
- [ ] Validasi referensi ISO ber-offset dan zona sebelum meminta iterasi jadwal.
- [ ] Tampilkan tabel lima field serta uraian set nilai/rentang/step yang tidak mengubah arti ekspresi.
- [ ] Jika deskripsi singkat ambigu, prioritaskan uraian per field yang tepat; jangan membuat klaim salah.
- [ ] Tambahkan contoh setiap 15 menit, pukul 09:00 setiap hari kerja, dan tanggal 1 setiap bulan.
- [ ] Sediakan tombol explain, copy expression, copy upcoming times, clear, dan reset reference to now.
- [ ] Lindungi perhitungan jadwal mustahil/sangat jarang dengan batas iterasi library dan horizon eksplisit.
- [ ] Gunakan worker bila fungsi sinkron tidak bisa diberi batas aman; terapkan timeout terminasi 2 detik.
- [ ] Batasi horizon maksimal 40 tahun; jika hasil kurang dari lima, beri hasil parsial dan alasan batasnya.
- [ ] Input baru/cancel harus membatalkan perhitungan lama; hasil worker lama tidak boleh menimpa input baru.
- [ ] Bedakan error sintaks, zona tidak didukung, tidak ada jadwal dalam horizon, dan timeout.
- [ ] Tidak mengirim atau menyimpan ekspresi maupun referensi pengguna ke layanan lain.

## TODO SEO dan copy

- [ ] Title: `Cron Expression Explainer & Next Run Times | Edwin Lab`.
- [ ] H1: `Cron Expression Explainer`; metadata unik menyebut Unix lima field dan timezone.
- [ ] Canonical, breadcrumbs, social metadata, dan structured data mengikuti `CONTRACT.md`.
- [ ] Sertakan diagram teks lima field yang bisa dibaca crawler, tabel rentang, dan contoh berpenjelasan.
- [ ] Jelaskan OR pada day-of-month/day-of-week dengan contoh `0 9 1 * 1`.
- [ ] FAQ terlihat membahas lima vs enam field, timezone, DST, dan perbedaan dialek cron.
- [ ] Nyatakan tool memperkirakan jadwal menurut library/semantik yang didokumentasikan, bukan scheduler server.
- [ ] Tautkan Timestamp Converter dan tool terkait yang sudah tersedia; hindari halaman duplikat per contoh.

## Pengujian inti dengan harness browser-native

- [ ] `*/15 * * * *`, UTC, referensi `2024-01-01T00:00:00Z` → 00:15, 00:30, 00:45, 01:00, 01:15 UTC.
- [ ] `0 9 * * 1-5`, UTC, referensi Jumat `2024-01-05T09:00:00Z` → Senin 8 Januari 09:00 sebagai hasil pertama.
- [ ] `0 9 1 * 1`, UTC, referensi `2024-01-29T00:00:00Z` → 29 Jan, 1 Feb, 5 Feb, 12 Feb, 19 Feb, semuanya 09:00.
- [ ] `0 9 * * *`, Asia/Jakarta, referensi `2024-01-01T00:00:00Z` → `2024-01-01T02:00:00Z` sebagai hasil pertama.
- [ ] `0 0 * * 0` dan `0 0 * * 7` menghasilkan jadwal Minggu yang sama.
- [ ] Referensi tepat pada slot tidak diikutkan; urutan hasil menaik dan tidak memiliki instant duplikat.
- [ ] Spring DST: `* * * * *`, America/New_York, referensi `2024-03-10T06:59:00Z` → pertama `07:00Z`, lokal 03:00 offset -04:00.
- [ ] Fall DST: `* * * * *`, America/New_York, referensi `2024-11-03T05:59:00Z` → pertama `06:00Z`, lokal 01:00 offset -05:00.
- [ ] Tambahkan fixture jadwal jam tetap saat DST sesuai perilaku resmi library; tulis hasil dan kebijakan dalam test.
- [ ] Tolak `60 * * * *`, `*/0 * * * *`, enam field, tujuh field, `@daily`, `MON`, dan zona IANA tidak valid.
- [ ] `0 0 31 2 *` selesai dengan pesan tidak ada jadwal/limit; tidak boleh membekukan UI.
- [ ] Leap-day expression menghasilkan 29 Februari yang valid, bukan 28 Februari atau 1 Maret.
- [ ] Uji timeout/cancel dengan worker fixture terkendali tanpa menunggu pekerjaan berbahaya sungguhan.

## QA browser dan selesai jika

- [ ] Buka `/tests/tools/cron-expression.html` melalui HTTP lokal; seluruh tes browser-native lulus dan console bersih.
- [ ] Uji direct path, refresh, mobile 375 px, desktop, keyboard, label, hasil, contoh, dan copy.
- [ ] Zona host berbeda tidak mengubah hasil fixture dengan zona eksplisit.
- [ ] Periksa worker cancel/timeout, error console, dan tidak ada network request berisi input.
- [ ] HTML awal memiliki konten SEO; lisensi dependency tersedia; tidak ada impor eksternal runtime.
- [ ] Laporkan versi dependency, semantik DST, hasil tes/QA, dan kebutuhan integrasi.

## Prompt eksekusi

```text
Implementasikan docs/developer-tools/07-cron-expression.md setelah membaca README.md, CONTRACT.md,
dan 00-foundation.md di direktori yang sama. Gunakan GPT-6.1 Sol dengan reasoning medium.
Pilih library cron resmi yang matang dan pin versi; jangan membuat scheduler/parser sendiri.
Batasi perubahan ke file milik task dan dependency lokal yang disetujui kontrak. Jangan publish.
Verifikasi OR DOM/DOW, timezone, DST, bounded computation, tes browser-native, serta QA browser.
```
