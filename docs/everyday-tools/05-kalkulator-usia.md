# 05 — Kalkulator Usia

Status: **SEBAGIAN — implementasi, fixture, dan runner browser lulus; route refresh, keyboard manual, console, no-JavaScript, dan uji lintas zona waktu belum diverifikasi.**
Model awal: **GPT-6 Luna · high**. Prasyarat: [00-foundation.md](00-foundation.md) selesai dan helper kalender teruji. Jika fixture penting masih gagal sesudah satu perbaikan terarah, pecah reproduksi minimal menjadi langkah lebih kecil dengan Luna yang sama; jangan menandai selesai sebelum terbukti.
Route: `/kalkulator-usia/`; canonical: `https://edwinlab.dev/kalkulator-usia/`. UI dan konten publik: Bahasa Indonesia, `lang="id"`.

## Tujuan dan scope V1

Menghitung usia pada tanggal acuan dalam tahun, bulan, dan hari kalender yang sudah berlalu, serta total hari. Pengguna dapat memilih tanggal acuan sendiri. V1 tidak menghitung jam lahir, umur berdasarkan zona waktu, kalender Hijriah, kelayakan hukum/administratif, atau jadwal ulang tahun berikutnya.

HTML, CSS, dan JavaScript vanilla melalui native ES modules; folder route asli berisi `index.html`. GitHub Pages menyajikan file langsung: tanpa framework, compiler, npm, build, backend, library tanggal, atau CDN.

## Prasyarat dan kepemilikan

- [x] Baca instruksi repository, [README.md](README.md), [CONTRACT.md](CONTRACT.md), dan [00-foundation.md](00-foundation.md); verifikasi ekspor helper aktual.
- [x] Buat hanya `kalkulator-usia/index.html`, `kalkulator-usia/tool.js`, `kalkulator-usia/logic.js`, dan bila perlu `kalkulator-usia/tool.css`.
- [x] Buat hanya `tests/everyday/kalkulator-usia.html` dan `tests/everyday/kalkulator-usia.test.js`; import harness `/tests/tools/harness.js`, runner `noindex,nofollow`.
- [x] Catat bukti eksekusi dan centang item yang terbukti pada dokumen ini serta baris tracker 05 di README, sesuai kontrak ownership. Jangan mengubah shared files, homepage, hub, sitemap, CNAME, developer tools, atau task lain.
- [x] Gunakan `/tools/shared/tools.css`, `/tools/shared/ui.js`, `/tools/shared/limits.js` secara read-only; gunakan copy berbahasa Indonesia dari `/everyday/shared/ui.js`. Perbaikan helper menjadi pekerjaan foundation terpisah.

## Kontrak kalender dan algoritme

- [x] Import **satu** `/everyday/shared/calendar.js`: `parseDateOnly(raw) -> {year,month,day}`, `toDayNumber(date) -> integer`, `fromDayNumber(n) -> date`, `daysInMonth(year,month)`, `addMonthsClamped(date,delta) -> date`. Jangan menduplikasi kalender dalam tool.
- [x] `parseDateOnly` menerima tepat `YYYY-MM-DD`, tahun `0001–9999`, Gregorian proleptik. Leap year: habis dibagi 4 kecuali habis dibagi 100 yang tidak habis dibagi 400. Tanggal mustahil/format salah melempar `INVALID_DATE`; operasi di luar rentang melempar `DATE_RANGE`.
- [x] Hari ordinal adalah integer, `0001-01-01 = 0`, `9999-12-31 = 3652058`. Perhitungan bukan selisih milidetik atau pembagian 365/30. Jangan memakai `new Date(dateString)`, `Date.UTC`, `setMonth`, atau zona lokal dalam fungsi inti.
- [x] `addMonthsClamped` menghitung bulan target langsung dari tanggal asal dan delta, lalu hari target `min(hariAsal, daysInMonth(target))`. Ia tidak menjumlahkan satu bulan berulang kali. Contoh: 31 Januari 2023 + 2 bulan = 31 Maret 2023, walaupun +1 bulan menghasilkan 28 Februari.
- [x] Export fungsi murni `calculateAge(birthRaw, asOfRaw) -> {years,months,days,totalDays}`. Kedua raw harus tepat 10 karakter; UI boleh memangkas whitespace ASCII di tepi sebelum memanggil parser, tidak di tengah. Kosong tetap invalid.
- [x] Validasi dua tanggal sebelum menghitung. Jika acuan sebelum lahir, lempar `AS_OF_BEFORE_BIRTH`; jangan membalik tanggal atau menampilkan usia negatif.
- [x] Tentukan `years = asOf.year - birth.year`. Bentuk `yearAnchor = addMonthsClamped(birth, 12 * years)`. Jika anchor setelah acuan, kurangi years satu dan hitung ulang anchor dari birth. Ini berarti lahir 29 Februari mencapai ulang tahun pada 28 Februari di tahun nonkabisat.
- [x] Tentukan `months` terbesar dalam `0..11` sehingga `addMonthsClamped(yearAnchor, months)` tidak setelah acuan. Bisa mulai dari selisih indeks bulan, dibatasi 11, lalu kurangi bila perlu. Setiap kandidat berawal dari yearAnchor, bukan hasil penambahan sebelumnya.
- [x] `monthAnchor = addMonthsClamped(yearAnchor, months)`; `days = ordinal(asOf) - ordinal(monthAnchor)`; `totalDays = ordinal(asOf) - ordinal(birth)`. Kebijakan **tahun dahulu, lalu bulan dari ulang tahun yang sudah disesuaikan** harus dijelaskan; bukan mengonversi total hari ke bulan tetap.
- [x] Semua komponen integer nonnegatif. Sisa hari dapat 31 pada kasus tertentu; jangan memaksa `days < 31` atau mengubahnya menjadi bulan tambahan. Jangan membuat kandidat tahun 10000 untuk menentukan usia tahun 9999.

