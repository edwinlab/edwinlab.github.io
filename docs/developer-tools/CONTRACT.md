# Kontrak implementasi bersama

Status: spesifikasi, belum implementasi. Berlaku untuk seluruh TODO. Instruksi pengguna tetap didahulukan.

## Teknologi dan struktur

- Hanya HTML, CSS, dan JavaScript vanilla. Tidak ada framework, TypeScript, npm/package.json, bundler, transpiler, backend, compiler, atau proses build aplikasi.
- Target hosting: GitHub Pages menyajikan file repository dari root situs secara langsung. Semua halaman/aset/module harus siap pakai tanpa generate artifact atau instalasi dependency. Native ES modules berjalan di browser melalui HTTP/HTTPS; dukungan membuka file lokal lewat `file://` tidak dijanjikan.
- Setiap tool adalah folder asli dengan `index.html`, `tool.js` (DOM), `logic.js` (fungsi yang dapat diuji), dan `worker.js` bila diperlukan. Gunakan native ES modules melalui `type="module"`; library UMD boleh dimuat lokal dengan urutan eksplisit.
- URL `/jsonlint/` berasal dari `jsonlint/index.html`, bukan SPA/hash route. `/jsonlint` boleh redirect ke versi trailing slash melalui hosting.
- CSS bersama `/tools/shared/tools.css`; helper `/tools/shared/ui.js`, `/tools/shared/limits.js`, `/tools/shared/json.js`. Tambah CSS per tool hanya untuk kebutuhan khusus.
- Aset lokal, tidak runtime CDN. Gunakan logo `/assets/edwinlab-logo.png` dan font lokal yang benar-benar tersedia. Jangan membuat ulang logo.
- Server preview opsional `python3 -m http.server 4173 --bind 127.0.0.1` hanya menyajikan file; aplikasi tetap sepenuhnya HTML/CSS/JS di browser.

## Kepemilikan pekerjaan

Foundation membuat shared files, template, test harness, dan vendor. Satu task tool hanya mengubah folder tool, dua file tes miliknya, serta checkbox/catatan pada dokumen task tersebut. Task 02a mengurus menu utama, hub awal, dan navigasi tool yang sudah selesai. Task 13 melanjutkan integrasi dari hasil 02a serta mengurus related links, sitemap, dan robots.

Jika helper bersama rusak atau tidak cukup, tulis reproduksi dan perubahan kontrak yang diperlukan; kerjakan perbaikan foundation dahulu, lalu lanjutkan tool. Jangan menyalin helper dengan perilaku berbeda ke semua tool. Pertahankan perubahan pengguna. Jangan commit, push, atau deploy kecuali diminta pada sesi eksekusi.

## UX dan visual

- UI/konten publik bahasa Inggris. Gunakan visual Edwin Lab: ivory `#f7f7f2`, ink `#232923`, teal `#087d6b`, logo asli. Pastikan kontras actual state dan focus dapat dibaca.
- Header ringkas dengan brand dan tautan Home; link direktori Tools diaktifkan setelah hub tersedia. H1 dan area kerja harus cepat terlihat; penjelasan panjang berada di bawah tool.
- Label permanen untuk input/output, tombol proses eksplisit, contoh sintetis, clear, copy, dan download jika direncanakan. Output readonly tetap dapat diseleksi.
- Input/opsi berubah: kosongkan atau tandai hasil stale dan nonaktifkan copy/download lama. Error tidak menghapus input pengguna.
- Status memakai `aria-live="polite"`; pesan error spesifik, focus terlihat, kontrol native, urutan keyboard masuk akal. Jangan mengandalkan warna saja.
- Uji 320/390/768/1440 px. Panel bertumpuk pada layar kecil; teks panjang scroll di panel, bukan menyebabkan seluruh halaman melebar.
- `<noscript>` menjelaskan JavaScript diperlukan untuk pemrosesan; judul, panduan, contoh, dan navigasi tetap tersedia.

## API shared yang harus dibuat foundation

`limits.js`:

- `MAX_TEXT_BYTES = 5 * 1024 * 1024`, `MAX_OUTPUT_BYTES = 10 * 1024 * 1024`, `MAX_DEPTH = 100`.
- `assertTextSize(text, maxBytes = MAX_TEXT_BYTES)` mengukur UTF-8 dengan TextEncoder, melempar Error `code: INPUT_TOO_LARGE` jika melebihi batas. Tepat batas diterima. Output juga diperiksa terhadap MAX_OUTPUT_BYTES; UI menyebut output jika gagal.
- JSON Diff membatasi total kedua input 5 MiB. Regex dan cron mengikuti limit lebih ketat pada rencana masing-masing.

`ui.js`:

- `setStatus(element, {kind, message})`; kind `idle|success|error|warning`, rendering textContent.
- `copyText(text, statusElement)` mengembalikan Promise<boolean>. Tampilkan berhasil hanya sesudah clipboard berhasil; bila ditolak, berikan instruksi seleksi/copy manual. Jangan meminta akses baca clipboard.
- `downloadText(text, filename, mimeType)` melalui Blob lokal, lalu revoke object URL setelah download dipicu.
- `readTextFile(file, {maxBytes = MAX_TEXT_BYTES} = {})` mengembalikan Promise<string>, cek ukuran sebelum membaca dan decode UTF-8 fatal. Pertahankan BOM agar kebijakan tool eksplisit; jangan diam-diam merusak karakter.

`json.js`:

