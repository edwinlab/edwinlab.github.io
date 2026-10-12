# 15 — Hash Generator (D02)

Status: **TODO — belum diimplementasikan**. Dokumen ini hanya rencana; seluruh checkbox eksekusi tetap terbuka.
Model: **GPT-6 Luna (`gpt-6-luna`), reasoning `medium`**. Penilaian berdasarkan scope dan fixture proyek, bukan benchmark.
Route: `/hash-generator/`. Canonical: `https://edwinlab.dev/hash-generator/`.

## Tujuan dan V1

Menghasilkan hash SHA-256, SHA-384, atau SHA-512 dari teks atau satu file lokal, memakai Web Crypto native browser. V1 menyediakan pilihan mode `Text`/`File`, pilihan algoritme default SHA-256, tombol eksplisit `Generate hash`, cancel, contoh teks sintetis, clear, output hexadecimal lowercase, copy hash, dan download `.txt`. UI/konten publik berbahasa Inggris.

Tidak termasuk MD5/SHA-1, HMAC, encryption/decryption, password hashing/KDF, signature verification, expected-hash comparison, batch files, fetch URL pengguna, streaming/chunked hashing, Base64 output, atau dependency kriptografi. Digest bukan enkripsi dan bukan bukti identitas/keaslian sumber file; jangan memasarkan SHA-2 langsung sebagai penyimpanan password.

Teknologi hanya HTML/CSS/JavaScript vanilla dan native ES modules. Tanpa npm/package.json, framework, bundler, transpiler, backend, atau build aplikasi. Task ini tidak memerlukan vendor baru/prerequisite jsdiff.

## Prasyarat dan file ownership

- [ ] Baca `README.md`, `CONTRACT.md`, `EXTENSION-CONTRACT.md`, instruksi repository, dan foundation 00 yang sudah selesai; periksa helper aktual.
- [ ] Buat `hash-generator/index.html`, `hash-generator/logic.js`, `hash-generator/tool.js`, dan `hash-generator/worker.js`.
- [ ] Buat `tests/tools/hash-generator.test.js` dan `tests/tools/hash-generator.html`, runner harness browser-native serta `noindex,nofollow`.
- [ ] Gunakan `/tools/shared/tools.css`; CSS khusus hanya `hash-generator/tool.css` bila benar-benar diperlukan.
- [ ] Gunakan signature aktual `setStatus(element,{kind,message})`, `copyText(text,statusElement)`, `downloadText(text,filename,mimeType)`, `assertTextSize(text,maxBytes)`, `MAX_TEXT_BYTES`, dan `MAX_OUTPUT_BYTES`.
- [ ] **Jangan memakai `readTextFile` untuk mode file**: helper itu decode UTF-8 fatal dan bukan jalur binary. File dibaca dengan `Blob.arrayBuffer()` setelah cek ukuran.
- [ ] Ownership Markdown tambahan: dokumen task ini dan **hanya row 15** dalam `docs/developer-tools/README.md` boleh diperbarui saat eksekusi sesuai `EXTENSION-CONTRACT.md`.
- [ ] Jangan edit shared helpers/vendor, tool lama, homepage/hub/registry, sitemap/robots, atau index tes bersama; task 24 mengurus integrasi file bersama.

## Keputusan API, input, dan limit

