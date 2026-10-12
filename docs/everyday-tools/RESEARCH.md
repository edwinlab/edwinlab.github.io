# Dasar prioritas dan sumber

Tanggal riset: **12 Oktober 2026**. Metode: sampling hasil pencarian publik berbahasa Indonesia, inspeksi repository, dan dokumentasi primer API/model. Tidak menggunakan Keyword Planner, Ahrefs, Semrush, akses Search Console, atau data analytics website. Tidak ada angka volume, CPC, kesulitan keyword, ramalan pengunjung, atau jaminan ranking.

## Kebutuhan pengunjung dan keputusan produk

| Kelompok | Bukti/hipotesis intent | Keputusan rencana |
|---|---|---|
| Kata, karakter, ubah huruf | [WordCount bahasa Indonesia](https://wordcount.online/id/) dan [penghitung kata Urbanidea](https://urbanidea.id/tools/penghitung-kata-online/) muncul untuk pemeriksaan panjang tulisan. | 01/02 awal: murah, tanpa library besar; bedakan definisi karakter/Unicode dan cara kapitalisasi. Ubah huruf merupakan perluasan kebutuhan teks, bukan volume yang sudah diukur. |
| Persen dan diskon | [NotaKilat](https://notakilat.com/kalkulator-diskon) menyediakan kalkulator harga setelah diskon; [TERAKHIR](https://terakhir.com/tools/percentage-calculator) menampilkan beberapa mode persen. | 03/04 awal: rumus dan pembulatan eksplisit, diskon bertingkat, bahasa angka Indonesia. Dua halaman berbeda fungsi dan contoh, bukan salinan keyword. |
| Usia, tanggal, satuan | Hipotesis utilitas umum: usia pada tanggal pilihan, tenggat dan selisih tanggal, serta konversi angka. Belum ada estimasi permintaan atau tingkat persaingan per query dalam riset ini. | 05/06/07 gelombang kedua; nilai tambah berupa tanggal kabisat/akhir bulan dan satuan yang definisinya jelas. |
| Link WhatsApp dan QR | [Take App](https://www.take.app/id/tools/whatsapp-link-generator) menawarkan pembuatan wa.me untuk pengguna Indonesia. QR adalah kebutuhan berdekatan untuk membagikan tautan usaha/poster; volume QR tidak diukur. | 08 lebih dulu karena sederhana; 09 setelah adapter QR teruji. Nomor Indonesia dan pesan awal, QR statis tanpa backend/tracking. |
| Foto/gambar | [ResizePixel](https://www.resizepixel.com/id/resize-image-to-200-kb/) memiliki halaman yang menarget kebutuhan ukuran file tertentu. Ini menandakan intent, bukan bukti aturan semua instansi mewajibkan200 KB. | 10/11 pisahkan kompresi byte dan resize piksel. V1 tidak menjamin200 KB atau pasfoto resmi; jangan memakai keyword itu sebagai klaim fitur. |
| Gambar ke PDF | [iLovePDF](https://www.ilovepdf.com/id/jpg-ke-pdf) memiliki alur JPG→PDF/gabung gambar, menunjukkan kategori yang sudah mapan. | 12 terakhir: lokal, JPEG/PNG menjadi PDF A4 dengan urutan jelas. Scope lebih kecil daripada editor PDF lengkap. |

Penetapan urutan adalah **inferensi produk** dari kegunaan dan besarnya pekerjaan. Kehadiran pesaing bukan ukuran besarnya traffic yang dapat diraih Edwin Lab. Foto/PDF mungkin punya penggunaan luas, tetapi membutuhkan QA lebih banyak; teks/kalkulator lebih cepat memberi kumpulan halaman awal yang benar-benar berguna.

## Landasan teknis dan model

- [Google: konten yang membantu pengguna](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) menjadi dasar konten unik dan contoh yang menyelesaikan kebutuhan nyata; metadata dan sitemap saja tidak menjamin ranking.
- [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna) adalah pilihan model efisien untuk tugas terfokus. Pembagian medium/high di README adalah penilaian scope, bukan benchmark resmi tools ini. [Panduan biaya OpenAI](https://developers.openai.com/api/docs/guides/cost-optimization) mendukung pemilihan model lebih kecil yang tetap memenuhi akurasi; biaya aktual bergantung pemakaian dan paket.
- [ECMA-402 Intl.Segmenter](https://tc39.es/ecma402/#segmenter-objects) untuk definisi segmentasi, bukan jaminan jumlah kata identik dengan setiap aplikasi pengolah dokumen.
- [NIST Appendix B](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors) dan sumber rinci di task 07 untuk faktor satuan. [WhatsApp Help Center](https://faq.whatsapp.com/5913398998672934) untuk format Click to Chat; aturan nomor V1 adalah validasi format, bukan verifikasi akun aktif.
- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator), [jsQR](https://github.com/cozmo/jsQR), [createImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap), [toBlob](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob), dan [pdf-lib](https://pdf-lib.js.org/) mendasari pilihan browser lokal. Versi/distribusi/checksum harus diverifikasi saat 00a dieksekusi; rencana belum mengunduh atau menguji library.

## Evaluasi setelah publikasi nanti

- [ ] Setelah batch siap dan pengguna mempublikasikan, validasi URL/HTTPS/canonical/sitemap. Jangan mengaku sudah live dari tes localhost.
- [ ] Jika akses Search Console tersedia, catat tanggal publikasi, halaman terindeks, query, impressions, clicks, CTR, dan posisi pada jendela28 hari yang sama. Properti tanpa akses tetap dicatat belum diperiksa.
- [ ] Bandingkan halaman dengan data cukup; perbaiki contoh/title/UX sesuai intent query. Halaman belum terindeks perlu pemeriksaan indeks/link terlebih dahulu, bukan penambahan keyword massal.
- [ ] Gunakan feedback dan data untuk memilih perluasan fitur berikutnya; jangan mengubah scope V1 atau menjadwalkan monitoring otomatis dari dokumen ini.

Checklist di bagian ini adalah tindak lanjut setelah implementasi/publikasi, **tidak dikerjakan dalam sesi perencanaan**.