- `validateJSON(text)` → `{valid:true}` atau `{valid:false,error:{message,offset,line,column}}`, offset 0-based, baris/kolom 1-based. Strict JSON: tanpa komentar/trailing comma, satu root, empty invalid.
- `parseSafeJSON(text)` → nilai JSON atau Error dengan code `INVALID_JSON|DUPLICATE_KEY|UNSAFE_NUMBER|INPUT_TOO_LARGE|MAX_DEPTH`.
- Gunakan scanner/parser lokal sebelum materialisasi: batas depth 100, duplicate decoded keys per object ditolak, angka non-finite, integer-valued di luar safe integer, dan nonzero yang underflow menjadi 0 ditolak. Jangan memeriksa angka dalam string sebagai token number. Desimal lain memakai presisi JavaScript; jelaskan batas ini.
- Key `__proto__`, `constructor`, `prototype` tetap data literal own property; jangan merge ke object konfigurasi atau prototype.
- JSONlint berbeda: memformat token sumber sehingga angka besar, duplicate keys, escape, dan `-0` tetap utuh. Validasi sintaks tidak sama dengan kemampuan parseSafeJSON.

## Library JavaScript lokal

Foundation menyiapkan versi tepat dari distribusi resmi siap browser, menyimpan lisensi, sumber, versi, checksum, serta setiap penyesuaian path dalam `tools/vendor/README.md`. Tidak memakai versi floating atau mengunduh dependency saat pengguna membuka tool.

| Folder | Penggunaan | Bentuk yang diperiksa saat foundation |
|---|---|---|
| `tools/vendor/jsonc-parser/` | Strict validation, token positions, lexical formatting | Tree ESM resmi; jika import relatif kurang ekstensi `.js`, hanya sesuaikan path dan catat perubahan |
| `tools/vendor/yaml/` | JSON ↔ YAML | Tree distribusi browser resmi `yaml`, termasuk Document/AST API; tanpa bundling |
| `tools/vendor/croner/` | Jadwal cron | Distribusi browser resmi Croner; konfigurasi semantik OR DOM/DOW secara eksplisit |
| `tools/vendor/sql-formatter/` | SQL formatting | Browser UMD atau ESM resmi; adapter kecil hanya jika diperlukan |

Verifikasi lisensi, seluruh import, worker compatibility bila digunakan, dan API versi yang dipin. Jika distribusi tidak dapat berjalan langsung di browser, laporkan blocker dependency; jangan menambahkan proses build atau mengarang parser pengganti. Hanya load library pada tool yang memerlukannya.

## Privasi dan stabilitas

Semua input diproses lokal. Jangan kirim input ke analytics/API, URL query/hash, log persisten, localStorage/sessionStorage. Tidak ada fetch dari URL pengguna, eval kode input, atau HTML input melalui innerHTML. Escape spreadsheet formulas sesuai rencana CSV. Tidak memakai data pribadi/token asli dalam contoh.

Jalankan operasi besar lewat tombol. Gunakan batas ukuran, kedalaman, jumlah hasil, dan worker sesuai rencana. Worker yang dibatalkan/timeout diterminasi; respons lama tidak boleh menimpa hasil baru. Batas output diperiksa sebelum render/download; limit kerja ditetapkan sebelum alokasi besar bila memungkinkan.

## SEO

- HTML statis unik: title, meta description, satu H1 utama, pengantar, cara pakai, contoh, keterbatasan, dan jawaban pertanyaan yang relevan. Jangan menulis paragraf generik berulang atau membuat halaman keyword duplikat.
- `lang="en"`, viewport, favicon, canonical absolut, OG title/description/url/image lokal yang ada. Structured data opsional WebApplication dan BreadcrumbList hanya jika isinya cocok halaman; jangan menambahkan review/rating atau klaim rich result.
- Repository saat perencanaan memiliki CNAME `edwinlab.dev`. Canonical rencana `https://edwinlab.dev/<slug>/`. Pertahankan CNAME; periksa domain/HTTPS aktual pada integrasi. GitHub Pages akan memakai domain khusus; jangan menjanjikan dua domain independen yang sama-sama diindeks.
- Gunakan href HTML biasa dan URL trailing slash konsisten. Related links hanya ke tool yang sudah ada; kandidat dalam rencana tidak berarti harus dibuat sebagai link mati.
- Sitemap hanya URL publik siap pakai; lastmod hanya jika diketahui. Tidak ada jaminan ranking/traffic dari metadata atau sitemap.

## Pengujian browser tanpa tooling tambahan

Foundation membuat `tests/tools/harness.js` yang mengekspor `test(name, fn)`, `assert(condition, message)`, `equal(actual, expected)`, `deepEqual(actual, expected)`, `throws(fn, expectedCode)`, dan `run()` async. `deepEqual` membandingkan struktur dan own keys, bukan JSON.stringify yang bergantung urutan key.

Setiap `tests/tools/<slug>.test.js` mendaftarkan fixture lalu memanggil `run()`. Halaman `tests/tools/<slug>.html` memuat suite dengan script module dan menampilkan lulus/gagal beserta error; halaman tes memakai `noindex,nofollow`. Tidak ada Node test runner, npm test, framework tes, atau build.

Setiap task harus melaporkan fixture lulus/gagal, browser QA, console/network, direct route + refresh, serta `git diff --check`. Jika browser tidak dapat diuji, laporkan belum terverifikasi dan jangan tandai selesai. Selesai berarti fixture penting dan UI teruji, bukan hanya file dibuat.
