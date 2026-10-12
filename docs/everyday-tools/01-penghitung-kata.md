# 01 — Penghitung Kata

Status: **SEBAGIAN — implementasi dan 19/19 tes browser lulus; pemeriksaan console dan mode tanpa JavaScript masih tertunda**.
Model rekomendasi: **GPT-6 Luna (`gpt-6-luna`), reasoning `high`** berdasarkan cakupan, bukan hasil benchmark. Jika fixture masih gagal setelah satu perbaikan terarah, pecah reproduksi menjadi langkah lebih kecil dengan Luna yang sama; jangan melonggarkan tes atau menandai selesai.

## Tujuan dan batas V1

Bantu penulis, pelajar, dan pembuat konten memeriksa panjang teks serta perkiraan waktu baca. Bahasa publik Indonesia, `lang="id"`. Route `/penghitung-kata/`; canonical `https://edwinlab.dev/penghitung-kata/`.

V1 menghitung kata, karakter termasuk whitespace, karakter tanpa whitespace, baris, paragraf, dan estimasi waktu baca dengan laju yang dapat diubah. Tindakan: Hitung, Isi contoh, Bersihkan, dan Salin ringkasan. Tidak ada upload dokumen, ekspor dokumen, koreksi ejaan, analisis SEO, keyword density, deteksi bahasa, atau penghitung kalimat.

## Prasyarat dan kepemilikan

- [x] Baca `docs/everyday-tools/README.md`, `CONTRACT.md`, dan `00-foundation.md`; foundation dan runner tesnya harus sudah selesai dengan bukti.
- [x] Baca instruksi repository dan inspeksi shared API aktual sebelum mengimpor. Pertahankan perubahan pengguna.
- [x] Buat hanya `penghitung-kata/index.html`, `penghitung-kata/logic.js`, `penghitung-kata/tool.js`, dan CSS lokal jika benar-benar diperlukan.
- [x] Buat `tests/everyday/penghitung-kata.test.js` dan `tests/everyday/penghitung-kata.html`. Impor harness yang sudah ada dari `../tools/harness.js`, tidak membuat runner kedua; HTML tes `noindex,nofollow`.
- [x] Gunakan `/tools/shared/tools.css`, `setStatus` dari `/tools/shared/ui.js`, dan `copyTextId` dari `/everyday/shared/ui.js` sesuai kontrak; shared lama dan baru read-only bagi task ini.
- [x] Hanya perbarui checklist/catatan bukti dokumen ini serta baris tracker milik 01 yang diizinkan CONTRACT sesudah bukti nyata tersedia. Homepage, hub, sitemap, robots, kontrak, foundation, dan tool lain di luar kepemilikan.
- [x] Tetap HTML/CSS/JavaScript vanilla dengan ES module `.js`, tanpa npm, package.json, build, backend, framework, CDN, atau dependency baru. Jangan commit, push, atau deploy.

## Algoritme, batas, dan hasil

