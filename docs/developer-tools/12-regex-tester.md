# 12 — Regex Tester

Status: belum diimplementasikan. Dokumen ini adalah TODO untuk satu sesi implementasi.
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

- [ ] Baca instruksi repository, `README.md`, `CONTRACT.md`, dan `00-foundation.md` di direktori ini.
- [ ] Fondasi harus selesai; inspeksi ekspor shared UI daripada mengasumsikan nama helper.
- [ ] Miliki `regex-tester/index.html`, `tool.js`, `logic.js`, dan `worker.js`.
- [ ] Miliki juga `tests/tools/regex-tester.test.js` dan `tests/tools/regex-tester.html`, memakai harness browser-native foundation.
- [ ] Gunakan `/tools/shared/tools.css` dan `ui.js` mengikuti kontrak fondasi.
- [ ] Jangan mengubah shared files, homepage, daftar tool, sitemap, manifest global, atau task lain.
- [ ] Tidak membutuhkan library regex; gunakan JavaScript RegExp browser dengan deteksi fitur.

## Kontrak batas dan perilaku

- [ ] Pattern adalah isi regex tanpa delimiter `/.../`; flags dipilih melalui kontrol terpisah.
- [ ] Dukung flags `g`, `i`, `m`, `s`, `u`, `y`; jelaskan arti masing-masing pada bantuan statis.
- [ ] Default `g`; tanpa `g` jalankan satu pencarian dan tampilkan match pertama.
- [ ] Dengan `y`, semantik sticky dimulai pada index 0; jangan mengubahnya menjadi pencarian bebas.
- [ ] Jangan menambahkan flag diam-diam untuk membuat hasil tampak lebih banyak.
- [ ] Batasi test string **128 KiB UTF-8**, pattern **4 KiB UTF-8**, hasil **2.000 match**.
- [ ] Tolak ukuran berlebih sebelum dispatch worker; validasi ulang pesan dalam worker.
- [ ] Jalankan konstruksi `RegExp` dan seluruh operasi match hanya di worker, tidak di main thread.
- [ ] Terapkan timeout keras **2 detik** di main thread; saat timeout panggil `worker.terminate()`.
- [ ] Sediakan cancel; terminate worker dan buat worker baru untuk run berikutnya.
- [ ] Input berubah atau run baru membatalkan run lama; respons lama tidak boleh menimpa input/hasil baru.
- [ ] Gunakan request ID untuk mengabaikan pesan usang dan cleanup timer pada semua jalur selesai/error.
- [ ] Batasi juga total data teks hasil/capture, misalnya 2 MiB UTF-8; beri indikator truncation yang jelas.
- [ ] Tampilkan bahwa posisi menggunakan indeks UTF-16 JavaScript, bukan nomor byte atau grapheme.
- [ ] Pattern kosong adalah regex valid; hasil zero-length harus tetap punya batas dan tidak looping selamanya.
- [ ] Jika Worker tidak tersedia, tampilkan ketidaktersediaan fitur; jangan fallback eksekusi di main thread.

## TODO implementasi

- [ ] Buat HTML statis dengan H1, pattern, flags, test text, run/cancel, status, highlight, serta tabel match.
- [ ] Pisahkan fungsi validasi dan ekstraksi hasil ke `logic.js` tanpa DOM/network/penyimpanan.
- [ ] Worker mengimpor core, menangkap SyntaxError, dan mengirim hasil serializable dengan request ID.
- [ ] Implementasi iterasi zero-length harus memajukan posisi satu code point pada mode `u`, satu code unit selainnya.
- [ ] Jangan membagi surrogate pair ketika memajukan zero-length pada Unicode mode.
- [ ] Berhenti saat batas match tercapai dan beri label bahwa hasil dibatasi, bukan mengklaim semua sudah diperiksa.
- [ ] Capture group yang tidak berpartisipasi ditampilkan sebagai `undefined`/`Not matched`, bukan string kosong.
- [ ] Named groups ditampilkan terpisah dengan nama asli; jangan menggandakan payload tanpa batas.
- [ ] Main thread hanya merender data match/range dari worker; jangan menjalankan regex lagi untuk highlighting.
- [ ] Bangun highlight dari Text nodes/`mark` dan offset; jangan interpolasi teks pengguna ke innerHTML.
- [ ] Zero-length match memiliki indikator posisi/tabel yang jelas; jangan membuat elemen highlight tanpa ujung.
- [ ] Tambahkan contoh digit, capture groups, named groups, multiline, dan Unicode.
- [ ] Berikan contoh email sederhana hanya untuk demonstrasi, tanpa klaim validasi email menyeluruh.
- [ ] Tambahkan copy pattern, copy match, clear, dan pengosongan hasil lama saat input berubah.
- [ ] Tampilkan status Running, Cancelled, Timed out, No matches, dan Results limited secara berbeda.
- [ ] Jangan memasukkan pattern/input ke URL, analytics, localStorage, atau request jaringan.