## UX, limit, dan privasi

- [x] Label permanen `Tanggal lahir` dan `Tanggal acuan`; `type="date"`, min `0001-01-01`, max `9999-12-31`, validasi logic tetap wajib. Tampilkan petunjuk rentang dan date-only.
- [x] Pada load, lahir kosong dan acuan tanggal hari ini menurut kalender lokal perangkat; jangan otomatis menghitung. Tombol `Gunakan hari ini` mengisi acuan dari `getFullYear/getMonth/getDate` dan menjadikannya stale. Jangan memakai UTC `toISOString().slice(0,10)` untuk tanggal lokal.
- [x] Tombol `Hitung usia`, `Isi contoh`, `Bersihkan`, `Salin hasil`. Contoh tetap: lahir `2000-06-15`, acuan `2024-06-15`. Bersihkan mengosongkan kedua input dan hasil, menonaktifkan copy, lalu fokus ke lahir; tidak otomatis mengisi hari ini kembali.
- [x] Perubahan input, contoh, atau hari ini segera mengosongkan hasil dan menonaktifkan copy. Error mempertahankan input, menampilkan pesan spesifik dan fokus ke field terkait. Status memakai `aria-live="polite"` dan `setStatus` dengan pesan Indonesia.
- [x] Hasil utama: `24 tahun, 0 bulan, 0 hari`; hasil kedua `Total: 8766 hari`. Copy berupa teks yang menyertakan kedua tanggal dan dua hasil, tanpa pemisah ribuan ambigu. Hasil readonly dapat diseleksi; copy berhasil hanya setelah clipboard berhasil, fallback manual berbahasa Indonesia.
- [x] Maksimum dua scalar tanggal 10 karakter setelah trim, satu perhitungan per tombol, tanpa payload/file upload. Batas output 2 KiB UTF-8. Tidak ada request, analytics input, query/hash input, localStorage, sessionStorage, atau log tanggal lahir.

## HTML, SEO, dan konten unik

- [x] Title: `Kalkulator Usia: Tahun, Bulan, dan Hari | Edwin Lab`.
- [x] Meta description: `Hitung usia dari tanggal lahir ke tanggal pilihan dalam tahun, bulan, hari, dan total hari. Mendukung tahun kabisat dan perhitungan lokal di browser.`
- [x] H1: `Kalkulator Usia`.
- [x] Intro: `Pilih tanggal lahir dan tanggal acuan untuk mengetahui usia yang sudah berlalu. Hasil menunjukkan tahun penuh, bulan penuh berikutnya, sisa hari, dan total hari kalender.`
- [x] Tulis cara pakai singkat, contoh `15 Juni 2000 → 15 Juni 2024 = 24 tahun dan 8766 hari`, kebijakan tahun/bulan, dan keterbatasan secara statis dalam HTML, tersedia sebelum JavaScript.
- [x] FAQ terlihat: `Bagaimana usia kelahiran 29 Februari dihitung?` → ulang tahun 28 Februari pada tahun nonkabisat; `Mengapa satu bulan tidak selalu 30 hari?` → panjang bulan kalender berbeda, tanggal akhir bulan dijepit; `Apakah tanggal lahir dikirim ke server?` → perhitungan lokal; `Apakah hasil bisa dipakai untuk persyaratan resmi?` → ini perhitungan kalender dengan kebijakan yang dijelaskan, persyaratan instansi dapat memakai aturan lain.
- [x] Hipotesis intent, **bukan volume terukur**: `kalkulator usia`, `hitung umur tahun bulan hari`, `umur pada tanggal tertentu`, `usia lahir 29 februari`. Jangan membuat route duplikat per query atau menjanjikan ranking.
- [x] Pasang canonical di atas, OG unik, viewport, favicon/logo lokal yang sudah ada, satu H1, breadcrumb, dan `<noscript>` berbahasa Indonesia. Related candidate: `/kalkulator-tanggal/`; aktifkan href hanya bila file publik siap dan QA lulus, jika belum jangan tampilkan link mati.

## Fixture wajib saat eksekusi

