# 02 — JSON Diff

Status: Selesai secara lokal pada 11 Oktober 2026. Aplikasi, fixture browser, dan QA selesai; belum diintegrasikan ke hub/sitemap atau dipublikasikan.
Model: **GPT-6 Luna · high**; gunakan GPT-6.1 Sol medium bila fixture masih gagal setelah satu perbaikan terarah.

## Tujuan dan batas kerja

- Path: `/json-diff/`; canonical: `https://edwinlab.dev/json-diff/`.
- Bandingkan struktur dua payload API dan jelaskan nilai yang ditambahkan, dihapus, atau berubah.
- UI/copy Inggris. V1: dua input, compare, swap, contoh, clear, ringkasan, filter jenis perubahan, copy laporan teks.
- Semantik tetap: urutan key object diabaikan; array dibandingkan berdasarkan indeks; tidak ada array matching by ID.
- Tidak termasuk JSON Patch, merge editor, tree editor, syntax highlight kompleks, atau fuzzy diff.

**Batas teknologi:** hanya HTML, CSS, JavaScript vanilla dan library JavaScript lokal siap browser bila disebutkan. Tanpa npm, package.json, framework, bundler, transpiler, atau backend.

## Prasyarat dan file

- [x] Baca `docs/developer-tools/README.md`, `CONTRACT.md`, `00-foundation.md`, dan README repository.
- [x] Pastikan foundation selesai; inspeksi template/API shared aktual.
- [x] Buat `json-diff/index.html`, `json-diff/tool.js`, `json-diff/logic.js`.
- [x] Buat `tests/tools/json-diff.test.js` dan `tests/tools/json-diff.html` memakai harness browser dalam CONTRACT.md.
- [x] Gunakan `/tools/shared/tools.css` dan `/tools/shared/ui.js`; jangan edit file bersama dalam task ini.
- [x] Tidak perlu dependency diff; gunakan traversal struktur sederhana. Jangan mengubah package/lockfile global.
- [x] Jangan edit homepage, sitemap, registry, atau tool lain; related links disambungkan saat integrasi.

## TODO implementasi

- [x] Susun panel `Original JSON` dan `Updated JSON`, tombol `Compare JSON`, `Swap`, `Load example`, `Clear`.
- [x] Terapkan batas 5 MiB UTF-8 total kedua input sebelum parsing; input kosong dianggap error, bukan object kosong.
- [x] Pure API di `logic.js`: validasi input aman, `compareJson(leftText, rightText)`, dan `formatDiffReport(result)`.
- [x] Cek token angka di luar string sebelum `JSON.parse`; reject nilai non-finite dan integer-valued di luar ±9007199254740991, termasuk exponent/decimal equivalent.
- [x] Scanner numeric harus memahami escaped quotes dan backslash; angka di dalam string tidak diperiksa sebagai number.
- [x] Pada penolakan presisi, sarankan membungkus ID besar sebagai string; jangan membulatkan diam-diam atau mengubah user input otomatis.
- [x] Dokumentasikan semantik number JavaScript untuk angka desimal dalam rentang aman; `1`, `1.0`, dan `1e0` dianggap sama.
- [x] Gunakan `parseSafeJSON` dari shared/json.js; tolak duplicate keys, underflow nonzero→0, non-finite, dan unsafe integer sebelum materialisasi data.
- [x] Bedakan jenis null, array, object, boolean, string, number; `null` tidak boleh diperlakukan sebagai object.
- [x] Traverse object dengan `Object.keys` dan own-property checks; jangan memakai `for...in`, merge, atau assignment ke object biasa dengan key pengguna.
- [x] Key `__proto__`, `constructor`, dan `prototype` adalah data biasa; hasil tidak boleh mengubah prototype global.
- [x] Untuk path, gunakan JSON Pointer: escape `~` sebagai `~0`, `/` sebagai `~1`; root `""` ditampilkan sebagai `(root)`.
- [x] Output setiap record: path, jenis `added|removed|changed`, serta before/after yang mempertahankan jenis data.
- [x] Gunakan sentinel missing terpisah dari `null` dan string `"missing"`; UI missing ditampilkan sebagai `—` dengan label aksesibel.
- [x] Nilai scalar berbeda atau type berubah menghasilkan satu record pada path itu; subtree baru/hilang menghasilkan satu record untuk subtree tersebut.
- [x] Array bandingkan indeks yang sama, lalu sisa indeks adalah added/removed. Array tidak diurutkan dan perubahan panjang tidak menggandakan record.
- [x] Bandingkan number dengan semantik `===`, sehingga `-0` sama dengan `0`; object keys ditelusuri dalam urutan sort deterministik.
- [x] Batasi kedalaman 100; hentikan traversal setelah 500 record, tandai `truncated`, dan jangan menyatakan hasil sebagai daftar lengkap.
- [x] Ringkasan hasil truncated harus berbunyi `Showing the first 500 differences`; count per jenis hanya untuk record yang ditampilkan.
- [x] Render tabel/list path, before, after; gunakan teks plus label, bukan warna saja; batasi preview nilai panjang namun copy report tetap jelas soal truncation.
- [x] Pada input berubah, hasil lama invalid; swap menukar input dan membersihkan hasil; filter tidak menghitung ulang diff.
- [x] Seluruh input/output lewat `.value`/`textContent`; tidak ada telemetry, storage, query input, atau network untuk proses diff.
- [x] Copy report plain text dengan jalur dan jenis; tidak perlu download atau ekspor format machine-readable pada V1.

