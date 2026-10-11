# 03 — Unix Timestamp Converter

Status: belum diimplementasikan. Dokumen ini adalah TODO untuk satu sesi implementasi.
Model: **GPT-6 Luna · high**. Jalankan setelah `00-foundation.md` selesai.
URL: `/timestamp-converter/`. UI dan konten publik berbahasa Inggris.

## Tujuan dan batas pekerjaan

- Konversi Unix timestamp dalam detik/milidetik ke tanggal yang jelas zona waktunya.
- Konversi tanggal ISO 8601 dengan `Z` atau offset eksplisit ke Unix timestamp.
- Pemilihan zona waktu hanya mengubah tampilan hasil, bukan nilai epoch.
- Tidak membuat parser tanggal bebas, konversi waktu lokal tanpa offset, atau kalender.
- Tidak memakai backend, CDN, API waktu, framework, atau library tanggal baru.

**Batas teknologi:** hanya HTML, CSS, JavaScript vanilla dan library JavaScript lokal siap browser bila disebutkan. Tanpa npm, package.json, framework, bundler, transpiler, atau backend.

## Prasyarat dan kepemilikan file

- [ ] Baca instruksi repository, `README.md`, `CONTRACT.md`, dan `00-foundation.md` di direktori ini.
- [ ] Pastikan fondasi tersedia; ikuti struktur, metadata, dan kontrak UI yang sudah dibuat.
- [ ] Miliki hanya `timestamp-converter/index.html`, `tool.js`, dan `logic.js` di folder tersebut.
- [ ] Miliki juga `tests/tools/timestamp-converter.test.js` dan `tests/tools/timestamp-converter.html`, memakai harness browser-native foundation.
- [ ] Gunakan `/tools/shared/tools.css` dan `ui.js` sesuai ekspor aktual; jangan menebak nama helper.
- [ ] Jangan mengubah homepage, daftar tool, sitemap, shared files, atau manifest global dari sesi ini.
- [ ] Laporkan kebutuhan integrasi tersebut pada hasil akhir untuk tugas integrasi.

## Keputusan perilaku

- [ ] Sediakan dua mode: `Timestamp to date` dan `Date to timestamp`.
- [ ] Input timestamp menerima bilangan bulat bertanda, tanpa eksponen atau pemisah ribuan.
- [ ] Sediakan unit `Auto`, `Seconds`, dan `Milliseconds`; pilihan manual selalu menang.
- [ ] Auto boleh menyarankan detik untuk sampai 10 digit dan milidetik untuk 11 digit atau lebih.
- [ ] Tampilkan unit hasil deteksi dan bahwa itu heuristik; jangan menyembunyikan pilihan unit.
- [ ] Contoh dan tombol `Use current time` harus menyetel unit secara eksplisit.
- [ ] Validasi integer aman dan rentang JavaScript Date sebelum dan setelah perkalian 1.000.
- [ ] ISO input menerima `YYYY-MM-DDTHH:mm:ss[.SSS](Z|±HH:mm)`, dengan 1–3 digit fraksi opsional.
- [ ] Validasi tanggal kalender, tahun 0001–9999, jam, menit, detik, dan offset sebelum parsing.
- [ ] Tolak tanggal tanpa zona waktu, tanggal mustahil, leap second, dan format tanggal lokal.
- [ ] Hasil tanggal menampilkan ISO UTC, tanggal pada zona pilihan, dan offset zona pada saat itu.
- [ ] Hasil epoch menampilkan milidetik utuh dan detik; untuk input ISO berfraksi, pertahankan fraksinya.
- [ ] Sediakan UTC, Asia/Jakarta, dan zona IANA lain yang didukung `Intl.DateTimeFormat`.
- [ ] Jika zona tidak didukung, tampilkan error yang bisa diperbaiki; jangan mengganti zona diam-diam.

## TODO implementasi

- [ ] Buat HTML statis: breadcrumb, H1, pengantar, form, hasil, penjelasan, dan related tools.
- [ ] Pisahkan parsing, validasi, konversi, serta formatting yang teruji ke `logic.js`.
- [ ] Hindari ketergantungan DOM dan waktu saat ini di fungsi inti; injeksikan waktu referensi.
- [ ] Gunakan API `Date` dan `Intl`, bukan tabel offset buatan yang mengabaikan DST.
- [ ] Letakkan event handler, pembacaan waktu perangkat, dan penyalinan hasil di `tool.js`.
- [ ] Tampilkan timezone default dengan jelas; UTC adalah default yang tidak bergantung perangkat.
- [ ] Tambahkan contoh timestamp detik, timestamp milidetik, dan ISO dengan offset `+07:00`.
- [ ] Tambahkan tombol convert, copy per hasil, clear, dan `Use current time`.
- [ ] Batasi panjang input scalar secara wajar; ini bukan editor payload 5 MiB.
- [ ] Ikuti kontrak shared UI untuk error, label, fokus, clipboard, dan status aksesibel.
- [ ] Bersihkan hasil lama jika validasi baru gagal, supaya hasil tidak tampak berasal dari input baru.
- [ ] Jangan menyimpan input ke URL, analytics, localStorage, atau layanan lain.

