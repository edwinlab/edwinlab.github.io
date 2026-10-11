# 00 — Fondasi shared UI, helper, dan tes

Status: SELESAI secara lokal pada 11 Oktober 2026. Model: **GPT-6.1 Sol · medium**. Ini dikerjakan sekali sebelum tool 01–12 agar pekerjaan Luna lebih kecil dan konsisten.

## Scope dan file

Implementasikan [CONTRACT.md](CONTRACT.md), tanpa membuat 12 aplikasi sekaligus.

- `tools/shared/tools.css`, `ui.js`, `limits.js`, `json.js`.
- `tools/vendor/` untuk empat dependency yang disepakati, masing-masing lisensi dan provenance.
- `tests/tools/harness.js`, `foundation.test.js`, `foundation.html`.
- `docs/developer-tools/tool-template.html` sebagai template siap salin; bukan halaman publik berisi placeholder.

## TODO

- [x] Baca README repo, CONTRACT, struktur CSS/font/logo aktual, dan git status; jangan menimpa perubahan existing.
- [x] Buat CSS scoped shared: container, header/footer, breadcrumb, label/input/select, panel, actions, status, prose, responsive states, focus, disabled states.
- [x] Buat template HTML dengan slot title/description/canonical/H1, workspace, noscript, contoh/panduan, dan script module. Jangan tambahkan template ke sitemap.
- [x] Implementasikan seluruh API ui.js dan limits.js sesuai kontrak. Jangan membuat helper spekulatif di luar kebutuhan 12 tool.
- [x] Ambil distribusi resmi siap browser, pin exact version saat eksekusi, simpan lokal beserta lisensi/sumber/checksum. Tidak npm, bundler, atau build bahkan untuk persiapan dependency.
- [x] Buktikan keempat library dapat dimuat di browser melalui HTTP lokal. Catat bentuk ESM/UMD dan contoh import lokal yang benar di vendor README.
- [x] Verifikasi API YAML Document/core schema/AST/BigInt, Croner next-runs/timezone/OR, serta SQL PostgreSQL/MySQL sebelum mengunci adapter.
- [x] Implementasikan JSON scanner/validator shared berbasis jsonc-parser strict, pemeriksaan depth sebelum recursion, dan parseSafeJSON tanpa silent loss pada kasus yang ditolak kontrak.
- [x] Buat harness minimal browser-native untuk fixture sync/async dan laporan lulus/gagal. Test page noindex.
- [x] Catat semua shared exports dan import aktual pada dokumen ini supaya model berikutnya tidak menebak.

## Verifikasi yang menentukan selesai

- [x] JSON valid scalar/object, trailing comma/comment invalid, lokasi error LF/CRLF, duplicate decoded key termasuk `a` vs `\u0061`.
- [x] Guard numeric: `9007199254740993`, `1e400`, `1e-400` ditolak parseSafeJSON; bentuk string diterima; JSONlint validation tetap mengakui sintaks angka tersebut valid.
- [x] Depth 100 diterima, 101 ditolak; UTF-8 tepat batas diterima dan melewati batas ditolak, termasuk emoji.
- [x] `__proto__` tetap own data tanpa prototype pollution. Nilai HTML tampil literal pada status/error.
- [x] Clipboard success/denied dan manual fallback; file invalid UTF-8; download lalu object URL cleanup; BOM ditangani eksplisit.
- [x] Smoke test keempat vendor, hanya request lokal. Tidak ada unresolved/bare imports atau kebutuhan build.
- [x] Template keyboard/focus/status dan lebar 320/390/768/1440 px teruji; no-JS masih menampilkan penjelasan.
- [x] Seluruh tes `/tests/tools/foundation.html` lulus dan `git diff --check` bersih.
- [x] Laporkan dependency versions, API, bukti tes, dan blocker; baru centang foundation pada tracker bila selesai.

## Prompt siap tempel

```text
Implementasikan hanya docs/developer-tools/00-foundation.md.
Baca README repo serta docs/developer-tools/README.md dan CONTRACT.md.
Gunakan hanya HTML CSS JavaScript vanilla, tanpa npm/package.json/framework/build/backend.
Siapkan shared UI/helper, browser test harness, template, dan vendor browser resmi lokal sesuai kontrak.
Jangan membuat tool 01–12 atau mengubah homepage/CNAME. Jangan commit/push/deploy.
Jalankan fixture dan browser QA. Laporkan hasil dan shared API aktual, lalu centang hanya pekerjaan terbukti selesai.
```

## Hasil eksekusi 11 Oktober 2026

