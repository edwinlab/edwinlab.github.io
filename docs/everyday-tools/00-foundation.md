# 00 — Fondasi tools sehari-hari

Status: **implementasi dan fixture khusus lulus; smoke test developer tools serta pemeriksaan console masih menunggu bukti**. Model eksekusi: **GPT-6 Luna · high**. Prasyarat: foundation developer tools yang sudah ada tetap berfungsi. Task ini tidak membuat 12 app atau hub kosong.

Urutan kerja dalam satu task: **A** helper UI + tes, **B** helper angka + tes, **C** kalender + tes, **D** template + QA bersama. Task 00 mencakup semua tahap A–D. Runner `foundation.html` dan tes integrasinya dibuat atau dijalankan setelah modul yang diimpor tersedia; jangan jadikan modul tahap yang belum dibuat sebagai syarat untuk menguji tahap sebelumnya. Tandai 00 selesai hanya setelah A–D dan QA bersama lulus.

## Deliverable dan scope

- [x] Baca README/CONTRACT folder ini dan instruksi repo; inventaris shared API, CSS, logo, CNAME, harness aktual, serta perubahan pengguna.
- [x] Buat hanya `/everyday/shared/ui.js`, `number.js`, `calendar.js`, CSS tambahan terisolasi bila diperlukan, `docs/everyday-tools/tool-template.html`, serta `tests/everyday/foundation.html`, `foundation.test.js`, dan `index.html` noindex.
- [x] Buat template copy manual (bukan generator/build), dengan placeholder yang diberi tanda jelas: slug, title, meta, H1, canonical, contoh, instruksi, batas, related. Template `noindex,nofollow`; task tool menghapus noindex hanya pada salinan halaman publik selesai. Gunakan asset path absolut dan script module relatif; jangan membuat semua route kosong.
- [x] Terapkan seluruh kontrak `copyTextId`, `downloadBlob`, `parseDecimal`, `roundRatio`, `formatRatio`, dan kalender persis CONTRACT. Tidak mengubah shared developer tools/harness yang sudah dipakai.
- [x] Template menyiapkan label, status, disabled state, proses/contoh/clear/copy, dan pola invalidasi hasil. CSS tambahan harus scoped, tidak merusak `.tools-page` lama. Copy publik Indonesia; Home boleh label `Beranda` pada tool baru.
- [x] Runner foundation memakai harness lama, ringkasan PASS/FAIL terlihat dan noindex. Index tes hanya menautkan runner yang sudah ada. Media/vendor bukan scope 00; ada 00a terpisah.

## Fixture wajib

- [x] Decimal `-12,50` → coefficient `-1250n`, scale 2; `0.125` → `125n,3`; ` 12 ` → `12n,0`; `-0` → `0n,0`.
- [x] Tolak `1.000,50`, `1,000.50`, `1e3`, `+3`, `.5`, `2.`, kosong, digit non-ASCII; `allowNegative:false` menolak `-1`. Tepat digit cap sah; cap+1 `NUMBER_PRECISION`; raw65 karakter `INPUT_TOO_LARGE`.
- [x] `roundRatio(1n,8n,2) = 13n`, `roundRatio(-1n,8n,2) = -13n`; denominator negatif dinormalkan; nol melempar. `formatRatio(1n,8n,{places:2}) = '0,13'`, `formatRatio(1n,2n,{places:2,trimZeros:true}) = '0,5'`; nilai negatif membulat nol → `'0,00'`.
- [x] Tanggal 2000-02-29 valid; 1900-02-29/0000-01-01/2024-04-31 invalid. Parser murni menolak whitespace tepi, datetime dan digit tahun tidak empat.
- [x] Ordinal 0001-01-01→0, 0001-01-02→1, 9999-12-31→3652058; round trip di akhir/awal tahun serta 1900/2000/2024. Tolak ordinal -1/3652059/noninteger.
- [x] 2023-01-31 +1 bulan→2023-02-28, +2→2023-03-31; 2024-03-31 -1→2024-02-29; 2020-02-29 +12→2021-02-28; batas tahun tidak wrap; input tidak dimutasi.
- [x] Clipboard sukses/gagal melalui mock terkontrol dan klik manual asli; pesan Indonesia tunggal. Download Blob menjaga MIME/name, object URL dilepas setelah digunakan, nama path/kontrol disanitasi.
- [ ] Template 320/390/768/1440 px, keyboard, status, noscript, console bersih; smoke halaman developer tools yang memakai CSS/harness yang direuse. **Root melaporkan tampilan 4 ukuran, Tab/fokus, noscript, status, tombol clipboard, dan HTTP 200/304 lulus. Pemeriksaan console dan smoke runner developer tools masih perlu dikonfirmasi.**

## Selesai dan prompt

- [ ] Catat file, browser, jumlah fixture, QA, dan `git diff --check`. Update tracker 00 setelah semua pemeriksaan wajib terbukti. Jangan commit/push/deploy.

## Catatan eksekusi

- 12 Oktober 2026 · GPT-6 Luna high. Foundation runner: **22/22 lulus** di browser; root juga memeriksa klik clipboard manual, urutan keyboard/fokus, tampilan 320/390/768/1440, dan route/modul/aset HTTP 200/304. Pemeriksaan pure Node tambahan: **44 cek** angka dan kalender lulus. `git diff --check` dan parse sintaks JavaScript lulus. Belum ada pemeriksaan console yang tercatat dan smoke runner developer tools belum dikonfirmasi; tracker tetap belum selesai sampai dua bukti ini ada.

```text
Kerjakan hanya docs/everyday-tools/00-foundation.md. Baca README.md dan CONTRACT.md di folder yang sama, lalu inspeksi shared/harness aktual. Implementasikan hanya shared dasar, template statis noindex, dan tes foundation yang menjadi kepemilikan 00; jangan implementasikan tool 01–12, 00a media, atau hub/integrasi 13. Hanya HTML/CSS/vanilla JS tanpa npm/build/backend/CDN. Ikuti API dan fixture persis kontrak, jalankan runner browser dan QA, pertahankan file lain/perubahan pengguna. Centang checklist dan baris tracker 00 hanya dengan bukti nyata; laporkan yang belum terverifikasi. Jangan commit, push, atau deploy.
```
