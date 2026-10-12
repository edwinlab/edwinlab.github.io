# 16 — Password Generator (D03)

Status: **TODO — belum diimplementasikan**. Dokumen ini hanya rencana; seluruh checkbox eksekusi tetap terbuka.
Model: **GPT-6 Luna (`gpt-6-luna`), reasoning `high`**. Penilaian berdasarkan scope dan fixture proyek, bukan benchmark.
Route: `/password-generator/`. Canonical: `https://edwinlab.dev/password-generator/`.

## Tujuan dan V1

Menghasilkan password acak secara lokal dengan `crypto.getRandomValues`, panjang yang dipilih, dan kelompok karakter eksplisit. V1 menyediakan length default 20, count default 1, checkbox lowercase/uppercase/digits/symbols (semua default aktif), opsi `Exclude similar characters` default off, Generate, Cancel, Clear, output selectable/read-only satu per baris, dan Copy all. Setiap password memuat minimal satu karakter dari setiap kelompok yang dipilih. UI/konten publik berbahasa Inggris.

Tidak mencakup strength meter/entropy score, estimasi waktu cracking, passphrase/dictionary, pola custom, password checker/breach API, seed/RNG selector, URL/API generation, history, persistence, export/download password file, auto-copy, account login, atau klaim unbreakable/guaranteed secure. Panjang default dan aturan kelompok adalah kebijakan tool, bukan jaminan kompatibilitas dengan kebijakan semua situs.

Teknologi hanya HTML/CSS/JavaScript vanilla, native ES modules dan Web Crypto. Tanpa npm/package.json, framework, bundler, transpiler, backend, atau build aplikasi. Tidak perlu dependency vendor baru.

## Prasyarat dan file ownership

- [ ] Baca `README.md`, `CONTRACT.md`, `EXTENSION-CONTRACT.md`, instruksi repository, dan foundation 00; periksa shared helpers aktual.
- [ ] Buat `password-generator/index.html`, `password-generator/logic.js`, `password-generator/tool.js`, dan `password-generator/worker.js`.
- [ ] Buat `tests/tools/password-generator.test.js` dan `tests/tools/password-generator.html`, harness browser-native serta `noindex,nofollow`.
- [ ] Gunakan `/tools/shared/tools.css`, `setStatus(element,{kind,message})`, `copyText(text,statusElement)`, `assertTextSize(text,maxBytes)`, dan `MAX_OUTPUT_BYTES`. CSS khusus hanya di folder tool bila perlu.
- [ ] Ownership Markdown tambahan: dokumen task ini dan **hanya row 16** dalam `docs/developer-tools/README.md` boleh diperbarui saat eksekusi sesuai `EXTENSION-CONTRACT.md`.
- [ ] Jangan edit shared helpers/vendor, tool lama, homepage/hub/registry, sitemap/robots, atau index tes bersama. Task 24 mengurus integrasi file bersama.

## Alphabet, policy, dan limit tetap

