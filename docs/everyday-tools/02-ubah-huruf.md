# 02 — Ubah Huruf

Status: **SEBAGIAN — implementasi dan 21/21 tes browser lulus; mode tanpa JavaScript dan console masih tertunda**.
Model rekomendasi: **GPT-6 Luna (`gpt-6-luna`), reasoning `high`** berdasarkan cakupan, bukan benchmark. Jika fixture masih gagal setelah satu perbaikan terarah, pecah reproduksi menjadi langkah lebih kecil dengan Luna yang sama; jangan melonggarkan tes atau menandai selesai.

## Tujuan dan batas V1

Bantu pengguna memperbaiki kapitalisasi teks yang terlanjur diketik atau ditempel. UI/artikel Indonesia, `lang="id"`; route `/ubah-huruf/`, canonical `https://edwinlab.dev/ubah-huruf/`.

V1 menyediakan **HURUF BESAR**, **huruf kecil**, dan **Kapital Awal Kata (sederhana)**. Tindakan: Ubah huruf, Isi contoh, Bersihkan, Salin hasil, Unduh TXT. Tidak ada sentence case, alternating case, transliterasi, normalisasi aksen, trim, hapus duplikat, format dokumen, atau koreksi ejaan. Kapital awal sederhana bukan penerapan kaidah judul bahasa Indonesia.

## Prasyarat dan kepemilikan

- [x] Baca `docs/everyday-tools/README.md`, `CONTRACT.md`, `00-foundation.md`, dan instruksi repository. Shared foundation dan runner yang dipakai task ini tersedia dan lulus; audit console/smoke TODO 00 masih tertunda.
- [x] Buat hanya `ubah-huruf/index.html`, `ubah-huruf/logic.js`, `ubah-huruf/tool.js`, serta CSS lokal bila perlu; dua tes `tests/everyday/ubah-huruf.test.js` dan `tests/everyday/ubah-huruf.html`.
- [x] Runner memakai ekspor `../tools/harness.js` yang sudah ada, `noindex,nofollow`, dan modul browser melalui HTTP. Tidak ada test framework/npm/Node test runner.
- [x] Pakai `/tools/shared/tools.css`, `setStatus` dan `downloadText` dari `/tools/shared/ui.js`, serta `copyTextId` dari `/everyday/shared/ui.js`; semua shared read-only.
- [x] Perubahan catatan terbatas ke checklist/bukti dokumen ini dan baris tracker 02 menurut CONTRACT sesudah verifikasi. Jangan mengubah homepage, hub, sitemap, robots, foundation, kontrak, tool lain, atau perubahan pengguna.
- [x] Runtime HTML/CSS/JavaScript vanilla, ES module `.js`, tanpa framework, npm/package.json, proses build, backend, dependency, atau CDN. Jangan commit, push, atau deploy.

## Transformasi yang harus persis

- [x] Pure function `changeCase(text, mode)` menerima mode `upper|lower|title` saja; mode lain menghasilkan `INVALID_MODE`.
- [x] Upper menggunakan `text.toLocaleUpperCase('id')`; lower menggunakan `text.toLocaleLowerCase('id')`. Gunakan locale eksplisit, tidak mengikuti locale perangkat. Mapping Unicode dapat menambah panjang teks, misalnya `ß` menjadi `SS`.
- [x] Title: turunkan seluruh string dengan locale `id`, kemudian pada setiap token yang cocok `/\p{L}[\p{L}\p{M}]*/gu`, uppercase **code point pertama** token dengan locale `id`, sambung sisa token. Token dimulai huruf dan selanjutnya hanya huruf/combining marks. Tanda hubung, apostrof, angka, punctuation, dan whitespace memisahkan token tetapi tetap disalin persis.
- [x] Contoh aturan title: `anak-anak` → `Anak-Anak`, `o'NEILL` → `O'Neill`, `123abc` → `123Abc`, `NASA dan iPhone` → `Nasa Dan Iphone`. Semua kata termasuk `dan`, `di`, dan `ke` mendapat kapital; tidak ada pengecualian linguistik atau deteksi merek.
- [x] Jangan memakai `\b` ASCII sebagai definisi batas huruf Unicode; feature-detect Unicode property escapes dengan konstruksi RegExp yang ditangkap errornya bila perlu, lalu tampilkan `CASE_UNSUPPORTED` bila tidak tersedia. Jangan silent fallback ASCII.
- [x] Pure logic mempertahankan whitespace, CR/LF, digit, punctuation, emoji, dan markup sebagai teks literal; tidak trim, dedup, atau Unicode normalization. Textarea browser biasanya menormalkan newline masukan menjadi LF; jelaskan download mengikuti isi textarea yang diproses.
- [x] Batas sebelum transformasi: **100.000 code points dan 400.000 byte UTF-8**; tepat batas diterima. Output maksimum **800.000 byte UTF-8**, diperiksa sebelum DOM/copy/download; jangan memotong hasil. Gunakan `INPUT_TOO_LARGE`/`OUTPUT_TOO_LARGE`, bukan hasil parsial.
- [x] String kosong atau hanya whitespace sah dan dipertahankan. Hasil kosong menampilkan pesan `Teks kosong; tidak ada hasil untuk disalin` dengan copy/download nonaktif; hasil whitespace nonkosong masih boleh disalin/diunduh.