## TODO SEO dan copy

- [ ] Title: `Unix Timestamp Converter — Seconds, Milliseconds & Time Zones | Edwin Lab`.
- [ ] H1: `Unix Timestamp Converter`; deskripsi unik menekankan detik, milidetik, UTC, dan WIB.
- [ ] Canonical dan social metadata mengikuti domain yang ditetapkan `CONTRACT.md`.
- [ ] Jelaskan Unix epoch, satuan detik vs milidetik, dan perbedaan nilai epoch dengan tampilan zona.
- [ ] Sertakan contoh bernilai pasti: `1704067200` = `2024-01-01T00:00:00.000Z` = 07:00 WIB.
- [ ] FAQ harus terlihat: cara membedakan satuan, arti WIB, dan mengapa offset wajib pada ISO input.
- [ ] Nyatakan jam sekarang bersumber dari perangkat pengguna, bukan server waktu yang diverifikasi.
- [ ] Sertakan tautan ke JSON Validator, JWT Decoder, dan Cron Expression jika sudah tersedia.
- [ ] Jangan membuat halaman terpisah yang isinya sama untuk UTC, WIB, detik, atau milidetik.

## Pengujian inti dengan harness browser-native

- [ ] `0` sebagai detik → `1970-01-01T00:00:00.000Z`.
- [ ] `-1` sebagai detik → `1969-12-31T23:59:59.000Z`.
- [ ] `1704067200` detik → `2024-01-01T00:00:00.000Z`.
- [ ] `1704067200123` milidetik → `2024-01-01T00:00:00.123Z`.
- [ ] `1704067200` dengan unit manual milidetik → `1970-01-20T17:21:07.200Z`.
- [ ] `2024-01-01T07:00:00+07:00` → `1704067200` detik dan `1704067200000` milidetik.
- [ ] `2024-01-01T00:00:00.123Z` → detik `1704067200.123`, tanpa kehilangan presisi milidetik.
- [ ] ISO `1969-12-31T23:59:59.999Z` → `-1` milidetik dan `-0.001` detik.
- [ ] Tolak kosong, `1e9`, `1,000`, tanggal tanpa offset, dan `2024-02-30T00:00:00Z`.
- [ ] Terima 29 Februari 2024; tolak 29 Februari 2023 dan `2024-01-01T24:00:00Z`.
- [ ] Nilai di luar rentang Date/unsafe integer memberi error terstruktur, tanpa exception bocor.
- [ ] Zona Asia/Jakarta menunjukkan 07:00 pada contoh; epoch tidak berubah saat zona diganti.
- [ ] Zona tidak valid gagal dengan jelas; jalankan tes di zona host berbeda bila runner mendukung.

## QA browser dan selesai jika

- [ ] Buka `/tests/tools/timestamp-converter.html` melalui HTTP lokal; seluruh tes browser-native lulus dan console bersih.
- [ ] Uji langsung `/timestamp-converter/`, refresh halaman, mobile 375 px, dan desktop.
- [ ] Uji keyboard, label form, pergantian mode/unit/zona, contoh, clear, dan clipboard.
- [ ] Pastikan error dan hasil panjang tidak menyebabkan overflow atau hasil lama yang menyesatkan.
- [ ] Periksa HTML awal berisi judul, penjelasan, dan FAQ sebelum JavaScript dieksekusi.
- [ ] Tidak ada request jaringan yang berisi input, error konsol, atau perubahan file di luar scope.
- [ ] Laporkan file yang berubah, tes, QA, serta item integrasi yang masih perlu dijalankan.

## Prompt eksekusi

```text
Implementasikan docs/developer-tools/03-timestamp-converter.md sampai seluruh acceptance criteria terpenuhi.
Baca README.md, CONTRACT.md, dan 00-foundation.md di direktori yang sama terlebih dahulu.
Gunakan GPT-6 Luna dengan reasoning high, UI Inggris, dan hanya file milik task ini.
Ikuti kontrak fondasi; jangan mengubah shared files, sitemap, homepage, atau manifest global.
Jalankan tes browser-native dan QA browser, lalu laporkan hasil serta kebutuhan integrasi. Jangan publish.
```