## TODO SEO dan copy

- [ ] Title: `JavaScript Regex Tester — Matches & Capture Groups | Edwin Lab`.
- [ ] H1: `JavaScript Regex Tester`; metadata unik menyebut flags, highlight, dan capture groups.
- [ ] Canonical, social metadata, breadcrumbs, dan structured data mengikuti `CONTRACT.md`.
- [ ] Tulis panduan flag, perbedaan capture/named group, zero-length match, dan indeks UTF-16 sebagai HTML statis.
- [ ] FAQ terlihat: engine apa yang digunakan, mengapa pattern PCRE gagal, dan mengapa test bisa timeout.
- [ ] Jelaskan batas ukuran/waktu dekat editor agar pengguna dapat memperbaiki input setelah timeout.
- [ ] Tautkan URL Encoder/Decoder dan JSON Validator jika tersedia; jangan membuat halaman tipis per pola.
- [ ] Hindari klaim bahwa regex ini mendukung seluruh engine atau membuktikan ketiadaan ReDoS.

## Pengujian inti dengan harness browser-native

- [ ] Pattern `\\d+`, flags `g`, input `a12 b3` → `12` pada index 1 dan `3` pada index 5.
- [ ] Pattern `a`, tanpa `g`, input `aba` → hanya index 0; dengan `g` → index 0 dan 2.
- [ ] Pattern `(a)(b)?`, flags `g`, input `a ab` → group 2 pertama undefined, kedua `b`.
- [ ] Pattern `(?<word>[A-Za-z]+)`, flags `g`, input `hi 42` → named group `word` bernilai `hi`.
- [ ] Pattern `^b`, flags `gm`, input `a\nb` → index 2; tanpa `m` tidak ada match.
- [ ] Pattern `a.b`, flags `s`, input `a\nb` → satu match; tanpa `s` tidak ada match.
- [ ] Pattern `a`, flags `gy`, input `ba` → tidak ada match karena sticky mulai index 0.
- [ ] Pattern `(?:)`, flags `gu`, input `😀` → zero-length pada index 0 dan 2, lalu selesai.
- [ ] Pattern `(?:)`, flags `g`, input `😀` → posisi 0, 1, dan 2, lalu selesai.
- [ ] Pattern `[`, flags valid → syntax error terstruktur; flags duplikat/tidak dikenal ditolak.
- [ ] Pattern kosong dengan input kosong → satu zero-length match, bukan loop.
- [ ] Input `a` sebanyak 2.001 karakter dengan pattern `a`, flags `g` → maksimal 2.000 match dan status dibatasi.
- [ ] Uji batas UTF-8 dengan emoji: ukuran diukur dalam byte, bukan `.length` JavaScript.
- [ ] Uji total payload capture melebihi budget → hasil dibatasi dengan pesan, tanpa alokasi tak terbatas.
- [ ] Teks `<img src=x onerror=...>` muncul literal; verifikasi rendering tidak membuat elemen HTML dari input.

## QA browser dan selesai jika

- [ ] Buka `/tests/tools/regex-tester.html` melalui HTTP lokal; seluruh tes browser-native lulus dan console bersih.
- [ ] Uji worker asli: pattern `(a+)+$` pada banyak `a` diikuti `!` timeout dan worker diterminasi.
- [ ] Selama run tersebut, tombol cancel, input, dan scrolling tetap responsif; run sederhana berikutnya berhasil.
- [ ] Uji cancel segera, run berulang cepat, edit saat running, worker error, dan respons lama yang datang terlambat.
- [ ] Uji path langsung, refresh, mobile 375 px, desktop, keyboard, labels, examples, dan clipboard.
- [ ] Pastikan highlight mengikuti indeks output, hasil panjang tidak overflow, dan status diumumkan aksesibel.
- [ ] Konten SEO tersedia di HTML awal; tidak ada input di network request atau eksekusi regex di main thread.
- [ ] Laporkan tes/QA, penanganan timeout/cancel, file berubah, dan kebutuhan integrasi.

## Prompt eksekusi

```text
Implementasikan docs/developer-tools/12-regex-tester.md dengan GPT-6.1 Sol reasoning medium.
Baca README.md, CONTRACT.md, dan 00-foundation.md di direktori yang sama; ubah hanya file milik task.
Semua regex pengguna wajib berjalan di worker dengan batas 128 KiB input, 4 KiB pattern,
2.000 match, timeout 2 detik, termination/cancel, dan perlindungan terhadap respons usang.
Verifikasi zero-length/Unicode/capture, tes browser-native, worker nyata di browser, lalu laporkan. Jangan publish.
```
