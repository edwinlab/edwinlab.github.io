# Review SEO — Edwin Lab

Tanggal audit: **12 Oktober 2026, Asia/Jakarta**. Scope: homepage, kedua hub tools, 23 tools yang sudah tersedia, serta integrasi blog. Temuan audit ditindaklanjuti secara lokal melalui TODO 01 dan 04–12; perubahan belum dipublikasikan. TODO 02/03 masih memiliki dependency source blog, response-level crawl, dan akses Search Console.

## Metode dan batas bukti

Audit source membaca semua **26 URL unik** di `sitemap.xml` dan halaman HTML lokalnya. Pemeriksaan parser menemukan 26 title unik, 26 description unik, satu H1 per halaman, canonical sesuai route, serta `og:url` konsisten. Distribusi bahasa: 14 halaman Inggris dan 12 Indonesia. Structured data ada pada 13 halaman developer tools/hub.

Browser live merender `/`, `/tools/`, `/alat/`, `/jsonlint/`, `/timestamp-converter/`, `/link-whatsapp/`, `/kompres-gambar/`, `/index-master.html`, `/blog/`, dan `/blog/posts/partitioning-in-postgresql`. Metadata DOM diperiksa pada halaman-halaman tersebut. Blog mengubah judul artikel sesudah navigasi client; audit artikel memakai state setelah konten selesai muncul.

Tidak ada bukti response header/HTTP status penuh, redirect chain, hasil crawling Google, Search Console, keyword volume, posisi, traffic, backlinks, atau metrik CWV. Terminal audit tidak dapat resolve domain; akses sitemap melalui browser sebelumnya diblokir client. Keterbatasan alat ini **tidak membuktikan sitemap/website rusak**. Source sitemap/robots bisa diperiksa, tetapi live response keduanya belum terverifikasi. HTML `noindex` yang tidak ditemukan juga tidak membuktikan tidak ada `X-Robots-Tag` pada response.

Source blog tidak ada pada checkout ini; bukti blog berasal dari browser live. Perbaikan blog perlu source/deployment miliknya, bukan membuat direktori placeholder di repo utama.

## Fondasi yang sudah baik

| Aspek | Bukti |
|---|---|
| Metadata konsisten | Seluruh 26 halaman sitemap: title/description unik, canonical self route, satu H1, `og:url` sesuai |
| Crawling source tidak diblokir | [robots.txt](../../robots.txt) mengizinkan crawling dan menunjuk sitemap domain utama |
| Sitemap lokal valid | [sitemap.xml](../../sitemap.xml) berisi 26 URL unik; setiap URL punya halaman lokal yang cocok |
| Penemuan tools | [Developer Tools](../../tools/index.html) menautkan 12 tools; [Alat Online](../../alat/index.html) menautkan 11 tools melalui HTML biasa |
| Konten awal | Petunjuk, contoh, aturan, batas, FAQ, dan related links ada pada HTML source |
| Struktur developer | 12 tool memuat JSON-LD `WebApplication` dan `BreadcrumbList` yang dapat diparse |
| Bahasa | `lang=en` pada homepage/developer tools dan `lang=id` pada alat harian cocok dengan konten |
| Kinerja dasar source | Font lokal memakai `font-display:swap`; hub tidak memuat script aplikasi; dependensi berat terisolasi pada tool terkait |
| Pengujian internal | Runner lama mencakup metadata/link/sitemap; halaman tes memakai noindex. Ini tidak membuktikan hasil Google atau kinerja mobile live |

Tidak ada dasar untuk mengulang seluruh metadata, menganggap semua halaman Indonesia perlu diterjemahkan, atau menganggap ketiadaan JSON-LD pada alat harian sebagai kegagalan indexing.

## Temuan dan peluang terurut

### F01 — Halaman profil legacy masih live

**P1; status diperbarui 12 Oktober 2026.** Audit live merender [index-master.html](../../index-master.html) dengan profil freelance/Jakarta, `og:url=https://edwinlab.github.io`, dan tanpa meta noindex. Tindak lanjut lokal di TODO 01 telah melabelinya sebagai arsip 2022 dan menambahkan `noindex,follow`, tautan ke homepage, serta social metadata di domain utama. Source lokal kini diperbaiki; status live/search masih pending publikasi dan pengindeksan ulang, bukan bukti Google telah menghapus URL.

