# 01 — JSON Validator & Formatter

Status: SELESAI secara lokal pada 11 Oktober 2026.
Model: **GPT-6 Luna · high**; gunakan GPT-6.1 Sol medium bila fixture masih gagal setelah satu perbaikan terarah.

## Tujuan dan batas kerja

- Path: `/jsonlint/`; canonical: `https://edwinlab.dev/jsonlint/`.
- Bantu developer memvalidasi, memformat, dan meminifikasi payload JSON tanpa mengubah nilai asli.
- Bahasa UI dan artikel: Inggris. Instruksi kerja: Indonesia.
- V1: validasi JSON standar, indentasi 2/4 spasi, minify, contoh, clear, copy, download `.json`.
- Tidak termasuk JSONC, JSON5, repair otomatis, schema validation, upload URL, atau code editor besar.

**Batas teknologi:** hanya HTML, CSS, JavaScript vanilla dan library JavaScript lokal siap browser bila disebutkan. Tanpa npm, package.json, framework, bundler, transpiler, atau backend.

## Prasyarat dan file

- [x] Baca `docs/developer-tools/README.md`, `CONTRACT.md`, dan `00-foundation.md`; foundation harus selesai.
- [x] Baca `README.md` repository dan inspeksi template/shared API aktual sebelum mengimpor helper.
- [x] Buat `jsonlint/index.html`, `jsonlint/tool.js`, `jsonlint/logic.js`.
- [x] Buat `tests/tools/jsonlint.test.js` dan `tests/tools/jsonlint.html` memakai harness browser dalam CONTRACT.md.
- [x] Gunakan `/tools/shared/tools.css` dan `/tools/shared/ui.js`; jangan mengubah shared files dalam task ini.
- [x] Gunakan dependency di `tools/vendor/jsonc-parser/` dari foundation; jangan memasang salinan kedua.
- [x] Jangan mengubah homepage, sitemap, registry tool, package/lockfile global, atau tool lain; integrasi dikerjakan terpisah.

## TODO implementasi

- [x] Salin shell foundation: breadcrumb, H1, deskripsi singkat, area kerja, artikel, footer, dan fallback tanpa JavaScript.
- [x] Sediakan textarea berlabel `JSON input`, area readonly `Result`, select `Indentation`, serta tombol tindakan.
- [x] Jalankan transformasi saat tombol ditekan; edit input membatalkan hasil/status sebelumnya dan menonaktifkan copy/download stale.
- [x] Tolak input kosong/whitespace dengan pesan khusus; batasi input 5 MiB UTF-8 sebelum parsing sesuai contract.
- [x] Pisahkan pure functions validasi, format, dan minify di `logic.js`; modul ini tidak mengakses DOM/storage/network.
- [x] Gunakan parser teruji untuk offset error yang konsisten. Kandidat: `jsonc-parser`; tinjau dokumentasi resmi dan pin versi tepat saat eksekusi.
- [x] Konfigurasi strict JSON: komentar dilarang, trailing comma dilarang, empty content dilarang; jangan menganggap hasil recovery parser sebagai sukses.
- [x] Gunakan browser ESM jsonc-parser yang disiapkan foundation; tidak ada bundling atau kebutuhan Node. Catat versi dependency yang sudah tersedia.
- [x] Format memakai whitespace edits terhadap sumber; minify menggabungkan slice token sumber tanpa whitespace di luar string.
- [x] Jangan menggunakan `JSON.stringify(JSON.parse(input))` untuk output: angka besar, `-0`, dan escape asli harus tetap utuh.
- [x] Untuk token scanner, ambil teks dari offset/panjang sumber, bukan decoded token value; validasi harus sukses dahulu.
- [x] Pertahankan urutan key dan duplicate keys; tampilkan catatan bahwa valid secara sintaks tidak menjamin kompatibilitas semua consumer.
- [x] Tampilkan error pertama beserta baris/kolom 1-based, petunjuk singkat, dan tombol/fokus menuju lokasi input yang salah.
- [x] Hitung posisi dari offset dengan dukungan LF/CRLF; jangan hard-code format pesan error browser.
- [x] Batasi kedalaman struktur 100 dengan pemeriksaan token sebelum operasi yang rekursif; beri error yang jelas jika melewati batas.
- [x] Pastikan hasil format tidak melewati batas output contract; jika membesar terlalu jauh, gagal dengan pesan, bukan output parsial.
- [x] Copy/download hanya dari hasil sukses; gunakan helper shared dan nama file `formatted.json` atau `minified.json`.
- [x] Semua data pengguna dirender dengan `.value`/`textContent`; tidak ada `innerHTML`, telemetry, storage, atau input di query URL.
- [x] UI pada 390 px menumpuk input/output; textarea tetap bisa dipakai keyboard dan status menggunakan live region foundation.

