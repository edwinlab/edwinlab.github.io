# 10 — JSON ↔ CSV Converter

Status: selesai — implementasi, fixtures, dan QA browser lulus.
Model: **GPT-6 Luna · high**; gunakan GPT-6.1 Sol medium bila fixture masih gagal setelah satu perbaikan terarah.

## Tujuan dan batas kerja

- Path: `/json-csv-converter/`; canonical: `https://edwinlab.dev/json-csv-converter/`.
- Ubah array record JSON menjadi CSV dan CSV berheader menjadi array object JSON.
- UI/copy Inggris. V1: dua arah, delimiter comma/semicolon/tab, preview 20 row, copy, download, contoh, clear.
- JSON→CSV hanya array of objects; nested field dipilih `Reject nested values` (default) atau `Serialize nested values as JSON`.
- Tidak termasuk flatten/unflatten path, infer tipe CSV, Excel file, custom header mapping, atau impor URL.

**Batas teknologi:** hanya HTML, CSS, JavaScript vanilla dan library JavaScript lokal siap browser bila disebutkan. Tanpa npm, package.json, framework, bundler, transpiler, atau backend.

## Prasyarat dan file

- [x] Baca `docs/developer-tools/README.md`, `CONTRACT.md`, `00-foundation.md`, dan README repository.
- [x] Pastikan foundation selesai; inspeksi shell/helper sebelum memakainya.
- [x] Buat `json-csv-converter/index.html`, `json-csv-converter/tool.js`, `json-csv-converter/logic.js`.
- [x] Buat `tests/tools/json-csv-converter.test.js` dan `tests/tools/json-csv-converter.html` memakai harness browser dalam CONTRACT.md.
- [x] Gunakan `/tools/shared/tools.css` dan `/tools/shared/ui.js`; shared files read-only untuk task ini.
- [x] V1 bisa memakai state machine CSV kecil yang diuji; jika memilih library, tinjau dokumentasi resmi, pin exact version, vendor di `tools/vendor/json-csv/` dengan lisensi/provenance.
- [x] Jangan edit homepage, sitemap, registry, package/lockfile global, atau tool lain.

## TODO implementasi

- [x] Gunakan `parseSafeJSON` foundation untuk input JSON; tolak duplicate keys, unsafe integer, non-finite, dan underflow nonzero→0.

