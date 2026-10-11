# 11 — SQL Formatter

Status: selesai — implementasi, fixtures, dan QA browser lulus.
Model: **GPT-6 Luna · high**, menggunakan formatter library matang; jangan membuat parser SQL sendiri.
URL: `/sql-formatter/`. Jalankan setelah `00-foundation.md` selesai. UI publik berbahasa Inggris.

## Tujuan dan batas pekerjaan

- Rapikan tampilan SQL PostgreSQL atau MySQL dengan indentasi dan kapitalisasi keyword pilihan pengguna.
- Tool hanya memformat teks; hasil bukan jaminan query valid, aman, cepat, atau dapat dieksekusi.
- Tidak memvalidasi skema, menjalankan SQL, menghubungkan database, atau mengubah dialek query.
- Tidak membuat minifier, optimizer, query builder, linter SQL, atau parser SQL buatan sendiri.
- Semua pemrosesan lokal tanpa backend, CDN, atau upload query.

**Batas teknologi:** hanya HTML, CSS, JavaScript vanilla dan library JavaScript lokal siap browser bila disebutkan. Tanpa npm, package.json, framework, bundler, transpiler, atau backend.

## Prasyarat dan kepemilikan file

- [x] Baca instruksi repository, `README.md`, `CONTRACT.md`, dan `00-foundation.md` di direktori ini.
- [x] Pastikan fondasi sudah selesai dan ekspor helper shared telah diperiksa dari sumbernya.
- [x] Miliki `sql-formatter/index.html`, `tool.js`, `logic.js`, dan bila perlu `worker.js`.
- [x] Miliki juga `tests/tools/sql-formatter.test.js` dan `tests/tools/sql-formatter.html`, memakai harness browser-native foundation.
- [x] Pakai `/tools/shared/tools.css` dan `ui.js`; jangan menambah framework atau UI kit.
- [x] Jangan mengubah homepage, sitemap, daftar tool, shared files, atau manifest dependency global.
- [x] Catat permintaan integrasi global untuk integrator, bukan mengerjakannya dari task ini.

## Keputusan dependency dan perilaku

- [x] Evaluasi package `sql-formatter` dari repository resmi; periksa dukungan PostgreSQL dan MySQL saat implementasi.
- [x] Pin versi tepat dan seluruh dependency transitif; gunakan distribusi browser UMD atau ESM resmi yang dimuat lokal tanpa build.
- [x] Simpan asset di `/tools/vendor/sql-formatter/`, beserta lisensi dan catatan sumber/distribusi browser.
- [x] Gunakan distribusi siap browser dari foundation; jika tidak tersedia, laporkan blocker dependency dan jangan menambahkan bundler/resolver.
- [x] Jangan memakai CDN, remote import, versi `latest`, atau formatter alternatif tanpa alasan yang dicatat.
- [x] Pilihan dialek hanya `PostgreSQL` dan `MySQL`; label `Dialect` jelas dan tidak menyiratkan konversi dialek.
- [x] Pilihan indentasi: 2 spasi, 4 spasi, atau tab; default 2 spasi.
- [x] Pilihan keyword case: preserve, UPPERCASE, lowercase; default UPPERCASE.
- [x] Case setting hanya untuk keyword yang dikenali library, bukan seluruh query melalui replace/regex.
- [x] Pertahankan isi string literal, komentar, quoted identifier, placeholder, dan dollar-quoted body.
- [x] Bila library tidak mendukung sintaks, tampilkan error dan pertahankan input aslinya untuk diperbaiki.
- [x] Output error harus menyebut kegagalan formatting; jangan menyebut query pasti invalid di database.
- [x] Batasi teks sesuai baseline kontrak, maksimal 5 MiB UTF-8; cek ukuran sebelum memproses.

## TODO implementasi

- [x] Buat HTML statis: breadcrumb, H1, pengantar, kontrol dialek/format, dua editor, contoh, dan panduan.
- [x] Bungkus dependency di `logic.js`; fungsi format menerima input dan opsi eksplisit.
- [x] Core tidak mengakses DOM, network, penyimpanan, atau nilai form global.
- [x] `tool.js` menghubungkan tombol format, example, clear, copy, dan download `.sql`.
- [x] Format dijalankan lewat tombol atau shortcut yang ditampilkan, bukan setiap keystroke pada query besar.
- [x] Editor hasil readonly dengan label berbeda dari input; status sukses menunjukkan dialek terpilih.
- [x] Tambahkan contoh PostgreSQL dan MySQL yang sesuai dialek, termasuk join dan parameter.
- [x] Jika dialek diganti setelah hasil tersedia, tandai hasil lama atau kosongkan hingga diformat ulang.
- [x] Simpan input saat formatter gagal; hilangkan hasil lama yang dapat disangka hasil dari query terbaru.
- [x] Gunakan textContent/value saat menampilkan input, output, dan pesan library; jangan gunakan innerHTML.
- [x] Untuk payload besar, evaluasi worker agar UI tetap responsif; gunakan batas waktu dan cancel bila diperlukan.
- [x] Jika worker dipakai, terminasi pekerjaan lama dan abaikan respons dengan request ID usang.
- [x] Download berupa Blob lokal dengan filename tetap aman; cabut object URL setelah dipakai.
- [x] Jangan memasukkan input ke URL, analytics, localStorage, atau request jaringan.
- [x] Ikuti kontrak UI untuk error, keyboard, fokus, copy, limit ukuran, dan status aksesibel.