## UI dan perilaku

- [x] Textarea `Teks awal`, select `Bentuk huruf` default upper, textarea readonly `Hasil`, tombol tindakan, dan status live region berbahasa Indonesia.
- [x] Transformasi lewat tombol eksplisit. Edit teks/mode menghapus hasil lama dan menonaktifkan copy/download. Ubah ulang selalu dari teks awal, bukan hasil transformasi sebelumnya.
- [x] Contoh mengisi `NASA dan iPhone: belajar bersama.` tanpa otomatis mengubah. Clear mengosongkan kedua textarea, reset mode upper, dan fokus ke teks awal.
- [x] Copy memakai `copyTextId`; download memakai `downloadText(result, 'hasil-ubah-huruf.txt', 'text/plain;charset=utf-8')` hanya dari hasil sukses non-stale.
- [x] Dekat mode title, tampilkan catatan bahwa singkatan/nama merek dapat berubah. Dekat form, tampilkan batas ukuran dan pemrosesan lokal.
- [x] Gunakan `.value`/`textContent` saja untuk data pengguna; tidak ada network input, analytics, storage, query/hash URL, atau HTML dari input.
- [x] Focus/error terlihat, keyboard lengkap, status `aria-live="polite"`, layout 320/390/768/1440 px, serta HTML artikel/noscript tersedia tanpa JavaScript.

## Fixture deterministik dan verifikasi

Notasi escape di bawah berarti karakter sebenarnya dalam string test; tidak ada perubahan Unicode normalization tersembunyi.

- [x] Upper `'Halo dunia!'` → **`'HALO DUNIA!'`**.
- [x] Lower `'EDWIN 123\nLAB!'` → **`'edwin 123\nlab!'`**.
- [x] Title `'nASA dan iPhone'` → **`'Nasa Dan Iphone'`**.
- [x] Title `"anak-anak o'NEILL 123abc"` → **`"Anak-Anak O'Neill 123Abc"`**.
- [x] Upper `'jalan ß 😀'` → **`'JALAN SS 😀'`**; membuktikan panjang dapat bertambah dan emoji tetap utuh.
- [x] Title `'e\u0301COLE'` → **`'E\u0301cole'`**, tetap decomposed; tidak otomatis menjadi `École`.
- [x] Upper `' \tHalo\r\nDunia  '` → **`' \tHALO\r\nDUNIA  '`** pada pure logic; spasi tepi, tab, dan CRLF dipertahankan.
- [x] Set fixture kosong/literal: ketiga mode `''` → **`''`**; upper `'<b>halo</b>'` → **`'<B>HALO</B>'`** sebagai teks, bukan elemen DOM.
- [x] Tes tambahan batas: 100000 huruf ASCII diterima/100001 ditolak; 100000 emoji empat byte diterima; hasil transformasi diperiksa terhadap batas output dengan guard yang diuji tepat batas dan lebih satu byte, tanpa membuat mode tambahan hanya untuk tes.
- [x] Mode tak dikenal → `INVALID_MODE`; feature detection property escape gagal → `CASE_UNSUPPORTED`; error/ubah input menonaktifkan hasil stale; output title digunakan sesuai keterbatasan yang tertulis.

## SEO dan konten statis

- [x] Title: `Ubah Huruf Besar, Kecil, dan Kapital Online | Edwin Lab`.
- [x] H1: `Ubah Huruf Besar dan Kecil`.
- [x] Meta description: `Ubah teks menjadi huruf besar, huruf kecil, atau kapital awal kata. Salin hasil atau unduh TXT, dengan spasi dan baris tetap dipertahankan.`
- [x] Intro: `Rapikan kapitalisasi teks tanpa mengetik ulang. Pilih bentuk huruf, ubah teks, lalu salin hasilnya.`
- [x] Intent/query sasaran: memperbaiki caps lock atau kapitalisasi teks tempelan; `ubah huruf besar kecil`, `huruf kapital online`, `uppercase lowercase`, `kapital awal kata`. Tidak ada klaim volume pencarian atau jaminan traffic.
- [x] Artikel statis memuat tiga langkah pemakaian, tabel contoh `Halo dunia` → `HALO DUNIA`/`halo dunia`/`Halo Dunia`, catatan singkatan dan whitespace, serta batas input/output.
- [x] FAQ dan jawaban: `Apakah spasi dan baris baru ikut berubah?` → logic tidak merapikan whitespace; `Apakah kapital awal mengikuti kaidah judul Indonesia?` → semua token huruf diawali kapital tanpa daftar pengecualian; `Mengapa NASA menjadi Nasa?` → mode title menurunkan huruf lain; `Apakah teks dikirim ke server?` → pemrosesan lokal.
- [x] Pasang canonical/OG/logo/favicon sesuai CONTRACT; related kandidat `/penghitung-kata/` dan hub everyday hanya menjadi link setelah target ada dan siap. Structured data opsional harus sesuai konten aktual.

