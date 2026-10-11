# 09 — JSON ↔ YAML Converter

Status: selesai — implementasi, fixtures, dan QA browser lulus.
Model: **GPT-6 Luna · high**; gunakan GPT-6.1 Sol medium bila fixture masih gagal setelah satu perbaikan terarah.

## Tujuan dan batas kerja

- Path: `/json-yaml-converter/`; canonical: `https://edwinlab.dev/json-yaml-converter/`.
- Ubah payload JSON dan konfigurasi YAML satu dokumen dengan tipe data yang jelas.
- UI/copy Inggris. V1: pilihan arah, input/output, convert, contoh per arah, clear, copy, download.
- Tidak termasuk multi-document YAML, template engine, custom tags, merge keys, anchors/aliases, atau mempertahankan komentar.
- Scope ini sengaja membatasi YAML pada data yang bisa direpresentasikan JSON.

**Batas teknologi:** hanya HTML, CSS, JavaScript vanilla dan library JavaScript lokal siap browser bila disebutkan. Tanpa npm, package.json, framework, bundler, transpiler, atau backend.

## Prasyarat dan file

- [x] Baca `docs/developer-tools/README.md`, `CONTRACT.md`, `00-foundation.md`, dan README repository.
- [x] Pastikan foundation selesai dan gunakan template/API shared yang benar-benar tersedia.
- [x] Buat `json-yaml-converter/index.html`, `json-yaml-converter/tool.js`, `json-yaml-converter/logic.js`.
- [x] Buat `tests/tools/json-yaml-converter.test.js` dan `tests/tools/json-yaml-converter.html` memakai harness browser dalam CONTRACT.md.
- [x] Gunakan `/tools/shared/tools.css` dan `/tools/shared/ui.js`; jangan mengubah shared files di task ini.
- [x] Gunakan library `yaml` di `tools/vendor/yaml/` dari foundation, dengan browser ESM, lisensi, versi tepat, URL sumber, dan checksum.
- [x] Jangan mengubah package/lockfile global, homepage, sitemap, registry, atau tool lain.

## TODO implementasi

- [x] Tinjau API/versi parser dari dokumentasi resmi; gunakan satu versi yang di-pin, tanpa CDN/runtime fetch.
- [x] Gunakan distribusi browser ESM resmi `yaml` yang sudah dipin foundation; salin tree modul siap browser tanpa npm/bundler/build. Jika distribusi tidak kompatibel, laporkan dependency blocker dan jangan mengganti teknologi.
- [x] Di `logic.js`, ekspor pure `jsonToYaml(text)` dan `yamlToJson(text)`; adapter DOM berada di `tool.js`.
- [x] Sediakan arah `JSON to YAML` dan `YAML to JSON`; ubah label, contoh, ekstensi download, dan placeholder sesuai arah.
- [x] Batas input 5 MiB UTF-8, depth 100, serta batas output contract berlaku sebelum hasil ditampilkan; kosong/whitespace adalah error.
- [x] Perubahan input/arah menghapus status hasil lama; jangan otomatis menukar output ke input atau mengubah data pengguna.
- [x] JSON input: cek token angka di luar string sebelum `JSON.parse`; tolak non-finite dan integer-valued di luar safe integer, termasuk exponent equivalent.
- [x] Quoted numeric IDs tetap string. Jelaskan bahwa komentar/format source tidak ikut dipertahankan oleh konversi.
- [x] Parse YAML melalui Document API, YAML 1.2/core schema; hindari YAML 1.1 agar `yes`, `no`, `on`, `off` tetap string.
- [x] Gunakan integer parsing sebagai BigInt untuk mendeteksi overflow; ubah ke Number hanya setelah terbukti dalam rentang safe integer.
- [x] Nonaktifkan known/custom tags dan merge; tinjau AST, tolak explicit tags, aliases/anchors, `%YAML 1.1`, dan key `<<` agar tidak ambigu.
- [x] Batasi alias melalui opsi parser `maxAliasCount:0` juga; jangan hanya mengandalkan batas panjang input.
- [x] Tolak duplicate mapping keys, collection keys, non-string keys, beberapa dokumen, serta warning unresolved tag; jangan diam-diam memulihkan input.
- [x] Sebelum konversi, validasi AST/depth dan pastikan nilai hanya null, boolean, finite number, string, list, atau mapping string-key.
- [x] Tolak `.nan`, `.inf`, unsafe integer, cyclic structures, dan tipe yang tidak bisa diwakili JSON dengan pesan field/path yang jelas.
- [x] Jangan menolak string literal seperti `".nan"`, `"2024-01-01"`, `"00123"`, `"true"`, atau `"9007199254740993"`.
- [x] Mapping dengan `__proto__`/`constructor` diperlakukan sebagai own data keys; gunakan null-prototype map atau safe property definition untuk konversi sendiri.
- [x] JSON→YAML: indentasi 2 spasi, newline final, string di-quote bila perlu agar tipe dipertahankan saat dibaca kembali.
- [x] YAML→JSON: indentasi 2 spasi; scalar/list root boleh, bukan hanya object root.
- [x] Gunakan `parseSafeJSON` untuk JSON input: duplicate keys, underflow nonzero→0, non-finite, dan unsafe integer ditolak; jangan mengklaim konversi source-preserving.
- [x] Input JSON desimal mengikuti number JavaScript; presisi arbitrary decimal bukan fitur V1, sebutkan batas ini di petunjuk.
- [x] Tampilkan error parser yang diringkas, baris/kolom jika tersedia; semua pesan/data melalui `textContent` atau `.value`.
- [x] Proses seluruh input lokal; tidak ada telemetry, storage, atau teks input di query URL.
- [x] Copy/download memakai helper shared; tombol output nonaktif saat error, kosong, atau stale.

