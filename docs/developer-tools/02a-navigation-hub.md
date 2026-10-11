# 02a — Menu Developer Tools dan hub website utama

Status: SELESAI secara lokal pada 11 Oktober 2026. Task ini memindahkan bagian navigasi/hub dari task 13 ke prioritas sekarang; task 13 tetap menangani audit SEO dan integrasi berikutnya. Belum dipublikasikan.

## Tujuan

Pengunjung homepage dapat memilih menu **Developer Tools**, membuka direktori `/tools/`, lalu memakai tool yang sudah selesai. Saat task ini dibuat, tool siap adalah JSON Validator & Formatter di `/jsonlint/` dan JSON Diff di `/json-diff/`. Verifikasi kembali file dan status sebelum menampilkan kartu.

Semua halaman berupa HTML, CSS, dan JavaScript vanilla yang siap disajikan GitHub Pages langsung dari repository. Tidak ada compiler, dependency installation, bundler, backend, atau langkah build aplikasi. Native ES modules diproses langsung oleh browser melalui HTTP/HTTPS. Membuka file lokal dengan `file://` bukan kriteria penerimaan karena pembatasan browser terhadap module imports dan path aset dari root.

## Scope dan file

- `index.html`: menu utama dengan label persis `Developer Tools`, href `/tools/`.
- `css/site.css`: penyesuaian minimum bila menu baru membutuhkan ruang pada layar sempit.
- `js/site.js`: hanya jika pengelolaan active navigation/anchor mengganggu link halaman biasa; jangan mengubah perilaku homepage lainnya.
- `tools/index.html`: hub statis memakai `/tools/shared/tools.css`, logo/font lokal yang sudah ada, dan CSS khusus hub bila diperlukan.
- `jsonlint/index.html`, `json-diff/index.html`: link `Developer Tools` ke hub dan breadcrumb `Home → Developer Tools → nama tool`.
- README repository, dokumen task ini, dan tracker: route serta bukti verifikasi.
- Tidak mengerjakan tool baru, logika JSON, shared helper, sitemap/robots, domain, pengaturan GitHub Pages, commit, push, atau deploy. Sitemap/robots tetap task 13.

## TODO implementasi

- [x] Baca README repository, CONTRACT, status 00/01/02, source navigasi homepage, dan git status; pertahankan perubahan existing.
- [x] Tambahkan link `Developer Tools` pada menu utama homepage. Link harus bekerja sebagai anchor HTML biasa, termasuk tanpa JavaScript.
- [x] Pastikan menu dapat ditemukan pada desktop dan mobile; tidak tersembunyi atau menyebabkan overflow setelah penambahan link.
- [x] Buat `/tools/index.html` dengan satu H1 `Developer Tools`, intro Inggris singkat, serta kartu statis untuk tool yang benar-benar siap.
- [x] Kartu JSON Validator & Formatter menjelaskan validasi sintaks, format, dan minify; kartu JSON Diff menjelaskan perbandingan struktur dan perubahan nilai.
- [x] Gunakan href langsung `/jsonlint/` dan `/json-diff/`. Jangan membuat kartu coming soon atau link untuk task 03–12.
- [x] Hub menyertakan brand, link Home `/`, dan link kontak `/#contact`; tampilkan informasi pemrosesan lokal secara singkat.
- [x] Tambahkan navigasi dan breadcrumb kembali ke hub pada kedua tool yang siap. Label menu konsisten `Developer Tools`.
- [x] Hub memiliki title `Free Developer Tools | Edwin Lab`, description unik, canonical `https://edwinlab.dev/tools/`, viewport, lang, favicon, dan OG metadata; pertahankan CNAME yang ada.
- [x] Direktori, navigasi, dan copy utama berupa HTML statis. Hub tidak membutuhkan JavaScript dan tidak memuat library parser milik tool.

## TODO kompatibilitas GitHub Pages

