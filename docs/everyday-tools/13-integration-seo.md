# 13 — Hub Alat Online, menu utama, dan SEO

Status: **parsial — integrasi lokal untuk tools 01–11**. Model: **GPT-6 Luna · high**. TODO12 belum dimasukkan karena prasyarat render visual PDF 00a/P masih tertunda. Integrasi ini belum dipublikasikan.

## Scope dan sumber kebenaran

- [x] Baca README/CONTRACT dan catatan bukti task yang akan ditautkan; inspeksi file nyata, jangan mengandalkan tracker saja. Jika tool belum diuji, jangan menganggap siap atau mencentang task tersebut.
- [x] Miliki `alat/index.html`, CSS kecil bila perlu, perubahan navigasi homepage dan `/tools/index.html`, navigasi/related di halaman tool yang siap, `sitemap.xml`, `robots.txt` hanya bila perlu, `tests/everyday/index.html`, `integration.html`, `integration.test.js`, dan dokumentasi README utama bila diperlukan.
- [x] CNAME, `.nojekyll`, kode algoritme tool, shared/vendor, branding, konten profil/CV dan developer tools lainnya tidak menjadi scope. File homepage/CSS boleh diubah minimal untuk menu; jangan merombak portfolio lagi.
- [x] Hub berbasis HTML statis `lang=id`, route `/alat/`, canonical `https://edwinlab.dev/alat/`. Public title `Alat Online Gratis untuk Kebutuhan Sehari-hari | Edwin Lab`, H1 `Alat Online`. Category: Teks, Kalkulator, Tautan, Gambar & Dokumen; tampilkan hanya kategori yang punya tool siap.

## Integrasi batch

- [x] Tambah menu homepage `Alat Online` pada desktop/mobile dengan href `/alat/`; menu `Developer Tools` tetap menuju `/tools/`. Layout diuji empat ukuran layar. Focus keyboard dan aktivasi menu lewat keyboard belum diverifikasi.
- [x] Buat 11 card nama/deskripsi/tautan langsung untuk tools yang sudah punya runner, tanpa badge palsu, coming soon, search kosong, atau placeholder. Semua card ada dalam HTML awal; filter JS tidak diperlukan V1.
- [x] Hub menautkan Beranda dan Developer Tools; dev hub menambahkan tautan singkat Alat Online tanpa mengganti title/H1/canonical/kartu dev. Tidak mencampur slug kedua koleksi menjadi duplikat.
- [x] Tool 01–11 menautkan Beranda/hub dengan HTML href biasa. Related mengaktifkan 01↔02, 03↔04, 05↔06, 08↔09, dan 10↔11; TODO12 belum tersedia dan tidak ditautkan.
- [x] Periksa title/meta/H1/canonical/OG/lang/noscript/copy tiap halaman terintegrasi. Konten unik sesuai task, tanpa janji fitur yang belum didukung seperti target 200 KB/OCR/QR dinamis.
- [x] Sitemap mempertahankan 14 URL publik lama dan menambah 11 tool serta satu hub: total 26 URL unik. Tidak menghapus URL yang ada.
- [x] Robots tetap mengizinkan halaman publik dan menunjuk sitemap canonical. Runner/fixtures/vendor tidak dimasukkan sitemap; seluruh 14 runner HTML memakai noindex. Halaman publik tetap indexable.
- [x] Index tes `/tests/everyday/` hanya menautkan runner nyata dan memakai noindex. Halaman publik tetap terpisah dari runner.

## Audit lokal tanpa build

- [x] Runner integrasi memakai harness lama dan menginventaris route batch 01–11. Ia memeriksa HTTP resource/index, asset/module, metadata unik, canonical tunggal, satu H1, lang=id, noindex runner, dan tidak noindex halaman publik.
- [x] Sitemap valid XML, URL unik dan absolut; semua route sitemap cocok dengan halaman/canonical statis yang benar.
- [x] Internal href relevan, crosslink dan asset lokal diperiksa. Tidak ada link placeholder pada hub; input pengguna tidak dimasukkan ke metadata/schema.
- [ ] Browser: direct route hub dan menu home terverifikasi; runner memeriksa hub/menu 320/390/768/1440 px. Refresh integrasi, keyboard/focus, no-JS runtime, console, Network, dan smoke suite developer belum diverifikasi dalam task ini. Console/Network tidak diklaim bersih.
- [x] Aplikasi disajikan dari folder GitHub Pages melalui server HTTP statis tanpa npm/compiler/build. Tidak ada workflow build.
- [x] `git diff --check`, pemeriksaan scope/perubahan pengguna, jumlah card dan URL selesai. Integrasi lokal belum berarti sudah deployed.

## Catatan progres per batch

| Batch | Tool yang diverifikasi | Card / sitemap | Hasil tes & browser | Status |
|---|---|---|---|---|
| A–C, integrasi kumulatif | 01–11; 12 ditahan sampai 00a/P diverifikasi visual | 11 card; 26 URL publik unik | Runner 19/19; hub/home nav langsung diuji; 4 ukuran layar | Parsial |

- [ ] Integrasi lokal seluruh tool yang direncanakan selesai. Tools 01–11 sudah diintegrasikan; TODO12/P masih tertunda. Tracker 13 tetap parsial sampai batch PDF dapat diverifikasi.

## Sesudah publikasi — terpisah dari selesai lokal

- [ ] Publikasi belum diminta. Live domain/HTTPS, redirect, dan status index belum diperiksa — di luar penyelesaian lokal.
- [ ] Search Console belum diakses atau digunakan; tidak membuat monitoring atau mengirim sitemap ke layanan eksternal.

## Prompt eksekusi

```text
Kerjakan hanya docs/everyday-tools/13-integration-seo.md untuk batch tool yang sudah selesai dan teruji saat ini. Baca README/CONTRACT, inspeksi bukti task dan file nyata; jangan implementasikan tool yang belum siap. Gunakan GPT-6 Luna high dengan tahap inventaris, hub/menu/links, sitemap, lalu audit. Buat hub Alat Online /alat/, integrasi navigasi dan SEO statis sesuai scope; pertahankan developer tools serta perubahan pengguna. HTML/CSS/JS tanpa npm/build/compiler/backend. Jalankan audit route/metadata/link/sitemap dan QA browser, catat batch/jumlah URL/hasil tes. Update checklist/baris tracker 13 sesuai progres nyata, bukan selesai keseluruhan jika masih ada batch. Jangan commit/push/deploy, submit layanan eksternal atau membuat automasi tanpa permintaan eksplisit.
```