## TODO SEO dan copy unik

- [x] Title: `JSON to YAML & YAML to JSON Converter — Edwin Lab`.
- [x] H1: `JSON ↔ YAML Converter`.
- [x] Meta description: `Convert JSON to YAML or YAML to JSON in your browser. Preserve strings and data types with clear validation for configuration files and API payloads.`
- [x] Intro: `Move between JSON payloads and YAML configuration without uploading your data.`
- [x] Artikel statis: cara dua arah, contoh API settings, string versus boolean/number, dan batas subset YAML V1.
- [x] Sertakan contoh quoted `"00123"` dan `"true"`; jelaskan angka besar sebaiknya menjadi string jika merepresentasikan ID.
- [x] FAQ: `Are YAML comments preserved?`, `Why does yes stay a string?`, `Are anchors and custom tags supported?`, `Can I convert multiple YAML documents?`.
- [x] Sasaran query: `JSON to YAML`, `YAML to JSON`, `convert YAML config to JSON`; gabungkan dua arah dalam satu halaman.
- [x] Terapkan canonical/OG/schema dari contract; artikel HTML tersedia tanpa JS.
- [x] Related kandidat: `/jsonlint/` dan `/json-diff/`; aktifkan hanya setelah target terintegrasi.

## Fixture dan verifikasi wajib

- [x] JSON `{"name":"api","enabled":true,"ports":[80,443]}` → YAML yang dibaca kembali menghasilkan data identik; jangan snapshot whitespace library berlebihan.
- [x] YAML `name: api\nenabled: true\nports: [80, 443]` → object JSON dengan string, boolean, dan array number yang benar.
- [x] YAML `answer: yes\nmode: on\ndate: 2024-01-01` → semua value string; jangan menjadi bool atau Date.
- [x] JSON `{"id":"00123","flag":"true","large":"9007199254740993"}` → YAML→JSON menjaga seluruh value sebagai string persis.
- [x] YAML `value: 9007199254740993` dan JSON number yang sama → error presisi; versi dengan kutip diterima.
- [x] YAML `.nan`, `.inf`, JSON `1e400`, dan integer-valued `1e20` → error; string quoted yang sama diterima.
- [x] `x: !custom value`, `x: !!timestamp 2024-01-01`, `a: &x [1]\nb: *x`, dan recursive alias → error fitur tidak didukung.
- [x] `a: 1\na: 2`, `a: 1\n---\nb: 2`, `? [a, b]\n: c`, `%YAML 1.1\n---\nx: yes` → error jelas.
- [x] `1: value` → reject key non-string; `"1": value` → key string diterima.
- [x] `__proto__: {polluted: true}` → own key pada JSON output; prototype object global tetap bersih.
- [x] `null`, `false`, `[1,2]`, dan `"hello"` → root value diterima dua arah; empty input ditolak.
- [x] `note: |\n  first\n  second\n` → string multiline dengan newline yang benar; Unicode/emoji bertahan.
- [x] Depth 101, input >5 MiB, ekspansi output terlalu besar, dan string HTML → penanganan terkontrol; tidak ada script execution.

## Definition of Done

- [x] Buka `/tests/tools/json-yaml-converter.html` melalui HTTP lokal; seluruh tes browser-native lulus dan console bersih.
- [x] `git diff --check` lulus; modul hanya mengimpor file lokal dan dependency tersedia bersama lisensi/provenance.
- [x] Browser direct load/refresh, dua arah, error, stale state, copy/download, keyboard, dan 390/1440 px lulus.
- [x] Console bersih, Network tidak mengirim input, no-JS tetap menampilkan konten penjelas.
- [x] Laporkan versi dependency, test, hasil review browser, dan keterbatasan; checkbox selesai harus sesuai bukti.


## Hasil eksekusi

- Seluruh checklist selesai. Browser suite: **18/18 lulus**; QA manual direct route mengonfirmasi konversi dua arah dan output lokal.
- Dependency: `yaml` 2.8.1, distribusi browser lokal berlisensi dan dipin dari foundation. Batas V1 menolak fitur YAML di luar subset JSON yang dijelaskan di halaman.

## Prompt siap tempel

```text
Implementasikan hanya docs/developer-tools/09-json-yaml-converter.md setelah foundation selesai.
Baca README.md dan CONTRACT.md di folder dokumen. Ikuti ownership, subset YAML, guard presisi, dan fixtures.
Pakai dependency lokal yang di-pin dan berlisensi; jangan membuat YAML parser sendiri atau memakai CDN.
UI/copy Inggris, static browser ESM .js, tanpa framework/backend/build sama sekali.
Jangan mengubah shared files, homepage, sitemap, package global, atau tool lain. Jangan deploy/push.
Selesaikan test dan review browser lalu laporkan hasil serta batas dukungan sebenarnya.
```

Rujukan: [dokumentasi resmi YAML parser](https://eemeli.org/yaml/). Kebijakan subset/limit di atas adalah keputusan produk; verifikasi API versi terpilih saat implementasi.
