# TODO — Peningkatan SEO Edwin Lab

Tanggal audit: **12 Oktober 2026, Asia/Jakarta**. Website live di **https://edwinlab.dev/** dan pemilik mengonfirmasi perubahan telah dipush ke `master`. Verifikasi browser pascapublikasi untuk route dan asset sampel tercatat di [LIVE-CHECK.md](LIVE-CHECK.md); hal ini bukan bukti HTTP headers, indexing, atau respons Search Console.

Baca [AUDIT.md](AUDIT.md) untuk bukti dan batas pemeriksaan. Audit source mencakup **26 halaman publik: homepage, dua hub, 12 developer tools, dan 11 alat harian**. Pemeriksaan browser live mencakup homepage, kedua hub, empat tool contoh, halaman legacy, blog, serta satu artikel. Halaman tool lainnya diperiksa dari source; jangan menyebut semua route live sudah diaudit.

## Checklist audit

- [x] Inventaris 26 URL sitemap dan pemeriksaan metadata source seluruh halaman.
- [x] Review konten, language, internal links, dan structured data kedua koleksi tools.
- [x] Pemeriksaan sampel live dan identifikasi masalah blog/halaman legacy.
- [x] Rencana task dengan scope, dependency, checklist penerimaan, dan prompt eksekusi.
- [x] Perbaikan source TODO 01 dan 04–09 telah dipublikasikan; route sampel, seluruh 11 breadcrumb alat harian, dan enam social image telah diperiksa di browser live.
- [ ] Verifikasi visual lintas viewport 320/390/768/1440 px dan platform social preview.
- [ ] Verifikasi HTTP/header/redirect semua URL publik.
- [ ] Bukti Search Console, indeks, traffic, dan Core Web Vitals.

## Tracker implementasi

TODO 01 dan 04–09 telah dikerjakan lokal dalam scope batch yang dijelaskan tiap task; TODO 10 mempunyai baseline live; TODO 11/12 memiliki draft. Verifikasi sesudah publikasi, visual QA lokal, HTTP headers, Search Console, source blog, dan provider analytics masih memiliki dependency.

| Status | TODO | Prioritas | Pemilik / dependency |
|---|---|---|---|
| Sebagian (meta `noindex,follow` terverifikasi live; response headers/status pending) | [01 — Tangani halaman legacy](01-legacy-indexing.md) | P1 | Repo ini; independen |
| Sebagian; source blog belum ditemukan | [02 — Identitas dan canonical blog](02-blog-seo.md) | P1 | Source blog terpisah perlu ditemukan |
| Sebagian; 6 URL PSI; HTTP headers/GSC pending | [03 — Crawl live dan Search Console](03-live-indexing.md) | P1 | Pemeriksaan publik; akses pemilik untuk Search Console |
| Selesai; contoh live teruji | [04 — Koreksi penjelasan tool](04-copy-accuracy.md) | P1 | Repo ini; independen |
| Sebagian; semua 11 breadcrumb/schema live; 20/21 runner lulus, satu assertion JSON-LD diperbaiki lokal dan perlu re-run | [05 — Hub, breadcrumb, dan related links](05-navigation.md) | P2 | Repo ini; sebelum 08 |
| Selesai; batch 3 halaman terverifikasi live; query belum ada | [06 — Konten developer tools](06-developer-content.md) | P2 | Gunakan data 03 bila tersedia; batch kecil |
| Selesai untuk batch 3 halaman; live copy dan 4 lebar sampel diperiksa | [07 — Konten alat harian](07-everyday-content.md) | P2 | Setelah 04; gunakan data 03 bila tersedia |
| Sebagian; markup utama diverifikasi di browser; Rich Results/Search Console pending | [08 — Structured data yang sesuai konten](08-structured-data.md) | P2 | Setelah 05; tidak mensyaratkan rich result |
| Sebagian; 6 aset + metadata terverifikasi live; platform preview pending | [09 — Preview saat dibagikan](09-social-preview.md) | P2 | Repo ini; peningkatan distribusi |
| Sebagian; baseline PSI 6 halaman dan viewport sampel; re-run runner publik serta CrUX pending | [10 — Kinerja mobile dan regresi SEO](10-performance-validation.md) | P2 | Ukur sebelum mengubah; cek batch sebelumnya |
| Sebagian; event spec selesai; provider/property menunggu pemilik | [11 — Analytics dan penggunaan tools](11-measurement.md) | P1 | Pilihan layanan/ID yang nyata dari pemilik |
| Sebagian; 3 brief dan draft LinkedIn; evaluasi pending | [12 — Distribusi dan evaluasi query](12-growth-review.md) | P2 | Setelah 03; 06/07/09/11 bila tersedia |

