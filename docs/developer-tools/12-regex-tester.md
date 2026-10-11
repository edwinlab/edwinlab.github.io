# 12 — Regex Tester

Status: SELESAI secara lokal pada 11 Oktober 2026; belum dipublikasikan.
Model: **GPT-6.1 Sol · medium**. Jalankan setelah `00-foundation.md` selesai.
URL: `/regex-tester/`. UI dan konten publik berbahasa Inggris.

## Tujuan dan batas pekerjaan

- Uji regular expression engine JavaScript, tampilkan match, posisi, capture groups, dan named groups.
- Sorot match dalam teks serta sediakan contoh pola yang mudah dipahami.
- Jalankan semua regex pengguna di Web Worker yang dapat diterminasi untuk menjaga UI responsif.
- Tidak mendukung PCRE/Python/Java, regex replacement, generate regex dengan AI, atau upload file.
- Tidak mengklaim pola aman untuk produksi hanya karena satu pengujian berhasil.

**Batas teknologi:** hanya HTML, CSS, JavaScript vanilla dan library JavaScript lokal siap browser bila disebutkan. Tanpa npm, package.json, framework, bundler, transpiler, atau backend.

## Prasyarat dan kepemilikan file

- [x] Baca instruksi repository, `README.md`, `CONTRACT.md`, dan `00-foundation.md` di direktori ini.
- [x] Fondasi harus selesai; inspeksi ekspor shared UI daripada mengasumsikan nama helper.
- [x] Miliki `regex-tester/index.html`, `tool.js`, `logic.js`, dan `worker.js`.
- [x] Miliki juga `tests/tools/regex-tester.test.js` dan `tests/tools/regex-tester.html`, memakai harness browser-native foundation.
- [x] Gunakan `/tools/shared/tools.css` dan `ui.js` mengikuti kontrak fondasi.
- [x] Jangan mengubah shared files, homepage, daftar tool, sitemap, manifest global, atau task lain.
- [x] Tidak membutuhkan library regex; gunakan JavaScript RegExp browser dengan deteksi fitur.

## Kontrak batas dan perilaku

- [x] Pattern adalah isi regex tanpa delimiter `/.../`; flags dipilih melalui kontrol terpisah.
- [x] Dukung flags `g`, `i`, `m`, `s`, `u`, `y`; jelaskan arti masing-masing pada bantuan statis.
- [x] Default `g`; tanpa `g` jalankan satu pencarian dan tampilkan match pertama.
- [x] Dengan `y`, semantik sticky dimulai pada index 0; jangan mengubahnya menjadi pencarian bebas.
- [x] Jangan menambahkan flag diam-diam untuk membuat hasil tampak lebih banyak.
- [x] Batasi test string **128 KiB UTF-8**, pattern **4 KiB UTF-8**, hasil **2.000 match**.
- [x] Tolak ukuran berlebih sebelum dispatch worker; validasi ulang pesan dalam worker.
- [x] Jalankan konstruksi `RegExp` dan seluruh operasi match hanya di worker, tidak di main thread.
- [x] Terapkan timeout keras **2 detik** di main thread; saat timeout panggil `worker.terminate()`.
- [x] Sediakan cancel; terminate worker dan buat worker baru untuk run berikutnya.
- [x] Input berubah atau run baru membatalkan run lama; respons lama tidak boleh menimpa input/hasil baru.
- [x] Gunakan request ID untuk mengabaikan pesan usang dan cleanup timer pada semua jalur selesai/error.
- [x] Batasi juga total data teks hasil/capture, misalnya 2 MiB UTF-8; beri indikator truncation yang jelas.
- [x] Tampilkan bahwa posisi menggunakan indeks UTF-16 JavaScript, bukan nomor byte atau grapheme.
- [x] Pattern kosong adalah regex valid; hasil zero-length harus tetap punya batas dan tidak looping selamanya.
- [x] Jika Worker tidak tersedia, tampilkan ketidaktersediaan fitur; jangan fallback eksekusi di main thread.

## TODO implementasi

