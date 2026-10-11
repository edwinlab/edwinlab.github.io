# 03 — Unix Timestamp Converter

Status: selesai secara lokal pada 11 Oktober 2026. Belum dipublikasikan.
Model rekomendasi awal: **GPT-6 Luna · high**. Jalankan setelah `00-foundation.md` selesai.
URL: `/timestamp-converter/`. UI dan konten publik berbahasa Inggris.

## Tujuan dan batas pekerjaan

- Konversi Unix timestamp dalam detik/milidetik ke tanggal yang jelas zona waktunya.
- Konversi tanggal ISO 8601 dengan `Z` atau offset eksplisit ke Unix timestamp.
- Pemilihan zona waktu hanya mengubah tampilan hasil, bukan nilai epoch.
- Tidak membuat parser tanggal bebas, konversi waktu lokal tanpa offset, atau kalender.
- Tidak memakai backend, CDN, API waktu, framework, atau library tanggal baru.

**Batas teknologi:** hanya HTML, CSS, JavaScript vanilla dan library JavaScript lokal siap browser bila disebutkan. Tanpa npm, package.json, framework, bundler, transpiler, atau backend.

## Prasyarat dan kepemilikan file

- [x] Baca instruksi repository, `README.md`, `CONTRACT.md`, dan `00-foundation.md` di direktori ini.
- [x] Pastikan fondasi tersedia; ikuti struktur, metadata, dan kontrak UI yang sudah dibuat.
- [x] Miliki hanya `timestamp-converter/index.html`, `tool.js`, dan `logic.js` di folder tersebut.
- [x] Miliki juga `tests/tools/timestamp-converter.test.js` dan `tests/tools/timestamp-converter.html`, memakai harness browser-native foundation.
- [x] Gunakan `/tools/shared/tools.css` dan `ui.js` sesuai ekspor aktual; jangan menebak nama helper.
- [x] Jangan mengubah homepage, daftar tool, sitemap, shared files, atau manifest global dari sesi ini.
- [x] Laporkan kebutuhan integrasi tersebut pada hasil akhir untuk tugas integrasi.

## Keputusan perilaku

- [x] Sediakan dua mode: `Timestamp to date` dan `Date to timestamp`.
- [x] Input timestamp menerima bilangan bulat bertanda, tanpa eksponen atau pemisah ribuan.
- [x] Sediakan unit `Auto`, `Seconds`, dan `Milliseconds`; pilihan manual selalu menang.
- [x] Auto boleh menyarankan detik untuk sampai 10 digit dan milidetik untuk 11 digit atau lebih.
- [x] Tampilkan unit hasil deteksi dan bahwa itu heuristik; jangan menyembunyikan pilihan unit.
- [x] Contoh dan tombol `Use current time` harus menyetel unit secara eksplisit.
- [x] Validasi integer aman dan rentang JavaScript Date sebelum dan setelah perkalian 1.000.
- [x] ISO input menerima `YYYY-MM-DDTHH:mm:ss[.SSS](Z|±HH:mm)`, dengan 1–3 digit fraksi opsional.
- [x] Validasi tanggal kalender, tahun 0001–9999, jam, menit, detik, dan offset sebelum parsing.
- [x] Tolak tanggal tanpa zona waktu, tanggal mustahil, leap second, dan format tanggal lokal.
- [x] Hasil tanggal menampilkan ISO UTC, tanggal pada zona pilihan, dan offset zona pada saat itu.
- [x] Hasil epoch menampilkan milidetik utuh dan detik; untuk input ISO berfraksi, pertahankan fraksinya.
- [x] Sediakan UTC, Asia/Jakarta, dan zona IANA lain yang didukung `Intl.DateTimeFormat`.
- [x] Jika zona tidak didukung, tampilkan error yang bisa diperbaiki; jangan mengganti zona diam-diam.

## TODO implementasi

- [x] Buat HTML statis: breadcrumb, H1, pengantar, form, hasil, penjelasan, dan related tools.
- [x] Pisahkan parsing, validasi, konversi, serta formatting yang teruji ke `logic.js`.
- [x] Hindari ketergantungan DOM dan waktu saat ini di fungsi inti; injeksikan waktu referensi.
- [x] Gunakan API `Date` dan `Intl`, bukan tabel offset buatan yang mengabaikan DST.
- [x] Letakkan event handler, pembacaan waktu perangkat, dan penyalinan hasil di `tool.js`.
- [x] Tampilkan timezone default dengan jelas; UTC adalah default yang tidak bergantung perangkat.
- [x] Tambahkan contoh timestamp detik, timestamp milidetik, dan ISO dengan offset `+07:00`.
- [x] Tambahkan tombol convert, copy per hasil, clear, dan `Use current time`.
- [x] Batasi panjang input scalar secara wajar; ini bukan editor payload 5 MiB.
- [x] Ikuti kontrak shared UI untuk error, label, fokus, clipboard, dan status aksesibel.
- [x] Bersihkan hasil lama jika validasi baru gagal, supaya hasil tidak tampak berasal dari input baru.
- [x] Jangan menyimpan input ke URL, analytics, localStorage, atau layanan lain.

## TODO SEO dan copy

- [x] Title: `Unix Timestamp Converter — Seconds, Milliseconds & Time Zones | Edwin Lab`.
- [x] H1: `Unix Timestamp Converter`; deskripsi unik menekankan detik, milidetik, UTC, dan WIB.
- [x] Canonical dan social metadata mengikuti domain yang ditetapkan `CONTRACT.md`.
- [x] Jelaskan Unix epoch, satuan detik vs milidetik, dan perbedaan nilai epoch dengan tampilan zona.
- [x] Sertakan contoh bernilai pasti: `1704067200` = `2024-01-01T00:00:00.000Z` = 07:00 WIB.
- [x] FAQ harus terlihat: cara membedakan satuan, arti WIB, dan mengapa offset wajib pada ISO input.
- [x] Nyatakan jam sekarang bersumber dari perangkat pengguna, bukan server waktu yang diverifikasi.
- [x] Sertakan tautan ke JSON Validator, JWT Decoder, dan Cron Expression jika sudah tersedia.
- [x] Jangan membuat halaman terpisah yang isinya sama untuk UTC, WIB, detik, atau milidetik.