- [x] Pure function `countText(text, wordsPerMinute, segmenters)` mengembalikan `{words, characters, charactersWithoutWhitespace, lines, paragraphs, readingSeconds}`; segmenter diinjeksi agar ketidaktersediaannya dapat diuji tanpa mengubah global browser.
- [x] Batasi input mentah sebelum normalisasi: maksimum **100.000 Unicode code points dan 400.000 byte UTF-8**. Kedua syarat harus lulus; tepat batas diterima. Iterasi code point tidak sama dengan `text.length` UTF-16. Berhenti menghitung ketika batas terlampaui, jangan mengalokasikan array semua segmen.
- [x] Normalisasi CRLF dan CR menjadi LF hanya pada salinan yang dihitung. Jangan mengubah teks di textarea pengguna. Jangan trim teks sebelum menghitung karakter/baris.
- [x] Feature-detect `Intl.Segmenter` dan dukungan locale `id` melalui `supportedLocalesOf(['id'])`; buat segmenter `word` dan `grapheme` dengan locale `id`. Kegagalan konstruksi, locale tidak didukung, atau API tidak tersedia menghasilkan `SEGMENTER_UNAVAILABLE` dan pesan pembaruan browser, tanpa hasil parsial atau fallback `split(' ')` yang mengubah definisi.
- [x] Kata = jumlah segmen word dengan `isWordLike === true`. Angka dapat termasuk kata; tanda baca/emoji saja tidak termasuk. Jelaskan ini sebagai aturan segmentasi browser untuk teks Indonesia; pemisahan kata majemuk, singkatan, dan bahasa lain dapat berbeda antar versi data Unicode browser. Jangan menjanjikan kecocokan dengan Word atau platform lain.
- [x] Karakter = jumlah grapheme clusters dari salinan LF, termasuk whitespace. Karakter tanpa whitespace = grapheme yang **tidak** seluruhnya cocok `/^\s+$/u` JavaScript. Tanda baca dan emoji tetap dihitung; zero-width space bukan otomatis dibuang. Gunakan label `Karakter tanpa spasi, tab, dan baris baru` beserta penjelasan definisi whitespace di artikel.
- [x] Baris = `0` jika string kosong; selain itu jumlah LF + 1, termasuk baris kosong terakhir. Paragraf = jumlah kelompok baris nonblank yang dipisahkan sedikitnya satu baris blank. Baris blank adalah baris dengan `.trim() === ''`; dua baris nonblank berurutan tetap satu paragraf.
- [x] Laju baca default **200 kata/menit**, opsi input integer ASCII 50–1.000, trim whitespace ASCII tepi, tanpa tanda, desimal, eksponen, atau pemisah ribuan; maksimum 8 karakter mentah. Pilihan 200 adalah parameter awal alat, bukan klaim ilmiah kecepatan semua pembaca.
- [x] `readingSeconds = words === 0 ? 0 : Math.ceil(words * 60 / wordsPerMinute)`. Tampilkan menit dan sisa detik, misalnya `2 menit 1 detik`; beri label `Perkiraan waktu baca` dan tampilkan laju yang dipakai. Kosong dan whitespace saja sah, bukan error.
- [x] Ringkasan teks salinan maksimum 2 KiB UTF-8, berisi label, enam statistik, dan laju baca; tidak menyertakan teks masukan. Copy hanya aktif sesudah hitung sukses dan non-stale.
- [x] Gunakan kode task `INPUT_TOO_LARGE`, `INVALID_READING_RATE`, `SEGMENTER_UNAVAILABLE`, dan `OUTPUT_TOO_LARGE` dengan pesan Indonesia yang spesifik; error tidak menghapus masukan.

## UI dan perilaku

- [x] Sediakan textarea `Teks yang ingin dihitung`, input `Kecepatan baca (kata per menit)`, tombol `Hitung`, `Isi contoh`, `Bersihkan`, dan `Salin ringkasan`. Kartu hasil memiliki label terlihat dan nilai dapat diseleksi.
- [x] Proses hanya lewat tombol, tanpa loop analisis per ketikan. Perubahan input/laju menghapus hasil lama dan menonaktifkan copy. Bersihkan mengosongkan teks dan hasil, mengembalikan laju 200, lalu memfokuskan textarea.
- [x] Status `aria-live="polite"`, validasi memfokuskan input terkait, keyboard lengkap, kontras dan focus mengikuti shell foundation. Isi contoh memakai `Halo dunia!`, tidak langsung menghitung.
- [x] Tampilkan batas input dan kebijakan waktu baca dekat kontrol. Render semua input/hasil sebagai `.value` atau `textContent`; tanpa HTML dari input, network input, analytics, URL query/hash, localStorage, atau sessionStorage.
- [x] Layout nyaman pada 320/390/768/1440 px, tidak overflow global. `<noscript>` menjelaskan pemrosesan membutuhkan JavaScript; artikel tetap terlihat.