`getRandomValues` menyediakan nilai random berbasis crypto dan membatasi satu panggilan maksimum 65.536 bytes. V1 menggunakan buffer `Uint32Array(256)` (1.024 bytes per refill); tidak memakai `Math.random`. [W3C getRandomValues](https://www.w3.org/TR/webcrypto/#Crypto-method-getRandomValues), [MDN getRandomValues](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues).

Urutan alphabet deterministik berikut menjadi kontrak, bukan user input. Gabungkan hanya kelompok aktif dalam urutan tabel, lalu filter similar characters bila dipilih; semua karakter ASCII dan unik.

| Kelompok | Alphabet V1 | Jumlah |
|---|---|---|
| Lowercase | `abcdefghijklmnopqrstuvwxyz` | 26 |
| Uppercase | `ABCDEFGHIJKLMNOPQRSTUVWXYZ` | 26 |
| Digits | `0123456789` | 10 |
| Symbols | `!@#$%^&*()-_=+[]{};:,.?/` | 24 |

`Exclude similar characters` menghapus tepat `0`, `O`, `1`, `I`, `l` (case-sensitive). Setelah filter: lowercase 25, uppercase 24, digits 8, symbols 24; union semua kelompok 81, tanpa filter 86. Jangan diam-diam membuang karakter lain atau menjanjikan filter mencakup semua glyph yang mirip pada semua font.

| Batas | Keputusan V1 |
|---|---|
| Length | Integer ASCII desimal **8–128**, default 20 |
| Count | Integer ASCII desimal **1–100**, default 1 |
| Pilihan | Minimal satu kelompok non-empty; tiap password wajib mencakup setiap kelompok aktif setelah filter |
| Input kontrol | Periksa raw length/count maksimum **32 UTF-8 bytes masing-masing** sebelum trim/parse |
| Work | Maksimum **256 candidate/password**, **65.536 uint32 draws/batch** (termasuk samples ditolak) |
| Worker | Satu module worker/request; deadline **2.000 ms** sejak dispatch, cancel terminasi worker |
| Output | Maksimum **12.899 ASCII bytes** (100 × 128 + 99 newline), dan guard shared 10 MiB |

Tepat batas diterima. Numeric parser menerima tepi whitespace dengan trim dan leading zeros (`008` → 8, `001` → 1), tetapi menolak empty, tanda, decimal, exponent, suffix, dan internal spaces. Pilihan invalid harus gagal sebelum sumber randomness dipanggil. Limit candidate/draw/deadline menghasilkan error penuh tanpa batch sebagian; tidak mencoba ulang otomatis.

## Keputusan sampling dan pure API

Keputusan sampling berikut adalah rancangan proyek agar distribusi tidak bias oleh modulo atau pemaksaan kelompok.

- [ ] Export pure `validateOptions(rawOptions)`, `buildGroups(options)`, `uniformIndex(n,nextUint32,budget)`, `generatePasswords(options,nextUint32)`, dan `serializePasswords(passwords)`; state RNG/budget diisolasi per request.
- [ ] Adapter produksi memakai `self.crypto.getRandomValues` dan buffered `Uint32Array(256)`, dengan binding yang benar. Tidak ada fallback Math.random, waktu, counters, seeded PRNG, password contoh, atau API server.
- [ ] Setiap `nextUint32()` harus menghasilkan integer 0–4.294.967.295; fixture adapter invalid/out-of-range → error terkontrol. Injeksi hanya melalui pure function untuk tes/adapter tetap, tidak ditautkan ke UI/query/hash.
- [ ] Untuk alphabet n, tetapkan `range = 2 ** 32` dan `ceiling = Math.floor(range/n)*n` menggunakan Number biasa, **bukan bitwise** yang membuat 2³² wrap ke nol. Sampel `x >= ceiling` ditolak; hanya `x < ceiling` memakai `x % n`.
- [ ] Setiap draw, termasuk rejection, memakai satu slot budget 65.536. `uniformIndex` tidak memiliki loop tak berbatas; budget habis → `RNG_LIMIT`.
- [ ] Bangun kandidat length karakter independen dari union alphabet aktif melalui `uniformIndex`. Jika satu kelompok aktif belum hadir, **buang seluruh kandidat** dan buat kandidat baru; terima hanya kandidat yang memenuhi semua kelompok.
- [ ] Jangan preseed satu karakter per kelompok, overwrite karakter setelah sampling, atau shuffle kandidat yang sudah dipaksa. Whole-candidate rejection menghasilkan distribusi seragam bersyarat pada policy yang dipilih; jangan menampilkan angka entropy dari `length*log2(alphabet)` sebagai jaminan policy ini.
- [ ] Per-password maksimal 256 kandidat; exhaustion → `POLICY_LIMIT`. Semua output harus dibuat sukses sebelum return; bila salah satu gagal, tidak return batch sebagian.
- [ ] Non-selected characters dilarang; selected groups diperiksa terhadap alphabet **setelah** filter. Length/count divalidasi dahulu; V1 min8 lebih besar daripada maksimum4 kelompok.
- [ ] Jangan deduplikasi output atau memberi jaminan uniqueness; duplikat tetap mungkin, dan pengulangan karakter di password valid. Jangan menganggap uniform frequencies dari satu batch sebagai bukti keamanan.

## TODO worker, UI, dan privasi

- [ ] Jalankan generation di module worker lokal dengan opsi snapshot/request ID; worker mengulang validasi opsi dan hanya mengirim satu hasil sukses penuh atau error terkontrol.
- [ ] Jika crypto/Worker tidak tersedia atau crypto melempar, tampilkan error dan output kosong; tidak memberikan fallback password. Worker URL/import tidak berasal dari pengguna.
- [ ] Proses hanya pada `Generate passwords`; jangan generate otomatis saat page load, keystroke, checkbox change, atau reset. Kontrol valid, requirement kelompok, dan batas ditampilkan dekat area kerja.
- [ ] Semua perubahan length/count/kelompok/filter menginvalidasi hasil, menonaktifkan Copy, dan membatalkan worker aktif. Generate baru, Clear, atau Cancel juga meningkatkan request ID dan terminasi worker/timer sebelumnya.
- [ ] Response/error/finally lama tidak mengubah hasil/status/tombol request baru. Deadline main thread 2 s menghasilkan error, tanpa hasil parsial.
- [ ] Generate sukses mengganti batch lama. Output satu password per baris **tanpa trailing newline**, hanya `.value`/`textContent`, `spellcheck=false` dan autocomplete off; plaintext selectable untuk copy manual.
- [ ] `Copy all` memakai `copyText(serialized,statusElement)`; success hanya sesudah clipboard berhasil, rejection memberi instruksi copy manual. Tidak otomatis copy atau mencoba membaca clipboard.
- [ ] Clear menghapus output dan referensi password di state, mempertahankan/reset kontrol secara eksplisit ke defaults, serta status idle. Jelaskan clear tidak menghapus isi clipboard setelah pengguna memilih Copy; jangan mengklaim secure memory wipe dari JavaScript.
- [ ] Contoh statis hanya menjelaskan pilihan alphabet/length; jangan menampilkan password statis seolah hasil acak baru dan jangan memasukkan data akun nyata.
- [ ] Tidak ada telemetry, input/output pada URL, local/session storage, history, export/download, console logging password, service worker cache input, API, atau network request saat generation. Jangan mengklaim kontrol atas clipboard manager/browser extension pengguna.
- [ ] Label semua kontrol/output, live status, focus terlihat; tombol dan checkbox native, bisa keyboard, layout tidak overflow pada 320 px. Error mempertahankan pilihan pengguna untuk diperbaiki.

## Fixture dan browser-native tests wajib

Nilai uint32 fixture adalah angka kecil yang sengaja dipilih agar exact expected output dapat diperiksa; ini **bukan** sumber randomness produksi.

- [ ] Length `8`,`128`,`008`,` 20 ` dan count `1`,`100`,`001`,` 2 ` valid; `7`,`129`,`0`,`101`,`-1`,`1.5`,`1e2`,`2abc`, whitespace-only, empty, internal spaces, serta raw control >32 bytes ditolak sebelum RNG dipanggil.
- [ ] Tanpa kelompok → `INVALID_OPTIONS`; semua kelompok aktif union string sama dengan tabel, length86; filter aktif length81 dan tidak mengandung `[0O1Il]`.
- [ ] `uniformIndex(10)` dengan draws `[4294967295,4294967290,4294967289]` → index `9`, tepat tiga draws; ceiling4294967290, dua nilai awal ditolak.
- [ ] `uniformIndex(3)` draws `[4294967295,2]` → `2`, dua draws; `uniformIndex(1)` dengan4294967295 → `0`, satu draw dan tidak wrap ceiling.
- [ ] Lowercase saja length8, count1, nextUint32 selalu0 → tepat `aaaaaaaa`; repeated chars valid.
- [ ] Semua kelompok tanpa filter length8, count1, draws `[0,26,52,62,0,26,52,62]` → tepat `aA0!aA0!` (union86), semua empat kelompok hadir.
- [ ] Lowercase+uppercase length8: kandidat pertama delapan draws0 (semua `a`, gagal policy), lalu `[0,26,0,26,0,26,0,26]` → `aAaAaAaA`; tepat16 draws dan tidak ada forced suffix/overwrite.
- [ ] All-groups+filter length8, draws `[0,25,49,57,0,25,49,57]` → `aA2!aA2!` (union81), tanpa excluded chars.
- [ ] Pure `uniformIndex(3)` dengan RNG selalu4294967295 → berhenti `RNG_LIMIT` setelah65.536 draws, sebelum draw65.537, bukan infinite loop. Opsi lowercase+uppercase length8 dengan RNG selalu0 → `POLICY_LIMIT` setelah256 kandidat gagal (2.048 draws), sebelum mencoba kandidat257, tanpa hasil parsial.
- [ ] count2 di mana password pertama valid lalu RNG melempar pada kedua → error penuh tanpa batch pertama. RNG undefined/NaN/non-integer/negatif/>2³²−1 dan crypto unavailable/exception → error terkontrol.
- [ ] `serializePasswords(['aaaaaaaa','bbbbbbbb'])` → tepat `aaaaaaaa\nbbbbbbbb`, tanpa trailing newline. Count100 × length128 menghasilkan tepat12.899 bytes, dan semua password memenuhi policy/allowed chars.
- [ ] Fixture adapter mencatat tiap refill1024 bytes; tidak ada request getRandomValues di atas65.536 bytes. Test bound menerima draw65.536 lalu menolak draw65.537.
- [ ] Browser smoke nativecrypto: batch1/count100, length8/128, semua 15 kombinasi kelompok non-empty, filter on/off → length/count/group-membership benar. Jangan assertion “harus berbeda/unik” terhadap random output.
- [ ] Browser integration A pending lalu opsi change/generate B, delayed A success/error, cancel, clear, worker unavailable, deadline2 s → output/status B terlindung atau output kosong sesuai tindakan.
- [ ] Clipboard success/failure dan copy stale-disabled diuji; inspect Network/storage/console memastikan tidak ada password dikirim atau dicatat. Test fixtures tidak membuktikan kekuatan password melampaui API/policy yang dipilih.

## SEO dan konten statis

- [ ] Title: `Random Password Generator — Local Browser Generation | Edwin Lab`; H1: `Password Generator`.
- [ ] Description: `Generate random passwords locally in your browser with chosen length and character groups. Include every selected group and copy one password or a batch.`
- [ ] Canonical/OG URL `https://edwinlab.dev/password-generator/`, `lang="en"`, viewport, favicon, logo/OG image lokal, satu H1, HTML awal, noscript, dan breadcrumb `Home → Developer Tools → Password Generator` mengikuti kontrak.
- [ ] Panduan pilih length/kelompok → Generate → Copy; sebutkan default20, count1–100, setiap kelompok aktif wajib hadir, dan opsi similar chars yang eksplisit.
- [ ] FAQ: `How are passwords generated?`, `Does every selected character group appear?`, `Which similar characters are excluded?`, `Are generated passwords stored?`, `Does Clear also clear my clipboard?`.
- [ ] Jelaskan browser crypto/local processing dan tidak ada riwayat; jangan strength score, cracking-time, encryption claim, password-compliance universal, atau “100% secure” promises.
- [ ] Related kandidat `/uuid-generator/`, `/hash-generator/`, `/tools/`; integrasi batch baru mengaktifkan target baru hanya setelah siap.

## Definition of done dan catatan eksekusi

- [ ] Semua fixture penting `/tests/tools/password-generator.html` lulus melalui HTTP lokal; catat jumlah lulus/gagal, policy/budget boundaries, dan nativecrypto QA aktual.
- [ ] QA direct route+refresh, generate/regenerate, opsi changes/stale/cancel/clear, copy aktual dan failure, crypto unavailable/error, dan timeout; tidak ada output parsial/Math.random/seed UI.
- [ ] QA keyboard/focus/label/live status, 320/390/768/1440 px, no-JS content, console bersih, dan Network/storage tanpa password. Jika browser tidak diuji, catat belum terverifikasi dan jangan centang selesai.
- [ ] `git diff --check` lulus; file berubah hanya ownership task. Pertahankan semua tool lama/perubahan pengguna.
- [ ] Perbarui checkbox/catatan QA **task ini** dan **hanya row 16** README tracker berdasarkan bukti; status sebagian bila dependency/QA belum lulus. Menu/sitemap/index tes tetap milik task 24.
- [ ] Laporkan files, fixtures, browser QA, policy/limits, dan keterbatasan; jangan commit, push, publish, atau deploy.

## Prompt eksekusi siap tempel

```text
Implementasikan hanya docs/developer-tools/16-password-generator.md (D03), memakai GPT-6 Luna reasoning high.
Baca README.md, CONTRACT.md, EXTENSION-CONTRACT.md, instruksi repo, dan API shared aktual; pastikan foundation00 selesai.
Hanya HTML/CSS/JS vanilla dan nativecrypto getRandomValues, tanpa dependency/npm/build/backend/Math.random.
Ikuti exact alphabets/selected-group policy/filter0O1Il. Length8–128 default20, count1–100 default1; validate sebelum RNG.
Gunakan uint32 rejection sampling dengan ceiling=floor(2**32/n)*n (tanpa bitwise wrap), lalu whole-candidate rejection sampai setiap kelompok terpilih hadir. Jangan forced chars/overwrite/shuffle untuk memenuhi policy.
Pure fixture RNG injection saja; produksi buffered getRandomValues Uint32Array256, tanpa seed/RNG pilihan UI.
Bound256 candidates/password dan65.536 draws/batch; module worker2 s, request IDs/cancel/stale, error tanpa batch sebagian.
Output read-only satu/baris, Copy all eksplisit, Clear, English UI/SEO statis. Tidak ada strength promises, storage/history, logging, auto-copy, atau password download.
Jalankan exact/browser-native tests, nativecrypto smoke, browser QA, dan git diff --check. Update checklist/catatan task serta hanya row16 README tracker berdasarkan hasil aktual/keterbatasan.
Jangan edit shared/vendor/tool lama/menu/hub/sitemap/index tes bersama; jangan commit/push/deploy.
```
