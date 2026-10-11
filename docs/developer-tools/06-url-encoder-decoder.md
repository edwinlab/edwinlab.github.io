# 06 — URL Encoder / Decoder

Status: rencana saja; implementasi belum dibuat.
Model: **GPT-6 Luna (`gpt-6-luna`), reasoning `medium`**. Rekomendasi berdasarkan cakupan tugas, bukan benchmark.
URL: `/url-encoder-decoder/`.

## Tujuan dan batas pekerjaan

Encode/decode URI component atau whole URI, serta inspeksi query parameter dengan repeated keys tetap utuh.
UI publik berbahasa Inggris. Mode dipilih pengguna; jangan menebak konteks dan mengubah arti karakter diam-diam.

**Batas teknologi:** hanya HTML, CSS, JavaScript vanilla dan library JavaScript lokal siap browser bila disebutkan. Tanpa npm, package.json, framework, bundler, transpiler, atau backend.

## Prasyarat

- [ ] Baca `README.md` dan `CONTRACT.md` di direktori rencana ini.
- [ ] Pastikan `00-foundation.md` selesai dan tes foundation lulus.
- [ ] Baca instruksi repository serta pertahankan perubahan pengguna.
- [ ] Gunakan HTML statis dan ES module `.js`; tidak ada dependency tambahan.

## File yang dikerjakan

- `url-encoder-decoder/index.html` — UI, petunjuk mode, metadata, contoh.
- `url-encoder-decoder/logic.js` — pure functions untuk konversi dan parsing query.
- `url-encoder-decoder/tool.js` — event, rendering aman, copy, dan clear.
- `tests/tools/url-encoder-decoder.test.js` — tes browser-native memakai runner foundation.
- `tests/tools/url-encoder-decoder.html` — halaman runner tes yang dibuka melalui HTTP lokal.
- Gunakan `/tools/shared/tools.css` dan `/tools/shared/ui.js` sesuai `CONTRACT.md`.
- Gunakan shared `limits.js` untuk `assertTextSize`; status/copy memakai `setStatus` dan `copyText` sesuai kontrak.
- Prasyarat teknis: hanya HTML/CSS/JavaScript vanilla; tanpa npm, package.json, Node test runner, framework, atau build.
- Registry, sitemap, dan file bersama hanya diubah menurut prosedur kontrak.

## TODO implementasi

- [ ] Buat mode `URL component`, `Whole URI`, dan `Query parameters` dengan bantuan kontekstual.
- [ ] Dua mode pertama memiliki arah `Encode`/`Decode`, input, output, tombol proses, copy, dan clear.
- [ ] Component memakai `encodeURIComponent`/`decodeURIComponent` dengan penanganan `URIError`.
- [ ] Whole URI memakai `encodeURI`/`decodeURI`; tampilkan bahwa reserved separators tetap dipertahankan.
- [ ] Jelaskan whole URI bukan URL normalizer/validator dan tidak mengubah Unicode host menjadi punycode.
- [ ] Tanda `+` tetap literal plus pada decoding component maupun whole URI.
- [ ] Mode query menerima raw query, optional leading `?`, atau absolute HTTP(S) URL.
- [ ] Untuk absolute URL, ambil query via `new URL`; abaikan fragment dan jangan melakukan fetch.
- [ ] Mode query menerapkan aturan form-urlencoded: `+` berarti spasi, `%2B` berarti plus literal.
- [ ] Parse query menjadi array pasangan `{ key, value }` berurutan, bukan object keyed by input.
- [ ] Pisahkan setiap pasangan pada `=` pertama; parameter tanpa `=` memiliki value string kosong.
- [ ] Abaikan segmen kosong dari `&&`; pertahankan key kosong seperti `=value`.
- [ ] Decode key/value secara ketat dengan `decodeURIComponent` sesudah mengganti `+` dengan spasi.
- [ ] Jika percent escape atau UTF-8 rusak, tampilkan error; jangan diam-diam memasukkan replacement character.
- [ ] Pertahankan semua repeated keys dan urutan awal dalam tabel hasil.
- [ ] Kolom tabel: nomor, `Parameter`, `Value`; seluruh isi menggunakan `textContent`.
- [ ] Copy query hasil sebagai JSON array pasangan agar repeated keys tidak hilang; beri label format copy.
- [ ] Key seperti `__proto__`, `constructor`, dan `toString` tetap data biasa; jangan melakukan object merge.
- [ ] Input kosong menghasilkan hasil kosong; mode query menghasilkan array kosong dan status yang jelas.
- [ ] Jangan auto double-decode: `%252F` didekode sekali menjadi `%2F` pada component.
- [ ] Batasi total input 5 MiB dan jumlah pasangan query yang dirender 1.000; lebih banyak menghasilkan error eksplisit.
- [ ] Batasi hasil 10 MiB sesuai kontrak; percent-encoding dapat membesar tiga kali dari byte input, jadi cek sebelum render.
- [ ] Cek batas jumlah pasangan sebelum membangun DOM besar; jangan memotong hasil tanpa pemberitahuan.
- [ ] Edit input/mode membuat hasil sebelumnya stale; copy hasil lama dinonaktifkan.
- [ ] Tidak ada telemetry, storage, penyimpanan query/hash input di URL halaman, atau request eksternal.