## TODO SEO dan copy unik

- [x] Title: `JSON Diff — Compare JSON Objects Online | Edwin Lab`.
- [x] H1: `JSON Diff`.
- [x] Meta description: `Compare two JSON payloads by structure. Find added, removed, and changed values while ignoring object key order, directly in your browser.`
- [x] Intro: `See what changed between two API responses without being distracted by formatting or object key order.`
- [x] Artikel statis: langkah membandingkan API response, contoh perubahan field, dan arti added/removed/changed.
- [x] Jelaskan dengan contoh bahwa urutan object keys diabaikan dan array positions tetap berarti; jangan menyebut semua order diabaikan.
- [x] FAQ unik: `Does JSON key order matter?`, `How are arrays compared?`, `Is a missing field the same as null?`, `Why are large numeric IDs rejected?`.
- [x] Sasaran query: `JSON diff`, `compare JSON objects`, `JSON compare ignore key order`; tidak menargetkan validator sebagai intent utama.
- [x] Tambahkan metadata/schema foundation dan HTML yang terbaca tanpa JS; tidak membuat halaman variasi keyword tambahan.
- [x] Related kandidat: `/jsonlint/` dan `/json-yaml-converter/`; aktifkan hanya setelah target diintegrasikan.

## Fixture dan verifikasi wajib

- [x] `{"a":1,"b":2}` vs `{"b":2,"a":1}` → nol perubahan, pesan `No differences found`.
- [x] `{"a":1,"b":2}` vs `{"a":3,"c":4}` → changed `/a`: 1→3, removed `/b`: 2, added `/c`: 4.
- [x] `{"x":null}` vs `{}` → removed `/x`; `{}` vs `{"x":null}` → added `/x`.
- [x] `{"a/b":{"~k":1}}` vs `{"a/b":{"~k":2}}` → changed `/a~1b/~0k`.
- [x] `[1,2]` vs `[2,1,3]` → changed `/0`, changed `/1`, added `/2`; bukan array reorder detection.
- [x] `{"x":{"a":1}}` vs `{"x":[]}` → satu changed `/x`; `{}` vs `{"x":{"a":1}}` → satu added `/x`.
- [x] `1` vs `"1"` → satu changed root; `-0` vs `0`, `1.0` vs `1e0` → nol perubahan.
- [x] `{"a":1,"a":2}` vs `{"a":2}` → error duplicate key pada input kiri.
- [x] `{"__proto__":{"polluted":true}}` vs `{}` → removed `/__proto__`; `({}).polluted` tetap `undefined`.
- [x] Angka token `9007199254740993`, `9007199254740992.0`, `1e20`, `1e400` → penolakan presisi/rentang; bentuk quoted diterima.
- [x] JSON invalid kiri/kanan → pesan menyebut input mana yang salah; tidak ada hasil sebagian yang dianggap sukses.
- [x] Generate 501 perbedaan → 500 record + `truncated:true`; tidak ada klaim total 500 sebagai hasil lengkap.
- [x] Kedalaman 101, input >5 MiB, dan HTML berbahaya sebagai string/key → gagal terkontrol atau tampil sebagai teks sesuai kasus.