## TODO SEO dan copy

- [x] Title: `SQL Formatter Online — PostgreSQL & MySQL | Edwin Lab`.
- [x] H1: `SQL Formatter`; deskripsi unik menekankan dialek, indentasi, dan pemrosesan di browser.
- [x] Canonical, breadcrumbs, metadata sosial, dan structured data mengikuti `CONTRACT.md`.
- [x] Tulis contoh before/after SQL yang benar-benar tersedia di fitur contoh, sebagai HTML statis.
- [x] Jelaskan mengapa pengguna perlu memilih dialek dan apa pengaruh keyword case/indentasi.
- [x] Nyatakan formatting tidak menjalankan query, memeriksa skema, atau memvalidasi kompatibilitas database.
- [x] FAQ terlihat membahas quoted strings, PostgreSQL vs MySQL, serta mengapa sintaks tertentu tidak didukung.
- [x] Tautkan JSON Validator dan JSON to CSV bila tersedia; jangan membuat halaman dialek yang duplikatif.
- [x] Catat library/versi pada informasi teknis singkat tanpa memenuhi tampilan utama dengan detail implementasi.

## Pengujian inti dengan harness browser-native

- [x] `select id,name from users where active=true;` menghasilkan SQL terformat dan keyword UPPERCASE.
- [x] Tetapkan snapshot output tepat berdasarkan library yang dipin, lalu kunci hasil tersebut pada test.
- [x] Format output yang sudah diformat lagi menghasilkan output identik untuk opsi yang sama.
- [x] `select 'select from WHERE' as message;` mempertahankan isi string persis.
- [x] `select 'O''Reilly' as author;` mempertahankan escaping string.
- [x] Query dengan `-- comment` dan `/* comment */` mempertahankan teks komentar dan tidak mengubah arti query.
- [x] PostgreSQL: `select "MixedCase", $1::jsonb from "User";` mempertahankan identifier, `$1`, dan cast.
- [x] PostgreSQL: fixture dollar-quoted body mempertahankan isi literal tanpa kapitalisasi di dalamnya.
- [x] MySQL: `select \`order\` from \`user\` where id = ?;` mempertahankan backticks dan placeholder.
- [x] MySQL: fixture komentar `#` dan executable comment sesuai dukungan resmi versi library, tanpa kehilangan isi.
- [x] Dua statement terpisah semicolon tetap dua statement; semicolon di dalam string tidak memecah literal.
- [x] Uji indentasi 2/4 spasi dan tab; uji preserve/upper/lower tanpa mengubah identifier yang case-sensitive.
- [x] Empty input/whitespace memberi panduan yang jelas, bukan sukses palsu dengan output menyesatkan.
- [x] Fixture sintaks tidak didukung menghasilkan error terstruktur dan input asli tidak termutasi.
- [x] Payload UTF-8 melebihi batas 5 MiB ditolak sebelum formatter; ukur byte, bukan hanya jumlah karakter.
- [x] Teks `<script>` dalam string query ditampilkan literal dan tidak dieksekusi.

## QA browser dan selesai jika

- [x] Buka `/tests/tools/sql-formatter.html` melalui HTTP lokal; seluruh tes browser-native lulus dan console bersih.
- [x] Uji path langsung, refresh, mobile 375 px, desktop, keyboard, labels, examples, copy, dan download.
- [x] Periksa editor dengan query panjang; halaman tidak mengalami horizontal overflow.
- [x] Uji query besar dengan hasil/limit yang jelas serta kemampuan mengubah input setelah error.
- [x] Pastikan HTML awal memuat panduan SEO, console bersih, dependency lokal, dan lisensi tersedia.
- [x] Tidak ada query di network request dan tidak ada perubahan di luar file milik task.
- [x] Laporkan versi dependency, batas sintaks yang ditemukan, hasil tes/QA, dan kebutuhan integrasi.


## Hasil eksekusi

- Seluruh checklist selesai. Browser suite: **19/19 lulus**; QA manual memeriksa worker lokal, shortcut, preservasi query saat error, dan pengosongan output stale saat opsi berubah.
- Dependency: `sql-formatter` 15.6.10 dari distribusi UMD lokal yang sudah tersedia di foundation. Formatter hanya mendukung pilihan PostgreSQL/MySQL yang dicantumkan, dan hasil sukses tidak memvalidasi eksekusi database.

## Prompt eksekusi

```text
Implementasikan docs/developer-tools/11-sql-formatter.md dengan GPT-6 Luna reasoning high.
Baca README.md, CONTRACT.md, dan 00-foundation.md di direktori yang sama terlebih dahulu.
Gunakan library SQL formatter resmi yang dipin dan vendored lokal, bukan parser/formatter buatan sendiri.
Hanya PostgreSQL/MySQL, formatting lokal, dan file milik task ini. Jangan ubah manifest global atau publish.
Verifikasi preservasi literal/comment/placeholder, tes browser-native, QA browser, lalu laporkan kebutuhan integrasi.
```
