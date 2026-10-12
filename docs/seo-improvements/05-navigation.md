# SEO 05 — Hub, breadcrumb, dan related links

Status: **sebagian selesai lokal**. Prioritas P2. Dependency: tidak ada; lakukan sebelum 08. Temuan: [F05](AUDIT.md#f05--navigasi-harian-dapat-dibuat-lebih-jelas).

## Scope

Miliki `alat/index.html`, `alat/hub.css` bila diperlukan, breadcrumb 11 alat harian, dan pengulangan related section pada `pembuat-qr-code/index.html`. Tidak mengganti route, menambah kategori kosong, atau mengubah algoritme.

Tambah empat shortcut anchor HTML ke heading Teks/Kalkulator/Tautan/Gambar. Nama kategori sesuai tool yang tersedia saat eksekusi; saat ini dua tool gambar dan belum ada PDF. Breadcrumb setiap alat memakai `Beranda → Alat Online → nama alat`. QR mempertahankan penjelasan workflow WhatsApp → QR dan satu blok Alat terkait; hindari heading berulang untuk tautan yang sama.

## Checklist penerimaan

- [x] Shortcut kategori memakai href ke ID unik di HTML sehingga tetap bekerja tanpa JavaScript.
- [x] Seluruh 11 breadcrumb mengikuti Beranda → Alat Online → nama alat; route canonical tidak berubah.
- [x] QR mempunyai satu related navigation; tautan WhatsApp tetap terlihat sebagai alat terkait.
- [x] Semua 11 card dan link balik hub tersedia dalam HTML awal; tidak ada link PDF/placeholder.
- [ ] Keyboard/focus dan CSS responsif diperiksa secara source; pemeriksaan visual pada 320/390/768/1440 px menunggu server preview lokal (localhost:4173 menolak koneksi dan sandbox menolak bind server).
- [x] Pemeriksaan statis menghitung target anchor, 11 breadcrumb, card, dan satu related block QR; existing everyday integration runner kini memeriksa hierarchy visual/JSON-LD dan empat shortcut. Syntax runner valid; eksekusi browser menunggu preview.
- [x] `git diff --check` lulus, checklist/tracker diperbarui; hierarchy akhir ditetapkan Beranda → Alat Online → nama alat untuk TODO08.

## Prompt

```text
Kerjakan hanya docs/seo-improvements/05-navigation.md. Tambahkan shortcut kategori HTML, breadcrumb via /alat/ pada 11 tool, dan rapikan related QR. Jangan menambah tools, kategori kosong atau mengubah algoritme. Pertahankan static/no-JS navigation dan metadata. Uji keyboard, responsive layout dan link/ID dengan runner yang relevan, lalu update checklist/README. Jangan commit, push atau deploy.
```
