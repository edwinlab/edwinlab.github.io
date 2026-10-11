# 04 — JWT Decoder

Status: selesai — halaman dan fixture browser tersedia; seluruh fixture lulus.
Model: **GPT-6 Luna (`gpt-6-luna`), reasoning `high`**. Rekomendasi berdasarkan cakupan tugas, bukan benchmark.
URL: `/jwt-decoder/`.

## Tujuan dan batas pekerjaan

Membaca header dan payload JWT serta waktu klaimnya secara lokal, dengan status signature selalu **Unverified**.
UI dan konten publik berbahasa Inggris. Jangan menganggap hasil decoding sebagai autentikasi yang valid.

**Batas teknologi:** hanya HTML, CSS, JavaScript vanilla dan library JavaScript lokal siap browser bila disebutkan. Tanpa npm, package.json, framework, bundler, transpiler, atau backend.

## Prasyarat

- [x] Baca `README.md` dan `CONTRACT.md` di direktori rencana ini.
- [x] Pastikan `00-foundation.md` selesai, kontrak shared UI tersedia, dan tes foundation lulus.
- [x] Baca instruksi repository; pertahankan perubahan pengguna yang sudah ada.
- [x] Gunakan HTML statis dan ES module `.js`, hanya HTML/CSS/JavaScript vanilla, tanpa bundler atau dependency tambahan.

## File yang dikerjakan

- `jwt-decoder/index.html` — UI, metadata, contoh, panduan, tautan terkait.
- `jwt-decoder/logic.js` — parsing dan penilaian waktu klaim tanpa DOM atau akses jaringan.
- `jwt-decoder/tool.js` — event, batas ukuran, rendering, copy, dan clear.
- `tests/tools/jwt-decoder.test.js` — pengujian browser-native memakai runner foundation.
- `tests/tools/jwt-decoder.html` — halaman runner tes yang dibuka melalui HTTP lokal.
- Gunakan `/tools/shared/tools.css` dan `/tools/shared/ui.js` sesuai `CONTRACT.md`.
- Gunakan `assertTextSize` dari shared `limits.js` dan `parseSafeJSON` dari shared `json.js`; jangan duplikasi helper.
- Prasyarat teknis: hanya HTML/CSS/JavaScript vanilla; tanpa npm, package.json, Node test runner, framework, atau build.
- Perubahan registry, sitemap, atau file bersama hanya sesuai prosedur dalam kontrak.

## TODO implementasi

- [x] Buat satu textarea berlabel `JWT`, tombol `Decode`, `Load example`, dan `Clear`.
- [x] Terima token dengan tepat tiga segmen dipisah titik; trim hanya whitespace di tepi.
- [x] Tolak prefix `Bearer ` dengan pesan yang meminta token saja; jangan menghapus input diam-diam.
- [x] Validasi alfabet Base64URL pada segmen; JWT compact tidak menerima karakter `+`, `/`, atau padding `=`.
- [x] Header dan payload harus terisi, didekode UTF-8 dengan `TextDecoder` mode fatal, lalu dibaca `parseSafeJSON`.
- [x] Tolak duplicate JSON keys dan angka yang melanggar kebijakan presisi shared parser; jangan membulatkan klaim diam-diam.
- [x] Header dan payload harus object JSON non-null, bukan array atau scalar.
- [x] Segmen signature boleh kosong untuk inspeksi; tetap tampilkan `Unverified`.
- [x] Tampilkan header dan payload dalam dua panel JSON yang terformat, masing-masing dapat disalin.
- [x] Tampilkan banner permanen `Decoded only. Signature not verified.`
- [x] `alg: "none"`, signature kosong, atau signature apa pun tidak pernah mengubah status menjadi verified.
- [x] Tampilkan `exp`, `nbf`, dan `iat` sebagai NumericDate dalam detik serta tanggal UTC bila representable.
- [x] Klaim numerik harus finite; nilai pecahan diterima. `0` adalah nilai valid, bukan klaim yang hilang.
- [x] Klaim bertipe salah menghasilkan peringatan pada klaim tersebut; panel JSON tetap tersedia.
- [x] Terima `nowSeconds` eksplisit di fungsi evaluasi waktu agar tes tidak bergantung jam komputer.
- [x] Nyatakan expired bila `nowSeconds >= exp`; not active yet bila `nowSeconds < nbf`.
- [x] Status waktu hanya menilai klaim; labeli `Time claims`, bukan `Token valid`.
- [x] Jika tanggal melampaui jangkauan `Date`, tampilkan angka asli dan pesan rentang tanggal, tanpa crash.
- [x] Gunakan pemeriksaan property sendiri untuk klaim; jangan merge payload ke konfigurasi aplikasi.
- [x] Setelah input berubah, kosongkan atau tandai hasil lama sebagai stale dan nonaktifkan copy hasil lama.
- [x] Implementasikan pesan error berguna: jumlah segmen, alfabet, UTF-8, JSON, atau tipe payload.
- [x] Batasi total input teks 5 MiB sebelum decoding/parsing dan hasil 10 MiB; gunakan error ukuran sesuai kontrak.
- [x] Status dan copy memakai `setStatus(element,{kind,message})` serta `copyText(text,statusElement)` sesuai kontrak.
- [x] Rendering hanya melalui `textContent`/API DOM aman; payload HTML tidak boleh dieksekusi.
- [x] Tidak ada telemetry, request token, local/session storage, query string, atau URL hash berisi input.

