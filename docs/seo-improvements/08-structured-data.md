# SEO 08 — Structured data yang sesuai konten

Status: **markup utama terverifikasi live; Rich Results Test pending**. Prioritas P2. Dependency navigasi 05 sudah diterapkan; akses Search Console belum tersedia. Temuan: [F07](AUDIT.md#f07--structured-data-adalah-kesempatan-terbatas-bukan-tiket-ranking). Bukti browser: [LIVE-CHECK.md](LIVE-CHECK.md#post-publication-browser-verification).

Panduan yang diperiksa: [Google Breadcrumb](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb), [Google ProfilePage](https://developers.google.com/search/docs/appearance/structured-data/profile-page), [kebijakan structured data Google](https://developers.google.com/search/docs/appearance/structured-data/sd-policies), dan [Schema.org Person](https://schema.org/Person). Homepage cocok untuk ProfilePage karena konten utamanya profil satu orang; markup tidak memberi logo sebagai portrait.

## Scope

Pertahankan markup developer yang sudah ada. Audit semantic/type/properties, lalu tambahkan breadcrumb JSON-LD pada hub/11 alat harian sesuai hierarchy visible. Pada homepage, definisikan Person dengan nama/URL/job title/sameAs yang benar; pertimbangkan ProfilePage hanya setelah memeriksa eligibility dokumentasi aktual. Logo bukan foto portrait seseorang.

Setiap entity memakai ID/URL domain utama, sesuai konten terlihat, tanpa credentials/review/rating/pekerjaan baru yang tidak diberikan. Data Person tidak membuat klaim rich result atau otomatis ranking.

WebApplication dapat tetap valid untuk semantik walau tidak eligible software-app rich results. Google mengharuskan properti tertentu termasuk rating/review nyata; tanpa bukti tersebut catat bahwa rich result bukan target saat ini. Offers gratis hanya bila memang sesuai harga publik, bukan jalan pintas membuat rating. Tidak perlu menambah FAQPage untuk Google FAQ rich result yang sudah dihentikan.

## Checklist penerimaan

- [x] JSON-LD developer yang ada dipertahankan; JSON-LD baru diparse dan markup existing tidak dihapus.
- [x] Breadcrumb hub/11 alat harian cocok dengan navigasi visible dan canonical; posisi berurutan.
- [x] Person homepage mencerminkan nama, role, employer, LinkedIn dan GitHub yang tampil/terkonfirmasi; logo tidak dipakai sebagai foto orang.
- [x] Type/properties dicocokkan dengan dokumentasi Google dan Schema.org; validitas JSON lokal terpisah dari eligibility rich result.
- [x] Browser mem-parsing `ProfilePage` homepage, `BreadcrumbList` pada hub dan 11 alat harian, serta schema JSON-LD developer pada sampel.
- [ ] Rich Results Test dan URL Inspection Google pending akses Search Console; tidak menyatakan fitur eligible atau lolos Google.
- [x] Tidak ada rating/review palsu, tanggal modifikasi, FAQPage, atau jaminan ranking.
- [x] JSON-LD statis; pemeriksaan parse 13 halaman lulus dan `git diff --check` lulus.
- [x] Checklist/tracker membedakan bukti lokal dari validasi live pending.

## Prompt

```text
Kerjakan hanya docs/seo-improvements/08-structured-data.md setelah05. Baca panduan Google/Schema.org aktual. Pertahankan markup developer, tambah breadcrumb harian yang cocok navigasi dan Person homepage dari fakta terkonfirmasi. Pisahkan valid schema dari rich-result eligibility; jangan membuat rating/review/tanggal palsu atau memakai logo sebagai portrait. Validasi static JSON-LD dan hasil alat yang benar-benar tersedia, update checklist/README. Jangan commit, push atau deploy.
```