Web Crypto `digest` menerima buffer dan mendukung SHA-256/384/512; operasi tersedia dalam secure context dan worker, serta membutuhkan seluruh input dalam memori. Karena tidak streaming, file V1 dibatasi. [W3C Web Crypto SHA](https://www.w3.org/TR/webcrypto/#sha), [MDN digest](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest).

| Batas | Keputusan V1 |
|---|---|
| Text | Maksimum shared **5 MiB UTF-8**; empty string dan tepat batas diterima |
| File | Satu File/Blob maksimum **20 MiB = 20 × 1024 × 1024 bytes**, termasuk file kosong; tepat batas diterima |
| Deadline | **10.000 ms** sejak dispatch, termasuk worker startup/read/digest; cancel/timeout terminasi worker |
| Output | Lowercase hex sepanjang **64/96/128** karakter untuk SHA-256/384/512; download maksimum 129 UTF-8 bytes |
| Concurrency | Satu worker/request aktif; tidak ada batch/queue/background retry |

20 MiB adalah kebijakan batas memori produk, bukan jaminan performa. `arrayBuffer` dan digest dapat membutuhkan lebih dari satu buffer; jangan mengklaim footprint hanya sebesar file. Web Crypto tidak menyediakan AbortSignal digest; terminasi worker dan invalidasi request menghentikan konsumsi hasil, tanpa menjanjikan native operation/memori langsung terhapus.

## TODO logic, worker, dan UI

- [ ] Pure exports: `validateAlgorithm(name)` (allowlist tepat `SHA-256|SHA-384|SHA-512`), `encodeText(text)`, `bytesToHex(bytes)`, dan async `digestBytes(bytes,algorithm,digestFn)` dengan adapter native di produksi.
- [ ] Teks adalah **nilai textarea persis** yang di-encode `TextEncoder` UTF-8: jangan trim, menambah newline/BOM, case fold, atau normalisasi Unicode. Teks empty bukan error dan menghasilkan digest standar empty input.
- [ ] Tolak unpaired UTF-16 surrogate `INVALID_UNICODE` sebelum encoding agar tidak mengganti dengan U+FFFD diam-diam; pasangan surrogate valid/emoji diterima. Gunakan scan kompatibel, bukan mengharuskan API `isWellFormed()` baru.
- [ ] Jelaskan nilai API native textarea menormalkan line endings menjadi LF; mode file adalah jalur untuk hash byte asli termasuk CRLF/BOM. Jangan berjanji bahwa paste identik dengan bytes file sumber. [WHATWG textarea API value](https://html.spec.whatwg.org/multipage/form-elements.html#the-textarea-element).
- [ ] Encoding memakai native TextEncoder yang hanya menghasilkan UTF-8; penolakan surrogate adalah policy tambahan tool agar encoding tidak mengganti input malformed. [WHATWG TextEncoder](https://encoding.spec.whatwg.org/#interface-textencoder).
- [ ] Mode file menerima MIME/extension apa saja karena yang di-hash adalah bytes; nama, mtime, MIME, dan extension bukan bagian pesan hash. File binary dengan invalid UTF-8 tetap valid.
- [ ] Cek `file.size` sebelum `arrayBuffer`, termasuk di worker; reject di atas 20 MiB tanpa membaca. Nol byte menghasilkan hash yang sama dengan empty string.
- [ ] Dispatch snapshot string atau File yang dipilih dan algoritme ke dedicated **module worker** lokal. Worker memeriksa ulang mode/size/algorithm, membaca bytes, lalu `self.crypto.subtle.digest(algorithm,bytes)`.
- [ ] Periksa `isSecureContext`, `crypto.subtle?.digest`, dan Worker yang diperlukan. Jika tidak tersedia/gagal, tampilkan error yang menjelaskan HTTPS atau browser support; tidak memakai API server, hash JS pengganti, atau main-thread large-file fallback.
- [ ] Konversi ArrayBuffer digest dengan dua digit hex per byte (`toString(16).padStart(2,'0')`), tanpa bergantung pada `Uint8Array.toHex()` yang lebih baru; validasi panjang output sesuai algoritme.
- [ ] UI menampilkan algorithm label, lowercase digest selectable/read-only, dan bytes input yang benar. File name hanya `textContent`, jangan menyertakan raw file path.
- [ ] Proses hanya pada `Generate hash`; memilih file/algoritme atau mengetik tidak otomatis hashing. File mode tanpa file → `Choose a file first`; text mode empty tetap dapat diproses.
- [ ] Setiap request memiliki ID monotonic. Input edit, mode change, algoritme change, file replacement, contoh, clear, cancel, atau generate baru membersihkan hasil dan menginvalidasi request aktif.
- [ ] Khusus algoritme change saat digest pending: terminasi worker, bersihkan timer/status lama, dan nonaktifkan copy/download. Hash SHA-256 terlambat tidak boleh muncul di bawah label SHA-512.
- [ ] Respons/error/timeout lama hanya diabaikan; finalizers lama tidak mengubah tombol/status request baru. Terima hasil hanya bila request ID, mode, algoritme, dan snapshot tetap cocok.
- [ ] `Cancel`/timeout/error tidak menampilkan digest parsial; input/file selection dipertahankan kecuali Clear sengaja menghapusnya. Status processing indeterminate, jangan mengarang persentase progres native digest.
- [ ] Copy hanya hex **tanpa newline**, memakai `copyText`; download `hex + '\n'` dengan `downloadText` dan filename `sha256.txt`, `sha384.txt`, atau `sha512.txt` sesuai snapshot hasil.
- [ ] Copy/download nonaktif bila hasil belum ada/stale; jangan menyalin digest lama. Pastikan output size sebelum render/download walaupun format digest sangat kecil.
- [ ] Tidak ada input/hash pada URL, log persisten, local/session storage, riwayat, analytics/API, atau fetch user URL. Teks/file diproses lokal dan hanya input contoh sintetis digunakan.

## Fixture expected values

Nilai fixture berikut diperiksa saat perencanaan dengan Python `hashlib` sebagai referensi independen; implementasi dan runner tetap hanya Web Crypto browser. Jangan mengganti assertion dengan snapshot dari fungsi yang diuji.

| Input UTF-8 | Algoritme | Hex expected |
|---|---|---|
| `""` | SHA-256 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `""` | SHA-384 | `38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b` |
| `""` | SHA-512 | `cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e` |
| `"abc"` | SHA-256 | `ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad` |
| `"abc"` | SHA-384 | `cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7` |
| `"abc"` | SHA-512 | `ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f` |

## Fixture dan browser-native tests wajib

- [ ] Semua enam vector tabel lulus terhadap `crypto.subtle.digest` asli lewat harness async; hasil lowercase dan panjang 64/96/128.
- [ ] SHA-256 `"abc\n"` → `edeaaff3f1774ad2888673770c6d64097e391bc362d7d6fb34982ddf0efd18cb`, berbeda dari `"abc"`; whitespace depan/belakang tidak di-trim.
- [ ] UTF-8 `"é"` bytes `[0xc3,0xa9]` → SHA-256 `4a99557e4033c3539de2eb65472017cad5f9557f7a0625a09f1c3f6e2ba69c4c`; `"e\u0301"` bytes `[0x65,0xcc,0x81]` → `bf12767b0f2a56b2190075bae8169f656e3ce8d6357d4aff184bc6c7ea48f9f6`.
- [ ] Emoji `"😀"` encoded bytes tepat `[0xf0,0x9f,0x98,0x80]`; lone high/low surrogate ditolak sebelum `digestFn` dipanggil.
- [ ] File bytes `[0x00,0xff,0x80,0x0a]` → SHA-256 `6d6f7836f1e146dc0204afb5133dae52fdc05603d8ac2dc793b481b0e0829fd1`; invalid UTF-8 tidak menghalangi hash.
- [ ] `new File([new Uint8Array([0x61,0x62,0x63])],'a.bin')` dan nama/MIME lain dengan bytes sama → vector `abc`; file kosong → vector empty. File CRLF/BOM bytes tidak didecode/ditulis ulang.
- [ ] `bytesToHex([0x00,0x01,0x0a,0xff])` → `00010aff`; output leading zero tidak hilang.
- [ ] Algorithm `SHA-1`, `MD5`, `sha256`, empty, atau input object tak dipercaya ditolak sebelum adapter digest; kontrol DOM tidak dapat meloloskan nama algoritme arbitrary.
- [ ] Text tepat 5 MiB diterima; satu byte lebih dan multibyte yang melampaui limit ditolak. File tepat 20 MiB diterima; 20 MiB+1 ditolak tanpa `arrayBuffer()`/digest dipanggil.
- [ ] Stub digest unavailable/rejection → error spesifik tanpa output; stub read rejection → error read tanpa menghapus input pengguna. Native worker digest smoke test untuk text dan file.
- [ ] Deferred request A di SHA-256, change to SHA-512 lalu B sukses: hanya B boleh tampil/copy/download; delayed A success/error tidak mengubah status B.
- [ ] File A read pending lalu pilih B, mode switch, clear, cancel, generate ulang, dan deadline 10 s → request lama invalid. Uji timer dengan fixture driver bounded, bukan menunggu hashing file sangat besar.
- [ ] Download SHA-256 `abc` berisi tepat `ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad\n`; copy berisi hash tanpa newline dan tanpa label.
- [ ] File name `<img src=x onerror=alert(1)>.bin` tampil literal, tanpa elemen/event HTML.

## SEO dan konten statis

- [ ] Title: `SHA Hash Generator — SHA-256, SHA-384 & SHA-512 | Edwin Lab`; H1: `Hash Generator`.
- [ ] Description: `Generate SHA-256, SHA-384, and SHA-512 hashes from text or a local file in your browser. Copy a lowercase hex digest without uploading your input.`
- [ ] Canonical/OG URL `https://edwinlab.dev/hash-generator/`, `lang="en"`, viewport, favicon, logo/OG image lokal, noscript, HTML awal, dan breadcrumb `Home → Developer Tools → Hash Generator` mengikuti kontrak.
- [ ] Panduan mode text/file → pilih algoritme → generate → copy/download; contoh statis SHA-256 `abc` memakai vector di atas.
- [ ] FAQ: `Is an empty string valid?`, `Are files uploaded?`, `Does a filename affect the hash?`, `Why do line endings change a hash?`, `Is hashing the same as encryption?`.
- [ ] Jelaskan UTF-8 tanpa normalisasi tool, native textarea line endings, raw file bytes, secure-context support, batas file/non-streaming, dan output lengths.
- [ ] Related kandidat `/base64/`, `/password-generator/`, `/tools/`; target baru hanya ditautkan setelah siap oleh integrasi batch baru.

## Definition of done dan catatan eksekusi

- [ ] Semua fixture penting `/tests/tools/hash-generator.html` lulus di browser melalui HTTP lokal/secure localhost; catat count lulus/gagal dan browser support aktual.
- [ ] QA direct route+refresh, empty text, Unicode, binary/empty file, mode/algorithm change saat pending, cancel, clear, clipboard aktual, download beserta isi, dan crypto unavailable/error.
- [ ] QA keyboard/focus/labels/live status, 320/390/768/1440 px, no-JS content, console bersih, dan Network tanpa input/file upload. Tidak ada persentase progres atau streaming claim palsu.
- [ ] `git diff --check` lulus; file berubah hanya ownership task. Browser yang tidak dapat diuji dicatat belum terverifikasi, bukan dicentang selesai.
- [ ] Perbarui checkbox/catatan QA task ini dan **hanya row 15** README tracker berdasarkan bukti; gunakan status sebagian jika QA belum lulus. Menu/hub/sitemap/index tes bersama tetap milik task 24.
- [ ] Laporkan files, fixtures, browser QA, limit, dan keterbatasan; jangan commit, push, publish, atau deploy.

## Prompt eksekusi siap tempel

```text
Implementasikan hanya docs/developer-tools/15-hash-generator.md (D02), memakai GPT-6 Luna reasoning medium.
Baca README.md, CONTRACT.md, EXTENSION-CONTRACT.md, instruksi repo, dan API shared aktual; foundation 00 harus selesai.
Hanya HTML/CSS/JS vanilla, native ES modules dan Web Crypto crypto.subtle.digest; tanpa dependency/npm/build/backend atau hash JS/server fallback.
V1 SHA-256/384/512 text atau satu file. Empty text/file valid. Text adalah UTF-8 nilai textarea tanpa trim/normalisasi; reject unpaired surrogates dan jelaskan textarea newline behavior. File raw bytes via arrayBuffer, jangan readTextFile.
Text max5 MiB, file max20 MiB sebelum baca, module worker deadline10 s, output lowercase hex64/96/128.
Semua input/mode/file/algorithm changes invalidate pending/result; request lama tidak boleh muncul setelah algorithm berubah. Native digest non-streaming dan tanpa AbortSignal; terminate worker/cancel consumer dengan jujur.
Bangun copy/download, English UI/SEO statis, exact vectors, browser-native tests, QA dan git diff --check.
Update checklist/catatan task serta hanya row15 README tracker dengan hasil aktual/keterbatasan. Jangan edit shared/vendor/tool lama/menu/sitemap/index tes bersama; jangan commit/push/deploy.
```