## Fixture deterministik dan verifikasi

Notasi `\n`, `\t`, `\r\n`, dan `\u0301` berarti karakter asli saat dibuat sebagai string tes. Urutan tuple: **kata / karakter / tanpa-whitespace / baris / paragraf / detik**, laju 200 kecuali disebut lain.

- [x] `''` → **0 / 0 / 0 / 0 / 0 / 0**.
- [x] `' \t\n'` → **0 / 3 / 0 / 2 / 0 / 0**.
- [x] `'Halo dunia!'` → **2 / 11 / 10 / 1 / 1 / 1**.
- [x] `'Satu\r\n\r\nDua'` → **2 / 9 / 7 / 3 / 2 / 1** sesudah normalisasi salinan; input asli tetap sama.
- [x] `'Halo\tDunia\nLagi'` → **3 / 15 / 13 / 2 / 1 / 1**.
- [x] `'e\u0301'` → **1 / 1 / 1 / 1 / 1 / 1**, sedangkan emoji keluarga `'👨‍👩‍👧‍👦'` → **0 / 1 / 1 / 1 / 1 / 0**; keduanya subkasus satu fixture grapheme.
- [x] `'kata '.repeat(400) + 'kata'` → **401 / 2004 / 1604 / 1 / 1 / 121** pada 200 kata/menit; pada 400 kata/menit detik menjadi **61**.
- [x] `'123 45'` → **2 / 6 / 5 / 1 / 1 / 1**; membuktikan definisi kata memasukkan angka word-like.
- [x] Tambahkan tes batas: `'a'.repeat(100000)` diterima dan 100001 ditolak; 100000 code points `😀` tepat 400000 byte diterima; laju `50` dan `1000` sah, `49`, `1001`, `2e2`, `200.5`, kosong tidak sah; segmenter diinjeksi tidak tersedia → `SEGMENTER_UNAVAILABLE` tanpa hasil.
- [x] Browser QA mencakup markup literal, trailing newline, edit stale, contoh, clear, copy sukses/gagal; jangan menyatakan kesamaan semua bahasa hanya dari fixture Indonesia ini.

## SEO dan konten statis

- [x] Title: `Penghitung Kata dan Karakter Online | Edwin Lab`.
- [x] H1: `Penghitung Kata dan Karakter`.
- [x] Meta description: `Hitung kata, karakter, baris, paragraf, dan perkiraan waktu baca teks. Atur kecepatan baca dan proses teks langsung di browser tanpa unggah dokumen.`
- [x] Intro: `Tempel tulisan untuk melihat jumlah kata dan karakter, lalu perkirakan waktu bacanya dengan kecepatan yang Anda pilih.`
- [x] Intent/query sasaran: memeriksa batas tugas, caption, atau draf; `penghitung kata`, `hitung karakter`, `jumlah kata online`, `perkiraan waktu baca`. Ini hipotesis kegunaan, bukan angka volume atau jaminan traffic.
- [x] HTML awal memuat cara pakai tiga langkah, definisi enam statistik, contoh `Halo dunia!` = 2 kata/11 karakter, contoh 401 kata pada 200 kata/menit = 2 menit 1 detik, dan batas 100000 code points/400000 byte.
- [x] FAQ dengan jawaban konkret: `Apakah emoji dihitung sebagai karakter?` → satu grapheme bisa terdiri dari beberapa code points; `Mengapa jumlah kata berbeda dari aplikasi lain?` → aturan segmentasi dapat berbeda; `Apakah waktu baca pasti?` → perkiraan berdasarkan laju pilihan; `Apakah teks diunggah?` → diproses lokal tanpa dikirim.
- [x] Canonical, OG, favicon/logo asli, serta structured data opsional mengikuti CONTRACT; tanpa rating/FAQ rich-result yang dijanjikan. Related kandidat `/ubah-huruf/` dan hub everyday sesuai CONTRACT; aktifkan hanya setelah target benar-benar ada dan siap.

