# 04 — Kalkulator Diskon

Status: **SEBAGIAN — implementasi dan runner lulus; QA console, no-JavaScript, refresh route, dan keyboard masih belum diverifikasi.**
Model rekomendasi: **GPT-6 Luna (`gpt-6-luna`), reasoning `high`** berdasarkan cakupan, bukan benchmark. Jika fixture masih gagal setelah satu perbaikan terarah, pecah reproduksi menjadi langkah lebih kecil dengan Luna yang sama; jangan melonggarkan tes atau menandai selesai.

## Tujuan dan batas V1

Bantu pengguna melihat harga setelah diskon dan memahami dua diskon berurutan. UI/artikel Indonesia, `lang="id"`; route `/kalkulator-diskon/`, canonical `https://edwinlab.dev/kalkulator-diskon/`.

V1 menyediakan **Satu diskon** serta **Dua diskon berurutan**, dengan harga awal, potongan tiap tahap, harga akhir, total hemat, dan persen hemat efektif berdasarkan uang setelah pembulatan. Satuan tampilan tetap rupiah dengan dua angka desimal untuk memperlihatkan kebijakan pembulatan; tidak ada pilihan/konversi mata uang. Tidak termasuk pajak, ongkir, cashback, biaya layanan, voucher nominal, cicilan, bunga, financing, saran keuangan, atau pembandingan merchant.

## Prasyarat dan kepemilikan

- [x] Baca `docs/everyday-tools/README.md`, `CONTRACT.md`, `00-foundation.md`, dan instruksi repository; verifikasi foundation selesai dengan bukti.
- [x] Buat hanya `kalkulator-diskon/index.html`, `kalkulator-diskon/logic.js`, `kalkulator-diskon/tool.js`, dan CSS lokal bila diperlukan.
- [x] Buat `tests/everyday/kalkulator-diskon.test.js` serta `tests/everyday/kalkulator-diskon.html`, impor `../tools/harness.js`, gunakan `noindex,nofollow` dan browser module melalui HTTP.
- [x] Gunakan `/tools/shared/tools.css`, `setStatus` dari `/tools/shared/ui.js`, `copyTextId` dari `/everyday/shared/ui.js`, serta `parseDecimal`, `roundRatio`, `formatRatio` dari `/everyday/shared/number.js`; shared lama/baru read-only.
- [x] Perbarui checklist/bukti task ini dan baris tracker 04 sesuai CONTRACT hanya sesudah tes nyata. Jangan mengubah homepage, hub, sitemap, robots, foundation, kontrak, tool lain, dependency, atau perubahan pengguna.
- [x] Hanya HTML/CSS/JavaScript vanilla ES module `.js`, tanpa npm/package.json, framework, build, backend, CDN, atau library baru. Jangan commit, push, atau deploy.

## Input, uang eksak, dan kebijakan pembulatan