- [x] Pure API `jsonToCsv(text, options)` dan `csvToJson(text, options)` di `logic.js`; hasil mencakup output, headers, jumlah row, dan preview data.
- [x] Input 5 MiB UTF-8 maksimal; batas output sesuai contract; depth JSON 100; kosong/whitespace menjadi pesan error.
- [x] Pilihan arah memperbarui label/output extension. Perubahan input/options membuat hasil sebelumnya stale hingga convert ulang.
- [x] JSON input: cek token angka di luar string sebelum parse; reject non-finite dan integer-valued di luar safe integer, termasuk exponent equivalent.
- [x] JSON root harus array object non-null; `[]` menghasilkan output kosong yang valid dengan status `0 rows`, tanpa header rekaan.
- [x] Header JSON→CSV adalah union own keys seluruh record, sesuai urutan pertama ditemukan; gunakan Map/Set dan safe property handling.
- [x] Missing field dan `null` menjadi cell kosong; string kosong juga kosong. Jelaskan bahwa CSV tidak membedakan ketiganya.
- [x] Boolean/number aman menjadi teks biasa; string tidak di-trim. `__proto__`/`constructor` tetap data, tidak memodifikasi prototype.
- [x] Nested object/array: default error menyebut field/row; mode serialize memakai JSON text dalam satu cell, tanpa flatten otomatis.
- [x] CSV export: header wajib, delimiter pilihan, double-quote escaping, kutip cell yang mengandung delimiter/quote/CR/LF, CRLF antar-record, tanpa trailing newline.
- [x] Semicolon/tab adalah varian delimiter yang mengikuti aturan quoting yang sama; jangan menyebut varian ini persis RFC 4180.
- [x] CSV import: finite state machine atau parser teruji; jangan `split('\n')`/`split(',')`, karena field boleh memiliki newline/quote.
- [x] Terima record newline CRLF atau LF, optional satu newline final, serta satu UTF-8 BOM awal; pertahankan newline di quoted cell.
- [x] Tolak unclosed quote, quote di unquoted cell, karakter lain setelah closing quote sebelum delimiter/newline, dan jumlah cell yang tidak sama.
- [x] Baris pertama selalu header; tolak header kosong/duplikat. Jangan trim header/data otomatis; whitespace adalah data.
- [x] CSV→JSON semua cell menjadi string, termasuk `00123`, `true`, `1e3`, dan angka besar; tidak ada auto-type inference.
- [x] Header-only CSV menjadi `[]`; interior blank record dianggap record berisi satu empty cell, sehingga tunduk pada validasi jumlah kolom.
- [x] Bangun object output dengan `Object.fromEntries` atau own-property definition yang aman; jangan assign key pengguna ke `{}` secara naif.
- [x] Export JSON indentasi 2 spasi; preview hanya 20 row dengan keterangan total, bukan pemotongan data output.
- [x] CSV output punya checkbox `Escape spreadsheet formulas`, default ON, dan penjelasan bahwa mode ini mengubah cell berisiko.
- [x] Lindungi header dan string cell yang diawali `=`, `+`, `-`, `@`, tab, CR/LF, atau whitespace diikuti prefix formula; tambahkan apostrophe sebelum seluruh cell, lalu lakukan CSV quoting biasa.
- [x] Angka JSON asli negatif tetap numeric text; string `"-1"` di-escape saat mode ON. Mode OFF mempertahankan teks sumber dan menampilkan peringatan singkat sebelum copy/download.
- [x] Mode ini mengurangi risiko formula spreadsheet; jangan mengklaim perlindungan universal pada semua aplikasi atau round-trip identik ketika ON.
- [x] Table preview gunakan `textContent`; formula dan HTML tidak pernah dieksekusi. Copy/download mengambil output hasil sukses dengan pilihan safety yang sama.
- [x] Seluruh proses lokal tanpa telemetry/storage/query input; download `converted.csv` atau `converted.json` melalui helper shared.

## TODO SEO dan copy unik

- [x] Title: `JSON to CSV & CSV to JSON Converter — Edwin Lab`.
- [x] H1: `JSON ↔ CSV Converter`.
- [x] Meta description: `Convert JSON records to CSV or CSV to JSON locally in your browser. Choose delimiters, preview rows, and preserve numeric IDs as strings on CSV import.`
- [x] Intro: `Turn API records into a CSV table, or turn a CSV file into JSON records.`
- [x] Artikel statis: cara dua arah, contoh API records, union header, missing/null cells, delimiter, dan nested value modes.
- [x] Jelaskan CSV import selalu string, jadi leading zero ID tidak hilang; nesting tidak dipulihkan otomatis saat round-trip.
- [x] FAQ: `How are nested objects handled?`, `Why are CSV numbers imported as strings?`, `How are commas and line breaks escaped?`, `What does Escape spreadsheet formulas do?`.
- [x] Sasaran query: `JSON to CSV`, `CSV to JSON`, `convert JSON array to CSV`, `CSV preserve leading zeros` secara alami.
- [x] Terapkan canonical/OG/schema foundation; penjelasan bisa dibaca tanpa JS.
- [x] Related kandidat: `/jsonlint/` dan `/json-yaml-converter/`; aktifkan hanya setelah target terintegrasi.

## Fixture dan verifikasi wajib

Notasi newline pada fixture di bawah harus menjadi karakter newline sebenarnya dalam test.

