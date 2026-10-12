# SEO 06 — Konten developer tools

Status: **selesai lokal untuk batch awal (3 halaman)**. Prioritas P2. Query belum tersedia; pilihan merupakan hipotesis berdasarkan kebutuhan yang sudah dicatat di audit. Temuan: [F06](AUDIT.md#f06--konten-lanjutan-perlu-menjawab-masalah-yang-nyata), [F08](AUDIT.md#f08--preview-sosial-seragam-dan-kecil).

## Scope

Kerjakan maksimal tiga halaman per batch. Kandidat awal: `/jsonlint/`, `/timestamp-converter/`, `/json-csv-converter/`; kandidat berdasarkan masalah nyata, belum volume pencarian. Gunakan query/page Search Console untuk mengubah pilihan bila data tersedia. Catat batch, alasan dan input/output sebelum menulis.

Tambahkan worked example yang melengkapi panduan existing: JSON single quotes/trailing comma dan pesan parser nyata; seconds versus milliseconds dan UTC/WIB; ID CSV dengan nol awal serta quotation/delimiter sesuai implementasi. Periksa konten sebelumnya agar tidak mengulang penjelasan atau menjanjikan perbaikan otomatis yang tidak ada.

Tautkan standar/dokumentasi primer yang benar-benar mendukung aturan. Jelaskan maintainer melalui profil Edwin tanpa menambah klaim pengalaman yang belum diberikan. Perbaiki title/snippet hanya jika intent/readability/query menunjukkan alasan; tidak memaksakan panjang karakter atau mengisi kata kunci berulang.

Artikel terpisah tidak wajib. Jika satu query memerlukan tutorial yang lebih lengkap dan intent berbeda, buat brief artikel untuk task 12/source blog yang nyata, bukan halaman sinonim atau blog placeholder.

## Checklist penerimaan

- [x] Batch awal tiga halaman dicatat; pilihan JSONLint, timestamp, JSON-CSV adalah hipotesis kebutuhan dan bukan klaim volume.
- [x] Audit mengonfirmasi worked examples existing: JSON single quotes/trailing comma, timestamp seconds/milliseconds UTC/WIB, ID nol awal dan CSV quote/delimiter; tidak membuat konten pengulangan.
- [x] Contoh dibaca silang dengan batas/behavior pada konten dan logic; input hanya sintetis.
- [x] Link primer ditambahkan setelah memeriksa RFC 8259, RFC 3339, dan RFC 4180; catatan CSV tetap menyatakan semicolon/tab sebagai variasi.
- [x] Tidak ada klaim maintainer/tanggal baru; tautan profil tetap seperti sebelumnya.
- [x] Title/description/canonical tidak berubah; konten HTML awal dan related links tetap ada.
- [x] Tidak ada perubahan algoritme/batas atau halaman baru. `git diff --check` lulus.
- [x] Checklist/tracker mencatat batch; perluasan berikutnya menunggu data/query nyata.

## Prompt

```text
Kerjakan hanya docs/seo-improvements/06-developer-content.md, batch awal maksimal tiga halaman. Baca F06/F08 dan logic existing. Pilih dari query nyata bila ada, jika tidak nyatakan hipotesis. Tambahkan contoh masalah/input/output yang benar dan sumber primer; perbaiki snippet hanya bila ada alasan. Jangan ubah algoritme, buat halaman sinonim atau blog placeholder. Validasi konten/metadata/links dan update checklist/README. Jangan commit, push atau deploy.
```
