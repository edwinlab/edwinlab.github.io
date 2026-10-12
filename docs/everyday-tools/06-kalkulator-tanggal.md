# 06 — Kalkulator Tanggal

Status: **SEBAGIAN — implementasi dan 27/27 browser tests lulus; refresh route, keyboard manual, console, dan no-JavaScript belum diverifikasi.**
Model awal: **GPT-6 Luna · high**. Jalankan setelah [00-foundation.md](00-foundation.md); bila fixture penting masih gagal sesudah satu perbaikan terarah, pecah reproduksi menjadi langkah lebih kecil dengan Luna yang sama; jangan menandai selesai sebelum terbukti.
Route: `/kalkulator-tanggal/`; canonical: `https://edwinlab.dev/kalkulator-tanggal/`. Bahasa Indonesia, `lang="id"`.

## Scope dan file milik task

V1 memiliki dua mode: selisih hari antara dua tanggal, serta tambah/kurangi sejumlah hari kalender. Tidak ada tambah bulan/tahun, hari kerja, hari libur nasional, waktu/jam, countdown live, atau perbedaan zona waktu. Hari Sabtu/Minggu tetap dihitung.

- [x] Baca instruksi repository, [README.md](README.md), [CONTRACT.md](CONTRACT.md), dan [00-foundation.md](00-foundation.md). Implementasi hanya HTML/CSS/JavaScript vanilla ES modules; file langsung dilayani GitHub Pages, tanpa npm, compiler, build, library tanggal, backend, atau CDN.
- [x] Miliki hanya `kalkulator-tanggal/index.html`, `kalkulator-tanggal/tool.js`, `kalkulator-tanggal/logic.js`, opsional `kalkulator-tanggal/tool.css`, `tests/everyday/kalkulator-tanggal.html`, `tests/everyday/kalkulator-tanggal.test.js`, catatan/checklist dokumen ini, serta baris tracker 06 di README sesuai kontrak.
- [x] Runner tes memakai `/tests/tools/harness.js` dan `noindex,nofollow`. Existing `/tools/shared/tools.css`, `ui.js`, `limits.js` hanya dibaca. Gunakan copy Indonesia `/everyday/shared/ui.js`.
- [x] Shared files, homepage, hub, sitemap, CNAME, dan developer tools di luar scope. Bila helper kurang, laporkan reproduksi untuk foundation, jangan membuat versi alternatif.

## Algoritme dan kontrak input

- [x] Import `/everyday/shared/calendar.js` yang dibuat task 00: `parseDateOnly`, `toDayNumber`, `fromDayNumber`, `daysInMonth`, `addMonthsClamped`. Tool ini memakai tiga pertama; fungsi clamp disediakan untuk kalkulator usia, bukan fitur bulan dalam halaman ini.
- [x] Format tepat `YYYY-MM-DD`, panjang 10, Gregorian proleptik tahun `0001–9999`; invalid termasuk `1900-02-29`, tahun nol, tanggal terbalik komponennya, slash, datetime, dan format dua digit tahun. UI boleh trim whitespace ASCII di tepi, parser murni tidak.
- [x] Kalender memakai integer hari: `0001-01-01 = 0` sampai `9999-12-31 = 3652058`. Tidak menggunakan `Date`/timestamp/DST untuk operasi kalender. Jangan mengalikan dengan 86.400.000.
- [x] Export `differenceDays(startRaw,endRaw) -> integer` sebagai `ordinal(end) - ordinal(start)`. Kedua endpoint sama memberi nol. Hasil bertanda negatif bila akhir sebelum awal; jangan membalik atau mengambil nilai absolut diam-diam.
- [x] Hasil selisih berarti jumlah pergantian tanggal, **bukan menghitung kedua tanggal secara inklusif**. Satu hari sesudah awal memberi 1. V1 tidak menyediakan toggle inklusif; copy dan FAQ menjelaskan definisi.
- [x] Export `shiftDate(startRaw,countRaw,direction) -> YYYY-MM-DD`. `direction` hanya `add` atau `subtract`; selainnya `INVALID_DIRECTION`. `countRaw` regex `^[0-9]{1,7}$`, lalu integer `0..3652058`; selain regex `INVALID_DAY_COUNT`, melebihi rentang `DAY_COUNT_RANGE`. Nol dan leading zero diterima; `-1`, `+1`, `1,5`, `1.0`, `1e2`, kosong ditolak.
- [x] Target ordinal adalah `start + count` atau `start - count`. Jika di luar `0..3652058`, lempar `DATE_RANGE` sebelum `fromDayNumber`; jangan clamp hasil. Format hasil selalu tahun empat digit dan bulan/hari dua digit.
- [x] `parseDateOnly` melempar `INVALID_DATE`; helper juga memvalidasi objek/rentang sesuai CONTRACT. Logic murni tidak membaca jam perangkat, DOM, atau jaringan.

