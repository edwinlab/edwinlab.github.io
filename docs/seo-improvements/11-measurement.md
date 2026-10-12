# SEO 11 — Analytics dan penggunaan tools

Status: **sebagian selesai**. Event schema dan placement dicatat di [ANALYTICS-SPEC.md](ANALYTICS-SPEC.md). Provider/property ID serta source blog belum tersedia; karena itu tidak ada analytics tag yang dipasang. Temuan: [F10](AUDIT.md#f10--pengukuran-penggunaan-belum-konsisten).

## Scope

Tentukan apakah memakai GA4 atau layanan analytics ringan lain dari akun yang sudah dimiliki/dipilih Edwin. Jangan membuat ID/G-… fiktif, memasang tag analytics dua kali, atau mengubah akun dengan asumsi izin. Bila konfigurasi belum tersedia, selesaikan skema event serta daftar titik pemasangan dan catat dependency; tag belum aktif tidak ditandai selesai.

Source utama/sample tools belum menampilkan analytics. Blog memuat tag UA lama; periksa kemungkinan connected destination GA4 sebelum menghapus/mengganti tag. Script/head blog harus ditangani pada source yang benar.

Event minimal: page view, `tool_success`, `tool_copy`, `tool_download`, `related_tool_click`, dan `contact_click`. Payload allowlist hanya slug tool, action fixed, format enumerated bila berguna dan kode error enumerated opsional. Jangan kirim JSON/JWT, nomor/pesan WhatsApp, isi teks, filename/file bytes, hasil, clipboard, free-text errors, query string atau fragment yang mungkin berisi input. Bila memakai GA4 enhanced measurement, periksa auto form/file/outbound tracking dan matikan fitur yang mengekspor nilai atau URL sensitif; set page_location yang sudah dibersihkan.

Pengukuran tidak boleh menunda fungsi tool atau mengubah local-processing claim. Update disclosure menjadi spesifik: input tool diproses lokal dan tidak dikirim; statistik penggunaan yang memang dikirim dijelaskan terpisah. Terapkan privacy/consent sesuai konfigurasi/target yang nyata, bukan banner placeholder atau janji cookieless tanpa bukti.

## Checklist penerimaan

- [ ] Provider/property/configuration belum dikonfirmasi pemilik; dependency account dan source blog tercatat.
- [ ] Destination UA/GA4 blog diperiksa; tidak mengklaim semua tag UA pasti tidak mengirim data atau menghapus connected tag tanpa pemeriksaan.
- [x] Daftar event, trigger, insertion points, dan allowlist payload terdokumentasi; instrumentasi nantinya hanya setelah aksi sukses.
- [ ] Full URL/referrer/query/fragment/free text tidak dikirim jika memuat input sensitif; auto measurement dievaluasi.
- [ ] Fixture sintetis email/nomor/JSON/JWT/filename dipakai untuk inspeksi request; nilai input/output tidak muncul pada analytics payload.
- [ ] Analytics unavailable/blocked tidak merusak tools; navigasi/no-JS core tetap bekerja.
- [ ] Disclosure/privacy sesuai data/layanan sebenarnya; local-input claim tetap tepat.
- [ ] Event terlihat di debug/realtime layanan yang dikonfigurasi setelah publikasi terpisah; kode saja bukan bukti data diterima.
- [x] Belum ada kode instrumen karena provider belum diketahui; checklist/tracker membedakan spec, akun, dan live. Tidak ada kredensial privat di repo.

## Prompt

```text
Kerjakan hanya docs/seo-improvements/11-measurement.md. Gunakan provider dan property ID yang benar dari pemilik; jika belum diketahui selesaikan event spec/placement dan catat dependency tanpa tag fiktif. Evaluasi connected GA4 pada tag UA blog sebelum mengubahnya. Instrumentasi harus allowlist slug/action/format/kode, tanpa input/output, nomor, pesan, JSON/JWT, filename atau full URL sensitif. Periksa auto measurement dan disclosure, uji payload sintetis serta fallback saat analytics blocked. Update checklist/README berdasarkan bukti lokal/account/live. Jangan mengubah akun, commit, push atau deploy tanpa instruksi yang sesuai.
```