## TODO SEO dan copy unik

- [x] Title: `JSON Validator & Formatter Online — Edwin Lab`.
- [x] H1: `JSON Validator & Formatter`.
- [x] Meta description: `Validate, format, and minify JSON in your browser. Find syntax errors by line and column while preserving large numbers and original values.`
- [x] Intro: `Check an API response, find a syntax error, or make a JSON payload easier to read.`
- [x] Buat HTML statis yang berguna: cara pakai, contoh JSON valid, trailing comma, single quotes, dan missing comma beserta perbaikannya.
- [x] Jelaskan perbedaan validasi sintaks dan validasi data/schema; jelaskan bahwa whitespace berubah, token nilai dipertahankan.
- [x] FAQ unik: `Why is my JSON invalid?`, `Are comments allowed in JSON?`, `Will formatting change large numbers?`, `Is my JSON uploaded?`.
- [x] Sasaran query: `JSON validator`, `JSON formatter`, `JSON trailing comma error`, `JSON minifier` dalam satu halaman alami.
- [x] Tambahkan canonical, OG, dan structured data sesuai contract; jangan menambahkan klaim ranking atau FAQ rich-result.
- [x] Related tools kandidat: `/json-diff/`, `/json-yaml-converter/`, `/json-csv-converter/`; tautan aktif hanya saat target sudah terintegrasi.

## Fixture dan verifikasi wajib

Notasi `\n`/`\r\n` dalam fixture berarti newline sebenarnya ketika dibuat sebagai string test.

- [x] Format `{"a":1,"b":[true,null]}` dengan 2 spasi menghasilkan JSON berindentasi yang tetap valid dan memiliki token nilai identik.
- [x] Minify ` { "name" : "Edwin Lab", "n" : 1 } ` → `{"name":"Edwin Lab","n":1}`.
- [x] Minify `{"s":"a b \\" c","n":-0}` mempertahankan whitespace/escape di dalam string dan token `-0`; gunakan literal fixture yang di-escape dengan benar.
- [x] Input `{"n":9007199254740993,"e":1e400}` valid secara sintaks; format/minify mempertahankan kedua lexeme persis, tidak menghasilkan angka lain atau `null`.
- [x] `{"n":"9007199254740993"}` tetap sebuah string; emoji, Unicode, backslash, dan escape `\u0061` tidak diubah.
- [x] `{"a":1,}`, `{'a':1}`, `{"a":NaN}`, `// comment\n{}`, dan input kosong → gagal; hasil lama tidak tersedia untuk copy.
- [x] `{"a":1}\n{"b":2}` → gagal karena ada dua root; primitive root `0`, `false`, `null`, dan `"ok"` → valid.
- [x] `{"a":1,"a":2}` tetap memiliki kedua key setelah format/minify; jangan mengubahnya menjadi hanya key terakhir.
- [x] Input invalid multiline LF dan CRLF → lokasi error berada dalam rentang input dan menunjuk token yang salah; uji satu error yang diketahui pada tiap jenis newline.
- [x] `{"html":"<img src=x onerror=alert(1)>"}` tampil sebagai teks dan tidak mengeksekusi HTML.
- [x] Uji input di atas 5 MiB dan kedalaman 101 → error terkontrol; kondisi tepat batas ukuran mengikuti shared contract.

## Definition of Done

