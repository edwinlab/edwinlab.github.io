# SEO 03 — Crawl live dan Search Console

Status: **sebagian; sampel PSI dan laporan batas dibuat** di [LIVE-CHECK.md](LIVE-CHECK.md). Tool browser tidak mengungkap HTTP status/headers untuk crawl, dan Search Console milik pemilik tidak tersedia. Temuan: [F02](AUDIT.md#f02--blog-memakai-identitas-dan-url-sosial-lama), [F03](AUDIT.md#f03--bukti-indeks-dan-performa-search-belum-tersedia).

## Scope

Pemeriksaan ini sebagian besar read-only. Buat laporan bertanggal `LIVE-CHECK.md` dengan semua 26 route sitemap dan artikel blog yang relevan: requested URL, HTTP status, final URL/redirect chain, canonical HTML, X-Robots-Tag/meta robots, serta asset/link penting. Ambil dari tool yang memang memperlihatkan response; browser berhasil merender bukan bukti status 200. Error lingkungan dicatat sebagai belum terverifikasi, bukan situs down.

Periksa varian domain HTTP/HTTPS, `edwinlab.github.io` dan www bila memang dikonfigurasi. Periksa direct route, trailing slash, dan `index.html` pada sampel; tidak membuat robots noindex untuk canonical duplicates atau mengubah DNS otomatis. Inventaris sitemap/blog sitemap dan pastikan URL final/canonical konsisten.

Bagian Search Console dilakukan di properti milik Edwin ketika akses/instruksi untuk pengaturan/submission tersedia: cek verification, sitemap report, Page Indexing, serta URL Inspection pada homepage, dua hub, dua developer tools, dua alat harian, dan satu artikel blog. Catat user-declared versus Google-selected canonical. File verifikasi repo tidak membuktikan properti aktif.

## Checklist penerimaan

- [ ] Inventory seluruh 26 route dan enam report PSI ditulis; response status/headers tetap belum dapat diambil, bukan dianggap 4xx/5xx.
- [ ] HTTPS/domain variants dan redirect chain belum dapat diukur.
- [ ] Local robots/sitemap dan scope diperiksa; live XML/robots belum terverifikasi.
- [ ] Sitemap blog belum ditemukan; follow-up untuk source dicatat di TODO 02.
- [ ] Akses properti Search Console pemilik tidak tersedia; dependency ini dicatat secara spesifik.
- [ ] Sitemap report dan URL Inspection belum dapat dibaca; tidak ada klaim indexing.
- [x] Baseline Search Console 28 hari dinyatakan belum tersedia; tidak ada data privat direkam.
- [ ] Dokumentasi lama tentang belum live diperbarui hanya untuk fakta publikasi yang telah terbukti; QA lama tidak dicentang tanpa pengujian.
- [x] Checklist/tracker membedakan laporan PSI/public sample, status response tak terukur, dan Search Console pending.

## Prompt

```text
Kerjakan hanya docs/seo-improvements/03-live-indexing.md. Audit read-only seluruh canonical route dari sitemap, domain variants, robots, sitemap, dan sampel blog. Buat LIVE-CHECK.md dengan status/header/final URL yang benar-benar diperoleh, jangan menyimpulkan status HTTP dari browser render atau error alat. Periksa Search Console bila akses/instruksi akun tersedia; jika tidak, selesaikan audit publik dan catat langkah pemilik. Jangan mengubah DNS, menghapus token, commit/push/deploy atau mengirim sitemap tanpa instruksi untuk tindakan itu. Update checklist/README dengan fakta terverifikasi.
```