- [x] Input memakai teks berlabel + `inputmode="decimal"`; maksimum **64 karakter ASCII mentah per field** sebelum trim/parser. Terima desimal koma ATAU titik, tanpa ribuan sesuai CONTRACT; tidak menafsirkan `%`/`Rp` sebagai bagian angka.
- [x] Harga: `parseDecimal(text,{maxIntegerDigits:13,maxFractionDigits:2,allowNegative:false})`; range **0 sampai 1.000.000.000.000 rupiah inklusif**. Persentase masing-masing: `parseDecimal(text,{maxIntegerDigits:3,maxFractionDigits:4,allowNegative:false})`, range **0 sampai 100 inklusif**. Range dicek dengan integer berskala, bukan Number. Digit pecahan berlebih ditolak, tidak dibulatkan saat input.
- [x] Parser trim whitespace ASCII tepi, tidak menerima plus/minus pada field nonnegative, grouping, eksponen, NaN/Infinity, `.5`, `5.`, blank, atau gabungan titik dan koma. Hint eksplisit: `Tulis 100000 atau 100000,50. Titik/koma adalah desimal, bukan pemisah ribuan.` Misalnya harga `1.000` ditolak karena tiga digit pecahan, bukan dianggap seribu. Kode helper: raw lebih dari 64 karakter `INPUT_TOO_LARGE`, syntax `INVALID_NUMBER`, digit berlebih `NUMBER_PRECISION`; range task `RANGE_ERROR`.
- [x] Ubah harga desimal ke **cent/sen internal BigInt**: `priceCents = coefficient × 10^(2-scale)`. Satu cent di alat = 0,01 rupiah; ini unit hitung, bukan klaim ketersediaan pecahan uang tunai atau aturan pembulatan semua toko.
- [x] Untuk tiap diskon `d = coefficient / 10^scale`, hitung harga bersih cent rasional `beforeCents × (100 × 10^scale - coefficient) / (100 × 10^scale)`. Bulatkan **harga bersih tahap tersebut ke cent terdekat**, tie setengah cent ke atas melalui `roundRatio(n,d,0)`; argumen numerator/denominator memakai nama berbeda di implementasi agar tidak tertukar dengan objek diskon.
- [x] Potongan cent tahap = `beforeCents - afterCents`. Jangan membulatkan potongan lalu mengurangkannya, karena tie menghasilkan kebijakan berbeda. Harga bersih yang telah dibulatkan menjadi input uang tahap berikutnya. Diskon kedua diterapkan pada sisa harga pertama, bukan harga awal, dan tidak dijumlahkan dengan persentase pertama.
- [x] Contoh kebijakan penting: Rp100,05 diskon 10% → harga bersih Rp90,05 (nilai sebelum pembulatan Rp90,045), potongan Rp10,00. Rp0,05 diskon 50% lalu 50% → Rp0,03 lalu Rp0,02. Jangan hanya membulatkan sekali di akhir.
- [x] `totalSavedCents = originalCents - finalCents`, selalu persis sama dengan jumlah potongan tahap. Hasil invariant `0 <= final <= original`, `original = final + saved` serta tiap potongan nonnegative wajib dijaga.
- [x] Persen hemat efektif = `totalSavedCents / originalCents × 100`, diformat dua angka pecahan dengan `formatRatio(saved*100n,original,{places:2,trimZeros:false})`. Beri `≈` jika `(saved * 10000n) % original !== 0n`; jangan memberi perkiraan untuk uang karena nilai cent hasil kebijakan sudah exact.
- [x] Jika harga awal nol, semua uang tetap nol; persen hemat efektif tampil **`Tidak berlaku (harga awal nol)`**, bukan membagi 0/0 atau menyimpulkan 0%/100%. Persentase diskon yang dimasukkan tetap terlihat di rincian.
- [x] Format uang dari integer cent lewat `formatRatio(cents,100n,{places:2,trimZeros:false})`, prefiks `Rp` tanpa grouping agar hasil/copy konsisten, contoh `Rp150000,00`. Tidak memakai Number/`toFixed`, tidak memilih format locale implisit, dan jangan mengklaim persis sama dengan struk toko.
- [x] Pure function `calculateDiscount(priceDecimal, discountDecimals)` menerima array panjang 1 atau 2, menghasilkan `{originalCents, steps:[{beforeCents, discountCents, afterCents}], finalCents, savedCents}`. Nilai efektif dihitung dari hasil ini. Mode selain satu/dua serta array diskon kosong/lebih dua menghasilkan `INVALID_MODE`.
- [x] Maksimum dua baris tahap, maksimum 64 karakter per angka hasil, dan ringkasan copy maksimum **2 KiB UTF-8**. Guard input/output error sesuai CONTRACT dan `RANGE_ERROR`/`OUTPUT_TOO_LARGE`; jangan hasil parsial atau pemotongan angka.

## UI dan perilaku

- [x] Select `Jenis diskon` default satu; label `Harga awal (Rp)`, `Diskon pertama (%)`, dan `Diskon kedua (%)` hanya saat mode dua. Mode satu tidak memvalidasi field kedua yang disembunyikan.
- [x] Tombol `Hitung diskon`, `Isi contoh`, `Bersihkan`, dan `Salin rincian`. Contoh mengisi 200000/20 dan, pada mode dua, 10; tidak auto-run. Clear mengosongkan harga/persen/hasil, mempertahankan mode, fokus harga.
- [x] Beralih mode mengosongkan field diskon kedua dan hasil; edit input apa pun membuat hasil stale dan copy nonaktif. Error mempertahankan input, menunjukkan field penyebab, dan tidak menyisakan hasil lama.
- [x] Kartu utama harga akhir, kartu total hemat, tabel tahap (harga sebelum/potongan/harga sesudah), dan persen hemat efektif. Di mode dua, tampilkan penjelasan `Diskon kedua dihitung dari harga setelah diskon pertama.`
- [x] Tampilkan kebijakan pembulatan dua desimal setiap tahap serta contoh 20% + 10% = hemat efektif 28% sebelum membaca artikel panjang. Jangan tampilkan penjumlahan 30% sebagai diskon gabungan.
- [x] Copy via `copyTextId` berisi harga, tiap persentase masukan, rincian tahap, harga akhir, hemat, persen efektif, dan catatan pembulatan. Data via `textContent`/`.value`, tidak ada HTML input, storage, telemetry, URL query/hash, atau jaringan input.
- [x] Status Indonesia `aria-live="polite"`, keyboard/focus jelas, layout 320/390/768/1440 px, noscript dan konten statis tersedia tanpa JavaScript.