- [x] Pastikan `/`, `/tools/`, `/jsonlint/`, dan `/json-diff/` masing-masing memiliki `index.html` asli; tidak mengandalkan fallback SPA atau rewrite server.
- [x] Pastikan seluruh CSS, font, logo, script, dan dependency module tersedia di repository dan dapat diakses melalui path sebenarnya, termasuk kapitalisasi nama file.
- [x] Tidak menambahkan npm, package.json, framework, compiler, transpiler, build output yang harus digenerate, atau runtime CDN.
- [x] Pertahankan script browser siap pakai dan import lokal berekstensi `.js`; browser menjalankan module langsung melalui HTTPS di GitHub Pages.
- [x] Verifikasi dengan server file biasa dari root repository tanpa instalasi atau build. Server lokal hanya untuk preview dan tidak diperlukan di sisi pengunjung situs GitHub Pages.
- [x] Dokumentasikan bahwa target adalah user site dari root (`edwinlab.github.io`) dengan CNAME existing `edwinlab.dev`; bukan project site bersubpath. Jangan menjanjikan dukungan `file://`.

## QA dan definition of done

- [x] Jalur homepage → Developer Tools → masing-masing tool → hub → homepage bekerja; refresh/direct load semua route berhasil melalui HTTP lokal.
- [x] Uji 320/390/768/1440 px, tab keyboard, focus, label link, dan kontras. Navigasi dan hub tetap dapat dipakai tanpa JavaScript.
- [x] Jalankan runner foundation, JSONlint, dan JSON Diff yang tersedia; catat jumlah pass/fail dan smoke test contoh, proses, clear, serta copy.
- [x] Tidak ada broken links/aset, import error, console error, atau pemuatan parser yang tidak perlu di homepage/hub.
- [x] `git diff --check` lulus; catat file yang berubah dan bukti QA pada dokumen ini.
- [x] Centang task ini pada tracker hanya setelah QA lokal lulus. Bedakan siap deploy dari sudah live; verifikasi publik tetap menunggu deployment yang diminta pengguna.

## Hasil aktual dan verifikasi

- File yang diubah: `index.html`, `css/site.css`, `jsonlint/index.html`, `json-diff/index.html`, `README.md`, dokumen ini, dan `docs/developer-tools/README.md`. File baru: `tools/index.html` dan `tools/hub.css`. Tidak ada perubahan pada logika tool atau helper bersama.
- Menu homepage membuka `/tools/`; kedua kartu membuka `/jsonlint/` dan `/json-diff/`; link pada tool kembali ke hub, lalu Home ke `/`. Semua route dibuka langsung dan di-refresh dari server file lokal `http://127.0.0.1:4173/`.
- Pada 320, 390, 768, dan 1440 px, homepage dan hub tidak memiliki overflow horizontal. Menu homepage dan dua kartu tetap terlihat. Fokus keyboard pada link skip hub tampil dengan outline solid 3 px. Hub memakai link HTML statis dan tidak memuat JavaScript aplikasi; konten, breadcrumb, dan navigasi tetap tersedia tanpa JavaScript. Mode JavaScript-disabled belum disimulasikan secara terpisah.
- Fixture browser: foundation **31/31**, JSONlint **20/20**, JSON Diff **17/17** lulus. Smoke test JSONlint: load example, Format, copy feedback, Clear. Smoke test JSON Diff: load example, Compare (3 perubahan), copy feedback, Clear. Konsol browser tidak mencatat warning/error pada review route.
- Keempat route memiliki `index.html` asli; referensi HTML lokal yang diperiksa tersedia; gambar termuat; CSS, logo, dan module script termuat dari origin lokal. `git diff --check` lulus. `CNAME` tetap `edwinlab.dev`. Situs siap disajikan GitHub Pages dari root setelah deployment terpisah; URL publik belum diverifikasi.

## Prompt siap tempel

```text
Implementasikan hanya docs/developer-tools/02a-navigation-hub.md.
Tambahkan menu Developer Tools ke website utama, hub /tools/, serta navigasi
untuk JSONlint dan JSON Diff yang sudah selesai. Baca CONTRACT dan status task terkait.
Gunakan HTML CSS JavaScript vanilla yang langsung disajikan GitHub Pages dari root repo,
tanpa compiler, npm, framework, bundler, backend, atau build aplikasi.
Jangan mengerjakan tool 03–12, sitemap/robots, atau deploy/push/commit.
Verifikasi navigasi, direct route/refresh, responsive, no-JS, dan suite existing.
Setelah selesai, catat hasil aktual dan perbarui checkbox task serta tracker utama.
```