## UX dan privasi

- [x] Pilihan mode native `Selisih hari` (default) / `Tambah atau kurangi hari`; field mode tersembunyi tidak divalidasi. Label permanen: `Tanggal awal`, `Tanggal akhir`, atau `Tanggal mulai`, `Jumlah hari`, `Operasi`.
- [x] Input tanggal `type="date"` min/max sesuai rentang; hitung eksplisit lewat `Hitung selisih` / `Hitung tanggal`. Jumlah hari text + `inputmode="numeric"`, maxlength 7; validasi logic tetap wajib.
- [x] Load dengan input kosong. Contoh mode selisih `2024-02-28 → 2024-03-01`; contoh mode tambah `2024-02-28 + 2`. Tombol contoh mengisi lalu mengosongkan hasil, tidak otomatis mengeksekusi.
- [x] Hasil selisih `2 hari`; untuk negatif `−2 hari` dengan keterangan `Tanggal akhir 2 hari sebelum tanggal awal`. Copy memakai minus ASCII `-2 hari`, mencantumkan dua tanggal dan definisi selisih.
- [x] Hasil geser `2024-03-01` serta kalimat `2 hari setelah 2024-02-28`; angka nol menjelaskan tanggal tidak berubah. Copy menyertakan tanggal awal, operasi, jumlah, dan tanggal hasil.
- [x] Perubahan mode/input/operasi/contoh segera mengosongkan hasil dan disable copy. Mode baru mempertahankan nilai form yang sudah diketik tetapi tidak mempertahankan hasil. `Bersihkan` mengosongkan seluruh mode, mengembalikan mode selisih dan operasi tambah, fokus tanggal awal.
- [x] Error mempertahankan input, fokus field yang perlu diperbaiki, status `aria-live="polite"`. Hasil readonly bisa diseleksi; gunakan `copyTextId`, tidak membaca clipboard. Copy ditolak menawarkan cara manual dalam Bahasa Indonesia.
- [x] Batas perhitungan dua tanggal + satu count, output 2 KiB UTF-8. Semua lokal tanpa request input, query/hash, analytics input, storage browser, atau file upload. Tidak perlu worker untuk aritmetika konstan ini.

## Konten HTML dan SEO

- [x] Title: `Kalkulator Tanggal: Selisih dan Tambah Hari | Edwin Lab`.
- [x] Meta description: `Cari selisih hari antara dua tanggal atau tanggal setelah menambah dan mengurangi hari kalender. Perhitungan mencakup akhir bulan dan tahun kabisat.`
- [x] H1: `Kalkulator Tanggal`.
- [x] Intro: `Hitung jarak dua tanggal dalam hari kalender, atau cari tanggal setelah menambah dan mengurangi sejumlah hari. Sabtu, Minggu, dan tanggal libur tetap masuk hitungan.`
- [x] Contoh statis `28 Februari 2024 → 1 Maret 2024 = 2 hari` dan `31 Desember 2024 + 1 hari = 1 Januari 2025`; tampilkan cara pakai dan arti selisih bertanda.
- [x] FAQ terlihat: `Apakah tanggal awal dan akhir dihitung keduanya?` → selisih menghitung pergantian tanggal, endpoint sama nol; `Apakah ini menghitung hari kerja?` → semua hari kalender dihitung; `Mengapa Februari bisa memiliki 29 hari?` → aturan Gregorian 4/100/400; `Apakah hasil dipengaruhi zona waktu?` → operasi date-only dengan integer hari tanpa jam/DST.
- [x] Query sebagai hipotesis intent, bukan volume terukur: `kalkulator tanggal`, `selisih hari antara dua tanggal`, `30 hari dari tanggal`, `kurangi tanggal dengan hari`. Tidak membuat halaman keyword duplikat atau klaim ranking.
- [x] HTML awal berisi metadata unik, canonical, OG, viewport, favicon/logo lokal, breadcrumb, satu H1, intro/panduan/FAQ dan `<noscript>`. Related candidates `/kalkulator-usia/` dan `/timestamp-converter/`; link aktif hanya setelah file siap dan QA lulus, dengan label yang menjelaskan timestamp untuk kebutuhan jam/zona.

## Fixture wajib saat eksekusi