## Fixture deterministik dan verifikasi

Semua nilai uang di bawah wajib sesuai hingga cent. Harga/persen masukan adalah string desimal, bukan Number floating point.

- [x] Harga **200000**, diskon **20** → akhir **Rp160000,00**, potongan/hemat **Rp40000,00**, efektif **20,00%**.
- [x] Harga **200000**, diskon **20 lalu 10** → tahap 1 akhir **Rp160000,00**/potongan **Rp40000,00**; tahap 2 akhir **Rp144000,00**/potongan **Rp16000,00**; hemat **Rp56000,00**, efektif **28,00%**.
- [x] Harga **100**, diskon **0** → akhir **Rp100,00**, hemat **Rp0,00**, efektif **0,00%**; diskon **100 lalu 50** → akhir **Rp0,00**, potongan tahap kedua **Rp0,00**, hemat **Rp100,00**, efektif **100,00%**.
- [x] Harga **0**, diskon **20 lalu 10** → seluruh uang **Rp0,00**, efektif **Tidak berlaku (harga awal nol)**, tidak ada Infinity/NaN/error pembagian.
- [x] Harga **100,05**, diskon **10** → akhir **Rp90,05**, hemat **Rp10,00**, efektif **≈ 10,00%**; selisih dengan nilai persentase mentah dijelaskan sebagai pembulatan harga bersih.
- [x] Harga **0.05**, diskon **50 lalu 50** → tahap 1 akhir **Rp0,03**, tahap 2 akhir **Rp0,02**, potongan **Rp0,02** dan **Rp0,01**, hemat **Rp0,03**, efektif **60,00%**. Ini membuktikan pembulatan setiap tahap, bukan hanya akhir.
- [x] Harga **0,01**, diskon **50** → akhir **Rp0,01**, potongan/hemat **Rp0,00**, efektif **0,00%**; tie pada net dibulatkan ke atas, bukan potongan dibulatkan lebih dahulu.
- [x] Harga **1234,56**, diskon **12.5** → akhir **Rp1080,24**, hemat **Rp154,32**, efektif **12,50%**; harga maksimum **1000000000000**, diskon **0** → **Rp1000000000000,00** tepat.
- [x] Penolakan tambahan: harga negatif, harga `1000000000000.01`, `1.000`, harga tiga pecahan, diskon `100.0001`/negatif/lima pecahan, `1.234,56`, plus, eksponen, `Rp100`, `10%`, NaN, blank, 65 karakter; tidak ada hasil stale. Gunakan kode parser sesuai CONTRACT dan range `RANGE_ERROR`.
- [x] Uji invariant cent setiap fixture, perubahan mode mengabaikan/mengosongkan field kedua, boundary 0/100 persen dan uang, guard output, serta pembulatan formatter efektif yang tidak memengaruhi uang hasil.

## SEO dan konten statis

- [x] Title: `Kalkulator Diskon dan Diskon Bertingkat | Edwin Lab`.
- [x] H1: `Kalkulator Diskon`.
- [x] Meta description: `Hitung harga setelah diskon, total hemat, dan dua diskon berurutan. Lihat rincian tiap tahap serta pembulatan harga hingga dua angka desimal.`
- [x] Intro: `Masukkan harga awal dan persentase diskon untuk melihat harga akhirnya. Pilih dua diskon jika potongan kedua berlaku pada harga yang sudah didiskon.`
- [x] Intent/query sasaran: menghitung harga belanja dan memahami promo berurutan; `kalkulator diskon`, `hitung harga setelah diskon`, `diskon bertingkat`, `diskon 20 tambah 10`. Tidak mengklaim traffic/volume ataupun kondisi promo toko tertentu.
- [x] Artikel HTML awal menjelaskan rumus harga bersih `harga × (1 − diskon/100)`, dua tahap berurutan, contoh Rp200000 dengan 20% lalu 10% menjadi Rp144000/hemat 28%, dan contoh Rp0,05 untuk kebijakan pembulatan.
- [x] FAQ/jawaban: `Apakah diskon 20% lalu 10% sama dengan 30%?` → tidak, contoh hemat 28%; `Mengapa hasil bisa berbeda dari struk?` → toko dapat membulatkan berbeda atau menambah biaya yang tidak dimodelkan; `Mengapa ada dua angka desimal?` → kebijakan uang cent alat; `Apakah pajak dan ongkir dihitung?` → tidak; `Apakah saya boleh memakai pemisah ribuan?` → tidak, gunakan angka tanpa grouping.
- [x] Canonical/OG/logo/favicon sesuai CONTRACT, structured data opsional akurat. Related kandidat `/kalkulator-persen/` dan hub everyday hanya aktif setelah target sudah tersedia.