- [x] Buka `/tests/tools/jsonlint.html` melalui HTTP lokal; seluruh tes browser-native lulus dan console bersih.
- [x] `git diff --check` lulus; lihat diff untuk memastikan hanya file yang dimiliki task ini berubah.
- [x] Jalankan server statis sesuai README; buka langsung `/jsonlint/`, refresh, lalu uji format/minify/error/copy/download di browser.
- [x] Periksa keyboard, fokus error, 390/1440 px, console, serta Network: konten input tidak dikirim ke server.
- [x] Matikan JavaScript: H1, penjelasan, contoh, dan navigasi masih tampil; form memiliki pemberitahuan keterbatasan.
- [x] Laporkan file, test, hasil browser, versi dependency, dan keterbatasan; tandai checkbox yang benar-benar selesai.

## Prompt siap tempel

```text
Implementasikan hanya docs/developer-tools/01-jsonlint.md di repository ini.
Baca docs/developer-tools/README.md dan CONTRACT.md; pastikan 00-foundation.md selesai.
Ikuti file ownership dan acceptance tests. UI/copy Inggris, buildless static GitHub Pages, browser ESM .js.
Jangan mengubah angka ketika format/minify, shared files, homepage, sitemap, package global, atau tool lain.
Kerjakan sampai test dan review browser selesai. Jangan deploy/push. Laporkan hasil dan limitation aktual.
```

Rujukan parser: [dokumentasi resmi jsonc-parser](https://github.com/microsoft/node-jsonc-parser). Verifikasi API/versi kembali saat implementasi.


## Hasil eksekusi 11 Oktober 2026

- Implementasi dibatasi ke `jsonlint/index.html`, `jsonlint/tool.js`, `jsonlint/logic.js`, dan dua file runner di `tests/tools/`.
- `logic.js` mengekspor `validateJSON`, `formatJSON`, `minifyJSON`, serta `MAX_DEPTH`; semua proses memakai modul browser lokal dan tidak mengirim atau menyimpan input.
- Strict syntax memakai `validateJSON` foundation dengan batas 5 MiB, satu root JSON, tanpa comment/trailing comma, dan maksimal depth 100.
- Format/minify mengambil token langsung dari sumber. Nilai besar, `1e400`, `-0`, duplicate properties, urutan key, Unicode, dan escape spelling tetap sama. JSON tetap divalidasi secara sintaks; validasi tidak menyatakan consumer menerima duplicate keys atau angka besar.
- Pemformat vendored dapat menghasilkan teks rusak pada level indentasi sangat dalam karena entri cache indentasinya tidak tersedia. Implementasi memformat dari token sumber untuk struktur yang dalam dan memverifikasi token hasil dari jalur parser normal. Hasil format dihentikan ketika estimasi byte dari edit melewati 10 MiB.
- UI memisahkan Validate, Format, dan Minify; terdapat contoh valid/invalid, clear, copy, download, pilihan indentasi, pesan error dengan line/column, fokus dan seleksi lokasi error, serta penghapusan output/copy/download ketika input berubah.
- Konten SEO hadir pada HTML awal: title/description/canonical/OG, H1, contoh, common syntax errors, FAQ informatif, WebApplication dan BreadcrumbList JSON-LD. Tidak ada tautan related ke halaman yang belum dibuat.
- Tes browser: **20/20 lulus** di `/tests/tools/jsonlint.html`; mencakup fixture JSON, batas 5 MiB/10 MiB, depth, token preservation, lokasi LF/CRLF, serta markup literal. Console browser bersih.
- QA halaman: direct route `/jsonlint/`, format 2/4 spasi, minify, validasi, error helper/focus/cursor, copy, contoh, clear/stale output, dan download click. Layout responsif diperiksa pada 320/390/768/1440 px tanpa overflow; 320/390 menumpuk editor dan 768/1440 menampilkan dua kolom. Screenshot mobile 390 px menunjukkan panel editor satu kolom.
- Task tidak mengubah shared foundation, homepage, sitemap, domain, dependency, atau tool lain. `git diff --check` bersih. Tidak ada proses build.
- In-app browser mengonfirmasi klik `Download JSON` dan statusnya, namun tidak mengekspos apakah file tersimpan pada disk. File-saver helper dan Blob, nama aman, pembersihan URL sudah diuji saat foundation.
