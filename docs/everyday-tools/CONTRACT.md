# Kontrak tools sehari-hari

Status: **spesifikasi untuk eksekusi mendatang, belum implementasi**. Berlaku untuk folder rencana ini; tidak mengganti kontrak developer tools. Instruksi pengguna tetap didahulukan.

## Teknologi, bahasa, dan kepemilikan

- HTML, CSS, JavaScript vanilla; native ES modules melalui HTTP/HTTPS. Tanpa framework, npm/package.json, TypeScript, compiler, bundler, backend, API pemrosesan, atau runtime CDN. Server preview statis bukan compiler. Membuka `file://` bukan target karena pembatasan module browser.
- Setiap route adalah folder asli `<slug>/index.html`, `logic.js` untuk fungsi inti, `tool.js` untuk DOM, CSS lokal bila diperlukan. GitHub Pages menyajikan file langsung. Route memakai trailing slash; tidak SPA/hash routing.
- Asumsi sasaran: pengguna Indonesia, `lang="id"`, copy Indonesia. Homepage dan developer tools yang sudah ada tetap berbahasa Inggris. Gunakan `/assets/edwinlab-logo.png` yang sudah ada, gaya Edwin Lab dan `/tools/shared/tools.css` secara read-only.
- Domain canonical rencana `https://edwinlab.dev/` mengikuti CNAME aktual. Jangan mengganti CNAME atau menciptakan dua canonical antara domain ini dan github.io.
- 00 memiliki shared dasar, template dan runner foundation. 00a memiliki shared media, vendor, fixture media. 01–12 hanya memiliki folder tool, dua file runner/tes miliknya, checklist dan catatan task sendiri, serta **baris task sendiri** di tracker README.
- 13 memiliki hub `/alat/`, menu homepage, crosslink hub, related links tool yang siap, sitemap/robots bila perlu, index tes, audit integrasi dan dokumentasi integrasi. Jalankan serial setelah batch; jangan bentrok menulis README atau file bersama secara paralel.
- Semua status saat perencanaan unchecked. Status selesai harus berdasarkan bukti implementasi dan tes; jangan mencentang pekerjaan hanya karena rencananya ditulis. Jangan commit, push, atau deploy tanpa permintaan sesi eksekusi.
- Jika shared tidak memadai, tulis reproduksi/kebutuhan perubahan dan selesaikan perbaikan foundation dahulu. Jangan menyalin helper yang berbeda ke setiap app atau mengubah task lain diam-diam.

## Shared dasar yang harus disediakan 00

Reuse `setStatus`, `downloadText`, `assertTextSize`, serta harness dari developer tools; jangan mengubah perilaku pemakai lama. Helper Indonesia baru ada di `/everyday/shared/`:

`ui.js`:
- `copyTextId(text, statusElement) -> Promise<boolean>`: clipboard write hanya lewat klik; sukses sesudah promise sukses. Bila ditolak, pesan Indonesia untuk seleksi/copy manual. Tidak meminta akses membaca clipboard. Jangan memanggil helper copy English lalu menimpa dua status.
- `downloadBlob(blob, filename)`: Blob lokal, sanitasi basename/kontrol/path, anchor download, revoke object URL setelah browser sempat mengonsumsinya. Tidak mengaku file telah tersimpan; UI boleh mengatakan unduhan dimulai. Pemanggil memastikan MIME dan extension cocok.

`number.js`:
- `parseDecimal(text, {maxIntegerDigits=12,maxFractionDigits=6,allowNegative=true}={}) -> {coefficient:bigint,scale:number}`. Raw maksimum 64 karakter; trim hanya whitespace ASCII tepi (`HT LF VT FF CR space`). Grammar `-?[0-9]+([.,][0-9]+)?`; satu koma ATAU titik adalah desimal. Tidak menerima plus, grouping, eksponen, Infinity, NaN, digit non-ASCII, atau field kosong. Angka sebelum/sesudah separator wajib. `1.234` berarti satu koma dua tiga empat, bukan 1234; tulis petunjuk ini di UI.
- Hitung digit integer termasuk leading zero. Digit di atas opsi → `NUMBER_PRECISION`; syntax/negatif terlarang → `INVALID_NUMBER`; raw di atas 64 → `INPUT_TOO_LARGE`. Opsi digit harus integer positif untuk integer, nonnegatif untuk pecahan, paling besar 24; opsi invalid → `INVALID_NUMBER`. Pertahankan scale sumber (mis. `-12,50` → `{-1250n,2}`); koefisien nol tidak bertanda negatif. Range produk diperiksa tool dengan skala BigInt, bukan opsi min/max tersembunyi.
- `roundRatio(numerator:bigint,denominator:bigint,places=2) -> bigint`: integer hasil yang sudah dikalikan `10^places`, pembulatan **half away from zero**, denominator dinormalkan positif. `formatRatio(n,d,{places=2,trimZeros=false}={}) -> string`: hasil yang sama dengan koma desimal, tanpa grouping. `places` integer 0–12; argumen salah → `INVALID_NUMBER`; denominator nol → `DIVISION_BY_ZERO`. Tidak mengeluarkan `-0`.
- Harga dan persen yang menuntut pembulatan tepat memakai helper ini. Konversi satuan boleh memakai Number dengan batas, presisi, dan toleransi yang dinyatakan task.