## Definition of done saat eksekusi

- [x] `/tests/everyday/penghitung-kata.html` melalui HTTP menampilkan semua fixture lulus; catat jumlah lulus/gagal dan browser. Belum diuji browser berarti belum selesai.
- [ ] Direct route `/penghitung-kata/` dan refresh berhasil; keyboard, copy sukses/gagal, validasi, serta 320/390/768/1440 px lulus di IAB. Pemeriksaan console tidak tersedia melalui API CUA, mode tanpa JavaScript belum dijalankan, dan Network hanya ditinjau dari source sehingga butir QA ini tetap terbuka.
- [x] Jalankan `git diff --check`, periksa diff kepemilikan, laporkan file, hasil tes, QA, dan keterbatasan aktual; centang hanya bukti yang sudah terjadi lalu perbarui tracker task sendiri.

## Catatan eksekusi — 12 Oktober 2026

Model yang digunakan: GPT-6 Luna, reasoning high. Implementasi berada di `penghitung-kata/index.html`, `logic.js`, dan `tool.js`; tes ada di `tests/everyday/penghitung-kata.html` dan `penghitung-kata.test.js`. Fixture serta perilaku browser lulus **19/19** di IAB. Direct route dan refresh berhasil; contoh menampilkan 2 kata, 11 karakter, 10 tanpa whitespace, 1 baris, 1 paragraf, dan 1 detik. Tab/Enter melewati tautan skip ke `#main`. Empat lebar 320/390/768/1440 px lulus tanpa overflow. Salin berhasil/gagal, input stale, validasi laju, clear, contoh, dan markup literal diuji oleh runner. Pemeriksaan sintaks modul, 13 grup fixture pure melalui Node, dan `git diff --check` lulus. Sumber tidak memuat pengiriman input ke network; Network hanya diperiksa melalui source. Console tidak dapat ditangkap melalui CUA IAB, dan `<noscript>` belum diuji dengan JavaScript dinonaktifkan, jadi task ini belum dinyatakan selesai.

## Prompt eksekusi siap tempel

```text
Implementasikan hanya docs/everyday-tools/01-penghitung-kata.md di repository ini.
Baca docs/everyday-tools/README.md, CONTRACT.md, dan 00-foundation.md; pastikan foundation selesai dengan bukti. Model rekomendasi GPT-6 Luna high, bukan benchmark; bila fixture masih gagal setelah satu perbaikan terarah, isolasi reproduksi dan lanjutkan per langkah kecil dengan Luna yang sama.
Buat route /penghitung-kata/ beserta logic, DOM, HTML statis Indonesia lang=id, dan dua file tes miliknya di tests/everyday/ menggunakan tests/tools/harness.js. Terapkan persis segmentasi Intl.Segmenter locale id, feature detection tanpa fallback diam-diam, definisi grapheme/baris/paragraf, batas input, dan waktu baca dari task. HTML/CSS/vanilla JS saja, tanpa npm/build/backend/CDN.
Jangan mengubah shared files, homepage, hub, sitemap, kontrak, tool lain, atau dependency. Jika prasyarat/helper tidak memadai, laporkan reproduksi dan kebutuhan foundation; jangan menyalin helper baru sendiri. Jangan commit, push, atau deploy.
Jalankan fixture dan QA browser yang diminta, laporkan jumlah lulus/gagal, direct route/refresh, responsif, keyboard, console/network, dan git diff --check. Perbarui checklist/catatan task dan baris tracker sendiri hanya setelah ada bukti; bila browser belum diuji, nyatakan belum terverifikasi dan jangan tandai selesai.
```

Rujukan teknis yang dibuka saat perencanaan: [spesifikasi resmi Intl.Segmenter](https://tc39.es/ecma402/#segmenter-objects) dan [referensi Intl.Segmenter dari MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter). Segmentasi word dan grapheme merupakan fitur berbeda; pembacaan durasi adalah rumus produk yang ditetapkan di atas.