- [x] Buat HTML statis dengan H1, pattern, flags, test text, run/cancel, status, highlight, serta tabel match.
- [x] Pisahkan fungsi validasi dan ekstraksi hasil ke `logic.js` tanpa DOM/network/penyimpanan.
- [x] Worker mengimpor core, menangkap SyntaxError, dan mengirim hasil serializable dengan request ID.
- [x] Implementasi iterasi zero-length harus memajukan posisi satu code point pada mode `u`, satu code unit selainnya.
- [x] Jangan membagi surrogate pair ketika memajukan zero-length pada Unicode mode.
- [x] Berhenti saat batas match tercapai dan beri label bahwa hasil dibatasi, bukan mengklaim semua sudah diperiksa.
- [x] Capture group yang tidak berpartisipasi ditampilkan sebagai `undefined`/`Not matched`, bukan string kosong.
- [x] Named groups ditampilkan terpisah dengan nama asli; jangan menggandakan payload tanpa batas.
- [x] Main thread hanya merender data match/range dari worker; jangan menjalankan regex lagi untuk highlighting.
- [x] Bangun highlight dari Text nodes/`mark` dan offset; jangan interpolasi teks pengguna ke innerHTML.
- [x] Zero-length match memiliki indikator posisi/tabel yang jelas; jangan membuat elemen highlight tanpa ujung.
- [x] Tambahkan contoh digit, capture groups, named groups, multiline, dan Unicode.
- [x] Berikan contoh email sederhana hanya untuk demonstrasi, tanpa klaim validasi email menyeluruh.
- [x] Tambahkan copy pattern, copy match, clear, dan pengosongan hasil lama saat input berubah.
- [x] Tampilkan status Running, Cancelled, Timed out, No matches, dan Results limited secara berbeda.
- [x] Jangan memasukkan pattern/input ke URL, analytics, localStorage, atau request jaringan.

## TODO SEO dan copy

- [x] Title: `JavaScript Regex Tester — Matches & Capture Groups | Edwin Lab`.
- [x] H1: `JavaScript Regex Tester`; metadata unik menyebut flags, highlight, dan capture groups.
- [x] Canonical, social metadata, breadcrumbs, dan structured data mengikuti `CONTRACT.md`.
- [x] Tulis panduan flag, perbedaan capture/named group, zero-length match, dan indeks UTF-16 sebagai HTML statis.
- [x] FAQ terlihat: engine apa yang digunakan, mengapa pattern PCRE gagal, dan mengapa test bisa timeout.
- [x] Jelaskan batas ukuran/waktu dekat editor agar pengguna dapat memperbaiki input setelah timeout.
- [x] Tautkan URL Encoder/Decoder dan JSON Validator jika tersedia; jangan membuat halaman tipis per pola.
- [x] Hindari klaim bahwa regex ini mendukung seluruh engine atau membuktikan ketiadaan ReDoS.

## Pengujian inti dengan harness browser-native

- [x] Pattern `\\d+`, flags `g`, input `a12 b3` → `12` pada index 1 dan `3` pada index 5.
- [x] Pattern `a`, tanpa `g`, input `aba` → hanya index 0; dengan `g` → index 0 dan 2.
- [x] Pattern `(a)(b)?`, flags `g`, input `a ab` → group 2 pertama undefined, kedua `b`.
- [x] Pattern `(?<word>[A-Za-z]+)`, flags `g`, input `hi 42` → named group `word` bernilai `hi`.
- [x] Pattern `^b`, flags `gm`, input `a\nb` → index 2; tanpa `m` tidak ada match.
- [x] Pattern `a.b`, flags `s`, input `a\nb` → satu match; tanpa `s` tidak ada match.
- [x] Pattern `a`, flags `gy`, input `ba` → tidak ada match karena sticky mulai index 0.
- [x] Pattern `(?:)`, flags `gu`, input `😀` → zero-length pada index 0 dan 2, lalu selesai.
- [x] Pattern `(?:)`, flags `g`, input `😀` → posisi 0, 1, dan 2, lalu selesai.
- [x] Pattern `[`, flags valid → syntax error terstruktur; flags duplikat/tidak dikenal ditolak.
- [x] Pattern kosong dengan input kosong → satu zero-length match, bukan loop.
- [x] Input `a` sebanyak 2.001 karakter dengan pattern `a`, flags `g` → maksimal 2.000 match dan status dibatasi.
- [x] Uji batas UTF-8 dengan emoji: ukuran diukur dalam byte, bukan `.length` JavaScript.
- [x] Uji total payload capture melebihi budget → hasil dibatasi dengan pesan, tanpa alokasi tak terbatas.
- [x] Teks `<img src=x onerror=...>` muncul literal; verifikasi rendering tidak membuat elemen HTML dari input.

