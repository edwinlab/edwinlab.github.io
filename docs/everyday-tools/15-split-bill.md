# 15 — Split Bill / Bagi Tagihan

Status: **rencana, belum diimplementasikan**. Model: **GPT-6 Luna · high**.
Route /split-bill/; canonical https://edwinlab.dev/split-bill/.

## Scope V1 dan ownership

Bagi satu tagihan beserta biaya tambahan nominal secara merata dalam rupiah bulat. Hasil mempertahankan total dengan membagikan sisa Rp1 menurut urutan peserta. Tidak ada rincian konsumsi per orang, rekening, penagihan, pembayaran, tarif pajak, atau link berbagi.

- [ ] Baca README/CONTRACT/EXTENSION-CONTRACT dan shared UI/number aktual.
- [ ] Miliki split-bill/index.html, logic.js, tool.js, CSS opsional; tests/everyday/split-bill.html dan split-bill.test.js; task ini dan row 15.
- [ ] Hanya shared existing read-only; angka diproses BigInt, bukan floating point. Tidak mengubah task persen/diskon.

## Hitungan dan UI

- [ ] Subtotal dan biaya tambahan adalah integer ASCII nonnegatif, tanpa separator, eksponen, minus/plus atau desimal. Masing-masing maksimum 12 digit termasuk leading zero dan 64 karakter raw; biaya tambahan default 0. Total maksimum 999999999999 rupiah.
- [ ] Jumlah peserta integer 1–100, maksimum tiga digit. Field kosong/format/range invalid menghasilkan error spesifik. Tidak otomatis mengganti field kosong dengan nol.
- [ ] Pure splitBill(subtotal, extra, participantCount): T=subtotal+extra; q=T/n; r=T%n dengan BigInt. Peserta nomor 1 sampai r membayar q+1, peserta lain q. Jumlah allocation harus persis T; selisih antar peserta paling besar Rp1.
- [ ] Tampilkan total, jumlah peserta, nominal dasar, dan tabel Peserta 1…N. Jelaskan siapa yang mendapat sisa ditentukan urutan nomor, bukan identitas atau prioritas finansial.
- [ ] UI: input subtotal/biaya/jumlah orang, Hitung, Contoh, Bersihkan, Salin hasil. Salinan plain text menyertakan total dan semua allocation. Nominal berlabel Rp; tidak memakai parse grouping dari tampilan sebagai input kembali.
- [ ] Input/options berubah menghapus tabel/copy lama. Error mempertahankan input. Clear mereset subtotal kosong, extra 0, peserta 2. Tidak ada input nama peserta V1.

## Fixture wajib

- [ ] 100000+0, n=3 → [33334,33333,33333], sum=100000. 100000+10000, n=4 → empat nilai 27500.
- [ ] 2+0, n=5 → [1,1,0,0,0]; 0+0, n=1/100 → semua nol. n=1 → seluruh total. Nilai exact range diterima dan total cap+1 ditolak.
- [ ] n=0/101/2.5/"1e2"/kosong ditolak; amount negatif/grouped/decimal/lebih dari 12 digit ditolak; input raw cap+1 ditolak.
- [ ] Uji invariant pada beberapa total dan n=1…100: output.length=n, sum tepat, beda max≤1, first remainder order stabil. Tidak mengubah input parsed.
- [ ] Contoh/UI/copy success+denied, input edit/clear stale dan safe render nama/teks. Tidak menghasilkan request/storage/site URL dari input.

## Konten dan SEO

- [ ] Title "Split Bill Online — Bagi Tagihan | Edwin Lab"; H1 "Split Bill / Bagi Tagihan".
- [ ] Description "Bagi tagihan dan biaya tambahan secara merata. Hitung nominal tiap orang dalam rupiah bulat dengan total yang tetap sama."
- [ ] Cara pakai, contoh Rp100000 dibagi 3, biaya tambahan nominal, alasan nominal bisa beda Rp1. FAQ "Mengapa ada selisih Rp1?", "Bisa tagihan berbeda tiap orang?", "Apakah alat melakukan pembayaran?".
- [ ] Metadata/breadcrumb/noscript statis sesuai kontrak. Related ke kalkulator-diskon/kalkulator-persen dan hub. Tidak mengarang fitur pembagian konsumsi atau tarif pajak.

## Selesai

- [ ] Fixture dan QA kontrak lulus; empat viewport, keyboard tabel, route+refresh, clear/copy dan no-JS guide.
- [ ] Catat hasil/evidence dan update checklist/row 15 sendiri. Task 24 menangani hub/sitemap.

~~~text
Kerjakan hanya docs/everyday-tools/15-split-bill.md dengan rekomendasi Luna high.
Baca README/CONTRACT/EXTENSION-CONTRACT dan helper aktual. Buat split integer rupiah
menggunakan BigInt dengan distribusi sisa Rp1, total invariant, batas 100 peserta.
HTML/CSS/JS statis, UI/SEO Indonesia, tanpa pembayaran/network/storage.
Jalankan fixture angka/batas serta QA/copy/stale; update task dan row 15 berdasarkan bukti.
Jangan mengubah shared/tool lain/hub/sitemap atau commit/push/deploy.
~~~
