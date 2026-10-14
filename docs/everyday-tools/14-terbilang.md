# 14 — Terbilang Angka dan Rupiah

Status: **rencana, belum diimplementasikan**. Model: **GPT-6 Luna · medium**.
Route /terbilang/; canonical https://edwinlab.dev/terbilang/.

## Scope V1 dan ownership

Ubah bilangan bulat menjadi kata Bahasa Indonesia, dengan pilihan akhiran rupiah dan kapital huruf pertama. Berguna untuk menyiapkan tulisan nominal pada nota atau kuitansi. Tidak menerima desimal/sen, format mata uang lain, atau angka dengan separator ribuan.

- [ ] Baca README, CONTRACT, EXTENSION-CONTRACT dan source shared UI/number aktual.
- [ ] Miliki hanya folder terbilang/ dengan index.html, logic.js, tool.js, CSS opsional; tests/everyday/terbilang.html dan terbilang.test.js; dokumen ini dan row 14 README.
- [ ] Gunakan parseDecimal/BigInt, copyTextId, setStatus dan CSS existing. Shared/vendor/hub/sitemap serta tool lain read-only.

## Input dan aturan kata

- [ ] Input maksimum 64 karakter; trim ASCII tepi. Grammar integer ASCII dengan minus opsional, 1–15 digit termasuk leading zero. Tolak tanda plus, grouping, comma/titik, eksponen, kosong, digit non-ASCII, Infinity/NaN. Range -999999999999999 sampai 999999999999999. Jangan konversi melalui Number.
- [ ] Pure integerToWords(value: BigInt) mengolah grup ribuan tanpa DOM/storage. Skala: ribu, juta, miliar, triliun. Grup bernilai nol di tengah tidak menambah kata "nol".
- [ ] Bentuk khusus: 10 sepuluh, 11 sebelas, 12 dua belas, 100 seratus, 1000 seribu. Nilai 1100 seribu seratus; 1000000 satu juta. Untuk grup juta/miliar/triliun, 1 memakai "satu", bukan "se".
- [ ] Negatif berawalan "minus"; -0 dinormalkan menjadi nol. Kata lowercase dipisah satu spasi, tidak whitespace tepi. Suffix pilihan "rupiah" tanpa mengubah angka; capital sentence hanya huruf pertama.
- [ ] UI: Angka, checkbox Tambahkan rupiah (default aktif), Kapital awal (default aktif), tombol Ubah ke terbilang, Contoh, Bersihkan, Salin. Hasil readonly. Contoh sintetis 1250000 → "Satu juta dua ratus lima puluh ribu rupiah".
- [ ] Edit angka/opsi menghapus output/sukses dan menonaktifkan copy; error menjaga input. Bersihkan mengembalikan opsi default. Input harus jelas "tanpa titik/koma pemisah ribuan".

## Fixture wajib

- [ ] Tabel 0, 1, 9, 10, 11, 12, 19, 20, 21, 99, 100, 101, 110, 111, 1000, 1001, 1010, 1100 dan 1000000 memiliki expected kata eksplisit.
- [ ] 1001000 → "satu juta seribu"; 1000000000 → "satu miliar"; 1000000000000 → "satu triliun"; grup nol tidak menghasilkan "nol ribu".
- [ ] Batas 999999999999999 diproses tepat; 1000000000000000 ditolak. -1000 → "minus seribu"; -0 → "nol"; "00012" → "dua belas". Suffix/kapital semua kombinasi.
- [ ] Tolak "1.000", "12,5", "+1", "1e3", "１２", "-", kosong dan digit berlebih; HTML-looking input tidak menjadi node.
- [ ] Route/contoh/clear/edit stale/copy success+denied berjalan. Copy hanya output current; runner noindex dan tests memakai harness existing.

## Konten dan SEO

- [ ] Title "Terbilang Angka dan Rupiah Online | Edwin Lab"; H1 "Terbilang Angka dan Rupiah".
- [ ] Description "Ubah angka bulat menjadi terbilang Bahasa Indonesia. Tambahkan rupiah, atur kapital awal, lalu salin hasil yang diproses di browser."
- [ ] HTML statis: cara pakai, contoh 1250000, rentang sampai triliun, minus/nol, syarat tanpa separator. FAQ: "Bisa angka desimal?", "Bagaimana menulis seribu?", "Apakah hasil harus diperiksa untuk kuitansi?".
- [ ] Jelaskan alat membantu menulis nominal; pengguna memeriksa kembali angka dokumen. Metadata/breadcrumb/noscript mengikuti kontrak; related ke kalkulator-diskon dan hub yang sudah ada.

## Selesai

- [ ] Fixture dan QA kontrak lulus: direct+refresh, keyboard, empat viewport, no-JS guide, input lokal, console/Network yang dapat diuji, git diff --check.
- [ ] Catat files, model aktual, pass/fail dan keterbatasan. Update checklist ini dan row 14 saja; integrasi publik diserahkan task 24.

~~~text
Kerjakan hanya docs/everyday-tools/14-terbilang.md dengan rekomendasi Luna medium.
Baca README/CONTRACT/EXTENSION-CONTRACT dan shared UI/number yang relevan.
Implementasikan integer BigInt ke kata Indonesia sampai 15 digit, aturan khusus
sepuluh/sebelas/seratus/seribu, minus/nol, suffix rupiah dan kapital awal.
Gunakan HTML/CSS/JS buildless, UI/SEO Indonesia, local processing dan fixture persis task.
Jalankan QA; update checklist dan row 14 dengan bukti, sebagian bila masih pending.
Jangan ubah shared/vendor/hub/sitemap/tool lain atau commit/push/deploy.
~~~
