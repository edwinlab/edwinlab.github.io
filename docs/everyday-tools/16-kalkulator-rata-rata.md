# 16 — Kalkulator Rata-Rata

Status: **rencana, belum diimplementasikan**. Model: **GPT-6 Luna · medium**.
Route /kalkulator-rata-rata/; canonical https://edwinlab.dev/kalkulator-rata-rata/.

## Scope V1 dan ownership

Rata-rata aritmetika dari angka satu per baris, disertai jumlah data, total, minimum dan maksimum. Tidak median/modus, statistik inferensial, CSV, bobot, file upload atau grafik.

- [ ] Baca README/CONTRACT/EXTENSION-CONTRACT dan number/UI/limits aktual.
- [ ] Miliki kalkulator-rata-rata/index.html, logic.js, tool.js, CSS opsional; tests/everyday/kalkulator-rata-rata.html dan .test.js; task ini dan row 16.
- [ ] Reuse parseDecimal/formatRatio/roundRatio, copyTextId/setStatus. Tidak mengubah shared atau menyalin parser angka.

## Angka, hasil, dan UI

- [ ] Input UTF-8 ≤128 KiB dan ≤1000 nilai nonblank. LF/CRLF/CR memisahkan baris. Baris kosong setelah trim ASCII diabaikan; terminal newline bukan nilai tambahan. Jika semua kosong, error.
- [ ] Tiap nilai memakai parseDecimal maxIntegerDigits=9, maxFractionDigits=6, allowNegative=true, raw≤64. Koma/titik adalah desimal; satu nilai per baris. "1,2" berarti 1,2, bukan dua nilai. Grouping, eksponen, NaN/Infinity dan plus tidak didukung.
- [ ] Align coefficient ke skala terbesar (≤6) dengan BigInt; total S=sum(coefficients). Rata-rata rasional S/(count×10^scale), bukan penjumlahan Number.
- [ ] Output count, total exact tanpa grouping, min/max exact dan rata-rata dibulatkan maksimal enam desimal half away from zero. Trim trailing zero; tanda ≈ hanya jika hasil rata-rata perlu pembulatan pada presisi ini.
- [ ] Nilai invalid membatalkan seluruh hasil dan menunjuk nomor baris sumber, termasuk setelah blank rows. Tidak menghitung sebagian data; input/source tidak dimutasi atau diurutkan.
- [ ] UI Hitung, Contoh, Bersihkan, Salin ringkasan; hasil readonly/labelled. Edit input menghapus hasil/copy lama. Contoh "10\n20\n30" → rata-rata 20.

## Fixture wajib

- [ ] [10,20,30] → n3, total60, min10, max30, mean20. [-1,0,2] → total1, mean≈0,333333.
- [ ] ["0,1","0.2"] → total0,3 dan mean0,15 tepat; [1,1,2] → ≈1,333333; [-1,-1,-2] → ≈-1,333333. [0,-0] tidak menghasilkan -0.
- [ ] Satu nilai identik pada semua statistik; blank rows/CRLF/CR/source line reporting; "1,2" satu nilai, "1 2" invalid.
- [ ] 1000 nilai diterima, 1001 ditolak. Exact UTF-8 cap dan cap+1, nilai cap digit/fraction/raw, grouping/eksponen/NaN/empty dan HTML-looking input ditolak.
- [ ] Hasil min/max signed decimals dibandingkan tepat via aligned coefficient. Total beberapa nilai besar tetap tepat, tidak kehilangan digit Number.
- [ ] UI example/process/error/stale/clear/copy success+denied serta no partial output diuji.

## Konten dan SEO

- [ ] Title "Kalkulator Rata-Rata Online | Edwin Lab"; H1 "Kalkulator Rata-Rata".
- [ ] Description "Hitung rata-rata, total, nilai minimum, dan maksimum dari daftar angka. Masukkan satu angka per baris dengan koma atau titik desimal."
- [ ] HTML awal: rumus total/jumlah data, contoh 10/20/30, delimiter baris, blank/duplicate policy, presisi enam desimal. FAQ "Bagaimana memasukkan desimal?", "Apakah baris kosong dihitung?", "Apa arti tanda ≈?".
- [ ] Canonical/OG/breadcrumb/noscript mengikuti kontrak. Related kalkulator-persen dan hub; nilai akhir ditautkan task 24 hanya setelah siap.

## Selesai

- [ ] Fixture/QA kontrak lulus; batas data, keyboard, viewport, copy, no-JS, local input dan git diff --check.
- [ ] Update dokumen ini dan row 16 berdasarkan bukti, catat QA yang pending. Tidak menambah card/sitemap sendiri.

~~~text
Kerjakan hanya docs/everyday-tools/16-kalkulator-rata-rata.md dengan Luna medium.
Baca kontrak dan shared aktual. Gunakan decimal BigInt/rasional untuk mean/total/min/max,
satu nilai per baris, maksimum 1000 nilai/128 KiB, tanpa parser Number atau CSV.
Buat HTML/CSS/JS buildless dengan UI/SEO Indonesia. Jalankan fixture rounding,
baris/batas dan QA/copy/stale; update checklist dan row 16 dengan evidence.
Jangan ubah shared/vendor/tool lain/hub/sitemap atau commit/push/deploy.
~~~