Semua output berikut adalah `{years,months,days,totalDays}`. Bandingkan integer tepat, bukan toleransi.

- [x] `2000-06-15 → 2024-06-15` → `{24,0,0,8766}`.
- [x] `2000-06-15 → 2024-06-14` → `{23,11,30,8765}`.
- [x] `2024-10-12 → 2024-10-12` → `{0,0,0,0}`.
- [x] `2023-01-31 → 2023-02-28` → `{0,1,0,28}`.
- [x] `2023-01-31 → 2023-03-30` → `{0,1,30,58}`; bukan 2 bulan.
- [x] `2024-01-31 → 2024-02-29` → `{0,1,0,29}`.
- [x] `2020-02-29 → 2021-02-28` → `{1,0,0,365}`.
- [x] `2020-02-29 → 2021-02-27` → `{0,11,29,364}`.
- [x] `2020-02-29 → 2024-02-28` → `{3,11,31,1460}`; mengunci kebijakan yearAnchor.
- [x] `2020-02-29 → 2024-02-29` → `{4,0,0,1461}`.
- [x] `0001-01-01 → 9999-12-31` → `{9998,11,30,3652058}`.
- [x] `2024-10-13 → 2024-10-12` → `AS_OF_BEFORE_BIRTH`.
- [x] `1900-02-29`, `2023-02-29`, `0000-01-01`, `10000-01-01`, `2024-2-01`, `2024-02-30`, kosong, dan datetime ditolak `INVALID_DATE`; uji masing-masing pada kedua posisi.
- [x] `1900-02-28 → 1900-03-01` → `{0,0,1,1}`; `2000-02-28 → 2000-03-01` → `{0,0,2,2}`.

## Acceptance dan bukti

- [x] Semua fixture lulus di `/tests/everyday/kalkulator-usia.html` lewat HTTP lokal tanpa compiler: runner browser 25/25 lulus. Root memuat direct route `/kalkulator-usia/` dan menghitung contoh 24 tahun, 0 bulan, 0 hari / total 8766 hari.
- [ ] Refresh route dan pemeriksaan console bersih belum diverifikasi.
- [x] Runner QA lebar 320/390/768/1440, label, error, hasil nol, contoh, clear, copy berhasil/ditolak, dan hasil stale; source inspection tidak menemukan pengiriman tanggal ke network.
- [ ] Keyboard/focus manual dan JavaScript dinonaktifkan belum diuji.
- [x] HTML awal memuat metadata, pengantar, contoh, dan FAQ; tidak menampilkan link ke halaman terkait yang belum siap. Source logic kalkulasi hanya menggunakan helper kalender, tanpa `Date`.
- [ ] Uji perhitungan di dua zona perangkat belum dilakukan; browser QA tidak mengonfirmasi ketersediaan pengaturan zona waktu.
- [x] Jalankan `git diff --check`; laporkan file, fixture lulus/gagal, QA yang benar-benar dilakukan, limit, dan kebutuhan integrasi. Jangan menandai selesai jika fixture/UI belum diverifikasi. Jangan commit, push, atau deploy.

## Catatan eksekusi

- 12 Oktober 2026 · GPT-6 Luna high (penugasan run ini). File task 05 dan runner dibuat. Runner browser: **25/25 lulus**; pengujian pure tambahan: **13 fixture hasil tepat** serta semua tanggal invalid diuji pada kedua posisi. Root memuat direct route dan menguji contoh 2000-06-15 → 2024-06-15: 24 tahun, 0 bulan, 0 hari / 8766 total hari. Sintaks JS dan `git diff --check` lulus. Refresh, keyboard manual, console, no-JavaScript, dan zona waktu kedua belum diverifikasi; status tetap sebagian.

## Prompt eksekusi mandiri

```text
Implementasikan hanya docs/everyday-tools/05-kalkulator-usia.md di repository ini.
Baca instruksi repository, docs/everyday-tools/README.md, CONTRACT.md, dan 00-foundation.md terlebih dahulu. Pastikan foundation dan kalender bersama telah selesai.
Gunakan GPT-6 Luna reasoning high yang dipilih di pengaturan chat; teks prompt tidak mengganti model otomatis. UI Bahasa Indonesia lang=id, HTML CSS JavaScript vanilla statis GitHub Pages, tanpa npm/compiler/build/CDN/backend.
Patuhi algoritme yearAnchor, kebijakan 29 Februari, scope file, helper read-only, fixture, SEO, dan UX pada TODO. Jangan menyalin atau mengubah helper shared.
Jalankan runner browser-native, QA browser dan git diff --check, catat bukti aktual pada TODO. Setelah satu perbaikan fixture terarah masih gagal, isolasi reproduksi minimal dan lanjutkan per langkah kecil dengan Luna yang sama, tanpa melonggarkan tes.
Jangan mengerjakan task lain, commit, push, atau deploy. Laporkan kebutuhan integrasi dan semua verifikasi yang belum dapat dilakukan.
```