Dampak: dua profil publik dengan identitas/URL berbeda dapat membingungkan pengunjung dan crawler. Tentukan pengarsipan non-indexable atau pengalihan yang sesuai kemampuan hosting. Jangan mengandalkan `Disallow` sebagai cara menghapus URL dari indeks. [Panduan noindex Google](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

Tindak lanjut: [TODO 01](01-legacy-indexing.md).

### F02 — Blog memakai identitas dan URL sosial lama

**P1; terkonfirmasi browser, source blog belum tersedia.** Blog index berjudul `Edwin Andrianto | Freelance Engineer at Jakarta`, memakai deskripsi lama, LinkedIn `/in/edwinandrianto`, email lama, dan footer Jakarta. DOM tidak memuat canonical. `og:url` index adalah `https://edwinlab.github.io/blog/blog/`; artikel PostgreSQL memakai `https://edwinlab.github.io/blog/blog/posts/partitioning-in-postgresql`.

Artikel PostgreSQL benar-benar terbuka dan memiliki judul/H1/deskripsi artikel setelah navigasi. Jadi temuan adalah metadata/identitas lama dan source terpisah, bukan klaim seluruh blog 404. Dua artikel homepage lainnya belum diverifikasi live pada audit ini.

Sitemap utama lokal tidak memuat blog. Belum diketahui apakah deployment blog mempunyai sitemap sendiri; jangan langsung menggabungkan semua tag/archive tanpa inventaris. Gunakan URL canonical yang konsisten untuk metadata, link, dan sitemap. [Panduan canonical Google](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).

Tindak lanjut: [TODO 02](02-blog-seo.md), [TODO 03](03-live-indexing.md).

### F03 — Bukti indeks dan performa search belum tersedia

**P1; dependency pengukuran.** File verifikasi Google ada di repo, tetapi file token tidak membuktikan properti terverifikasi atau sitemap diproses. Laporan Search Console untuk query, impressions, clicks, CTR, atau Google-selected canonical belum tersedia. PageSpeed Insights berhasil membuat report untuk enam halaman pada 12 Oktober 2026; lihat [LIVE-CHECK.md](LIVE-CHECK.md) dan [PERFORMANCE-CHECK.md](PERFORMANCE-CHECK.md). PSI report tidak mengungkap response status/redirect/headers dan bukan bukti indexing.

Prioritas harus memakai data Search Console ketika tersedia. Saat data belum cukup, catat bahwa pemilihan halaman adalah hipotesis; jangan menciptakan volume keyword atau target traffic. [Performance report](https://support.google.com/webmasters/answer/7576553).

Tindak lanjut: [TODO 03](03-live-indexing.md).

### F04 — Dua penjelasan alat tidak sepenuhnya cocok dengan implementasi

**P1; source copy diperbaiki lokal.** [WhatsApp](../../link-whatsapp/index.html) sebelumnya mengatakan emoji selalu satu karakter. Implementasi menghitung code points: `👨‍👩‍👧‍👦` berjumlah 7 dan `🇮🇩` berjumlah 2. Hint kini menjelaskan emoji gabungan dapat mengambil beberapa code points.

[Diskon](../../kalkulator-diskon/index.html) kini memberi contoh Rp200000 → Rp144000/28%, menyebut unit satu sen = Rp0,01 dan kebijakan midpoint round-half-up; salinan hasil memakai istilah yang sama. Contoh kecil Rp0,05 dengan diskon 50% menjadi Rp0,03 (hemat 40%) sesuai logic. Algoritme tidak berubah.

Checklist dan hasil pemeriksaan: [TODO 04](04-copy-accuracy.md). Live validation menunggu publikasi.

### F05 — Navigasi harian dapat dibuat lebih jelas

**P2; perubahan lokal diterapkan.** Hub kini menyediakan empat shortcut HTML, 11 breadcrumb mengikuti Beranda → Alat Online → tool, dan QR hanya punya satu related block. Link/ID/struktur diperiksa secara statis; visual viewport masih menunggu preview lokal.

Tindak lanjut: [TODO 05](05-navigation.md).

### F06 — Konten lanjutan perlu menjawab masalah yang nyata

**P2; batch konten lokal dilakukan.** Tiga halaman developer sudah menyediakan contoh JSON single quotes/trailing comma, epoch seconds vs milliseconds/WIB, dan CSV ID bernol awal; link RFC 8259, RFC 3339, dan RFC 4180 ditambahkan. Search query/volume tetap tidak tersedia.

Pada batch alat harian, istilah penghitungan kata, kapitalisasi, dan selisih tanggal disederhanakan pada petunjuk utama sambil mempertahankan definisi/limits di panduan. Source copy telah diperiksa; visual layout lokal masih pending.

Konten berguna, contoh asli, sumber relevan, dan informasi maintainer lebih bernilai daripada menetapkan jumlah kata atau memproduksi halaman sinonim massal. [Panduan helpful content Google](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

Tindak lanjut: [TODO 06](06-developer-content.md), [TODO 07](07-everyday-content.md).

### F07 — Structured data adalah kesempatan terbatas, bukan tiket ranking

**P2; perubahan lokal tervalidasi secara sintaks.** Homepage sekarang memakai ProfilePage/Person dari fakta yang dikonfirmasi; hub dan 11 alat punya BreadcrumbList cocok dengan hierarchy yang terlihat. Developer WebApplication markup dipertahankan. 13 halaman baru diparse lokal; Rich Results Test dan URL Inspection menunggu publikasi/akses Search Console. Tidak ada offers/review/rating palsu. [Software-app requirements](https://developers.google.com/search/docs/appearance/structured-data/software-app).

Breadcrumb markup harus mengikuti navigasi yang terlihat. Profil dapat memakai entitas Person yang benar; pemakaian ProfilePage harus sesuai panduan aktual. Tidak ada jaminan tampilan khusus. FAQ rich results Google sudah dihentikan sejak Mei 2026; FAQ teks tetap dapat dipertahankan. [Changelog resmi Google](https://developers.google.com/search/updates#may-2026).

Tindak lanjut: [TODO 08](08-structured-data.md).

### F08 — Preview sosial seragam dan kecil

**P2; aset preview lokal dibuat.** Enam halaman awal mendapat PNG statis 1200×630 serta OG/Twitter metadata/alt/dimensions. Aset tidak mengganti favicon/logo. Fetch publik dan preview platform menunggu publikasi.

Tindak lanjut: [TODO 09](09-social-preview.md). Revisi title berbasis query/CTR masuk [TODO 06](06-developer-content.md).

### F09 — Kinerja mobile belum diukur

**P2; baseline lab tersedia, field data No Data.** Enam target diuji melalui PSI, Lighthouse 13.5.0; lima mobile tool/hub score 100, homepage 98, homepage desktop 100. LCP mobile ≤1,1 dtk, CLS 0–0,002; PSI menampilkan No Data untuk field/CrUX. Tidak ada bottleneck pengalaman yang membenarkan perubahan produk. Lihat [PERFORMANCE-CHECK.md](PERFORMANCE-CHECK.md); ukur ulang setelah publikasi. [Panduan Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals).

Tindak lanjut: [TODO 10](10-performance-validation.md).

### F10 — Pengukuran penggunaan belum konsisten

**P1; event spec draft, provider belum diketahui.** Homepage/tools tidak menunjukkan analytics tag; blog memuat UA lama yang bisa connected ke GA4. Belum ada property ID dari pemilik atau source blog. [ANALYTICS-SPEC.md](ANALYTICS-SPEC.md) mendokumentasikan event allowlist dan titik integrasi tanpa menambah tag atau mengubah akun. [Panduan migrasi resmi Google Analytics](https://support.google.com/analytics/answer/11583528).

Traffic search perlu dibedakan dari penggunaan tool, unduhan, dan kunjungan ke profil/kontak. Pengukuran memakai event names dan slug; isi input/output pengguna tidak dikirim. Tindak lanjut: [TODO 11](11-measurement.md), [TODO 12](12-growth-review.md).

## Hal yang tidak menjadi backlog otomatis

- Tidak membuat halaman terpisah untuk setiap sinonim keyword atau versi bahasa yang belum direncanakan.
- Tidak menganggap tanggal artikel 2017 sebagai error; artikel dapat diberi konteks arsip/versi dan tanggal asli dipertahankan.
- Tidak menambah keyword meta, rating palsu, atau llms.txt sebagai syarat SEO Google.
- Tidak memasukkan TODO12 Gambar ke PDF ke sitemap sebelum aplikasi tersedia dan terverifikasi.
- Tidak menghapus token Search Console, arsip, atau asset lama hanya karena tidak muncul pada homepage; cek kebutuhan/dependency sebelum perubahan.
- Tidak menyamakan halaman berhasil tampil dengan HTTP 200 terverifikasi, terindeks, berperingkat, atau mendapatkan traffic.

## Hasil yang diharapkan

Perbaikan awal menghasilkan identitas publik yang konsisten, konten tool yang akurat, dan baseline search/use yang dapat diukur. Pengembangan konten, preview, serta distribusi mengikuti query dan kebutuhan pengguna. Tidak ada estimasi kenaikan traffic atau janji ranking dari audit ini.
