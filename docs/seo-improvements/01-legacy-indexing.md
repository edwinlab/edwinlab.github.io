# SEO 01 — Tangani halaman legacy

Status: **sebagian selesai lokal**. Prioritas P1. Dependency: tidak ada. Temuan: [F01](AUDIT.md#f01--halaman-profil-legacy-masih-live).

## Scope

Miliki `index-master.html` dan catatan status legacy pada `README.md`. Pada audit live 12 Oktober, halaman masih memakai identitas Jakarta/freelance, URL OG github.io, serta belum memiliki noindex. Homepage `/` sudah berisi profil saat ini; perbaikan source task ini tercatat di checklist berikut.

Keputusan task: simpan sebagai arsip 2022 karena repo ini menggunakan static GitHub Pages dan tidak memiliki konfigurasi redirect. Arsip diberi label yang terlihat, `noindex,follow`, social metadata pada domain utama, serta tautan ke homepage dan LinkedIn saat ini. Verifikasi live menunggu publikasi.

Tidak perlu menghapus file atau aset legacy untuk menyelesaikan ini. Tidak mengubah homepage/CNAME atau memasukkan arsip ke sitemap. Jangan memakai `Disallow` sebagai pengganti noindex; crawler harus dapat membaca directive.

## Checklist penerimaan

- [x] Tujuan ditetapkan sebagai arsip 2022, bukan redirect: repo menggunakan static GitHub Pages dan tidak menyediakan konfigurasi redirect.
- [x] Arsip diberi penanda terlihat di bagian atas dan tautan biasa menuju `https://edwinlab.dev/`; metadata dan social card melabelinya sebagai arsip serta memakai URL/domain utama.
- [x] `noindex,follow` disediakan dalam HTML awal. `robots.txt` tetap mengizinkan crawl; URL tidak ditambahkan ke sitemap.
- [x] Homepage dan tool publik tetap indexable di source; sitemap dan canonical tidak diubah.
- [x] HTML source diperiksa; `git diff --check` lulus. Tidak perlu tes aplikasi baru untuk perubahan copy/meta.
- [ ] Sesudah publikasi yang diminta terpisah, catat final URL/status/directive live. Jika belum dipublikasikan, bagian live tetap unchecked.
- [x] Tracker serta status task diperbarui dengan bukti lokal/live yang terpisah.

## Prompt

```text
Kerjakan hanya docs/seo-improvements/01-legacy-indexing.md. Baca aturan README dan F01 di AUDIT. Tangani index-master.html sebagai legacy tanpa mengubah homepage atau algoritme tools. Gunakan solusi statis GitHub Pages yang nyata, jangan mengklaim meta refresh sebagai 301. Jangan hapus asset/token. Verifikasi source dan hasil lokal, catat live verification yang belum tersedia, lalu update checklist/README. Jangan commit, push, deploy atau ubah hosting tanpa instruksi untuk tindakan tersebut.
```