`calendar.js`:
- `parseDateOnly(raw) -> {year,month,day}`: tepat `YYYY-MM-DD`, tanpa trim internal, Gregorian proleptik 0001–9999. Format/tanggal mustahil → `INVALID_DATE`. UI boleh trim ASCII tepi dahulu. Leap: divisible 4, kecuali divisible 100 yang bukan divisible 400.
- `toDayNumber(date) -> integer`, `fromDayNumber(n) -> date`; `0001-01-01 = 0`, `9999-12-31 = 3652058`. Input date divalidasi juga. Operasi ordinal di luar rentang atau delta noninteger → `DATE_RANGE`.
- `daysInMonth(year,month) -> integer`; invalid year/month → `INVALID_DATE`.
- `addMonthsClamped(date,delta) -> date`: pindah langsung ke indeks bulan asal + delta, hari dijepit ke akhir bulan target, tanpa mutasi. Hasil keluar rentang → `DATE_RANGE`. Bukan menjumlah satu bulan berulang kali.
- Tidak menggunakan Date/UTC/milidetik dalam fungsi kalender murni. Date hanya untuk tombol hari ini dengan getter tanggal lokal. Task usia menetapkan aturan tahun dahulu lalu bulan; shared tidak menetapkan usia atau persyaratan resmi.

## UX, batas dan privasi

- Header brand/Home; tautan hub `/alat/` hanya setelah hub nyata tersedia. Form cepat terlihat; artikel di bawah alat. Label permanen, focus terlihat, keyboard lengkap, error spesifik, `aria-live="polite"`. Gunakan `setStatus` dengan pesan Indonesia.
- Tombol proses eksplisit; contoh sintetis dan clear/reset. Perubahan input/opsi membatalkan atau menandai hasil stale dan menonaktifkan copy/download lama. Error mempertahankan input. Hasil readonly tetap dapat diseleksi.
- Input dan pesan dinamis melalui `value`/`textContent`, tidak `innerHTML`, eval, fetch URL pengguna atau HTML input. Tidak menulis input ke analytics, query/hash situs, storage, atau log persisten.
- Pengecualian produk 08: hasil link wa.me memuat nomor dan pesan sesuai tujuan alat. Tidak membuka otomatis; copy/download tetap lokal, hanya klik pengguna mengirim ke WhatsApp. Jelaskan perbedaan ini dekat tombol keluar.
- Jangan mengklaim offline sempurna, enkripsi, atau penghapusan aman. Klaim yang boleh setelah diuji: pemrosesan di browser, file/teks tidak diunggah oleh alat. Aset statis tetap diminta ke host saat memuat halaman.
- Batas tepat diterima, satu di atas ditolak; tidak memotong input/hasil diam-diam. Batas per tool mengalahkan default lama yang lebih besar. Media mengikuti 00a; cek sebelum alokasi besar bila memungkinkan.
- UI responsif 320/390/768/1440 px; tidak overflow global. `<noscript>` memberi penjelasan, navigasi/konten statis tetap terlihat. Runtime error/unsupported API memberi pesan yang dapat ditindaklanjuti, bukan halaman kosong.

## SEO, pengujian, dan bukti selesai

- HTML awal memuat title/meta unik, satu H1, intro, langkah pakai, contoh terverifikasi, aturan/batas, dan FAQ relevan. Tidak merender konten SEO hanya lewat JS. Jangan membuat halaman duplikat setiap kata kunci atau fitur belum didukung.
- Canonical absolut, OG unik, viewport, logo/favicon lokal. Structured data opsional WebApplication/BreadcrumbList hanya bila cocok konten; tidak rating palsu atau janji rich results. Navigasi href biasa. Tidak ada link ke rencana, placeholder, atau tool belum siap.
- Tests `/tests/everyday/<slug>.html` dan `.test.js` memakai `/tests/tools/harness.js`: `test`, `assert`, `equal`, `deepEqual`, `throws`, `run`. Runner `noindex,nofollow`, tanpa npm/test framework. Pakai fake/injection hanya untuk kegagalan API; tes end-to-end juga memakai API asli.
- Laporkan jumlah fixture pass/fail, browser, direct route + refresh, keyboard, ukuran layar, console/Network, download bila ada, dan `git diff --check`. Tidak perlu mengulang seluruh suite developer tools pada setiap tool yang terisolasi; lakukan smoke integrasi setelah menyentuh file bersama.
- Tidak ada bukti browser berarti status belum terverifikasi, bukan selesai. Jangan mengganti kegagalan fixture dengan mengubah expected agar sama kode; periksa aturan dan sumber dulu.
- Setiap task selesai menulis catatan: tanggal, model yang benar-benar digunakan bila diketahui, file berubah, fixture, QA, keterbatasan. Model di prompt adalah rekomendasi; pemilihan model dilakukan pengguna melalui pengaturan chat.