P1 berarti tindakan awal karena ada informasi publik yang keliru atau bukti dasar belum tersedia. P2 berarti peningkatan setelah baseline. Prioritas ini bukan estimasi volume keyword atau jaminan ranking.

## Urutan eksekusi

1. Perbaikan source TODO 01 dan 04–09 telah dipublikasikan; pemeriksaan browser sampel tercatat. Berikutnya jalankan QA viewport, validasi Rich Results/platform preview, dan PSI ulang setelah publikasi.
2. Minta akses repository/CMS blog untuk TODO 02 dan properti Search Console untuk TODO 03. Hanya owner dapat memberikan akses tersebut.
3. Pilih provider/property analytics untuk mengaktifkan event spec TODO 11; jangan memasang ID asumsi. Draft TODO 12 siap direview dan dipublikasikan secara manual.
4. Mulai evaluasi query dan traffic setelah perubahan benar-benar live dan baseline cukup; hindari klaim dampak dari tes lab.

Jangan menjalankan dua executor bersamaan jika keduanya mengedit homepage, hub, sitemap, shared CSS, atau runner yang sama. Task hanya menulis file miliknya; tambahan scope dicatat sebelum implementasi.

## Aturan bersama

- Pertahankan **HTML, CSS, vanilla JavaScript** dan GitHub Pages; runtime tanpa compiler, npm, backend, atau framework baru.
- Pertahankan domain `https://edwinlab.dev/`, route yang sudah ada, bahasa Inggris untuk homepage/developer tools, dan Bahasa Indonesia untuk alat harian. Tidak membuat terjemahan/hreflang tanpa halaman ekuivalen yang nyata.
- Pertahankan algoritme, batas input, worker, local processing, serta informasi profil yang sudah dikonfirmasi. Pisahkan perubahan fitur dari task SEO.
- Metadata dan konten utama tetap tersedia di HTML awal. Canonical, sitemap, dan internal href harus konsisten.
- Klaim search volume, ranking, indexing, HTTP, analytics, dan CWV hanya berdasarkan bukti. Jangan mengganti fakta yang belum tersedia dengan angka nol atau klaim sukses.
- Jangan membuat rating/review palsu, tanggal pembaruan semu, halaman keyword duplikat, meta keywords, atau persyaratan jumlah kata. FAQ tetap berguna sebagai teks; tidak perlu mengejar FAQ rich results Google.
- Jangan merekam isi JSON/JWT, nomor/pesan WhatsApp, teks pengguna, nama/isi file, atau output tools ke analytics. Task 11 mengatur payload allowlist.
- Perubahan local, review, dan pengecekan diperbolehkan sesuai task yang diminta. Commit, push, deployment, pengaturan akun, dan posting eksternal memerlukan instruksi sesi yang sesuai; roadmap ini sendiri tidak mengeksekusinya.
- Setelah eksekusi: update checklist task dan baris tracker ini berdasarkan bukti, catat file/QA/batas. Gunakan status **Sebagian** jika local selesai tetapi akses pemilik atau verifikasi live belum tersedia.

## Prompt umum

```text
Kerjakan hanya docs/seo-improvements/NN-nama-task.md. Baca README.md dan temuan terkait di AUDIT.md. Ikuti scope, dependency, dan acceptance checklist task. Pertahankan HTML/CSS/vanilla JS dan GitHub Pages. Jangan mengimplementasikan task lain atau fitur baru. Jalankan pemeriksaan yang relevan, lalu update checklist task dan baris tracker README berdasarkan bukti. Jika akses/data luar repo belum tersedia, selesaikan pekerjaan independen dan catat dependency secara spesifik. Jangan commit, push, deploy, mengubah akun, atau memposting tanpa instruksi eksplisit untuk tindakan itu.
```

Link review SEO ini ditambahkan ke [README repository](../../README.md). Bukti Search Console atau analytics yang tidak publik sebaiknya disimpan sebagai catatan lokal di luar repository publik; dokumen ini cukup memuat ringkasan yang boleh dibagikan.
