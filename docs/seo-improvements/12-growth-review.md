# SEO 12 — Distribusi dan evaluasi query

Status: **sebagian selesai; draft dan brief tersedia** di [GROWTH-DRAFT.md](GROWTH-DRAFT.md). Query/GSC, analytics provider, dan tanggal publikasi nyata masih belum tersedia.

## Scope

Pilih tiga halaman yang benar-benar siap digunakan. Data query Search Console menjadi dasar bila cukup; jika belum tersedia, pakai kandidat JSONLint, link WhatsApp dan kalkulator diskon sebagai hipotesis berdasarkan kebutuhan, bukan klaim keyword terbesar.

Buat tiga brief tutorial/demo yang menjawab masalah nyata. Contoh: memperbaiki single quotes/trailing comma JSON, membuat link WhatsApp dengan pesan/QR, menghitung diskon20% lalu10%. Gunakan hasil tool nyata dan input sintetis. Tentukan apakah cukup memperkaya halaman tool atau perlu artikel dengan intent terpisah di source blog yang sudah ditemukan. Artikel tidak harus memakai target jumlah kata dan tidak membuat halaman sinonim duplikat.

Siapkan draft posting LinkedIn dan tautan relevan GitHub/community beserta jadwal manual yang realistis. UTM memakai kampanye non-sensitif dan canonical halaman tetap bersih. Membuat draft tidak berarti boleh mengirim, memposting, mengedit repo lain, atau memasang automation.

Evaluasi manual setelah data cukup, contoh sekitar28 hari sejak perubahan live. Bandingkan impressions/clicks/CTR/query/page pada kondisi yang sama; gunakan analytics untuk tool success/download/contact clicks bila tersedia. Average position bukan keyword rank universal. Catat perubahan algoritme/musiman/volume sample sebagai konteks; tidak mengklaim kausalitas dari satu before/after kecil.

## Checklist penerimaan

- [x] JSONLint, link WhatsApp/QR, dan kalkulator diskon dipilih sebagai hipotesis siap; volume query belum ada.
- [x] Brief mencatat intent, masalah, input/output sintetis yang terverifikasi, batas, serta link.
- [x] Draft LinkedIn berisi audience/tujuan dan UTM non-sensitif; tidak ada nomor, token atau file pribadi.
- [x] Draft distribusi hanya; belum ada posting atau edit luar repo.
- [x] Evaluasi baru dimulai setelah publikasi nyata; tidak ada automation/reminder.
- [x] KPI/diagnosis dijelaskan; baseline data belum ada.
- [x] Tiga jalur tindak lanjut ditentukan berdasarkan pola data tanpa threshold universal.
- [x] Draft selesai, evaluasi traffic tetap pending; tracker diperbarui.

## Prompt

```text
Kerjakan hanya docs/seo-improvements/12-growth-review.md. Gunakan audit dan query nyata bila tersedia, pilih tiga halaman siap, buat brief tutorial/demo serta draft distribusi yang relevan. Labeli pilihan tanpa volume data sebagai hipotesis. Definisikan baseline/KPI dan evaluasi setelah perubahan live; jangan menjanjikan ranking/traffic. Jangan memposting, mengirim pesan, edit repo eksternal, membuat automation, commit/push/deploy dari instruksi ini. Update checklist/README berdasarkan draft yang selesai dan evaluasi yang masih pending.
```