- [x] JSON `[{"name":"Ada","age":30},{"name":"Lin","age":null}]` → `name,age\r\nAda,30\r\nLin,`.
- [x] JSON `[{"a":1},{"b":2}]` → `a,b\r\n1,\r\n,2`; `[]` → output kosong dan `0 rows`.
- [x] JSON `[{"note":"a,b"},{"note":"say \"hi\""}]` → `note\r\n"a,b"\r\n"say ""hi"""`.
- [x] CSV `id,note\r\n00123,"first\nsecond"` → `[{"id":"00123","note":"first\nsecond"}]`.
- [x] CSV `n,big,flag\n1e3,9007199254740993,true` → ketiga value string persis, tidak dibulatkan atau diubah tipe.
- [x] CSV `a,b\r\n1,2\r\n` → satu row; CSV `a,b` → `[]`; CSV kosong → error.
- [x] CSV `a,b\n1`, `a,a\n1,2`, `,b\n1,2`, `a\n"unterminated`, `a\nx"y` → error jelas.
- [x] CSV `a\n"x"tail` → error; BOM + `a\n1` → header `a`; semicolon/tab delimiter → hasil sesuai pilihan.
- [x] Nested input `[{"a":{"x":1}}]` default → error; serialize → `a\r\n"{""x"":1}"`.
- [x] JSON `[{"x":"=1+1"}]` safety ON → `x\r\n'=1+1`; OFF → `x\r\n=1+1` dengan peringatan UI.
- [x] Uji formula prefix di header, leading whitespace, tab, `+`, `-`, `@`; number `-1` berbeda dari string `"-1"` dalam safety mode.
- [x] `__proto__` header/key → own property dan prototype global bersih; cell HTML → hanya teks.
- [x] JSON numeric ID `9007199254740993` → error presisi; quoted ID dan CSV ID identik diterima.
- [x] >20 rows → preview 20, output tetap lengkap; ukuran >5 MiB/depth 101/output terlalu besar → error terkontrol.

## Definition of Done

- [x] Buka `/tests/tools/json-csv-converter.html` melalui HTTP lokal; seluruh tes browser-native lulus dan console bersih.
- [x] `git diff --check` lulus; perubahan terbatas pada ownership task.
- [x] Browser: direct load/refresh, dua arah, delimiter, nested mode, safety option, preview, copy/download, clear, dan stale state lulus.
- [x] Uji 390/1440 px, keyboard, no-JS content, console, dan Network tanpa pengiriman data input.
- [x] Laporkan hasil, dependency jika ada, limitation data loss yang dinyatakan UI, dan checklist selesai berdasarkan bukti.


## Hasil eksekusi

- Seluruh checklist selesai. Browser suite: **21/21 lulus**; QA manual mengonfirmasi JSON→CSV, CSV→JSON termasuk leading-zero ID dan newline dalam kutip, serta hasil lama dibersihkan saat input berubah.
- Tidak menambah dependency. CSV parsing memakai state machine lokal; semua cell CSV diimpor sebagai string, dan proteksi formula dapat mengubah teks ekspor saat aktif.

## Prompt siap tempel

```text
Implementasikan hanya docs/developer-tools/10-json-csv-converter.md setelah foundation selesai.
Baca README.md dan CONTRACT.md di folder dokumen. Ikuti ownership, semantik tipe/nesting, safety CSV, dan fixtures.
UI/copy Inggris, pure logic .js, static GitHub Pages tanpa framework/backend/build.
Jangan mengubah shared files, homepage, sitemap, package global, atau tool lain. Jangan deploy/push.
Selesaikan test dan browser review; laporkan hasil serta limitation yang tampil di UI.
```

Rujukan: [format CSV RFC 4180](https://www.rfc-editor.org/info/rfc4180/) dan [CSV injection OWASP](https://community.owasp.org/attacks/CSV_Injection). Verifikasi aturan library dari dokumentasi resminya jika memakai dependency.