- [x] Selisih `2024-02-28 → 2024-03-01` → `2`.
- [x] Selisih `2023-02-28 → 2023-03-01` → `1`.
- [x] Selisih `2024-03-01 → 2024-02-28` → `-2`.
- [x] Selisih `2024-10-12 → 2024-10-12` → `0`.
- [x] Selisih `0001-01-01 → 9999-12-31` → `3652058`; arah sebaliknya → `-3652058`.
- [x] Selisih `1900-02-28 → 1900-03-01` → `1`; `2000-02-28 → 2000-03-01` → `2`.
- [x] Selisih `2024-03-09 → 2024-03-11` → `2` dan `2024-11-02 → 2024-11-04` → `2`, menghindari pengaruh DST.
- [x] Tambah `2024-02-28`, `"2"`, `add` → `2024-03-01`; kurangi `2024-03-01`, `"2"`, `subtract` → `2024-02-28`.
- [x] Tambah `2024-12-31`, `"1"`, `add` → `2025-01-01`; kurangi `2025-01-01`, `"1"`, `subtract` → `2024-12-31`.
- [x] `0001-01-01`, `"3652058"`, `add` → `9999-12-31`.
- [x] `2023-01-31`, `"28"`, `add` → `2023-02-28`; `"31"`, `add` → `2023-03-03` (hari, bukan bulan).
- [x] `2024-02-29`, `"0"`, `subtract` → `2024-02-29`; `"0000001"`, `add` → `2024-03-01`.
- [x] `9999-12-31 + 1` dan `0001-01-01 - 1` → `DATE_RANGE`.
- [x] Count `"3652059"` → `DAY_COUNT_RANGE`; `"10000000"`, `"-1"`, `"+1"`, `"1.0"`, `"1e2"`, `""` → `INVALID_DAY_COUNT`; direction `"multiply"` → `INVALID_DIRECTION`.
- [x] Tanggal `1900-02-29`, `2024-04-31`, `0000-01-01`, `10000-01-01`, `2024-2-01`, `01/02/2024`, kosong, dan datetime → `INVALID_DATE` di masing-masing mode.

## Acceptance dan bukti

- [x] Runner `/tests/everyday/kalkulator-tanggal.html` lulus **27/27** melalui HTTP lokal. Root membuka direct route `/kalkulator-tanggal/` dan memverifikasi contoh `2024-02-28 → 2024-03-01 = 2 hari`.
- [ ] Refresh route dan pemeriksaan console bersih belum diverifikasi.
- [x] Runner QA 320/390/768/1440, label, pergantian mode, hasil nol/negatif, error boundary, contoh, clear, clipboard berhasil/ditolak, dan stale. Source inspection tidak menemukan pengiriman input ke network.
- [ ] Keyboard/focus manual belum diuji.
- [x] HTML awal memuat panduan/contoh/FAQ; tidak ada related link ke halaman yang belum siap. Source `logic.js` hanya memakai kalender integer dan tidak menggunakan `Date`/timestamp.
- [ ] Perilaku halaman dengan JavaScript dinonaktifkan belum diuji di browser.
- [x] `git diff --check` lulus; catat file berubah, fixture lulus/gagal, QA aktual, keterbatasan, dan integrasi berikutnya. Jangan tandai selesai saat browser belum terverifikasi. Jangan commit, push, atau deploy.

## Catatan eksekusi

- 12 Oktober 2026 · GPT-6 Luna high (penugasan run ini). Runner browser: **27/27 lulus**; pure smoke test: 10 fixture selisih, 9 fixture geser, dan tujuh count boundary/error lulus. Root membuka direct route dan memverifikasi contoh 28 Februari → 1 Maret 2024 = 2 hari. Syntax JavaScript dan `git diff --check` lulus. Refresh, keyboard manual, console, dan no-JavaScript belum diverifikasi; status tetap sebagian.

## Prompt eksekusi mandiri

```text
Implementasikan hanya docs/everyday-tools/06-kalkulator-tanggal.md.
Baca instruksi repository, docs/everyday-tools/README.md, CONTRACT.md, dan 00-foundation.md. Foundation dan calendar.js bersama harus selesai terlebih dahulu.
Gunakan GPT-6 Luna reasoning high yang dipilih di pengaturan chat. Bahasa Indonesia lang=id. Hanya HTML CSS JavaScript vanilla statis GitHub Pages, tanpa npm/compiler/build/CDN/backend.
Ikuti semantik selisih bertanda dan tambah/kurang hari integer; jangan menambah mode bulan, hari kerja, atau kalender libur. Hormati ownership, helper read-only, fixture, UX dan SEO TODO.
Jalankan runner browser-native, QA browser dan git diff --check; catat bukti aktual. Jika fixture penting gagal sesudah satu perbaikan terarah, isolasi reproduksi minimal dan lanjutkan per langkah kecil dengan Luna yang sama, tanpa melonggarkan tes.
Jangan mengerjakan task lain, commit, push, atau deploy. Laporkan kebutuhan integrasi dan verifikasi yang belum dilakukan.
```