## Definition of done saat eksekusi

- [x] Buka `/tests/everyday/kalkulator-diskon.html` melalui HTTP; seluruh fixture dan invariant lulus, jumlah lulus/gagal serta browser dicatat.
- [x] Runner browser 21/21 mencakup satu/dua diskon, batas 0/100, harga nol, half-cent per tahap, koma/titik, input tidak valid, stale result, contoh/clear/copy, dan layout 320/390/768/1440 px; root memverifikasi perhitungan manual harga Rp200000 diskon 20% → Rp160000,00 dan hemat Rp40000,00.
- [x] Keyboard manual: Tab dari harga menuju diskon dan tombol hitung; Enter menghitung Rp160000,00.
- [ ] Perilaku saat JavaScript dinonaktifkan belum diuji.
- [x] Direct route `/kalkulator-diskon/` berhasil dimuat dan menghitung pada browser.
- [ ] Refresh route belum diuji; console browser tidak dapat diperiksa melalui CUA IAB.
- [x] Pemeriksaan source mengonfirmasi input tidak dikirim ke network; `git diff --check` bersih dan perubahan hanya mencakup file task 04/tracker yang diizinkan.
- [x] Laporkan file, hasil tes/browser, kebijakan uang yang diterapkan, dan keterbatasan aktual. Centang checklist dan tracker task sendiri setelah bukti, jangan selesai bila browser belum diuji. Tanpa commit, push, atau deploy.

## Prompt eksekusi siap tempel

```text
Implementasikan hanya docs/everyday-tools/04-kalkulator-diskon.md di repository ini.
Baca docs/everyday-tools/README.md, CONTRACT.md, 00-foundation.md, dan instruksi repository; verifikasi foundation selesai dengan bukti. Model rekomendasi GPT-6 Luna high, bukan benchmark; bila fixture masih gagal setelah satu perbaikan terarah, isolasi reproduksi dan lanjutkan per langkah kecil dengan Luna yang sama.
Buat /kalkulator-diskon/ dan tests/everyday/kalkulator-diskon.html serta .test.js menggunakan tests/tools/harness.js. UI/SEO Indonesia lang=id. Pakai helper desimal/BigInt foundation, uang cent eksak, pembulatan harga bersih setiap tahap (half-away-from-zero), satu atau dua diskon berurutan, dan persen hemat efektif yang mengikuti hasil cent. Ikuti semua batas/fixture, tanpa pajak/cicilan/cashback/fitur lain. HTML/CSS/vanilla JS tanpa npm/build/backend/CDN.
Shared lama/baru, homepage, hub, sitemap, foundation, kontrak, dan tool lain read-only. Jika helper belum mendukung kontrak, laporkan reproduksi/kebutuhan foundation; jangan membuat variasi helper sendiri. Jangan commit, push, atau deploy.
Jalankan tes browser, QA mode/batas/rounding, responsive, keyboard, route/refresh, console/network, dan git diff --check. Laporkan jumlah lulus/gagal serta bukti aktual, lalu perbarui checklist/catatan dan baris tracker sendiri. Browser belum diuji berarti belum selesai.
```

Rujukan teknis yang dibuka saat perencanaan: [spesifikasi resmi pembagian BigInt](https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-numeric-types-bigint-divide) dan [MDN BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt). Pembagian BigInt membuang pecahan; helper roundRatio harus menerapkan kebijakan pembulatan eksplisit. Urutan pembulatan cent di atas adalah kebijakan alat, bukan pernyataan aturan harga semua merchant.