## Definition of Done

- [x] Buka `/tests/tools/json-diff.html` melalui HTTP lokal; seluruh tes browser-native lulus dan console bersih.
- [x] `git diff --check` lulus; perubahan kode hanya pada file milik task ini dan tracker diperbarui.
- [x] Browser: direct load/refresh `/json-diff/`, compare, swap, filter, clear, stale result, dan copy bekerja.
- [x] Uji 390/1440 px, keyboard, label screen reader, console, no-JS content, dan tidak ada pengiriman input melalui Network.
- [x] Laporkan file, test, hasil browser, dan limitation; perbarui hanya checkbox yang terbukti selesai.

## Prompt siap tempel

```text
Implementasikan hanya docs/developer-tools/02-json-diff.md.
Baca README.md dan CONTRACT.md di folder dokumen tersebut; pastikan 00-foundation.md selesai.
Bangun sesuai file ownership, pure logic, semantik object/array, guard presisi, dan fixture.
Gunakan Inggris untuk UI/copy dan modul .js tanpa framework/build/backend.
Jangan mengubah shared files, homepage, sitemap, package global, atau tool lain. Jangan deploy/push.
Selesaikan test dan review browser, lalu laporkan hasil aktual dan keterbatasannya.
```


## Hasil eksekusi 11 Oktober 2026

- File task yang dibuat: `json-diff/index.html`, `json-diff/tool.js`, `json-diff/logic.js`, `tests/tools/json-diff.test.js`, dan `tests/tools/json-diff.html`. Tidak ada shared file, homepage, sitemap, package/lockfile, atau tool lain yang diubah.
- Implementasi memakai `parseSafeJSON`, `assertTextSize`, serta `copyText` foundation. Tidak ada dependency tambahan. Object keys diurutkan untuk traversal; arrays dibandingkan per indeks; path memakai JSON Pointer; missing memakai sentinel `Symbol` privat. Data pengguna hanya dirender dengan `.textContent`.
- Browser suite: **17/17 lulus**, termasuk urutan key, add/remove/change, null vs missing, escaped pointer, array, type changes, angka presisi, duplicate keys, `__proto__`, kedalaman 100/101, input gabungan tepat 5 MiB dan di atas batas, serta 500/501 perbedaan.
- QA di HTTP lokal: route `/json-diff/` dan test runner merespons HTTP 200; compare contoh menghasilkan 3 perubahan; filter, swap, clear, invalidasi hasil lama saat input berubah, copy clipboard, pesan error, dan nilai HTML berbahaya tampil sebagai teks diuji di browser.
- Responsive QA headless Chrome: pada lebar 390 px dokumen tetap selebar viewport dan tabel 700 px berada di dalam scroll container 336 px; pada 1440 px konten dibatasi container 1180 px. Tidak ada horizontal overflow halaman.
- Aksesibilitas: label input, missing-value label, status live, dan urutan fokus terpapar di accessibility tree. Tab keyboard memindahkan fokus dan focus outline 3 px terlihat. Saat JavaScript dinonaktifkan, `<noscript>`, panduan, contoh, dan FAQ tetap tersedia.
- Pemantauan error/warning halaman saat compare, filter, swap, dan clear tidak menangkap error, rejection, `console.error`, atau `console.warn`. Audit source memastikan hanya import/aset lokal, tanpa `fetch`, XHR, beacon, storage, atau input pada URL.
- `node --check` untuk modul dan fixture lulus; `git diff --check` lulus. Tidak ada deployment, commit, atau push.