## Fixture dan tes wajib

- [ ] Component encode `a b+c/d?e=f` menghasilkan `a%20b%2Bc%2Fd%3Fe%3Df`.
- [ ] Component decode `a+b%20c` menghasilkan `a+b c`.
- [ ] Whole URI encode `https://example.com/a b?q=x y&lang=id` menghasilkan `https://example.com/a%20b?q=x%20y&lang=id`.
- [ ] Whole URI decode `https://example.com/a%20b?q=x%26y` mempertahankan `%26` dan mengubah `%20` menjadi spasi.
- [ ] Component decode `%252F` menghasilkan `%2F`; whole URI decode `%2F` tetap `%2F`.
- [ ] Query `q=a+b&q=a%2Bb` menghasilkan pasangan berurutan `q: "a b"`, `q: "a+b"`.
- [ ] Query `a=1&a=2&empty=&flag` menghasilkan empat pasangan, dua pasangan terakhir value `""`.
- [ ] Query `=x&&a=b=c` menghasilkan `"": "x"` lalu `a: "b=c"`.
- [ ] URL `https://example.com/?a=1&a=2#section` menghasilkan hanya dua pasangan a.
- [ ] Query `__proto__=x&constructor=y` menghasilkan dua baris biasa dan tidak mengubah prototype.
- [ ] `%`, `%2`, `%GG`, dan `%C3%28` pada decode/component atau query menghasilkan error jelas.
- [ ] Unicode `日本語` dan emoji lolos round-trip component; `encodeURIComponent` lone surrogate ditangani sebagai error.
- [ ] Query dengan 1.000 pasangan diterima; 1.001 ditolak; input >5 MiB ditolak sebelum proses.
- [ ] `<img src=x onerror=...>` muncul literal pada output browser, tidak sebagai elemen HTML.

## SEO dan konten statis

- [ ] Title: `URL Encoder & Decoder — Inspect Query Parameters | Edwin Lab`.
- [ ] H1: `URL Encoder & Decoder`.
- [ ] Description: `Encode or decode URL components and full URIs in your browser. Inspect query parameters, repeated keys, spaces, and plus signs without uploading data.`
- [ ] Canonical dan social metadata mengikuti kontrak dan trailing slash.
- [ ] Tulis panduan memilih component untuk satu nilai vs whole URI untuk struktur URI lengkap.
- [ ] Sertakan contoh `%20`, `%2B`, `%2F` dan penjelasan plus hanya menjadi spasi dalam form query.
- [ ] FAQ: `Why is plus different from a space?`, `Why does %2F stay encoded?`, dan `Are duplicate parameters preserved?`.
- [ ] Tautkan `/base64/`, `/jsonlint/`, dan `/tools/` secara kontekstual.
- [ ] Konten penjelas tersedia dalam HTML awal; tambahkan pesan noscript.

## Di luar scope

URL shortener, redirect checker, network requests, URL safety scanner, IDN normalizer, dan encoder multipart form.

## Definition of done

- [ ] Halaman `/tests/tools/url-encoder-decoder.html` menunjukkan seluruh tes lulus; console bersih dan `git diff --check` lulus.
- [ ] Browser QA seluruh mode, malformed escape, plus, repeated keys, copy, clear, dan stale output.
- [ ] Keyboard, focus, labels, live status, dan layout 320 px mengikuti kontrak; tabel tidak memperlebar viewport.
- [ ] Tidak ada pengiriman input pada Network tab; refresh `/url-encoder-decoder/` berhasil.
- [ ] Laporkan file, tes, dan batasan; jangan publish atau commit otomatis.

## Prompt eksekusi siap tempel

> Implementasikan hanya `docs/developer-tools/06-url-encoder-decoder.md`. Baca README.md dan CONTRACT.md di direktori itu serta pastikan 00-foundation selesai. Model rekomendasi GPT-6 Luna (`gpt-6-luna`) reasoning medium. Gunakan browser-native URI APIs, ES modules, shared UI, pure logic, dan tes browser-native. Bedakan component/whole URI/form query; pertahankan repeated keys dengan array dan rendering aman. Ikuti batas 5 MiB/1.000 pasangan. Integrasi file bersama hanya sesuai kontrak. Jalankan tes dan browser QA. Jangan publish, commit, atau menambah dependency.