## Definition of done saat eksekusi

- [x] `/tests/everyday/ubah-huruf.html` melalui HTTP menunjukkan semua fixture lulus; laporan menyebut jumlah dan browser, bukan hanya file tes tersedia.
- [ ] IAB mengonfirmasi direct route/refresh dan mode huruf kecil; runner 21/21 mencakup tiga mode, copy, unduh TXT beserta MIME/isi, clear/contoh/stale, dan empat lebar. Tab mencapai tautan Lewati, Enter menuju `#workspace`, dan Tab berurutan mencapai tombol Ubah huruf. Mode tanpa JavaScript belum dijalankan.
- [ ] Console tidak dapat ditangkap melalui CUA IAB. Network hanya ditinjau dari source (tidak ada pengiriman input); pemeriksaan traffic aktual masih pending. `git diff --check` lulus dan audit perubahan terbatas pada file 02 serta row tracker-nya.
- [x] Sesudah bukti nyata, perbarui checklist/catatan task ini serta tracker miliknya; laporkan file dan hasil aktual tanpa commit/push/deploy.

## Catatan eksekusi — 12 Oktober 2026

Model yang digunakan: GPT-6 Luna, reasoning high. Implementasi ada di `ubah-huruf/index.html`, `logic.js`, dan `tool.js`; tes di `tests/everyday/ubah-huruf.html` dan `ubah-huruf.test.js`. Runner browser IAB lulus **21/21**. Direct route dan refresh berhasil; interaksi contoh lalu mode huruf kecil menghasilkan `nasa dan iphone: belajar bersama.`. Runner memeriksa transformasi tiga mode, batas input/output, error mode/fitur, output literal, hasil kosong, invalidasi, copy sukses/gagal, unduhan TXT dengan MIME dan isi, serta empat lebar 320/390/768/1440 px. Pemeriksaan sintaks JS, 15 grup fixture pure, dan `git diff --check` lulus. Console capture tidak tersedia dari API CUA; Network hanya ditinjau dari source. Keyboard telah diuji manual; no-JavaScript belum dijalankan, jadi status tetap sebagian.

## Prompt eksekusi siap tempel

```text
Implementasikan hanya docs/everyday-tools/02-ubah-huruf.md.
Baca docs/everyday-tools/README.md, CONTRACT.md, 00-foundation.md, dan instruksi repository; verifikasi foundation selesai. Rekomendasi model GPT-6 Luna high, bukan benchmark. Jika fixture masih gagal setelah satu perbaikan terarah, isolasi reproduksi dan lanjutkan per langkah kecil dengan Luna yang sama.
Buat /ubah-huruf/ dan tests/everyday/ubah-huruf.html serta .test.js menggunakan tests/tools/harness.js. UI/SEO Indonesia lang=id. Ikuti tiga mode persis, locale id, aturan token title, batas input/output, dan whitespace. Tidak menambah trim/dedup/mode lain. HTML/CSS/vanilla JS buildless; tidak ada npm/backend/CDN.
Shared lama/baru, homepage, hub, sitemap, foundation, kontrak, dan tool lain read-only. Jika helper kurang, laporkan kebutuhan foundation, jangan salin implementasi berbeda. Jangan commit, push, deploy, atau menambah dependency.
Selesaikan fixture serta QA browser, download, keyboard, responsive, route/refresh, console/network, dan git diff --check. Laporkan hasil aktual; perbarui checklist/bukti task dan baris tracker sendiri setelah proof. Browser belum diuji berarti belum selesai.
```

Rujukan teknis yang dibuka saat perencanaan: [spesifikasi resmi toLocaleUpperCase](https://tc39.es/ecma262/multipage/text-processing.html#sec-string.prototype.tolocaleuppercase) dan [MDN toLocaleUpperCase](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLocaleUpperCase). Mapping kapital dapat memperpanjang string; definisi title pada task ini sengaja merupakan aturan sederhana yang eksplisit.
