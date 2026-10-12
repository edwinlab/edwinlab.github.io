# SEO 09 — Preview saat dibagikan

Status: **metadata dan asset live terverifikasi; platform preview pending**. Batch: homepage, `/tools/`, `/alat/`, `/jsonlint/`, `/link-whatsapp/`, `/kompres-gambar/`. Temuan: [F08](AUDIT.md#f08--preview-sosial-seragam-dan-kecil). Bukti browser: [LIVE-CHECK.md](LIVE-CHECK.md#post-publication-browser-verification).

## Scope

Buat asset statis baru di `assets/social/` serta metadata halaman batch awal homepage, dua hub, JSONLint, link WhatsApp, kompres gambar. Logo asli tetap dipertahankan. Preview menjelaskan nama/fungsi halaman dengan branding Edwin Lab; tidak memuat screenshot data pengguna, rating atau fitur fiktif.

Gunakan gambar landscape dengan rasio yang cocok platform sasaran, contoh 1200×630 sebagai pilihan desain, bukan persyaratan ranking Google. Simpan PNG/JPEG siap hosting tanpa dependency runtime/build. Periksa hasil pada ukuran thumbnail kecil dan hindari teks detail yang tidak terbaca.

Lengkapi OG/Twitter metadata secara konsisten, termasuk URL absolut, gambar yang tepat, card type, dimensions/alt bila relevan. Pertahankan title/description search yang jujur; social image bukan alasan mengubah canonical.

## Checklist penerimaan

- [x] Batch enam halaman untuk Open Graph/Twitter dicatat; aset PNG statis siap hosting.
- [x] Warna/logo Edwin Lab dipakai; judul/fungsi tiap halaman terbaca pada ukuran thumbnail dan tidak memuat klaim palsu.
- [x] OG/Twitter title, description, URL absolut, image, image alt dan dimensi konsisten dengan halaman; Twitter large image.
- [x] Enam aset berukuran 1200×630, total sekitar 344 KB; favicon/logo asli tetap dipertahankan dan tidak ada data pengguna.
- [x] Seluruh enam asset berhasil dibuka publik di browser sebagai PNG 1200×630; halaman batch merujuk ke image yang sesuai.
- [ ] Facebook/LinkedIn/X preview debugger tetap pending; asset fetch sukses tidak membuktikan preview platform.
- [x] Tidak mengklaim social metadata menaikkan ranking.
- [x] Pemeriksaan metadata/path, visual thumbnail, syntax runner, dan `git diff --check` lulus; runner tools kini memeriksa enam metadata/assets. Eksekusi browser live menunggu publikasi.

## Prompt

```text
Kerjakan hanya docs/seo-improvements/09-social-preview.md. Buat preview statis untuk batch yang ditentukan, gunakan logo/brand asli dan fungsi yang ada. Lengkapi OG/Twitter metadata dengan asset/URL yang benar tanpa mengubah canonical atau algoritme. Tidak perlu framework/compiler/runtime library baru. Periksa thumbnail, ukuran asset dan meta; catat live/platform preview yang masih pending. Update checklist/README, jangan commit, push, deploy atau memposting.
```
