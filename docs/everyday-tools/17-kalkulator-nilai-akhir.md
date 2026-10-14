# 17 — Kalkulator Nilai Akhir Berbobot

Status: **rencana, belum diimplementasikan**. Model: **GPT-6 Luna · high**.
Route /kalkulator-nilai-akhir/; canonical https://edwinlab.dev/kalkulator-nilai-akhir/.

## Scope V1 dan ownership

Hitung nilai akhir skala 0–100 dari komponen dan bobot persentase yang jumlahnya tepat 100%. Tidak ada IPK, predikat lulus, kebijakan sekolah, konversi huruf, atau kalkulasi nilai ujian yang dibutuhkan.

- [ ] Baca README/CONTRACT/EXTENSION-CONTRACT, shared number/UI dan pola kalkulator existing.
- [ ] Miliki kalkulator-nilai-akhir/index.html, logic.js, tool.js, CSS opsional; tests/everyday/kalkulator-nilai-akhir.html dan .test.js; task/row 17.
- [ ] Shared read-only; hitungan menggunakan coefficient/scale BigInt, tanpa rounding per komponen.

## Tabel dan formula

- [ ] 1–20 komponen. Setiap row label opsional≤40 karakter, nilai 0–100 (≤2 desimal), bobot >0–100 (≤2 desimal). Gunakan parser shared maxIntegerDigits=3/maxFractionDigits=2/allowNegative=false dan cek range secara rasional.
- [ ] Total bobot harus persis 100,00 (10000 hundredths). Tampilkan total bobot dan sisa/kelebihan; jangan normalize atau membagi bobot otomatis. Baris incomplete/invalid membatalkan seluruh hasil dengan label nomor row.
- [ ] Setelah align nilai dan bobot ke hundredths: numerator=sum(gradeUnits×weightUnits), denominator=1000000. Nilai akhir = numerator/denominator; keluaran dua desimal half away from zero dan ≈ bila rounding diperlukan.
- [ ] Default tiga row Tugas/UTS/UAS, nilai kosong, bobot30/30/40. Tambah/hapus row native keyboard accessible; minimal satu row, maksimal20. Tombol Hapus berlabel nomor/nama row.
- [ ] Hitung, Contoh, Reset, Salin ringkasan. Contoh dua row nilai80/bobot40 dan nilai90/bobot60 →86,00. Salinan menyertakan semua komponen/bobot, jumlah bobot dan hasil.
- [ ] Perubahan field/add/remove menghapus output/copy sukses; error mempertahankan rows. Label menggunakan textContent, bukan HTML. Reset mengembalikan tiga row default.

## Fixture wajib

- [ ] 80×40%+90×60% →86,00; 100×100% →100,00; 0×100% →0,00; 70/80/90 dengan30/30/40 →81,00.
- [ ] Nilai80,25 bobot33,33 dan nilai90,75 bobot66,67 →87,25035 sebelum round, hasil≈87,25. Bobot33,33+33,33+33,34 diterima.
- [ ] Total bobot99,99/100,01 ditolak, termasuk selisih kecil yang raw Number dapat menyamarkan. Bobot0/negatif, grade100,01/negatif dan >2 desimal ditolak.
- [ ] Rows1/20 diterima,0/21 ditolak. Label HTML-looking literal; grade kosong bukan0. Rounding diuji pada rasional halfway; tidak round setiap produk terlebih dahulu.
- [ ] UI add/remove/reset/example, source row numbering, error/stale/copy denial/success; tabel tidak overflow global pada320px.

## Konten dan SEO

- [ ] Title "Kalkulator Nilai Akhir Berbobot | Edwin Lab"; H1 "Kalkulator Nilai Akhir".
- [ ] Description "Hitung nilai akhir dari tugas, ujian, atau komponen lain dengan bobot persentase. Periksa total bobot dan lihat rumus hasilnya."
- [ ] Panduan komponen/bobot, rumus weighted mean dengan total100%, contoh86,00, presisi/range. FAQ "Mengapa bobot harus 100%?", "Apakah ini menentukan kelulusan?", "Bisa menghitung IPK?".
- [ ] Jangan mengarang aturan sekolah. Metadata/noscript/breadcrumb kontrak; related kalkulator-persen/hub, rata-rata oleh integrator jika siap.

## Selesai

- [ ] Fixture dan QA kontrak lulus, termasuk keyboard dynamic rows, empat viewport, direct+refresh, no-JS content.
- [ ] Catat hasil/files/model/limitations, update checklist+row17 saja. Task24 mengintegrasikan.

~~~text
Kerjakan hanya docs/everyday-tools/17-kalkulator-nilai-akhir.md dengan Luna high.
Baca kontrak/shared aktual. Buat 1–20 komponen grade 0–100 dan bobot >0–100,
total bobot tepat 100%, hitungan BigInt rasional tanpa rounding per row.
UI tabel accessible, copy ringkasan, static SEO Indonesia; HTML/CSS/JS tanpa build.
Jalankan fixture presisi/row/error/stale dan QA, update task dan row17 dengan bukti.
Jangan ubah shared/tool lain/hub/sitemap atau commit/push/deploy.
~~~