## QA browser dan selesai jika

- [x] Buka `/tests/tools/regex-tester.html` melalui HTTP lokal; seluruh tes browser-native lulus dan console bersih.
- [x] Uji worker asli: pattern `(a+)+$` pada banyak `a` diikuti `!` timeout dan worker diterminasi.
- [x] Selama run tersebut, tombol cancel, input, dan scrolling tetap responsif; run sederhana berikutnya berhasil.
- [x] Uji cancel segera, run berulang cepat, edit saat running, worker error, dan respons lama yang datang terlambat.
- [x] Uji path langsung, refresh, mobile 375 px, desktop, keyboard, labels, examples, dan clipboard.
- [x] Pastikan highlight mengikuti indeks output, hasil panjang tidak overflow, dan status diumumkan aksesibel.
- [x] Konten SEO tersedia di HTML awal; tidak ada input di network request atau eksekusi regex di main thread.
- [x] Laporkan tes/QA, penanganan timeout/cancel, file berubah, dan kebutuhan integrasi.

## Hasil implementasi dan verifikasi

- File: `regex-tester/index.html`, `tool.css`, `tool.js`, `logic.js`, `worker.js`, `worker-client.js`, serta runner/fixture miliknya. Tidak menambah dependency.
- Browser-native fixtures **25/25 lulus**, termasuk worker nyata, timeout `(a+)+$`, validasi ulang pesan worker, zero-length Unicode/non-Unicode, captures yang tidak berpartisipasi, named groups, flags, batas UTF-8, 2.000 match, dan budget hasil setelah JSON escaping.
- Seluruh regex pengguna dikonstruksi/dijalankan di worker. Fixture UI memasang spy pada `RegExp` main thread: **0 pemanggilan**; timeout/cancel menerminasi worker, dan request ID usang tidak dapat menimpa hasil baru. Heartbeat halaman tetap berjalan selama catastrophic backtracking.
- Enam contoh, error tanpa kehilangan input, clear/stale, copy, markup literal, serta layout dengan hasil pada 320/375/390/768/1440 px lulus. Manual browser memverifikasi Ctrl+Enter, clipboard berisi dua match, cancel, dan refresh langsung.
- Tidak ada fetch/XHR/beacon input, penyimpanan, atau input pada URL. Console normal dan runner bersih; `git diff --check` lulus. Dukungan sintaks mengikuti RegExp browser, bukan PCRE/Python/Java atau jaminan bebas ReDoS.
- Integrasi hub, related links, dan sitemap selesai melalui task 13. Halaman siap disajikan sebagai file statis melalui HTTP/HTTPS tanpa compiler aplikasi.

## Prompt eksekusi

```text
Implementasikan docs/developer-tools/12-regex-tester.md dengan GPT-6.1 Sol reasoning medium.
Baca README.md, CONTRACT.md, dan 00-foundation.md di direktori yang sama; ubah hanya file milik task.
Semua regex pengguna wajib berjalan di worker dengan batas 128 KiB input, 4 KiB pattern,
2.000 match, timeout 2 detik, termination/cancel, dan perlindungan terhadap respons usang.
Verifikasi zero-length/Unicode/capture, tes browser-native, worker nyata di browser, lalu laporkan. Jangan publish.
```
