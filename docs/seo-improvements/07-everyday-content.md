# SEO 07 — Konten alat harian

Status: **sebagian selesai lokal untuk batch awal (3 halaman)**. TODO 04 selesai lokal; query Search Console belum tersedia. Temuan: [F06](AUDIT.md#f06--konten-lanjutan-perlu-menjawab-masalah-yang-nyata).

## Scope

Batch awal maksimal tiga halaman: `/penghitung-kata/`, `/ubah-huruf/`, dan `/kalkulator-tanggal/`. Sederhanakan petunjuk utama yang menyebut textarea, LF, whitespace JavaScript, grapheme cluster, endpoint atau exact. Rincian teknis tetap dapat dipertahankan dalam penjelasan lanjut dengan contoh; jangan mengubah definisi hasil.

Gunakan petunjuk yang membantu pembaca memilih input dan menafsirkan hasil: spasi/baris/paragraf yang dihitung, kapital setiap kata bukan editorial title case, serta selisih tanggal default tidak menghitung kedua ujung. Cross-check policy tepat di logic sebelum menulis.

Link WhatsApp, diskon, dan kompres gambar sudah punya panduan; perluasan berikutnya memakai query nyata atau brief spesifik, tidak artikel panjang generik. Kompresi tidak dijanjikan selalu lebih kecil/200 KB; tool tanggal tidak dijanjikan hari kerja; usia bukan verifikasi identitas.

## Checklist penerimaan

- [x] Batch awal tiga halaman dipilih sebagai hipotesis karena contoh hitung kata, kapitalisasi, dan selisih tanggal yang umum; tidak mengklaim query volume.
- [x] Contoh terverifikasi: “Halo dunia!” = 2 kata/11 karakter; NASA/iPhone berubah dengan mode kapital awal; 28 Feb–1 Mar 2024 = 2 hari.
- [x] Petunjuk utama disederhanakan; rincian batas, format baris dan perilaku merek ditempatkan di panduan/contoh lanjutan.
- [x] Klaim hasil tetap sesuai logic; tidak menambah fitur/batas baru.
- [x] Metadata, H1, canonical, form/CTA tidak berubah; copy Bahasa Indonesia tersedia dalam HTML statis.
- [ ] Pemeriksaan source/copy selesai dan `git diff --check` lulus; visual layout mobile menunggu preview karena server localhost tidak dapat dibuka di sandbox.
- [x] Checklist/tracker mencatat batch dan keterbatasan; tidak mengubah algoritme.

## Prompt

```text
Kerjakan hanya docs/seo-improvements/07-everyday-content.md setelah task04. Batch awal penghitung kata, ubah huruf, kalkulator tanggal. Baca algoritme lalu sederhanakan petunjuk utama dan tambah contoh yang benar. Jangan mengubah algoritme/batas atau menjanjikan fitur baru. Pertahankan rincian presisi pada penjelasan lanjut, HTML static dan metadata. Verifikasi konten/layout dan update checklist/README. Jangan commit, push atau deploy.
```