## Pengujian inti dengan harness browser-native

- [x] `0` sebagai detik → `1970-01-01T00:00:00.000Z`.
- [x] `-1` sebagai detik → `1969-12-31T23:59:59.000Z`.
- [x] `1704067200` detik → `2024-01-01T00:00:00.000Z`.
- [x] `1704067200123` milidetik → `2024-01-01T00:00:00.123Z`.
- [x] `1704067200` dengan unit manual milidetik → `1970-01-20T17:21:07.200Z`.
- [x] `2024-01-01T07:00:00+07:00` → `1704067200` detik dan `1704067200000` milidetik.
- [x] `2024-01-01T00:00:00.123Z` → detik `1704067200.123`, tanpa kehilangan presisi milidetik.
- [x] ISO `1969-12-31T23:59:59.999Z` → `-1` milidetik dan `-0.001` detik.
- [x] Tolak kosong, `1e9`, `1,000`, tanggal tanpa offset, dan `2024-02-30T00:00:00Z`.
- [x] Terima 29 Februari 2024; tolak 29 Februari 2023 dan `2024-01-01T24:00:00Z`.
- [x] Nilai di luar rentang Date/unsafe integer memberi error terstruktur, tanpa exception bocor.
- [x] Zona Asia/Jakarta menunjukkan 07:00 pada contoh; epoch tidak berubah saat zona diganti.
- [x] Zona tidak valid gagal dengan jelas; jalankan tes di zona host berbeda bila runner mendukung.

## QA browser dan selesai jika

- [x] Buka `/tests/tools/timestamp-converter.html` melalui HTTP lokal; seluruh tes browser-native lulus dan console bersih.
- [x] Uji langsung `/timestamp-converter/`, refresh halaman, mobile 375 px, dan desktop.
- [x] Uji keyboard, label form, pergantian mode/unit/zona, contoh, clear, dan clipboard.
- [x] Pastikan error dan hasil panjang tidak menyebabkan overflow atau hasil lama yang menyesatkan.
- [x] Periksa HTML awal berisi judul, penjelasan, dan FAQ sebelum JavaScript dieksekusi.
- [x] Tidak ada request jaringan yang berisi input, error konsol, atau perubahan file di luar scope.
- [x] Laporkan file yang berubah, tes, QA, serta item integrasi yang masih perlu dijalankan.

## Hasil aktual dan verifikasi

- File task ini: `timestamp-converter/index.html`, `timestamp-converter/tool.js`, `timestamp-converter/logic.js`, `tests/tools/timestamp-converter.test.js`, dan `tests/tools/timestamp-converter.html`, serta checklist/catatan TODO ini. Tidak ada file di luar scope yang diubah.
- Fixture browser-native: **21/21 lulus, 0 gagal** pada `/tests/tools/timestamp-converter.html`. Mencakup timestamp positif/negatif, deteksi dan pemilihan unit, batas integer/Date, tanggal kalender dan tahun 0001, offset ISO, pecahan milidetik, zona Asia/Jakarta, serta perubahan offset DST New York.
- QA langsung `/timestamp-converter/` dan refresh berhasil. Pada lebar 320, 390, 768, 1440 px serta 375 px, halaman dan hasil tidak overflow. Uji keyboard menampilkan focus outline; label form dan status aksesibel terlihat. Contoh detik/milidetik/ISO, current time dengan unit milidetik, perubahan zona, copy, clear, tanggal salah, dan zona tidak dikenal bekerja. Perubahan input/zona menyembunyikan hasil lama.
- Error zona mengarahkan fokus ke input zona; error timestamp/tanggal mengarahkan fokus ke input nilai. UTC adalah default. Contoh `1704067200` tampil sebagai 00:00 UTC dan 07:00 Asia/Jakarta dengan nilai epoch yang sama. Hasil detik pecahan memakai string integer agar milidetik negatif dan positif tetap tepat.
- Console browser bersih. Source tool tidak menggunakan `fetch`, `XMLHttpRequest`, `sendBeacon`, penyimpanan browser, atau layanan waktu. HTML memuat konten, contoh, FAQ, metadata, breadcrumb, dan petunjuk `<noscript>` secara statis. `git diff --check` lulus.
- Integrasi berikutnya: tambahkan kartu `/timestamp-converter/` ke `tools/index.html` dan URL ke sitemap pada TODO 13. Related link ke JSON Validator sudah ada; JWT Decoder dan Cron Expression belum tersedia, jadi tidak dibuat link mati. Belum ada deployment publik. Zona perangkat browser tidak diganti; tes zona memakai zona IANA eksplisit dan offset tanggal yang diuji.

## Prompt eksekusi

```text
Implementasikan docs/developer-tools/03-timestamp-converter.md sampai seluruh acceptance criteria terpenuhi.
Baca README.md, CONTRACT.md, dan 00-foundation.md di direktori yang sama terlebih dahulu.
Gunakan GPT-6 Luna dengan reasoning high, UI Inggris, dan hanya file milik task ini.
Ikuti kontrak fondasi; jangan mengubah shared files, sitemap, homepage, atau manifest global.
Jalankan tes browser-native dan QA browser, lalu laporkan hasil serta kebutuhan integrasi. Jangan publish.
```
