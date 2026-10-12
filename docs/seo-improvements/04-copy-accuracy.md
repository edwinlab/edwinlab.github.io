# SEO 04 — Koreksi penjelasan tool

Status: **selesai lokal**. Prioritas P1. Dependency: tidak ada. Temuan: [F04](AUDIT.md#f04--dua-penjelasan-alat-tidak-sepenuhnya-cocok-dengan-implementasi).

## Scope

Miliki hanya copy `link-whatsapp/index.html` dan `kalkulator-diskon/index.html`. Jangan mengubah algoritme, batas atau API. Baca logic/tool.js untuk memastikan semua istilah sesuai implementasi.

WhatsApp baris 43: ganti klaim semua emoji satu karakter dengan keterangan bahwa gabungan emoji dapat dihitung beberapa karakter. Simpan rincian code point/UTF-8 pada penjelasan lanjut yang tepat. Batas tetap 500 code points dan 2000 byte UTF-8; counter/error yang terlihat harus konsisten.

Diskon baris 42: contoh harus menyebut harga Rp200000 → Rp144000 untuk 20% lalu 10%, atau menjelaskan bahwa 28% adalah hasil sebelum pengaruh pembulatan uang. Jelaskan unit hitung 1 sen = Rp0,01. Pertahankan kebijakan pembulatan setiap tahap dan penjelasan hasil dapat berbeda dari struk.

## Checklist penerimaan

- [x] Hint dan artikel WhatsApp menyebut batas code point; emoji gabungan tidak dijanjikan satu karakter. Algoritme menghitung code point.
- [x] Aturan 500/2000 dan counter tetap sama; hanya copy hint berubah.
- [x] Contoh diskon menyertakan harga; istilah sen (Rp0,01) dan pembulatan setengah ke atas dijelaskan, termasuk rincian salin.
- [x] Cross-check memakai fungsi logic existing: keluarga `Array.from(...).length = 7`, bendera `= 2`; Rp200000 → Rp144000/28%; Rp0,05 dengan dua tahap 50% → Rp0,03 → Rp0,02, hasil final hemat 60%. Tidak mengubah hitungan.
- [x] Metadata/H1/canonical/form tidak diubah; `git diff --check` lulus. Tidak dibuat suite baru untuk copy sederhana.
- [x] Checklist/tracker diperbarui; QA live tetap tertunda hingga perubahan dipublikasikan.

## Prompt

```text
Kerjakan hanya docs/seo-improvements/04-copy-accuracy.md. Betulkan copy WhatsApp dan diskon agar sesuai algoritme existing. Jangan mengubah perhitungan, batas, input, worker atau API. Gunakan contoh keluarga/bendera dan harga diskon besar/kecil untuk cross-check. Pertahankan metadata/form, periksa hasil dan git diff --check, lalu update checklist/README. Jangan mengimplementasikan task lain, commit, push atau deploy.
```