## Fixture dan tes wajib

- [x] `eyJhbGciOiJub25lIn0.eyJleHAiOjB9.` pada `nowSeconds=1700000000` menghasilkan `alg=none`, `exp=0`, expired, signature unverified.
- [x] Token berisi `{ "exp": 1700000000 }` pada waktu yang sama menghasilkan expired; pada `1699999999` belum expired.
- [x] `{ "nbf": 1700000001 }` pada `1700000000` menghasilkan not active yet; pada `1700000001` sudah memenuhi nbf.
- [x] `{ "exp": "1700000000" }` menghasilkan peringatan tipe, tanpa coercion menjadi angka.
- [x] Payload `{ "sub": "用户", "admin": false }` mempertahankan Unicode dan boolean.
- [x] `e30.e30.` menghasilkan dua object kosong, signature unverified, tanpa klaim waktu.
- [x] `abc.def`, `a.b.c.d`, segmen berkarakter `+`, Base64URL panjang sisa 1, dan UTF-8 rusak menghasilkan error.
- [x] Payload `null`, `[]`, atau JSON rusak menghasilkan error tipe/JSON yang tepat.
- [x] Duplicate `exp` dan integer `9007199254740993` ditolak sesuai `parseSafeJSON`, tanpa perubahan angka.
- [x] Payload berisi `__proto__` dan `<img onerror=...>` hanya menjadi data; tidak memengaruhi object global atau DOM.
- [x] Input melebihi 5 MiB ditolak sebelum parsing; tidak ada test yang mengandalkan token atau secret asli.

## SEO dan konten statis

- [x] Title: `JWT Decoder Online — Inspect Token Claims | Edwin Lab`.
- [x] H1: `JWT Decoder`.
- [x] Description: `Decode JWT headers and payloads in your browser. Inspect expiration and time claims without uploading your token. Signature verification is not included.`
- [x] Canonical dan social metadata memakai domain serta pola URL trailing slash dalam kontrak.
- [x] Tulis panduan tiga langkah dan contoh sintetis dengan `sub`, `iat`, dan `exp`.
- [x] Jelaskan perbedaan decoding vs verification, NumericDate detik, serta makna expired.
- [x] FAQ singkat: `Does this verify the signature?` dan `Are my tokens uploaded?`.
- [x] Tautkan ke `/timestamp-converter/`, `/jsonlint/`, dan direktori tools yang sudah tersedia. `/base64/` belum ada, jadi link mati ditunda sampai tool Base64 dibuat.
- [x] Semua penjelasan dan tautan tersedia dalam HTML awal; pesan noscript menjelaskan JS diperlukan untuk tool.

## Di luar scope

Verifikasi signature, secret input, edit/sign token, login, remote JWKS, JWE lima segmen, dan validasi otorisasi aplikasi.

## Definition of done

- [x] Halaman `/tests/tools/jwt-decoder.html` menunjukkan seluruh tes lulus, tanpa error console.
- [x] Browser QA desktop/mobile: input salah, clear, copy, Unicode, expired, dan signature kosong.
- [x] Keyboard, focus, live status, label, serta ukuran 320 px mengikuti kontrak tanpa overflow horizontal.
- [x] Audit kode memastikan tidak ada API jaringan untuk mengirim input; refresh deep-link `/jwt-decoder/` berhasil.
- [x] Periksa HTML metadata dan `git diff --check`; laporkan file berubah dan keterbatasan.

## Hasil eksekusi

- Fixture browser: 20/20 lulus; console tanpa error/warning.
- Browser QA: input Bearer ditolak dengan pesan khusus, hasil lama dihapus saat input berubah, clear memfokuskan input, keyboard Tab lalu Enter menjalankan Decode, contoh bertanda Unverified, copy sukses, dan breakpoint 320/390/768/1440 px tanpa overflow horizontal. Deep-link `/jwt-decoder/` berhasil dimuat ulang.
- Metadata title, H1, canonical, structured data, dan root-relative links diperiksa; `git diff --check` lulus.
- Pemrosesan token bersifat lokal: audit kode tidak menemukan fetch/XHR, beacon, storage, atau sink HTML; network panel browser tidak diperiksa.
- Integrasi tambahan ke directory card, sitemap, serta link Base64 menunggu task integrasi/keberadaan tool terkait sesuai kontrak.

## Prompt eksekusi siap tempel

> Implementasikan hanya rencana `docs/developer-tools/04-jwt-decoder.md`. Baca README.md dan CONTRACT.md di direktori itu serta pastikan 00-foundation selesai. Gunakan GPT-6 Luna (`gpt-6-luna`) reasoning high bila pilihan model tersedia. Ikuti kontrak shared UI, HTML statis/ES modules, pure logic, tes browser-native, dan batas input 5 MiB dan hasil 10 MiB. Signature selalu Unverified, termasuk alg none. Buat hanya file tool dan tes yang disebutkan; integrasi file bersama mengikuti kontrak. Jalankan tes serta browser QA, lalu laporkan hasil. Jangan publish, commit, mengubah desain homepage, atau menambahkan dependency.
