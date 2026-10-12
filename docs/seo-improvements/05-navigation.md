# SEO 05 — Hub, breadcrumb, dan related links

Status: **struktur dan viewport sampel terverifikasi live**. Prioritas P2. Dependency: tidak ada; lakukan sebelum 08. Temuan: [F05](AUDIT.md#f05--navigasi-harian-dapat-dibuat-lebih-jelas). Bukti browser: [LIVE-CHECK.md](LIVE-CHECK.md#post-publication-browser-verification).

## Scope

Miliki `alat/index.html`, `alat/hub.css` bila diperlukan, breadcrumb 11 alat harian, dan pengulangan related section pada `pembuat-qr-code/index.html`. Tidak mengganti route, menambah kategori kosong, atau mengubah algoritme.

Tambah empat shortcut anchor HTML ke heading Teks/Kalkulator/Tautan/Gambar. Nama kategori sesuai tool yang tersedia saat eksekusi; saat ini dua tool gambar dan belum ada PDF. Breadcrumb setiap alat memakai `Beranda → Alat Online → nama alat`. QR mempertahankan penjelasan workflow WhatsApp → QR dan satu blok Alat terkait; hindari heading berulang untuk tautan yang sama.

## Checklist penerimaan

- [x] Shortcut kategori memakai href ke ID unik di HTML sehingga tetap bekerja tanpa JavaScript.
- [x] Seluruh 11 breadcrumb mengikuti Beranda → Alat Online → nama alat; browser live memeriksa setiap breadcrumb serta `BreadcrumbList` JSON-LD. Route canonical tidak berubah.
- [x] QR mempunyai satu related navigation; tautan WhatsApp tetap terlihat sebagai alat terkait.
- [x] Semua 11 card dan link balik hub tersedia dalam HTML awal; tidak ada link PDF/placeholder.
- [x] Browser live memeriksa hub `/alat/` pada lebar 320/390/768/1440 px; tidak ada horizontal overflow dan empat shortcut kategori tampil. CSS memberi outline `:focus-visible` pada shortcut.
- [x] Pemeriksaan live mencakup 11 breadcrumb/schema, empat shortcut hub, dan satu related block QR. Runner integrasi live lulus 20/21; kegagalan adalah assertion test yang menganggap JSON-LD sebagai JavaScript. Assertion lokal diperbaiki agar hanya menghitung script non-JSON-LD; runner terbit perlu diulang setelah update test tersedia.
- [x] `git diff --check` lulus, checklist/tracker diperbarui; hierarchy akhir ditetapkan Beranda → Alat Online → nama alat untuk TODO08.

## Prompt

```text
Kerjakan hanya docs/seo-improvements/05-navigation.md. Tambahkan shortcut kategori HTML, breadcrumb via /alat/ pada 11 tool, dan rapikan related QR. Jangan menambah tools, kategori kosong atau mengubah algoritme. Pertahankan static/no-JS navigation dan metadata. Uji keyboard, responsive layout dan link/ID dengan runner yang relevan, lalu update checklist/README. Jangan commit, push atau deploy.
```