- Foundation saja diimplementasikan. Tidak ada tool 01–12, hub/integrasi 13, homepage, CNAME, commit, push, atau deployment yang dikerjakan.
- Shared CSS: `tools/shared/tools.css`, seluruh selector layout/UI di-scope pada `.tools-page`. Font dan logo memakai aset existing lokal.
- Template: `docs/developer-tools/tool-template.html`, dengan metadata/SEO slots, noindex, noscript, label, keyboard focus, responsive editors, dan script-module slot inert. Controls disabled sampai task tool mengikat event; ini bukan aplikasi placeholder publik.
- API nyata: limits.js mengekspor MAX_TEXT_BYTES, MAX_OUTPUT_BYTES, MAX_DEPTH, assertTextSize; ui.js mengekspor setStatus, copyText, downloadText, readTextFile; json.js mengekspor validateJSON dan parseSafeJSON. Import relatif dari folder tool misalnya `../tools/shared/ui.js` atau absolut `/tools/shared/ui.js`.
- `assertTextSize`/validateJSON melempar INPUT_TOO_LARGE jika ukuran berlebih; validateJSON mengembalikan invalid + error code untuk syntax/depth. readTextFile memberi INVALID_UTF8 untuk kegagalan decode/baca dan mempertahankan U+FEFF BOM. parseSafeJSON memberi code, offset, line, column pada error data.
- Output limit 10 MiB disediakan sebagai konstanta; tiap tool harus memanggil assertTextSize(output, MAX_OUTPUT_BYTES) dan melabeli error sebagai output. Helper download/copy tidak menghitung ulang batas data agar kontrak masing-masing tool tetap eksplisit.
- JSON decimal tetap mengikuti presisi Number JavaScript. Guard menolak unsafe integer, nonfinite, dan nonzero-underflow; bukan parser arbitrary-precision decimal.
- Dependency: jsonc-parser 3.3.1, yaml 2.8.1, Croner 10.0.1, sql-formatter 15.6.10. SHA-512 archive diverifikasi; SHA-256 runtime/license tercatat di `tools/vendor/provenance.json`. JSONC hanya mendapat ekstensi .js pada relative imports. Nearley 2.20.1 yang terbundel dalam SQL telah diverifikasi lewat source map dan lisensinya disertakan.
- Browser ESM dan classic SQL UMD berjalan tanpa build. Croner versi ini menggunakan OR default pada restricted DOM/DOW; jangan menambahkan legacyMode. SQL worker harus classic dengan importScripts, bukan module import UMD. Contoh API tersedia di `tools/vendor/README.md`.
- Tes browser: **31/31 lulus, 0 gagal**, `/tests/tools/foundation.html`. Meliputi fixture kontrak, four-library smoke, module/classic worker imports, resource origin lokal, serta template no-JS dan layout 320/390/768/1440 px.
- QA manual: direct path/refresh, mobile screenshot 390 px, label/focus keyboard terlihat, dan clipboard click menghasilkan Copied to clipboard. Browser console tidak mencatat error/warning. Semua resource pengujian berasal dari origin lokal; tidak ada pengiriman teks ke layanan luar.
- Download Blob/content/basename/click/URL cleanup lulus fixture dengan browser API spies. Tombol download nyata dipicu tanpa error console; event/file hasil download tidak diekspos oleh in-app browser pada sesi ini, sehingga penyimpanan file nyata belum dapat diverifikasi. Pengguna dapat memeriksanya lewat tombol Download fixture di runner pada browser biasa.
- `git diff --check` dan audit whitespace file foundation lulus. Seluruh vendor runtime/license checksum sesuai provenance.

### Harness bagi task berikutnya

Impor test/assert/equal/deepEqual/throws/run dari `tests/tools/harness.js`. test menerima fungsi sync atau async; run menjalankan berurutan dan menampilkan hasil pada `[data-test-summary]` serta `[data-test-results]`. equal memakai Object.is; deepEqual membandingkan own keys tanpa bergantung urutan key object dan memeriksa panjang/hole array. throws menerima fungsi sync serta optional expectedCode. Async rejection dapat diuji melalui try/catch di dalam async test. Tidak ada framework atau Node runner.

Perbarui template TOOL_* slots dan script src ketika mulai tool. Hapus noindex hanya pada halaman tool yang siap; test runner dan template tetap noindex. Jangan menambahkan link /tools/ sebelum integrasi 13 membuat hub.

## Update Croner untuk task 07 — 11 Oktober 2026

- Dengan persetujuan pengguna setelah blocker DST dilaporkan, Croner diperbarui dari 10.0.1 ke distribusi browser resmi **10.0.2-dev.0 (prerelease)** untuk perbaikan repeated fall hour. Runtime tidak dimodifikasi; archive integrity dan retained-file checksum diperbarui pada provenance. Dependency lain tetap memakai versi yang dicatat pada laporan awal.
- Import page/worker Croner memakai `?v=10.0.2-dev.0` untuk cache invalidation. Tes foundation ditambah regresi minutely America/New_York `2024-11-03T05:59Z` → `06:00Z`. Hasil terkini **32/32 lulus**, console bersih; laporan 31/31 di atas adalah hasil foundation sebelum update.
- Task 07 juga lulus **25/25** browser-native fixtures. Perilaku fixed-time spring gap yang teramati berbeda dari penjelasan umum README upstream; detail fixture/kebijakan dicatat di `07-cron-expression.md` dan halaman publik. Versi ini merupakan preview perhitungan dengan semantik library yang dipin.
