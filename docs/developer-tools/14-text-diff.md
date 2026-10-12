# 14 — Text Diff (D01)

Status: **belum dikerjakan; prasyarat 14a tidak dapat diverifikasi karena registry tidak bisa di-resolve dari workspace.** Dokumen ini hanya rencana; seluruh checkbox eksekusi tetap terbuka.
Model: **GPT-6 Luna (`gpt-6-luna`), reasoning `high`**. Penilaian berdasarkan scope dan fixture proyek, bukan benchmark.
Route: `/text-diff/`. Canonical: `https://edwinlab.dev/text-diff/`.

## Tujuan dan V1

Membandingkan dua teks yang ditempel pengguna secara lokal, per baris, untuk melihat baris added, removed, dan unchanged. V1 menyediakan dua textarea, compare, swap, contoh sintetis, clear, hasil unified dengan nomor baris asal/baru, ringkasan, copy laporan, dan download laporan `.txt`. UI/konten publik berbahasa Inggris.

V1 tidak mencakup word/character diff, ignore-whitespace, normalisasi case/Unicode, file upload, syntax highlighting, editor merge, Git/unified patch, fuzzy matching, atau semantic JSON diff. Jangan menyebut laporan sebagai patch yang dapat diterapkan. Nilai API native textarea menormalkan line endings menjadi LF; jelaskan bahwa tool membandingkan nilai textarea yang terlihat, bukan menjanjikan perbandingan byte file asli. Tab, spasi, empty lines, dan final newline dalam nilai tersebut tetap berarti. [WHATWG textarea API value](https://html.spec.whatwg.org/multipage/form-elements.html#the-textarea-element).

Teknologi hanya HTML, CSS, JavaScript vanilla, native ES modules, dan jsdiff lokal siap browser. Tanpa npm/package.json, framework, bundler, transpiler, backend, atau build aplikasi.

## Prasyarat dan kepemilikan

- [ ] Baca `README.md`, `CONTRACT.md`, `EXTENSION-CONTRACT.md`, instruksi repository, dan file shared aktual; foundation 00 sudah selesai tetapi kontraknya tetap harus diperiksa.
- [ ] Selesaikan tahap jsdiff pada [14a — Library Readiness](14a-library-readiness.md) terlebih dahulu: versi tepat dari distribusi resmi siap browser, license, provenance, checksum, dan smoke test page/worker. Jika belum siap atau API gagal, laporkan blocker ke prerequisite; jangan membuat algoritme diff ad hoc.
- [ ] Periksa path vendor yang ditetapkan 14a. Rencana menggunakan `/tools/vendor/jsdiff/diff.js`, global `Diff.diffArrays`, dan dedicated classic worker; jika path aktual berbeda, selaraskan hanya import milik tool ini.
- [ ] Buat hanya `text-diff/index.html`, `text-diff/logic.js`, `text-diff/tool.js`, `text-diff/worker.js`, serta `text-diff/tool.css` bila kebutuhan diff tidak bisa memakai shared CSS.
- [ ] Buat hanya `tests/tools/text-diff.test.js` dan `tests/tools/text-diff.html`; runner memakai `tests/tools/harness.js` dan `noindex,nofollow`.
- [ ] Gunakan `/tools/shared/tools.css`, `setStatus(element,{kind,message})`, `copyText(text,statusElement)`, `downloadText(text,filename,mimeType)`, `assertTextSize(text,maxBytes)`, dan `MAX_OUTPUT_BYTES` dari shared aktual.
- [ ] Ownership Markdown tambahan: dokumen task ini dan **hanya row 14 miliknya** dalam `docs/developer-tools/README.md` boleh diperbarui saat eksekusi sesuai `EXTENSION-CONTRACT.md`.
- [ ] Jangan mengubah shared helpers/vendor, tool lama, homepage, hub/registry, sitemap/robots, atau index tes bersama. Prerequisite 14a mengurus vendor; task 24 mengurus integrasi file bersama.

## Keputusan algoritme dan limit

Keputusan V1 adalah jsdiff `diffArrays` dengan token baris buatan tool dan equality eksak. README resmi mendokumentasikan distribusi browser global `Diff`, array token custom, serta opsi `timeout` dan `maxEditLength` yang mengembalikan `undefined` jika dibatasi. Ini membuktikan jalur tanpa build layak; versi/path yang benar-benar dipakai masih harus diverifikasi 14a. [jsdiff README resmi](https://github.com/kpdecker/jsdiff/blob/master/README.md).

| Batas | Keputusan V1 |
|---|---|
| Input | Gabungan kiri + kanan maksimum **512 KiB UTF-8**; tepat batas diterima |
| Baris | Maksimum **5.000 token baris total** dari kedua input; tepat batas diterima |
| Kerja diff | `maxEditLength: 2000`, `timeout: 3000` ms; kegagalan abortable adalah error terkontrol, bukan hasil kosong |
| Deadline worker | **4.000 ms** sejak dispatch; batalkan/terminasi jika habis, tidak mencoba ulang otomatis |
| Output | Maksimum shared **10 MiB UTF-8** untuk laporan dan serialized result sebelum render/copy/download |
| Render | Semua row hasil dalam batas 5.000 token input; tidak menampilkan laporan sebagian sebagai lengkap |

Limit tersebut adalah kebijakan produk, bukan perkiraan waktu yang dijamin untuk semua perangkat. Periksa bytes dan hitung token dengan scan berbatas sebelum alokasi array besar; jangan membangun tabel LCS berukuran N × M. Gunakan precheck panjang code units untuk input jelas terlalu besar, kemudian `assertTextSize` pada gabungan dengan limit lokal. Empty input valid; dua input kosong berarti tidak ada perbedaan.

## TODO logic, worker, dan UI

- [ ] Definisikan pure exports `tokenizeLines(text)`, `compareText(left,right,{diffArrays})`, dan `formatDiffReport(result)`; injeksi engine hanya adapter/tes, bukan pilihan di UI.
- [ ] Token berbentuk `{text, ending}` dengan `ending` tepat `LF|CRLF|CR|NONE`. Scan CRLF sebagai satu terminator, kemudian LF/CR; `""` → `[]`, `"\n"` → satu token empty dengan `LF`, `"a\n"` tidak membuat token empty palsu di EOF.
- [ ] Comparator harus membandingkan `text` dan `ending` persis; tidak trim, sort, collapse whitespace, normalisasi Unicode, atau mengabaikan akhir baris secara diam-diam.
- [ ] Panggil `diffArrays` secara sinkron **di worker**, dengan comparator dan limit di atas. `undefined` → error `DIFF_LIMIT`; dependency yang tidak tersedia → `DEPENDENCY_UNAVAILABLE`; worker timeout → `TIMEOUT`.
- [ ] Worker classic memuat **path lokal tetap** lewat `importScripts`, lalu `import('./logic.js')` untuk pure ES module; tidak memakai `importScripts` dalam module worker. Prerequisite/browser test harus membuktikan kombinasi ini berjalan sebelum task diterima.
- [ ] Jika Worker/import/dependency tidak tersedia, tampilkan error spesifik dan jangan menjalankan diff berat di main thread. Worker URL/import tidak berasal dari input pengguna.
- [ ] Normalisasi output engine ke rows `{kind, oldLine, newLine, text, ending}`; kind `unchanged|removed|added`, nomor 1-based atau `null` untuk sisi missing. Replacement ditampilkan removed kemudian added; jangan mengklaim sebagai move detection.
- [ ] Saat satu blok berisi removed dan added berdekatan, pertahankan urutan sumber di masing-masing sisi dan tampilkan removed sebelum added secara deterministik. Invariant: unchanged + removed merekonstruksi kiri dan unchanged + added merekonstruksi kanan persis.
- [ ] Ringkasan memakai jumlah **baris** added/removed/unchanged; satu replacement adalah satu removed + satu added. Equal empty input tetap success dengan `No differences found`.
- [ ] Render row dengan simbol/label `+ Added`, `− Removed`, `Unchanged`, nomor baris, dan teks lewat `textContent`; warna hanya bantuan. EOL badge `LF`, `CRLF`, `CR`, atau `No final newline` membantu melihat perbedaan yang tidak tampak.
- [ ] Laporan plain text berisi ringkasan, lalu satu row per token: prefix `  `, `- `, atau `+ ` diikuti teks asli dan `\n`; token `NONE` diikuti marker `\\ No newline at end of input`. Bagian metadata menjelaskan line endings; format bukan Git patch.
- [ ] Bila token berisi CRLF/CR, tulis badge ending eksplisit dalam metadata/row report tanpa mengubah payload token yang dipakai rekontruksi. Copy/download tidak boleh menyebut hasil byte-identical source file.
- [ ] Layout textarea berdampingan di desktop dan bertumpuk pada mobile; diff output memiliki scroll container sendiri, long line tidak memperlebar halaman.
- [ ] Tombol `Compare text`, `Swap`, `Load example`, `Clear`, `Cancel`, `Copy report`, dan `Download .txt`; proses hanya saat tindakan pengguna, tidak setiap keystroke.
- [ ] Setiap dispatch memakai request ID monotonic dan snapshot input. Input edit, swap, contoh, clear, cancel, atau compare baru invalidasi output, nonaktifkan copy/download, dan terminasi worker aktif.
- [ ] Terima response hanya jika request ID dan worker masih aktif; response/error/finally lama tidak boleh memulihkan output/status/buttons milik request baru. Timer lama dibersihkan pada semua jalur selesai.
- [ ] Worker error/timeout mempertahankan input pengguna dan menghapus hasil lama; tidak ada output sebagian atau pesan `No differences found` pada abort.
- [ ] Copy memakai `copyText`; download `downloadText(report,'text-diff-report.txt','text/plain;charset=utf-8')`. Feedback sukses hanya setelah operasi terkait berhasil; fallback clipboard adalah seleksi manual.
- [ ] Tidak ada telemetry, request pemrosesan input, persistence, input pada query/hash URL, eval, atau interpolasi input lewat `innerHTML`. Contoh hanya teks sintetis.

`importScripts` hanya berlaku untuk classic workers; dynamic import dapat digunakan di dedicated worker. Gabungan ini tetap perlu smoke test dengan vendor yang dipin. [MDN importScripts](https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/importScripts), [MDN dynamic import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import).

## Fixture dan browser-native tests

Notasi fixture row: `kind(oldLine,newLine,text,ending)`; `null` berarti tidak ada nomor sisi itu.

- [ ] `""` vs `""` → `[]`, added/removed/unchanged semuanya 0, `No differences found`.
- [ ] `"alpha\n"` vs `"alpha\n"` → `unchanged(1,1,"alpha",LF)`, ringkasan 0/0/1.
- [ ] `"alpha\nbeta\n"` vs `"alpha\ngamma\n"` → unchanged alpha `(1,1)`, removed beta `(2,null)`, added gamma `(null,2)`, semua `LF`; ringkasan 1/1/1.
- [ ] `""` vs `"x"` → `added(null,1,"x",NONE)`; arah sebaliknya tepat satu removed. Report row `+ x\n\\ No newline at end of input\n` atau `- x\n\\ No newline at end of input\n` setelah header.
- [ ] `"a\n"` vs `"a"` → removed `(1,null,"a",LF)` dan added `(null,1,"a",NONE)`; bukan equal.
- [ ] Tokenize `"a\r\nb\rc\n"` → `[{text:"a",ending:"CRLF"},{text:"b",ending:"CR"},{text:"c",ending:"LF"}]`; tokenize `"\n\n"` menghasilkan tepat dua token kosong `LF`.
- [ ] `"a\r\n"` vs `"a\n"` pada pure API → satu removed `CRLF` + satu added `LF`. UI paste diuji terpisah mengikuti normalisasi textarea, tanpa klaim mempertahankan bytes paste.
- [ ] `"a b\n"` vs `"a  b\n"`, `"\ta\n"` vs `" a\n"`, serta `"é\n"` vs `"e\u0301\n"` → berbeda, tidak trim/normalisasi.
- [ ] Repeated lines fixture `"a\na\nb\n"` vs `"a\nb\n"` tidak menuntut tie-break nomor tertentu; verifikasi edit count 1 removed, urutan sumber, dan kedua invariant rekonstruksi.
- [ ] Payload `<img src=x onerror=alert(1)>` muncul literal; DOM tidak membuat elemen img dan tidak menjalankan event.
- [ ] Gabungan tepat 512 KiB diterima dengan line budget valid; byte berikutnya ditolak `INPUT_TOO_LARGE`, termasuk input multibyte. 5.000 token total diterima; 5.001 → `LINE_LIMIT` sebelum engine dipanggil.
- [ ] Engine stub returning `undefined` → `DIFF_LIMIT`, tanpa rows/copy/download. Real library compare 1.001 line unik di tiap sisi → edit distance 2.002 melebihi limit, error terkontrol.
- [ ] Suite async melalui harness memeriksa worker sukses, cancel/timeout, missing dependency/import error, request A terlambat setelah B, dan edit/swap/clear saat worker berjalan.
- [ ] Semua sukses memenuhi rekonstruksi kiri/kanan dan panjang UTF-8 output; output-limit helper diuji dengan fixture buatan sebelum render, bukan alokasi file raksasa.

## SEO dan konten statis

- [ ] Title: `Text Diff — Compare Text Line by Line | Edwin Lab`; H1: `Text Diff`.
- [ ] Description: `Compare two texts line by line in your browser. See added and removed lines, copy a readable report, or download the result without uploading your text.`
- [ ] Canonical/OG URL `https://edwinlab.dev/text-diff/`, `lang="en"`, viewport, favicon, logo/OG image lokal yang sudah ada, satu H1, noscript, dan breadcrumb `Home → Developer Tools → Text Diff` mengikuti kontrak.
- [ ] Intro membahas membandingkan config, log sintetis, atau revisi catatan; panduan paste kedua teks → compare → copy/download.
- [ ] FAQ unik: `Does whitespace matter?`, `Can I compare empty text?`, `What does “No final newline” mean?`, `Why can a large comparison stop?`.
- [ ] Jelaskan scope per baris, normalisasi textarea, limit, replacement removed+added, dan laporan bukan patch; tidak menjanjikan deteksi move/semantic perubahan kode.
- [ ] Related kandidat `/json-diff/` dan `/tools/`; shared related links/registry/sitemap hanya dikerjakan integrasi batch baru setelah tool siap.

## Definition of done dan catatan eksekusi

- [ ] Semua fixture penting `/tests/tools/text-diff.html` lulus melalui HTTP lokal; catat jumlah lulus/gagal, vendor/version aktual, dan batas yang teruji.
- [ ] QA direct route+refresh, compare/swap/example/clear/cancel/stale, actual clipboard, download beserta isi, dan error/timeout di browser; console bersih dan Network tidak mengirim input.
- [ ] QA keyboard/focus/labels/live status, 320/390/768/1440 px, long lines, dan konten tanpa JavaScript; jika browser tidak dapat diuji, tandai belum terverifikasi dan jangan centang selesai.
- [ ] `git diff --check` lulus; file berubah hanya ownership di atas. Pertahankan implementasi 00–13 dan perubahan pengguna.
- [ ] Perbarui checkbox/catatan QA **dokumen task ini** dan **hanya row 14** dalam tracker README berdasarkan bukti. Gunakan status sebagian bila dependency/QA belum lulus; menu/sitemap/index tes bersama tetap ownership task 24.
- [ ] Laporkan files, fixtures, QA, dependency/version, limit, dan risiko tersisa. Jangan commit, push, publish, atau deploy.

## Prompt eksekusi siap tempel

```text
Implementasikan hanya docs/developer-tools/14-text-diff.md (D01), memakai GPT-6 Luna reasoning high.
Baca README.md, CONTRACT.md, EXTENSION-CONTRACT.md, instruksi repo, serta API shared aktual. Pastikan 00 selesai dan tahap jsdiff docs/developer-tools/14a-library-readiness.md selesai.
Gunakan HTML/CSS/JS vanilla tanpa npm/framework/build/backend. Ikuti ownership: folder text-diff, dua tes miliknya, catatan/checklist task, dan hanya row14 dalam README tracker.
V1 line diff paste-only; token dan whitespace eksak, final newline berarti, native textarea normalization dijelaskan.
Gunakan Diff.diffArrays lokal dalam classic dedicated worker dengan importScripts dan fixed dynamic import logic.js; tidak ada algoritme diff pengganti/main-thread fallback.
Batas gabungan 512 KiB, 5.000 tokens, edit distance 2.000, engine 3 s/main deadline 4 s, output 10 MiB. Abort adalah error, bukan hasil kosong.
Implementasikan request IDs/cancel/stale protection, safe text render, report copy/download, English UI dan SEO statis sesuai TODO.
Jalankan browser-native fixture, browser QA, dan git diff --check; update checklist/catatan task serta hanya row14 README dengan hasil aktual dan keterbatasan.
Jangan ubah shared/vendor, tool lama, menu/hub/sitemap/robots/index tes bersama. Jangan commit/push/deploy.
```
