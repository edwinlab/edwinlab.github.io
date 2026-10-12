# SEO 02 — Identitas dan canonical blog

Status: **sebagian; source belum ditemukan**. Penelusuran folder `/Users/edwinlab/Work` hanya menemukan repo website utama dan proyek lain yang tidak memuat blog; pencarian exact phrase juga tidak menemukan source di folder kerja. Tidak ada file blog yang diubah. Dependency pemilik: akses repository/CMS/deployment yang benar. Temuan: [F02](AUDIT.md#f02--blog-memakai-identitas-dan-url-sosial-lama).

## Scope

Blog sudah live di `/blog/`, tetapi source tidak ada di checkout utama. Temukan source yang benar dari proyek/repository milik pengguna dan pelajari cara deployment-nya. Jangan membuat blog kosong atau menimpa route blog pada repo ini.

Scope pertama adalah layout/head/shared navigation blog: perbarui identitas ke profil Edwin yang sudah dikonfirmasi, LinkedIn `/in/edwinlab/`, kontak publik yang dipakai homepage, tautan kembali ke homepage dan hub tools, canonical per halaman, `og:url`/social image URL, serta metadata index dan artikel. Hilangkan pembentukan URL `edwinlab.github.io/blog/blog/…`. Jangan memperbarui tanggal asli artikel atau mengklaim artikel lama sebagai panduan teknologi terbaru.

Inventaris blog index, lima artikel yang terlihat di index, tag/archive, feed, serta sitemap blog jika ada. Prioritaskan artikel/index untuk sitemap; tag/archive hanya bila berguna dan sengaja indexable. Root sitemap atau sitemap index boleh disesuaikan setelah URL canonical dan pemilik source jelas; jangan menciptakan daftar URL yang belum diperiksa.

## Checklist penerimaan

- [ ] Source/deployment blog belum tersedia; temuan dan brief patch spesifik di bawah dicatat. Tidak membuat placeholder.
- [ ] Metadata index memakai identitas saat ini; tiap artikel mempunyai title/description/canonical sendiri pada HTML awal.
- [ ] Canonical dan og:url memakai `https://edwinlab.dev/blog/…` tanpa prefix blog ganda. Permalink lama yang sah dipertahankan.
- [ ] Blog menautkan homepage/tools secara kontekstual dan profil/kontak cocok dengan homepage.
- [ ] Tiga artikel yang ditautkan homepage diuji melalui direct navigation dan refresh, bukan hanya navigasi client.
- [ ] Tanggal 2017/2018 dipertahankan; artikel diberi konteks versi/arsip bila diperlukan, bukan sekadar tanggal baru.
- [ ] Sitemap blog/root diinventaris; hanya canonical indexable yang ditambahkan. Feed dan tag tidak dicampur otomatis ke sitemap.
- [ ] Status HTTP/headers, canonical source, gambar, dan internal links diperiksa setelah publikasi terpisah. Perubahan source versus live dicatat.
- [ ] Tracker/checklist diperbarui; koordinasikan perubahan sitemap dengan 03/10.

## Brief patch menunggu source

- Blog index `https://edwinlab.dev/blog/`: ganti job identity/lokasi publik yang lama dengan identitas yang cocok dengan homepage, tautkan LinkedIn `https://www.linkedin.com/in/edwinlab/`, dan tetapkan canonical ke URL blog final yang nyata. Metadata saat audit menyebut `https://edwinlab.github.io/blog/blog/` dan canonical tidak tampak di DOM.
- Artikel `https://edwinlab.dev/blog/posts/partitioning-in-postgresql`: pertahankan permalink dan tanggal terbit asli; betulkan `og:url` yang terlihat sebagai `github.io/blog/blog/posts/...`; beri canonical, title/description unik dari source artikel.
- Inventaris index, lima artikel yang ditautkan, archive/tag, feed, sitemap, homepage/blog links dan preview image; jangan masukkan seluruh archive/tag otomatis ke sitemap.
- Verifikasi direct navigation dan refresh dari homepage untuk 3 artikel, serta response headers/status dan final canonical setelah deployment.
- Belum ada patch yang dapat diterapkan sampai source/CMS tersedia. Identitas aktual untuk link kontak publik juga harus disalin dari homepage, bukan diarang.

## Prompt

```text
Kerjakan hanya docs/seo-improvements/02-blog-seo.md. Blog live tetapi source tidak ada di checkout utama: temukan source yang benar sebelum mengedit, jangan membuat placeholder atau menimpa /blog. Betulkan identitas, canonical dan OG yang memakai github.io/blog/blog, pertahankan artikel/permalink/tanggal asli. Ikuti kemampuan deployment blog yang nyata; tidak memperkenalkan compiler baru ke website utama. Jika source belum tersedia, selesaikan inventaris dan brief patch dari URL terverifikasi lalu laporkan dependency. Update checklist/README berdasarkan bukti. Jangan commit, push, deploy atau mengubah proyek lain tanpa scope yang sesuai.
```
